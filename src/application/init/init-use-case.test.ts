import { describe, expect, it } from 'vitest';
import { init } from './init-use-case.js';
import type { InitCommand } from './init-use-case.js';
import { createPack } from '../../domain/pack/pack.js';
import { createGate } from '../../domain/gate/gate.js';
import { createConfig } from '../../domain/config/noslop-config.js';
import { InMemoryFilesystem } from '../../infrastructure/adapters/in-memory-filesystem.js';
import { InMemoryProcessRunner } from '../../infrastructure/adapters/in-memory-process-runner.js';

const GATE = createGate('lint', 'eslint .', 'fast');

function makeCommand(overrides: Partial<InitCommand> = {}): InitCommand {
  return {
    targetDir: '/target',
    templatesDir: '/templates',
    packs: [],
    config: createConfig(['typescript'], []),
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
    const pack = createPack('typescript', 'TypeScript', [GATE]);
    const fs = new InMemoryFilesystem();
    const runner = new InMemoryProcessRunner();
    const result = await init(makeCommand({ packs: [pack] }), fs, runner);
    expect(result.filesWritten).toHaveLength(0);
  });

  it('copies template files when pack template directory exists', async () => {
    const pack = createPack('typescript', 'TypeScript', [GATE]);
    const fs = new InMemoryFilesystem();
    fs.seed('/templates/packs/typescript/.githooks/pre-commit', '#!/bin/sh\nnoslop check');
    fs.seed('/templates/packs/typescript/AGENTS.md', '# Agents');
    const runner = new InMemoryProcessRunner({ 'git config core.hooksPath .githooks': 0 });

    const result = await init(makeCommand({ packs: [pack] }), fs, runner);

    expect(result.filesWritten.length).toBeGreaterThan(0);
  });

  it('copies nested template files to correct target paths (MIS2)', async () => {
    const pack = createPack('typescript', 'TypeScript', [GATE]);
    const fs = new InMemoryFilesystem();
    fs.seed('/templates/packs/typescript/.githooks/pre-commit', '#!/bin/sh');
    fs.seed('/templates/packs/typescript/.github/workflows/quality.yml', 'name: quality');
    fs.seed('/templates/packs/typescript/scripts/check', '#!/bin/sh');
    const runner = new InMemoryProcessRunner({ 'git config core.hooksPath .githooks': 0 });

    const result = await init(makeCommand({ packs: [pack] }), fs, runner);

    const paths = result.filesWritten;
    expect(paths).toContain('/target/.githooks/pre-commit');
    expect(paths).toContain('/target/.github/workflows/quality.yml');
    expect(paths).toContain('/target/scripts/check');
  });

  it('configures git hooks when .githooks exists in target', async () => {
    const pack = createPack('typescript', 'TypeScript', [GATE]);
    const fs = new InMemoryFilesystem();
    fs.seed('/templates/packs/typescript/.githooks/pre-commit', '#!/bin/sh');
    const runner = new InMemoryProcessRunner({ 'git config core.hooksPath .githooks': 0 });

    const result = await init(makeCommand({ packs: [pack] }), fs, runner);
    expect(result.hooksConfigured).toBe(true);
  });

  it('reports hooksConfigured false when git command fails', async () => {
    const pack = createPack('typescript', 'TypeScript', [GATE]);
    const fs = new InMemoryFilesystem();
    fs.seed('/templates/packs/typescript/.githooks/pre-commit', '#!/bin/sh');
    const runner = new InMemoryProcessRunner({ 'git config core.hooksPath .githooks': 1 });

    const result = await init(makeCommand({ packs: [pack] }), fs, runner);
    expect(result.hooksConfigured).toBe(false);
  });

  it('reports hooksConfigured false when runner throws', async () => {
    const pack = createPack('typescript', 'TypeScript', [GATE]);
    const fs = new InMemoryFilesystem();
    fs.seed('/templates/packs/typescript/.githooks/pre-commit', '#!/bin/sh');

    const throwingRunner = {
      run: async () => {
        throw new Error('spawn failed');
      },
    };

    const result = await init(makeCommand({ packs: [pack] }), fs, throwingRunner);
    expect(result.hooksConfigured).toBe(false);
  });
});
