import { describe, expect, it } from 'vitest';
import { init } from './init-use-case.js';
import type { InitCommand } from './init-use-case.js';
import { createPack } from '../../domain/pack/pack.js';
import { createGate } from '../../domain/gate/gate.js';
import { createConfig } from '../../domain/config/noslop-config.js';
import { InMemoryFilesystem } from '../../infrastructure/adapters/in-memory-filesystem.js';
import { InMemoryProcessRunner } from '../../infrastructure/adapters/in-memory-process-runner.js';

function makeCommand(overrides: Partial<InitCommand> = {}): InitCommand {
  return {
    targetDir: '/target',
    templatesDir: '/templates',
    packs: [],
    config: createConfig([], []),
    ...overrides,
  };
}

describe('init use case', () => {
  it('returns empty filesWritten when no packs provided', async () => {
    const fs = new InMemoryFilesystem();
    const runner = new InMemoryProcessRunner();
    const result = await init(makeCommand(), fs, runner);
    expect(result.filesWritten).toHaveLength(0);
  });

  it('skips packs whose template directory does not exist', async () => {
    const pack = createPack('typescript', 'TypeScript', [createGate('lint', 'eslint .', 'fast')]);
    const fs = new InMemoryFilesystem();
    const runner = new InMemoryProcessRunner();
    const result = await init(makeCommand({ packs: [pack] }), fs, runner);
    expect(result.filesWritten).toHaveLength(0);
  });

  it('copies template files when pack template directory exists', async () => {
    const pack = createPack('typescript', 'TypeScript', []);
    const fs = new InMemoryFilesystem();
    fs.seed('/templates/packs/typescript/.githooks/pre-commit', '#!/bin/sh\nnoslop check');
    fs.seed('/templates/packs/typescript/AGENTS.md', '# Agents');
    const runner = new InMemoryProcessRunner({ 'git config core.hooksPath .githooks': 0 });

    const result = await init(makeCommand({ packs: [pack] }), fs, runner);

    expect(result.filesWritten.length).toBeGreaterThan(0);
  });

  it('configures git hooks when .githooks exists in target', async () => {
    const pack = createPack('typescript', 'TypeScript', []);
    const fs = new InMemoryFilesystem();
    fs.seed('/templates/packs/typescript/.githooks/pre-commit', '#!/bin/sh');
    const runner = new InMemoryProcessRunner({ 'git config core.hooksPath .githooks': 0 });

    const result = await init(makeCommand({ packs: [pack] }), fs, runner);
    expect(result.hooksConfigured).toBe(true);
  });

  it('reports hooksConfigured false when git command fails', async () => {
    const pack = createPack('typescript', 'TypeScript', []);
    const fs = new InMemoryFilesystem();
    fs.seed('/templates/packs/typescript/.githooks/pre-commit', '#!/bin/sh');
    const runner = new InMemoryProcessRunner({ 'git config core.hooksPath .githooks': 1 });

    const result = await init(makeCommand({ packs: [pack] }), fs, runner);
    expect(result.hooksConfigured).toBe(false);
  });
});
