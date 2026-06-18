import { type Meta, type StoryObj } from '@storybook/react';
import { type ComponentProps } from 'react';

import { type ResultOf } from '@/graphql/tada';

import ChapterCard, { type ChapterCardFragment } from './index';

export default {
  title: 'Components/Content/ChapterCard',
  component: ChapterCard,
  parameters: {
    layout: 'centered',
    controls: { expanded: true },
  },
} satisfies Meta<typeof ChapterCard>;

type ChapterCardStoryData = ResultOf<typeof ChapterCardFragment> &
  ComponentProps<typeof ChapterCard>['chapter'];

const chapter = {
  id: 'chapter-1',
  number: 1,
  titles: {
    canonical: 'Romance Dawn',
  },
  releasedAt: new Date('1997-07-22T00:00:00.000Z'),
  length: 50,
  thumbnail: {
    blurhash: 'L6Pj0^i_.AyE_3t7t7R**0o#DgR4',
    views: [
      {
        height: 720,
        width: 1280,
        url: 'https://media.kitsu.app/manga/poster_images/38/original.jpg',
      },
    ],
  },
} as unknown as ChapterCardStoryData;

const chapterWithoutThumbnail = {
  ...chapter,
  id: 'chapter-2',
  number: 2,
  thumbnail: null,
} as unknown as ChapterCardStoryData;

export const Default = {
  args: {
    chapter,
  },
} satisfies StoryObj<typeof ChapterCard>;

export const Linked = {
  args: {
    chapter,
    to: '/manga/one-piece/chapters/1',
  },
} satisfies StoryObj<typeof ChapterCard>;

export const MissingThumbnail = {
  args: {
    chapter: chapterWithoutThumbnail,
  },
} satisfies StoryObj<typeof ChapterCard>;
