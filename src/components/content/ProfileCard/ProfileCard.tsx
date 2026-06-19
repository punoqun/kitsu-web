import { FormattedMessage } from 'react-intl';

import Avatar from '@/components/content/Avatar';
import { ImageFragment } from '@/components/content/Image';
import { Link } from '@/components/content/Link';
import Card from '@/components/surfaces/Card';
import { graphql, readFragment, type FragmentOf } from '@/graphql/tada';
import { paths as profilePaths } from '@/pages/Profile/paths';

import styles from './styles.module.css';

export const ProfileCardFragment = graphql(
  `
    fragment ProfileCardFragment on Profile {
      id
      slug
      name
      about
      avatarImage {
        ...ImageFragment
      }
    }
  `,
  [ImageFragment],
);

export default function ProfileCard({
  profile: profileRef,
}: {
  profile: FragmentOf<typeof ProfileCardFragment>;
}) {
  const profile = readFragment(ProfileCardFragment, profileRef);
  const handle = profile.slug ?? profile.id;

  return (
    <Link
      to={profilePaths({ slug: profile.slug, id: profile.id })}
      className={styles.link}>
      <Card className={styles.card}>
        <Avatar
          source={profile.avatarImage}
          size={56}
          alt={profile.name}
          className={styles.avatar}
        />
        <div className={styles.content}>
          <div className={styles.identity}>
            <div className={styles.name}>{profile.name}</div>
            <div className={styles.handle}>{`@${handle}`}</div>
          </div>
          {profile.about ? (
            <p className={styles.about}>{profile.about}</p>
          ) : (
            <p className={styles.about}>
              <FormattedMessage
                defaultMessage="No bio yet."
                description="Placeholder shown on a profile card when the profile has no biography."
              />
            </p>
          )}
        </div>
      </Card>
    </Link>
  );
}
