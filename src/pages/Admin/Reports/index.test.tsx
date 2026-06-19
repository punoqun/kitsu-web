import { MemoryRouter, Route, Routes } from 'react-router';
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from 'vitest';

import { useAccount, useSitePermission } from '@/contexts/AccountContext';
import { useQuery } from '@/graphql/urql';
import { render, screen } from 'app/test-utils/testing-library';

import AdminReportsPage from './index';

vi.mock('@/contexts/AccountContext', () => ({
  useAccount: vi.fn(),
  useSitePermission: vi.fn(),
}));

vi.mock('@/graphql/urql', () => ({
  useQuery: vi.fn(),
}));

const consoleError = console.error;
const mockedUseAccount = vi.mocked(useAccount);
const mockedUseSitePermission = vi.mocked(useSitePermission);
const mockedUseQuery = vi.mocked(useQuery);
const imageSource = {
  blurhash: null,
  views: [{ height: 200, width: 200, url: 'https://example.com/avatar.jpg' }],
};

const reportsConnection = {
  totalCount: 2,
  pageInfo: {
    endCursor: null,
    hasNextPage: false,
  },
  nodes: [
    {
      id: 'report-1',
      reason: 'SPAM',
      status: 'REPORTED',
      explanation: 'This post is spam.',
      createdAt: new Date('2026-06-19T08:00:00.000Z'),
      reporter: {
        id: 'profile-1',
        slug: 'alice',
        name: 'Alice Reporter',
        avatarImage: imageSource,
      },
      naughty: {
        __typename: 'Post',
        id: 'post-1',
        content: 'Buy these suspicious links',
      },
    },
    {
      id: 'report-2',
      reason: 'OFFENSIVE',
      status: 'RESOLVED',
      explanation: 'This reaction is offensive.',
      createdAt: new Date('2026-06-18T08:00:00.000Z'),
      reporter: {
        id: 'profile-2',
        slug: 'bob',
        name: 'Bob Reporter',
        avatarImage: imageSource,
      },
      naughty: {
        __typename: 'MediaReaction',
        id: 'reaction-1',
        reaction: 'Reaction text under review',
      },
    },
  ],
};

function renderReportsPage(path = '/admin/reports') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/admin/reports" element={<AdminReportsPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeAll(() => {
  vi.spyOn(console, 'error').mockImplementation(
    (message?: unknown, ...args: unknown[]) => {
      if (String(message).includes('MISSING_TRANSLATION')) return;
      consoleError(message, ...args);
    },
  );
});

beforeEach(() => {
  mockedUseAccount.mockReturnValue({
    fetching: false,
    ratingSystem: 'SIMPLE',
    sfwFilter: true,
    sitePermissions: new Set(['COMMUNITY_MOD']),
    enabledFeatures: new Set(),
  });
  mockedUseSitePermission.mockImplementation(
    (permission) => permission === 'COMMUNITY_MOD',
  );
  mockedUseQuery.mockReturnValue([
    {
      fetching: false,
      data: {
        reportsByStatus: reportsConnection,
      },
    },
    vi.fn(),
  ] as unknown as ReturnType<typeof useQuery>);
});

afterAll(() => {
  vi.restoreAllMocks();
});

describe('AdminReportsPage', () => {
  test('renders reports from the moderation queue', () => {
    renderReportsPage();

    expect(screen.getByText('Reports (2)')).toBeInTheDocument();
    expect(screen.getByText('Alice Reporter')).toBeInTheDocument();
    expect(screen.getByText('Bob Reporter')).toBeInTheDocument();
    expect(screen.getByText('This post is spam.')).toBeInTheDocument();
    expect(screen.getByText('Buy these suspicious links')).toBeInTheDocument();
    expect(screen.getByText('Reaction text under review')).toBeInTheDocument();
  });

  test('renders the unauthorized state without loading reports', () => {
    mockedUseSitePermission.mockReturnValue(false);

    renderReportsPage();

    expect(
      screen.getByText('You are not authorized to view reports.'),
    ).toBeInTheDocument();
    expect(mockedUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({ pause: true }),
    );
  });
});
