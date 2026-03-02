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

  it('format-check gate is fast and uses dune build @fmt', () => {
    const g = gate(OCAML_PACK, 'format-check');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toContain('dune build @fmt');
  });

  it('lint gate is fast and uses dune build @check', () => {
    const g = gate(OCAML_PACK, 'lint');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toContain('dune build @check');
  });

  it('spell gate is fast and uses typos', () => {
    const g = gate(OCAML_PACK, 'spell');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toBe('typos');
  });

  it('build gate is slow and uses dune build', () => {
    const g = gate(OCAML_PACK, 'build');
    expect(g?.tier).toBe('slow');
    expect(g?.command).toContain('dune build');
  });

  it('test gate is slow and uses dune runtest', () => {
    const g = gate(OCAML_PACK, 'test');
    expect(g?.tier).toBe('slow');
    expect(g?.command).toContain('dune runtest');
  });

  it('ci-full includes all fast and slow commands', () => {
    const cmd = gate(OCAML_PACK, 'ci-full')?.command ?? '';
    expect(cmd).toContain('dune build @fmt');
    expect(cmd).toContain('@check');
    expect(cmd).toContain('typos');
    expect(cmd).toContain('dune build');
    expect(cmd).toContain('dune runtest');
  });

  it('has no mutation gate', () => {
    expect(gate(OCAML_PACK, 'mutation')).toBeUndefined();
  });
});
