import js from '@eslint/js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import importPlugin from 'eslint-plugin-import';
import tanstackQuery from '@tanstack/eslint-plugin-query';
import globals from 'globals';
import prettier from 'eslint-config-prettier';

export default [
  // Base recommended configs
  js.configs.recommended,
  prettier,

  // Global ignores
  {
    ignores: [
      'dist/',
      'node_modules/',
      '*.config.js',
      '*.config.cjs',
      '*.md',
      '*.mdx',
    ],
  },

  // Main configuration for all JS/JSX files
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.es2021,
        ...globals.node,
        browser: 'readonly',
        chrome: 'readonly',
      },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
      import: importPlugin,
      '@tanstack/query': tanstackQuery,
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx'],
        },
      },
    },
    rules: {
      // React rules
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',

      // JSX A11y rules
      ...jsxA11y.configs.recommended.rules,

      // React Query rules
      ...tanstackQuery.configs.recommended.rules,

      // Import rules
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
          'newlines-between': 'never',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],

      // General rules
      'no-console': 'off',
      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      'prefer-const': 'error',
      'no-var': 'error',

      // WebExtension specific rules
      'no-restricted-globals': [
        'error',
        {
          name: 'localStorage',
          message:
            'Use browser.storage API instead of localStorage in WebExtensions.',
        },
        {
          name: 'sessionStorage',
          message:
            'Use browser.storage API instead of sessionStorage in WebExtensions.',
        },
      ],
    },
  },

  // Content script specific rules
  {
    files: ['**/content/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.browser,
        browser: 'readonly',
        chrome: 'readonly',
      },
    },
    rules: {
      'no-console': 'off',
    },
  },

  // Background script specific rules
  {
    files: ['**/background/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.browser,
        browser: 'readonly',
        chrome: 'readonly',
      },
    },
  },

  // Test files
  {
    files: ['**/*.test.{js,jsx}', '**/*.spec.{js,jsx}'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    rules: {
      'no-console': 'off',
    },
  },
];
