import userEvent from '@testing-library/user-event';
import { type ComponentProps } from 'react';
import { MemoryRouter } from 'react-router';
import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest';

import { type ResultOf } from '@/graphql/tada';
import { render, screen } from 'app/test-utils/testing-library';

import ReviewCard, { type ReviewCardFragment } from './index';

type ReviewTestData = ResultOf<typeof ReviewCardFragment> &
  ComponentProps<typeof ReviewCard>['review'];

const imageSource = {
  blurhash: null,
  views: [{ height: 300, width: 200, url: 'https://example.com/image.jpg' }],
};

const review = {
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
} as unknown as ReviewTestData;

const consoleError = console.error;

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

describe('ReviewCard', () => {
  test('renders review details and links', () => {
    render(
      <MemoryRouter>
        <ReviewCard review={review} />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: 'Cowboy Bebop' })).toBeVisible();
    expect(screen.getByText('Puno Qun')).toBeVisible();
    expect(screen.getByText('A thoughtful review.')).toBeVisible();
    expect(screen.getByText('8/10')).toBeVisible();
    expect(screen.getByRole('link', { name: 'Puno Qun' })).toHaveAttribute(
      'href',
      '/users/punoqun',
    );
  });

  test('hides spoiler reviews until revealed', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <ReviewCard
          review={
            {
              ...review,
              isSpoiler: true,
              content: 'The ending is a spoiler.',
            } as unknown as ReviewTestData
          }
        />
      </MemoryRouter>,
    );

    expect(screen.getByText('This review contains spoilers.')).toBeVisible();
    expect(screen.queryByText('The ending is a spoiler.')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Show review' }));

    expect(screen.getByText('The ending is a spoiler.')).toBeVisible();
  });
});
