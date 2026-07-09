# @kssbox/i18n

国际化（i18n）库，提供统一的 API 错误处理和多语言支持。

## 特性

- ✅ **统一的 t 函数**：一个函数处理 UI 文案和 API 错误
- ✅ **HTTP 层统一拦截**：自动翻译和显示 API 错误
- ✅ **零运行时依赖**：纯函数实现，打包体积小
- ✅ **TypeScript 支持**：完整的类型定义
- ✅ **位置参数替换**：从服务端消息中自动提取参数
- ✅ **优雅降级**：未找到翻译时返回原始消息

## 快速开始

### 安装

```bash
pnpm add @kssbox/i18n  # 推荐使用 pnpm
# or
npm install @kssbox/i18n
# or
yarn add @kssbox/i18n
```

### 基础使用

```typescript
import { createI18n } from "@kssbox/i18n";

// 创建 i18n 实例
const { t, lang } = createI18n("zh");

// UI 文案翻译
t("button.submit") // → "提交"
t("table.pagination.total", { total: "42" }) // → "共 42 条"

// API 错误翻译（HTTP 拦截器中使用）
t("code.FILE_NOT_FOUND", "File {document.txt} Not Found") // → "文件 document.txt 不存在"
```

### React 集成

```typescript
import { I18nProvider, useI18n } from "@/contexts/I18nContext";

// App.tsx
function App() {
  return (
    <I18nProvider defaultLang="zh">
      <YourApp />
    </I18nProvider>
  );
}

// Component.tsx
function MyComponent() {
  const { i18n } = useI18n();
  const { t } = i18n;
  
  return <button>{t("button.submit")}</button>;
}
```

## 文档

- [完整设计文档](./i18n.md)
- [详细实现文档](./i18n-detailed.md)

## License

MIT
