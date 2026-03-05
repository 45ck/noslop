// @ts-check
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import sonarjs from 'eslint-plugin-sonarjs';
import unicorn from 'eslint-plugin-unicorn';
import globals from 'globals';
import eslintConfigPrettier from 'eslint-config-prettier';

export default tseslint.config(
  { ignores: ['**/dist/**', '**/coverage/**', '**/node_modules/**'] },

  js.configs.recommended,

  ...tseslint.configs.recommendedTypeChecked.map((c) => ({
    ...c,
    files: ['**/*.{ts,tsx,mts,cts}'],
  })),

  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      globals: { ...globals.node, ...globals.es2022 },
    },
  },

  {
    files: ['**/*.{ts,tsx,mts,cts}'],
    languageOptions: {
      globals: { ...globals.node, ...globals.es2022 },
      parserOptions: {
        projectService: true,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      sonarjs,
      unicorn,
    },
    rules: {
      // Complexity & size caps — enforced by noslop
      complexity: ['error', 10],
      'max-depth': ['error', 4],
      'max-lines-per-function': ['error', { max: 80, skipBlankLines: true, skipComments: true }],
      'max-lines': ['error', { max: 350, skipBlankLines: true, skipComments: true }],
      'max-params': ['error', 4],
      'sonarjs/cognitive-complexity': ['error', 15],

      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
    },
  },

  eslintConfigPrettier,
);
