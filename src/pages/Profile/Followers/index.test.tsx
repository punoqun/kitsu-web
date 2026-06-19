import { MemoryRouter, Route, Routes } from 'react-router';
import { useQuery } from 'urql';
import { afterAll, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

import { render, screen } from 'app/test-utils/testing-library';

import ProfileFollowersPage from './index';

const consoleError = console.error;

const imageSource = {
  blurhash: null,
  views: [{ height: 200, width: 200, url: 'https://example.com/profile.jpg' }],
};

const follower = {
  id: '2',
  slug: 'follower-one',
  name: 'Follower One',
  about: 'Likes cozy anime.',
  avatarImage: imageSource,
};

const profile = {
  id: '1',
  slug: 'punoqun',
  name: 'Puno Qun',
  avatarImage: imageSource,
  bannerImage: imageSource,
  followers: {
    totalCount: 1,
    nodes: [follower],
    pageInfo: {
      endCursor: null,
      hasNextPage: false,
    },
  },
};

vi.mock('urql', () => ({
  useMutation: vi.fn(),
  useQuery: vi.fn(),
}));

const useQueryMock = vi.mocked(useQuery);

function queryResult() {
  return [
    {
      data: {
        findProfile: profile,
      },
      fetching: false,
    },
  ] as never;
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
  useQueryMock.mockReset();
  useQueryMock.mockReturnValue(queryResult());
});

afterAll(() => {
  vi.restoreAllMocks();
});

describe('ProfileFollowersPage', () => {
  test('renders the followers total and profile cards', () => {
    render(
      <MemoryRouter initialEntries={['/users/punoqun/followers']}>
        <Routes>
          <Route
            path="/users/:slug/followers"
            element={<ProfileFollowersPage />}
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Followers (1)')).toBeInTheDocument();
    expect(screen.getByText('Follower One')).toBeInTheDocument();
    expect(screen.getByText('@follower-one')).toBeInTheDocument();
  });
});
