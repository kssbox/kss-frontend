'use client'

import { flexRender, type Table as TanstackTable } from '@tanstack/react-table'
import * as React from 'react'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table'
import { DataTablePagination } from './data-table-pagination'
import { getCommonPinningStyles } from './utils'
import { cn } from '../../lib/utils'
import { getMessage } from '../../lib/i18n'
import { EmptyState } from '../empty-state/empty-state'
import type { DataTableColumnMeta, DataTableScrollConfig } from './types'

export interface DataTableInstanceProps<TData>
  extends React.ComponentProps<'div'> {
  table: TanstackTable<TData>
  selectionToolbar?: React.ReactNode
  emptyContent?: React.ReactNode
  scrollConfig?: DataTableScrollConfig
}

export function DataTableInstance<TData>({
  table,
  selectionToolbar,
  emptyContent,
  children,
  className,
  scrollConfig,
  ...props
}: DataTableInstanceProps<TData>) {
  const getColumnWidthStyle = React.useCallback(
    (meta?: DataTableColumnMeta) => {
      const width = meta?.width
      const minWidth = meta?.minWidth
      if (!width && !minWidth) return undefined

      const cssWidth =
        typeof width === 'number' ? `${width}px` : (width as string | undefined)
      const cssMinWidth =
        typeof minWidth === 'number'
          ? `${minWidth}px`
          : (minWidth as string | undefined)

      return {
        ...(cssWidth ? { width: cssWidth, maxWidth: cssWidth } : null),
        ...(cssMinWidth ? { minWidth: cssMinWidth } : null),
      } as React.CSSProperties
    },
    []
  )
  const { maxHeight, stickyHeader = true } = scrollConfig || {}
  const allowHorizontalScroll = Boolean(scrollConfig?.allowHorizontalScroll)

  const tableScrollAreaRef = React.useRef<HTMLDivElement | null>(null)
  const footerRef = React.useRef<HTMLDivElement | null>(null)
  const [autoMaxHeight, setAutoMaxHeight] = React.useState<number | null>(null)

  const resolvedViewportBottomOffset = scrollConfig?.viewportBottomOffset ?? 24
  const resolvedMinAutoMaxHeight = scrollConfig?.minAutoMaxHeight ?? 240

  const computeAutoMaxHeight = React.useCallback(() => {
    const scrollAreaEl = tableScrollAreaRef.current
    if (!scrollAreaEl) return

    const rect = scrollAreaEl.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    const footerHeight = footerRef.current?.getBoundingClientRect().height ?? 0
    const gapBetweenTableAndFooter = 10

    const available =
      viewportHeight -
      rect.top -
      footerHeight -
      gapBetweenTableAndFooter -
      resolvedViewportBottomOffset
    const next = Math.max(resolvedMinAutoMaxHeight, Math.floor(available))
    setAutoMaxHeight(next)
  }, [resolvedMinAutoMaxHeight, resolvedViewportBottomOffset])

  React.useEffect(() => {
    if (maxHeight !== 'auto') {
      setAutoMaxHeight(null)
      return
    }

    computeAutoMaxHeight()
    window.addEventListener('resize', computeAutoMaxHeight)
    const t = window.setTimeout(computeAutoMaxHeight, 0)
    return () => {
      window.removeEventListener('resize', computeAutoMaxHeight)
      window.clearTimeout(t)
    }
  }, [maxHeight, computeAutoMaxHeight])

  const resolvedMaxHeight =
    maxHeight === 'auto' ? (autoMaxHeight ?? undefined) : maxHeight

  const tableWrapperStyle: React.CSSProperties = resolvedMaxHeight
    ? {
      maxHeight:
        typeof resolvedMaxHeight === 'number'
          ? `${resolvedMaxHeight}px`
          : resolvedMaxHeight,
      overflowY: 'auto',
      // Default: only allow vertical scrolling; avoid horizontal scrollbar.
      // Allow pages to explicitly opt-in to horizontal scroll.
      overflowX: allowHorizontalScroll ? 'auto' : 'hidden',
    }
    : {}

  return (
    <div className={cn('flex w-full flex-col gap-2.5', className)} {...props}>
      {children}
      <div className="overflow-hidden rounded-md border">
        <div ref={tableScrollAreaRef} style={tableWrapperStyle}>
          <Table
            disableScrollWrapper={Boolean(resolvedMaxHeight)}
            className={cn(!allowHorizontalScroll && 'table-fixed')}
          >
            <TableHeader
              className={cn(
                resolvedMaxHeight && stickyHeader && 'sticky top-0 z-10'
              )}
            >
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      style={{
                        ...getCommonPinningStyles({ column: header.column }),
                        ...getColumnWidthStyle(
                          header.column.columnDef.meta as
                          | DataTableColumnMeta
                          | undefined
                        ),
                      }}
                      className={cn(
                        resolvedMaxHeight && stickyHeader && 'bg-background'
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map(row => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                  >
                    {row.getVisibleCells().map(cell => (
                      <TableCell
                        key={cell.id}
                        style={{
                          ...getCommonPinningStyles({ column: cell.column }),
                          ...getColumnWidthStyle(
                            cell.column.columnDef.meta as
                            | DataTableColumnMeta
                            | undefined
                          ),
                        }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={table.getAllColumns().length}
                    className="text-center"
                  >
                    {emptyContent ?? (
                      <EmptyState
                        title={getMessage('dataTable.empty')}
                        showButton={false}
                      />
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      <div ref={footerRef} className="flex flex-col gap-2.5">
        <DataTablePagination table={table} />
        {selectionToolbar &&
          table.getFilteredSelectedRowModel().rows.length > 0 &&
          selectionToolbar}
      </div>
    </div>
  )
}
