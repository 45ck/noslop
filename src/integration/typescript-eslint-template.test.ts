import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(currentDir, '..', '..');
const eslintTemplate = path.join(
  projectRoot,
  'templates',
  'packs',
  'typescript',
  'eslint.config.js',
);

describe('typescript eslint template', () => {
  it('registers the @typescript-eslint plugin where its rules are used', () => {
    const content = readFileSync(eslintTemplate, 'utf8');
    expect(content).toContain("files: ['**/*.{js,mjs,cjs}']");
    expect(content).toContain("files: ['**/*.{ts,tsx,mts,cts}']");
    expect(content).toContain("'@typescript-eslint': tseslint.plugin");
    expect(content).toContain("'@typescript-eslint/no-explicit-any'");
    expect(content).toContain("'@typescript-eslint/no-floating-promises'");
  });
});
