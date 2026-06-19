import { type Meta, type StoryObj } from '@storybook/react';
import { type ReactNode } from 'react';

import { RouteErrorBoundary } from './index';

function ThrowingRoute(): ReactNode {
  throw new Error('The story route failed to render.');
}

export default {
  title: 'Components/RouteErrorBoundary',
  component: RouteErrorBoundary,
  parameters: {
    layout: 'centered',
    controls: { expanded: true },
  },
} satisfies Meta<typeof RouteErrorBoundary>;

type Story = StoryObj<typeof RouteErrorBoundary>;

export const Default = {
  name: 'Default',
  render: () => (
    <RouteErrorBoundary>
      <ThrowingRoute />
    </RouteErrorBoundary>
  ),
} satisfies Story;
