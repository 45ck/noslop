import { describe, expect, it } from 'vitest';
import { init } from './init-use-case.js';
import type { InitCommand } from './init-use-case.js';
import type { IConflictResolver, ConflictResolution } from '../ports/conflict-resolver.js';
import { createPack } from '../../domain/pack/pack.js';
import { createGate } from '../../domain/gate/gate.js';
import { createConfig } from '../../domain/config/noslop-config.js';
import { InMemoryFilesystem } from '../../infrastructure/adapters/in-memory-filesystem.js';
import { InMemoryProcessRunner } from '../../infrastructure/adapters/in-memory-process-runner.js';

const GATE = createGate('lint', 'eslint .', 'fast');
const TYPESCRIPT_PACK = createPack('typescript', 'TypeScript', [GATE]);

function makeResolver(resolution: ConflictResolution = 'overwrite'): IConflictResolver {
  return { resolve: async () => resolution };
}

function makeSpyResolver(): IConflictResolver & { calls: string[] } {
  const calls: string[] = [];
  return {
    calls,
    resolve: async (filePath: string) => {
      calls.push(filePath);
      return 'overwrite';
    },
  };
}

function makeCommand(overrides: Partial<InitCommand> = {}): InitCommand {
  return {
    targetDir: '/target',
    templatesDir: '/templates',
    packs: [],
    config: createConfig(['typescript'], []),
    ...overrides,
  };
}

function seedTemplates(fs: InMemoryFilesystem, files: Record<string, string>): void {
  for (const [relativePath, content] of Object.entries(files)) {
    fs.seed(`/templates/packs/typescript/${relativePath}`, content);
  }
}

describe('init use case basic copying', () => {
  it('returns empty filesWritten and hooksConfigured false when no packs are provided', async () => {
    const fs = new InMemoryFilesystem();
    const runner = new InMemoryProcessRunner();
    const result = await init(makeCommand(), fs, runner, makeResolver());
    expect(result.filesWritten).toEqual([]);
    expect(result.hooksConfigured).toBe(false);
  });

  it('skips packs whose template directory does not exist', async () => {
    const fs = new InMemoryFilesystem();
    const runner = new InMemoryProcessRunner();
    const result = await init(
      makeCommand({ packs: [TYPESCRIPT_PACK] }),
      fs,
      runner,
      makeResolver(),
    );
    expect(result.filesWritten).toEqual([]);
  });

  it('copies template files to target-rooted paths', async () => {
    const fs = new InMemoryFilesystem();
    seedTemplates(fs, {
      '.githooks/pre-commit': '#!/bin/sh\nnoslop check',
      'AGENTS.md': '# Agents',
      '.github/workflows/quality.yml': 'name: quality',
      'scripts/check': '#!/bin/sh',
    });
    const runner = new InMemoryProcessRunner({ 'git config core.hooksPath .githooks': 0 });

    const result = await init(
      makeCommand({ packs: [TYPESCRIPT_PACK] }),
      fs,
      runner,
      makeResolver(),
    );
    expect([...result.filesWritten].sort()).toEqual(
      [
        '/target/.github/workflows/quality.yml',
        '/target/.githooks/pre-commit',
        '/target/AGENTS.md',
        '/target/scripts/check',
      ].sort(),
    );
  });

  it('copies nested template files to the matching nested target path', async () => {
    const fs = new InMemoryFilesystem();
    seedTemplates(fs, { 'subdir/deep/file.txt': 'contents' });
    const runner = new InMemoryProcessRunner();

    const result = await init(
      makeCommand({ packs: [TYPESCRIPT_PACK] }),
      fs,
      runner,
      makeResolver(),
    );
    expect(result.filesWritten).toEqual(['/target/subdir/deep/file.txt']);
  });
});

describe('init use case hook configuration', () => {
  it('configures git hooks when .githooks exists in the copied output', async () => {
    const fs = new InMemoryFilesystem();
    seedTemplates(fs, { '.githooks/pre-commit': '#!/bin/sh' });
    const runner = new InMemoryProcessRunner({ 'git config core.hooksPath .githooks': 0 });

    const result = await init(
      makeCommand({ packs: [TYPESCRIPT_PACK] }),
      fs,
      runner,
      makeResolver(),
    );
    expect(result.hooksConfigured).toBe(true);
  });

  it('runs git config core.hooksPath .githooks with targetDir as cwd', async () => {
    const fs = new InMemoryFilesystem();
    seedTemplates(fs, { '.githooks/pre-commit': '#!/bin/sh' });
    const calls: { command: string; cwd: string | undefined }[] = [];
    const runner = {
      run: async (command: string, cwd?: string) => {
        calls.push({ command, cwd });
        return { exitCode: 0, stdout: '', stderr: '' };
      },
    };

    await init(makeCommand({ packs: [TYPESCRIPT_PACK] }), fs, runner, makeResolver());
    expect(calls).toEqual([{ command: 'git config core.hooksPath .githooks', cwd: '/target' }]);
  });

  it('reports hooksConfigured false when git hook setup fails or is skipped', async () => {
    const fs = new InMemoryFilesystem();
    seedTemplates(fs, { 'AGENTS.md': '# Agents' });
    const failedRunner = new InMemoryProcessRunner({ 'git config core.hooksPath .githooks': 1 });
    const missingHooks = await init(
      makeCommand({ packs: [TYPESCRIPT_PACK] }),
      fs,
      failedRunner,
      makeResolver(),
    );

    const throwingResult = await init(
      makeCommand({ packs: [TYPESCRIPT_PACK] }),
      fs,
      { run: async () => Promise.reject(new Error('spawn failed')) },
      makeResolver(),
    );

    expect(missingHooks.hooksConfigured).toBe(false);
    expect(throwingResult.hooksConfigured).toBe(false);
  });
});

describe('init use case permissions and safety', () => {
  it('marks hooks and scripts executable and leaves normal files non-executable', async () => {
    const fs = new InMemoryFilesystem();
    seedTemplates(fs, {
      '.githooks/pre-commit': '#!/bin/sh',
      'scripts/check': '#!/bin/sh',
      'AGENTS.md': '# Agents',
      '.github/workflows/quality.yml': 'name: quality',
    });
    const runner = new InMemoryProcessRunner({ 'git config core.hooksPath .githooks': 0 });

    await init(makeCommand({ packs: [TYPESCRIPT_PACK] }), fs, runner, makeResolver());

    const executableCalls = fs.chmodCalls.filter((call) => call.mode === 0o755);
    const regularCalls = fs.chmodCalls.filter((call) => call.mode === 0o644);
    expect(executableCalls.map((call) => call.path).sort()).toEqual(
      ['/target/.githooks/pre-commit', '/target/scripts/check'].sort(),
    );
    expect(regularCalls.map((call) => call.path).sort()).toEqual(
      ['/target/.github/workflows/quality.yml', '/target/AGENTS.md'].sort(),
    );
  });

  it('skips template entries containing path traversal', async () => {
    const fs = new InMemoryFilesystem();
    seedTemplates(fs, {
      '../../../etc/passwd': 'malicious',
      'AGENTS.md': '# Agents',
    });
    const runner = new InMemoryProcessRunner();

    const result = await init(
      makeCommand({ packs: [TYPESCRIPT_PACK] }),
      fs,
      runner,
      makeResolver(),
    );
    expect(result.filesWritten).toEqual(['/target/AGENTS.md']);
    expect(await fs.exists('/etc/passwd')).toBe(false);
  });
});

describe('init use case conflict resolution', () => {
  it('respects resolver decisions for existing non-infrastructure files', async () => {
    const fs = new InMemoryFilesystem();
    seedTemplates(fs, { 'eslint.config.js': 'export default []' });
    fs.seed('/target/eslint.config.js', '// existing');
    const runner = new InMemoryProcessRunner();

    const skipped = await init(
      makeCommand({ packs: [TYPESCRIPT_PACK] }),
      fs,
      runner,
      makeResolver('skip'),
    );
    expect(skipped.filesWritten).toEqual([]);
    expect(await fs.readFile('/target/eslint.config.js')).toBe('// existing');

    const overwritten = await init(
      makeCommand({ packs: [TYPESCRIPT_PACK] }),
      fs,
      runner,
      makeResolver('overwrite'),
    );
    expect(overwritten.filesWritten).toEqual(['/target/eslint.config.js']);
    expect(await fs.readFile('/target/eslint.config.js')).toBe('export default []');
  });

  it('always overwrites gate infrastructure files regardless of resolver', async () => {
    const fs = new InMemoryFilesystem();
    seedTemplates(fs, { '.githooks/pre-commit': '#!/bin/sh\nnew' });
    fs.seed('/target/.githooks/pre-commit', '#!/bin/sh\nold');
    const runner = new InMemoryProcessRunner({ 'git config core.hooksPath .githooks': 0 });

    const result = await init(
      makeCommand({ packs: [TYPESCRIPT_PACK] }),
      fs,
      runner,
      makeResolver('skip'),
    );
    expect(result.filesWritten).toEqual(['/target/.githooks/pre-commit']);
    expect(await fs.readFile('/target/.githooks/pre-commit')).toBe('#!/bin/sh\nnew');
  });

  it('calls the resolver only for existing non-infrastructure files', async () => {
    const fs = new InMemoryFilesystem();
    seedTemplates(fs, {
      '.githooks/pre-commit': '#!/bin/sh',
      'eslint.config.js': 'export default []',
    });
    fs.seed('/target/eslint.config.js', '// existing');
    const runner = new InMemoryProcessRunner({ 'git config core.hooksPath .githooks': 0 });
    const resolver = makeSpyResolver();

    await init(makeCommand({ packs: [TYPESCRIPT_PACK] }), fs, runner, resolver);
    expect(resolver.calls).toEqual(['/target/eslint.config.js']);
  });

  it('does not call the resolver for new files', async () => {
    const fs = new InMemoryFilesystem();
    seedTemplates(fs, { 'eslint.config.js': 'export default []' });
    const runner = new InMemoryProcessRunner();
    const resolver = makeSpyResolver();

    await init(makeCommand({ packs: [TYPESCRIPT_PACK] }), fs, runner, resolver);
    expect(resolver.calls).toEqual([]);
  });
});
