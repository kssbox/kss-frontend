# Table 组件设计文档

## 背景

业务中大量页面需要结构化数据的展示、筛选与批量操作。现有实现重复
度高、配置分散，缺少一致的交互体验。基于 `@tanstack/react-table` 的
能力，我们计划抽象一套 hook + 组件的组合，提供快速落地的表格能力。

## 目标

- 封装 `useReactTable` 为 `useDataTable`，隐藏复杂配置，提供分页、排序、
  筛选等常用行为的约定式接口。
- 提供开箱即用的 `DataTable` 组件与简化工具栏，覆盖常规数据展示需求。
- 支持在默认功能基础上自由扩展列渲染、行操作、外部状态联动。
- 保持 UI、交互与数据逻辑分离，降低二次开发成本。

## 非目标

- 不在组件内部实现数据请求，仅提供分页参数与回调。
- 不覆盖极端自定义场景（如完全自绘行/列），此类场景仍可直接使用
  `@tanstack/react-table`。

## 功能范围

### Hook 能力

- 适配远程分页：暴露分页状态、翻页回调、外部总数设置。
- 排序、筛选的受控配置：默认关闭，可按需开启。
- 统一列定义：支持 accessor 与自定义单元格 render。
- 表格状态持久化可选支持（例如 URL 或外部 store）。

### 组件能力

- `DataTable`：渲染表头、表体、空状态、加载态，内置分页条。
- `DataTableToolbarSimple`：提供关键字搜索、重置按钮、插槽扩展。
- 组合模板：提供 `createSimpleTable` 或类似工厂，帮助快速组装。

## 技术方案

### useDataTable

- 入参：数据源（受控）、列配置、分页/排序/筛选开关与初始状态、回调。
- 内部使用 `useReactTable`，统一封装列定义、状态 reducer，与
  `@tanstack/react-table` 同步。
- 输出：`table` 实例、分页状态（`pageIndex`, `pageSize`, `total`）、排序/
  筛选配置、事件处理函数。
- 支持使用 `useMemo` 缓存列定义，避免重复计算；对外暴露 `setData` 等便捷
  入口。

### DataTable

- Props：`table`（来自 hook）、`isLoading`、`emptyState`、`rowSelection` 开关、
  `renderRowActions`、行点击回调等。
- 结构：表头渲染排序指示；表体处理 hover、可选行选中；底部分页区域使用
  UI 库组件。
- 状态：支持受控的行选中/展开，默认交给 `useDataTable` 处理。
- 样式：统一尺寸、配色，遵循 `packages/ui` 设计系统。

### DataTableToolbarSimple

- Props：`searchValue`、`onSearch`、`onReset`，以及插槽（右上角 actions）。
- 内置输入框与重置按钮；支持外部扩展过滤项（例如标签筛选）。
- 与 `useDataTable` 协同，通过回调同步筛选条件。

### 快速组合

- 提供 `useSimpleDataTable`（包装 `useDataTable` + 默认配置）；
  或导出 `SimpleDataTable` 组件，内部集成 hook、表格、工具栏。
- 默认开启分页，排序/筛选通过 `options` 显式开启。
- 支持传入 `columns`、`fetcher`（负责请求数据并更新 hook 数据）。

## 数据流

1. 业务组件配置列与数据源获取逻辑，调用 `useDataTable`。
2. Hook 返回 `table` 实例、状态与操作方法。
3. `DataTable` 接收 `table` 实例负责渲染；工具栏联动筛选/搜索状态。
4. 分页、排序等回调透传给业务层进行数据刷新。

## 性能考虑

- 使用 `useMemo` 与 `useCallback` 减少 `table` 重建，避免大数据量下的
  重渲染。
- 分页请求默认限制 pageSize，可通过选项调整；支持虚拟化扩展预留钩子。

## 交互与可用性

- 空数据时显示空态插画或文案；提供重试按钮插槽。
- 表头排序图标仅在配置开启时显示；多列排序暂不支持。
- 键盘可访问性：表格、分页控件使用 semantic HTML 与 ARIA 属性。
- 国际化：文案通过 props 或 context 注入，支持语言切换。

## 测试计划

- Hook：使用 Vitest 测试分页、排序、筛选状态流转；确保回调正确触发。
- 组件：使用 React Testing Library 验证渲染、空态、加载态、分页交互。
- Storybook：提供基础表格、带搜索、带自定义单元格等故事做视觉回归。

## 风险与待定问题

- 是否需要内置列拖拽、列显隐等高级功能？待确认需求后规划。
- URL 持久化策略需要与路由层配合，需确认统一方案。
- 大数据量性能若需虚拟滚动，可能引入额外第三方库，需评估复杂度。
