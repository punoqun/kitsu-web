import userEvent from '@testing-library/user-event';
import { useMutation } from 'urql';
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from 'vitest';

import { render, screen, waitFor } from 'app/test-utils/testing-library';

import { CommentComposer } from './index';

vi.mock('urql', () => ({
  useMutation: vi.fn(),
  useQuery: vi.fn(),
}));

const useMutationMock = vi.mocked(useMutation);
const consoleError = console.error;

function mutationResult(execute: ReturnType<typeof vi.fn>) {
  return [{ fetching: false }, execute] as never;
}

beforeAll(() => {
  vi.spyOn(console, 'error').mockImplementation(
    (message?: unknown, ...args: unknown[]) => {
      if (String(message).includes('MISSING_TRANSLATION')) return;
      consoleError(message, ...args);
    },
  );
});

beforeEach(() => {
  useMutationMock.mockReset();
});

afterAll(() => {
  vi.restoreAllMocks();
});

describe('CommentComposer', () => {
  test('enables submit when text is entered and creates a comment', async () => {
    const user = userEvent.setup();
    const createComment = vi.fn().mockResolvedValue({
      data: {
        comment: {
          create: {
            result: { id: 'comment-1' },
            errors: [],
          },
        },
      },
    });
    const onCommented = vi.fn();
    useMutationMock.mockReturnValue(mutationResult(createComment));

    render(<CommentComposer postId="post-1" onCommented={onCommented} />);

    const textarea = screen.getByRole('textbox', { name: 'Add a comment' });
    const submitButton = screen.getByRole('button', { name: 'Post comment' });

    expect(submitButton).toBeDisabled();

    await user.type(textarea, '  This is a new comment.  ');

    expect(submitButton).toBeEnabled();

    await user.click(submitButton);

    await waitFor(() =>
      expect(createComment).toHaveBeenCalledWith({
        content: 'This is a new comment.',
        postId: 'post-1',
      }),
    );
    expect(onCommented).toHaveBeenCalledTimes(1);
    expect(textarea).toHaveValue('');
  });
});
