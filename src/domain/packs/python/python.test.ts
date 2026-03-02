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

  it('format-check gate is fast with exact command', () => {
    const g = gate(PYTHON_PACK, 'format-check');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toBe('black --check .');
  });

  it('lint gate is fast with exact command', () => {
    const g = gate(PYTHON_PACK, 'lint');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toBe('ruff check .');
  });

  it('spell gate is fast with exact command', () => {
    const g = gate(PYTHON_PACK, 'spell');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toBe('typos');
  });

  it('typecheck gate is slow with exact command', () => {
    const g = gate(PYTHON_PACK, 'typecheck');
    expect(g?.tier).toBe('slow');
    expect(g?.command).toBe('mypy .');
  });

  it('test gate is slow with exact command', () => {
    const g = gate(PYTHON_PACK, 'test');
    expect(g?.tier).toBe('slow');
    expect(g?.command).toBe('pytest');
  });

  it('ci-full gate is ci tier with exact command', () => {
    const g = gate(PYTHON_PACK, 'ci-full');
    expect(g?.tier).toBe('ci');
    expect(g?.command).toBe('black --check . && ruff check . && typos && mypy . && pytest');
  });

  it('mutation gate is ci tier with exact command', () => {
    const g = gate(PYTHON_PACK, 'mutation');
    expect(g?.tier).toBe('ci');
    expect(g?.command).toBe('mutmut run');
  });
});
