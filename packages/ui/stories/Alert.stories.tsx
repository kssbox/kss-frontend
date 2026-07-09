import type { Meta, StoryObj } from '@storybook/react'
import { Alert, AlertTitle, AlertDescription } from '../src/components/ui/alert'
import { Terminal, AlertCircle } from 'lucide-react'

const meta = {
  title: 'Components/Alert',
  component: Alert,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'destructive'],
    },
  },
} satisfies Meta<typeof Alert>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Alert className="w-[400px]">
      <Terminal />
      <AlertTitle>Heads up!</AlertTitle>
      <AlertDescription>
        You can add components to your app using the cli.
      </AlertDescription>
    </Alert>
  ),
}

export const Destructive: Story = {
  render: () => (
    <Alert variant="destructive" className="w-[400px]">
      <AlertCircle />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        Your session has expired. Please log in again.
      </AlertDescription>
    </Alert>
  ),
}

export const WithoutIcon: Story = {
  render: () => (
    <Alert className="w-[400px]">
      <AlertTitle>Note</AlertTitle>
      <AlertDescription>
        This is a simple alert without an icon.
      </AlertDescription>
    </Alert>
  ),
}

export const TitleOnly: Story = {
  render: () => (
    <Alert className="w-[400px]">
      <Terminal />
      <AlertTitle>Update Available</AlertTitle>
    </Alert>
  ),
}

export const LongContent: Story = {
  render: () => (
    <Alert className="w-[500px]">
      <AlertCircle />
      <AlertTitle>Important Information</AlertTitle>
      <AlertDescription>
        This alert contains a longer description to demonstrate how the
        component handles multiple lines of text. The text will wrap naturally
        within the alert container, maintaining proper spacing and alignment
        with the icon.
      </AlertDescription>
    </Alert>
  ),
}
