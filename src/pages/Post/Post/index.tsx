import { FormattedMessage, useIntl } from 'react-intl';
import { useParams } from 'react-router';
import invariant from 'tiny-invariant';
import { useQuery } from 'urql';

import Avatar from '@/components/content/Avatar';
import Byline from '@/components/content/Byline';
import { CommentComposer } from '@/components/content/CommentComposer';
import { ImageFragment } from '@/components/content/Image';
import { Link } from '@/components/content/Link';
import { FormattedRelativeTime } from '@/components/Formatted';
import Card from '@/components/surfaces/Card';
import { useSession } from '@/contexts/SessionContext';
import { graphql, readFragment, type FragmentOf } from '@/graphql/tada';
import NotFoundPage from '@/pages/Errors/NotFound';
import { paths as profilePaths } from '@/pages/Profile/paths';

import styles from './styles.module.css';

const PostDetailAuthorFragment = graphql(
  `
    fragment PostDetailAuthorFragment on Profile {
      id
      slug
      name
      avatarImage {
        ...ImageFragment
      }
    }
  `,
  [ImageFragment],
);

const PostDetailCommentFragment = graphql(
  `
    fragment PostDetailCommentFragment on Comment {
      id
      content
      contentFormatted
      createdAt
      author {
        ...PostDetailAuthorFragment
      }
      likes(first: 1) {
        totalCount
      }
      replies(first: 1) {
        totalCount
      }
    }
  `,
  [PostDetailAuthorFragment],
);

export const PostPageQuery = graphql(
  `
    query PostPageQuery($id: ID!) {
      findPostById(id: $id) {
        id
        content
        contentFormatted
        createdAt
        author {
          ...PostDetailAuthorFragment
        }
        likes(first: 1) {
          totalCount
        }
        comments(first: 50, sort: [{ on: CREATED_AT, direction: ASCENDING }]) {
          totalCount
          nodes {
            id
            ...PostDetailCommentFragment
          }
        }
      }
    }
  `,
  [PostDetailAuthorFragment, PostDetailCommentFragment],
);

function ContentByline({
  author: authorFragment,
  createdAt,
}: {
  author: FragmentOf<typeof PostDetailAuthorFragment>;
  createdAt: Date;
}) {
  const author = readFragment(PostDetailAuthorFragment, authorFragment);
  const { formatMessage } = useIntl();

  return (
    <Byline.Container>
      <Byline.Avatar>
        <Link to={profilePaths(author)}>
          <Avatar
            size={48}
            source={author.avatarImage}
            alt={formatMessage(
              {
                defaultMessage: "{name}'s avatar",
                description: 'Alternative text for a post author avatar.',
              },
              { name: author.name },
            )}
          />
        </Link>
      </Byline.Avatar>
      <Byline.Title>
        <Link to={profilePaths(author)}>{author.name}</Link>
      </Byline.Title>
      <Byline.Subtitle>
        <FormattedRelativeTime time={createdAt} />
      </Byline.Subtitle>
    </Byline.Container>
  );
}

function ContentBody({
  content,
  contentFormatted,
}: {
  content?: string | null;
  contentFormatted?: string | null;
}) {
  const body = content ?? contentFormatted;

  if (!body) {
    return (
      <p className={styles.emptyContent}>
        <FormattedMessage
          defaultMessage="No content was provided."
          description="Fallback text when a post or comment has no body content."
        />
      </p>
    );
  }

  return <div className={styles.content}>{body}</div>;
}

function ContentStats({
  likesCount,
  repliesCount,
}: {
  likesCount: number;
  repliesCount?: number;
}) {
  return (
    <dl className={styles.stats}>
      <div>
        <dt>
          <FormattedMessage
            defaultMessage="Likes"
            description="Label for the number of likes on a post or comment."
          />
        </dt>
        <dd>
          <FormattedMessage
            defaultMessage="{count, plural, one {# like} other {# likes}}"
            description="Number of likes on a post or comment."
            values={{ count: likesCount }}
          />
        </dd>
      </div>
      {typeof repliesCount === 'number' && (
        <div>
          <dt>
            <FormattedMessage
              defaultMessage="Replies"
              description="Label for the number of replies to a comment."
            />
          </dt>
          <dd>
            <FormattedMessage
              defaultMessage="{count, plural, one {# reply} other {# replies}}"
              description="Number of replies to a comment."
              values={{ count: repliesCount }}
            />
          </dd>
        </div>
      )}
    </dl>
  );
}

function CommentCard({
  comment: commentFragment,
}: {
  comment: FragmentOf<typeof PostDetailCommentFragment>;
}) {
  const comment = readFragment(PostDetailCommentFragment, commentFragment);

  return (
    <Card className={styles.commentCard}>
      <ContentByline author={comment.author} createdAt={comment.createdAt} />
      <ContentBody
        content={comment.content}
        contentFormatted={comment.contentFormatted}
      />
      <ContentStats
        likesCount={comment.likes.totalCount}
        repliesCount={comment.replies.totalCount}
      />
    </Card>
  );
}

export default function PostPage() {
  const { id } = useParams<'id'>();
  invariant(id, 'Missing id on PostPage');
  const session = useSession();

  const [{ data }, reexecuteQuery] = useQuery({
    query: PostPageQuery,
    variables: { id },
  });

  if (!data) return null;
  if (!data.findPostById) return <NotFoundPage />;

  const post = data.findPostById;
  const comments = post.comments.nodes?.filter((comment) => !!comment) ?? [];

  return (
    <main className={styles.page}>
      <Card className={styles.postCard}>
        <ContentByline author={post.author} createdAt={post.createdAt} />
        <ContentBody
          content={post.content}
          contentFormatted={post.contentFormatted}
        />
        <ContentStats likesCount={post.likes.totalCount} />
      </Card>
      <section className={styles.commentsSection}>
        <h2 className={styles.commentsTitle}>
          <FormattedMessage
            defaultMessage="{count, plural, one {# comment} other {# comments}}"
            description="Heading for the comments list on a post detail page."
            values={{ count: post.comments.totalCount }}
          />
        </h2>
        {session.loggedIn ? (
          <CommentComposer
            postId={post.id}
            onCommented={() =>
              reexecuteQuery({ requestPolicy: 'network-only' })
            }
          />
        ) : (
          <Card className={styles.commentSignInPrompt}>
            <FormattedMessage
              defaultMessage="Sign in to join the discussion."
              description="Prompt shown instead of the comment composer when a user is signed out."
            />
          </Card>
        )}
        {comments.length > 0 ? (
          <div className={styles.commentList}>
            {comments.map((comment) => (
              <CommentCard comment={comment} key={comment.id} />
            ))}
          </div>
        ) : (
          <Card className={styles.emptyComments}>
            <FormattedMessage
              defaultMessage="No comments yet."
              description="Fallback text when a post has no comments."
            />
          </Card>
        )}
      </section>
    </main>
  );
}
