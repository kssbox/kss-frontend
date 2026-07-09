import type { Meta, StoryObj } from '@storybook/react'
import { toast, Toaster } from '../src/components/ui/sonner'
import { Button } from '../src/components/ui/button'

const meta = {
  title: 'Components/Sonner',
  component: Toaster,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Toaster>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div>
      <Toaster />
      <Button onClick={() => toast('This is a toast message')}>
        Show Toast
      </Button>
    </div>
  ),
}

export const Success: Story = {
  render: () => (
    <div>
      <Toaster />
      <Button onClick={() => toast.success('Successfully saved!')}>
        Success Toast
      </Button>
    </div>
  ),
}

export const Error: Story = {
  render: () => (
    <div>
      <Toaster />
      <Button onClick={() => toast.error('Something went wrong!')}>
        Error Toast
      </Button>
    </div>
  ),
}
