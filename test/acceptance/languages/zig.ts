import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { LanguageFixture } from '../harness/types.js';

const languagesDir = path.dirname(fileURLToPath(import.meta.url));
const fixturesRoot = path.resolve(languagesDir, '..', '..', '..', 'fixtures');

export const zigFixture: LanguageFixture = {
  packId: 'zig',
  displayName: 'Zig',
  fixtureDir: path.join(fixturesRoot, 'zig'),
  toolchainProbes: ['zig version'],
  fastTimeoutMs: 30_000,
  slowTimeoutMs: 120_000,
  defect: {
    relativePath: 'src/calculator.zig',
    find: 'pub fn add(',
    replace: 'pub fn  add(',
  },
};
