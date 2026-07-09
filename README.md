# kss-frontend

Kssbox frontend base packages.

## Packages

- `@kssbox/ui`: shadcn-style React UI component library.
- `@kssbox/eslint-config`: shared ESLint flat configs.
- `@kssbox/tsconfig`: shared TypeScript configs.
- `@kssbox/build-config`: shared tsup and Vite config helpers.
- `@kssbox/i18n`: documentation-only for now; not published until implementation source is added.

## Install

```bash
pnpm add @kssbox/ui
```

## Development

```bash
pnpm install

pnpm --filter @kssbox/playground dev # --port 5175

pnpm build
pnpm type-check
pnpm lint
```
