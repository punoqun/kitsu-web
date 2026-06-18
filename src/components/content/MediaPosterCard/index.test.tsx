import { MemoryRouter } from 'react-router';
import { describe, expect, test } from 'vitest';

import { render, screen } from 'app/test-utils/testing-library';

import MediaPosterCard from './index';

const posterImage = {
  blurhash: null,
  views: [{ height: 300, width: 200, url: 'https://example.com/poster.jpg' }],
};

describe('MediaPosterCard', () => {
  test('renders the title inside a link to the destination', () => {
    render(
      <MemoryRouter>
        <MediaPosterCard
          posterImage={posterImage}
          title="Cowboy Bebop"
          to="/anime/cowboy-bebop"
        />
      </MemoryRouter>,
    );

    expect(screen.getByText('Cowboy Bebop')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      '/anime/cowboy-bebop',
    );
  });
});
