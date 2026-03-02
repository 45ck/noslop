import { describe, expect, it } from 'vitest';
import type { Pack } from '../../pack/pack.js';
import { DART_PACK } from './dart.js';

const gate = (pack: Pack, label: string) => pack.gates.find((g) => g.label === label);

describe('DART_PACK', () => {
  it('has correct id and name', () => {
    expect(DART_PACK.id).toBe('dart');
    expect(DART_PACK.name).toBe('Dart');
  });

  it('has 5 gates', () => {
    expect(DART_PACK.gates).toHaveLength(5);
  });

  it('format-check gate is fast and uses dart format', () => {
    const g = gate(DART_PACK, 'format-check');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toContain('dart format');
  });

  it('lint gate is fast and uses dart analyze', () => {
    const g = gate(DART_PACK, 'lint');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toContain('dart analyze');
  });

  it('spell gate is fast and uses typos', () => {
    const g = gate(DART_PACK, 'spell');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toBe('typos');
  });

  it('test gate is slow and uses dart test', () => {
    const g = gate(DART_PACK, 'test');
    expect(g?.tier).toBe('slow');
    expect(g?.command).toContain('dart test');
  });

  it('ci-full includes all fast and slow commands', () => {
    const cmd = gate(DART_PACK, 'ci-full')?.command ?? '';
    expect(cmd).toContain('dart format');
    expect(cmd).toContain('dart analyze');
    expect(cmd).toContain('typos');
    expect(cmd).toContain('dart test');
  });

  it('has no mutation gate', () => {
    expect(gate(DART_PACK, 'mutation')).toBeUndefined();
  });
});
