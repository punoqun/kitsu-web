import { type Meta, type StoryObj } from '@storybook/react';
import { type ComponentProps } from 'react';
import { MemoryRouter } from 'react-router';

import { type ResultOf } from '@/graphql/tada';

import ProfileCard, { type ProfileCardFragment } from './index';

export default {
  title: 'Content/ProfileCard',
  component: ProfileCard,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
  parameters: {
    layout: 'centered',
    controls: { expanded: true },
  },
} satisfies Meta<typeof ProfileCard>;

type ProfileCardStoryData = ResultOf<typeof ProfileCardFragment> &
  ComponentProps<typeof ProfileCard>['profile'];

const avatarImage = {
  blurhash: null,
  views: [
    {
      height: 200,
      width: 200,
      url: 'https://example.com/profile.jpg',
    },
  ],
};

const profile = {
  id: '1',
  slug: 'punoqun',
  name: 'Puno Qun',
  about:
    'Anime fan, community member, and curator of an ever-growing watchlist.',
  avatarImage,
} as unknown as ProfileCardStoryData;

export const Default = {
  name: 'Default',
  args: {
    profile,
  },
} satisfies StoryObj<typeof ProfileCard>;

export const WithoutBio = {
  name: 'Without Bio',
  args: {
    profile: {
      ...profile,
      id: '2',
      slug: 'quiet-fan',
      name: 'Quiet Fan',
      about: null,
    } as unknown as ProfileCardStoryData,
  },
} satisfies StoryObj<typeof ProfileCard>;
