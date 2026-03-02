import { describe, expect, it } from 'vitest';
import type { Pack } from '../../pack/pack.js';
import { RUST_PACK } from './rust.js';

const gate = (pack: Pack, label: string) => pack.gates.find((g) => g.label === label);

describe('RUST_PACK', () => {
  it('has correct id and name', () => {
    expect(RUST_PACK.id).toBe('rust');
    expect(RUST_PACK.name).toBe('Rust');
  });

  it('has 7 gates', () => {
    expect(RUST_PACK.gates).toHaveLength(7);
  });

  it('format-check gate is fast with exact command', () => {
    const g = gate(RUST_PACK, 'format-check');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toBe('cargo fmt --check');
  });

  it('lint gate is fast with exact command', () => {
    const g = gate(RUST_PACK, 'lint');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toBe('cargo clippy -- -D warnings');
  });

  it('spell gate is fast with exact command', () => {
    const g = gate(RUST_PACK, 'spell');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toBe('typos');
  });

  it('build gate is slow with exact command', () => {
    const g = gate(RUST_PACK, 'build');
    expect(g?.tier).toBe('slow');
    expect(g?.command).toBe('cargo build');
  });

  it('test gate is slow with exact command', () => {
    const g = gate(RUST_PACK, 'test');
    expect(g?.tier).toBe('slow');
    expect(g?.command).toBe('cargo test');
  });

  it('ci-full gate is ci tier with exact command', () => {
    const g = gate(RUST_PACK, 'ci-full');
    expect(g?.tier).toBe('ci');
    expect(g?.command).toBe(
      'cargo fmt --check && cargo clippy -- -D warnings && typos && cargo build && cargo test',
    );
  });

  it('mutation gate is ci tier with exact command', () => {
    const g = gate(RUST_PACK, 'mutation');
    expect(g?.tier).toBe('ci');
    expect(g?.command).toBe('cargo mutants');
  });
});
