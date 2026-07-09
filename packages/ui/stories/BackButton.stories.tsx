import type { Meta, StoryObj } from '@storybook/react'
import { BackButton } from '../src/components/ui/back-button'

const meta = {
  title: 'Example/BackButton',
  component: BackButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'circle'],
    },
    disabled: {
      control: { type: 'boolean' },
    },
    ariaLabel: {
      control: { type: 'text' },
    },
  },
} satisfies Meta<typeof BackButton>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    variant: 'default',
    onClick: () => alert('Back clicked'),
  },
}

export const Circle: Story = {
  args: {
    variant: 'circle',
    onClick: () => alert('Back clicked'),
  },
}

export const Disabled: Story = {
  args: {
    variant: 'default',
    disabled: true,
    onClick: () => alert('Back clicked'),
  },
}
