import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useParams } from 'react-router';
import invariant from 'tiny-invariant';

import Reaction, { ReactionCardFragment } from '@/components/content/Reaction';
import Button, { ButtonColor, ButtonKind } from '@/components/controls/Button';
import { graphql } from '@/graphql/tada';
import { useQuery } from '@/graphql/urql';
import MangaLayout, { MangaLayoutFragment } from '@/pages/Manga/Layout';

import styles from './styles.module.css';

const REACTIONS_INCREMENT = 20;

export const MangaReactionsPageQuery = graphql(
  `
    query findMangaReactions($slug: String!, $first: Int!) {
      findManga: findMangaBySlug(slug: $slug) {
        ...MangaLayoutFragment
        slug
        reactions(
          first: $first
          sort: [
            { on: UP_VOTES_COUNT, direction: DESCENDING }
            { on: CREATED_AT, direction: DESCENDING }
          ]
        ) {
          totalCount
          nodes {
            id
            ...ReactionCardFragment
          }
        }
      }
    }
  `,
  [MangaLayoutFragment, ReactionCardFragment],
);

export default function MangaReactionsPage() {
  const { slug } = useParams<'slug'>();
  invariant(slug, 'Missing slug on MangaReactions');

  const [count, setCount] = useState(REACTIONS_INCREMENT);
  const [result] = useQuery({
    query: MangaReactionsPageQuery,
    variables: { slug, first: count },
  });

  if (!result.data?.findManga) return null;

  const media = result.data.findManga;
  const reactions = media.reactions?.nodes ?? [];
  const totalCount = media.reactions?.totalCount ?? 0;
  const hasMore = reactions.length < totalCount;

  return (
    <MangaLayout media={media}>
      <main className={styles.content}>
        <header className={styles.header}>
          <h1 className={styles.title}>
            <FormattedMessage
              id="media.show.reactions.title"
              defaultMessage="Reactions ({count, number})"
              description="Header for the anime reactions page with the total reaction count"
              values={{ count: totalCount }}
            />
          </h1>
        </header>

        {totalCount === 0 ? (
          <p className={styles.empty}>
            <FormattedMessage
              id="media.show.reactions.empty"
              defaultMessage="No reactions yet"
              description="Empty state shown when an anime has no reactions"
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
              id="media.show.reactions.loadMore"
              defaultMessage="Load more"
              description="Button label to load more anime reactions"
            />
          </Button>
        )}
      </main>
    </MangaLayout>
  );
}
