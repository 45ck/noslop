import { describe, expect, it } from 'vitest';
import type { Pack } from '../../pack/pack.js';
import { CPP_PACK } from './cpp.js';

const gate = (pack: Pack, label: string) => pack.gates.find((g) => g.label === label);

describe('CPP_PACK', () => {
  it('has correct id and name', () => {
    expect(CPP_PACK.id).toBe('cpp');
    expect(CPP_PACK.name).toBe('C/C++');
  });

  it('has 6 gates', () => {
    expect(CPP_PACK.gates).toHaveLength(6);
  });

  it('format-check gate is fast and uses clang-format', () => {
    const g = gate(CPP_PACK, 'format-check');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toContain('clang-format');
  });

  it('lint gate is fast and uses cppcheck', () => {
    const g = gate(CPP_PACK, 'lint');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toContain('cppcheck');
  });

  it('spell gate is fast and uses typos', () => {
    const g = gate(CPP_PACK, 'spell');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toBe('typos');
  });

  it('build gate is slow and uses cmake', () => {
    const g = gate(CPP_PACK, 'build');
    expect(g?.tier).toBe('slow');
    expect(g?.command).toContain('cmake');
  });

  it('test gate is slow and uses ctest', () => {
    const g = gate(CPP_PACK, 'test');
    expect(g?.tier).toBe('slow');
    expect(g?.command).toContain('ctest');
  });

  it('ci-full includes all fast and slow commands', () => {
    const cmd = gate(CPP_PACK, 'ci-full')?.command ?? '';
    expect(cmd).toContain('clang-format');
    expect(cmd).toContain('cppcheck');
    expect(cmd).toContain('typos');
    expect(cmd).toContain('cmake');
    expect(cmd).toContain('ctest');
  });

  it('has no mutation gate', () => {
    expect(gate(CPP_PACK, 'mutation')).toBeUndefined();
  });
});
