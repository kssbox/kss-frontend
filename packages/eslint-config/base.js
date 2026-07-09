import js from '@eslint/js'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'

const tsFiles = ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts']
const [tsBaseConfig, ...tsRecommendedConfigs] =
  tsPlugin.configs['flat/recommended-type-checked']

const typeCheckedConfigs = [
  {
    ...tsBaseConfig,
    files: tsFiles,
    languageOptions: {
      ...(tsBaseConfig.languageOptions ?? {}),
      parser: tsParser,
      parserOptions: {
        ...(tsBaseConfig.languageOptions?.parserOptions ?? {}),
        projectService: true,
      },
    },
  },
  ...tsRecommendedConfigs.map((config) => ({
    ...config,
    files: tsFiles,
  })),
]

export default [
  js.configs.recommended,
  // TODO enable typeCheckedConfigs after migrating to TypeScript
  // ...typeCheckedConfigs,
  {
    linterOptions: {
      reportUnusedDisableDirectives: 'warn',
    },
  },
  {
    files: tsFiles,
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    languageOptions: {
      parser: tsParser,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-non-null-assertion': 'warn',
    },
  },
  {
    rules: {
      'no-console': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',
      'no-unused-vars': 'off', // TODO rm this line when migration is complete
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      'import/no-cycle': 'off',
      'import/no-unresolved': 'off',
      'import/no-extraneous-dependencies': 'off',
    },
  },
  {
    ignores: [
      'dist/**',
      'build/**',
      '.next/**',
      'node_modules/**',
      '**/.turbo/**',
      '**/storybook-static/**',
      '**/.vite/**',
      '**/coverage/**',
      '**/*.d.ts',
      'pnpm-lock.yaml',
      '**/.cache/**',
    ],
  },
]
