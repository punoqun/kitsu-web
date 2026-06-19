import { type ComponentProps } from 'react';
import { MemoryRouter } from 'react-router';
import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest';

import { render, screen } from 'app/test-utils/testing-library';

import LibraryEntryCard from './index';

const consoleError = console.error;

type EntryProp = ComponentProps<typeof LibraryEntryCard>['entry'];

const posterImage = {
  blurhash: null,
  views: [{ height: 300, width: 200, url: 'https://example.com/poster.jpg' }],
};

const entry = {
  id: 'library-entry-1',
  status: 'CURRENT',
  progress: 12,
  rating: 18,
  reconsumeCount: 1,
  updatedAt: new Date('2026-06-19T00:00:00.000Z'),
  media: {
    __typename: 'Anime',
    id: 'anime-1',
    slug: 'cowboy-bebop',
    titles: {
      canonical: 'Cowboy Bebop',
      preferred: 'Cowboy Bebop',
    },
    posterImage,
  },
} as unknown as EntryProp;

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

describe('LibraryEntryCard', () => {
  test('renders the media title, rating, progress, and link', () => {
    render(
      <MemoryRouter>
        <LibraryEntryCard entry={entry} />
      </MemoryRouter>,
    );

    expect(screen.getByText('Cowboy Bebop')).toBeInTheDocument();
    expect(screen.getByText('9/10')).toBeInTheDocument();
    expect(screen.getByText('Progress 12')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      '/anime/cowboy-bebop',
    );
  });
});
