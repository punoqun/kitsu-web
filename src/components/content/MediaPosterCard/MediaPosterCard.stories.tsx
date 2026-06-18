import { type Meta, type StoryObj } from '@storybook/react';

import { source as defaultPoster } from '@/assets/default_poster.jpg?imageSource';

import MediaPosterCard from './index';

export default {
  title: 'Content/MediaPosterCard',
  component: MediaPosterCard,
  parameters: {
    status: {
      type: 'completed',
    },
    layout: 'centered',
  },
} satisfies Meta<typeof MediaPosterCard>;

export const Default = {
  name: 'Default',
  args: {
    posterImage: defaultPoster,
    title: 'Cowboy Bebop',
    to: '/anime/cowboy-bebop',
  },
} satisfies StoryObj<typeof MediaPosterCard>;
