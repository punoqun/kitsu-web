import type { StorybookConfig } from '@storybook/react-vite';

export default {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.tsx'],

  addons: [
    '@storybook/addon-links',
    '@storybook/addon-docs',
    '@storybook/addon-designs',
    '@storybook/addon-a11y',
    '@etchteam/storybook-addon-status',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    docsMode: true,
  },
} satisfies StorybookConfig;
