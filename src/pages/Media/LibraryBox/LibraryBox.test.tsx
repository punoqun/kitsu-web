import userEvent from '@testing-library/user-event';
import { useMutation } from 'urql';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { render, screen, waitFor } from 'app/test-utils/testing-library';

import LibraryBox, { type LibraryBoxParams } from './index';

vi.mock('@sentry/react', () => ({ captureException: vi.fn() }));
vi.mock('urql', () => ({
  useMutation: vi.fn(),
  useQuery: vi.fn(),
}));

const useMutationMock = vi.mocked(useMutation);

function mutationResult(execute: ReturnType<typeof vi.fn>) {
  return [{ fetching: false }, execute] as never;
}

function animeMedia(myLibraryEntry: unknown = null) {
  return {
    id: 'anime-1',
    type: 'ANIME',
    myLibraryEntry,
  } as unknown as LibraryBoxParams['media'];
}

beforeEach(() => {
  useMutationMock.mockReset();
});

describe('LibraryBox', () => {
  test('creates a planned library entry from the add box', async () => {
    const user = userEvent.setup();
    const createLibraryEntry = vi.fn().mockResolvedValue({
      data: { libraryEntry: { create: { errors: [] } } },
    });
    useMutationMock.mockReturnValue(mutationResult(createLibraryEntry));

    render(<LibraryBox media={animeMedia()} />);

    await user.click(screen.getByRole('button', { name: 'Want to Watch' }));

    await waitFor(() =>
      expect(createLibraryEntry).toHaveBeenCalledWith({
        mediaId: 'anime-1',
        mediaType: 'ANIME',
        status: 'PLANNED',
      }),
    );
  });

  test('updates status, progress, rating, and delete from the edit box', async () => {
    const user = userEvent.setup();
    const updateStatus = vi.fn().mockResolvedValue({
      data: { libraryEntry: { update: { errors: [] } } },
    });
    const updateProgress = vi.fn().mockResolvedValue({
      data: { libraryEntry: { update: { errors: [] } } },
    });
    const updateRating = vi.fn().mockResolvedValue({
      data: { libraryEntry: { update: { errors: [] } } },
    });
    const deleteLibraryEntry = vi.fn().mockResolvedValue({
      data: { libraryEntry: { delete: { errors: [] } } },
    });
    useMutationMock
      .mockReturnValueOnce(mutationResult(updateStatus))
      .mockReturnValueOnce(mutationResult(updateProgress))
      .mockReturnValueOnce(mutationResult(updateRating))
      .mockReturnValueOnce(mutationResult(deleteLibraryEntry));

    render(
      <LibraryBox
        media={animeMedia({
          id: 'entry-1',
          status: 'CURRENT',
          progress: 3,
          rating: null,
          reconsumeCount: 0,
          reconsuming: false,
          media: { __typename: 'Anime', id: 'anime-1' },
        })}
      />,
    );

    expect(screen.getByText('Current status: Watching')).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText('Status'), 'COMPLETED');
    expect(updateStatus).toHaveBeenCalledWith({
      id: 'entry-1',
      status: 'COMPLETED',
    });

    await user.click(screen.getByRole('button', { name: 'Increase Progress' }));
    expect(updateProgress).toHaveBeenCalledWith({
      id: 'entry-1',
      progress: 4,
    });

    await user.selectOptions(screen.getByLabelText('Rating'), '20');
    expect(updateRating).toHaveBeenCalledWith({ id: 'entry-1', rating: 20 });

    await user.click(
      screen.getByRole('button', { name: 'Remove from Library' }),
    );
    expect(deleteLibraryEntry).toHaveBeenCalledWith({ id: 'entry-1' });
  });
});
