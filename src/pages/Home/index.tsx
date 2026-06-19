import { FormattedMessage } from 'react-intl';

import { ImageFragment } from '@/components/content/Image';
import MediaPosterCard from '@/components/content/MediaPosterCard';
import { MediaShelf } from '@/components/content/MediaShelf';
import { graphql } from '@/graphql/tada';
import { useQuery } from '@/graphql/urql';
import utilStyles from '@/styles/utils.module.css';
import { getMediaPath, getMediaTitle } from '@/utils/media';

import styles from './styles.module.css';

export const HomePageQuery = graphql(
  `
    query HomePage {
      trendingAnime: globalTrending(mediaType: ANIME, first: 12) {
        nodes {
          __typename
          id
          slug
          titles {
            preferred
            canonical
          }
          posterImage {
            ...ImageFragment
          }
        }
      }
      trendingManga: globalTrending(mediaType: MANGA, first: 12) {
        nodes {
          __typename
          id
          slug
          titles {
            preferred
            canonical
          }
          posterImage {
            ...ImageFragment
          }
        }
      }
    }
  `,
  [ImageFragment],
);

function isPresent<T>(value: T | null | undefined): value is T {
  return value != null;
}

export default function HomePage() {
  const [result] = useQuery({ query: HomePageQuery });
  const trendingAnime =
    result.data?.trendingAnime.nodes?.filter(isPresent) ?? [];
  const trendingManga =
    result.data?.trendingManga.nodes?.filter(isPresent) ?? [];

  return (
    <main className={styles.page}>
      <div className={[utilStyles.container, styles.container].join(' ')}>
        <header className={styles.hero}>
          <h1 className={styles.title}>
            <FormattedMessage
              defaultMessage="Discover anime and manga"
              description="Homepage hero heading inviting visitors to discover media."
            />
          </h1>
          <p className={styles.tagline}>
            <FormattedMessage
              defaultMessage="Explore what the Kitsu community is watching, reading, and talking about right now."
              description="Homepage hero description for the discovery landing page."
            />
          </p>
        </header>

        <div className={styles.shelves}>
          <MediaShelf
            title={
              <FormattedMessage
                defaultMessage="Trending Anime"
                description="Heading for a shelf of globally trending anime."
              />
            }
            empty={
              <FormattedMessage
                defaultMessage="No anime is trending right now."
                description="Empty state for the trending anime shelf."
              />
            }>
            {trendingAnime.map((media) => (
              <MediaPosterCard
                key={media.id}
                posterImage={media.posterImage}
                title={getMediaTitle(media)}
                to={getMediaPath(media)}
              />
            ))}
          </MediaShelf>

          <MediaShelf
            title={
              <FormattedMessage
                defaultMessage="Trending Manga"
                description="Heading for a shelf of globally trending manga."
              />
            }
            empty={
              <FormattedMessage
                defaultMessage="No manga is trending right now."
                description="Empty state for the trending manga shelf."
              />
            }>
            {trendingManga.map((media) => (
              <MediaPosterCard
                key={media.id}
                posterImage={media.posterImage}
                title={getMediaTitle(media)}
                to={getMediaPath(media)}
              />
            ))}
          </MediaShelf>
        </div>
      </div>
    </main>
  );
}
