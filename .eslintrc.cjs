/** @type {import("eslint").Linter.Config} */
const config = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: true,
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended-type-checked',
    'plugin:@typescript-eslint/stylistic-type-checked',
    '@asdougl',
  ],
  rules: {
    // These opinionated rules are enabled in stylistic-type-checked above.
    // Feel free to reconfigure them to your own preference.
    '@typescript-eslint/array-type': 'off',
    '@typescript-eslint/consistent-type-definitions': 'off',

    '@typescript-eslint/consistent-type-imports': [
      'warn',
      {
        prefer: 'type-imports',
        fixStyle: 'inline-type-imports',
      },
    ],
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-misused-promises': [
      2,
      {
        checksVoidReturn: { attributes: false },
      },
    ],
    '@typescript-eslint/prefer-nullish-coalescing': 0,
    'react/jsx-props-no-spreading': 0,
    'lodash/prefer-is-nil': 0,
  },
  overrides: [
    {
      files: ['page.tsx', 'layout.tsx', 'src/trpc/**/*.tsx'],
      rules: {
        'react-refresh/only-export-components': 0,
      },
    },
    {
      files: ['*.test.ts', '*.test.tsx'],
      rules: {
        '@typescript-eslint/no-floating-promises': 0,
      },
    },
  ],
}

module.exports = config
