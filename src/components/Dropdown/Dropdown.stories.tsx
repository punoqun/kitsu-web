import { type Meta, type StoryObj } from '@storybook/react';
import React from 'react';
import { FaEllipsisH } from 'react-icons/fa';

import {
  Item as DropdownItem,
  ItemLink as DropdownItemLink,
  Menu as DropdownMenu,
  Toggle as DropdownToggle,
  Wrapper as DropdownWrapper,
} from './index';

const meta = {
  title: 'Components/Dropdown',
  component: DropdownWrapper,
  parameters: {
    layout: 'centered',
  },
  subcomponents: {
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
    DropdownItemLink,
  },
} satisfies Meta<typeof DropdownWrapper>;

export default meta;

type Story = StoryObj<typeof DropdownWrapper>;

export const Basic = {
  args: {
    arrow: true,
  },
  render: (args) => (
    <DropdownWrapper {...args} popperOptions={{ placement: 'bottom' }}>
      <DropdownToggle>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid var(--purple)',
            color: 'var(--purple)',
            borderRadius: 50,
            height: 50,
            width: 50,
          }}>
          <FaEllipsisH />
        </div>
      </DropdownToggle>
      <DropdownMenu>
        <DropdownItem>Item 1</DropdownItem>
        <DropdownItem>Item 2</DropdownItem>
      </DropdownMenu>
    </DropdownWrapper>
  ),
} satisfies Story;
