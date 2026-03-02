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

  it('format-check gate is fast and uses cargo fmt', () => {
    const g = gate(RUST_PACK, 'format-check');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toContain('cargo fmt');
  });

  it('lint gate is fast and uses cargo clippy', () => {
    const g = gate(RUST_PACK, 'lint');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toContain('cargo clippy');
  });

  it('spell gate is fast and uses typos', () => {
    const g = gate(RUST_PACK, 'spell');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toBe('typos');
  });

  it('build gate is slow and uses cargo build', () => {
    const g = gate(RUST_PACK, 'build');
    expect(g?.tier).toBe('slow');
    expect(g?.command).toContain('cargo build');
  });

  it('test gate is slow and uses cargo test', () => {
    const g = gate(RUST_PACK, 'test');
    expect(g?.tier).toBe('slow');
    expect(g?.command).toContain('cargo test');
  });

  it('ci-full includes all fast and slow commands', () => {
    const cmd = gate(RUST_PACK, 'ci-full')?.command ?? '';
    expect(cmd).toContain('cargo fmt');
    expect(cmd).toContain('cargo clippy');
    expect(cmd).toContain('typos');
    expect(cmd).toContain('cargo build');
    expect(cmd).toContain('cargo test');
  });

  it('mutation gate is ci tier and uses cargo mutants', () => {
    const g = gate(RUST_PACK, 'mutation');
    expect(g?.tier).toBe('ci');
    expect(g?.command).toContain('cargo mutants');
  });
});
