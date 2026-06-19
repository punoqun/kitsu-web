import { useState } from 'react';
import { FormattedMessage, FormattedNumber } from 'react-intl';
import { useParams } from 'react-router';
import invariant from 'tiny-invariant';

import ProfileCard, {
  ProfileCardFragment,
} from '@/components/content/ProfileCard';
import Button from '@/components/controls/Button';
import { graphql } from '@/graphql/tada';
import { useQuery } from '@/graphql/urql';
import ProfileLayout, { ProfileLayoutFragment } from '@/pages/Profile/Layout';

import styles from './styles.module.css';

const PROFILES_INCREMENT = 20;

export const ProfileFollowingPageQuery = graphql(
  `
    query findProfileFollowing($slug: String!, $first: Int!) {
      findProfile: findProfileBySlug(slug: $slug) {
        ...ProfileLayoutFragment
        following(first: $first) {
          totalCount
          nodes {
            id
            ...ProfileCardFragment
          }
          pageInfo {
            endCursor
            hasNextPage
          }
        }
      }
    }
  `,
  [ProfileLayoutFragment, ProfileCardFragment],
);

function isPresent<T>(value: T | null | undefined): value is NonNullable<T> {
  return value != null;
}

export default function ProfileFollowingPage() {
  const { slug } = useParams<'slug'>();
  invariant(slug, 'Missing slug on ProfileFollowing');

  const [count, setCount] = useState(PROFILES_INCREMENT);
  const [result] = useQuery({
    query: ProfileFollowingPageQuery,
    variables: { slug, first: count },
  });

  if (!result.data?.findProfile) return null;

  const profile = result.data.findProfile;
  const following = profile.following.nodes?.filter(isPresent) ?? [];
  const totalCount = profile.following.totalCount;
  const hasMore = profile.following.pageInfo.hasNextPage;

  return (
    <ProfileLayout profile={profile}>
      <main className={styles.content}>
        <header className={styles.header}>
          <h1 className={styles.title}>
            <FormattedMessage
              defaultMessage="Following ({count})"
              description="Header for the profile following page with the total following count."
              values={{ count: <FormattedNumber value={totalCount} /> }}
            />
          </h1>
        </header>

        {totalCount === 0 ? (
          <p className={styles.empty}>
            <FormattedMessage
              defaultMessage="Not following anyone yet"
              description="Empty state shown when a profile is not following anyone."
            />
          </p>
        ) : (
          <div className={styles.profileGrid}>
            {following.map((followedProfile) => (
              <ProfileCard profile={followedProfile} key={followedProfile.id} />
            ))}
          </div>
        )}

        {hasMore && (
          <Button
            type="button"
            kind="solid"
            color="green"
            loading={result.fetching}
            disabled={result.fetching}
            className={styles.loadMore}
            onClick={() =>
              setCount((current) => current + PROFILES_INCREMENT)
            }>
            <FormattedMessage
              defaultMessage="Load more"
              description="Button label to load more followed profiles."
            />
          </Button>
        )}
      </main>
    </ProfileLayout>
  );
}
