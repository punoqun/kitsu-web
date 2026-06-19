import { useState } from 'react';
import { FormattedMessage, FormattedNumber } from 'react-intl';

import Avatar from '@/components/content/Avatar';
import { Description } from '@/components/content/Description';
import { ImageFragment } from '@/components/content/Image';
import { Link, type To } from '@/components/content/Link';
import PosterImage from '@/components/content/PosterImage';
import Button from '@/components/controls/Button';
import { FormattedRelativeTime } from '@/components/Formatted';
import Card from '@/components/surfaces/Card';
import { graphql, readFragment, type FragmentOf } from '@/graphql/tada';
import { paths as animePaths } from '@/pages/Anime/paths';
import { paths as profilePaths } from '@/pages/Profile/paths';
import { Path } from '@/utils/routes';

import styles from './styles.module.css';

export const ReviewCardFragment = graphql(
  `
    fragment ReviewCardFragment on Review {
      id
      content
      createdAt
      isSpoiler
      rating
      author {
        id
        slug
        name
        avatarImage {
          ...ImageFragment
        }
      }
      media {
        __typename
        id
        slug
        titles {
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

export type ReviewCardProps = {
  review: FragmentOf<typeof ReviewCardFragment>;
};

function getMediaPath(media: { __typename: 'Anime' | 'Manga'; slug: string }): To {
  if (media.__typename === 'Anime') return animePaths(media.slug);

  return new Path(`/manga/${media.slug}`);
}

export default function ReviewCard(props: ReviewCardProps) {
  const review = readFragment(ReviewCardFragment, props.review);
  const [isSpoilerRevealed, setIsSpoilerRevealed] = useState(false);
  const mediaTitle = review.media.titles.preferred;
  const shouldShowBody = !review.isSpoiler || isSpoilerRevealed;

  return (
    <Card className={styles.card}>
      <Link
        to={getMediaPath(review.media)}
        className={styles.posterLink}
        aria-label={mediaTitle}>
        <PosterImage
          alt={mediaTitle}
          className={styles.poster}
          source={review.media.posterImage}
          width={84}
        />
      </Link>

      <div className={styles.content}>
        <header className={styles.header}>
          <h2 className={styles.mediaTitle}>
            <Link to={getMediaPath(review.media)} className={styles.mediaLink}>
              {mediaTitle}
            </Link>
          </h2>
          <dl className={styles.rating}>
            <dt>
              <FormattedMessage
                defaultMessage="Rating"
                description="Label for the rating displayed on a review card."
              />
            </dt>
            <dd>
              <FormattedNumber
                value={review.rating / 2}
                maximumFractionDigits={1}
              />
              <FormattedMessage
                defaultMessage="/10"
                description="Suffix for a review rating out of ten."
              />
            </dd>
          </dl>
        </header>

        <div className={styles.byline}>
          <Link to={profilePaths(review.author)} className={styles.authorLink}>
            <Avatar
              source={review.author.avatarImage}
              size={28}
              alt=""
              className={styles.avatar}
            />
            <span>{review.author.name}</span>
          </Link>
          <span className={styles.time}>
            <FormattedRelativeTime time={review.createdAt} strict />
          </span>
        </div>

        {review.isSpoiler ? (
          <div className={styles.spoilerGate}>
            <p className={styles.spoilerWarning}>
              <FormattedMessage
                defaultMessage="This review contains spoilers."
                description="Warning shown before revealing a spoiler review."
              />
            </p>
            <Button
              type="button"
              kind="outline"
              color="grey"
              size="small"
              onClick={() => setIsSpoilerRevealed((visible) => !visible)}>
              {isSpoilerRevealed ? (
                <FormattedMessage
                  defaultMessage="Hide review"
                  description="Button label to hide a spoiler review."
                />
              ) : (
                <FormattedMessage
                  defaultMessage="Show review"
                  description="Button label to reveal a spoiler review."
                />
              )}
            </Button>
          </div>
        ) : null}

        {shouldShowBody ? (
          <Description text={review.content} className={styles.body} />
        ) : null}
      </div>
    </Card>
  );
}
