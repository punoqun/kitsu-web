import { type Meta, type StoryObj } from '@storybook/react';
import { type ComponentProps } from 'react';
import { type ResultOf } from '@/graphql';

import Reaction, { type ReactionCardFragment } from './index';

export default {
  title: 'Components/Reaction',
  component: Reaction,
  parameters: {
    layout: 'centered',
    controls: { expanded: true },
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/7KLXsWEmbIbkNy9CnFA0Ke/Kitsu-Web-V4?node-id=62%3A224',
    },
  },
} satisfies Meta<typeof Reaction>;

type ReactionStoryData = ResultOf<typeof ReactionCardFragment> &
  ComponentProps<typeof Reaction>['reaction'];

const unlikedReaction = {
  id: '1',
  author: {
    id: '52786',
    slug: 'marizu',
    name: 'マリズ',
    avatarImage: {
      blurhash:
        'nkJj}9jG-oV@s:~pV@k9RjRkSPoeRjayofM|oyjZf6t7t6j[f6WCayxaazWBa#WB',
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
    id: '1',
    slug: 'cory-white-house-de-chou-taihen',
    titles: {
      preferred: 'Cory White House de Chou Taihen',
    },
  },
  reaction: "It's like Kore wa Sou Raven desu but better.",
  createdAt: new Date(2020, 6, 1),
  likes: {
    totalCount: 420,
  },
  hasLiked: false,
} as unknown as ReactionStoryData;

const likedReaction = {
  ...unlikedReaction,
  hasLiked: true,
} as unknown as ReactionStoryData;

export const Unliked = {
  name: 'Unliked',
  args: {
    reaction: unlikedReaction,
  },
} satisfies StoryObj<typeof Reaction>;

export const Liked = {
  name: 'Liked',
  args: {
    reaction: likedReaction,
  },
} satisfies StoryObj<typeof Reaction>;
