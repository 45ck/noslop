import { createGate } from '../../gate/gate.js';
import { createPack, type Pack } from '../../pack/pack.js';

export const HASKELL_PACK: Pack = createPack('haskell', 'Haskell', [
  createGate(
    'format-check',
    'ormolu --mode=check $(find . -name "*.hs" -not -path "./.stack-work/*")',
    'fast',
  ),
  createGate('lint', 'hlint .', 'fast'),
  createGate('spell', 'typos', 'fast'),
  createGate('build', 'cabal build', 'slow'),
  createGate('test', 'cabal test', 'slow'),
  createGate(
    'ci-full',
    'ormolu --mode=check $(find . -name "*.hs" -not -path "./.stack-work/*") && hlint . && typos && cabal build && cabal test',
    'ci',
  ),
]);
