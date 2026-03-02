import { describe, expect, it } from 'vitest';
import type { Pack } from '../../pack/pack.js';
import { HASKELL_PACK } from './haskell.js';

const gate = (pack: Pack, label: string) => pack.gates.find((g) => g.label === label);

describe('HASKELL_PACK', () => {
  it('has correct id and name', () => {
    expect(HASKELL_PACK.id).toBe('haskell');
    expect(HASKELL_PACK.name).toBe('Haskell');
  });

  it('has 6 gates', () => {
    expect(HASKELL_PACK.gates).toHaveLength(6);
  });

  it('format-check gate is fast and uses ormolu', () => {
    const g = gate(HASKELL_PACK, 'format-check');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toContain('ormolu');
  });

  it('lint gate is fast and uses hlint', () => {
    const g = gate(HASKELL_PACK, 'lint');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toContain('hlint');
  });

  it('spell gate is fast and uses typos', () => {
    const g = gate(HASKELL_PACK, 'spell');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toBe('typos');
  });

  it('build gate is slow and uses cabal build', () => {
    const g = gate(HASKELL_PACK, 'build');
    expect(g?.tier).toBe('slow');
    expect(g?.command).toContain('cabal build');
  });

  it('test gate is slow and uses cabal test', () => {
    const g = gate(HASKELL_PACK, 'test');
    expect(g?.tier).toBe('slow');
    expect(g?.command).toContain('cabal test');
  });

  it('ci-full includes all fast and slow commands', () => {
    const cmd = gate(HASKELL_PACK, 'ci-full')?.command ?? '';
    expect(cmd).toContain('ormolu');
    expect(cmd).toContain('hlint');
    expect(cmd).toContain('typos');
    expect(cmd).toContain('cabal build');
    expect(cmd).toContain('cabal test');
  });

  it('has no mutation gate', () => {
    expect(gate(HASKELL_PACK, 'mutation')).toBeUndefined();
  });
});
