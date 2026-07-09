# @kssbox/ui

Kssbox 的可复用 React UI 组件库，基于 shadcn/ui 构建。

## 如何使用

```css
@import 'tailwindcss';
@import '@kssbox/ui/dist/base-theme.css';
@import '@kssbox/ui/dist/sonner-theme.css';

/* 根据需要导入相对路径 */
@source '../../node_modules/@kssbox/ui/dist/**/*.{js,ts,jsx,tsx}';

@layer theme {
  [data-app='my-app'] {
    /* optional overrides */
  }
}
```

确保在布局根节点上添加 `data-theme="default"`（或你自定义的主题名）来启用主题变量：

```tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="default">
      <body data-app="my-app">{children}</body>
    </html>
  )
}
```

## 架构设计

### 组件分类

| 分类 | 组件 |
|------|------|
| 基础 UI | Button, Card, Dialog, Input, Select, Checkbox, Radio, Switch, Slider, Tabs |
| 数据展示 | DataTable, Table |
| 富文本编辑 | RichEditor (Slate), Markdown |
| 文件处理 | UploadFile, DragDropZone |
| 窗口组件 | FloatingWindow, DraggableResizableWindow |
| 导航组件 | Menu, Sidebar, Breadcrumb |

### 导出结构

```
@kssbox/ui
├── components/     # 组件
├── globals.css     # 全局样式
└── theme.css       # 主题变量
```

### Storybook

运行 Storybook 查看所有组件：

```bash
pnpm storybook
```

## 样式系统

详见 [STYLE_GUIDE.md](../../docs/STYLE_GUIDE.md)。
