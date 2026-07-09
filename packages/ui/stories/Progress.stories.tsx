import type { Meta, StoryObj } from '@storybook/react'
import { Progress } from '../src/components/ui/progress'

const meta = {
  title: 'Components/Progress',
  component: Progress,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Progress>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="w-[400px]">
      <Progress value={33} />
    </div>
  ),
}

export const HalfComplete: Story = {
  render: () => (
    <div className="w-[400px]">
      <Progress value={50} />
    </div>
  ),
}

export const AlmostComplete: Story = {
  render: () => (
    <div className="w-[400px]">
      <Progress value={75} />
    </div>
  ),
}

export const Complete: Story = {
  render: () => (
    <div className="w-[400px]">
      <Progress value={100} />
    </div>
  ),
}

export const WithLabel: Story = {
  render: () => (
    <div className="w-[400px] space-y-2">
      <div className="flex justify-between text-sm">
        <span>Loading...</span>
        <span>66%</span>
      </div>
      <Progress value={66} />
    </div>
  ),
}
