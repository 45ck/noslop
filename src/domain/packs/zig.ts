import { createGate } from '../gate/gate.js';
import { createPack, type Pack } from '../pack/pack.js';

export const ZIG_PACK: Pack = createPack('zig', 'Zig', [
  createGate('format-check', 'zig fmt --check src/', 'fast'),
  createGate('lint', 'zig build', 'fast'),
  createGate('test', 'zig build test', 'slow'),
  createGate('ci-full', 'zig fmt --check src/ && zig build && zig build test', 'ci'),
]);
