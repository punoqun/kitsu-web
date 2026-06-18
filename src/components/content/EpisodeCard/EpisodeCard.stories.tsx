import { type Meta, type StoryObj } from '@storybook/react';
import { type ComponentProps } from 'react';

import { type ResultOf } from '@/graphql/tada';

import EpisodeCard, { type EpisodeCardFragment } from './index';

export default {
  title: 'Components/Content/EpisodeCard',
  component: EpisodeCard,
  parameters: {
    layout: 'centered',
    controls: { expanded: true },
  },
} satisfies Meta<typeof EpisodeCard>;

type EpisodeCardStoryData = ResultOf<typeof EpisodeCardFragment> &
  ComponentProps<typeof EpisodeCard>['episode'];

const episode = {
  id: 'episode-1',
  number: 1,
  titles: {
    canonical: 'Enter Naruto Uzumaki!',
  },
  releasedAt: new Date('2002-10-03T00:00:00.000Z'),
  length: 24,
  thumbnail: {
    blurhash: 'L6Pj0^i_.AyE_3t7t7R**0o#DgR4',
    views: [
      {
        height: 720,
        width: 1280,
        url: 'https://media.kitsu.app/anime/poster_images/11/original.jpg',
      },
    ],
  },
} as unknown as EpisodeCardStoryData;

const episodeWithoutThumbnail = {
  ...episode,
  id: 'episode-2',
  number: 2,
  thumbnail: null,
} as unknown as EpisodeCardStoryData;

export const Default = {
  args: {
    episode,
  },
} satisfies StoryObj<typeof EpisodeCard>;

export const Linked = {
  args: {
    episode,
    to: '/anime/naruto/episodes/1',
  },
} satisfies StoryObj<typeof EpisodeCard>;

export const MissingThumbnail = {
  args: {
    episode: episodeWithoutThumbnail,
  },
} satisfies StoryObj<typeof EpisodeCard>;
