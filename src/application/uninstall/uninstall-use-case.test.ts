import { describe, expect, it } from 'vitest';
import { uninstall } from './uninstall-use-case.js';
import { InMemoryFilesystem } from '../../infrastructure/adapters/in-memory-filesystem.js';
import { InMemoryProcessRunner } from '../../infrastructure/adapters/in-memory-process-runner.js';

function seedFullInstall(fs: InMemoryFilesystem, dir: string): void {
  fs.seed(`${dir}/.github/workflows/quality.yml`, 'ci');
  fs.seed(`${dir}/.github/workflows/guardrails.yml`, 'guard');
  fs.seed(`${dir}/.claude/settings.json`, '{}');
  fs.seed(`${dir}/AGENTS.md`, '# Agents');
  fs.seed(`${dir}/.githooks/pre-commit`, '#!/bin/sh');
  fs.seed(`${dir}/.githooks/pre-push`, '#!/bin/sh');
  fs.seed(`${dir}/.claude/hooks/pre-tool-use.sh`, '#!/bin/sh');
  for (const script of [
    'check',
    'fmt',
    'lint',
    'test',
    'typecheck',
    'mutation',
    'spell',
    'build',
  ]) {
    fs.seed(`${dir}/scripts/${script}`, '#!/bin/sh');
  }
}

describe('uninstall removes noslop-owned files', () => {
  it('removes infrastructure files, scripts, and directories recursively', async () => {
    const fs = new InMemoryFilesystem();
    const runner = new InMemoryProcessRunner();
    seedFullInstall(fs, '/project');

    const result = await uninstall({ targetDir: '/project' }, fs, runner);

    expect(result.filesRemoved).toContain('.github/workflows/quality.yml');
    expect(result.filesRemoved).toContain('scripts/check');
    expect(result.dirsRemoved).toContain('.githooks');
    expect(result.dirsRemoved).toContain('.claude/hooks');
    expect(await fs.exists('/project/AGENTS.md')).toBe(false);
    expect(await fs.exists('/project/.githooks/pre-commit')).toBe(false);
  });

  it('skips missing files and resets git hooks path by default', async () => {
    const fs = new InMemoryFilesystem();
    const runner = new InMemoryProcessRunner();
    await fs.mkdir('/project');

    const result = await uninstall({ targetDir: '/project' }, fs, runner);
    expect(result.filesRemoved).toHaveLength(0);
    expect(result.dirsRemoved).toHaveLength(0);
    expect(result.hooksReset).toBe(true);
  });

  it('handles git config --unset failure gracefully', async () => {
    const fs = new InMemoryFilesystem();
    const runner = new InMemoryProcessRunner({ 'git config --unset core.hooksPath': 5 });
    await fs.mkdir('/project');

    const result = await uninstall({ targetDir: '/project' }, fs, runner);
    expect(result.hooksReset).toBe(false);
  });
});

describe('uninstall preserves user-owned content', () => {
  it('does not remove user config files', async () => {
    const fs = new InMemoryFilesystem();
    const runner = new InMemoryProcessRunner();
    seedFullInstall(fs, '/project');
    fs.seed('/project/eslint.config.js', '// user config');
    fs.seed('/project/.noslop.json', '{}');
    fs.seed('/project/cspell.json', '{}');

    await uninstall({ targetDir: '/project' }, fs, runner);
    expect(await fs.exists('/project/eslint.config.js')).toBe(true);
    expect(await fs.exists('/project/.noslop.json')).toBe(true);
    expect(await fs.exists('/project/cspell.json')).toBe(true);
  });

  it('removes empty parent directories but leaves non-empty parents alone', async () => {
    const runner = new InMemoryProcessRunner();
    const emptyParentFs = new InMemoryFilesystem();
    const nonEmptyParentFs = new InMemoryFilesystem();
    emptyParentFs.seed('/project/.github/workflows/quality.yml', 'ci');
    emptyParentFs.seed('/project/.github/workflows/guardrails.yml', 'guard');
    nonEmptyParentFs.seed('/project/.github/workflows/quality.yml', 'ci');
    nonEmptyParentFs.seed('/project/.github/workflows/guardrails.yml', 'guard');
    nonEmptyParentFs.seed('/project/.github/workflows/deploy.yml', 'user workflow');

    const emptied = await uninstall({ targetDir: '/project' }, emptyParentFs, runner);
    const preserved = await uninstall({ targetDir: '/project' }, nonEmptyParentFs, runner);

    expect(emptied.dirsRemoved).toContain('.github/workflows');
    expect(emptied.dirsRemoved).toContain('.github');
    expect(preserved.dirsRemoved).not.toContain('.github/workflows');
    expect(preserved.dirsRemoved).not.toContain('.github');
  });

  it('returns the correct result for a partial installation', async () => {
    const fs = new InMemoryFilesystem();
    const runner = new InMemoryProcessRunner();
    fs.seed('/project/AGENTS.md', '# Agents');
    fs.seed('/project/.githooks/pre-commit', '#!/bin/sh');

    const result = await uninstall({ targetDir: '/project' }, fs, runner);
    expect(result.filesRemoved).toEqual(['AGENTS.md']);
    expect(result.dirsRemoved).toContain('.githooks');
  });
});
