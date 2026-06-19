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

export const ProfileFollowersPageQuery = graphql(
  `
    query findProfileFollowers($slug: String!, $first: Int!) {
      findProfile: findProfileBySlug(slug: $slug) {
        ...ProfileLayoutFragment
        followers(first: $first) {
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

export default function ProfileFollowersPage() {
  const { slug } = useParams<'slug'>();
  invariant(slug, 'Missing slug on ProfileFollowers');

  const [count, setCount] = useState(PROFILES_INCREMENT);
  const [result] = useQuery({
    query: ProfileFollowersPageQuery,
    variables: { slug, first: count },
  });

  if (!result.data?.findProfile) return null;

  const profile = result.data.findProfile;
  const followers = profile.followers.nodes?.filter(isPresent) ?? [];
  const totalCount = profile.followers.totalCount;
  const hasMore = profile.followers.pageInfo.hasNextPage;

  return (
    <ProfileLayout profile={profile}>
      <main className={styles.content}>
        <header className={styles.header}>
          <h1 className={styles.title}>
            <FormattedMessage
              defaultMessage="Followers ({count})"
              description="Header for the profile followers page with the total followers count."
              values={{ count: <FormattedNumber value={totalCount} /> }}
            />
          </h1>
        </header>

        {totalCount === 0 ? (
          <p className={styles.empty}>
            <FormattedMessage
              defaultMessage="No followers yet"
              description="Empty state shown when a profile has no followers."
            />
          </p>
        ) : (
          <div className={styles.profileGrid}>
            {followers.map((follower) => (
              <ProfileCard profile={follower} key={follower.id} />
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
              description="Button label to load more profile followers."
            />
          </Button>
        )}
      </main>
    </ProfileLayout>
  );
}
