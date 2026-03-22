import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { LanguageFixture } from '../harness/types.js';

const languagesDir = path.dirname(fileURLToPath(import.meta.url));
const fixturesRoot = path.resolve(languagesDir, '..', '..', '..', 'fixtures');

export const cppFixture: LanguageFixture = {
  packId: 'cpp',
  displayName: 'C++',
  fixtureDir: path.join(fixturesRoot, 'cpp'),
  toolchainProbes: ['cmake --version', 'clang-format --version'],
  fastTimeoutMs: 30_000,
  slowTimeoutMs: 120_000,
  defect: {
    relativePath: 'src/calculator.cpp',
    find: '#include "calculator.h"',
    replace: '#include  "calculator.h"',
  },
  skipGates: ['lint'],
  skipOnPlatforms: ['win32'],
};
