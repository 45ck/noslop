import { describe, expect, it } from 'vitest';
import type { Pack } from '../../pack/pack.js';
import { TYPESCRIPT_PACK } from './typescript.js';

const gate = (pack: Pack, label: string) => pack.gates.find((g) => g.label === label);

describe('TYPESCRIPT_PACK', () => {
  it('has correct id and name', () => {
    expect(TYPESCRIPT_PACK.id).toBe('typescript');
    expect(TYPESCRIPT_PACK.name).toBe('TypeScript');
  });

  it('has 7 gates', () => {
    expect(TYPESCRIPT_PACK.gates).toHaveLength(7);
  });

  it('format-check gate is fast and uses prettier', () => {
    const g = gate(TYPESCRIPT_PACK, 'format-check');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toContain('prettier');
  });

  it('lint gate is fast and uses eslint', () => {
    const g = gate(TYPESCRIPT_PACK, 'lint');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toContain('eslint');
  });

  it('spell gate is fast and uses cspell', () => {
    const g = gate(TYPESCRIPT_PACK, 'spell');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toContain('cspell');
  });

  it('typecheck gate is slow and uses tsc', () => {
    const g = gate(TYPESCRIPT_PACK, 'typecheck');
    expect(g?.tier).toBe('slow');
    expect(g?.command).toContain('tsc');
  });

  it('test gate is slow and uses vitest', () => {
    const g = gate(TYPESCRIPT_PACK, 'test');
    expect(g?.tier).toBe('slow');
    expect(g?.command).toContain('vitest');
  });

  it('ci-full gate is ci tier', () => {
    expect(gate(TYPESCRIPT_PACK, 'ci-full')?.tier).toBe('ci');
  });

  it('mutation gate is ci tier and uses stryker', () => {
    const g = gate(TYPESCRIPT_PACK, 'mutation');
    expect(g?.tier).toBe('ci');
    expect(g?.command).toContain('stryker');
  });
});
