import { type ReactNode } from 'react';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { render, screen } from 'app/test-utils/testing-library';

import { RouteErrorBoundary } from './index';

function ThrowingRoute(): ReactNode {
  throw new Error('The route failed to render.');
}

describe('RouteErrorBoundary', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('renders the fallback when a child throws', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    render(
      <RouteErrorBoundary>
        <ThrowingRoute />
      </RouteErrorBoundary>,
    );

    expect(
      screen.getByRole('heading', { name: 'Something went wrong' }),
    ).toBeInTheDocument();
  });
});
