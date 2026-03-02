import { createGate } from '../gate/gate.js';
import { createPack, type Pack } from '../pack/pack.js';

export const JAVASCRIPT_PACK: Pack = createPack('javascript', 'JavaScript', [
  createGate('format-check', 'npx prettier --check .', 'fast'),
  createGate('lint', 'npx eslint .', 'fast'),
  createGate('test', 'npm test', 'slow'),
  createGate('ci-full', 'npx prettier --check . && npx eslint . && npm test', 'ci'),
]);
