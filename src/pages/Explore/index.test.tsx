import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterAll, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

import { render, screen } from 'app/test-utils/testing-library';

import ExplorePage, {
  ExploreAnimeByStatusPageQuery,
  ExploreAnimePageQuery,
  ExploreMangaByStatusPageQuery,
  ExploreMangaPageQuery,
} from './index';

const urqlMocks = vi.hoisted(() => ({
  useQuery: vi.fn(),
}));

vi.mock('@/graphql/urql', () => ({
  useQuery: urqlMocks.useQuery,
}));

const consoleError = console.error;

const imageSource = {
  blurhash: null,
  views: [{ height: 300, width: 200, url: 'https://example.com/poster.jpg' }],
};

const animeNode = {
  __typename: 'Anime',
  id: 'anime-1',
  slug: 'cowboy-bebop',
  titles: {
    preferred: 'Cowboy Bebop',
    canonical: 'Cowboy Bebop',
  },
  posterImage: imageSource,
};

const mangaNode = {
  __typename: 'Manga',
  id: 'manga-1',
  slug: 'berserk',
  titles: {
    preferred: 'Berserk',
    canonical: 'Berserk',
  },
  posterImage: imageSource,
};

function connection(
  nodes: (typeof animeNode | typeof mangaNode)[],
  totalCount = nodes.length,
  hasNextPage = false,
) {
  return {
    totalCount,
    nodes,
    pageInfo: {
      hasNextPage,
    },
  };
}

function mockExploreQueries({
  anime = connection([animeNode]),
  animeByStatus = connection([animeNode]),
  manga = connection([mangaNode]),
  mangaByStatus = connection([mangaNode]),
} = {}) {
  urqlMocks.useQuery.mockImplementation(({ query }) => {
    if (query === ExploreAnimePageQuery) {
      return [{ data: { anime }, fetching: false }];
    }

    if (query === ExploreAnimeByStatusPageQuery) {
      return [{ data: { animeByStatus }, fetching: false }];
    }

    if (query === ExploreMangaPageQuery) {
      return [{ data: { manga }, fetching: false }];
    }

    if (query === ExploreMangaByStatusPageQuery) {
      return [{ data: { mangaByStatus }, fetching: false }];
    }

    return [{ data: {}, fetching: false }];
  });
}

function renderExplorePage(initialEntry = '/explore/anime') {
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/explore/:type" element={<ExplorePage />} />
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
  urqlMocks.useQuery.mockReset();
  mockExploreQueries();
});

afterAll(() => {
  vi.restoreAllMocks();
});

describe('ExplorePage', () => {
  test('renders the anime poster grid', () => {
    renderExplorePage();

    expect(screen.getByRole('heading', { name: 'Explore Anime' })).toBeVisible();
    expect(screen.getByText('Cowboy Bebop')).toBeVisible();
    expect(screen.getByRole('link', { name: 'All' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  test('uses the status search param for manga', () => {
    renderExplorePage('/explore/manga?status=finished');

    expect(screen.getByRole('heading', { name: 'Explore Manga' })).toBeVisible();
    expect(screen.getByText('Berserk')).toBeVisible();
    expect(screen.getByRole('link', { name: 'Finished' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(urqlMocks.useQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        query: ExploreMangaByStatusPageQuery,
        variables: { first: 24, status: 'FINISHED' },
        pause: false,
      }),
    );
  });

  test('loads more media by increasing the first count', async () => {
    const user = userEvent.setup();
    mockExploreQueries({ anime: connection([animeNode], 25, true) });

    renderExplorePage();

    await user.click(screen.getByRole('button', { name: 'Load more' }));

    expect(urqlMocks.useQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        query: ExploreAnimePageQuery,
        variables: { first: 48 },
        pause: false,
      }),
    );
  });

  test('renders an empty state', () => {
    mockExploreQueries({ anime: connection([], 0) });

    renderExplorePage();

    expect(screen.getByText('No anime found for this status.')).toBeVisible();
  });
});
