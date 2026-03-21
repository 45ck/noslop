import { createGate } from '../../gate/gate.js';
import { createPack, type Pack } from '../../pack/pack.js';

export const JAVASCRIPT_PACK: Pack = createPack('javascript', 'JavaScript', [
  createGate('format-check', 'npx prettier --check .', 'fast'),
  createGate('lint', 'npx eslint .', 'fast'),
  createGate('spell', 'cspell --no-progress "src/**/*"', 'fast'),
  createGate('test', 'npm test', 'slow'),
  createGate(
    'ci-full',
    'npx prettier --check . && npx eslint . && cspell --no-progress "src/**/*" && npm test',
    'ci',
  ),
  createGate('mutation', 'npx stryker run', 'ci'),
]);
