import { type Meta, type StoryObj } from '@storybook/react';
import { type ComponentProps } from 'react';

import { type ResultOf } from '@/graphql/tada';

import ReviewCard, { type ReviewCardFragment } from './index';

export default {
  title: 'Content/ReviewCard',
  component: ReviewCard,
  parameters: {
    status: {
      type: 'completed',
    },
    layout: 'centered',
  },
} satisfies Meta<typeof ReviewCard>;

type ReviewStoryData = ResultOf<typeof ReviewCardFragment> &
  ComponentProps<typeof ReviewCard>['review'];

const posterImage = {
  blurhash: null,
  views: [{ height: 300, width: 200, url: 'https://example.com/poster.jpg' }],
};

const defaultReview = {
  id: 'review-1',
  content:
    'A thoughtful character story with a beautiful soundtrack and memorable finale.',
  createdAt: new Date(2025, 5, 1),
  isSpoiler: false,
  rating: 16,
  author: {
    id: '52786',
    slug: 'marizu',
    name: 'マリズ',
    avatarImage: {
      blurhash: null,
      views: [
        {
          height: 100,
          width: 100,
          url: 'https://media.kitsu.app/users/avatars/52786/medium.jpeg',
        },
      ],
    },
  },
  media: {
    __typename: 'Anime',
    id: '1',
    slug: 'cowboy-bebop',
    titles: {
      preferred: 'Cowboy Bebop',
    },
    posterImage,
  },
} as unknown as ReviewStoryData;

export const Default = {
  name: 'Default',
  args: {
    review: defaultReview,
  },
} satisfies StoryObj<typeof ReviewCard>;

export const Spoiler = {
  name: 'Spoiler',
  args: {
    review: {
      ...defaultReview,
      id: 'review-2',
      isSpoiler: true,
      content:
        'The ending reframes the whole story and changes how the main character sees the crew.',
    } as unknown as ReviewStoryData,
  },
} satisfies StoryObj<typeof ReviewCard>;
