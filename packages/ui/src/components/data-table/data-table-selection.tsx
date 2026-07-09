import { ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '../ui/checkbox'

export function createSelectColumn<T>(): ColumnDef<T> {
  return {
    id: 'kssbox-ui-select',
    meta: {
      width: 44,
    },
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={value => row.toggleSelected(!!value)}
      />
    ),
  }
}
