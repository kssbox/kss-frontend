'use client'

import * as React from 'react'
import { Check, ChevronsUpDown, Plus, X } from 'lucide-react'

import { cn } from '../../lib/utils'
import { Badge } from './badge'
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from './command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './popover'

export type CreatableMultiSelectValue = string | number

export interface CreatableMultiSelectOption {
  value: CreatableMultiSelectValue
  label: string
  disabled?: boolean
}

export interface CreatableMultiSelectProps {
  value: CreatableMultiSelectValue[]
  options: CreatableMultiSelectOption[]
  onChange: (value: CreatableMultiSelectValue[]) => void
  onCreateOption?: (
    input: string,
  ) =>
    | Promise<CreatableMultiSelectOption | null | undefined>
    | CreatableMultiSelectOption
    | null
    | undefined
  triggerPlaceholder?: string
  searchPlaceholder?: string
  emptyText?: string
  noResultsText?: string
  createLabel?: string
  creatingText?: string
  disabled?: boolean
  className?: string
  listClassName?: string
  contentClassName?: string
}

function normalizeValue(value: CreatableMultiSelectValue) {
  return String(value)
}

function appendUniqueValue(
  current: CreatableMultiSelectValue[],
  nextValue: CreatableMultiSelectValue,
) {
  const existing = new Set(current.map(normalizeValue))
  if (existing.has(normalizeValue(nextValue))) {
    return current
  }

  return [...current, nextValue]
}

export function CreatableMultiSelect({
  value,
  options,
  onChange,
  onCreateOption,
  triggerPlaceholder = '请选择...',
  searchPlaceholder = '选择已有项或创建新项',
  emptyText = '暂无可选项',
  noResultsText = '没有匹配的选项',
  createLabel = '创建',
  creatingText = '创建中...',
  disabled = false,
  className,
  listClassName,
  contentClassName,
}: CreatableMultiSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')
  const [creating, setCreating] = React.useState(false)
  const listboxId = React.useId()

  const normalizedSearch = search.trim()

  const optionMap = React.useMemo(() => {
    return new Map(options.map((option) => [normalizeValue(option.value), option]))
  }, [options])

  const selectedOptions = React.useMemo(() => {
    return value
      .map((currentValue) => optionMap.get(normalizeValue(currentValue)))
      .filter((option): option is CreatableMultiSelectOption => Boolean(option))
  }, [optionMap, value])

  const filteredOptions = React.useMemo(() => {
    const lowerSearch = normalizedSearch.toLowerCase()

    return options.filter((option) => {
      if (option.disabled) {
        return false
      }

      if (!lowerSearch) {
        return true
      }

      return option.label.toLowerCase().includes(lowerSearch)
    })
  }, [normalizedSearch, options])

  const exactMatch = React.useMemo(() => {
    const lowerSearch = normalizedSearch.toLowerCase()
    if (!lowerSearch) {
      return false
    }

    return options.some(
      (option) => option.label.toLowerCase() === lowerSearch,
    )
  }, [normalizedSearch, options])

  const showCreateOption = Boolean(onCreateOption) && normalizedSearch.length > 0 && !exactMatch

  const isSelected = React.useCallback(
    (optionValue: CreatableMultiSelectValue) => {
      return value.some(
        (currentValue) => normalizeValue(currentValue) === normalizeValue(optionValue),
      )
    },
    [value],
  )

  const toggleOption = React.useCallback(
    (optionValue: CreatableMultiSelectValue) => {
      if (disabled) {
        return
      }

      if (isSelected(optionValue)) {
        onChange(
          value.filter(
            (currentValue) => normalizeValue(currentValue) !== normalizeValue(optionValue),
          ),
        )
        return
      }

      onChange(appendUniqueValue(value, optionValue))
    },
    [disabled, isSelected, onChange, value],
  )

  const handleCreate = React.useCallback(async () => {
    if (!onCreateOption || !normalizedSearch || creating || disabled) {
      return
    }

    setCreating(true)
    try {
      const createdOption = await onCreateOption(normalizedSearch)
      if (!createdOption) {
        return
      }

      onChange(appendUniqueValue(value, createdOption.value))
      setSearch('')
    } finally {
      setCreating(false)
    }
  }, [creating, disabled, normalizedSearch, onChange, onCreateOption, value])

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        if (disabled) {
          return
        }

        setOpen(nextOpen)
        if (!nextOpen) {
          setSearch('')
        }
      }}
    >
      <PopoverTrigger asChild>
        <div
          role="combobox"
          aria-controls={listboxId}
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-disabled={disabled}
          className={cn(
            'flex min-h-10 w-full cursor-pointer flex-wrap items-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background transition-colors hover:border-gray-400 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
            disabled && 'cursor-not-allowed opacity-60 hover:border-input',
            className,
          )}
        >
          {selectedOptions.map((option) => (
            <Badge key={normalizeValue(option.value)} variant="secondary" className="h-6 shrink-0 gap-1 pr-1">
              {option.label}
              <button
                type="button"
                className="ml-0.5 rounded-full p-0.5 hover:bg-gray-300"
                onClick={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                  toggleOption(option.value)
                }}
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {selectedOptions.length === 0 && (
            <span className="text-sm text-gray-500">{triggerPlaceholder}</span>
          )}
          <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 text-gray-400" />
        </div>
      </PopoverTrigger>
      <PopoverContent
        className={cn(
          'w-[var(--radix-popover-trigger-width)] p-0',
          contentClassName,
        )}
        align="start"
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={searchPlaceholder}
            value={search}
            onValueChange={setSearch}
          />
          <CommandList id={listboxId} className={cn('max-h-[320px]', listClassName)}>
            {filteredOptions.length > 0 && (
              <CommandGroup>
                {filteredOptions.map((option) => (
                  <CommandItem
                    key={normalizeValue(option.value)}
                    value={normalizeValue(option.value)}
                    onSelect={() => toggleOption(option.value)}
                    className="gap-3 px-3 py-2.5"
                  >
                    <span className="flex-1 truncate">{option.label}</span>
                    {isSelected(option.value) && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {filteredOptions.length === 0 && !showCreateOption && (
              <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                {normalizedSearch ? noResultsText : emptyText}
              </div>
            )}

            {showCreateOption && filteredOptions.length > 0 && <CommandSeparator />}

            {showCreateOption && (
              <CommandGroup>
                <CommandItem
                  value={`create-${normalizedSearch}`}
                  onSelect={handleCreate}
                  disabled={creating}
                  className="gap-3 px-3 py-2.5"
                >
                  <Plus className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-sm text-muted-foreground">
                    {creating ? creatingText : createLabel}
                  </span>
                  <span className="rounded-sm bg-rose-100 px-1.5 py-0.5 text-xs font-medium text-rose-700">
                    {normalizedSearch}
                  </span>
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
