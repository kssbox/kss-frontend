# Kssbox Package Migration Design

## Goal

Rebuild `/Volumes/doc/workspace/project/kss-frontend` as the new npm publishing workspace for reusable frontend base packages copied from `chatbot/frontend/packages`, excluding `agui-ui`.

## Package Naming

Use the new npm scope `@kssbox`.

- `@kssbox/ui` becomes `@kssbox/ui`.
- `@kssbox/eslint-config` becomes `@kssbox/eslint-config`.
- `@kssbox/tsconfig` becomes `@kssbox/tsconfig`.
- `@kssbox/build-config` becomes `@kssbox/build-config`.
- The old `i18n` package has no implementation source in the source repository, so it is migrated as documentation only unless implementation is added later.

## Workspace Architecture

Use a modern pnpm workspace instead of the old Lerna publishing flow. The root package should be private and provide scripts for recursive build, lint, and type checks. Turbo can be used for task orchestration because the source packages already use it.

The workspace should publish independently versioned packages from `packages/*`. The root repository is not published.

## Migration Scope

Copy reusable source package content from:

- `/Volumes/doc/workspace/project/kssbox/chatbot/frontend/packages/ui`
- `/Volumes/doc/workspace/project/kssbox/chatbot/frontend/packages/eslint-config`
- `/Volumes/doc/workspace/project/kssbox/chatbot/frontend/packages/tsconfig`
- `/Volumes/doc/workspace/project/kssbox/chatbot/frontend/packages/build-config`
- `/Volumes/doc/workspace/project/kssbox/chatbot/frontend/packages/i18n`

Do not copy:

- `packages/agui-ui`
- `node_modules`
- `.turbo`
- generated `dist`
- generated package tarballs

## Refactor Rules

- Replace old scope references in package metadata, examples, README files, TypeScript config, ESLint config, and internal workspace dependencies.
- `@kssbox/ui` should be the public shadcn-style React component package.
- Avoid adding any new file over 1000 lines.
- Existing source files over 1000 lines may remain during the first migration pass, but they should be called out as future refactor targets if they block maintainability.
- Keep public exports compatible where practical.

## Publishing Policy

Each publishable package should include:

- `publishConfig.access = "public"`
- npm registry set to `https://registry.npmjs.org/`
- package `files` that include only publishable artifacts and docs
- repository metadata pointing to the new `kss-frontend` repository

## Verification

The migration is considered ready for manual review when:

- `pnpm install` succeeds.
- `pnpm build` succeeds or any failure is traced to a concrete root cause.
- `pnpm type-check` succeeds or any failure is documented with exact files.
- `pnpm lint` succeeds or any failure is documented with exact files.
- `rg "@kssbox|ui|kss-frontend/lint"` shows no stale references in migrated package metadata and examples except intentional history or docs.

## Git Policy

This repository is not being used through a worktree for this task. Do not commit or push. Leave changes for manual review.
