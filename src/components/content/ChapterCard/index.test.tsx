import { type ComponentProps } from 'react';
import { MemoryRouter } from 'react-router';
import { describe, expect, test } from 'vitest';

import { render, screen } from 'app/test-utils/testing-library';

import ChapterCard from './index';

type ChapterProp = ComponentProps<typeof ChapterCard>['chapter'];

const chapter = {
  id: 'chapter-1',
  number: 1,
  titles: { canonical: 'Romance Dawn' },
  releasedAt: new Date('1997-07-22T00:00:00.000Z'),
  length: 50,
  thumbnail: {
    blurhash: null,
    views: [{ height: 720, width: 1280, url: 'https://example.com/thumb.jpg' }],
  },
} as unknown as ChapterProp;

describe('ChapterCard', () => {
  test('renders the chapter number and title', () => {
    render(
      <MemoryRouter>
        <ChapterCard chapter={chapter} />
      </MemoryRouter>,
    );

    expect(screen.getByText('Chapter 1')).toBeInTheDocument();
    expect(screen.getByText('Romance Dawn')).toBeInTheDocument();
  });

  test('links to the chapter when `to` is provided', () => {
    render(
      <MemoryRouter>
        <ChapterCard chapter={chapter} to="/manga/one-piece/chapters/1" />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      '/manga/one-piece/chapters/1',
    );
  });

  test('shows a fallback when there is no thumbnail', () => {
    const withoutThumbnail = {
      ...(chapter as object),
      thumbnail: null,
    } as unknown as ChapterProp;

    render(
      <MemoryRouter>
        <ChapterCard chapter={withoutThumbnail} />
      </MemoryRouter>,
    );

    expect(screen.getByText('No thumbnail')).toBeInTheDocument();
  });
});
