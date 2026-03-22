import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { LanguageFixture } from '../harness/types.js';

const languagesDir = path.dirname(fileURLToPath(import.meta.url));
const fixturesRoot = path.resolve(languagesDir, '..', '..', '..', 'fixtures');

export const phpFixture: LanguageFixture = {
  packId: 'php',
  displayName: 'PHP',
  fixtureDir: path.join(fixturesRoot, 'php'),
  toolchainProbes: ['php --version', 'composer --version'],
  dependencyInstall: 'composer install',
  fastTimeoutMs: 60_000,
  slowTimeoutMs: 120_000,
  defect: {
    relativePath: 'src/Calculator.php',
    find: 'final class Calculator',
    replace: 'final  class  Calculator',
  },
  skipGates: ['lint'],
};
