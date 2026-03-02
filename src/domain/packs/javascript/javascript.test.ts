import { describe, expect, it } from 'vitest';
import type { Pack } from '../../pack/pack.js';
import { JAVASCRIPT_PACK } from './javascript.js';

const gate = (pack: Pack, label: string) => pack.gates.find((g) => g.label === label);

describe('JAVASCRIPT_PACK', () => {
  it('has correct id and name', () => {
    expect(JAVASCRIPT_PACK.id).toBe('javascript');
    expect(JAVASCRIPT_PACK.name).toBe('JavaScript');
  });

  it('has 6 gates', () => {
    expect(JAVASCRIPT_PACK.gates).toHaveLength(6);
  });

  it('format-check gate is fast and uses prettier', () => {
    const g = gate(JAVASCRIPT_PACK, 'format-check');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toContain('prettier');
  });

  it('lint gate is fast and uses eslint', () => {
    const g = gate(JAVASCRIPT_PACK, 'lint');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toContain('eslint');
  });

  it('spell gate is fast and uses cspell', () => {
    const g = gate(JAVASCRIPT_PACK, 'spell');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toContain('cspell');
  });

  it('test gate is slow and uses npm test', () => {
    const g = gate(JAVASCRIPT_PACK, 'test');
    expect(g?.tier).toBe('slow');
    expect(g?.command).toContain('npm test');
  });

  it('ci-full includes all fast and slow commands', () => {
    const cmd = gate(JAVASCRIPT_PACK, 'ci-full')?.command ?? '';
    expect(cmd).toContain('prettier');
    expect(cmd).toContain('eslint');
    expect(cmd).toContain('cspell');
    expect(cmd).toContain('npm test');
  });

  it('mutation gate is ci tier and uses stryker', () => {
    const g = gate(JAVASCRIPT_PACK, 'mutation');
    expect(g?.tier).toBe('ci');
    expect(g?.command).toContain('stryker');
  });
});
