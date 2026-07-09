import reactConfig from '@kssbox/eslint-config/react.js'

export default [
  ...reactConfig,
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
]
