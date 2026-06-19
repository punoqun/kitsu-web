import { type Meta, type StoryObj } from '@storybook/react';
import { FormattedMessage } from 'react-intl';

import Button from '@/components/controls/Button';

import { EmptyState } from './index';

export default {
  title: 'Feedback/EmptyState',
  component: EmptyState,
  parameters: {
    layout: 'centered',
    controls: { expanded: true },
  },
} satisfies Meta<typeof EmptyState>;

type Story = StoryObj<typeof EmptyState>;

export const Default = {
  name: 'Default',
} satisfies Story;

export const WithDescription = {
  name: 'With: Description',
  args: {
    title: (
      <FormattedMessage
        defaultMessage="No library entries yet"
        description="Empty state heading for an empty media library"
      />
    ),
    description: (
      <FormattedMessage
        defaultMessage="Add anime or manga to your library and they will appear here."
        description="Empty state description explaining where library entries appear"
      />
    ),
  },
} satisfies Story;

export const WithAction = {
  name: 'With: Action',
  args: {
    title: (
      <FormattedMessage
        defaultMessage="No results found"
        description="Empty state heading shown when a search has no matches"
      />
    ),
    description: (
      <FormattedMessage
        defaultMessage="Try changing your filters or searching for something else."
        description="Empty state description suggesting ways to find search results"
      />
    ),
    children: (
      <Button kind="solid" color="green">
        <FormattedMessage
          defaultMessage="Browse anime"
          description="Button label linking users to browse anime"
        />
      </Button>
    ),
  },
} satisfies Story;
