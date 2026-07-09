import type { Meta, StoryObj } from '@storybook/react'
import { Textarea } from '../src/components/ui/textarea'
import { Label } from '../src/components/ui/label'

const meta = {
  title: 'Components/Textarea',
  component: Textarea,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    disabled: {
      control: { type: 'boolean' },
    },
  },
} satisfies Meta<typeof Textarea>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    placeholder: 'Type your message here...',
  },
}

export const WithValue: Story = {
  args: {
    value: 'This is some text in the textarea.',
    placeholder: 'Type your message here...',
  },
}

export const Disabled: Story = {
  args: {
    placeholder: 'This textarea is disabled',
    disabled: true,
  },
}

export const WithError: Story = {
  args: {
    placeholder: 'Type your message here...',
    'aria-invalid': true,
  },
}

export const WithLabel: Story = {
  render: () => (
    <div className="grid w-full gap-1.5">
      <Label htmlFor="message">Your message</Label>
      <Textarea id="message" placeholder="Type your message here..." />
    </div>
  ),
}

export const WithHelperText: Story = {
  render: () => (
    <div className="grid w-full gap-1.5">
      <Label htmlFor="bio">Bio</Label>
      <Textarea id="bio" placeholder="Tell us about yourself..." />
      <p className="text-sm text-muted-foreground">
        Your bio will be displayed on your profile.
      </p>
    </div>
  ),
}

export const FixedSize: Story = {
  render: () => (
    <div className="w-[400px]">
      <Textarea
        className="min-h-[150px]"
        placeholder="This textarea has a fixed height..."
      />
    </div>
  ),
}

export const Form: Story = {
  render: () => (
    <div className="grid w-full max-w-md gap-4">
      <div className="grid gap-1.5">
        <Label htmlFor="subject">Subject</Label>
        <Textarea id="subject" placeholder="Enter subject..." />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Enter description..."
          className="min-h-[100px]"
        />
      </div>
    </div>
  ),
}
