import { createGate } from '../../gate/gate.js';
import { createPack, type Pack } from '../../pack/pack.js';

export const OCAML_PACK: Pack = createPack('ocaml', 'OCaml', [
  createGate('format-check', 'dune build @fmt', 'fast'),
  createGate('lint', 'dune build @check', 'fast'),
  createGate('spell', 'typos', 'fast'),
  createGate('build', 'dune build', 'slow'),
  createGate('test', 'dune runtest', 'slow'),
  createGate('ci-full', 'dune build @fmt @check && typos && dune build && dune runtest', 'ci'),
]);
