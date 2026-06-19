import { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useLocation, useParams, useSearchParams } from 'react-router';
import invariant from 'tiny-invariant';

import { ImageFragment } from '@/components/content/Image';
import { Link } from '@/components/content/Link';
import MediaPosterCard from '@/components/content/MediaPosterCard';
import Button, { ButtonColor, ButtonKind } from '@/components/controls/Button';
import TabBar from '@/components/navigation/TabBar';
import { HeaderSettings } from '@/contexts/LayoutSettingsContext';
import { graphql, type ResultOf } from '@/graphql/tada';
import { useQuery } from '@/graphql/urql';
import { getMediaPath, getMediaTitle } from '@/utils/media';

import { type ExploreType } from './paths';
import styles from './styles.module.css';

const EXPLORE_INCREMENT = 24;

type ReleaseStatus = 'CURRENT' | 'FINISHED' | 'UPCOMING';
type StatusFilter = 'all' | 'current' | 'upcoming' | 'finished';

const STATUS_FILTERS: {
  value: StatusFilter;
  releaseStatus: ReleaseStatus | null;
}[] = [
  { value: 'all', releaseStatus: null },
  { value: 'current', releaseStatus: 'CURRENT' },
  { value: 'upcoming', releaseStatus: 'UPCOMING' },
  { value: 'finished', releaseStatus: 'FINISHED' },
];

export const ExploreAnimePageQuery = graphql(
  `
    query ExploreAnimePage($first: Int!) {
      anime(first: $first) {
        totalCount
        nodes {
          __typename
          id
          slug
          titles {
            preferred
            canonical
          }
          posterImage {
            ...ImageFragment
          }
        }
        pageInfo {
          hasNextPage
        }
      }
    }
  `,
  [ImageFragment],
);

export const ExploreAnimeByStatusPageQuery = graphql(
  `
    query ExploreAnimeByStatusPage(
      $first: Int!
      $status: ReleaseStatusEnum!
    ) {
      animeByStatus(first: $first, status: $status) {
        totalCount
        nodes {
          __typename
          id
          slug
          titles {
            preferred
            canonical
          }
          posterImage {
            ...ImageFragment
          }
        }
        pageInfo {
          hasNextPage
        }
      }
    }
  `,
  [ImageFragment],
);

export const ExploreMangaPageQuery = graphql(
  `
    query ExploreMangaPage($first: Int!) {
      manga(first: $first) {
        totalCount
        nodes {
          __typename
          id
          slug
          titles {
            preferred
            canonical
          }
          posterImage {
            ...ImageFragment
          }
        }
        pageInfo {
          hasNextPage
        }
      }
    }
  `,
  [ImageFragment],
);

export const ExploreMangaByStatusPageQuery = graphql(
  `
    query ExploreMangaByStatusPage(
      $first: Int!
      $status: ReleaseStatusEnum!
    ) {
      mangaByStatus(first: $first, status: $status) {
        totalCount
        nodes {
          __typename
          id
          slug
          titles {
            preferred
            canonical
          }
          posterImage {
            ...ImageFragment
          }
        }
        pageInfo {
          hasNextPage
        }
      }
    }
  `,
  [ImageFragment],
);

type AnimeConnection = ResultOf<typeof ExploreAnimePageQuery>['anime'];
type AnimeByStatusConnection = NonNullable<
  ResultOf<typeof ExploreAnimeByStatusPageQuery>['animeByStatus']
>;
type MangaConnection = ResultOf<typeof ExploreMangaPageQuery>['manga'];
type MangaByStatusConnection = NonNullable<
  ResultOf<typeof ExploreMangaByStatusPageQuery>['mangaByStatus']
>;
type ExploreConnection =
  | AnimeConnection
  | AnimeByStatusConnection
  | MangaConnection
  | MangaByStatusConnection;
type ExploreNode = NonNullable<NonNullable<ExploreConnection['nodes']>[number]>;

function isExploreType(type: string | undefined): type is ExploreType {
  return type === 'anime' || type === 'manga';
}

function getStatusFilter(value: string | null) {
  return (
    STATUS_FILTERS.find((filter) => filter.value === value) ??
    STATUS_FILTERS[0]
  );
}

function isExploreNode(
  node: NonNullable<ExploreConnection['nodes']>[number],
): node is ExploreNode {
  return Boolean(node);
}

function getStatusLabel(status: StatusFilter) {
  switch (status) {
    case 'all':
      return (
        <FormattedMessage
          defaultMessage="All"
          description="Explore status filter for all media."
        />
      );
    case 'current':
      return (
        <FormattedMessage
          defaultMessage="Current"
          description="Explore status filter for currently airing anime or current manga."
        />
      );
    case 'upcoming':
      return (
        <FormattedMessage
          defaultMessage="Upcoming"
          description="Explore status filter for upcoming media."
        />
      );
    case 'finished':
      return (
        <FormattedMessage
          defaultMessage="Finished"
          description="Explore status filter for finished media."
        />
      );
  }
}

function getHeading(type: ExploreType) {
  if (type === 'anime') {
    return (
      <FormattedMessage
        defaultMessage="Explore Anime"
        description="Heading for the anime explore page."
      />
    );
  }

  return (
    <FormattedMessage
      defaultMessage="Explore Manga"
      description="Heading for the manga explore page."
    />
  );
}

function getEmptyMessage(type: ExploreType) {
  if (type === 'anime') {
    return (
      <FormattedMessage
        defaultMessage="No anime found for this status."
        description="Empty state shown when the anime explore page has no results for a status."
      />
    );
  }

  return (
    <FormattedMessage
      defaultMessage="No manga found for this status."
      description="Empty state shown when the manga explore page has no results for a status."
    />
  );
}

export default function ExplorePage() {
  const { type } = useParams<'type'>();
  invariant(isExploreType(type), 'Invalid explore type');

  const { formatMessage } = useIntl();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const selectedStatus = getStatusFilter(searchParams.get('status'));
  const releaseStatus = selectedStatus.releaseStatus ?? 'CURRENT';
  const isAll = selectedStatus.releaseStatus === null;
  const [count, setCount] = useState(EXPLORE_INCREMENT);

  useEffect(() => {
    setCount(EXPLORE_INCREMENT);
  }, [type, selectedStatus.value]);

  const [animeResult] = useQuery({
    query: ExploreAnimePageQuery,
    variables: { first: count },
    pause: type !== 'anime' || !isAll,
  });
  const [animeByStatusResult] = useQuery({
    query: ExploreAnimeByStatusPageQuery,
    variables: { first: count, status: releaseStatus },
    pause: type !== 'anime' || isAll,
  });
  const [mangaResult] = useQuery({
    query: ExploreMangaPageQuery,
    variables: { first: count },
    pause: type !== 'manga' || !isAll,
  });
  const [mangaByStatusResult] = useQuery({
    query: ExploreMangaByStatusPageQuery,
    variables: { first: count, status: releaseStatus },
    pause: type !== 'manga' || isAll,
  });

  const activeResult =
    type === 'anime'
      ? isAll
        ? animeResult
        : animeByStatusResult
      : isAll
        ? mangaResult
        : mangaByStatusResult;
  const connection =
    type === 'anime'
      ? isAll
        ? animeResult.data?.anime
        : animeByStatusResult.data?.animeByStatus
      : isAll
        ? mangaResult.data?.manga
        : mangaByStatusResult.data?.mangaByStatus;

  const media = (connection?.nodes ?? []).filter(isExploreNode);
  const hasMore =
    connection ?
      connection.pageInfo.hasNextPage || media.length < connection.totalCount
    : false;

  const getStatusTo = (status: StatusFilter) =>
    status === 'all' ? location.pathname : `${location.pathname}?status=${status}`;

  return (
    <>
      <HeaderSettings background="opaque" />
      <main className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.title}>{getHeading(type)}</h1>
          <TabBar
            className={styles.statusTabs}
            aria-label={formatMessage({
              defaultMessage: 'Explore status filters',
              description: 'Accessible label for the explore status filter tabs.',
            })}>
            {STATUS_FILTERS.map((status) => (
              <TabBar.Item key={status.value}>
                <Link
                  className={[
                    styles.statusLink,
                    status.value === selectedStatus.value
                      ? styles.statusLinkActive
                      : null,
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  aria-current={
                    status.value === selectedStatus.value ? 'page' : undefined
                  }
                  to={getStatusTo(status.value)}>
                  {getStatusLabel(status.value)}
                </Link>
              </TabBar.Item>
            ))}
          </TabBar>
        </header>

        {media.length === 0 ? (
          <p className={styles.empty}>{getEmptyMessage(type)}</p>
        ) : (
          <div className={styles.grid}>
            {media.map((item) => (
              <MediaPosterCard
                key={`${item.__typename}-${item.id}`}
                posterImage={item.posterImage}
                title={getMediaTitle(item)}
                to={getMediaPath(item)}
              />
            ))}
          </div>
        )}

        {hasMore ? (
          <Button
            kind={ButtonKind.SOLID}
            color={ButtonColor.GREEN}
            loading={activeResult.fetching}
            disabled={activeResult.fetching}
            className={styles.loadMore}
            onClick={() =>
              setCount((currentCount) => currentCount + EXPLORE_INCREMENT)
            }>
            <FormattedMessage
              defaultMessage="Load more"
              description="Button label to load more explore results."
            />
          </Button>
        ) : null}
      </main>
    </>
  );
}
