import { describe, expect, it } from 'vitest';
import type { Pack } from '../../pack/pack.js';
import { ELIXIR_PACK } from './elixir.js';

const gate = (pack: Pack, label: string) => pack.gates.find((g) => g.label === label);

describe('ELIXIR_PACK', () => {
  it('has correct id and name', () => {
    expect(ELIXIR_PACK.id).toBe('elixir');
    expect(ELIXIR_PACK.name).toBe('Elixir');
  });

  it('has 6 gates', () => {
    expect(ELIXIR_PACK.gates).toHaveLength(6);
  });

  it('format-check gate is fast and uses mix format', () => {
    const g = gate(ELIXIR_PACK, 'format-check');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toContain('mix format');
  });

  it('lint gate is fast and uses mix credo', () => {
    const g = gate(ELIXIR_PACK, 'lint');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toContain('mix credo');
  });

  it('spell gate is fast and uses typos', () => {
    const g = gate(ELIXIR_PACK, 'spell');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toBe('typos');
  });

  it('typecheck gate is slow and uses mix dialyzer', () => {
    const g = gate(ELIXIR_PACK, 'typecheck');
    expect(g?.tier).toBe('slow');
    expect(g?.command).toContain('mix dialyzer');
  });

  it('test gate is slow and uses mix test', () => {
    const g = gate(ELIXIR_PACK, 'test');
    expect(g?.tier).toBe('slow');
    expect(g?.command).toContain('mix test');
  });

  it('ci-full includes all fast and slow commands', () => {
    const cmd = gate(ELIXIR_PACK, 'ci-full')?.command ?? '';
    expect(cmd).toContain('mix format');
    expect(cmd).toContain('mix credo');
    expect(cmd).toContain('typos');
    expect(cmd).toContain('mix dialyzer');
    expect(cmd).toContain('mix test');
  });

  it('has no mutation gate', () => {
    expect(gate(ELIXIR_PACK, 'mutation')).toBeUndefined();
  });
});
