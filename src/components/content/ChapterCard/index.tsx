import { FormattedDate, FormattedMessage, useIntl } from 'react-intl';

import Image, { ImageFragment } from '@/components/content/Image';
import { Link, type To as LinkTo } from '@/components/content/Link';
import Card from '@/components/surfaces/Card';
import { graphql, readFragment, type FragmentOf } from '@/graphql/tada';

import styles from './styles.module.css';

export const ChapterCardFragment = graphql(
  `
    fragment ChapterCardFragment on Chapter {
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

export type ChapterCardProps = {
  chapter: FragmentOf<typeof ChapterCardFragment>;
  to?: LinkTo;
};

export default function ChapterCard(props: ChapterCardProps) {
  const { formatMessage } = useIntl();
  const chapter = readFragment(ChapterCardFragment, props.chapter);
  const title = chapter.titles.canonical;
  const card = (
    <Card className={styles.card}>
      <div className={styles.thumbnail}>
        {chapter.thumbnail ? (
          <Image
            source={chapter.thumbnail}
            alt={formatMessage(
              {
                id: 'media.show.chapters.card.thumbnailAlt',
                defaultMessage: 'Thumbnail for {title}',
                description: 'Alt text for a chapter thumbnail image',
              },
              { title },
            )}
            className={styles.thumbnailImage}
          />
        ) : (
          <div className={styles.thumbnailFallback}>
            <FormattedMessage
              id="media.show.chapters.card.noThumbnail"
              defaultMessage="No thumbnail"
              description="Fallback text shown when a chapter has no thumbnail"
            />
          </div>
        )}
      </div>
      <div className={styles.content}>
        <div className={styles.badge}>
          <FormattedMessage
            id="media.show.chapters.card.chapterNumber"
            defaultMessage="Chapter {number}"
            description="Chapter number badge on a chapter card"
            values={{ number: chapter.number }}
          />
        </div>
        <h2 className={styles.title}>{title}</h2>
        <div className={styles.meta}>
          {chapter.releasedAt ? (
            <span>
              <FormattedDate
                value={chapter.releasedAt}
                year="numeric"
                month="long"
                day="numeric"
              />
            </span>
          ) : null}
          {chapter.length ? (
            <span>
              <FormattedMessage
                id="media.show.chapters.card.length"
                defaultMessage="{length, number} pages"
                description="Chapter length in pages"
                values={{ length: chapter.length }}
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
