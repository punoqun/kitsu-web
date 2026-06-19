import { MemoryRouter, Route, Routes } from 'react-router';
import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest';

import { render, screen } from 'app/test-utils/testing-library';

import ProfileLibraryPage from './index';

const consoleError = console.error;

vi.mock('@/graphql/urql', () => {
  const imageSource = {
    blurhash: null,
    views: [
      { height: 300, width: 200, url: 'https://example.com/poster.jpg' },
    ],
  };

  return {
    useQuery: () => [
      {
        fetching: false,
        data: {
          findProfile: {
            id: '1',
            slug: 'punoqun',
            name: 'Puno Qun',
            avatarImage: imageSource,
            bannerImage: imageSource,
            library: {
              all: {
                totalCount: 1,
                nodes: [
                  {
                    id: 'library-entry-1',
                    status: 'CURRENT',
                    progress: 12,
                    rating: 18,
                    reconsumeCount: 0,
                    updatedAt: new Date('2026-06-19T00:00:00.000Z'),
                    media: {
                      __typename: 'Anime',
                      id: 'anime-1',
                      slug: 'cowboy-bebop',
                      titles: {
                        canonical: 'Cowboy Bebop',
                        preferred: 'Cowboy Bebop',
                      },
                      posterImage: imageSource,
                    },
                  },
                ],
                pageInfo: {
                  endCursor: null,
                  hasNextPage: false,
                },
              },
            },
          },
        },
      },
    ],
  };
});

beforeAll(() => {
  vi.spyOn(console, 'error').mockImplementation(
    (message?: unknown, ...args: unknown[]) => {
      if (String(message).includes('MISSING_TRANSLATION')) return;
      consoleError(message, ...args);
    },
  );
});

afterAll(() => {
  vi.restoreAllMocks();
});

describe('ProfileLibraryPage', () => {
  test('renders the profile library entries', () => {
    render(
      <MemoryRouter initialEntries={['/users/punoqun/library/anime']}>
        <Routes>
          <Route
            path="/users/:slug/library/:type"
            element={<ProfileLibraryPage />}
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Anime Library (1)')).toBeInTheDocument();
    expect(screen.getByText('Cowboy Bebop')).toBeInTheDocument();
    expect(screen.getByText('Progress 12')).toBeInTheDocument();
  });
});
