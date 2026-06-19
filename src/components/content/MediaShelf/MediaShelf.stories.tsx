import { type Meta, type StoryObj } from '@storybook/react';
import { FormattedMessage } from 'react-intl';
import { MemoryRouter } from 'react-router';

import { source as defaultPoster } from '@/assets/default_poster.jpg?imageSource';
import MediaPosterCard from '@/components/content/MediaPosterCard';

import { MediaShelf } from './index';

const media = [
  {
    id: 'cowboy-bebop',
    posterImage: defaultPoster,
    title: 'Cowboy Bebop',
    to: '/anime/cowboy-bebop',
  },
  {
    id: 'trigun',
    posterImage: defaultPoster,
    title: 'Trigun',
    to: '/anime/trigun',
  },
  {
    id: 'monster',
    posterImage: defaultPoster,
    title: 'Monster',
    to: '/anime/monster',
  },
];

export default {
  title: 'Components/Content/MediaShelf',
  component: MediaShelf,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
  parameters: {
    controls: { expanded: true },
  },
} satisfies Meta<typeof MediaShelf>;

export const Default = {
  render: () => (
    <MediaShelf
      title={
        <FormattedMessage
          defaultMessage="Trending Anime"
          description="Storybook heading for a shelf of trending anime."
        />
      }>
      {media.map((item) => (
        <MediaPosterCard
          key={item.id}
          posterImage={item.posterImage}
          title={item.title}
          to={item.to}
        />
      ))}
    </MediaShelf>
  ),
} satisfies StoryObj<typeof MediaShelf>;
