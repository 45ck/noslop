import { createGate } from '../gate/gate.js';
import { createPack, type Pack } from '../pack/pack.js';

export const PYTHON_PACK: Pack = createPack('python', 'Python', [
  createGate('format-check', 'black --check .', 'fast'),
  createGate('lint', 'ruff check .', 'fast'),
  createGate('test', 'pytest', 'slow'),
  createGate('ci-full', 'black --check . && ruff check . && pytest', 'ci'),
]);
