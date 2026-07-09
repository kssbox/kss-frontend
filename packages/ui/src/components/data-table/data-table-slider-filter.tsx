'use client'

import type { Column } from '@tanstack/react-table'
import { PlusCircle, XCircle } from 'lucide-react'
import * as React from 'react'

import { getMessage } from '../../lib/i18n'
import type { DataTableColumnMeta } from './types'
import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Separator } from '../ui/separator'
import { Slider } from '../ui/slider'
import { cn } from '../../lib/utils'
import { InputNumber } from '../ui/input-number'

type RangeValue = [number, number]

function getIsValidRange(value: unknown): value is RangeValue {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    typeof value[0] === 'number' &&
    typeof value[1] === 'number'
  )
}

export interface DataTableSliderFilterProps<TData> {
  column: Column<TData, unknown>
  title?: string
}

export function DataTableSliderFilter<TData>({
  column,
  title,
}: DataTableSliderFilterProps<TData>) {
  const id = React.useId()

  const columnFilterValue = getIsValidRange(column.getFilterValue())
    ? (column.getFilterValue() as RangeValue)
    : undefined

  const columnMeta = column.columnDef.meta as DataTableColumnMeta | undefined
  const defaultRange = columnMeta?.range
  const unit = columnMeta?.unit
  const decimalScale = columnMeta?.decimalScale

  const { min, max, step } = React.useMemo<{
    min: number
    max: number
    step: number
  }>(() => {
    let minValue = 0
    let maxValue = 100

    if (defaultRange && getIsValidRange(defaultRange)) {
      ;[minValue, maxValue] = defaultRange
    } else {
      const values = column.getFacetedMinMaxValues()
      if (values && Array.isArray(values) && values.length === 2) {
        const [facetMinValue, facetMaxValue] = values
        if (
          typeof facetMinValue === 'number' &&
          typeof facetMaxValue === 'number'
        ) {
          minValue = facetMinValue
          maxValue = facetMaxValue
        }
      }
    }

    const decimalStep =
      typeof decimalScale === 'number'
        ? Number((1 / Math.pow(10, decimalScale)).toFixed(decimalScale))
        : undefined

    const rangeSize = maxValue - minValue
    const fallbackStep =
      rangeSize <= 20
        ? 1
        : rangeSize <= 100
          ? Math.ceil(rangeSize / 20)
          : Math.ceil(rangeSize / 50)

    const stepValue = decimalStep ?? fallbackStep

    return { min: minValue, max: maxValue, step: stepValue }
  }, [column, decimalScale, defaultRange])

  const range = React.useMemo((): RangeValue => {
    return columnFilterValue ?? [min, max]
  }, [columnFilterValue, min, max])

  const formatValue = React.useCallback(
    (value: number) => {
      return value.toLocaleString(undefined, {
        maximumFractionDigits:
          typeof decimalScale === 'number' ? decimalScale : 1,
      })
    },
    [decimalScale]
  )

  const onFromInputChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const numValue = Number(event.target.value)
      if (!Number.isNaN(numValue) && numValue >= min && numValue <= range[1]) {
        column.setFilterValue([numValue, range[1]])
      }
    },
    [column, min, range]
  )

  const onToInputChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const numValue = Number(event.target.value)
      if (!Number.isNaN(numValue) && numValue <= max && numValue >= range[0]) {
        column.setFilterValue([range[0], numValue])
      }
    },
    [column, max, range]
  )

  const onSliderValueChange = React.useCallback(
    (value: RangeValue) => {
      if (Array.isArray(value) && value.length === 2) {
        column.setFilterValue(value)
      }
    },
    [column]
  )

  const onReset = React.useCallback(
    (event?: React.SyntheticEvent) => {
      if (event?.target instanceof HTMLDivElement) {
        event.stopPropagation()
      }
      column.setFilterValue(undefined)
    },
    [column]
  )

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="border-dashed">
          {columnFilterValue ? (
            <div
              role="button"
              aria-label={getMessage('dataTable.sliderFilter.clearFilter', {
                name: title || '',
              })}
              tabIndex={0}
              className="rounded-sm opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              onClick={onReset}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  onReset(e)
                  e.preventDefault()
                }
              }}
            >
              <XCircle />
            </div>
          ) : (
            <PlusCircle />
          )}
          <span>{title}</span>
          {columnFilterValue ? (
            <>
              <Separator
                orientation="vertical"
                className="mx-0.5 data-[orientation=vertical]:h-4"
              />
              {formatValue(columnFilterValue[0])} -{' '}
              {formatValue(columnFilterValue[1])}
              {unit ? ` ${unit}` : ''}
            </>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="flex w-auto flex-col gap-4">
        <div className="flex flex-col gap-3">
          <p className="font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {title}
          </p>
          <div className="flex items-center gap-4">
            <Label htmlFor={`${id}-from`} className="sr-only">
              {getMessage('dataTable.sliderFilter.from')}
            </Label>
            <div className="relative">
              <InputNumber
                id={`${id}-from`}
                aria-valuemin={min}
                aria-valuemax={max}
                placeholder={min.toString()}
                min={min}
                max={max}
                value={range[0]?.toString()}
                onChange={onFromInputChange}
                decimalScale={decimalScale}
                className={cn('h-8 w-24', unit && 'pr-8')}
              />
              {unit && (
                <span className="absolute top-0 right-0 bottom-0 flex items-center rounded-r-md bg-accent px-2 text-muted-foreground text-sm">
                  {unit}
                </span>
              )}
            </div>
            <Label htmlFor={`${id}-to`} className="sr-only">
              {getMessage('dataTable.sliderFilter.to')}
            </Label>
            <div className="relative">
              <InputNumber
                id={`${id}-to`}
                aria-valuemin={min}
                aria-valuemax={max}
                placeholder={max.toString()}
                min={min}
                max={max}
                value={range[1]?.toString()}
                onChange={onToInputChange}
                decimalScale={decimalScale}
                className={cn('h-8 w-24', unit && 'pr-8')}
              />
              {unit && (
                <span className="absolute top-0 right-0 bottom-0 flex items-center rounded-r-md bg-accent px-2 text-muted-foreground text-sm">
                  {unit}
                </span>
              )}
            </div>
          </div>
          <Label htmlFor={`${id}-slider`} className="sr-only">
            {getMessage('dataTable.sliderFilter.sliderLabel', {
              name: title || '',
            })}
          </Label>
          <Slider
            id={`${id}-slider`}
            min={min}
            max={max}
            step={step}
            value={range}
            onValueChange={onSliderValueChange}
          />
        </div>
        <Button
          aria-label={getMessage('dataTable.sliderFilter.clearFilter', {
            name: title || '',
          })}
          variant="outline"
          size="sm"
          onClick={onReset}
        >
          {getMessage('dataTable.sliderFilter.clear')}
        </Button>
      </PopoverContent>
    </Popover>
  )
}
