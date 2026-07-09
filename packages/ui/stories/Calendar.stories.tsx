import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Calendar } from '../src/components/ui/calendar'

const meta = {
  title: 'Components/Calendar',
  component: Calendar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Calendar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [date, setDate] = useState<Date | undefined>(new Date())

    return (
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        className="rounded-md border"
      />
    )
  },
}

export const Multiple: Story = {
  render: () => {
    const [dates, setDates] = useState<Date[] | undefined>([])

    return (
      <Calendar
        mode="multiple"
        selected={dates}
        onSelect={setDates}
        className="rounded-md border"
      />
    )
  },
}

export const MonthOnly: Story = {
  render: () => {
    const [month, setMonth] = useState<Date>(new Date())

    return (
      <Calendar
        mode="single"
        month={month}
        onMonthChange={setMonth}
        captionLayout="dropdown-months"
        className="rounded-md border"
      />
    )
  },
}

export const YearOnly: Story = {
  render: () => {
    const [month, setMonth] = useState<Date>(new Date())

    return (
      <Calendar
        mode="single"
        month={month}
        onMonthChange={setMonth}
        captionLayout="dropdown-years"
        className="rounded-md border"
      />
    )
  },
}

export const NoSelection: Story = {
  render: () => {
    return (
      <Calendar
        mode="single"
        captionLayout="label"
        className="rounded-md border"
      />
    )
  },
}
