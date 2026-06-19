import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useParams } from 'react-router';
import invariant from 'tiny-invariant';

import Reaction, { ReactionCardFragment } from '@/components/content/Reaction';
import Button, { ButtonColor, ButtonKind } from '@/components/controls/Button';
import { graphql } from '@/graphql/tada';
import { useQuery } from '@/graphql/urql';
import ProfileLayout, { ProfileLayoutFragment } from '@/pages/Profile/Layout';

import styles from './styles.module.css';

const REACTIONS_INCREMENT = 20;

export const ProfileReactionsPageQuery = graphql(
  `
    query findProfileReactions($slug: String!, $first: Int!) {
      findProfile: findProfileBySlug(slug: $slug) {
        ...ProfileLayoutFragment
        mediaReactions(
          first: $first
          sort: [{ on: CREATED_AT, direction: DESCENDING }]
        ) {
          totalCount
          nodes {
            id
            ...ReactionCardFragment
          }
          pageInfo {
            endCursor
            hasNextPage
          }
        }
      }
    }
  `,
  [ProfileLayoutFragment, ReactionCardFragment],
);

export default function ProfileReactionsPage() {
  const { slug } = useParams<'slug'>();
  invariant(slug, 'Missing slug on ProfileReactions');

  const [count, setCount] = useState(REACTIONS_INCREMENT);
  const [result] = useQuery({
    query: ProfileReactionsPageQuery,
    variables: { slug, first: count },
  });

  if (!result.data?.findProfile) return null;

  const profile = result.data.findProfile;
  const reactions = profile.mediaReactions.nodes ?? [];
  const totalCount = profile.mediaReactions.totalCount;
  const hasMore = profile.mediaReactions.pageInfo.hasNextPage;

  return (
    <ProfileLayout profile={profile}>
      <main className={styles.content}>
        <header className={styles.header}>
          <h1 className={styles.title}>
            <FormattedMessage
              defaultMessage="Reactions ({count, number})"
              description="Header for the profile reactions page with the total reaction count."
              values={{ count: totalCount }}
            />
          </h1>
        </header>

        {totalCount === 0 ? (
          <p className={styles.empty}>
            <FormattedMessage
              defaultMessage="No reactions yet"
              description="Empty state shown when a profile has no reactions."
            />
          </p>
        ) : (
          <div className={styles.reactionList}>
            {reactions.map(
              (reaction) =>
                reaction && <Reaction reaction={reaction} key={reaction.id} />,
            )}
          </div>
        )}

        {hasMore && (
          <Button
            kind={ButtonKind.SOLID}
            color={ButtonColor.GREEN}
            loading={result.fetching}
            disabled={result.fetching}
            className={styles.loadMore}
            onClick={() =>
              setCount((current) => current + REACTIONS_INCREMENT)
            }>
            <FormattedMessage
              defaultMessage="Load more"
              description="Button label to load more profile reactions."
            />
          </Button>
        )}
      </main>
    </ProfileLayout>
  );
}
