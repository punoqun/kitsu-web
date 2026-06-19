import { RouterProvider, createMemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { render, screen } from 'app/test-utils/testing-library';

import PostPage, { PostPageQuery } from './index';

const { useQueryMock } = vi.hoisted(() => ({
  useQueryMock: vi.fn(),
}));

vi.mock('urql', () => ({
  useQuery: useQueryMock,
}));

const avatarImage = {
  blurhash: null,
  views: [{ height: 48, width: 48, url: 'https://example.com/avatar.png' }],
};

function renderPostPage() {
  const router = createMemoryRouter(
    [{ path: '/posts/:id', element: <PostPage /> }],
    { initialEntries: ['/posts/post-1'] },
  );

  render(<RouterProvider router={router} />);
}

describe('PostPage', () => {
  let consoleErrorMock: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    useQueryMock.mockReset();
    consoleErrorMock = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
  });

  afterEach(() => {
    consoleErrorMock.mockRestore();
  });

  test('renders the post and its comments', () => {
    useQueryMock.mockReturnValue([
      {
        data: {
          findPostById: {
            id: 'post-1',
            content: 'This is the post body.',
            contentFormatted: '<p>This is the post body.</p>',
            createdAt: new Date('2026-06-01T00:00:00Z'),
            author: {
              id: 'profile-1',
              slug: 'post-author',
              name: 'Post Author',
              avatarImage,
            },
            likes: {
              totalCount: 3,
            },
            comments: {
              totalCount: 2,
              nodes: [
                {
                  id: 'comment-1',
                  content: 'First comment body.',
                  contentFormatted: '<p>First comment body.</p>',
                  createdAt: new Date('2026-06-02T00:00:00Z'),
                  author: {
                    id: 'profile-2',
                    slug: 'comment-author',
                    name: 'Comment Author',
                    avatarImage,
                  },
                  likes: {
                    totalCount: 1,
                  },
                  replies: {
                    totalCount: 0,
                  },
                },
                {
                  id: 'comment-2',
                  content: 'Second comment body.',
                  contentFormatted: '<p>Second comment body.</p>',
                  createdAt: new Date('2026-06-03T00:00:00Z'),
                  author: {
                    id: 'profile-3',
                    slug: 'second-comment-author',
                    name: 'Second Comment Author',
                    avatarImage,
                  },
                  likes: {
                    totalCount: 2,
                  },
                  replies: {
                    totalCount: 1,
                  },
                },
              ],
            },
          },
        },
      },
    ]);

    renderPostPage();

    expect(useQueryMock).toHaveBeenCalledWith({
      query: PostPageQuery,
      variables: { id: 'post-1' },
    });
    expect(screen.getByText('Post Author')).toBeInTheDocument();
    expect(screen.getByText('This is the post body.')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '2 comments' })).toBeInTheDocument();
    expect(screen.getByText('First comment body.')).toBeInTheDocument();
    expect(screen.getByText('Second comment body.')).toBeInTheDocument();
  });
});
