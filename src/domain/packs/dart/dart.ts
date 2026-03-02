import { createGate } from '../../gate/gate.js';
import { createPack, type Pack } from '../../pack/pack.js';

export const DART_PACK: Pack = createPack('dart', 'Dart', [
  createGate('format-check', 'dart format --output=none --set-exit-if-changed .', 'fast'),
  createGate('lint', 'dart analyze', 'fast'),
  createGate('spell', 'typos', 'fast'),
  createGate('test', 'dart test', 'slow'),
  createGate(
    'ci-full',
    'dart format --output=none --set-exit-if-changed . && dart analyze && typos && dart test',
    'ci',
  ),
]);
