import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { LanguageFixture } from '../harness/types.js';

const languagesDir = path.dirname(fileURLToPath(import.meta.url));
const fixturesRoot = path.resolve(languagesDir, '..', '..', '..', 'fixtures');

export const elixirFixture: LanguageFixture = {
  packId: 'elixir',
  displayName: 'Elixir',
  fixtureDir: path.join(fixturesRoot, 'elixir'),
  toolchainProbes: ['elixir --version', 'mix --version'],
  dependencyInstall: 'mix deps.get',
  fastTimeoutMs: 60_000,
  slowTimeoutMs: 180_000,
  defect: {
    relativePath: 'lib/calculator.ex',
    find: 'defmodule Calculator do',
    replace: 'defmodule  Calculator  do',
  },
  skipGates: ['lint', 'typecheck'],
};
