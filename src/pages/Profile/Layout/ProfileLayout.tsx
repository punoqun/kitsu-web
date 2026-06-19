import type React from 'react';
import { FormattedMessage } from 'react-intl';

import Avatar from '@/components/content/Avatar';
import BannerImage from '@/components/content/BannerImage';
import { ImageFragment } from '@/components/content/Image';
import TabBar from '@/components/navigation/TabBar';
import { HeaderSettings } from '@/contexts/LayoutSettingsContext';
import { graphql, readFragment, type FragmentOf } from '@/graphql/tada';
import utilStyles from '@/styles/utils.module.css';

import { paths } from '../paths';
import styles from './styles.module.css';

export const ProfileLayoutFragment = graphql(
  `
    fragment ProfileLayoutFragment on Profile {
      id
      slug
      name
      avatarImage {
        ...ImageFragment
      }
      bannerImage {
        ...ImageFragment
      }
    }
  `,
  [ImageFragment],
);

export type ProfileLayoutProps = {
  profile: FragmentOf<typeof ProfileLayoutFragment>;
  children: React.ReactNode;
};

export default function ProfileLayout(props: ProfileLayoutProps) {
  const profile = readFragment(ProfileLayoutFragment, props.profile);
  const route = paths({ slug: profile.slug, id: profile.id });
  const handle = profile.slug ?? profile.id;

  return (
    <div className={styles.page}>
      <HeaderSettings background="transparent" scrollBackground="opaque" />

      <BannerImage source={profile.bannerImage} className={styles.banner}>
        <div className={[utilStyles.container, styles.bannerContent].join(' ')}>
          <Avatar
            source={profile.avatarImage}
            size={144}
            className={styles.avatar}
            alt=""
          />
          <div className={styles.identity}>
            <h1 className={styles.name}>{profile.name}</h1>
            <span className={styles.handle}>@{handle}</span>
          </div>
          <TabBar className={styles.tabs}>
            <TabBar.LinkItem to={route}>
              <FormattedMessage
                defaultMessage="Summary"
                description="Navigation tab label for a user's profile summary page."
              />
            </TabBar.LinkItem>
            <TabBar.LinkItem to={route.reactions()}>
              <FormattedMessage
                defaultMessage="Reactions"
                description="Navigation tab label for a user's profile reactions page."
              />
            </TabBar.LinkItem>
            <TabBar.LinkItem to={route.reviews()}>
              <FormattedMessage
                defaultMessage="Reviews"
                description="Navigation tab label for a user's profile reviews page."
              />
            </TabBar.LinkItem>
            <TabBar.LinkItem to={route.followers()}>
              <FormattedMessage
                defaultMessage="Followers"
                description="Navigation tab label for a user's profile followers page."
              />
            </TabBar.LinkItem>
            <TabBar.LinkItem to={route.following()}>
              <FormattedMessage
                defaultMessage="Following"
                description="Navigation tab label for a user's profile following page."
              />
            </TabBar.LinkItem>
            <TabBar.LinkItem to={route.groups()}>
              <FormattedMessage
                defaultMessage="Groups"
                description="Navigation tab label for a user's profile groups page."
              />
            </TabBar.LinkItem>
            <TabBar.LinkItem to={route.library('anime')}>
              <FormattedMessage
                defaultMessage="Anime"
                description="Navigation tab label for a user's anime library page."
              />
            </TabBar.LinkItem>
          </TabBar>
        </div>
      </BannerImage>

      <div className={[utilStyles.container, styles.container].join(' ')}>
        {props.children}
      </div>
    </div>
  );
}
