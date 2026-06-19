import { FormattedMessage, FormattedNumber, useIntl } from 'react-intl';

import { ImageFragment } from '@/components/content/Image';
import { Link } from '@/components/content/Link';
import PosterImage from '@/components/content/PosterImage';
import { graphql, readFragment, type FragmentOf } from '@/graphql/tada';
import { paths as animePaths } from '@/pages/Anime/paths';
import { Path } from '@/utils/routes';

import styles from './styles.module.css';

const POSTER_WIDTH = 160;

export const LibraryEntryCardFragment = graphql(
  `
    fragment LibraryEntryCardFragment on LibraryEntry {
      id
      status
      progress
      rating
      reconsumeCount
      updatedAt
      media {
        __typename
        id
        slug
        titles {
          canonical
          preferred
        }
        posterImage {
          ...ImageFragment
        }
      }
    }
  `,
  [ImageFragment],
);

export type LibraryEntryCardProps = {
  entry: FragmentOf<typeof LibraryEntryCardFragment>;
  className?: string;
};

function getMediaPath(media: { __typename: string; slug: string }) {
  if (media.__typename === 'Anime') return animePaths(media.slug);

  return new Path(`/manga/${media.slug}`);
}

export default function LibraryEntryCard({
  entry: entryProp,
  className,
}: LibraryEntryCardProps) {
  const { formatMessage } = useIntl();
  const entry = readFragment(LibraryEntryCardFragment, entryProp);
  const title =
    entry.media.titles.preferred ||
    entry.media.titles.canonical ||
    entry.media.slug;
  const isManga = entry.media.__typename === 'Manga';

  return (
    <Link
      className={[styles.card, className].filter(Boolean).join(' ')}
      to={getMediaPath(entry.media)}>
      <span className={styles.posterFrame}>
        <PosterImage
          alt={formatMessage(
            {
              defaultMessage: 'Poster for {title}',
              description: 'Alt text for a library entry media poster image.',
            },
            { title },
          )}
          className={styles.poster}
          source={entry.media.posterImage}
          width={POSTER_WIDTH}
        />
        <span className={styles.overlay}>
          {entry.rating != null ? (
            <span className={styles.metaPill}>
              <FormattedMessage
                defaultMessage="{rating}/10"
                description="Library entry rating out of ten."
                values={{
                  rating: (
                    <FormattedNumber
                      value={entry.rating / 2}
                      maximumFractionDigits={1}
                    />
                  ),
                }}
              />
            </span>
          ) : null}
          <span className={styles.metaPill}>
            <FormattedMessage
              defaultMessage="Progress {progress}"
              description="Library entry progress count."
              values={{
                progress: <FormattedNumber value={entry.progress} />,
              }}
            />
          </span>
          {entry.reconsumeCount > 0 ? (
            <span className={styles.metaPill}>
              {isManga ? (
                <FormattedMessage
                  defaultMessage="Reread {count}x"
                  description="Library entry reread count for manga."
                  values={{
                    count: <FormattedNumber value={entry.reconsumeCount} />,
                  }}
                />
              ) : (
                <FormattedMessage
                  defaultMessage="Rewatched {count}x"
                  description="Library entry rewatch count for anime."
                  values={{
                    count: <FormattedNumber value={entry.reconsumeCount} />,
                  }}
                />
              )}
            </span>
          ) : null}
        </span>
      </span>
      <span className={styles.title}>{title}</span>
    </Link>
  );
}
