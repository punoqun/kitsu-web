import type React from 'react';

import { ImageFragment } from '@/components/content/Image';
import { graphql, readFragment, type FragmentOf } from '@/graphql/tada';
import PosterImage from 'app/components/content/PosterImage';
import LibraryBox, { LibraryBoxFragment } from 'app/pages/Media/LibraryBox';
import utilStyles from 'app/styles/utils.module.css';

import { MangaBanner, MangaBannerFragment } from '../Banner';
import styles from './styles.module.css';

export const MangaLayoutFragment = graphql(
  `
    fragment MangaLayoutFragment on Manga {
      posterImage {
        ...ImageFragment
      }
      ...MangaBannerFragment
      ...LibraryBoxFragment
    }
  `,
  [MangaBannerFragment, LibraryBoxFragment, ImageFragment],
);

export type MangaLayoutProps = {
  media: FragmentOf<typeof MangaLayoutFragment>;
  children: React.ReactNode;
};

export default function MangaLayout(props: MangaLayoutProps) {
  const media = readFragment(MangaLayoutFragment, props.media);

  return (
    <div className={styles.page}>
      <MangaBanner manga={media} />
      <div className={[utilStyles.container, styles.container].join(' ')}>
        <div className={styles.infoSidebar}>
          <PosterImage
            source={media.posterImage}
            className={styles.poster}
            height={250}
            width={180}
          />
          <LibraryBox media={media} />
        </div>
        {props.children}
      </div>
    </div>
  );
}
