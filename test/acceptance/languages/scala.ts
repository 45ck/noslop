import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { LanguageFixture } from '../harness/types.js';

const languagesDir = path.dirname(fileURLToPath(import.meta.url));
const fixturesRoot = path.resolve(languagesDir, '..', '..', '..', 'fixtures');

export const scalaFixture: LanguageFixture = {
  packId: 'scala',
  displayName: 'Scala',
  fixtureDir: path.join(fixturesRoot, 'scala'),
  toolchainProbes: ['javac -version', 'sbt --version'],
  fastTimeoutMs: 180_000,
  slowTimeoutMs: 300_000,
  skipGates: ['lint'],
  defect: {
    relativePath: 'src/main/scala/calculator/Calculator.scala',
    find: '  def add(a: Double, b: Double): Double = {',
    replace: '  def add(a: Double,  b: Double): Double = {',
  },
};
