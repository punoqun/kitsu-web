import { FormattedDate, FormattedMessage, useIntl } from 'react-intl';
import { useParams } from 'react-router';
import invariant from 'tiny-invariant';

import { Description } from '@/components/content/Description';
import Image, { ImageFragment } from '@/components/content/Image';
import { Link } from '@/components/content/Link';
import Card from '@/components/surfaces/Card';
import { graphql } from '@/graphql/tada';
import { useQuery } from '@/graphql/urql';
import AnimeLayout, { AnimeLayoutFragment } from '@/pages/Anime/Layout';
import { paths } from '@/pages/Anime/paths';

import styles from './styles.module.css';

export const AnimeEpisodePageQuery = graphql(
  `
    query findAnimeEpisode($slug: String!) {
      findAnime: findAnimeBySlug(slug: $slug) {
        ...AnimeLayoutFragment
        slug
        episodes(first: 2000, sort: [{ on: NUMBER, direction: ASCENDING }]) {
          nodes {
            id
            number
            titles {
              canonical
            }
            releasedAt
            length
            description
            thumbnail {
              ...ImageFragment
            }
          }
        }
      }
    }
  `,
  [AnimeLayoutFragment, ImageFragment],
);

function isPresent<T>(value: T | null | undefined): value is NonNullable<T> {
  return value != null;
}

export default function AnimeEpisodePage() {
  const { formatMessage } = useIntl();
  const { slug, number: episodeNumberParam } = useParams<'slug' | 'number'>();
  invariant(slug, 'Missing slug on AnimeEpisode');
  invariant(episodeNumberParam, 'Missing number on AnimeEpisode');

  const [result] = useQuery({
    query: AnimeEpisodePageQuery,
    variables: { slug },
  });

  if (!result.data?.findAnime) return null;

  const media = result.data.findAnime;
  const route = paths(media.slug);
  const episodeNumber = Number(episodeNumberParam);
  const episodes = media.episodes.nodes?.filter(isPresent) ?? [];
  const episodeIndex = Number.isFinite(episodeNumber)
    ? episodes.findIndex((episode) => episode.number === episodeNumber)
    : -1;
  const episode = episodeIndex >= 0 ? episodes[episodeIndex] : null;
  const previousEpisode = episodeIndex > 0 ? episodes[episodeIndex - 1] : null;
  const nextEpisode =
    episodeIndex >= 0 && episodeIndex < episodes.length - 1
      ? episodes[episodeIndex + 1]
      : null;

  return (
    <AnimeLayout media={media}>
      <div className={styles.content}>
        {episode ? (
          <>
            <Card className={styles.card}>
              <div className={styles.hero}>
                {episode.thumbnail ? (
                  <Image
                    source={episode.thumbnail}
                    alt={formatMessage(
                      {
                        id: 'media.show.episode.thumbnailAlt',
                        defaultMessage: 'Thumbnail for {title}',
                        description: 'Alt text for an episode detail image',
                      },
                      { title: episode.titles.canonical },
                    )}
                    className={styles.heroImage}
                  />
                ) : (
                  <div className={styles.heroFallback}>
                    <FormattedMessage
                      id="media.show.episode.noThumbnail"
                      defaultMessage="No thumbnail"
                      description="Fallback text shown when an episode detail page has no thumbnail"
                    />
                  </div>
                )}
              </div>
              <div className={styles.kicker}>
                <FormattedMessage
                  id="media.show.episode.number"
                  defaultMessage="Episode {number}"
                  description="Episode number label on the episode detail page"
                  values={{ number: episode.number }}
                />
              </div>
              <h1 className={styles.title}>{episode.titles.canonical}</h1>
              <div className={styles.meta}>
                {episode.releasedAt ? (
                  <span>
                    <FormattedDate
                      value={episode.releasedAt}
                      year="numeric"
                      month="long"
                      day="numeric"
                    />
                  </span>
                ) : null}
                {episode.length ? (
                  <span>
                    <FormattedMessage
                      id="media.show.episode.length"
                      defaultMessage="{length, number} min"
                      description="Episode runtime in minutes on the detail page"
                      values={{ length: episode.length }}
                    />
                  </span>
                ) : null}
              </div>
              {typeof episode.description['en'] === 'string' &&
              episode.description['en'] ? (
                <Description
                  text={episode.description['en']}
                  className={styles.description}
                />
              ) : (
                <p className={styles.descriptionEmpty}>
                  <FormattedMessage
                    id="media.show.episode.noDescription"
                    defaultMessage="No description is available for this episode."
                    description="Fallback text when an episode has no description"
                  />
                </p>
              )}
            </Card>
            {previousEpisode || nextEpisode ? (
              <nav
                className={styles.navigation}
                aria-label={formatMessage({
                  id: 'media.show.episode.navigationLabel',
                  defaultMessage: 'Episode navigation',
                  description: 'Accessible label for episode detail navigation',
                })}>
                {previousEpisode ? (
                  <Link
                    to={route.episode(String(previousEpisode.number))}
                    className={styles.navLink}>
                    <span className={styles.navDirection}>
                      <FormattedMessage
                        id="media.show.episode.previous"
                        defaultMessage="Previous episode"
                        description="Link label for the previous episode"
                      />
                    </span>
                    <span>{previousEpisode.titles.canonical}</span>
                  </Link>
                ) : null}
                {nextEpisode ? (
                  <Link
                    to={route.episode(String(nextEpisode.number))}
                    className={[styles.navLink, styles.nextLink].join(' ')}>
                    <span className={styles.navDirection}>
                      <FormattedMessage
                        id="media.show.episode.next"
                        defaultMessage="Next episode"
                        description="Link label for the next episode"
                      />
                    </span>
                    <span>{nextEpisode.titles.canonical}</span>
                  </Link>
                ) : null}
              </nav>
            ) : null}
          </>
        ) : (
          <Card className={styles.notFound}>
            <h1 className={styles.notFoundTitle}>
              <FormattedMessage
                id="media.show.episode.notFoundTitle"
                defaultMessage="Episode not found"
                description="Title shown when an anime episode number does not exist"
              />
            </h1>
            <p className={styles.notFoundText}>
              <FormattedMessage
                id="media.show.episode.notFoundMessage"
                defaultMessage="We could not find episode {number} for this anime."
                description="Message shown when an anime episode number does not exist"
                values={{ number: episodeNumberParam }}
              />
            </p>
          </Card>
        )}
      </div>
    </AnimeLayout>
  );
}
