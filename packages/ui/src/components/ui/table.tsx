'use client'

import * as React from 'react'

import { cn } from '../../lib/utils'

function Table({
  className,
  ...props
}: React.ComponentProps<'table'> & { disableScrollWrapper?: boolean }) {
  const { disableScrollWrapper, ...tableProps } = props

  if (disableScrollWrapper) {
    return (
      <table
        data-slot="table"
        className={cn('w-full caption-bottom text-sm', className)}
        {...tableProps}
      />
    )
  }

  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto"
    >
      <table
        data-slot="table"
        className={cn('w-full caption-bottom text-sm', className)}
        {...tableProps}
      />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<'thead'>) {
  return (
    <thead
      data-slot="table-header"
      className={cn(
        '[&_tr]:border-b-[0.5px]',
        '[&_tr]:border-[var(--table-header-border,var(--border))]',
        'bg-[var(--table-header-bg,var(--muted))]',
        'text-[var(--table-header-fg,var(--foreground))]',
        className
      )}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<'tbody'>) {
  return (
    <tbody
      data-slot="table-body"
      className={cn('[&_tr:last-child]:border-0', className)}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<'tfoot'>) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        'bg-[var(--table-footer-bg,var(--background))]',
        'text-[var(--table-footer-fg,var(--muted-foreground))]',
        'border-t-[0.5px] border-[var(--table-footer-border,var(--border))]',
        'font-medium [&>tr]:last:border-b-0',
        className
      )}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<'tr'>) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        'bg-[var(--table-row-bg,transparent)]',
        'border-b border-[0.5px] border-[var(--table-row-border,var(--border))]',
        'transition-colors',
        'hover:bg-[var(--table-row-hover-bg,var(--muted))]',
        'data-[state=selected]:bg-[var(--table-row-selected-bg,var(--muted))]',
        className
      )}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<'th'>) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        'h-10 text-left align-middle whitespace-nowrap',
        'px-[var(--table-cell-padding-x,0.5rem)]',
        'py-2.5',
        'text-xs font-medium leading-4',
        'text-[var(--table-header-fg,var(--foreground))]',
        'font-[var(--table-header-font-weight,500)]',
        '[&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
        className
      )}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<'td'>) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        'align-middle whitespace-nowrap',
        'px-[var(--table-cell-padding-x,0.5rem)]',
        'py-3',
        'text-xs leading-5',
        'text-[var(--table-cell-fg,var(--foreground))]',
        '[&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
        className
      )}
      {...props}
    />
  )
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<'caption'>) {
  return (
    <caption
      data-slot="table-caption"
      className={cn('text-muted-foreground mt-4 text-sm', className)}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
