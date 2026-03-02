import { createGate } from '../../gate/gate.js';
import { createPack, type Pack } from '../../pack/pack.js';

export const JAVA_PACK: Pack = createPack('java', 'Java', [
  createGate('format-check', './gradlew checkstyleMain checkstyleTest -q', 'fast'),
  createGate('lint', './gradlew pmdMain -q', 'fast'),
  createGate('spell', 'typos', 'fast'),
  createGate('build', './gradlew build -x test', 'slow'),
  createGate('test', './gradlew test', 'slow'),
  createGate(
    'ci-full',
    './gradlew checkstyleMain checkstyleTest -q && ./gradlew pmdMain -q && typos && ./gradlew build -x test && ./gradlew test',
    'ci',
  ),
  createGate('mutation', './gradlew pitest', 'ci'),
]);
