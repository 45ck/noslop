import { describe, expect, it } from 'vitest';
import type { Pack } from '../../pack/pack.js';
import { OCAML_PACK } from './ocaml.js';

const gate = (pack: Pack, label: string) => pack.gates.find((g) => g.label === label);

describe('OCAML_PACK', () => {
  it('has correct id and name', () => {
    expect(OCAML_PACK.id).toBe('ocaml');
    expect(OCAML_PACK.name).toBe('OCaml');
  });

  it('has 6 gates', () => {
    expect(OCAML_PACK.gates).toHaveLength(6);
  });

  it('format-check gate is fast with exact command', () => {
    const g = gate(OCAML_PACK, 'format-check');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toBe('dune build @fmt');
  });

  it('lint gate is fast with exact command', () => {
    const g = gate(OCAML_PACK, 'lint');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toBe('dune build @check');
  });

  it('spell gate is fast with exact command', () => {
    const g = gate(OCAML_PACK, 'spell');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toBe('typos');
  });

  it('build gate is slow with exact command', () => {
    const g = gate(OCAML_PACK, 'build');
    expect(g?.tier).toBe('slow');
    expect(g?.command).toBe('dune build');
  });

  it('test gate is slow with exact command', () => {
    const g = gate(OCAML_PACK, 'test');
    expect(g?.tier).toBe('slow');
    expect(g?.command).toBe('dune runtest');
  });

  it('ci-full gate is ci tier with exact command', () => {
    const g = gate(OCAML_PACK, 'ci-full');
    expect(g?.tier).toBe('ci');
    expect(g?.command).toBe('dune build @fmt @check && typos && dune build && dune runtest');
  });

  it('has no mutation gate', () => {
    expect(gate(OCAML_PACK, 'mutation')).toBeUndefined();
  });
});
