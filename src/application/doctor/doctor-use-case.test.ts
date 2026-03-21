import { describe, expect, it } from 'vitest';
import { doctor } from './doctor-use-case.js';
import { InMemoryFilesystem } from '../../infrastructure/adapters/in-memory-filesystem.js';
import { InMemoryProcessRunner } from '../../infrastructure/adapters/in-memory-process-runner.js';
import { createPack } from '../../domain/pack/pack.js';
import { createGate } from '../../domain/gate/gate.js';

function seedAll(fs: InMemoryFilesystem): void {
  fs.seed('/target/.githooks/pre-commit', '#!/bin/sh');
  fs.markExecutable('/target/.githooks/pre-commit');
  fs.seed('/target/.github/workflows/quality.yml', 'name: quality');
  fs.seed('/target/.claude/settings.json', '{}');
  fs.seed('/target/.claude/hooks/pre-tool-use.sh', '#!/bin/sh');
  fs.seed('/target/AGENTS.md', '# Agents');
}

describe('doctor use case', () => {
  it('reports healthy when all required files exist and hooks are configured', async () => {
    const fs = new InMemoryFilesystem();
    seedAll(fs);
    const runner = new InMemoryProcessRunner({ 'git config core.hooksPath': 0 });
    runner.setStdout('git config core.hooksPath', '.githooks');

    const result = await doctor({ targetDir: '/target' }, fs, runner);
    expect(result.healthy).toBe(true);
    expect(result.checks.every((c) => c.passed)).toBe(true);

    const hooksPathCheck = result.checks.find((c) => c.name === 'git core.hooksPath');
    expect(hooksPathCheck?.detail).toBe('core.hooksPath = .githooks');

    const hooksDirCheck = result.checks.find((c) => c.name === '.githooks directory');
    expect(hooksDirCheck?.detail).toContain('.githooks');

    const ciCheck = result.checks.find((c) => c.name === '.github/workflows/quality.yml');
    expect(ciCheck?.detail).toContain('quality.yml present');
  });

  it('reports unhealthy when hooks path is not set', async () => {
    const fs = new InMemoryFilesystem();
    seedAll(fs);
    const runner = new InMemoryProcessRunner({ 'git config core.hooksPath': 1 });

    const result = await doctor({ targetDir: '/target' }, fs, runner);
    expect(result.healthy).toBe(false);
    const check = result.checks.find((c) => c.name === 'git core.hooksPath');
    expect(check?.passed).toBe(false);
    expect(check?.detail).toContain('run: noslop init');
    expect(check?.detail).toContain('not set');
  });

  it('reports unhealthy when .githooks directory is missing', async () => {
    const fs = new InMemoryFilesystem();
    fs.seed('/target/.github/workflows/quality.yml', 'name: quality');
    fs.seed('/target/.claude/settings.json', '{}');
    fs.seed('/target/.claude/hooks/pre-tool-use.sh', '#!/bin/sh');
    fs.seed('/target/AGENTS.md', '# Agents');
    const runner = new InMemoryProcessRunner({ 'git config core.hooksPath': 0 });
    runner.setStdout('git config core.hooksPath', '.githooks');

    const result = await doctor({ targetDir: '/target' }, fs, runner);
    expect(result.healthy).toBe(false);
    const check = result.checks.find((c) => c.name === '.githooks directory');
    expect(check?.passed).toBe(false);
    expect(check?.detail).toContain('run: noslop init');
    expect(check?.detail).toContain('.githooks');
  });

  it('reports unhealthy when quality.yml is missing', async () => {
    const fs = new InMemoryFilesystem();
    fs.seed('/target/.githooks/pre-commit', '#!/bin/sh');
    fs.seed('/target/.claude/settings.json', '{}');
    fs.seed('/target/.claude/hooks/pre-tool-use.sh', '#!/bin/sh');
    fs.seed('/target/AGENTS.md', '# Agents');
    const runner = new InMemoryProcessRunner({ 'git config core.hooksPath': 0 });
    runner.setStdout('git config core.hooksPath', '.githooks');

    const result = await doctor({ targetDir: '/target' }, fs, runner);
    expect(result.healthy).toBe(false);
    const check = result.checks.find((c) => c.name === '.github/workflows/quality.yml');
    expect(check?.passed).toBe(false);
    expect(check?.detail).toContain('run: noslop init');
    expect(check?.detail).toContain('quality.yml');
  });

  it('reports unhealthy when .claude/hooks directory is missing (MIS3)', async () => {
    const fs = new InMemoryFilesystem();
    fs.seed('/target/.githooks/pre-commit', '#!/bin/sh');
    fs.seed('/target/.github/workflows/quality.yml', 'name: quality');
    fs.seed('/target/.claude/settings.json', '{}');
    fs.seed('/target/AGENTS.md', '# Agents');
    const runner = new InMemoryProcessRunner({ 'git config core.hooksPath': 0 });
    runner.setStdout('git config core.hooksPath', '.githooks');

    const result = await doctor({ targetDir: '/target' }, fs, runner);
    expect(result.healthy).toBe(false);
    const check = result.checks.find((c) => c.name === '.claude/hooks directory');
    expect(check?.passed).toBe(false);
    expect(check?.detail).toContain('run: noslop init');
  });

  it('reports unhealthy when git config exits 0 but stdout is empty', async () => {
    const fs = new InMemoryFilesystem();
    seedAll(fs);
    const runner = new InMemoryProcessRunner({ 'git config core.hooksPath': 0 });

    const result = await doctor({ targetDir: '/target' }, fs, runner);
    expect(result.healthy).toBe(false);
    const check = result.checks.find((c) => c.name === 'git core.hooksPath');
    expect(check?.passed).toBe(false);
    expect(check?.detail).toContain('empty');
    expect(check?.detail).toContain('run: noslop init');
  });

  it('includes detail messages for all checks', async () => {
    const fs = new InMemoryFilesystem();
    const runner = new InMemoryProcessRunner({ 'git config core.hooksPath': 1 });

    const result = await doctor({ targetDir: '/target' }, fs, runner);
    for (const checkItem of result.checks) {
      expect(checkItem.detail.length).toBeGreaterThan(0);
    }
  });

  it('reports unhealthy when runner throws on git config check', async () => {
    const fs = new InMemoryFilesystem();
    const throwingRunner = {
      run: async () => {
        throw new Error('git not found');
      },
    };

    const result = await doctor({ targetDir: '/target' }, fs, throwingRunner);
    const check = result.checks.find((c) => c.name === 'git core.hooksPath');
    expect(check?.passed).toBe(false);
  });

  it('healthy is false when at least one check fails', async () => {
    const fs = new InMemoryFilesystem();
    // seed everything except .githooks so exactly one check fails
    fs.seed('/target/.github/workflows/quality.yml', 'name: quality');
    fs.seed('/target/.claude/settings.json', '{}');
    fs.seed('/target/.claude/hooks/pre-tool-use.sh', '#!/bin/sh');
    fs.seed('/target/AGENTS.md', '# Agents');
    const runner = new InMemoryProcessRunner({ 'git config core.hooksPath': 0 });
    runner.setStdout('git config core.hooksPath', '.githooks');

    const result = await doctor({ targetDir: '/target' }, fs, runner);
    expect(result.healthy).toBe(false);
    // healthy must derive from the checks array — all-pass → true, one-fail → false
    expect(result.checks.every((c) => c.passed)).toBe(false);
  });

  it('passing hooksPath check detail contains exact hooksPath value', async () => {
    const fs = new InMemoryFilesystem();
    seedAll(fs);
    const runner = new InMemoryProcessRunner({ 'git config core.hooksPath': 0 });
    runner.setStdout('git config core.hooksPath', '.githooks');

    const result = await doctor({ targetDir: '/target' }, fs, runner);
    const check = result.checks.find((c) => c.name === 'git core.hooksPath');
    // Exact string: ensures the ternary true-branch is exercised and not collapsed
    expect(check?.detail).toBe('core.hooksPath = .githooks');
  });

  it('failing hooksPath check detail never contains the passing prefix', async () => {
    const fs = new InMemoryFilesystem();
    seedAll(fs);
    const runner = new InMemoryProcessRunner({ 'git config core.hooksPath': 1 });

    const result = await doctor({ targetDir: '/target' }, fs, runner);
    const check = result.checks.find((c) => c.name === 'git core.hooksPath');
    // Must NOT contain the success phrase — guards the false-branch
    expect(check?.detail).not.toContain('core.hooksPath =');
  });

  it('skips toolchain checks when packs is not provided', async () => {
    const fs = new InMemoryFilesystem();
    seedAll(fs);
    const runner = new InMemoryProcessRunner({ 'git config core.hooksPath': 0 });
    runner.setStdout('git config core.hooksPath', '.githooks');

    const result = await doctor({ targetDir: '/target' }, fs, runner);
    const toolchainChecks = result.checks.filter((c) => c.name.startsWith('toolchain:'));
    expect(toolchainChecks).toHaveLength(0);
  });

  it('adds toolchain checks when packs are provided', async () => {
    const fs = new InMemoryFilesystem();
    seedAll(fs);
    const runner = new InMemoryProcessRunner({
      'git config core.hooksPath': 0,
      'zig version': 0,
    });
    runner.setStdout('git config core.hooksPath', '.githooks');
    runner.setStdout('zig version', '0.11.0');

    const zigPack = createPack('zig', 'Zig', [createGate('build', 'zig build', 'fast')]);
    const result = await doctor({ targetDir: '/target', packs: [zigPack] }, fs, runner);

    const toolchainChecks = result.checks.filter((c) => c.name.startsWith('toolchain:'));
    expect(toolchainChecks.length).toBeGreaterThanOrEqual(1);

    const zigCheck = toolchainChecks.find((c) => c.name === 'toolchain: zig/zig');
    expect(zigCheck).toBeDefined();
    expect(zigCheck?.passed).toBe(true);
    expect(zigCheck?.detail).toBe('zig found');
  });

  it('toolchain checks are always passed=true even when binary is missing', async () => {
    const fs = new InMemoryFilesystem();
    seedAll(fs);
    const runner = new InMemoryProcessRunner({
      'git config core.hooksPath': 0,
      'cargo --version': 1,
      'cargo clippy --version': 1,
    });
    runner.setStdout('git config core.hooksPath', '.githooks');

    const rustPack = createPack('rust', 'Rust', [createGate('build', 'cargo build', 'fast')]);
    const result = await doctor({ targetDir: '/target', packs: [rustPack] }, fs, runner);

    const toolchainChecks = result.checks.filter((c) => c.name.startsWith('toolchain:'));
    for (const check of toolchainChecks) {
      expect(check.passed).toBe(true);
    }

    const cargoCheck = toolchainChecks.find((c) => c.name === 'toolchain: rust/cargo');
    expect(cargoCheck?.detail).toContain('not found');
    expect(cargoCheck?.detail).toContain('rustup');
  });

  it('toolchain checks do not affect healthy status', async () => {
    const fs = new InMemoryFilesystem();
    seedAll(fs);
    const runner = new InMemoryProcessRunner({
      'git config core.hooksPath': 0,
      'dart --version': 1,
    });
    runner.setStdout('git config core.hooksPath', '.githooks');

    const dartPack = createPack('dart', 'Dart', [createGate('test', 'dart test', 'fast')]);
    const result = await doctor({ targetDir: '/target', packs: [dartPack] }, fs, runner);

    expect(result.healthy).toBe(true);
    const dartCheck = result.checks.find((c) => c.name === 'toolchain: dart/dart');
    expect(dartCheck?.detail).toContain('not found');
  });

  it('toolchain checks handle runner throwing an error', async () => {
    const fs = new InMemoryFilesystem();
    seedAll(fs);

    let callCount = 0;
    const throwingRunner = {
      run: async (cmd: string) => {
        if (cmd === 'git config core.hooksPath') {
          return { exitCode: 0, stdout: '.githooks', stderr: '' };
        }
        callCount++;
        throw new Error('command not found');
      },
    };

    const zigPack = createPack('zig', 'Zig', [createGate('build', 'zig build', 'fast')]);
    const result = await doctor({ targetDir: '/target', packs: [zigPack] }, fs, throwingRunner);

    expect(callCount).toBeGreaterThan(0);
    const zigCheck = result.checks.find((c) => c.name === 'toolchain: zig/zig');
    expect(zigCheck?.passed).toBe(true);
    expect(zigCheck?.detail).toContain('not found');
  });

  it('passes hook permission check when pre-commit is executable', async () => {
    const fs = new InMemoryFilesystem();
    seedAll(fs);
    fs.markExecutable('/target/.githooks/pre-commit');
    const runner = new InMemoryProcessRunner({ 'git config core.hooksPath': 0 });
    runner.setStdout('git config core.hooksPath', '.githooks');

    const result = await doctor({ targetDir: '/target' }, fs, runner);
    const check = result.checks.find((c) => c.name === '.githooks/pre-commit permissions');
    expect(check?.passed).toBe(true);
    expect(check?.detail).toContain('is executable');
  });

  it('fails hook permission check when pre-commit is not executable', async () => {
    const fs = new InMemoryFilesystem();
    // Seed files individually — pre-commit exists but is NOT marked executable
    fs.seed('/target/.githooks/pre-commit', '#!/bin/sh');
    fs.seed('/target/.github/workflows/quality.yml', 'name: quality');
    fs.seed('/target/.claude/settings.json', '{}');
    fs.seed('/target/.claude/hooks/pre-tool-use.sh', '#!/bin/sh');
    fs.seed('/target/AGENTS.md', '# Agents');
    const runner = new InMemoryProcessRunner({ 'git config core.hooksPath': 0 });
    runner.setStdout('git config core.hooksPath', '.githooks');

    const result = await doctor({ targetDir: '/target' }, fs, runner);
    const check = result.checks.find((c) => c.name === '.githooks/pre-commit permissions');
    expect(check?.passed).toBe(false);
    expect(check?.detail).toContain('chmod +x');
  });

  it('skips hook permission check when pre-commit does not exist', async () => {
    const fs = new InMemoryFilesystem();
    // Don't seed pre-commit
    fs.seed('/target/.github/workflows/quality.yml', 'name: quality');
    fs.seed('/target/.claude/settings.json', '{}');
    fs.seed('/target/.claude/hooks/pre-tool-use.sh', '#!/bin/sh');
    fs.seed('/target/AGENTS.md', '# Agents');
    const runner = new InMemoryProcessRunner({ 'git config core.hooksPath': 0 });
    runner.setStdout('git config core.hooksPath', '.githooks');

    const result = await doctor({ targetDir: '/target' }, fs, runner);
    const check = result.checks.find((c) => c.name === '.githooks/pre-commit permissions');
    expect(check).toBeUndefined();
  });

  it('strict mode marks missing toolchain as failed', async () => {
    const fs = new InMemoryFilesystem();
    seedAll(fs);
    const runner = new InMemoryProcessRunner({
      'git config core.hooksPath': 0,
      'cargo --version': 1,
      'cargo clippy --version': 1,
    });
    runner.setStdout('git config core.hooksPath', '.githooks');

    const rustPack = createPack('rust', 'Rust', [createGate('build', 'cargo build', 'fast')]);
    const result = await doctor(
      { targetDir: '/target', packs: [rustPack], strict: true },
      fs,
      runner,
    );

    const cargoCheck = result.checks.find((c) => c.name === 'toolchain: rust/cargo');
    expect(cargoCheck?.passed).toBe(false);
    expect(cargoCheck?.detail).toContain('not found');
    expect(result.healthy).toBe(false);
  });

  it('strict mode passes when toolchain is available', async () => {
    const fs = new InMemoryFilesystem();
    seedAll(fs);
    const runner = new InMemoryProcessRunner({
      'git config core.hooksPath': 0,
      'zig version': 0,
    });
    runner.setStdout('git config core.hooksPath', '.githooks');
    runner.setStdout('zig version', '0.11.0');

    const zigPack = createPack('zig', 'Zig', [createGate('build', 'zig build', 'fast')]);
    const result = await doctor(
      { targetDir: '/target', packs: [zigPack], strict: true },
      fs,
      runner,
    );

    const zigCheck = result.checks.find((c) => c.name === 'toolchain: zig/zig');
    expect(zigCheck?.passed).toBe(true);
    expect(result.healthy).toBe(true);
  });

  it('skips toolchain checks when packs is an empty array', async () => {
    const fs = new InMemoryFilesystem();
    seedAll(fs);
    const runner = new InMemoryProcessRunner({ 'git config core.hooksPath': 0 });
    runner.setStdout('git config core.hooksPath', '.githooks');

    const result = await doctor({ targetDir: '/target', packs: [] }, fs, runner);
    const toolchainChecks = result.checks.filter((c) => c.name.startsWith('toolchain:'));
    expect(toolchainChecks).toHaveLength(0);
  });
});
