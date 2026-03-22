import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { LanguageFixture } from '../harness/types.js';

const languagesDir = path.dirname(fileURLToPath(import.meta.url));
const fixturesRoot = path.resolve(languagesDir, '..', '..', '..', 'fixtures');

export const swiftFixture: LanguageFixture = {
  packId: 'swift',
  displayName: 'Swift',
  fixtureDir: path.join(fixturesRoot, 'swift'),
  toolchainProbes: ['swift --version'],
  fastTimeoutMs: 60_000,
  slowTimeoutMs: 180_000,
  skipGates: ['lint'],
  skipOnPlatforms: ['win32'],
  defect: {
    relativePath: 'Sources/Calculator/Calculator.swift',
    find: 'func add(',
    replace: 'func  add(',
  },
};
