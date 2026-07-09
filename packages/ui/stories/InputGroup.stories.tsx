import type { Meta, StoryObj } from '@storybook/react'

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupTextarea,
} from '@/components/ui/input-group'

const meta: Meta<typeof InputGroup> = {
  title: 'Components/InputGroup',
  component: InputGroup,
}

export default meta

type Story = StoryObj<typeof InputGroup>

export const Basic: Story = {
  render: () => (
    <div className="space-y-4 p-4">
      <InputGroup>
        <InputGroupAddon>https://</InputGroupAddon>
        <InputGroupInput placeholder="example.com" />
      </InputGroup>

      <InputGroup>
        <InputGroupInput placeholder="Amount" />
        <InputGroupAddon align="inline-end">USD</InputGroupAddon>
      </InputGroup>

      <InputGroup>
        <InputGroupAddon>
          <InputGroupButton aria-label="search">🔍</InputGroupButton>
        </InputGroupAddon>
        <InputGroupInput placeholder="Search" />
      </InputGroup>

      <InputGroup>
        <InputGroupAddon align="block-start">Notes</InputGroupAddon>
        <InputGroupTextarea placeholder="Multi-line input" />
      </InputGroup>
    </div>
  ),
}
