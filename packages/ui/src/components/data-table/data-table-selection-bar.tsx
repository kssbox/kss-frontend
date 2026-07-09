import { Table } from '@tanstack/react-table'
import React from 'react'
import type { ReactNode } from 'react'
import { Button } from '../ui/button'
import { SelectionBar } from '../selection-bar'
import type { IList } from './use-data-table'

function flattenToolbarActions(node: ReactNode): ReactNode[] {
  return React.Children.toArray(node).flatMap(child => {
    if (
      React.isValidElement<{ children?: ReactNode }>(child) &&
      child.type === React.Fragment
    ) {
      return flattenToolbarActions(child.props.children)
    }

    return [child]
  })
}

export function DataTableSelectionBar<TData>({
  selectionToolbar,
  selectedRows,
  table,
  refresh,
  resetSelection,
}: {
  selectedRows: TData[]
  table: Table<TData>
  refresh: () => Promise<IList<TData> | undefined>
  resetSelection: () => void
  selectionToolbar?: (
    selectedRows: TData[],
    table: Table<TData>,
    helpers: {
      refresh: () => Promise<IList<TData> | undefined>
      resetSelection: () => void
    }
  ) => ReactNode
}) {
  const toolbar = selectionToolbar?.(selectedRows, table, {
    refresh,
    resetSelection,
  })

  const cancelButton = (
    <Button variant="outline" onClick={resetSelection}>
      取消
    </Button>
  )

  // Insert cancel button before the last action (delete button).
  let actions: ReactNode = toolbar
  if (toolbar) {
    const children = flattenToolbarActions(toolbar)
    if (children.length > 0) {
      const last = children.pop()
      actions = (
        <>
          {children}
          {cancelButton}
          {last}
        </>
      )
    } else {
      actions = cancelButton
    }
  }

  return (
    <SelectionBar
      count={selectedRows.length}
      visible={selectedRows.length > 0}
      actions={actions}
    />
  )
}
