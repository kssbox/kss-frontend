'use client'

import type * as React from 'react'

export type DataTableFilterVariant =
  | 'text'
  | 'number'
  | 'range'
  | 'date'
  | 'dateRange'
  | 'boolean'
  | 'select'
  | 'multiSelect'

export interface DataTableFilterOption {
  label: string
  value: string
  count?: number
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

export interface DataTableColumnMeta {
  label?: string
  placeholder?: string
  variant?: DataTableFilterVariant
  options?: DataTableFilterOption[]
  range?: [number, number]
  unit?: string
  /** Optional fractional digit limit for numeric filters (e.g. 1 -> max one decimal place). */
  decimalScale?: number
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>

  /** Input filter debounce duration in milliseconds (e.g. 300-500). */
  debounceMs?: number

  /** Optional header cell (th) className override for this column. */
  headerClassName?: string

  /** Optional body cell (td) className override for this column. */
  cellClassName?: string

  /**
   * 列宽（推荐与 table-fixed 配合使用）。
   * - number: 像素
   * - string: 任意 CSS 宽度（如 '120px' / '10rem' / '25%')
   */
  width?: number | string

  /**
   * 列最小宽度（用于保证操作列等至少能容纳基本内容）。
   * - number: 像素
   * - string: 任意 CSS 宽度
   */
  minWidth?: number | string
}

export interface DataTableScrollConfig {
  /** 表格最大高度，超过此高度时启用垂直滚动 */
  maxHeight?: string | number | 'auto'
  /** 是否固定表头 */
  stickyHeader?: boolean

  /**
   * 是否允许横向滚动。
   * - 默认 false：禁用横向滚动，避免出现左右滚动条。
   * - true：当列较多或内容较宽时允许横向滚动。
   */
  allowHorizontalScroll?: boolean

  /**
   * 当 maxHeight 为 'auto' 时：
   * 计算可用高度时在视口底部预留的空白（像素）。
   */
  viewportBottomOffset?: number

  /** 当 maxHeight 为 'auto' 时：自动计算出的最大高度下限（像素） */
  minAutoMaxHeight?: number
}
