import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { LanguageFixture } from '../harness/types.js';

const languagesDir = path.dirname(fileURLToPath(import.meta.url));
const fixturesRoot = path.resolve(languagesDir, '..', '..', '..', 'fixtures');

export const haskellFixture: LanguageFixture = {
  packId: 'haskell',
  displayName: 'Haskell',
  fixtureDir: path.join(fixturesRoot, 'haskell'),
  toolchainProbes: ['ghc --version', 'cabal --version'],
  dependencyInstall: 'cabal update && cabal build --only-dependencies',
  fastTimeoutMs: 60_000,
  slowTimeoutMs: 180_000,
  skipGates: ['lint'],
  skipOnPlatforms: ['win32'],
  defect: {
    relativePath: 'src/Calculator.hs',
    find: 'add :: Double',
    replace: 'add  :: Double',
  },
};
