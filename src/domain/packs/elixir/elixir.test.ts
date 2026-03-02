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

  it('format-check gate is fast with exact command', () => {
    const g = gate(ELIXIR_PACK, 'format-check');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toBe('mix format --check-formatted');
  });

  it('lint gate is fast with exact command', () => {
    const g = gate(ELIXIR_PACK, 'lint');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toBe('mix credo --strict');
  });

  it('spell gate is fast with exact command', () => {
    const g = gate(ELIXIR_PACK, 'spell');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toBe('typos');
  });

  it('typecheck gate is slow with exact command', () => {
    const g = gate(ELIXIR_PACK, 'typecheck');
    expect(g?.tier).toBe('slow');
    expect(g?.command).toBe('mix dialyzer');
  });

  it('test gate is slow with exact command', () => {
    const g = gate(ELIXIR_PACK, 'test');
    expect(g?.tier).toBe('slow');
    expect(g?.command).toBe('mix test');
  });

  it('ci-full gate is ci tier with exact command', () => {
    const g = gate(ELIXIR_PACK, 'ci-full');
    expect(g?.tier).toBe('ci');
    expect(g?.command).toBe(
      'mix format --check-formatted && mix credo --strict && typos && mix dialyzer && mix test',
    );
  });

  it('has no mutation gate', () => {
    expect(gate(ELIXIR_PACK, 'mutation')).toBeUndefined();
  });
});
