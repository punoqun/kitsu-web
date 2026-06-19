import { RouterProvider, createMemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { render, screen } from 'app/test-utils/testing-library';

import CommentPage from './index';

function renderCommentPage() {
  const router = createMemoryRouter(
    [{ path: '/comments/:id', element: <CommentPage /> }],
    { initialEntries: ['/comments/comment-1'] },
  );

  render(<RouterProvider router={router} />);
}

describe('CommentPage', () => {
  let consoleErrorMock: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleErrorMock = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
  });

  afterEach(() => {
    consoleErrorMock.mockRestore();
  });

  test('renders the schema gap placeholder', () => {
    renderCommentPage();

    expect(
      screen.getByRole('heading', { name: 'Comment details are unavailable' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Comment comment-1 cannot be loaded/)).toBeInTheDocument();
  });
});
