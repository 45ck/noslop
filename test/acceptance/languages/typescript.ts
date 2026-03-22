import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { LanguageFixture } from '../harness/types.js';

const languagesDir = path.dirname(fileURLToPath(import.meta.url));
const fixturesRoot = path.resolve(languagesDir, '..', '..', '..', 'fixtures');

export const typescriptFixture: LanguageFixture = {
  packId: 'typescript',
  displayName: 'TypeScript',
  fixtureDir: path.join(fixturesRoot, 'typescript'),
  toolchainProbes: ['node --version'],
  dependencyInstall: 'npm install',
  fastTimeoutMs: 60_000,
  slowTimeoutMs: 180_000,
  defect: {
    relativePath: 'src/operations.ts',
    find: 'export function add(',
    replace: 'export function    add(',
  },
  skipGates: [],
};
