'use client'

import type { Table } from '@tanstack/react-table'
import { Check, ChevronsUpDown, Settings2 } from 'lucide-react'

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

export interface DataTableViewOptionsProps<TData> {
  table: Table<TData>
}

export function DataTableViewOptions<TData>({
  table,
}: DataTableViewOptionsProps<TData>) {
  const columns = table
    .getAllColumns()
    .filter(
      column => typeof column.accessorFn !== 'undefined' && column.getCanHide()
    )

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          aria-label={getMessage('dataTable.view.toggleColumns')}
          role="combobox"
          variant="outline"
          size="sm"
          className="ml-auto hidden h-8 lg:flex"
        >
          <Settings2 />
          {getMessage('dataTable.view.columns')}
          <ChevronsUpDown className="ml-auto opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-44 p-0">
        <Command>
          <CommandInput
            placeholder={getMessage('dataTable.view.searchColumns')}
          />
          <CommandList>
            <CommandEmpty>
              {getMessage('dataTable.view.noResultsFound')}
            </CommandEmpty>
            <CommandGroup>
              {columns.map(column => (
                <CommandItem
                  key={column.id}
                  onSelect={() =>
                    column.toggleVisibility(!column.getIsVisible())
                  }
                >
                  <span className="truncate">
                    {(column.columnDef.meta as DataTableColumnMeta | undefined)
                      ?.label ?? column.id}
                  </span>
                  <Check
                    className={cn(
                      'ml-auto size-4 shrink-0',
                      column.getIsVisible() ? 'opacity-100' : 'opacity-0'
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
