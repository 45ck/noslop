import { describe, expect, it } from 'vitest';
import type { Pack } from '../../pack/pack.js';
import { ZIG_PACK } from './zig.js';

const gate = (pack: Pack, label: string) => pack.gates.find((g) => g.label === label);

describe('ZIG_PACK', () => {
  it('has correct id and name', () => {
    expect(ZIG_PACK.id).toBe('zig');
    expect(ZIG_PACK.name).toBe('Zig');
  });

  it('has 5 gates', () => {
    expect(ZIG_PACK.gates).toHaveLength(5);
  });

  it('format-check gate is fast and uses zig fmt', () => {
    const g = gate(ZIG_PACK, 'format-check');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toContain('zig fmt');
  });

  it('lint gate is fast and uses zig build', () => {
    const g = gate(ZIG_PACK, 'lint');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toContain('zig build');
  });

  it('spell gate is fast and uses typos', () => {
    const g = gate(ZIG_PACK, 'spell');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toBe('typos');
  });

  it('test gate is slow and uses zig build test', () => {
    const g = gate(ZIG_PACK, 'test');
    expect(g?.tier).toBe('slow');
    expect(g?.command).toContain('zig build test');
  });

  it('ci-full includes all fast and slow commands', () => {
    const cmd = gate(ZIG_PACK, 'ci-full')?.command ?? '';
    expect(cmd).toContain('zig fmt');
    expect(cmd).toContain('zig build');
    expect(cmd).toContain('typos');
    expect(cmd).toContain('zig build test');
  });

  it('has no mutation gate', () => {
    expect(gate(ZIG_PACK, 'mutation')).toBeUndefined();
  });
});
