import { useEffect, useState, type ReactNode } from 'react';
import {
  FormattedMessage,
  FormattedNumber,
  useIntl,
  type IntlShape,
} from 'react-intl';
import { useLocation, useSearchParams } from 'react-router';

import Avatar from '@/components/content/Avatar';
import Byline from '@/components/content/Byline';
import { ImageFragment } from '@/components/content/Image';
import { Link } from '@/components/content/Link';
import Tag, { type TagColor } from '@/components/content/Tag';
import Button, { ButtonColor, ButtonKind } from '@/components/controls/Button';
import { FormattedRelativeTime } from '@/components/Formatted';
import TabBar from '@/components/navigation/TabBar';
import Card from '@/components/surfaces/Card';
import Container from '@/components/utils/Container';
import { useAccount, useSitePermission } from '@/contexts/AccountContext';
import {
  graphql,
  readFragment,
  type FragmentOf,
  type ResultOf,
} from '@/graphql/tada';
import { useQuery } from '@/graphql/urql';
import AdminLayout from '@/pages/Admin/Layout';
import { paths as profilePaths } from '@/pages/Profile/paths';

import styles from './styles.module.css';

const REPORTS_INCREMENT = 25;
const COMMUNITY_MOD_PERMISSION = 'COMMUNITY_MOD';
const ADMIN_PERMISSION = 'ADMIN';

type ReportStatus = 'REPORTED' | 'RESOLVED' | 'DECLINED';
type ReportReason =
  | 'BULLYING'
  | 'NSFW'
  | 'OFFENSIVE'
  | 'OTHER'
  | 'SPAM'
  | 'SPOILER';
type ReportStatusFilter = 'reported' | 'resolved' | 'declined' | 'all';

const STATUS_FILTERS: {
  value: ReportStatusFilter;
  reportStatus: ReportStatus | null;
}[] = [
  { value: 'reported', reportStatus: 'REPORTED' },
  { value: 'resolved', reportStatus: 'RESOLVED' },
  { value: 'declined', reportStatus: 'DECLINED' },
  { value: 'all', reportStatus: null },
];

export const AdminReportCardFragment = graphql(
  `
    fragment AdminReportCardFragment on Report {
      id
      reason
      status
      explanation
      createdAt
      reporter {
        id
        slug
        name
        avatarImage {
          ...ImageFragment
        }
      }
      naughty {
        __typename
        ... on Comment {
          id
          content
        }
        ... on MediaReaction {
          id
          reaction
        }
        ... on Post {
          id
          content
        }
        ... on Review {
          id
          content
        }
      }
    }
  `,
  [ImageFragment],
);

const AdminReportConnectionFragment = graphql(
  `
    fragment AdminReportConnectionFragment on ReportConnection {
      totalCount
      nodes {
        id
        ...AdminReportCardFragment
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  `,
  [AdminReportCardFragment],
);

export const AdminReportsPageQuery = graphql(
  `
    query AdminReportsPageQuery(
      $first: Int!
      $statuses: [ReportStatusEnum!]
      $includeAll: Boolean!
      $includeByStatus: Boolean!
    ) {
      reports(first: $first) @include(if: $includeAll) {
        ...AdminReportConnectionFragment
      }
      reportsByStatus(statuses: $statuses, first: $first)
        @include(if: $includeByStatus) {
        ...AdminReportConnectionFragment
      }
    }
  `,
  [AdminReportConnectionFragment],
);

type ReportItem = ResultOf<typeof AdminReportCardFragment>['naughty'];

function getStatusFilter(value: string | null) {
  return (
    STATUS_FILTERS.find((filter) => filter.value === value) ?? STATUS_FILTERS[0]
  );
}

function getFilterLabel(status: ReportStatusFilter): ReactNode {
  switch (status) {
    case 'reported':
      return (
        <FormattedMessage
          defaultMessage="Reported"
          description="Admin reports status filter for unresolved reported reports."
        />
      );
    case 'resolved':
      return (
        <FormattedMessage
          defaultMessage="Resolved"
          description="Admin reports status filter for resolved reports."
        />
      );
    case 'declined':
      return (
        <FormattedMessage
          defaultMessage="Declined"
          description="Admin reports status filter for declined reports."
        />
      );
    case 'all':
      return (
        <FormattedMessage
          defaultMessage="All"
          description="Admin reports status filter for all reports."
        />
      );
  }
}

function getReportStatusLabel(status: ReportStatus): ReactNode {
  switch (status) {
    case 'REPORTED':
      return (
        <FormattedMessage
          defaultMessage="Reported"
          description="Label for reports that have not been moderated yet."
        />
      );
    case 'RESOLVED':
      return (
        <FormattedMessage
          defaultMessage="Resolved"
          description="Label for reports resolved by a moderator."
        />
      );
    case 'DECLINED':
      return (
        <FormattedMessage
          defaultMessage="Declined"
          description="Label for reports declined by a moderator."
        />
      );
  }
}

function getReportStatusText(
  status: ReportStatus,
  formatMessage: IntlShape['formatMessage'],
): string {
  switch (status) {
    case 'REPORTED':
      return formatMessage({
        defaultMessage: 'Reported',
        description: 'Label for reports that have not been moderated yet.',
      });
    case 'RESOLVED':
      return formatMessage({
        defaultMessage: 'Resolved',
        description: 'Label for reports resolved by a moderator.',
      });
    case 'DECLINED':
      return formatMessage({
        defaultMessage: 'Declined',
        description: 'Label for reports declined by a moderator.',
      });
  }
}

function getReportReasonLabel(reason: ReportReason): ReactNode {
  switch (reason) {
    case 'BULLYING':
      return (
        <FormattedMessage
          defaultMessage="Bullying"
          description="Report reason label for bullying."
        />
      );
    case 'NSFW':
      return (
        <FormattedMessage
          defaultMessage="NSFW"
          description="Report reason label for not safe for work content."
        />
      );
    case 'OFFENSIVE':
      return (
        <FormattedMessage
          defaultMessage="Offensive"
          description="Report reason label for offensive content."
        />
      );
    case 'OTHER':
      return (
        <FormattedMessage
          defaultMessage="Other"
          description="Report reason label for another reason."
        />
      );
    case 'SPAM':
      return (
        <FormattedMessage
          defaultMessage="Spam"
          description="Report reason label for spam."
        />
      );
    case 'SPOILER':
      return (
        <FormattedMessage
          defaultMessage="Spoiler"
          description="Report reason label for spoiler content."
        />
      );
  }
}

function getStatusColor(status: ReportStatus): TagColor {
  switch (status) {
    case 'REPORTED':
      return 'yellow';
    case 'RESOLVED':
      return 'green';
    case 'DECLINED':
      return 'grey';
  }
}

function ReportedItemSummary({ item }: { item: ReportItem }) {
  if (!item) {
    return (
      <p className={styles.emptyText}>
        <FormattedMessage
          defaultMessage="No reported item is attached to this report."
          description="Fallback shown when a report no longer has a reported item."
        />
      </p>
    );
  }

  switch (item.__typename) {
    case 'Comment':
      return (
        <div className={styles.itemSummary}>
          <Link to={`/comments/${item.id}`} className={styles.itemTitle}>
            <FormattedMessage
              defaultMessage="Comment #{id}"
              description="Link label for a reported comment."
              values={{ id: item.id }}
            />
          </Link>
          <p className={styles.itemContent}>
            {item.content ? (
              item.content
            ) : (
              <FormattedMessage
                defaultMessage="No comment content available."
                description="Fallback shown when a reported comment has no content."
              />
            )}
          </p>
        </div>
      );
    case 'MediaReaction':
      return (
        <div className={styles.itemSummary}>
          <a
            href={`https://kitsu.app/media-reactions/${item.id}`}
            className={styles.itemTitle}>
            <FormattedMessage
              defaultMessage="Media reaction #{id}"
              description="Link label for a reported media reaction."
              values={{ id: item.id }}
            />
          </a>
          <p className={styles.itemContent}>{item.reaction}</p>
        </div>
      );
    case 'Post':
      return (
        <div className={styles.itemSummary}>
          <Link to={`/posts/${item.id}`} className={styles.itemTitle}>
            <FormattedMessage
              defaultMessage="Post #{id}"
              description="Link label for a reported post."
              values={{ id: item.id }}
            />
          </Link>
          <p className={styles.itemContent}>
            {item.content ? (
              item.content
            ) : (
              <FormattedMessage
                defaultMessage="No post content available."
                description="Fallback shown when a reported post has no content."
              />
            )}
          </p>
        </div>
      );
    case 'Review':
      return (
        <div className={styles.itemSummary}>
          <div className={styles.itemTitle}>
            <FormattedMessage
              defaultMessage="Review #{id}"
              description="Label for a reported review."
              values={{ id: item.id }}
            />
          </div>
          <p className={styles.itemContent}>{item.content}</p>
        </div>
      );
  }
}

function ReportCard({
  report: reportFragment,
}: {
  report: FragmentOf<typeof AdminReportCardFragment>;
}) {
  const report = readFragment(AdminReportCardFragment, reportFragment);
  const { formatMessage } = useIntl();
  const reporterPath = profilePaths(report.reporter);

  return (
    <Card className={styles.reportCard}>
      <Byline.Container className={styles.byline}>
        <Byline.Avatar>
          <Link to={reporterPath} className={styles.avatarLink}>
            <Avatar size={48} source={report.reporter.avatarImage} alt="" />
          </Link>
        </Byline.Avatar>
        <Byline.Title>
          <FormattedMessage
            defaultMessage="Reported by {reporter}"
            description="Byline showing which user submitted a report."
            values={{
              reporter: (
                <Link to={reporterPath} className={styles.reporterLink}>
                  {report.reporter.name}
                </Link>
              ),
            }}
          />
        </Byline.Title>
        <Byline.Subtitle>
          <FormattedRelativeTime time={report.createdAt} />
        </Byline.Subtitle>
        <Byline.Right className={styles.tags}>
          <Tag color={getStatusColor(report.status)}>
            {getReportStatusText(report.status, formatMessage)}
          </Tag>
        </Byline.Right>
      </Byline.Container>

      <dl className={styles.metadata}>
        <div>
          <dt>
            <FormattedMessage
              defaultMessage="Reason"
              description="Label for the reason a report was submitted."
            />
          </dt>
          <dd>{getReportReasonLabel(report.reason)}</dd>
        </div>
        <div>
          <dt>
            <FormattedMessage
              defaultMessage="Status"
              description="Label for a report status."
            />
          </dt>
          <dd>{getReportStatusLabel(report.status)}</dd>
        </div>
      </dl>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <FormattedMessage
            defaultMessage="Explanation"
            description="Heading for the explanation a reporter supplied."
          />
        </h2>
        <p className={styles.explanation}>
          {report.explanation ? (
            report.explanation
          ) : (
            <FormattedMessage
              defaultMessage="No explanation provided."
              description="Fallback shown when a report has no explanation."
            />
          )}
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <FormattedMessage
            defaultMessage="Reported item"
            description="Heading for the item attached to a report."
          />
        </h2>
        <ReportedItemSummary item={report.naughty} />
      </section>
    </Card>
  );
}

export default function AdminReportsPage() {
  const { fetching: accountFetching } = useAccount();
  const hasCommunityMod = useSitePermission(COMMUNITY_MOD_PERMISSION);
  const hasAdmin = useSitePermission(ADMIN_PERMISSION);
  const canModerate = hasCommunityMod || hasAdmin;
  const { formatMessage } = useIntl();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const selectedStatus = getStatusFilter(searchParams.get('status'));
  const [count, setCount] = useState(REPORTS_INCREMENT);
  const includeAll = selectedStatus.value === 'all';
  const statuses = selectedStatus.reportStatus
    ? [selectedStatus.reportStatus]
    : null;

  useEffect(() => {
    setCount(REPORTS_INCREMENT);
  }, [selectedStatus.value]);

  const [result] = useQuery({
    query: AdminReportsPageQuery,
    variables: {
      first: count,
      statuses,
      includeAll,
      includeByStatus: !includeAll,
    },
    pause: accountFetching || !canModerate,
  });

  if (accountFetching) {
    return (
      <AdminLayout>
        <Container className={styles.content}>
          <p className={styles.emptyText}>
            <FormattedMessage
              defaultMessage="Loading reports…"
              description="Loading state shown while the admin reports page checks permissions."
            />
          </p>
        </Container>
      </AdminLayout>
    );
  }

  if (!canModerate) {
    return (
      <AdminLayout>
        <Container className={styles.content}>
          <p className={styles.emptyText}>
            <FormattedMessage
              defaultMessage="You are not authorized to view reports."
              description="Message shown when a user lacks permission to view the reports queue."
            />
          </p>
        </Container>
      </AdminLayout>
    );
  }

  if (result.error) {
    return (
      <AdminLayout>
        <Container className={styles.content}>
          <p className={styles.emptyText}>
            <FormattedMessage
              defaultMessage="Reports could not be loaded."
              description="Error state shown when the reports queue fails to load."
            />
          </p>
        </Container>
      </AdminLayout>
    );
  }

  const reportsConnection =
    result.data?.reports ?? result.data?.reportsByStatus;
  if (!reportsConnection) return null;

  const reportConnection = readFragment(
    AdminReportConnectionFragment,
    reportsConnection,
  );
  const reports = reportConnection.nodes ?? [];
  const totalCount = reportConnection.totalCount;
  const hasMore =
    reportConnection.pageInfo.hasNextPage || reports.length < totalCount;
  const getStatusTo = (status: ReportStatusFilter) =>
    status === 'reported'
      ? location.pathname
      : `${location.pathname}?status=${status}`;

  return (
    <AdminLayout>
      <Container className={styles.content}>
        <header className={styles.header}>
          <h1 className={styles.title}>
            <FormattedMessage
              defaultMessage="Reports ({count})"
              description="Heading for the admin reports queue with the total report count."
              values={{ count: <FormattedNumber value={totalCount} /> }}
            />
          </h1>

          <TabBar
            className={styles.statusTabs}
            aria-label={formatMessage({
              defaultMessage: 'Report status filters',
              description:
                'Accessible label for the admin report status filter tabs.',
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
                  {getFilterLabel(status.value)}
                </Link>
              </TabBar.Item>
            ))}
          </TabBar>
        </header>

        {totalCount === 0 ? (
          <p className={styles.emptyText}>
            <FormattedMessage
              defaultMessage="No reports found for this status."
              description="Empty state shown when an admin report status has no reports."
            />
          </p>
        ) : (
          <div className={styles.reportList}>
            {reports.map(
              (report) =>
                report && <ReportCard report={report} key={report.id} />,
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
            onClick={() => setCount((current) => current + REPORTS_INCREMENT)}>
            <FormattedMessage
              defaultMessage="Load more"
              description="Button label to load more reports."
            />
          </Button>
        ) : null}
      </Container>
    </AdminLayout>
  );
}
