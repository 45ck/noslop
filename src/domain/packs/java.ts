import { createGate } from '../gate/gate.js';
import { createPack, type Pack } from '../pack/pack.js';

export const JAVA_PACK: Pack = createPack('java', 'Java', [
  createGate('format-check', './gradlew checkstyleMain checkstyleTest -q', 'fast'),
  createGate('lint', './gradlew pmdMain -q', 'fast'),
  createGate('test', './gradlew test', 'slow'),
  createGate('ci-full', './gradlew checkstyleMain checkstyleTest pmdMain test', 'ci'),
]);
