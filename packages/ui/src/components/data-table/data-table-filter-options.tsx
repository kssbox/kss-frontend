'use client'

import type { Table } from '@tanstack/react-table'
import { Check, ChevronsUpDown, Filter } from 'lucide-react'
import { Button } from '../ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { getMessage } from '../../lib/i18n'
import { cn } from '../../lib/utils'
import type { DataTableColumnMeta } from './types'

export interface DataTableFilterOptionsProps<TData> {
  table: Table<TData>
  visibleFilters: Set<string>
  onVisibleFiltersChange: (filters: Set<string>) => void
}

export function DataTableFilterOptions<TData>({
  table,
  visibleFilters,
  onVisibleFiltersChange,
}: DataTableFilterOptionsProps<TData>) {
  const filterableColumns = table
    .getAllColumns()
    .filter(column => column.getCanFilter() && column.columnDef.meta)

  const toggleFilter = (columnId: string) => {
    const newFilters = new Set(visibleFilters)
    if (newFilters.has(columnId)) {
      newFilters.delete(columnId)
    } else {
      newFilters.add(columnId)
    }
    onVisibleFiltersChange(newFilters)
  }

  if (filterableColumns.length === 0) {
    return null
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          aria-label={getMessage('dataTable.toolbar.toggleFilters')}
          role="combobox"
          variant="outline"
          size="sm"
          className="ml-auto hidden h-8 lg:flex"
        >
          <Filter />
          {getMessage('dataTable.toolbar.filters')}
          <ChevronsUpDown className="ml-auto opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-44 p-0">
        <Command>
          <CommandInput
            placeholder={getMessage('dataTable.toolbar.searchFilters')}
          />
          <CommandList>
            <CommandEmpty>
              {getMessage('dataTable.filter.noFiltersFound')}
            </CommandEmpty>
            <CommandGroup>
              {filterableColumns.map(column => (
                <CommandItem
                  key={column.id}
                  onSelect={() => toggleFilter(column.id)}
                >
                  <span className="truncate">
                    {(column.columnDef.meta as DataTableColumnMeta | undefined)
                      ?.label ?? column.id}
                  </span>
                  <Check
                    className={cn(
                      'ml-auto size-4 shrink-0',
                      visibleFilters.has(column.id)
                        ? 'opacity-100'
                        : 'opacity-0'
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
