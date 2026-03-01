import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';
import sonarjs from 'eslint-plugin-sonarjs';
import eslintComments from 'eslint-plugin-eslint-comments';
import unicorn from 'eslint-plugin-unicorn';
import unusedImports from 'eslint-plugin-unused-imports';
import nPlugin from 'eslint-plugin-n';
import globals from 'globals';
import eslintConfigPrettier from 'eslint-config-prettier';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/coverage/**',
      '**/.tsbuildinfo/**',
      '**/reports/**',
      '**/node_modules/**',
      '**/.stryker-tmp/**',
    ],
  },

  js.configs.recommended,

  ...tseslint.configs.recommendedTypeChecked.map((c) => ({
    ...c,
    files: ['**/*.{ts,tsx,mts,cts}'],
  })),
  ...tseslint.configs.stylisticTypeChecked.map((c) => ({
    ...c,
    files: ['**/*.{ts,tsx,mts,cts}'],
  })),

  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2022,
      },
    },
    plugins: {
      import: importPlugin,
      sonarjs,
      'eslint-comments': eslintComments,
      unicorn,
      'unused-imports': unusedImports,
      n: nPlugin,
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: ['./tsconfig.json'],
        },
        node: true,
      },
    },
    rules: {
      // Complexity & size caps
      complexity: ['error', 10],
      'max-depth': ['error', 4],
      'max-lines-per-function': ['error', { max: 80, skipBlankLines: true, skipComments: true }],
      'max-lines': ['error', { max: 350, skipBlankLines: true, skipComments: true }],
      'max-params': ['error', 4],

      // Cognitive complexity
      'sonarjs/cognitive-complexity': ['error', 15],

      // Import hygiene
      'import/no-cycle': ['error', { maxDepth: 1 }],
      'import/no-unresolved': 'error',

      // Dead imports
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'error',
        { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' },
      ],
      // Disallow inline suppression. If a rule is wrong, fix the code or change
      // the rule globally in this config with a comment explaining why.
      'eslint-comments/no-use': 'error',
    },
  },

  // TypeScript-only rules that require type information.
  {
    files: ['**/*.{ts,tsx,mts,cts}'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' },
      ],

      // Maintainability: ban unsafe escape hatches
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/ban-ts-comment': [
        'error',
        {
          'ts-expect-error': 'allow-with-description',
          'ts-ignore': 'allow-with-description',
          'ts-nocheck': true,
          'ts-check': false,
          minimumDescriptionLength: 5,
        },
      ],
    },
  },

  // Tests can be longer/more verbose; keep production caps strict.
  // Mock port implementations idiomatically use async without await, unbound method
  // references (expect(obj.method)), and type-unsafe mocks — all standard Vitest patterns.
  {
    files: ['**/*.test.ts'],
    rules: {
      'max-lines': 'off',
      'max-lines-per-function': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-empty-function': 'off',
    },
  },

  // Scripts are production-critical, but allow more complexity and length than core code.
  {
    files: ['scripts/**/*.mjs'],
    rules: {
      complexity: 'off',
      'max-depth': 'off',
      'max-lines-per-function': 'off',
      'max-lines': 'off',
      'max-params': 'off',
      'sonarjs/cognitive-complexity': 'off',
    },
  },

  // In-memory adapter implementations are test doubles for external services.
  // They route many operations through a single switch and legitimately need
  // higher complexity/size budgets. require-await is off because they fulfil
  // async port contracts without real I/O.
  {
    files: ['src/infrastructure/adapters/**/in-memory-*.ts'],
    rules: {
      complexity: 'off',
      'max-depth': 'off',
      'max-lines-per-function': 'off',
      'max-lines': 'off',
      'max-params': 'off',
      'sonarjs/cognitive-complexity': 'off',
      '@typescript-eslint/require-await': 'off',
    },
  },

  // Real adapter implementations talk to external services.
  // They dispatch across many operations and legitimately need higher
  // complexity/size budgets.
  {
    files: [
      'src/infrastructure/adapters/**/*.ts',
      '!src/infrastructure/adapters/**/in-memory-*.ts',
    ],
    rules: {
      complexity: 'off',
      'max-depth': 'off',
      'max-lines-per-function': 'off',
      'max-lines': 'off',
      'max-params': 'off',
      'sonarjs/cognitive-complexity': 'off',
      '@typescript-eslint/no-base-to-string': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/consistent-type-imports': 'off',
      '@typescript-eslint/no-redundant-type-constituents': 'off',
    },
  },

  eslintConfigPrettier,
);
