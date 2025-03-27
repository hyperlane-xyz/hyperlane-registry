import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import tsparser from '@typescript-eslint/parser';
import eslintPluginYml from 'eslint-plugin-yml';
import yamlParser from 'yaml-eslint-parser';
import customPlugin from './eslint-rules/index.js';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        project: './tsconfig.json',
      },
    },
    plugins: {
      custom: customPlugin,
    },
    rules: {
      'no-console': ['error'],
      'no-eval': ['error'],
      'no-extra-boolean-cast': ['error'],
      'no-ex-assign': ['error'],
      'no-constant-condition': ['off'],
      'guard-for-in': ['error'],
      '@typescript-eslint/ban-ts-comment': ['off'],
      '@typescript-eslint/explicit-module-boundary-types': ['off'],
      '@typescript-eslint/no-explicit-any': ['off'],
      '@typescript-eslint/no-floating-promises': ['error'],
      '@typescript-eslint/no-non-null-assertion': ['off'],
      '@typescript-eslint/no-require-imports': ['warn'],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'custom/no-restricted-imports-from-exports': [
        'error',
        {
          mainEntry: './src/index.ts',
          restrictedEntry: './src/index-fs.ts',
        },
      ],
    },
    ignores: ['node_modules', 'dist', 'tmp'],
  },
  ...eslintPluginYml.configs['flat/standard'],
  {
    files: ['chains/**/*.yaml', 'deployments/**/*.yaml'],
    languageOptions: {
      parser: yamlParser,
    },
    rules: {
      'yml/sort-keys': ['error'],
    },
  },
);
