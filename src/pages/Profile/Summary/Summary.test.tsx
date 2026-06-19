import { MemoryRouter, Route, Routes } from 'react-router';
import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest';

import { render, screen } from 'app/test-utils/testing-library';

import ProfileSummaryPage from './index';

const consoleError = console.error;

vi.mock('urql', () => {
  const imageSource = {
    blurhash: null,
    views: [
      { height: 200, width: 200, url: 'https://example.com/profile.jpg' },
    ],
  };

  return {
    useQuery: () => [
      {
        data: {
          findProfile: {
            id: '1',
            slug: 'punoqun',
            name: 'Puno Qun',
            about: 'Anime fan and community member.',
            avatarImage: imageSource,
            bannerImage: imageSource,
            followers: { totalCount: 12 },
            following: { totalCount: 8 },
            mediaReactions: { totalCount: 5 },
            reviews: { totalCount: 3 },
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

describe('ProfileSummaryPage', () => {
  test('renders the profile name', () => {
    render(
      <MemoryRouter initialEntries={['/users/punoqun']}>
        <Routes>
          <Route path="/users/:slug" element={<ProfileSummaryPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Puno Qun')).toBeInTheDocument();
  });
});
