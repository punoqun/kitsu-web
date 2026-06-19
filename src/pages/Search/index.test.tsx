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

import { useQuery } from '@/graphql/urql';
import { render, screen } from 'app/test-utils/testing-library';

import SearchPage from './index';

const consoleError = console.error;

const imageSource = {
  blurhash: null,
  views: [{ height: 300, width: 200, url: 'https://example.com/poster.jpg' }],
};

const animeResult = {
  id: 'anime-1',
  __typename: 'Anime',
  slug: 'naruto',
  titles: {
    canonical: 'Naruto',
    preferred: 'Naruto',
  },
  posterImage: imageSource,
};

const profileResult = {
  id: 'profile-1',
  slug: 'naruto-fan',
  name: 'Naruto Fan',
  about: 'Loves ninja anime.',
  avatarImage: imageSource,
};

vi.mock('@/graphql/urql', () => ({
  useQuery: vi.fn(),
}));

const useQueryMock = vi.mocked(useQuery);

function renderSearchPage(initialEntry: string) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/search" element={<SearchPage />} />
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
  useQueryMock.mockReset();
  useQueryMock.mockReturnValue([
    {
      fetching: false,
      data: {
        searchMediaByTitle: {
          nodes: [animeResult],
          pageInfo: {
            hasNextPage: false,
          },
        },
      },
    },
  ] as never);
});

afterAll(() => {
  vi.restoreAllMocks();
});

describe('SearchPage', () => {
  test('searches anime by title from the query string', () => {
    renderSearchPage('/search?query=naruto');

    expect(screen.getByText('Results for “naruto”')).toBeInTheDocument();
    expect(screen.getByText('Naruto')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Naruto/ })).toHaveAttribute(
      'href',
      '/anime/naruto',
    );
    expect(useQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: {
          title: 'naruto',
          mediaType: 'ANIME',
          first: 20,
        },
      }),
    );
  });

  test('searches users by username when the users tab is selected', () => {
    useQueryMock.mockReturnValue([
      {
        fetching: false,
        data: {
          searchProfileByUsername: {
            totalCount: 1,
            nodes: [profileResult],
            pageInfo: {
              hasNextPage: false,
            },
          },
        },
      },
    ] as never);

    renderSearchPage('/search?query=naruto&type=users');

    expect(screen.getByText('Naruto Fan')).toBeInTheDocument();
    expect(screen.getByText('@naruto-fan')).toBeInTheDocument();
    expect(useQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: {
          username: 'naruto',
          first: 20,
        },
      }),
    );
  });

  test('prompts for a search term without querying when query is empty', () => {
    renderSearchPage('/search?query=%20%20%20');

    expect(
      screen.getByText('Enter a search term to find anime, manga, and users.'),
    ).toBeInTheDocument();
    expect(useQueryMock).not.toHaveBeenCalled();
  });
});
