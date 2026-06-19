import { Suspense, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useSearchParams } from 'react-router';

import { ImageFragment } from '@/components/content/Image';
import { Link } from '@/components/content/Link';
import MediaPosterCard from '@/components/content/MediaPosterCard';
import ProfileCard, {
  ProfileCardFragment,
} from '@/components/content/ProfileCard';
import Button from '@/components/controls/Button';
import TabBar from '@/components/navigation/TabBar';
import { graphql } from '@/graphql/tada';
import { useQuery } from '@/graphql/urql';
import { paths as searchPaths, type SearchType } from '@/pages/Search/paths';
import utilStyles from '@/styles/utils.module.css';
import { getMediaPath, getMediaTitle } from '@/utils/media';

import styles from './styles.module.css';

const SEARCH_INCREMENT = 20;
const SEARCH_TYPES: SearchType[] = ['anime', 'manga', 'users'];

type MediaSearchType = Exclude<SearchType, 'users'>;
type MediaType = 'ANIME' | 'MANGA';

export const SearchMediaPageQuery = graphql(
  `
    query searchMediaPage(
      $title: String!
      $mediaType: MediaTypeEnum!
      $first: Int!
    ) {
      searchMediaByTitle(title: $title, mediaType: $mediaType, first: $first) {
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

export const SearchProfilesPageQuery = graphql(
  `
    query searchProfilesPage($username: String!, $first: Int!) {
      searchProfileByUsername(username: $username, first: $first) {
        totalCount
        nodes {
          id
          ...ProfileCardFragment
        }
        pageInfo {
          hasNextPage
        }
      }
    }
  `,
  [ProfileCardFragment],
);

function isPresent<T>(value: T | null | undefined): value is NonNullable<T> {
  return value != null;
}

function getSearchType(value: string | null): SearchType {
  if (value === 'manga' || value === 'users') return value;

  return 'anime';
}

function toMediaType(type: MediaSearchType): MediaType {
  return type === 'manga' ? 'MANGA' : 'ANIME';
}

function getTabLabel(type: SearchType) {
  switch (type) {
    case 'manga':
      return (
        <FormattedMessage
          defaultMessage="Manga"
          description="Search results tab label for manga."
        />
      );
    case 'users':
      return (
        <FormattedMessage
          defaultMessage="Users"
          description="Search results tab label for users."
        />
      );
    case 'anime':
      return (
        <FormattedMessage
          defaultMessage="Anime"
          description="Search results tab label for anime."
        />
      );
  }
}

function getEmptyState(type: SearchType) {
  switch (type) {
    case 'manga':
      return (
        <FormattedMessage
          defaultMessage="No manga found for this search."
          description="Empty state shown when a manga search has no results."
        />
      );
    case 'users':
      return (
        <FormattedMessage
          defaultMessage="No users found for this search."
          description="Empty state shown when a user search has no results."
        />
      );
    case 'anime':
      return (
        <FormattedMessage
          defaultMessage="No anime found for this search."
          description="Empty state shown when an anime search has no results."
        />
      );
  }
}

function SearchTabs({
  query,
  selectedType,
}: {
  query: string;
  selectedType: SearchType;
}) {
  const { formatMessage } = useIntl();

  return (
    <TabBar
      className={styles.tabs}
      aria-label={formatMessage({
        defaultMessage: 'Search result types',
        description: 'Accessible label for search result type tabs.',
      })}>
      {SEARCH_TYPES.map((type) => (
        <TabBar.Item key={type}>
          <Link
            className={[
              styles.tabLink,
              type === selectedType ? styles.tabLinkActive : null,
            ]
              .filter(Boolean)
              .join(' ')}
            aria-current={type === selectedType ? 'page' : undefined}
            to={searchPaths({ query, type })}>
            {getTabLabel(type)}
          </Link>
        </TabBar.Item>
      ))}
    </TabBar>
  );
}

function MediaSearchResults({
  query,
  type,
}: {
  query: string;
  type: MediaSearchType;
}) {
  const [count, setCount] = useState(SEARCH_INCREMENT);
  const [result] = useQuery({
    query: SearchMediaPageQuery,
    variables: {
      title: query,
      mediaType: toMediaType(type),
      first: count,
    },
  });
  const media = result.data?.searchMediaByTitle.nodes?.filter(isPresent) ?? [];
  const hasMore = result.data?.searchMediaByTitle.pageInfo.hasNextPage ?? false;

  return (
    <>
      {media.length === 0 ? (
        <p className={styles.empty}>{getEmptyState(type)}</p>
      ) : (
        <div className={styles.mediaGrid}>
          {media.map((item) => (
            <MediaPosterCard
              key={item.id}
              posterImage={item.posterImage}
              title={getMediaTitle(item)}
              to={getMediaPath(item)}
            />
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
          onClick={() => setCount((current) => current + SEARCH_INCREMENT)}>
          <FormattedMessage
            defaultMessage="Load more"
            description="Button label to load more search results."
          />
        </Button>
      )}
    </>
  );
}

function UserSearchResults({ query }: { query: string }) {
  const [count, setCount] = useState(SEARCH_INCREMENT);
  const [result] = useQuery({
    query: SearchProfilesPageQuery,
    variables: { username: query, first: count },
  });
  const searchResult = result.data?.searchProfileByUsername;
  const profiles = searchResult?.nodes?.filter(isPresent) ?? [];
  const hasMore = searchResult?.pageInfo.hasNextPage ?? false;

  return (
    <>
      {profiles.length === 0 ? (
        <p className={styles.empty}>{getEmptyState('users')}</p>
      ) : (
        <div className={styles.profileList}>
          {profiles.map((profile) => (
            <ProfileCard profile={profile} key={profile.id} />
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
          onClick={() => setCount((current) => current + SEARCH_INCREMENT)}>
          <FormattedMessage
            defaultMessage="Load more"
            description="Button label to load more search results."
          />
        </Button>
      )}
    </>
  );
}

function SearchResults({ query, type }: { query: string; type: SearchType }) {
  if (type === 'users') return <UserSearchResults query={query} />;

  return <MediaSearchResults query={query} type={type} />;
}

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = (searchParams.get('query') ?? '').trim();
  const type = getSearchType(searchParams.get('type'));

  return (
    <main className={[utilStyles.container, styles.page].join(' ')}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          {query ? (
            <FormattedMessage
              defaultMessage="Results for “{query}”"
              description="Search page title showing the user's search query."
              values={{ query }}
            />
          ) : (
            <FormattedMessage
              defaultMessage="Search Kitsu"
              description="Search page title when no search query has been entered."
            />
          )}
        </h1>
        <SearchTabs query={query} selectedType={type} />
      </header>

      {query ? (
        <Suspense
          fallback={
            <p className={styles.empty}>
              <FormattedMessage
                defaultMessage="Loading search results…"
                description="Loading state shown while search results are loading."
              />
            </p>
          }>
          <SearchResults key={`${query}:${type}`} query={query} type={type} />
        </Suspense>
      ) : (
        <p className={styles.empty}>
          <FormattedMessage
            defaultMessage="Enter a search term to find anime, manga, and users."
            description="Prompt shown on the search page before a query has been entered."
          />
        </p>
      )}
    </main>
  );
}
