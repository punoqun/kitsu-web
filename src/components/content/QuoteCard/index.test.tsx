import { type ComponentProps } from 'react';
import { MemoryRouter } from 'react-router';
import { describe, expect, test } from 'vitest';

import { render, screen } from 'app/test-utils/testing-library';

import QuoteCard from './index';

type QuoteProp = ComponentProps<typeof QuoteCard>['quote'];

const character = {
  id: 'character-1',
  slug: 'spike-spiegel',
  names: { canonical: 'Spike Spiegel' },
  image: {
    blurhash: null,
    views: [{ height: 100, width: 100, url: 'https://example.com/c.jpg' }],
  },
};

const quote = {
  id: 'quote-1',
  lines: {
    nodes: [{ id: 'line-1', content: 'Whatever happens, happens.', character }],
  },
} as unknown as QuoteProp;

describe('QuoteCard', () => {
  test('renders the quote line and speaker', () => {
    render(
      <MemoryRouter>
        <QuoteCard quote={quote} />
      </MemoryRouter>,
    );

    expect(screen.getByText('Whatever happens, happens.')).toBeInTheDocument();
    expect(screen.getByText('Spike Spiegel')).toBeInTheDocument();
  });

  test('links to the quote when `to` is provided', () => {
    render(
      <MemoryRouter>
        <QuoteCard quote={quote} to="/anime/cowboy-bebop/quotes/quote-1" />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      '/anime/cowboy-bebop/quotes/quote-1',
    );
  });
});
