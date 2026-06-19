import { type Meta, type StoryObj } from '@storybook/react';
import { type ComponentProps } from 'react';

import { source as defaultPoster } from '@/assets/default_poster.jpg?imageSource';
import { type ResultOf } from '@/graphql/tada';

import LibraryEntryCard, { type LibraryEntryCardFragment } from './index';

export default {
  title: 'Components/Content/LibraryEntryCard',
  component: LibraryEntryCard,
  parameters: {
    layout: 'centered',
    controls: { expanded: true },
  },
} satisfies Meta<typeof LibraryEntryCard>;

type LibraryEntryCardStoryData = ResultOf<typeof LibraryEntryCardFragment> &
  ComponentProps<typeof LibraryEntryCard>['entry'];

const entry = {
  id: 'library-entry-1',
  status: 'CURRENT',
  progress: 12,
  rating: 18,
  reconsumeCount: 1,
  updatedAt: new Date('2026-06-19T00:00:00.000Z'),
  media: {
    __typename: 'Anime',
    id: 'anime-1',
    slug: 'cowboy-bebop',
    titles: {
      canonical: 'Cowboy Bebop',
      preferred: 'Cowboy Bebop',
    },
    posterImage: defaultPoster,
  },
} as unknown as LibraryEntryCardStoryData;

export const Default = {
  args: {
    entry,
  },
} satisfies StoryObj<typeof LibraryEntryCard>;
