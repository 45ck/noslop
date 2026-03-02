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

  it('format-check gate is fast with exact command', () => {
    const g = gate(ZIG_PACK, 'format-check');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toBe('zig fmt --check src/');
  });

  it('lint gate is fast with exact command', () => {
    const g = gate(ZIG_PACK, 'lint');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toBe('zig build');
  });

  it('spell gate is fast with exact command', () => {
    const g = gate(ZIG_PACK, 'spell');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toBe('typos');
  });

  it('test gate is slow with exact command', () => {
    const g = gate(ZIG_PACK, 'test');
    expect(g?.tier).toBe('slow');
    expect(g?.command).toBe('zig build test');
  });

  it('ci-full gate is ci tier with exact command', () => {
    const g = gate(ZIG_PACK, 'ci-full');
    expect(g?.tier).toBe('ci');
    expect(g?.command).toBe('zig fmt --check src/ && zig build && typos && zig build test');
  });

  it('has no mutation gate', () => {
    expect(gate(ZIG_PACK, 'mutation')).toBeUndefined();
  });
});
