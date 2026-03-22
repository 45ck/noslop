import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { LanguageFixture } from '../harness/types.js';

const languagesDir = path.dirname(fileURLToPath(import.meta.url));
const fixturesRoot = path.resolve(languagesDir, '..', '..', '..', 'fixtures');

export const dotnetFixture: LanguageFixture = {
  packId: 'dotnet',
  displayName: '.NET',
  fixtureDir: path.join(fixturesRoot, 'dotnet'),
  toolchainProbes: ['dotnet --version'],
  dependencyInstall: 'dotnet restore',
  fastTimeoutMs: 60_000,
  slowTimeoutMs: 180_000,
  defect: {
    relativePath: 'src/Calculator/Calculator.cs',
    find: '    public double Add(double a, double b)',
    replace: '      public double Add(double a, double b)',
  },
};
