import { MemoryRouter } from 'react-router';
import { describe, expect, test } from 'vitest';

import { render, screen } from 'app/test-utils/testing-library';

import MediaPersonCard from './index';

const image = {
  blurhash: null,
  views: [{ height: 100, width: 100, url: 'https://example.com/avatar.jpg' }],
};

describe('MediaPersonCard', () => {
  test('renders the name and role', () => {
    render(
      <MemoryRouter>
        <MediaPersonCard image={image} name="Spike Spiegel" role="Main" />
      </MemoryRouter>,
    );

    expect(screen.getByText('Spike Spiegel')).toBeInTheDocument();
    expect(screen.getByText('Main')).toBeInTheDocument();
  });

  test('is not a link when no `to` is given', () => {
    render(
      <MemoryRouter>
        <MediaPersonCard image={image} name="Spike Spiegel" />
      </MemoryRouter>,
    );

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  test('wraps the card in a link when `to` is given', () => {
    render(
      <MemoryRouter>
        <MediaPersonCard
          image={image}
          name="Spike Spiegel"
          to="/characters/1"
        />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link')).toHaveAttribute('href', '/characters/1');
  });
});
