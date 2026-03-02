import { describe, expect, it } from 'vitest';
import type { Pack } from '../pack/pack.js';
import { DOTNET_PACK } from './dotnet.js';
import { RUST_PACK } from './rust.js';
import { TYPESCRIPT_PACK } from './typescript.js';

const gate = (pack: Pack, label: string) => pack.gates.find((g) => g.label === label);

describe('TYPESCRIPT_PACK', () => {
  it('has correct id and name', () => {
    expect(TYPESCRIPT_PACK.id).toBe('typescript');
    expect(TYPESCRIPT_PACK.name).toBe('TypeScript');
  });

  it('has a format-check gate with correct command and tier', () => {
    const g = gate(TYPESCRIPT_PACK, 'format-check');
    expect(g).toBeDefined();
    expect(g?.command).toBe('prettier . --check');
    expect(g?.tier).toBe('fast');
  });

  it('has a lint gate with correct command and tier', () => {
    const g = gate(TYPESCRIPT_PACK, 'lint');
    expect(g).toBeDefined();
    expect(g?.command).toBe('eslint . --max-warnings=0');
    expect(g?.tier).toBe('fast');
  });

  it('has a spell gate with tier fast', () => {
    const g = gate(TYPESCRIPT_PACK, 'spell');
    expect(g).toBeDefined();
    expect(g?.tier).toBe('fast');
  });

  it('has a typecheck gate with tier slow', () => {
    const g = gate(TYPESCRIPT_PACK, 'typecheck');
    expect(g).toBeDefined();
    expect(g?.tier).toBe('slow');
  });

  it('has a test gate with tier slow', () => {
    const g = gate(TYPESCRIPT_PACK, 'test');
    expect(g).toBeDefined();
    expect(g?.tier).toBe('slow');
  });

  it('has a ci-full gate with tier ci', () => {
    const g = gate(TYPESCRIPT_PACK, 'ci-full');
    expect(g).toBeDefined();
    expect(g?.tier).toBe('ci');
  });
});

describe('RUST_PACK', () => {
  it('has correct id and name', () => {
    expect(RUST_PACK.id).toBe('rust');
    expect(RUST_PACK.name).toBe('Rust');
  });

  it('has a format-check gate with tier fast', () => {
    const g = gate(RUST_PACK, 'format-check');
    expect(g).toBeDefined();
    expect(g?.tier).toBe('fast');
  });

  it('has a lint gate with tier fast', () => {
    const g = gate(RUST_PACK, 'lint');
    expect(g).toBeDefined();
    expect(g?.tier).toBe('fast');
  });

  it('has a test gate with tier slow', () => {
    const g = gate(RUST_PACK, 'test');
    expect(g).toBeDefined();
    expect(g?.tier).toBe('slow');
  });

  it('has a ci-full gate with tier ci', () => {
    const g = gate(RUST_PACK, 'ci-full');
    expect(g).toBeDefined();
    expect(g?.tier).toBe('ci');
  });

  it('format-check command contains cargo fmt', () => {
    const g = gate(RUST_PACK, 'format-check');
    expect(g?.command).toContain('cargo fmt');
  });

  it('lint command contains cargo clippy', () => {
    const g = gate(RUST_PACK, 'lint');
    expect(g?.command).toContain('cargo clippy');
  });

  it('test command contains cargo test', () => {
    const g = gate(RUST_PACK, 'test');
    expect(g?.command).toContain('cargo test');
  });
});

describe('DOTNET_PACK', () => {
  it('has correct id', () => {
    expect(DOTNET_PACK.id).toBe('dotnet');
  });

  it('has a format-check gate with tier fast', () => {
    const g = gate(DOTNET_PACK, 'format-check');
    expect(g).toBeDefined();
    expect(g?.tier).toBe('fast');
  });

  it('has a build gate with tier slow', () => {
    const g = gate(DOTNET_PACK, 'build');
    expect(g).toBeDefined();
    expect(g?.tier).toBe('slow');
  });

  it('has a test gate with tier slow', () => {
    const g = gate(DOTNET_PACK, 'test');
    expect(g).toBeDefined();
    expect(g?.tier).toBe('slow');
  });

  it('has a ci-full gate with tier ci', () => {
    const g = gate(DOTNET_PACK, 'ci-full');
    expect(g).toBeDefined();
    expect(g?.tier).toBe('ci');
  });

  it('format-check command contains dotnet format', () => {
    const g = gate(DOTNET_PACK, 'format-check');
    expect(g?.command).toContain('dotnet format');
  });

  it('build command contains dotnet build', () => {
    const g = gate(DOTNET_PACK, 'build');
    expect(g?.command).toContain('dotnet build');
  });

  it('test command contains dotnet test', () => {
    const g = gate(DOTNET_PACK, 'test');
    expect(g?.command).toContain('dotnet test');
  });
});
