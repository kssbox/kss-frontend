# @kss-frontend/lint

## Description

Provide eslint and stylelint default config, some useful rules, quick start your project.

## Installation

First install `@kss-frontend/lint`:

```sh
npm install @kss-frontend/lint --save-dev
```

## Usage

Add `@kss-frontend/lint` to the plugins section of your `.eslintrc.js` configuration file. You can omit the `eslint-plugin-` prefix:

```js
module.exports = {
  extends: [require.resolve('@kss-frontend/lint/eslint')],
  rules: {
    '@typescript-eslint/no-unused-vars': ['warn']
  }
};

```
