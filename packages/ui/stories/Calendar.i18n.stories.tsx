import type { Meta, StoryObj } from '@storybook/react'
import { CalendarI18nTest } from './CalendarI18nTest'

const meta = {
  title: 'Calendar/i18n Test',
  component: CalendarI18nTest,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof CalendarI18nTest>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <CalendarI18nTest />,
}
