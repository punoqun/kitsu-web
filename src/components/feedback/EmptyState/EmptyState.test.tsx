import { describe, expect, test } from 'vitest';

import { render, screen } from 'app/test-utils/testing-library';

import { EmptyState } from './index';

describe('EmptyState', () => {
  test('renders the title and action', () => {
    render(
      <EmptyState title="No favorites yet">
        <button>Browse anime</button>
      </EmptyState>,
    );

    expect(screen.getByRole('heading', { name: 'No favorites yet' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Browse anime' })).toBeInTheDocument();
  });
});
