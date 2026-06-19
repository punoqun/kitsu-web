import { type Meta, type StoryObj } from '@storybook/react';

import { ErrorState } from './index';

export default {
  title: 'Feedback/ErrorState',
  component: ErrorState,
  parameters: {
    layout: 'centered',
    controls: { expanded: true },
  },
} satisfies Meta<typeof ErrorState>;

type Story = StoryObj<typeof ErrorState>;

export const Default = {
  name: 'Default',
} satisfies Story;

export const WithRetry = {
  name: 'With: Retry',
  args: {
    error: new Error('The route failed to load.'),
    onRetry: () => undefined,
  },
} satisfies Story;
