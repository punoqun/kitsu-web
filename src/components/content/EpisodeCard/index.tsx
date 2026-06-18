import { FormattedDate, FormattedMessage, useIntl } from 'react-intl';

import Image, { ImageFragment } from '@/components/content/Image';
import { Link, type To as LinkTo } from '@/components/content/Link';
import Card from '@/components/surfaces/Card';
import { graphql, readFragment, type FragmentOf } from '@/graphql/tada';

import styles from './styles.module.css';

export const EpisodeCardFragment = graphql(
  `
    fragment EpisodeCardFragment on Episode {
      id
      number
      titles {
        canonical
      }
      releasedAt
      length
      thumbnail {
        ...ImageFragment
      }
    }
  `,
  [ImageFragment],
);

export type EpisodeCardProps = {
  episode: FragmentOf<typeof EpisodeCardFragment>;
  to?: LinkTo;
};

export default function EpisodeCard(props: EpisodeCardProps) {
  const { formatMessage } = useIntl();
  const episode = readFragment(EpisodeCardFragment, props.episode);
  const title = episode.titles.canonical;
  const card = (
    <Card className={styles.card}>
      <div className={styles.thumbnail}>
        {episode.thumbnail ? (
          <Image
            source={episode.thumbnail}
            alt={formatMessage(
              {
                id: 'media.show.episodes.card.thumbnailAlt',
                defaultMessage: 'Thumbnail for {title}',
                description: 'Alt text for an episode thumbnail image',
              },
              { title },
            )}
            className={styles.thumbnailImage}
          />
        ) : (
          <div className={styles.thumbnailFallback}>
            <FormattedMessage
              id="media.show.episodes.card.noThumbnail"
              defaultMessage="No thumbnail"
              description="Fallback text shown when an episode has no thumbnail"
            />
          </div>
        )}
      </div>
      <div className={styles.content}>
        <div className={styles.badge}>
          <FormattedMessage
            id="media.show.episodes.card.episodeNumber"
            defaultMessage="Episode {number}"
            description="Episode number badge on an episode card"
            values={{ number: episode.number }}
          />
        </div>
        <h2 className={styles.title}>{title}</h2>
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
                id="media.show.episodes.card.length"
                defaultMessage="{length, number} min"
                description="Episode runtime in minutes"
                values={{ length: episode.length }}
              />
            </span>
          ) : null}
        </div>
      </div>
    </Card>
  );

  if (props.to) {
    return (
      <Link to={props.to} className={styles.link}>
        {card}
      </Link>
    );
  }

  return card;
}
