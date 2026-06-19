import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterAll, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

import { render, screen } from 'app/test-utils/testing-library';

import ProfileReviewsPage from './index';

const urqlMocks = vi.hoisted(() => ({
  useMutation: vi.fn(),
  useQuery: vi.fn(),
}));

vi.mock('urql', () => ({
  useMutation: urqlMocks.useMutation,
  useQuery: urqlMocks.useQuery,
}));

const consoleError = console.error;

const imageSource = {
  blurhash: null,
  views: [{ height: 300, width: 200, url: 'https://example.com/image.jpg' }],
};

const reviewNode = {
  id: 'review-1',
  content: 'A thoughtful review.',
  createdAt: new Date(2026, 5, 1),
  isSpoiler: false,
  rating: 16,
  author: {
    id: 'profile-1',
    slug: 'punoqun',
    name: 'Puno Qun',
    avatarImage: imageSource,
  },
  media: {
    __typename: 'Anime',
    id: 'anime-1',
    slug: 'cowboy-bebop',
    titles: {
      preferred: 'Cowboy Bebop',
    },
    posterImage: imageSource,
  },
};

function mockProfileReviews({
  nodes = [reviewNode],
  totalCount,
  hasNextPage = false,
}: {
  nodes?: (typeof reviewNode)[];
  totalCount?: number;
  hasNextPage?: boolean;
} = {}) {
  urqlMocks.useQuery.mockReturnValue([
    {
      data: {
        findProfile: {
          id: 'profile-1',
          slug: 'punoqun',
          name: 'Puno Qun',
          avatarImage: imageSource,
          bannerImage: imageSource,
          reviews: {
            totalCount: totalCount ?? nodes.length,
            nodes,
            pageInfo: {
              hasNextPage,
            },
          },
        },
      },
      fetching: false,
    },
  ]);
}

function renderProfileReviewsPage() {
  render(
    <MemoryRouter initialEntries={['/users/punoqun/reviews']}>
      <Routes>
        <Route path="/users/:slug/reviews" element={<ProfileReviewsPage />} />
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
  mockProfileReviews();
});

afterAll(() => {
  vi.restoreAllMocks();
});

describe('ProfileReviewsPage', () => {
  test('renders the profile reviews list', () => {
    renderProfileReviewsPage();

    expect(screen.getByRole('heading', { name: 'Reviews (1)' })).toBeVisible();
    expect(screen.getByText('Cowboy Bebop')).toBeVisible();
    expect(screen.getByText('A thoughtful review.')).toBeVisible();
  });

  test('renders an empty state', () => {
    mockProfileReviews({ nodes: [], totalCount: 0 });

    renderProfileReviewsPage();

    expect(screen.getByText('No reviews yet')).toBeVisible();
  });

  test('loads more reviews by increasing the first count', async () => {
    const user = userEvent.setup();
    mockProfileReviews({ totalCount: 21, hasNextPage: true });

    renderProfileReviewsPage();

    await user.click(screen.getByRole('button', { name: 'Load more' }));

    expect(urqlMocks.useQuery).toHaveBeenLastCalledWith(
      expect.objectContaining({
        variables: { slug: 'punoqun', first: 40 },
      }),
    );
  });
});
