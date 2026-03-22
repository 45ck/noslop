import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { LanguageFixture } from '../harness/types.js';

const languagesDir = path.dirname(fileURLToPath(import.meta.url));
const fixturesRoot = path.resolve(languagesDir, '..', '..', '..', 'fixtures');

export const rubyFixture: LanguageFixture = {
  packId: 'ruby',
  displayName: 'Ruby',
  fixtureDir: path.join(fixturesRoot, 'ruby'),
  toolchainProbes: ['ruby --version', 'bundle --version'],
  dependencyInstall: 'bundle install',
  fastTimeoutMs: 60_000,
  slowTimeoutMs: 120_000,
  defect: {
    relativePath: 'lib/calculator.rb',
    find: 'class Calculator',
    replace: 'class  Calculator',
  },
  skipGates: ['lint'],
};
