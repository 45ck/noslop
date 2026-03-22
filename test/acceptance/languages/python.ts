import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { LanguageFixture } from '../harness/types.js';

const languagesDir = path.dirname(fileURLToPath(import.meta.url));
const fixturesRoot = path.resolve(languagesDir, '..', '..', '..', 'fixtures');

export const pythonFixture: LanguageFixture = {
  packId: 'python',
  displayName: 'Python',
  fixtureDir: path.join(fixturesRoot, 'python'),
  toolchainProbes: ['python --version', 'black --version', 'ruff --version'],
  dependencyInstall: 'pip install --user black mypy pytest ruff',
  fastTimeoutMs: 60_000,
  slowTimeoutMs: 180_000,
  defect: {
    relativePath: 'calculator.py',
    find: 'class Calculator:',
    replace: 'class  Calculator:',
  },
  skipGates: ['lint'],
};
