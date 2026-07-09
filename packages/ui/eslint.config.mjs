import bizReactConfig from '@kssbox/eslint-config/react.js'

export default [
  ...bizReactConfig,
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      'storybook-static/**',
      '.storybook/**',
    ],
  },
]
