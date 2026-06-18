import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useParams } from 'react-router';
import invariant from 'tiny-invariant';

import EpisodeCard, {
  EpisodeCardFragment,
} from '@/components/content/EpisodeCard';
import Button from '@/components/controls/Button';
import Section from '@/components/Section';
import Card from '@/components/surfaces/Card';
import { graphql } from '@/graphql/tada';
import { useQuery } from '@/graphql/urql';
import AnimeLayout, { AnimeLayoutFragment } from '@/pages/Anime/Layout';
import { paths } from '@/pages/Anime/paths';

import styles from './styles.module.css';

const PAGE_SIZE = 30;

export const AnimeEpisodesPageQuery = graphql(
  `
    query findAnimeEpisodes($slug: String!, $first: Int!) {
      findAnime: findAnimeBySlug(slug: $slug) {
        ...AnimeLayoutFragment
        slug
        episodes(first: $first, sort: [{ on: NUMBER, direction: ASCENDING }]) {
          totalCount
          pageInfo {
            hasNextPage
          }
          nodes {
            id
            number
            ...EpisodeCardFragment
          }
        }
      }
    }
  `,
  [AnimeLayoutFragment, EpisodeCardFragment],
);

function isPresent<T>(value: T | null | undefined): value is NonNullable<T> {
  return value != null;
}

export default function AnimeEpisodesPage() {
  const { formatMessage } = useIntl();
  const { slug } = useParams<'slug'>();
  const [count, setCount] = useState(PAGE_SIZE);
  invariant(slug, 'Missing slug on AnimeEpisodes');

  const [result] = useQuery({
    query: AnimeEpisodesPageQuery,
    variables: { slug, first: count },
  });

  if (!result.data?.findAnime) return null;

  const media = result.data.findAnime;
  const route = paths(media.slug);
  const episodes = media.episodes.nodes?.filter(isPresent) ?? [];
  const title = formatMessage(
    {
      id: 'media.show.episodes.heading',
      defaultMessage: 'Episodes ({totalCount, number})',
      description: 'Header for the anime episodes list with total count',
    },
    { totalCount: media.episodes.totalCount },
  );

  return (
    <AnimeLayout media={media}>
      <div className={styles.content}>
        <Section title={title}>
          {episodes.length ? (
            <div className={styles.episodeGrid}>
              {episodes.map((episode) => (
                <EpisodeCard
                  episode={episode}
                  key={episode.id}
                  to={route.episode(String(episode.number))}
                />
              ))}
            </div>
          ) : (
            <Card className={styles.emptyState}>
              <FormattedMessage
                id="media.show.episodes.empty"
                defaultMessage="No episodes have been added yet."
                description="Empty state message for an anime with no episodes"
              />
            </Card>
          )}
          {media.episodes.pageInfo.hasNextPage ? (
            <Button
              type="button"
              kind="outline"
              color="kitsu-purple"
              className={styles.loadMore}
              loading={result.fetching}
              onClick={() => setCount((current) => current + PAGE_SIZE)}>
              <FormattedMessage
                id="media.show.episodes.loadMore"
                defaultMessage="Load more episodes"
                description="Button label to load more anime episodes"
              />
            </Button>
          ) : null}
        </Section>
      </div>
    </AnimeLayout>
  );
}
