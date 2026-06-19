import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';

import { render, screen } from 'app/test-utils/testing-library';

import { ErrorState } from './index';

describe('ErrorState', () => {
  test('renders the default heading', () => {
    render(<ErrorState />);

    expect(
      screen.getByRole('heading', { name: 'Something went wrong' }),
    ).toBeInTheDocument();
  });

  test('calls onRetry when the retry button is clicked', async () => {
    const onRetry = vi.fn();

    render(<ErrorState onRetry={onRetry} />);

    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(onRetry).toHaveBeenCalledOnce();
  });
});
