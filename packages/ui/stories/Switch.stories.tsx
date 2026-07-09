import type { Meta, StoryObj } from '@storybook/react'
import { Switch } from '../src/components/ui/switch'
import { Label } from '../src/components/ui/label'

const meta = {
  title: 'Components/Switch',
  component: Switch,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Switch>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}

export const Checked: Story = {
  args: {
    defaultChecked: true,
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
  },
}

export const DisabledChecked: Story = {
  args: {
    disabled: true,
    defaultChecked: true,
  },
}

export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Switch id="airplane-mode" />
      <Label htmlFor="airplane-mode">Airplane Mode</Label>
    </div>
  ),
}

export const Settings: Story = {
  render: () => (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="notifications" className="cursor-pointer">
          Push Notifications
        </Label>
        <Switch id="notifications" defaultChecked />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="marketing" className="cursor-pointer">
          Marketing Emails
        </Label>
        <Switch id="marketing" />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="security" className="cursor-pointer">
          Security Alerts
        </Label>
        <Switch id="security" defaultChecked disabled />
      </div>
    </div>
  ),
}
