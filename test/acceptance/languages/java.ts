import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { LanguageFixture } from '../harness/types.js';

const languagesDir = path.dirname(fileURLToPath(import.meta.url));
const fixturesRoot = path.resolve(languagesDir, '..', '..', '..', 'fixtures');

export const javaFixture: LanguageFixture = {
  packId: 'java',
  displayName: 'Java',
  fixtureDir: path.join(fixturesRoot, 'java'),
  toolchainProbes: ['javac -version', 'gradle --version'],
  dependencyInstall: 'gradle wrapper --gradle-version 8.5 && ./gradlew build -x test --no-daemon',
  fastTimeoutMs: 120_000,
  slowTimeoutMs: 300_000,
  skipGates: ['lint'],
  defect: {
    relativePath: 'src/main/java/calculator/Calculator.java',
    find: '    public double add(double a, double b) {',
    replace:
      '    public double add(double a, double b)                                                                               {',
  },
};
