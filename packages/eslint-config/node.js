import base from './base.js'
import globals from 'globals'

export default [
  ...base,
  {
    globals: {
      ...globals.node,
    },
    rules: {
      // Node.js specific rules
      'no-console': 'off', // Console is ok in Node.js
      'no-process-env': 'off',

      // Import rules for Node.js
      'import/no-unresolved': 'error',
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          'newlines-between': 'always',
        },
      ],
    },
  }]
