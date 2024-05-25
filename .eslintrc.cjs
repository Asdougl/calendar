/** @type {import("eslint").Linter.Config} */
const config = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: true,
  },
  plugins: ['@typescript-eslint', 'react-refresh'],
  extends: [
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended-type-checked',
    'plugin:@typescript-eslint/stylistic-type-checked',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:lodash/recommended',
    'prettier',
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
    'react/react-in-jsx-scope': 0,
    'react/prop-types': 0, // pointless in TS
    'import/order': 2,
    'import/namespace': 0,
    'no-warning-comments': [2, { terms: ['TODO', 'FIXME'], location: 'start' }],
    'no-console': 1,
    'lodash/prefer-lodash-method': 0,
    'lodash/prefer-constant': 0,
    'lodash/prefer-lodash-typecheck': 0,
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    'jsx-a11y/label-has-associated-control': 'off', // caused too many false positives
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
