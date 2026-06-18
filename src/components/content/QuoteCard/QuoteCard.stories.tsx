import { type Meta, type StoryObj } from '@storybook/react';
import { type ComponentProps } from 'react';

import { type ResultOf } from '@/graphql/tada';

import QuoteCard, { type QuoteCardFragment } from './index';

export default {
  title: 'Content/QuoteCard',
  component: QuoteCard,
  parameters: {
    layout: 'centered',
    controls: { expanded: true },
  },
} satisfies Meta<typeof QuoteCard>;

type QuoteCardStoryData = ResultOf<typeof QuoteCardFragment> &
  ComponentProps<typeof QuoteCard>['quote'];

const quote = {
  id: 'quote-1',
  lines: {
    nodes: [
      {
        id: 'quote-line-1',
        content:
          "I'm not going there to die. I'm going to find out if I'm really alive.",
        character: {
          id: 'character-1',
          slug: 'spike-spiegel',
          names: {
            canonical: 'Spike Spiegel',
          },
          image: null,
        },
      },
      {
        id: 'quote-line-2',
        content: 'Whatever happens, happens.',
        character: {
          id: 'character-2',
          slug: 'faye-valentine',
          names: {
            canonical: 'Faye Valentine',
          },
          image: null,
        },
      },
    ],
  },
} as unknown as QuoteCardStoryData;

export const Default = {
  name: 'Default',
  args: {
    quote,
  },
} satisfies StoryObj<typeof QuoteCard>;

export const Detail = {
  name: 'Detail',
  args: {
    quote,
    variant: 'detail',
  },
} satisfies StoryObj<typeof QuoteCard>;
