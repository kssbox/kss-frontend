# @kssbox/tsconfig

共享的 TypeScript 配置包，为 monorepo 中的所有项目提供一致的 TypeScript 设置。

## 配置文件

- `base.json` - 基础 TypeScript 配置
- `react.json` - React 项目配置（继承 base.json）
- `nextjs.json` - Next.js 项目配置（继承 react.json）
- `node.json` - Node.js 项目配置（继承 base.json）

## 使用方法

在项目的 `tsconfig.json` 中：

```json
{
  "extends": "@kssbox/tsconfig/react.json",
  "compilerOptions": {
    "outDir": "dist"
  },
  "include": ["src"]
}
```

## 配置说明

### base.json

- 严格模式启用
- ES2020 目标
- 模块解析优化
- 源码映射和声明文件生成

### react.json

- 包含 DOM 类型
- JSX 支持（react-jsx）

### nextjs.json

- Next.js 特定优化
- 增量编译
- Next.js 插件支持

### node.json

- Node.js 环境优化
- 复合项目支持
