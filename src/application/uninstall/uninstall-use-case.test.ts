import { describe, expect, it } from 'vitest';
import { uninstall } from './uninstall-use-case.js';
import { InMemoryFilesystem } from '../../infrastructure/adapters/in-memory-filesystem.js';
import { InMemoryProcessRunner } from '../../infrastructure/adapters/in-memory-process-runner.js';

function seedFullInstall(fs: InMemoryFilesystem, dir: string): void {
  // Infrastructure files
  fs.seed(`${dir}/.github/workflows/quality.yml`, 'ci');
  fs.seed(`${dir}/.github/workflows/guardrails.yml`, 'guard');
  fs.seed(`${dir}/.claude/settings.json`, '{}');
  fs.seed(`${dir}/AGENTS.md`, '# Agents');

  // Infrastructure dirs
  fs.seed(`${dir}/.githooks/pre-commit`, '#!/bin/sh');
  fs.seed(`${dir}/.githooks/pre-push`, '#!/bin/sh');
  fs.seed(`${dir}/.claude/hooks/pre-tool-use.sh`, '#!/bin/sh');

  // Scripts
  fs.seed(`${dir}/scripts/check`, '#!/bin/sh');
  fs.seed(`${dir}/scripts/fmt`, '#!/bin/sh');
  fs.seed(`${dir}/scripts/lint`, '#!/bin/sh');
  fs.seed(`${dir}/scripts/test`, '#!/bin/sh');
  fs.seed(`${dir}/scripts/typecheck`, '#!/bin/sh');
  fs.seed(`${dir}/scripts/mutation`, '#!/bin/sh');
  fs.seed(`${dir}/scripts/spell`, '#!/bin/sh');
  fs.seed(`${dir}/scripts/build`, '#!/bin/sh');
}

describe('uninstall', () => {
  it('removes all infrastructure files when present', async () => {
    const fs = new InMemoryFilesystem();
    const runner = new InMemoryProcessRunner();
    seedFullInstall(fs, '/project');

    const result = await uninstall({ targetDir: '/project' }, fs, runner);

    expect(result.filesRemoved).toContain('.github/workflows/quality.yml');
    expect(result.filesRemoved).toContain('.github/workflows/guardrails.yml');
    expect(result.filesRemoved).toContain('.claude/settings.json');
    expect(result.filesRemoved).toContain('AGENTS.md');
    expect(await fs.exists('/project/AGENTS.md')).toBe(false);
  });

  it('removes all script files when present', async () => {
    const fs = new InMemoryFilesystem();
    const runner = new InMemoryProcessRunner();
    seedFullInstall(fs, '/project');

    const result = await uninstall({ targetDir: '/project' }, fs, runner);

    expect(result.filesRemoved).toContain('scripts/check');
    expect(result.filesRemoved).toContain('scripts/fmt');
    expect(result.filesRemoved).toContain('scripts/lint');
    expect(result.filesRemoved).toContain('scripts/test');
    expect(result.filesRemoved).toContain('scripts/typecheck');
    expect(result.filesRemoved).toContain('scripts/mutation');
    expect(result.filesRemoved).toContain('scripts/spell');
    expect(result.filesRemoved).toContain('scripts/build');
  });

  it('removes infrastructure directories recursively', async () => {
    const fs = new InMemoryFilesystem();
    const runner = new InMemoryProcessRunner();
    seedFullInstall(fs, '/project');

    const result = await uninstall({ targetDir: '/project' }, fs, runner);

    expect(result.dirsRemoved).toContain('.githooks');
    expect(result.dirsRemoved).toContain('.claude/hooks');
    expect(await fs.exists('/project/.githooks/pre-commit')).toBe(false);
  });

  it('skips silently when files do not exist', async () => {
    const fs = new InMemoryFilesystem();
    const runner = new InMemoryProcessRunner();
    await fs.mkdir('/project');

    const result = await uninstall({ targetDir: '/project' }, fs, runner);

    expect(result.filesRemoved).toHaveLength(0);
    expect(result.dirsRemoved).toHaveLength(0);
  });

  it('resets git hooks path', async () => {
    const fs = new InMemoryFilesystem();
    const runner = new InMemoryProcessRunner();
    await fs.mkdir('/project');

    const result = await uninstall({ targetDir: '/project' }, fs, runner);

    expect(result.hooksReset).toBe(true);
  });

  it('handles git config --unset failure gracefully', async () => {
    const fs = new InMemoryFilesystem();
    const runner = new InMemoryProcessRunner({
      'git config --unset core.hooksPath': 5,
    });
    await fs.mkdir('/project');

    const result = await uninstall({ targetDir: '/project' }, fs, runner);

    expect(result.hooksReset).toBe(false);
  });

  it('does NOT remove user config files', async () => {
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

  it('cleans up empty parent directories', async () => {
    const fs = new InMemoryFilesystem();
    const runner = new InMemoryProcessRunner();
    // Only noslop files in .github — after removal, .github/workflows and .github should be empty
    fs.seed('/project/.github/workflows/quality.yml', 'ci');
    fs.seed('/project/.github/workflows/guardrails.yml', 'guard');

    const result = await uninstall({ targetDir: '/project' }, fs, runner);

    expect(result.filesRemoved).toContain('.github/workflows/quality.yml');
    expect(result.dirsRemoved).toContain('.github/workflows');
    expect(result.dirsRemoved).toContain('.github');
  });

  it('leaves non-empty parent directories alone', async () => {
    const fs = new InMemoryFilesystem();
    const runner = new InMemoryProcessRunner();
    fs.seed('/project/.github/workflows/quality.yml', 'ci');
    fs.seed('/project/.github/workflows/guardrails.yml', 'guard');
    fs.seed('/project/.github/workflows/deploy.yml', 'user workflow');

    const result = await uninstall({ targetDir: '/project' }, fs, runner);

    expect(result.filesRemoved).toContain('.github/workflows/quality.yml');
    // .github/workflows still has deploy.yml, so it should NOT be removed
    expect(result.dirsRemoved).not.toContain('.github/workflows');
    expect(result.dirsRemoved).not.toContain('.github');
  });

  it('returns correct counts for partial installation', async () => {
    const fs = new InMemoryFilesystem();
    const runner = new InMemoryProcessRunner();
    fs.seed('/project/AGENTS.md', '# Agents');
    fs.seed('/project/.githooks/pre-commit', '#!/bin/sh');

    const result = await uninstall({ targetDir: '/project' }, fs, runner);

    expect(result.filesRemoved).toEqual(['AGENTS.md']);
    expect(result.dirsRemoved).toContain('.githooks');
  });
});
