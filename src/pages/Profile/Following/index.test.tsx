import { MemoryRouter, Route, Routes } from 'react-router';
import { useQuery } from 'urql';
import { afterAll, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

import { render, screen } from 'app/test-utils/testing-library';

import ProfileFollowingPage from './index';

const consoleError = console.error;

const imageSource = {
  blurhash: null,
  views: [{ height: 200, width: 200, url: 'https://example.com/profile.jpg' }],
};

const followedProfile = {
  id: '2',
  slug: 'followed-one',
  name: 'Followed One',
  about: 'Shares thoughtful reviews.',
  avatarImage: imageSource,
};

const profile = {
  id: '1',
  slug: 'punoqun',
  name: 'Puno Qun',
  avatarImage: imageSource,
  bannerImage: imageSource,
  following: {
    totalCount: 1,
    nodes: [followedProfile],
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

describe('ProfileFollowingPage', () => {
  test('renders the following total and profile cards', () => {
    render(
      <MemoryRouter initialEntries={['/users/punoqun/following']}>
        <Routes>
          <Route
            path="/users/:slug/following"
            element={<ProfileFollowingPage />}
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Following (1)')).toBeInTheDocument();
    expect(screen.getByText('Followed One')).toBeInTheDocument();
    expect(screen.getByText('@followed-one')).toBeInTheDocument();
  });
});
