import { type ComponentProps } from 'react';
import { MemoryRouter } from 'react-router';
import { describe, expect, test } from 'vitest';

import { render, screen } from 'app/test-utils/testing-library';

import EpisodeCard from './index';

type EpisodeProp = ComponentProps<typeof EpisodeCard>['episode'];

const episode = {
  id: 'episode-1',
  number: 1,
  titles: { canonical: 'Asteroid Blues' },
  releasedAt: new Date('2001-10-24T00:00:00.000Z'),
  length: 24,
  thumbnail: {
    blurhash: null,
    views: [{ height: 720, width: 1280, url: 'https://example.com/thumb.jpg' }],
  },
} as unknown as EpisodeProp;

describe('EpisodeCard', () => {
  test('renders the episode number and title', () => {
    render(
      <MemoryRouter>
        <EpisodeCard episode={episode} />
      </MemoryRouter>,
    );

    expect(screen.getByText('Episode 1')).toBeInTheDocument();
    expect(screen.getByText('Asteroid Blues')).toBeInTheDocument();
  });

  test('links to the episode when `to` is provided', () => {
    render(
      <MemoryRouter>
        <EpisodeCard episode={episode} to="/anime/cowboy-bebop/episodes/1" />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      '/anime/cowboy-bebop/episodes/1',
    );
  });

  test('shows a fallback when there is no thumbnail', () => {
    const withoutThumbnail = {
      ...(episode as object),
      thumbnail: null,
    } as unknown as EpisodeProp;

    render(
      <MemoryRouter>
        <EpisodeCard episode={withoutThumbnail} />
      </MemoryRouter>,
    );

    expect(screen.getByText('No thumbnail')).toBeInTheDocument();
  });
});
