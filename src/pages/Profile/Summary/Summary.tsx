import { FormattedMessage, FormattedNumber } from 'react-intl';
import { useParams } from 'react-router';
import invariant from 'tiny-invariant';
import { useQuery } from 'urql';

import { Description } from '@/components/content/Description';
import Card from '@/components/surfaces/Card';
import { graphql } from '@/graphql/tada';

import ProfileLayout, { ProfileLayoutFragment } from '../Layout';
import styles from './styles.module.css';

export const ProfileSummaryPageQuery = graphql(
  `
    query findProfileBySlug($slug: String!) {
      findProfile: findProfileBySlug(slug: $slug) {
        ...ProfileLayoutFragment
        about
        followers {
          totalCount
        }
        following {
          totalCount
        }
        mediaReactions {
          totalCount
        }
        reviews {
          totalCount
        }
      }
    }
  `,
  [ProfileLayoutFragment],
);

export default function ProfileSummaryPage() {
  const { slug } = useParams<'slug'>();
  invariant(slug, 'Missing slug on ProfileSummary');

  const results = useQuery({
    query: ProfileSummaryPageQuery,
    variables: { slug },
  });

  if (!results[0].data?.findProfile) return null;

  const profile = results[0].data.findProfile;
  const stats = [
    {
      key: 'followers',
      label: (
        <FormattedMessage
          defaultMessage="Followers"
          description="Label for the number of users following a profile."
        />
      ),
      value: profile.followers.totalCount,
    },
    {
      key: 'following',
      label: (
        <FormattedMessage
          defaultMessage="Following"
          description="Label for the number of users this profile follows."
        />
      ),
      value: profile.following.totalCount,
    },
    {
      key: 'reactions',
      label: (
        <FormattedMessage
          defaultMessage="Reactions"
          description="Label for the number of media reactions written by a profile."
        />
      ),
      value: profile.mediaReactions.totalCount,
    },
    {
      key: 'reviews',
      label: (
        <FormattedMessage
          defaultMessage="Reviews"
          description="Label for the number of reviews written by a profile."
        />
      ),
      value: profile.reviews?.totalCount ?? 0,
    },
  ];

  return (
    <ProfileLayout profile={profile}>
      <div className={styles.content}>
        <Card className={styles.card}>
          <h2 className={styles.cardTitle}>
            <FormattedMessage
              defaultMessage="About"
              description="Heading for the profile biography section."
            />
          </h2>
          {profile.about ? (
            <Description text={profile.about} />
          ) : (
            <p className={styles.emptyAbout}>
              <FormattedMessage
                defaultMessage="This user has not written a bio yet."
                description="Placeholder shown when a profile has no biography."
              />
            </p>
          )}
        </Card>
      </div>
      <aside className={styles.sidebar}>
        <Card className={styles.card}>
          <h2 className={styles.cardTitle}>
            <FormattedMessage
              defaultMessage="Stats"
              description="Heading for profile summary statistics."
            />
          </h2>
          <dl className={styles.statList}>
            {stats.map((stat) => (
              <div className={styles.stat} key={stat.key}>
                <dt className={styles.statLabel}>{stat.label}</dt>
                <dd className={styles.statValue}>
                  <FormattedNumber value={stat.value} />
                </dd>
              </div>
            ))}
          </dl>
        </Card>
      </aside>
    </ProfileLayout>
  );
}
