# Kssbox Package Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move reusable frontend packages from `chatbot/frontend/packages` into `kss-frontend` under the new `@kssbox` npm scope.

**Architecture:** Replace the old Lerna-centered workspace with a pnpm workspace using copied package sources and modern package scripts. Keep package boundaries simple: `ui`, `eslint-config`, `tsconfig`, `build-config`, and documentation-only `i18n`.

**Tech Stack:** pnpm workspace, TypeScript, tsup, Turbo, ESLint 9 flat config, React 19 peer dependencies.

---

### Task 1: Prepare Workspace Metadata

**Files:**
- Modify: `package.json`
- Modify: `pnpm-workspace.yaml`
- Modify: `tsconfig.json`
- Remove: `lerna.json`
- Remove: `rollup.config.mjs`

- [ ] **Step 1: Update root scripts and dev dependencies**

Set root `package.json` to a private pnpm workspace package with recursive scripts:

```json
{
  "name": "kss-frontend",
  "version": "0.1.0",
  "private": true,
  "description": "Kssbox frontend base packages.",
  "scripts": {
    "build": "turbo build",
    "lint": "turbo lint",
    "lint:fix": "turbo lint -- --fix",
    "type-check": "turbo type-check",
    "clean": "turbo clean",
    "pre-commit": "lint-staged",
    "reset": "pnpm run clean && rm -rf node_modules **/node_modules && pnpm install"
  },
  "devDependencies": {
    "@commitlint/cli": "^20.1.0",
    "@commitlint/config-conventional": "^20.0.0",
    "@types/node": "catalog:",
    "lint-staged": "^15.0.0",
    "prettier": "^3.0.0",
    "tsx": "^4.20.6",
    "turbo": "^2.0.0",
    "typescript": "catalog:"
  },
  "packageManager": "pnpm@9.12.3"
}
```

- [ ] **Step 2: Keep package discovery scoped to packages**

Set `pnpm-workspace.yaml` to include `packages/*` and catalogs copied from the source workspace for React, TypeScript, ESLint, Vite, Storybook, Tailwind, and shared library versions.

- [ ] **Step 3: Point root TypeScript at the new config package**

Set root `tsconfig.json` to extend `./packages/tsconfig/base.json` and include package source and story files.

- [ ] **Step 4: Remove old Lerna and Rollup root config**

Delete `lerna.json` and root `rollup.config.mjs` because package builds will use package-local `tsup` or config-package helpers.

### Task 2: Copy Source Packages

**Files:**
- Create or replace: `packages/ui`
- Create or replace: `packages/eslint-config`
- Create or replace: `packages/tsconfig`
- Create or replace: `packages/build-config`
- Create or replace: `packages/i18n`
- Remove: `packages/eslint-plugin`
- Remove: `packages/lint`

- [ ] **Step 1: Remove stale target package folders for replaced packages**

Remove target folders that conflict with new copied package names. Remove legacy `packages/eslint-plugin` and `packages/lint` because the new `@kssbox/eslint-config` package replaces them and the old packages depend on the removed Lerna/Rollup workflow.

- [ ] **Step 2: Copy package sources**

Copy from the source repository while excluding `node_modules`, `.turbo`, `dist`, generated tarballs, and package-manager artifacts.

- [ ] **Step 3: Rename `packages/ui` to `packages/ui`**

Place the shadcn-style component package at `packages/ui`.

### Task 3: Rewrite Package Names and Internal References

**Files:**
- Modify: `packages/ui/package.json`
- Modify: `packages/ui/tsconfig.json`
- Modify: `packages/ui/eslint.config.mjs`
- Modify: `packages/eslint-config/package.json`
- Modify: `packages/tsconfig/package.json`
- Modify: `packages/build-config/package.json`
- Modify: `packages/i18n/package.json`
- Modify docs and README files under migrated packages

- [ ] **Step 1: Rewrite package metadata**

Use:

```text
@kssbox/ui
@kssbox/eslint-config
@kssbox/tsconfig
@kssbox/build-config
@kssbox/i18n
```

- [ ] **Step 2: Rewrite internal workspace dependencies**

Change workspace references from `@kssbox/*` to `@kssbox/*`.

- [ ] **Step 3: Rewrite examples and README imports**

Update examples from `@kssbox/ui` and `@kssbox/i18n` to `@kssbox/ui` and `@kssbox/i18n`.

- [ ] **Step 4: Rewrite repository metadata**

Set repository metadata to the new `kss-frontend` repository and correct package directory names.

### Task 4: Normalize Publishable Package Configuration

**Files:**
- Modify: `packages/ui/package.json`
- Modify: `packages/eslint-config/package.json`
- Modify: `packages/tsconfig/package.json`
- Modify: `packages/build-config/package.json`
- Modify: `packages/i18n/package.json`

- [ ] **Step 1: Make package publish settings explicit**

Set `publishConfig.registry` to `https://registry.npmjs.org/` and `publishConfig.access` to `public` for public packages.

- [ ] **Step 2: Keep `i18n` non-published unless source exists**

If `packages/i18n/src` is still absent, mark `@kssbox/i18n` as private and document that it is not ready for npm.

- [ ] **Step 3: Keep React external in `@kssbox/ui`**

Ensure `react` and `react-dom` stay in peer dependencies and tsup externals.

### Task 5: Verify and Triage

**Files:**
- Modify only files required by concrete verification failures.

- [ ] **Step 1: Install dependencies**

Run:

```bash
pnpm install
```

Expected: install completes.

- [ ] **Step 2: Check stale references**

Run:

```bash
rg "@kssbox|@kssbox/lint|ui" packages package.json pnpm-workspace.yaml tsconfig.json docs
```

Expected: no stale references in package metadata or examples except intentional historical notes.

- [ ] **Step 3: Build**

Run:

```bash
pnpm build
```

Expected: all build tasks complete. If not, follow systematic debugging and document exact root cause before fixing.

- [ ] **Step 4: Type-check**

Run:

```bash
pnpm type-check
```

Expected: all type-check tasks complete. If not, follow systematic debugging and document exact root cause before fixing.

- [ ] **Step 5: Lint**

Run:

```bash
pnpm lint
```

Expected: all lint tasks complete. If not, follow systematic debugging and document exact root cause before fixing.

- [ ] **Step 6: Review git diff**

Run:

```bash
git status --short
git diff --stat
```

Expected: changes are limited to migration files and no commit is made.
