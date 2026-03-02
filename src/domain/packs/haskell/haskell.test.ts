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

  it('format-check gate is fast with exact command', () => {
    const g = gate(HASKELL_PACK, 'format-check');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toBe(
      'ormolu --mode=check $(find . -name "*.hs" -not -path "./.stack-work/*")',
    );
  });

  it('lint gate is fast with exact command', () => {
    const g = gate(HASKELL_PACK, 'lint');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toBe('hlint .');
  });

  it('spell gate is fast with exact command', () => {
    const g = gate(HASKELL_PACK, 'spell');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toBe('typos');
  });

  it('build gate is slow with exact command', () => {
    const g = gate(HASKELL_PACK, 'build');
    expect(g?.tier).toBe('slow');
    expect(g?.command).toBe('cabal build');
  });

  it('test gate is slow with exact command', () => {
    const g = gate(HASKELL_PACK, 'test');
    expect(g?.tier).toBe('slow');
    expect(g?.command).toBe('cabal test');
  });

  it('ci-full gate is ci tier with exact command', () => {
    const g = gate(HASKELL_PACK, 'ci-full');
    expect(g?.tier).toBe('ci');
    expect(g?.command).toBe(
      'ormolu --mode=check $(find . -name "*.hs" -not -path "./.stack-work/*") && hlint . && typos && cabal build && cabal test',
    );
  });

  it('has no mutation gate', () => {
    expect(gate(HASKELL_PACK, 'mutation')).toBeUndefined();
  });
});
