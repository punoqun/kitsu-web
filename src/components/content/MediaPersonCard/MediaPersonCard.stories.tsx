import { type Meta, type StoryObj } from '@storybook/react';

import { source as defaultAvatar } from '@/assets/default_avatar.svg?imageSource';

import MediaPersonCard from './index';

export default {
  title: 'Content/MediaPersonCard',
  component: MediaPersonCard,
  parameters: {
    layout: 'centered',
    controls: { expanded: true },
  },
} satisfies Meta<typeof MediaPersonCard>;

export const Character = {
  name: 'Character',
  args: {
    image: defaultAvatar,
    name: 'Tohru Honda',
    role: 'Main Character',
    size: 64,
  },
} satisfies StoryObj<typeof MediaPersonCard>;

export const LinkedStaff = {
  name: 'Linked Staff',
  args: {
    image: defaultAvatar,
    name: 'Natsuki Takaya',
    role: 'Original Creator',
    to: '/people/natsuki-takaya',
  },
} satisfies StoryObj<typeof MediaPersonCard>;
