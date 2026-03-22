import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { LanguageFixture } from '../harness/types.js';

const languagesDir = path.dirname(fileURLToPath(import.meta.url));
const fixturesRoot = path.resolve(languagesDir, '..', '..', '..', 'fixtures');

export const dartFixture: LanguageFixture = {
  packId: 'dart',
  displayName: 'Dart',
  fixtureDir: path.join(fixturesRoot, 'dart'),
  toolchainProbes: ['dart --version'],
  dependencyInstall: 'dart pub get',
  fastTimeoutMs: 60_000,
  slowTimeoutMs: 180_000,
  defect: {
    relativePath: 'lib/calculator.dart',
    find: 'double add(',
    replace: 'double  add(',
  },
};
