import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { LanguageFixture } from '../harness/types.js';

const languagesDir = path.dirname(fileURLToPath(import.meta.url));
const fixturesRoot = path.resolve(languagesDir, '..', '..', '..', 'fixtures');

export const luaFixture: LanguageFixture = {
  packId: 'lua',
  displayName: 'Lua',
  fixtureDir: path.join(fixturesRoot, 'lua'),
  toolchainProbes: ['lua -v', 'stylua --version'],
  fastTimeoutMs: 30_000,
  slowTimeoutMs: 60_000,
  defect: {
    relativePath: 'src/calculator.lua',
    find: 'local Calculator = {}',
    replace: 'local  Calculator  =  {}',
  },
  skipGates: ['lint'],
};
