import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { LanguageFixture } from '../harness/types.js';

const languagesDir = path.dirname(fileURLToPath(import.meta.url));
const fixturesRoot = path.resolve(languagesDir, '..', '..', '..', 'fixtures');

export const goFixture: LanguageFixture = {
  packId: 'go',
  displayName: 'Go',
  fixtureDir: path.join(fixturesRoot, 'go'),
  toolchainProbes: ['go version'],
  fastTimeoutMs: 30_000,
  slowTimeoutMs: 120_000,
  defect: {
    relativePath: 'calculator.go',
    find: 'func (c *Calculator) Add(',
    replace: 'func (c *Calculator)  Add(',
  },
  skipOnPlatforms: ['win32'],
};
