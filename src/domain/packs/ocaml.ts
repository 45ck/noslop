import { createGate } from '../gate/gate.js';
import { createPack, type Pack } from '../pack/pack.js';

export const OCAML_PACK: Pack = createPack('ocaml', 'OCaml', [
  createGate(
    'format-check',
    'dune build @fmt --force 2>&1 | grep -q "." && exit 1 || exit 0',
    'fast',
  ),
  createGate('lint', 'dune build @check', 'fast'),
  createGate('test', 'dune runtest', 'slow'),
  createGate('ci-full', 'dune build @fmt @check && dune runtest', 'ci'),
]);
