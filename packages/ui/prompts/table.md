# Table Component

## 设计一个方便使用且功能强大的表格组件是前端开发中的常见需求。本文档介绍了如何使用 `useDataTable` hook 来实现一个功能丰富的表格组件

## 设计目标

### hooks 使用

- 基于 @tanstack/react-table  useReactTable 做一层封装，从而简化表格的使用
- 提供常用功能，如分页、排序、筛选配置选项， 默认有分页 无排序、筛选功能

### 组件化

- 提供开箱即用的 DataTable 组件，内置常用功能
- 提供简化的工具栏组件 DataTableToolbarSimple，支持搜索和重置
- 支持自定义渲染单元格、行操作等

### 额外提供 对上面 hooks 和 组件化 的组合，在无需过多配置的情况下，快速搭建表格
