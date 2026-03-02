import { createGate } from '../gate/gate.js';
import { createPack, type Pack } from '../pack/pack.js';

export const KOTLIN_PACK: Pack = createPack('kotlin', 'Kotlin', [
  createGate('format-check', './gradlew ktlintCheck', 'fast'),
  createGate('lint', './gradlew detekt', 'fast'),
  createGate('test', './gradlew test', 'slow'),
  createGate('ci-full', './gradlew ktlintCheck detekt test', 'ci'),
]);
