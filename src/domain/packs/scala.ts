import { createGate } from '../gate/gate.js';
import { createPack, type Pack } from '../pack/pack.js';

export const SCALA_PACK: Pack = createPack('scala', 'Scala', [
  createGate('format-check', 'sbt scalafmtCheckAll', 'fast'),
  createGate('lint', 'sbt "scalafix --check"', 'fast'),
  createGate('test', 'sbt test', 'slow'),
  createGate('ci-full', 'sbt "scalafmtCheckAll" "scalafix --check" test', 'ci'),
]);
