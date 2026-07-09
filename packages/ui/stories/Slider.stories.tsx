import type { Meta, StoryObj } from '@storybook/react'
import { Slider } from '../src/components/ui/slider'

const meta = {
  title: 'Components/Slider',
  component: Slider,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Slider>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="w-[400px]">
      <Slider defaultValue={[50]} max={100} step={1} />
    </div>
  ),
}

export const WithRange: Story = {
  render: () => (
    <div className="w-[400px]">
      <Slider defaultValue={[25, 75]} max={100} step={1} />
    </div>
  ),
}

export const CustomStep: Story = {
  render: () => (
    <div className="w-[400px] space-y-4">
      <div>
        <label className="text-sm font-medium">Step: 10</label>
        <Slider defaultValue={[50]} max={100} step={10} className="mt-2" />
      </div>
    </div>
  ),
}

export const WithLabel: Story = {
  render: () => (
    <div className="w-[400px] space-y-2">
      <div className="flex justify-between text-sm">
        <label>Volume</label>
        <span>50%</span>
      </div>
      <Slider defaultValue={[50]} max={100} step={1} />
    </div>
  ),
}

export const Disabled: Story = {
  render: () => (
    <div className="w-[400px]">
      <Slider defaultValue={[50]} max={100} step={1} disabled />
    </div>
  ),
}
