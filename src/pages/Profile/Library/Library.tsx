import { useEffect, useState } from 'react';
import { FormattedMessage, FormattedNumber, useIntl } from 'react-intl';
import { useLocation, useParams, useSearchParams } from 'react-router';
import invariant from 'tiny-invariant';

import { Link } from '@/components/content/Link';
import LibraryEntryCard, {
  LibraryEntryCardFragment,
} from '@/components/content/LibraryEntryCard';
import Button, { ButtonColor, ButtonKind } from '@/components/controls/Button';
import TabBar from '@/components/navigation/TabBar';
import { graphql } from '@/graphql/tada';
import { useQuery } from '@/graphql/urql';
import ProfileLayout, { ProfileLayoutFragment } from '@/pages/Profile/Layout';

import styles from './styles.module.css';

const LIBRARY_INCREMENT = 30;

type LibraryType = 'anime' | 'manga';
type MediaType = 'ANIME' | 'MANGA';
type LibraryEntryStatus =
  | 'COMPLETED'
  | 'CURRENT'
  | 'DROPPED'
  | 'ON_HOLD'
  | 'PLANNED';
type LibraryStatusFilter =
  | 'all'
  | 'current'
  | 'completed'
  | 'planned'
  | 'on-hold'
  | 'dropped';

const STATUS_FILTERS: {
  value: LibraryStatusFilter;
  libraryStatus: LibraryEntryStatus | null;
}[] = [
  { value: 'all', libraryStatus: null },
  { value: 'current', libraryStatus: 'CURRENT' },
  { value: 'completed', libraryStatus: 'COMPLETED' },
  { value: 'planned', libraryStatus: 'PLANNED' },
  { value: 'on-hold', libraryStatus: 'ON_HOLD' },
  { value: 'dropped', libraryStatus: 'DROPPED' },
];

export const ProfileLibraryPageQuery = graphql(
  `
    query findProfileLibrary(
      $slug: String!
      $first: Int!
      $mediaType: MediaTypeEnum!
      $status: [LibraryEntryStatusEnum!]
    ) {
      findProfile: findProfileBySlug(slug: $slug) {
        ...ProfileLayoutFragment
        library {
          all(
            first: $first
            mediaType: $mediaType
            status: $status
            sort: [{ on: UPDATED_AT, direction: DESCENDING }]
          ) {
            totalCount
            nodes {
              id
              ...LibraryEntryCardFragment
            }
            pageInfo {
              endCursor
              hasNextPage
            }
          }
        }
      }
    }
  `,
  [ProfileLayoutFragment, LibraryEntryCardFragment],
);

function isLibraryType(type: string | undefined): type is LibraryType {
  return type === 'anime' || type === 'manga';
}

function toMediaType(type: LibraryType): MediaType {
  return type === 'manga' ? 'MANGA' : 'ANIME';
}

function getStatusFilter(value: string | null) {
  return (
    STATUS_FILTERS.find((filter) => filter.value === value) ??
    STATUS_FILTERS[0]
  );
}

function getStatusLabel(status: LibraryStatusFilter) {
  switch (status) {
    case 'all':
      return (
        <FormattedMessage
          defaultMessage="All"
          description="Library status filter for all entries."
        />
      );
    case 'current':
      return (
        <FormattedMessage
          defaultMessage="Current"
          description="Library status filter for current entries."
        />
      );
    case 'completed':
      return (
        <FormattedMessage
          defaultMessage="Completed"
          description="Library status filter for completed entries."
        />
      );
    case 'planned':
      return (
        <FormattedMessage
          defaultMessage="Planned"
          description="Library status filter for planned entries."
        />
      );
    case 'on-hold':
      return (
        <FormattedMessage
          defaultMessage="On Hold"
          description="Library status filter for on hold entries."
        />
      );
    case 'dropped':
      return (
        <FormattedMessage
          defaultMessage="Dropped"
          description="Library status filter for dropped entries."
        />
      );
  }
}

export default function ProfileLibraryPage() {
  const { slug, type } = useParams<'slug' | 'type'>();
  invariant(slug, 'Missing slug on ProfileLibrary');
  invariant(isLibraryType(type), 'Invalid library type on ProfileLibrary');

  const { formatMessage } = useIntl();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const selectedStatus = getStatusFilter(searchParams.get('status'));
  const mediaType = toMediaType(type);
  const statusFilter = selectedStatus.libraryStatus
    ? [selectedStatus.libraryStatus]
    : null;
  const [count, setCount] = useState(LIBRARY_INCREMENT);

  useEffect(() => {
    setCount(LIBRARY_INCREMENT);
  }, [mediaType, selectedStatus.value]);

  const [result] = useQuery({
    query: ProfileLibraryPageQuery,
    variables: {
      slug,
      first: count,
      mediaType,
      status: statusFilter,
    },
  });

  if (!result.data?.findProfile) return null;

  const profile = result.data.findProfile;
  const library = profile.library.all;
  const entries = library.nodes ?? [];
  const totalCount = library.totalCount;
  const hasMore = library.pageInfo.hasNextPage || entries.length < totalCount;

  const getStatusTo = (status: LibraryStatusFilter) =>
    status === 'all'
      ? location.pathname
      : `${location.pathname}?status=${status}`;

  return (
    <ProfileLayout profile={profile}>
      <main className={styles.content}>
        <header className={styles.header}>
          <h1 className={styles.title}>
            {mediaType === 'ANIME' ? (
              <FormattedMessage
                defaultMessage="Anime Library ({count})"
                description="Heading for a user's anime library with entry count."
                values={{
                  count: <FormattedNumber value={totalCount} />,
                }}
              />
            ) : (
              <FormattedMessage
                defaultMessage="Manga Library ({count})"
                description="Heading for a user's manga library with entry count."
                values={{
                  count: <FormattedNumber value={totalCount} />,
                }}
              />
            )}
          </h1>
          <TabBar
            className={styles.statusTabs}
            aria-label={formatMessage({
              defaultMessage: 'Library status filters',
              description: 'Accessible label for the library status filter tabs.',
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

        {totalCount === 0 ? (
          <p className={styles.empty}>
            <FormattedMessage
              defaultMessage="No library entries found for this status."
              description="Empty state shown when a profile library status has no entries."
            />
          </p>
        ) : (
          <div className={styles.grid}>
            {entries.map(
              (entry) =>
                entry && <LibraryEntryCard entry={entry} key={entry.id} />,
            )}
          </div>
        )}

        {hasMore ? (
          <Button
            kind={ButtonKind.SOLID}
            color={ButtonColor.GREEN}
            loading={result.fetching}
            disabled={result.fetching}
            className={styles.loadMore}
            onClick={() =>
              setCount((current) => current + LIBRARY_INCREMENT)
            }>
            <FormattedMessage
              defaultMessage="Load more"
              description="Button label to load more library entries."
            />
          </Button>
        ) : null}
      </main>
    </ProfileLayout>
  );
}
