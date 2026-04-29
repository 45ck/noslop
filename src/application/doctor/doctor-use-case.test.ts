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

function makeHealthyFixture(commands: Record<string, number> = {}) {
  const fs = new InMemoryFilesystem();
  seedAll(fs);
  const runner = new InMemoryProcessRunner({ 'git config core.hooksPath': 0, ...commands });
  runner.setStdout('git config core.hooksPath', '.githooks');
  return { fs, runner };
}

async function runDoctorWithFixture(
  options: Readonly<{
    mutate?: (fs: InMemoryFilesystem, runner: InMemoryProcessRunner) => Promise<void> | void;
    command?: Parameters<typeof doctor>[0];
    commands?: Record<string, number>;
  }> = {},
) {
  const { fs, runner } = makeHealthyFixture(options.commands);
  await options.mutate?.(fs, runner);
  return doctor(options.command ?? { targetDir: '/target' }, fs, runner);
}

function findCheck(result: Awaited<ReturnType<typeof doctor>>, name: string) {
  return result.checks.find((check) => check.name === name);
}

describe('doctor use case health checks', () => {
  it('reports healthy when all required files exist and hooks are configured', async () => {
    const result = await runDoctorWithFixture();
    expect(result.healthy).toBe(true);
    expect(result.checks.every((check) => check.passed)).toBe(true);
    expect(findCheck(result, 'git core.hooksPath')?.detail).toBe('core.hooksPath = .githooks');
    expect(findCheck(result, '.githooks directory')?.detail).toContain('.githooks');
    expect(findCheck(result, '.github/workflows/quality.yml')?.detail).toContain(
      'quality.yml present',
    );
  });

  it('reports unhealthy when hooks path is not set or empty', async () => {
    const missingHooksPath = await runDoctorWithFixture({
      commands: { 'git config core.hooksPath': 1 },
    });
    const emptyHooksPath = await runDoctorWithFixture({
      mutate: (_fs, runner) => {
        runner.setStdout('git config core.hooksPath', '');
      },
    });

    expect(findCheck(missingHooksPath, 'git core.hooksPath')?.detail).toContain('not set');
    expect(findCheck(emptyHooksPath, 'git core.hooksPath')?.detail).toContain('empty');
    expect(missingHooksPath.healthy).toBe(false);
    expect(emptyHooksPath.healthy).toBe(false);
  });

  it('reports unhealthy when hooks path points at another hook manager', async () => {
    const result = await runDoctorWithFixture({
      mutate: (_fs, runner) => {
        runner.setStdout('git config core.hooksPath', '.husky');
      },
    });

    expect(result.healthy).toBe(false);
    expect(findCheck(result, 'git core.hooksPath')?.passed).toBe(false);
    expect(findCheck(result, 'git core.hooksPath')?.detail).toContain('expected .githooks');
  });

  it('includes detail messages for all checks and handles git command errors', async () => {
    const runner = { run: async () => Promise.reject(new Error('git not found')) };
    const fs = new InMemoryFilesystem();
    const result = await doctor({ targetDir: '/target' }, fs, runner);

    expect(result.checks.every((check) => check.detail.length > 0)).toBe(true);
    expect(findCheck(result, 'git core.hooksPath')?.passed).toBe(false);
  });

  it('marks healthy false when any check fails', async () => {
    const result = await runDoctorWithFixture({
      mutate: async (fs) => {
        await fs.rmdir('/target/.githooks', { recursive: true });
      },
    });
    expect(result.healthy).toBe(false);
    expect(result.checks.every((check) => check.passed)).toBe(false);
  });
});

describe('doctor use case infrastructure presence', () => {
  it('reports unhealthy when .githooks directory is missing', async () => {
    const result = await runDoctorWithFixture({
      mutate: async (fs) => {
        await fs.rmdir('/target/.githooks', { recursive: true });
      },
    });
    expect(findCheck(result, '.githooks directory')?.detail).toContain('run: noslop init');
  });

  it('reports unhealthy when quality.yml is missing', async () => {
    const result = await runDoctorWithFixture({
      mutate: async (fs) => {
        await fs.rm('/target/.github/workflows/quality.yml');
      },
    });
    expect(findCheck(result, '.github/workflows/quality.yml')?.detail).toContain('quality.yml');
  });

  it('reports unhealthy when .claude/hooks directory is missing', async () => {
    const result = await runDoctorWithFixture({
      mutate: async (fs) => {
        await fs.rmdir('/target/.claude/hooks', { recursive: true });
      },
    });
    expect(findCheck(result, '.claude/hooks directory')?.detail).toContain('run: noslop init');
  });
});

describe('doctor use case toolchain checks', () => {
  it('skips toolchain checks when packs is missing or empty', async () => {
    const withoutPacks = await runDoctorWithFixture();
    const emptyPacks = await runDoctorWithFixture({
      command: { targetDir: '/target', packs: [] },
    });

    expect(withoutPacks.checks.filter((check) => check.name.startsWith('toolchain:'))).toHaveLength(
      0,
    );
    expect(emptyPacks.checks.filter((check) => check.name.startsWith('toolchain:'))).toHaveLength(
      0,
    );
  });

  it('adds toolchain checks when packs are provided', async () => {
    const result = await runDoctorWithFixture({
      mutate: (_fs, runner) => {
        runner.setStdout('zig version', '0.11.0');
      },
      command: {
        targetDir: '/target',
        packs: [createPack('zig', 'Zig', [createGate('build', 'zig build', 'fast')])],
      },
    });

    const zigCheck = findCheck(result, 'toolchain: zig/zig');
    expect(zigCheck?.passed).toBe(true);
    expect(zigCheck?.detail).toBe('zig found');
  });

  it('non-strict toolchain failures stay informational and do not affect healthy', async () => {
    const result = await runDoctorWithFixture({
      commands: { 'dart --version': 1 },
      command: {
        targetDir: '/target',
        packs: [createPack('dart', 'Dart', [createGate('test', 'dart test', 'fast')])],
      },
    });

    expect(findCheck(result, 'toolchain: dart/dart')?.detail).toContain('not found');
    expect(findCheck(result, 'toolchain: dart/dart')?.passed).toBe(true);
    expect(result.healthy).toBe(true);
  });

  it('treats thrown toolchain lookups as missing binaries', async () => {
    const fs = new InMemoryFilesystem();
    seedAll(fs);
    let callCount = 0;
    const runner = {
      run: async (command: string) => {
        if (command === 'git config core.hooksPath') {
          return { exitCode: 0, stdout: '.githooks', stderr: '' };
        }
        callCount++;
        throw new Error('command not found');
      },
    };

    const result = await doctor(
      {
        targetDir: '/target',
        packs: [createPack('zig', 'Zig', [createGate('build', 'zig build', 'fast')])],
      },
      fs,
      runner,
    );

    expect(callCount).toBeGreaterThan(0);
    expect(findCheck(result, 'toolchain: zig/zig')?.detail).toContain('not found');
  });
});

describe('doctor use case permissions and strict mode', () => {
  it('reports hook permissions correctly', async () => {
    const executable = await runDoctorWithFixture();
    const nonExecutable = await runDoctorWithFixture({
      mutate: async (fs) => {
        await fs.rmdir('/target/.githooks', { recursive: true });
        fs.seed('/target/.githooks/pre-commit', '#!/bin/sh');
      },
    });
    const missingPreCommit = await runDoctorWithFixture({
      mutate: async (fs) => {
        await fs.rm('/target/.githooks/pre-commit');
      },
    });

    expect(findCheck(executable, '.githooks/pre-commit permissions')?.passed).toBe(true);
    expect(findCheck(nonExecutable, '.githooks/pre-commit permissions')?.detail).toContain(
      'chmod +x',
    );
    expect(findCheck(missingPreCommit, '.githooks/pre-commit permissions')).toBeUndefined();
  });

  it('strict mode fails when required toolchains are missing', async () => {
    const result = await runDoctorWithFixture({
      commands: {
        'cargo --version': 1,
        'cargo clippy --version': 1,
      },
      command: {
        targetDir: '/target',
        packs: [createPack('rust', 'Rust', [createGate('build', 'cargo build', 'fast')])],
        strict: true,
      },
    });

    expect(findCheck(result, 'toolchain: rust/cargo')?.passed).toBe(false);
    expect(result.healthy).toBe(false);
  });

  it('strict mode passes when toolchain is available', async () => {
    const result = await runDoctorWithFixture({
      mutate: (_fs, runner) => {
        runner.setStdout('zig version', '0.11.0');
      },
      command: {
        targetDir: '/target',
        packs: [createPack('zig', 'Zig', [createGate('build', 'zig build', 'fast')])],
        strict: true,
      },
    });

    expect(findCheck(result, 'toolchain: zig/zig')?.passed).toBe(true);
    expect(result.healthy).toBe(true);
  });
});
