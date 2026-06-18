import { type Meta, type StoryObj } from '@storybook/react';
import React from 'react';

import NotFoundPage from './index';

const meta = {
  title: 'Pages/Errors/Not Found',
  component: NotFoundPage,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof NotFoundPage>;

export default meta;

type Story = StoryObj<typeof NotFoundPage>;

export const NotFound = {
  render: () => <NotFoundPage />,
} satisfies Story;
