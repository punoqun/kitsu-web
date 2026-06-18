import { FormattedDate, FormattedMessage } from 'react-intl';

import {
  FormattedChapterCount,
  FormattedReleaseStatus,
  FormattedSubtype,
} from '@/components/Formatted';
import TabBar from '@/components/navigation/TabBar';
import { graphql, readFragment, type FragmentOf } from '@/graphql/tada';
import { paths } from '@/pages/Manga/paths';
import MediaBanner, { MediaBannerFragment } from '@/pages/Media/Banner';

export const MangaBannerFragment = graphql(
  `
    fragment MangaBannerFragment on Manga {
      ...MediaBannerFragment
      status
      startDate
      subtype
      chapterCount
    }
  `,
  [MediaBannerFragment],
);

export type MangaBannerProps = {
  manga: FragmentOf<typeof MangaBannerFragment>;
};

function MangaFactoids(props: MangaBannerProps) {
  const manga = readFragment(MangaBannerFragment, props.manga);

  const factoids = [
    <FormattedSubtype subtype={manga.subtype} key="subtype" />,
    manga.startDate && (
      <FormattedDate value={manga.startDate} year="numeric" key="startDate" />
    ),
    <FormattedReleaseStatus releaseStatus={manga.status} key="releaseStatus" />,
    'chapterCount' in manga && manga.chapterCount && (
      <FormattedChapterCount
        chapterCount={manga.chapterCount}
        key="chapterCount"
      />
    ),
  ];
  return (
    <>
      {factoids
        .filter((e) => !!e)
        .flatMap((e) => [' · ', e])
        .slice(1)}
    </>
  );
}

export function MangaBanner(props: MangaBannerProps) {
  const manga = readFragment(MangaBannerFragment, props.manga);
  const route = paths(manga.slug);

  return (
    <MediaBanner media={manga}>
      <MediaBanner.PosterImage source={manga.posterImage} />
      <MediaBanner.Title>{manga.titles?.preferred}</MediaBanner.Title>
      <MediaBanner.Subtitle>
        <MangaFactoids manga={props.manga} />
      </MediaBanner.Subtitle>
      <MediaBanner.TabBar>
        <TabBar.LinkItem to={route}>
          <FormattedMessage
            id="media.show.navigation.summary"
            defaultMessage="Summary"
            description="media -> show -> navigation -> summary"
          />
        </TabBar.LinkItem>
        <TabBar.LinkItem to={route.chapters()}>
          <FormattedMessage
            id="media.show.navigation.chapters"
            defaultMessage="Chapters"
            description="media -> show -> navigation -> chapters"
          />
        </TabBar.LinkItem>
        <TabBar.LinkItem to={route.characters()}>
          <FormattedMessage
            id="media.show.navigation.characters"
            defaultMessage="Characters"
            description="media -> show -> navigation -> characters"
          />
        </TabBar.LinkItem>
        <TabBar.LinkItem to={route.staff()}>
          <FormattedMessage
            id="media.show.navigation.staff"
            defaultMessage="Staff"
            description="media -> show -> navigation -> staff"
          />
        </TabBar.LinkItem>
        <TabBar.LinkItem to={route.reactions()}>
          <FormattedMessage
            id="media.show.navigation.reactions"
            defaultMessage="Reactions"
            description="media -> show -> navigation -> reactions"
          />
        </TabBar.LinkItem>
        <TabBar.LinkItem to={route.franchise()}>
          <FormattedMessage
            id="media.show.navigation.franchise"
            defaultMessage="Franchise"
            description="media -> show -> navigation -> franchise"
          />
        </TabBar.LinkItem>
        <TabBar.LinkItem to={route.quotes()}>
          <FormattedMessage
            id="media.show.navigation.quotes"
            defaultMessage="Quotes"
            description="media -> show -> navigation -> quotes"
          />
        </TabBar.LinkItem>
      </MediaBanner.TabBar>
    </MediaBanner>
  );
}
