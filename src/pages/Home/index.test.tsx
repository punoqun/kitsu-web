import { MemoryRouter } from 'react-router';
import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest';

import { render, screen } from 'app/test-utils/testing-library';

import HomePage from './index';

const imageSource = {
  blurhash: null,
  views: [{ height: 300, width: 200, url: 'https://example.com/poster.jpg' }],
};

const consoleError = console.error;

vi.mock('urql', () => ({
  useMutation: vi.fn(),
  useQuery: () => [
    {
      fetching: false,
      data: {
        trendingAnime: {
          nodes: [
            {
              __typename: 'Anime',
              id: 'anime-1',
              slug: 'cowboy-bebop',
              titles: {
                preferred: 'Cowboy Bebop',
                canonical: 'Cowboy Bebop',
              },
              posterImage: imageSource,
            },
          ],
        },
        trendingManga: {
          nodes: [
            {
              __typename: 'Manga',
              id: 'manga-1',
              slug: 'delicious-in-dungeon',
              titles: {
                preferred: 'Delicious in Dungeon',
                canonical: 'Delicious in Dungeon',
              },
              posterImage: imageSource,
            },
          ],
        },
      },
    },
  ],
}));

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

describe('HomePage', () => {
  test('renders trending anime and manga shelves', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', { name: 'Discover anime and manga' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('region', { name: 'Trending Anime' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('region', { name: 'Trending Manga' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Cowboy Bebop/ })).toHaveAttribute(
      'href',
      '/anime/cowboy-bebop',
    );
    expect(
      screen.getByRole('link', { name: /Delicious in Dungeon/ }),
    ).toHaveAttribute('href', '/manga/delicious-in-dungeon');
  });
});
