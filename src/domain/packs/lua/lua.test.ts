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

  it('format-check gate is fast with exact command', () => {
    const g = gate(LUA_PACK, 'format-check');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toBe('stylua --check .');
  });

  it('lint gate is fast with exact command', () => {
    const g = gate(LUA_PACK, 'lint');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toBe('luacheck .');
  });

  it('spell gate is fast with exact command', () => {
    const g = gate(LUA_PACK, 'spell');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toBe('typos');
  });

  it('test gate is slow with exact command', () => {
    const g = gate(LUA_PACK, 'test');
    expect(g?.tier).toBe('slow');
    expect(g?.command).toBe('busted');
  });

  it('ci-full gate is ci tier with exact command', () => {
    const g = gate(LUA_PACK, 'ci-full');
    expect(g?.tier).toBe('ci');
    expect(g?.command).toBe('stylua --check . && luacheck . && typos && busted');
  });

  it('has no mutation gate', () => {
    expect(gate(LUA_PACK, 'mutation')).toBeUndefined();
  });
});
