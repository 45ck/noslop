import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { LanguageFixture } from '../harness/types.js';

const languagesDir = path.dirname(fileURLToPath(import.meta.url));
const fixturesRoot = path.resolve(languagesDir, '..', '..', '..', 'fixtures');

export const javascriptFixture: LanguageFixture = {
  packId: 'javascript',
  displayName: 'JavaScript',
  fixtureDir: path.join(fixturesRoot, 'javascript'),
  toolchainProbes: ['node --version'],
  dependencyInstall: 'npm install',
  fastTimeoutMs: 60_000,
  slowTimeoutMs: 120_000,
  defect: {
    relativePath: 'src/operations.js',
    find: 'export function add(',
    replace: 'export function    add(',
  },
  skipGates: [],
};
