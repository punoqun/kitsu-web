import { FormattedMessage } from 'react-intl';
import { MemoryRouter } from 'react-router';
import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest';

import MediaPosterCard from '@/components/content/MediaPosterCard';
import { render, screen } from 'app/test-utils/testing-library';

import { MediaShelf } from './index';

const posterImage = {
  blurhash: null,
  views: [{ height: 300, width: 200, url: 'https://example.com/poster.jpg' }],
};

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

describe('MediaShelf', () => {
  test('renders a labelled horizontal list of poster cards', () => {
    render(
      <MemoryRouter>
        <MediaShelf
          title={
            <FormattedMessage
              defaultMessage="Trending Anime"
              description="Heading for trending anime media in a shelf."
            />
          }>
          <MediaPosterCard
            posterImage={posterImage}
            title="Cowboy Bebop"
            to="/anime/cowboy-bebop"
          />
        </MediaShelf>
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('region', { name: 'Trending Anime' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('list')).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('link', { name: /Cowboy Bebop/ })).toHaveAttribute(
      'href',
      '/anime/cowboy-bebop',
    );
  });

  test('renders an empty state when no children are provided', () => {
    render(
      <MediaShelf
        title={
          <FormattedMessage
            defaultMessage="Trending Manga"
            description="Heading for trending manga media in a shelf."
          />
        }
        empty={
          <FormattedMessage
            defaultMessage="No manga is trending right now."
            description="Empty state for a shelf without trending manga."
          />
        }
      />,
    );

    expect(
      screen.getByText('No manga is trending right now.'),
    ).toBeInTheDocument();
  });
});
