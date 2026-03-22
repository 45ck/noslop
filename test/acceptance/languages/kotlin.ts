import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { LanguageFixture } from '../harness/types.js';

const languagesDir = path.dirname(fileURLToPath(import.meta.url));
const fixturesRoot = path.resolve(languagesDir, '..', '..', '..', 'fixtures');

export const kotlinFixture: LanguageFixture = {
  packId: 'kotlin',
  displayName: 'Kotlin',
  fixtureDir: path.join(fixturesRoot, 'kotlin'),
  toolchainProbes: ['javac -version', 'gradle --version'],
  dependencyInstall: 'gradle wrapper --gradle-version 8.5 && ./gradlew build -x test --no-daemon',
  fastTimeoutMs: 120_000,
  slowTimeoutMs: 300_000,
  skipGates: ['lint'],
  defect: {
    relativePath: 'src/main/kotlin/calculator/Calculator.kt',
    find: '    fun add(a: Double, b: Double): Double {',
    replace: '    fun add(a: Double,  b: Double): Double {',
  },
};
