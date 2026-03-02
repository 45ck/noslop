import { describe, expect, it } from 'vitest';
import type { Pack } from '../../pack/pack.js';
import { PYTHON_PACK } from './python.js';

const gate = (pack: Pack, label: string) => pack.gates.find((g) => g.label === label);

describe('PYTHON_PACK', () => {
  it('has correct id and name', () => {
    expect(PYTHON_PACK.id).toBe('python');
    expect(PYTHON_PACK.name).toBe('Python');
  });

  it('has 7 gates', () => {
    expect(PYTHON_PACK.gates).toHaveLength(7);
  });

  it('format-check gate is fast and uses black', () => {
    const g = gate(PYTHON_PACK, 'format-check');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toContain('black');
  });

  it('lint gate is fast and uses ruff', () => {
    const g = gate(PYTHON_PACK, 'lint');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toContain('ruff');
  });

  it('spell gate is fast and uses typos', () => {
    const g = gate(PYTHON_PACK, 'spell');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toBe('typos');
  });

  it('typecheck gate is slow and uses mypy', () => {
    const g = gate(PYTHON_PACK, 'typecheck');
    expect(g?.tier).toBe('slow');
    expect(g?.command).toContain('mypy');
  });

  it('test gate is slow and uses pytest', () => {
    const g = gate(PYTHON_PACK, 'test');
    expect(g?.tier).toBe('slow');
    expect(g?.command).toContain('pytest');
  });

  it('ci-full includes all fast and slow commands', () => {
    const cmd = gate(PYTHON_PACK, 'ci-full')?.command ?? '';
    expect(cmd).toContain('black');
    expect(cmd).toContain('ruff');
    expect(cmd).toContain('typos');
    expect(cmd).toContain('mypy');
    expect(cmd).toContain('pytest');
  });

  it('mutation gate is ci tier and uses mutmut', () => {
    const g = gate(PYTHON_PACK, 'mutation');
    expect(g?.tier).toBe('ci');
    expect(g?.command).toContain('mutmut');
  });
});
