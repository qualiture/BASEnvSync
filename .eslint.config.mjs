import eslint from '@eslint/js';
import tseslint from '@eslint/typescript';
import { files } from 'jszip';
import ts from 'typescript';

export default tseslint.config(
    eslint.config.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    ...tseslint.configs.stylistic,
    {
        files: ['**/*.ts'],
    }
)