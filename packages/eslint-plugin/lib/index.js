'use strict'

const rules = require('./rules')

module.exports = {
  configs: {
    all: {
      plugins: [
        '@kss-frontend'
      ],
      rules: {
        '@kss-frontend/no-optional-chaining': 'error',
        '@kss-frontend/space-between-cn-en': 'error',
        '@kss-frontend/naming-convention': 'error',

      }
    },
    recommended: {
      plugins: [
        '@kss-frontend'
      ],
      rules: {
        '@kss-frontend/space-between-cn-en': 'warn',
        '@kss-frontend/naming-convention': 'warn',
      }
    }
  },
  rules
}
