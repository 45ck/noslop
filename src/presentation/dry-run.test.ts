import { describe, expect, it, vi } from 'vitest';
import { runDryInit } from './dry-run.js';
import { InMemoryFilesystem } from '../infrastructure/adapters/in-memory-filesystem.js';
import { createPack } from '../domain/pack/pack.js';
import { createGate } from '../domain/gate/gate.js';
import { createConfig, DEFAULT_SPELL_CONFIG } from '../domain/config/noslop-config.js';

const GATE = createGate('lint', 'eslint .', 'fast');

describe('runDryInit', () => {
  it('prints dry-run header with pack names', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const pack = createPack('rust', 'Rust', [GATE]);
    const fs = new InMemoryFilesystem();
    fs.seed('/templates/packs/rust/.githooks/pre-commit', '#!/bin/sh');
    const config = createConfig(['rust'], []);

    await runDryInit(
      { targetDir: '/target', templatesDir: '/templates', packs: [pack], config },
      fs,
    );

    const output = consoleSpy.mock.calls.map((c) => String(c[0])).join('\n');
    expect(output).toContain('[dry-run]');
    expect(output).toContain('Rust');
    consoleSpy.mockRestore();
  });

  it('lists files that would be written', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const pack = createPack('rust', 'Rust', [GATE]);
    const fs = new InMemoryFilesystem();
    fs.seed('/templates/packs/rust/.githooks/pre-commit', '#!/bin/sh');
    fs.seed('/templates/packs/rust/AGENTS.md', '# Agents');
    const config = createConfig(['rust'], []);

    await runDryInit(
      { targetDir: '/target', templatesDir: '/templates', packs: [pack], config },
      fs,
    );

    const output = consoleSpy.mock.calls.map((c) => String(c[0])).join('\n');
    expect(output).toContain('2 file(s) would be written');
    expect(output).toContain('No files were written');
    consoleSpy.mockRestore();
  });

  it('does not write files to the underlying filesystem', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    const pack = createPack('rust', 'Rust', [GATE]);
    const fs = new InMemoryFilesystem();
    fs.seed('/templates/packs/rust/AGENTS.md', '# Agents');
    const config = createConfig(['rust'], []);

    await runDryInit(
      { targetDir: '/target', templatesDir: '/templates', packs: [pack], config },
      fs,
    );

    expect(await fs.exists('/target/AGENTS.md')).toBe(false);
    vi.restoreAllMocks();
  });

  it('shows commands that would be run when hooks dir exists in target', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const pack = createPack('rust', 'Rust', [GATE]);
    const fs = new InMemoryFilesystem();
    fs.seed('/templates/packs/rust/.githooks/pre-commit', '#!/bin/sh');
    // Pre-seed the target hooks dir so the use case finds it exists
    fs.seed('/target/.githooks/pre-commit', '#!/bin/sh\nold');
    const config = createConfig(['rust'], []);

    await runDryInit(
      { targetDir: '/target', templatesDir: '/templates', packs: [pack], config },
      fs,
    );

    const output = consoleSpy.mock.calls.map((c) => String(c[0])).join('\n');
    expect(output).toContain('would run');
    expect(output).toContain('git config core.hooksPath');
    consoleSpy.mockRestore();
  });

  it('lists spell config in dry-run when spell is enabled', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const spellGate = createGate('spell', 'cspell --no-progress "src/**/*"', 'fast');
    const pack = createPack('typescript', 'TypeScript', [spellGate]);
    const fs = new InMemoryFilesystem();
    const config = createConfig(['typescript'], [], DEFAULT_SPELL_CONFIG);

    await runDryInit(
      { targetDir: '/target', templatesDir: '/templates', packs: [pack], config },
      fs,
    );

    const output = consoleSpy.mock.calls.map((c) => String(c[0])).join('\n');
    expect(output).toContain('1 file(s) would be written');
    consoleSpy.mockRestore();
  });
});
