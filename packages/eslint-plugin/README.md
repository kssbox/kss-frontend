# @kss-frontend/eslint-plugin

naming convention

## Installation

You'll first need to install [ESLint](https://eslint.org/):

```sh
npm i eslint --save-dev
```

Next, install `@kss-frontend/eslint-plugin`:

```sh
npm install @kss-frontend/eslint-plugin --save-dev
```

## Usage

Add `@kss-frontend` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
    "plugins": [
        "@kss-frontend"
    ]
}
```

Then configure the rules you want to use under the rules section.

```json
{
    "rules": {
        "@kss-frontend/naming-convention": 2
    }
}
```

## Rules

<!-- begin auto-generated rules list -->
TODO: Run eslint-doc-generator to generate the rules list.
<!-- end auto-generated rules list -->
