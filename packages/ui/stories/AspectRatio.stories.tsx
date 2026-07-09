import type { Meta, StoryObj } from '@storybook/react'
import { AspectRatio } from '../src/components/ui/aspect-ratio'

const meta = {
  title: 'Components/AspectRatio',
  component: AspectRatio,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof AspectRatio>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="w-[450px]">
      <AspectRatio ratio={16 / 9} className="bg-muted">
        <img
          src="https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80"
          alt="Photo"
          className="rounded-md object-cover w-full h-full"
        />
      </AspectRatio>
    </div>
  ),
}

export const Square: Story = {
  render: () => (
    <div className="w-[300px]">
      <AspectRatio ratio={1 / 1} className="bg-muted">
        <img
          src="https://images.unsplash.com/photo-1535025183127-0c49da5b4c7b?w=800&dpr=2&q=80"
          alt="Square"
          className="rounded-md object-cover w-full h-full"
        />
      </AspectRatio>
    </div>
  ),
}

export const Portrait: Story = {
  render: () => (
    <div className="w-[300px]">
      <AspectRatio ratio={3 / 4} className="bg-muted">
        <img
          src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&dpr=2&q=80"
          alt="Portrait"
          className="rounded-md object-cover w-full h-full"
        />
      </AspectRatio>
    </div>
  ),
}
