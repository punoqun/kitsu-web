import { type Meta, type StoryObj } from '@storybook/react';
import { BsExclamationCircle, BsShieldCheck } from 'react-icons/bs';

import TextInput from './index';

const meta = {
  title: 'Controls/TextInput',
  component: TextInput,

  argTypes: {
    label: {
      control: {
        type: 'text',
      },
    },
  },

  parameters: {
    layout: 'centered',

    controls: {
      expanded: true,
    },
  },
} satisfies Meta<typeof TextInput>;

export default meta;

type Story = StoryObj<typeof TextInput>;

export const Unfilled = {
  args: {
    label: 'Username',
  },
  render: (args) => {
    return (
      <TextInput
        style={{
          width: '400px',
        }}
        {...args}
      />
    );
  },

  name: 'Unfilled',

  parameters: {
    layout: 'centered',
  },
} satisfies Story;

export const InvalidEmail = {
  args: {
    defaultValue: 'nuck@kitsu.app',
    label: 'Email Address',
    validation: {
      type: 'invalid',
      icon: () => <BsExclamationCircle />,
      message: 'There is already an account with this email.',
    },
  },
  render: (args) => {
    return (
      <TextInput
        style={{
          width: '400px',
        }}
        {...args}
      />
    );
  },

  name: 'Invalid Email',

  parameters: {
    layout: 'centered',
  },
} satisfies Story;

export const ValidPassword = {
  args: {
    defaultValue: 'correct horse battery staple',
    label: 'Password',
    type: 'password',
    validation: {
      type: 'valid',
      icon: () => <BsShieldCheck />,
      message: "Woah, that's an excellent password!",
    },
  },
  render: (args) => {
    return (
      <TextInput
        style={{
          width: '400px',
        }}
        {...args}
      />
    );
  },

  name: 'Valid Password',

  parameters: {
    layout: 'centered',
  },
} satisfies Story;

export const Search = {
  args: {
    defaultValue: 'Attack on Titan',
    label: 'Search for Anime or Manga...',
    type: 'search',
  },
  render: (args) => {
    return (
      <TextInput
        style={{
          width: '400px',
        }}
        {...args}
      />
    );
  },

  name: 'Search',

  parameters: {
    layout: 'centered',
  },
} satisfies Story;

export const Month = {
  args: {
    defaultValue: 'Junuary',
    label: 'Month',
    type: 'month',
  },
  render: (args) => {
    return (
      <TextInput
        style={{
          width: '400px',
        }}
        {...args}
      />
    );
  },

  name: 'Month',

  parameters: {
    layout: 'centered',
  },
} satisfies Story;
