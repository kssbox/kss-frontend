'use client'

import * as React from 'react'
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from 'lucide-react'
import {
  type CaptionProps,
  DayButton,
  DayPicker,
  getDefaultClassNames,
} from 'react-day-picker'
import { getCurrentLocale, type Locale } from '../../lib/i18n'

import { cn } from '../../lib/utils'
import { Button, buttonVariants } from './button'

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = 'dropdown',
  buttonVariant = 'ghost',
  formatters,
  components,
  uiLocale,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>['variant']
  uiLocale?: Locale
}) {
  const defaultClassNames = getDefaultClassNames()
  const currentLocale = React.useMemo(
    () => uiLocale ?? getCurrentLocale(),
    [uiLocale]
  )

  const MONTH_NAMES: Record<'zh-CN' | 'en-US', string[]> = {
    'zh-CN': [
      '1月',
      '2月',
      '3月',
      '4月',
      '5月',
      '6月',
      '7月',
      '8月',
      '9月',
      '10月',
      '11月',
      '12月',
    ],
    'en-US': [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ],
  }

  const WEEKDAY_NAMES: Record<'zh-CN' | 'en-US', string[]> = {
    'zh-CN': ['日', '一', '二', '三', '四', '五', '六'],
    'en-US': ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
  }

  const monthNames = MONTH_NAMES[currentLocale] ?? MONTH_NAMES['en-US']
  const weekdayNames = WEEKDAY_NAMES[currentLocale] ?? WEEKDAY_NAMES['en-US']

  const initialMonth = React.useMemo(
    () => props.month ?? props.defaultMonth ?? new Date(),
    [props.month, props.defaultMonth]
  )

  const [internalMonth, setInternalMonth] = React.useState<Date>(initialMonth)
  const month = props.month ?? internalMonth

  const currentYear = month.getFullYear()
  const fromYear =
    props.fromYear ?? props.fromDate?.getFullYear() ?? currentYear - 50
  const toYear = props.toYear ?? props.toDate?.getFullYear() ?? currentYear + 50
  const safeFromYear = Math.min(fromYear, toYear)
  const safeToYear = Math.max(fromYear, toYear)

  const years = React.useMemo(() => {
    const output: number[] = []
    for (let y = safeFromYear; y <= safeToYear; y += 1) {
      output.push(y)
    }
    return output
  }, [safeFromYear, safeToYear])

  const getMonthLabel = React.useCallback(
    (date: Date) => {
      const label = monthNames[date.getMonth()]
      return currentLocale === 'zh-CN'
        ? `${date.getFullYear()}年${date.getMonth() + 1}月`
        : `${label} ${date.getFullYear()}`
    },
    [currentLocale, monthNames]
  )

  const handleMonthChange = React.useCallback(
    (nextMonth: Date) => {
      setInternalMonth(nextMonth)
      props.onMonthChange?.(nextMonth)
    },
    [props]
  )

  const CaptionComponent: React.FC<CaptionProps> = ({ calendarMonth }) => {
    const displayMonth = calendarMonth.date
    const [open, setOpen] = React.useState(false)
    const [selectedYear, setSelectedYear] = React.useState(
      displayMonth.getFullYear()
    )
    const [viewMode, setViewMode] = React.useState<'month' | 'year'>('month')
    const selectId = React.useId()

    React.useEffect(() => {
      setSelectedYear(displayMonth.getFullYear())
      setViewMode('month')
    }, [displayMonth])

    const handleSelectMonth = (monthIndex: number) => {
      const next = new Date(displayMonth)
      next.setFullYear(selectedYear)
      next.setMonth(monthIndex)
      next.setDate(1)
      handleMonthChange(next)
      setOpen(false)
    }

    const handleSelectYear = (event: React.ChangeEvent<HTMLSelectElement>) => {
      const year = Number(event.target.value)
      setSelectedYear(year)

      const next = new Date(displayMonth)
      next.setFullYear(year)
      next.setDate(1)
      handleMonthChange(next)
    }

    const decadeStart = React.useMemo(
      () => Math.floor(selectedYear / 10) * 10,
      [selectedYear]
    )

    const renderYearGrid = () => {
      const yearsToRender = Array.from(
        { length: 12 },
        (_, i) => decadeStart - 1 + i
      )
      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm font-medium text-muted-foreground">
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="size-7"
                onClick={() =>
                  setSelectedYear((prev: number) =>
                    Math.max(safeFromYear, prev - 10)
                  )
                }
                aria-label="Previous decade"
              >
                <ChevronLeftIcon className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="size-7"
                onClick={() =>
                  setSelectedYear((prev: number) =>
                    Math.min(safeToYear, prev + 10)
                  )
                }
                aria-label="Next decade"
              >
                <ChevronRightIcon className="size-4" />
              </Button>
            </div>
            <span className="text-muted-foreground">
              {decadeStart} - {decadeStart + 9}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => setViewMode('month')}
            >
              月份
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {yearsToRender.map(year => {
              const disabled = year < safeFromYear || year > safeToYear
              const isActive = year === selectedYear
              return (
                <button
                  key={year}
                  type="button"
                  className={cn(
                    'h-9 rounded-md border px-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    disabled
                      ? 'border-dashed border-muted text-muted-foreground/70 cursor-not-allowed'
                      : 'hover:border-ring hover:text-foreground',
                    isActive
                      ? 'border-ring bg-accent text-accent-foreground'
                      : 'border-input text-muted-foreground'
                  )}
                  onClick={() => {
                    if (disabled) return
                    setSelectedYear(year)
                    const next = new Date(displayMonth)
                    next.setFullYear(year)
                    next.setDate(1)
                    handleMonthChange(next)
                    setViewMode('month')
                  }}
                >
                  {year}
                </button>
              )
            })}
          </div>
        </div>
      )
    }

    return (
      <div className="relative flex items-center justify-center h-(--cell-size) w-full">
        <button
          type="button"
          className="flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring pointer-events-auto z-10 relative"
          onClick={() => setOpen(prev => !prev)}
          aria-haspopup="dialog"
          aria-expanded={open}
        >
          {getMonthLabel(displayMonth)}
          <ChevronDownIcon className="size-4 text-muted-foreground" />
        </button>

        {open ? (
          <div className="absolute z-20 top-full mt-2 w-80 rounded-md border bg-popover p-3 shadow-md">
            <div className="mb-3 flex items-center gap-2">
              <label className="sr-only" htmlFor={selectId}>
                Year
              </label>
              <select
                id={selectId}
                className="h-9 flex-1 rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={selectedYear}
                onChange={handleSelectYear}
              >
                {years.map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 px-2 text-xs"
                onClick={() =>
                  setViewMode(prev => (prev === 'month' ? 'year' : 'month'))
                }
              >
                {viewMode === 'month' ? '年份视图' : '月份视图'}
              </Button>
            </div>

            {viewMode === 'month' ? (
              <div className="grid grid-cols-3 gap-2">
                {monthNames.map((name, index) => {
                  const isActive =
                    displayMonth.getMonth() === index &&
                    selectedYear === displayMonth.getFullYear()
                  return (
                    <button
                      key={name}
                      type="button"
                      className={cn(
                        'h-9 rounded-md border px-2 text-sm transition-colors hover:border-ring hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        isActive
                          ? 'border-ring bg-accent text-accent-foreground'
                          : 'border-input text-muted-foreground'
                      )}
                      onClick={() => handleSelectMonth(index)}
                    >
                      {name}
                    </button>
                  )
                })}
              </div>
            ) : (
              renderYearGrid()
            )}
          </div>
        ) : null}
      </div>
    )
  }

  return (
    <DayPicker
      month={month}
      onMonthChange={handleMonthChange}
      showOutsideDays={showOutsideDays}
      className={cn(
        'bg-background group/calendar p-3 [--cell-size:--spacing(8)] [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent',
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className
      )}
      captionLayout={captionLayout}
      formatters={{
        formatCaption: getMonthLabel,
        formatMonthDropdown: date => monthNames[date.getMonth()],
        formatWeekdayName: date => weekdayNames[date.getDay()],
        formatYearDropdown: date => `${date.getFullYear()}`,
        ...formatters,
      }}
      classNames={{
        root: cn('w-fit', defaultClassNames.root),
        months: cn(
          'flex gap-4 flex-col md:flex-row relative',
          defaultClassNames.months
        ),
        month: cn('flex flex-col w-full gap-4', defaultClassNames.month),
        nav: cn(
          'flex items-center gap-1 w-full absolute top-0 inset-x-0 justify-between pointer-events-none',
          defaultClassNames.nav
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          'size-(--cell-size) aria-disabled:opacity-50 p-0 select-none pointer-events-auto',
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          'size-(--cell-size) aria-disabled:opacity-50 p-0 select-none pointer-events-auto',
          defaultClassNames.button_next
        ),
        month_caption: cn(
          'flex items-center justify-center h-(--cell-size) w-full pointer-events-none',
          defaultClassNames.month_caption
        ),
        dropdowns: cn(
          'w-full flex items-center text-sm font-medium justify-center h-(--cell-size) gap-1.5',
          defaultClassNames.dropdowns
        ),
        dropdown_root: cn(
          'relative has-focus:border-ring border border-input shadow-xs has-focus:ring-ring/50 has-focus:ring-[3px] rounded-md pointer-events-auto',
          defaultClassNames.dropdown_root
        ),
        dropdown: cn(
          'absolute bg-popover inset-0 opacity-0 pointer-events-auto',
          defaultClassNames.dropdown
        ),
        caption_label: cn(
          'select-none font-medium pointer-events-none',
          captionLayout === 'label'
            ? 'text-sm'
            : 'rounded-md pl-2 pr-1 flex items-center gap-1 text-sm h-8 [&>svg]:text-muted-foreground [&>svg]:size-3.5',
          defaultClassNames.caption_label
        ),
        table: 'w-full border-collapse',
        weekdays: cn('flex', defaultClassNames.weekdays),
        weekday: cn(
          'text-muted-foreground rounded-md flex-1 font-normal text-[0.8rem] select-none',
          defaultClassNames.weekday
        ),
        week: cn('flex w-full mt-2', defaultClassNames.week),
        week_number_header: cn(
          'select-none w-(--cell-size)',
          defaultClassNames.week_number_header
        ),
        week_number: cn(
          'text-[0.8rem] select-none text-muted-foreground',
          defaultClassNames.week_number
        ),
        day: cn(
          'relative w-full h-full p-0 text-center [&:first-child[data-selected=true]_button]:rounded-l-md [&:last-child[data-selected=true]_button]:rounded-r-md group/day aspect-square select-none',
          defaultClassNames.day
        ),
        range_start: cn(
          'rounded-l-md bg-accent',
          defaultClassNames.range_start
        ),
        range_middle: cn('rounded-none', defaultClassNames.range_middle),
        range_end: cn('rounded-r-md bg-accent', defaultClassNames.range_end),
        today: cn(
          'bg-accent text-accent-foreground rounded-md data-[selected=true]:rounded-none',
          defaultClassNames.today
        ),
        outside: cn(
          'text-muted-foreground aria-selected:text-muted-foreground',
          defaultClassNames.outside
        ),
        disabled: cn(
          'text-muted-foreground opacity-50',
          defaultClassNames.disabled
        ),
        hidden: cn('invisible', defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={cn(className)}
              {...props}
            />
          )
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === 'left') {
            return (
              <ChevronLeftIcon className={cn('size-4', className)} {...props} />
            )
          }

          if (orientation === 'right') {
            return (
              <ChevronRightIcon
                className={cn('size-4', className)}
                {...props}
              />
            )
          }

          return (
            <ChevronDownIcon className={cn('size-4', className)} {...props} />
          )
        },
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="flex size-(--cell-size) items-center justify-center text-center">
                {children}
              </div>
            </td>
          )
        },
        // 只有在不使用 dropdown 布局时才使用自定义 Caption
        ...(captionLayout &&
        ['dropdown', 'dropdown-months', 'dropdown-years'].includes(
          captionLayout
        )
          ? {}
          : { Caption: CaptionComponent }),
        ...components,
      }}
      {...props}
    />
  )
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames()

  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="md"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        'data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-ring/50 dark:hover:text-accent-foreground flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 leading-none font-normal group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-[3px] data-[range-end=true]:rounded-md data-[range-end=true]:rounded-r-md data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-md data-[range-start=true]:rounded-l-md [&>span]:text-xs [&>span]:opacity-70',
        defaultClassNames.day,
        className
      )}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton }
