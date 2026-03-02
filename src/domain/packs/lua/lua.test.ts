import { describe, expect, it } from 'vitest';
import type { Pack } from '../../pack/pack.js';
import { LUA_PACK } from './lua.js';

const gate = (pack: Pack, label: string) => pack.gates.find((g) => g.label === label);

describe('LUA_PACK', () => {
  it('has correct id and name', () => {
    expect(LUA_PACK.id).toBe('lua');
    expect(LUA_PACK.name).toBe('Lua');
  });

  it('has 5 gates', () => {
    expect(LUA_PACK.gates).toHaveLength(5);
  });

  it('format-check gate is fast and uses stylua', () => {
    const g = gate(LUA_PACK, 'format-check');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toContain('stylua');
  });

  it('lint gate is fast and uses luacheck', () => {
    const g = gate(LUA_PACK, 'lint');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toContain('luacheck');
  });

  it('spell gate is fast and uses typos', () => {
    const g = gate(LUA_PACK, 'spell');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toBe('typos');
  });

  it('test gate is slow and uses busted', () => {
    const g = gate(LUA_PACK, 'test');
    expect(g?.tier).toBe('slow');
    expect(g?.command).toContain('busted');
  });

  it('ci-full includes all fast and slow commands', () => {
    const cmd = gate(LUA_PACK, 'ci-full')?.command ?? '';
    expect(cmd).toContain('stylua');
    expect(cmd).toContain('luacheck');
    expect(cmd).toContain('typos');
    expect(cmd).toContain('busted');
  });

  it('has no mutation gate', () => {
    expect(gate(LUA_PACK, 'mutation')).toBeUndefined();
  });
});
