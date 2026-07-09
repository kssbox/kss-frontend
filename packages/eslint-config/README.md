# @kssbox/eslint-config

共享的 ESLint 配置包，为 monorepo 中的所有项目提供一致的代码质量标准。

## 可用配置

- `@kssbox/eslint-config` - 基础配置（TypeScript）
- `@kssbox/eslint-config/react` - React 项目配置
- `@kssbox/eslint-config/nextjs` - Next.js 项目配置
- `@kssbox/eslint-config/node` - Node.js 项目配置

## 使用方法

在项目的 `.eslintrc.js` 中：

```javascript
module.exports = {
  extends: ['@kssbox/eslint-config/react'],
  parserOptions: {
    project: './tsconfig.json',
  },
}
```

## 包含的规则

### 基础配置

- TypeScript 推荐规则
- 代码质量规则
- 现代 JavaScript 最佳实践

### React 配置

- React 推荐规则
- React Hooks 规则
- JSX 可访问性规则

### Next.js 配置

- Next.js 核心 Web Vitals
- Next.js 特定优化规则

### Node.js 配置

- Node.js 环境优化
- 导入顺序规则
