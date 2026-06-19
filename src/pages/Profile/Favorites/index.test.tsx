import userEvent from '@testing-library/user-event';
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

import { render, screen } from 'app/test-utils/testing-library';

import ProfileFavoritesPage from './index';

const urqlMocks = vi.hoisted(() => ({
  useQuery: vi.fn(),
}));

vi.mock('@/graphql/urql', () => ({
  useQuery: urqlMocks.useQuery,
}));

const consoleError = console.error;

const imageSource = {
  blurhash: null,
  views: [{ height: 300, width: 200, url: 'https://example.com/image.jpg' }],
};

const profile = {
  id: 'profile-1',
  slug: 'punoqun',
  name: 'Puno Qun',
  avatarImage: imageSource,
  bannerImage: imageSource,
  favorites: {
    totalCount: 4,
    nodes: [
      {
        id: 'favorite-anime',
        createdAt: new Date('2026-06-19T00:00:00.000Z'),
        item: {
          __typename: 'Anime',
          id: 'anime-1',
          slug: 'cowboy-bebop',
          titles: {
            preferred: 'Cowboy Bebop',
            canonical: 'Cowboy Bebop',
          },
          posterImage: imageSource,
        },
      },
      {
        id: 'favorite-manga',
        createdAt: new Date('2026-06-19T00:00:00.000Z'),
        item: {
          __typename: 'Manga',
          id: 'manga-1',
          slug: 'witch-hat-atelier',
          titles: {
            preferred: 'Witch Hat Atelier',
            canonical: 'Witch Hat Atelier',
          },
          posterImage: imageSource,
        },
      },
      {
        id: 'favorite-character',
        createdAt: new Date('2026-06-19T00:00:00.000Z'),
        item: {
          __typename: 'Character',
          id: 'character-1',
          slug: 'spike-spiegel',
          names: {
            canonical: 'Spike Spiegel',
          },
          image: imageSource,
        },
      },
      {
        id: 'favorite-person',
        createdAt: new Date('2026-06-19T00:00:00.000Z'),
        item: {
          __typename: 'Person',
          id: 'person-1',
          slug: 'yoko-kanno',
          name: 'Yoko Kanno',
          image: imageSource,
        },
      },
    ],
    pageInfo: {
      endCursor: null,
      hasNextPage: false,
    },
  },
};

function mockProfileFavorites({
  totalCount = 4,
  hasNextPage = false,
}: {
  totalCount?: number;
  hasNextPage?: boolean;
} = {}) {
  urqlMocks.useQuery.mockReturnValue([
    {
      data: {
        findProfile: {
          ...profile,
          favorites: {
            ...profile.favorites,
            totalCount,
            pageInfo: {
              endCursor: null,
              hasNextPage,
            },
          },
        },
      },
      fetching: false,
    },
  ]);
}

function renderProfileFavoritesPage() {
  render(
    <MemoryRouter initialEntries={['/users/punoqun/favorites']}>
      <Routes>
        <Route
          path="/users/:slug/favorites"
          element={<ProfileFavoritesPage />}
        />
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
  mockProfileFavorites();
});

afterAll(() => {
  vi.restoreAllMocks();
});

describe('ProfileFavoritesPage', () => {
  test('renders favorite anime, manga, characters, and people', () => {
    renderProfileFavoritesPage();

    expect(
      screen.getByRole('heading', { name: 'Favorites (4)' }),
    ).toBeVisible();
    expect(screen.getByText('Cowboy Bebop')).toBeVisible();
    expect(screen.getByText('Witch Hat Atelier')).toBeVisible();
    expect(screen.getByText('Spike Spiegel')).toBeVisible();
    expect(screen.getByText('Yoko Kanno')).toBeVisible();
  });

  test('loads more favorites by increasing the first count', async () => {
    const user = userEvent.setup();
    mockProfileFavorites({ totalCount: 31, hasNextPage: true });

    renderProfileFavoritesPage();

    await user.click(screen.getByRole('button', { name: 'Load more' }));

    expect(urqlMocks.useQuery).toHaveBeenLastCalledWith(
      expect.objectContaining({
        variables: { slug: 'punoqun', first: 60 },
      }),
    );
  });
});
