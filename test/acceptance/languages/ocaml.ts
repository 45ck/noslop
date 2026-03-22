import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { LanguageFixture } from '../harness/types.js';

const languagesDir = path.dirname(fileURLToPath(import.meta.url));
const fixturesRoot = path.resolve(languagesDir, '..', '..', '..', 'fixtures');

export const ocamlFixture: LanguageFixture = {
  packId: 'ocaml',
  displayName: 'OCaml',
  fixtureDir: path.join(fixturesRoot, 'ocaml'),
  toolchainProbes: ['ocaml --version', 'dune --version'],
  dependencyInstall: 'dune build',
  fastTimeoutMs: 60_000,
  slowTimeoutMs: 180_000,
  skipGates: ['lint'],
  defect: {
    relativePath: 'lib/calculator.ml',
    find: 'let add calc',
    replace: 'let  add calc',
  },
};
