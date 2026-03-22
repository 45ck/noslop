import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { LanguageFixture } from '../harness/types.js';

const languagesDir = path.dirname(fileURLToPath(import.meta.url));
const fixturesRoot = path.resolve(languagesDir, '..', '..', '..', 'fixtures');

export const rustFixture: LanguageFixture = {
  packId: 'rust',
  displayName: 'Rust',
  fixtureDir: path.join(fixturesRoot, 'rust'),
  toolchainProbes: ['cargo --version'],
  fastTimeoutMs: 30_000,
  slowTimeoutMs: 120_000,
  defect: {
    relativePath: 'src/lib.rs',
    find: 'pub fn add(',
    replace: 'pub fn  add(',
  },
};
