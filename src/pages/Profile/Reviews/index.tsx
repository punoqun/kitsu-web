import { useState } from 'react';
import { FormattedMessage, FormattedNumber } from 'react-intl';
import { useParams } from 'react-router';
import invariant from 'tiny-invariant';

import ReviewCard, {
  ReviewCardFragment,
} from '@/components/content/ReviewCard';
import Button from '@/components/controls/Button';
import { graphql } from '@/graphql/tada';
import { useQuery } from '@/graphql/urql';
import ProfileLayout, { ProfileLayoutFragment } from '@/pages/Profile/Layout';

import styles from './styles.module.css';

const REVIEWS_INCREMENT = 20;

export const ProfileReviewsPageQuery = graphql(
  `
    query findProfileReviews($slug: String!, $first: Int!) {
      findProfile: findProfileBySlug(slug: $slug) {
        ...ProfileLayoutFragment
        reviews(first: $first) {
          totalCount
          nodes {
            id
            ...ReviewCardFragment
          }
          pageInfo {
            hasNextPage
          }
        }
      }
    }
  `,
  [ProfileLayoutFragment, ReviewCardFragment],
);

function isPresent<T>(value: T | null | undefined): value is T {
  return value != null;
}

export default function ProfileReviewsPage() {
  const { slug } = useParams<'slug'>();
  invariant(slug, 'Missing slug on ProfileReviews');

  const [count, setCount] = useState(REVIEWS_INCREMENT);
  const [result] = useQuery({
    query: ProfileReviewsPageQuery,
    variables: { slug, first: count },
  });

  if (!result.data?.findProfile) return null;

  const profile = result.data.findProfile;
  const reviews = profile.reviews?.nodes?.filter(isPresent) ?? [];
  const totalCount = profile.reviews?.totalCount ?? 0;
  const hasMore = profile.reviews?.pageInfo.hasNextPage ?? false;

  return (
    <ProfileLayout profile={profile}>
      <main className={styles.content}>
        <header className={styles.header}>
          <h1 className={styles.title}>
            <FormattedMessage
              defaultMessage="Reviews ({count})"
              description="Header for the profile reviews page with the total review count."
              values={{ count: <FormattedNumber value={totalCount} /> }}
            />
          </h1>
        </header>

        {totalCount === 0 ? (
          <p className={styles.empty}>
            <FormattedMessage
              defaultMessage="No reviews yet"
              description="Empty state shown when a profile has not written any reviews."
            />
          </p>
        ) : (
          <div className={styles.reviewList}>
            {reviews.map((review) => (
              <ReviewCard review={review} key={review.id} />
            ))}
          </div>
        )}

        {hasMore ? (
          <Button
            kind="solid"
            color="green"
            loading={result.fetching}
            disabled={result.fetching}
            className={styles.loadMore}
            onClick={() =>
              setCount((currentCount) => currentCount + REVIEWS_INCREMENT)
            }>
            <FormattedMessage
              defaultMessage="Load more"
              description="Button label to load more profile reviews."
            />
          </Button>
        ) : null}
      </main>
    </ProfileLayout>
  );
}
