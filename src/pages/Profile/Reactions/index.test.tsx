import { MemoryRouter, Route, Routes } from 'react-router';
import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest';

import { render, screen } from 'app/test-utils/testing-library';

import ProfileReactionsPage from './index';

const consoleError = console.error;

vi.mock('urql', () => {
  const imageSource = {
    blurhash: null,
    views: [
      { height: 200, width: 200, url: 'https://example.com/profile.jpg' },
    ],
  };

  return {
    useMutation: () => [{}, () => null],
    useQuery: () => [
      {
        data: {
          findProfile: {
            id: '1',
            slug: 'punoqun',
            name: 'Puno Qun',
            avatarImage: imageSource,
            bannerImage: imageSource,
            mediaReactions: {
              totalCount: 7,
              nodes: [],
              pageInfo: {
                endCursor: null,
                hasNextPage: false,
              },
            },
          },
        },
        fetching: false,
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

describe('ProfileReactionsPage', () => {
  test('renders the reactions total', () => {
    render(
      <MemoryRouter initialEntries={['/users/punoqun/reactions']}>
        <Routes>
          <Route
            path="/users/:slug/reactions"
            element={<ProfileReactionsPage />}
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Reactions (7)')).toBeInTheDocument();
  });
});
