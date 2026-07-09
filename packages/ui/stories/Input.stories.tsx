import type { Meta, StoryObj } from '@storybook/react'
import { Input } from '../src/components/ui/input'

const meta = {
  title: 'Components/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: { type: 'select' },
      options: ['text', 'email', 'password', 'number', 'tel', 'url'],
    },
    disabled: {
      control: { type: 'boolean' },
    },
  },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
}

export const WithValue: Story = {
  args: {
    value: 'Sample text',
    placeholder: 'Enter text...',
  },
}

export const Email: Story = {
  args: {
    type: 'email',
    placeholder: 'Enter your email...',
  },
}

export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'Enter your password...',
  },
}

export const Disabled: Story = {
  args: {
    placeholder: 'Disabled input',
    disabled: true,
  },
}

export const WithError: Story = {
  args: {
    placeholder: 'Enter text...',
    'aria-invalid': true,
  },
}

export const Number: Story = {
  args: {
    type: 'number',
    placeholder: 'Enter a number...',
  },
}

export const FullWidth: Story = {
  render: () => (
    <div className="w-[400px]">
      <Input placeholder="Full width input" />
    </div>
  ),
}
