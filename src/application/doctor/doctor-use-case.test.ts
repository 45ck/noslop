import { describe, expect, it } from 'vitest';
import { doctor } from './doctor-use-case.js';
import { InMemoryFilesystem } from '../../infrastructure/adapters/in-memory-filesystem.js';
import { InMemoryProcessRunner } from '../../infrastructure/adapters/in-memory-process-runner.js';

function seedAll(fs: InMemoryFilesystem): void {
  fs.seed('/target/.githooks/pre-commit', '#!/bin/sh');
  fs.seed('/target/.githooks/pre-push', '#!/bin/sh');
  fs.seed('/target/.githooks/commit-msg', '#!/bin/sh');
  fs.seed('/target/.github/workflows/quality.yml', 'name: quality');
  fs.seed('/target/.github/workflows/guardrails.yml', 'name: guardrails');
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

    const preCommitCheck = result.checks.find((c) => c.name === 'pre-commit');
    expect(preCommitCheck?.detail).toContain('pre-commit present');

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

  it('reports unhealthy when a required git hook is missing', async () => {
    const fs = new InMemoryFilesystem();
    fs.seed('/target/.github/workflows/quality.yml', 'name: quality');
    fs.seed('/target/.github/workflows/guardrails.yml', 'name: guardrails');
    fs.seed('/target/.claude/settings.json', '{}');
    fs.seed('/target/.claude/hooks/pre-tool-use.sh', '#!/bin/sh');
    fs.seed('/target/AGENTS.md', '# Agents');
    const runner = new InMemoryProcessRunner({ 'git config core.hooksPath': 0 });
    runner.setStdout('git config core.hooksPath', '.githooks');

    const result = await doctor({ targetDir: '/target' }, fs, runner);
    expect(result.healthy).toBe(false);
    const check = result.checks.find((c) => c.name === 'pre-commit');
    expect(check?.passed).toBe(false);
    expect(check?.detail).toContain('run: noslop init');
    expect(check?.detail).toContain('pre-commit');
  });

  it('reports unhealthy when quality.yml is missing', async () => {
    const fs = new InMemoryFilesystem();
    fs.seed('/target/.githooks/pre-commit', '#!/bin/sh');
    fs.seed('/target/.githooks/pre-push', '#!/bin/sh');
    fs.seed('/target/.githooks/commit-msg', '#!/bin/sh');
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

  it('reports unhealthy when guardrails workflow is missing', async () => {
    const fs = new InMemoryFilesystem();
    fs.seed('/target/.githooks/pre-commit', '#!/bin/sh');
    fs.seed('/target/.github/workflows/quality.yml', 'name: quality');
    fs.seed('/target/.githooks/pre-push', '#!/bin/sh');
    fs.seed('/target/.githooks/commit-msg', '#!/bin/sh');
    fs.seed('/target/.claude/settings.json', '{}');
    fs.seed('/target/.claude/hooks/pre-tool-use.sh', '#!/bin/sh');
    fs.seed('/target/AGENTS.md', '# Agents');
    const runner = new InMemoryProcessRunner({ 'git config core.hooksPath': 0 });
    runner.setStdout('git config core.hooksPath', '.githooks');

    const result = await doctor({ targetDir: '/target' }, fs, runner);
    expect(result.healthy).toBe(false);
    const check = result.checks.find((c) => c.name === '.github/workflows/guardrails.yml');
    expect(check?.passed).toBe(false);
    expect(check?.detail).toContain('run: noslop init');
  });

  it('reports unhealthy when Claude pre-tool hook is missing', async () => {
    const fs = new InMemoryFilesystem();
    fs.seed('/target/.githooks/pre-commit', '#!/bin/sh');
    fs.seed('/target/.githooks/pre-push', '#!/bin/sh');
    fs.seed('/target/.githooks/commit-msg', '#!/bin/sh');
    fs.seed('/target/.github/workflows/quality.yml', 'name: quality');
    fs.seed('/target/.github/workflows/guardrails.yml', 'name: guardrails');
    fs.seed('/target/.claude/settings.json', '{}');
    fs.seed('/target/AGENTS.md', '# Agents');
    const runner = new InMemoryProcessRunner({ 'git config core.hooksPath': 0 });
    runner.setStdout('git config core.hooksPath', '.githooks');

    const result = await doctor({ targetDir: '/target' }, fs, runner);
    expect(result.healthy).toBe(false);
    const check = result.checks.find((c) => c.name === '.claude/hooks/pre-tool-use.sh');
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
    fs.seed('/target/.github/workflows/guardrails.yml', 'name: guardrails');
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

  it('reports unhealthy when hooks path points somewhere else', async () => {
    const fs = new InMemoryFilesystem();
    seedAll(fs);
    const runner = new InMemoryProcessRunner({ 'git config core.hooksPath': 0 });
    runner.setStdout('git config core.hooksPath', '.husky/_');

    const result = await doctor({ targetDir: '/target' }, fs, runner);
    const check = result.checks.find((c) => c.name === 'git core.hooksPath');
    expect(check?.passed).toBe(false);
    expect(check?.detail).toContain('.husky/_');
    expect(check?.detail).toContain('.githooks');
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
});
