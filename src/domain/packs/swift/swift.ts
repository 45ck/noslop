import { createGate } from '../../gate/gate.js';
import { createPack, type Pack } from '../../pack/pack.js';

export const SWIFT_PACK: Pack = createPack('swift', 'Swift', [
  createGate('format-check', 'swift-format lint --recursive .', 'fast'),
  createGate('lint', 'swiftlint lint', 'fast'),
  createGate('spell', 'typos', 'fast'),
  createGate('build', 'swift build', 'slow'),
  createGate('test', 'swift test', 'slow'),
  createGate(
    'ci-full',
    'swift-format lint --recursive . && swiftlint lint && typos && swift build && swift test',
    'ci',
  ),
]);
