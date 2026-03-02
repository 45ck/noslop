import { describe, expect, it } from 'vitest';
import { init } from './init-use-case.js';
import type { InitCommand } from './init-use-case.js';
import type { IConflictResolver, ConflictResolution } from '../ports/conflict-resolver.js';
import { createPack } from '../../domain/pack/pack.js';
import { createGate } from '../../domain/gate/gate.js';
import { createConfig, DEFAULT_SPELL_CONFIG } from '../../domain/config/noslop-config.js';
import { InMemoryFilesystem } from '../../infrastructure/adapters/in-memory-filesystem.js';
import { InMemoryProcessRunner } from '../../infrastructure/adapters/in-memory-process-runner.js';

const GATE = createGate('lint', 'eslint .', 'fast');

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

describe('init use case', () => {
  it('returns empty filesWritten when no packs provided', async () => {
    const fs = new InMemoryFilesystem();
    const runner = new InMemoryProcessRunner();
    const result = await init(makeCommand(), fs, runner, makeResolver());
    expect(result.filesWritten).toEqual([]);
  });

  it('returns hooksConfigured false when no packs provided', async () => {
    const fs = new InMemoryFilesystem();
    const runner = new InMemoryProcessRunner();
    const result = await init(makeCommand(), fs, runner, makeResolver());
    expect(result.hooksConfigured).toBe(false);
  });

  it('skips packs whose template directory does not exist', async () => {
    const pack = createPack('typescript', 'TypeScript', [GATE]);
    const fs = new InMemoryFilesystem();
    const runner = new InMemoryProcessRunner();
    const result = await init(makeCommand({ packs: [pack] }), fs, runner, makeResolver());
    expect(result.filesWritten).toEqual([]);
  });

  it('copies template files when pack template directory exists', async () => {
    const pack = createPack('typescript', 'TypeScript', [GATE]);
    const fs = new InMemoryFilesystem();
    fs.seed('/templates/packs/typescript/.githooks/pre-commit', '#!/bin/sh\nnoslop check');
    fs.seed('/templates/packs/typescript/AGENTS.md', '# Agents');
    const runner = new InMemoryProcessRunner({ 'git config core.hooksPath .githooks': 0 });

    const result = await init(makeCommand({ packs: [pack] }), fs, runner, makeResolver());

    expect(result.filesWritten).toEqual(['/target/.githooks/pre-commit', '/target/AGENTS.md']);
  });

  it('writes files to paths rooted at targetDir using exact pack template paths', async () => {
    const pack = createPack('typescript', 'TypeScript', [GATE]);
    const fs = new InMemoryFilesystem();
    fs.seed('/templates/packs/typescript/AGENTS.md', '# Agents');
    const runner = new InMemoryProcessRunner();

    const result = await init(makeCommand({ packs: [pack] }), fs, runner, makeResolver());

    expect(result.filesWritten).toEqual(['/target/AGENTS.md']);
  });

  it('copies nested template files to correct target paths', async () => {
    const pack = createPack('typescript', 'TypeScript', [GATE]);
    const fs = new InMemoryFilesystem();
    fs.seed('/templates/packs/typescript/.githooks/pre-commit', '#!/bin/sh');
    fs.seed('/templates/packs/typescript/.github/workflows/quality.yml', 'name: quality');
    fs.seed('/templates/packs/typescript/scripts/check', '#!/bin/sh');
    const runner = new InMemoryProcessRunner({ 'git config core.hooksPath .githooks': 0 });

    const result = await init(makeCommand({ packs: [pack] }), fs, runner, makeResolver());

    expect([...result.filesWritten].sort()).toEqual(
      [
        '/target/.github/workflows/quality.yml',
        '/target/.githooks/pre-commit',
        '/target/scripts/check',
      ].sort(),
    );
  });

  it('configures git hooks when .githooks exists in target', async () => {
    const pack = createPack('typescript', 'TypeScript', [GATE]);
    const fs = new InMemoryFilesystem();
    fs.seed('/templates/packs/typescript/.githooks/pre-commit', '#!/bin/sh');
    const runner = new InMemoryProcessRunner({ 'git config core.hooksPath .githooks': 0 });

    const result = await init(makeCommand({ packs: [pack] }), fs, runner, makeResolver());
    expect(result.hooksConfigured).toBe(true);
  });

  it('runs exactly the git config core.hooksPath .githooks command with targetDir as cwd', async () => {
    const pack = createPack('typescript', 'TypeScript', [GATE]);
    const fs = new InMemoryFilesystem();
    fs.seed('/templates/packs/typescript/.githooks/pre-commit', '#!/bin/sh');

    const calls: { command: string; cwd: string | undefined }[] = [];
    const spyRunner = {
      run: async (command: string, cwd?: string) => {
        calls.push({ command, cwd });
        return { exitCode: 0, stdout: '', stderr: '' };
      },
    };

    await init(makeCommand({ packs: [pack] }), fs, spyRunner, makeResolver());

    expect(calls).toHaveLength(1);
    expect(calls[0]?.command).toBe('git config core.hooksPath .githooks');
    expect(calls[0]?.cwd).toBe('/target');
  });

  it('reports hooksConfigured false when git command fails', async () => {
    const pack = createPack('typescript', 'TypeScript', [GATE]);
    const fs = new InMemoryFilesystem();
    fs.seed('/templates/packs/typescript/.githooks/pre-commit', '#!/bin/sh');
    const runner = new InMemoryProcessRunner({ 'git config core.hooksPath .githooks': 1 });

    const result = await init(makeCommand({ packs: [pack] }), fs, runner, makeResolver());
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

    const result = await init(makeCommand({ packs: [pack] }), fs, throwingRunner, makeResolver());
    expect(result.hooksConfigured).toBe(false);
  });

  it('reports hooksConfigured false when no .githooks dir in template', async () => {
    const pack = createPack('typescript', 'TypeScript', [GATE]);
    const fs = new InMemoryFilesystem();
    fs.seed('/templates/packs/typescript/AGENTS.md', '# Agents');
    const runner = new InMemoryProcessRunner({ 'git config core.hooksPath .githooks': 0 });

    const result = await init(makeCommand({ packs: [pack] }), fs, runner, makeResolver());
    expect(result.hooksConfigured).toBe(false);
  });

  it('calls chmod 0o755 on hook and script files, 0o644 on other files', async () => {
    const pack = createPack('typescript', 'TypeScript', [GATE]);
    const fs = new InMemoryFilesystem();
    fs.seed('/templates/packs/typescript/.githooks/pre-commit', '#!/bin/sh');
    fs.seed('/templates/packs/typescript/scripts/check', '#!/bin/sh');
    const runner = new InMemoryProcessRunner({ 'git config core.hooksPath .githooks': 0 });

    await init(makeCommand({ packs: [pack] }), fs, runner, makeResolver());

    expect(fs.chmodCalls).toHaveLength(2);
    for (const call of fs.chmodCalls) {
      expect(call.mode).toBe(0o755);
    }
  });

  it('calls chmod 0o644 on non-executable files', async () => {
    const pack = createPack('typescript', 'TypeScript', [GATE]);
    const fs = new InMemoryFilesystem();
    fs.seed('/templates/packs/typescript/AGENTS.md', '# Agents');
    fs.seed('/templates/packs/typescript/.github/workflows/quality.yml', 'name: quality');
    const runner = new InMemoryProcessRunner();

    await init(makeCommand({ packs: [pack] }), fs, runner, makeResolver());

    expect(fs.chmodCalls).toHaveLength(2);
    for (const call of fs.chmodCalls) {
      expect(call.mode).toBe(0o644);
    }
  });

  it('handles a nested directory entry — nested file appears in filesWritten at correct path', async () => {
    const pack = createPack('typescript', 'TypeScript', [GATE]);
    const fs = new InMemoryFilesystem();
    fs.seed('/templates/packs/typescript/subdir/deep/file.txt', 'contents');
    const runner = new InMemoryProcessRunner();

    const result = await init(makeCommand({ packs: [pack] }), fs, runner, makeResolver());

    expect(result.filesWritten).toEqual(['/target/subdir/deep/file.txt']);
  });

  // Conflict resolution tests
  it('skips a non-infrastructure file that already exists when resolver returns skip', async () => {
    const pack = createPack('typescript', 'TypeScript', [GATE]);
    const fs = new InMemoryFilesystem();
    fs.seed('/templates/packs/typescript/eslint.config.js', 'export default []');
    fs.seed('/target/eslint.config.js', '// existing');
    const runner = new InMemoryProcessRunner();

    const result = await init(makeCommand({ packs: [pack] }), fs, runner, makeResolver('skip'));

    expect(result.filesWritten).toEqual([]);
    // Existing file content must not be overwritten
    expect(await fs.readFile('/target/eslint.config.js')).toBe('// existing');
  });

  it('overwrites a non-infrastructure file that already exists when resolver returns overwrite', async () => {
    const pack = createPack('typescript', 'TypeScript', [GATE]);
    const fs = new InMemoryFilesystem();
    fs.seed('/templates/packs/typescript/eslint.config.js', 'export default []');
    fs.seed('/target/eslint.config.js', '// existing');
    const runner = new InMemoryProcessRunner();

    const result = await init(
      makeCommand({ packs: [pack] }),
      fs,
      runner,
      makeResolver('overwrite'),
    );

    expect(result.filesWritten).toEqual(['/target/eslint.config.js']);
    expect(await fs.readFile('/target/eslint.config.js')).toBe('export default []');
  });

  it('always overwrites gate infrastructure files regardless of resolver', async () => {
    const pack = createPack('typescript', 'TypeScript', [GATE]);
    const fs = new InMemoryFilesystem();
    fs.seed('/templates/packs/typescript/.githooks/pre-commit', '#!/bin/sh\nnew');
    fs.seed('/target/.githooks/pre-commit', '#!/bin/sh\nold');
    const runner = new InMemoryProcessRunner({ 'git config core.hooksPath .githooks': 0 });

    const result = await init(makeCommand({ packs: [pack] }), fs, runner, makeResolver('skip'));

    expect(result.filesWritten).toEqual(['/target/.githooks/pre-commit']);
    expect(await fs.readFile('/target/.githooks/pre-commit')).toBe('#!/bin/sh\nnew');
  });

  it('calls resolver only for non-infrastructure files that already exist', async () => {
    const pack = createPack('typescript', 'TypeScript', [GATE]);
    const fs = new InMemoryFilesystem();
    fs.seed('/templates/packs/typescript/.githooks/pre-commit', '#!/bin/sh');
    fs.seed('/templates/packs/typescript/eslint.config.js', 'export default []');
    fs.seed('/target/eslint.config.js', '// existing');
    const runner = new InMemoryProcessRunner({ 'git config core.hooksPath .githooks': 0 });

    const spy = makeSpyResolver();
    await init(makeCommand({ packs: [pack] }), fs, runner, spy);

    expect(spy.calls).toEqual(['/target/eslint.config.js']);
  });

  it('does not call resolver for new non-infrastructure files', async () => {
    const pack = createPack('typescript', 'TypeScript', [GATE]);
    const fs = new InMemoryFilesystem();
    fs.seed('/templates/packs/typescript/eslint.config.js', 'export default []');
    // No pre-existing /target/eslint.config.js
    const runner = new InMemoryProcessRunner();

    const spy = makeSpyResolver();
    await init(makeCommand({ packs: [pack] }), fs, runner, spy);

    expect(spy.calls).toEqual([]);
  });
});

const SPELL_GATE_CSPELL = createGate('spell', 'cspell --no-progress "{src}/**/*"', 'fast');
const SPELL_GATE_TYPOS = createGate('spell', 'typos', 'fast');

describe('init use case — spell config generation', () => {
  it('writes cspell.json when pack uses cspell and spell is enabled', async () => {
    const pack = createPack('typescript', 'TypeScript', [SPELL_GATE_CSPELL]);
    const fs = new InMemoryFilesystem();
    const runner = new InMemoryProcessRunner();
    const config = createConfig(['typescript'], [], DEFAULT_SPELL_CONFIG);

    await init(makeCommand({ packs: [pack], config }), fs, runner, makeResolver());

    const content = await fs.readFile('/target/cspell.json');
    const parsed = JSON.parse(content) as Record<string, unknown>;
    expect(parsed['version']).toBe('0.2');
    expect(parsed['language']).toBe('en');
    expect(parsed['$schema']).toBeDefined();
    expect(parsed['words']).toEqual([]);
    expect(Array.isArray(parsed['ignorePaths'])).toBe(true);
  });

  it('writes .typos.toml when pack uses typos and spell is enabled', async () => {
    const pack = createPack('rust', 'Rust', [SPELL_GATE_TYPOS]);
    const fs = new InMemoryFilesystem();
    const runner = new InMemoryProcessRunner();
    const config = createConfig(['rust'], [], DEFAULT_SPELL_CONFIG);

    await init(makeCommand({ packs: [pack], config }), fs, runner, makeResolver());

    const content = await fs.readFile('/target/.typos.toml');
    expect(content).toContain('locale = "en-us"');
    expect(content).toContain('[default.extend-words]');
  });

  it('does not write any spell config file when spell is disabled', async () => {
    const pack = createPack('typescript', 'TypeScript', [SPELL_GATE_CSPELL]);
    const fs = new InMemoryFilesystem();
    const runner = new InMemoryProcessRunner();
    const config = createConfig(['typescript'], [], { enabled: false, language: 'en', words: [] });

    await init(makeCommand({ packs: [pack], config }), fs, runner, makeResolver());

    expect(await fs.exists('/target/cspell.json')).toBe(false);
    expect(await fs.exists('/target/.typos.toml')).toBe(false);
  });

  it('includes custom words in generated cspell.json', async () => {
    const pack = createPack('typescript', 'TypeScript', [SPELL_GATE_CSPELL]);
    const fs = new InMemoryFilesystem();
    const runner = new InMemoryProcessRunner();
    const spell = { enabled: true, language: 'en', words: ['EventSourcing', 'AggregateRoot'] };
    const config = createConfig(['typescript'], [], spell);

    await init(makeCommand({ packs: [pack], config }), fs, runner, makeResolver());

    const content = await fs.readFile('/target/cspell.json');
    const parsed = JSON.parse(content) as Record<string, unknown>;
    expect(parsed['words']).toEqual(['EventSourcing', 'AggregateRoot']);
  });

  it('uses en-GB locale in .typos.toml when language is en-GB', async () => {
    const pack = createPack('rust', 'Rust', [SPELL_GATE_TYPOS]);
    const fs = new InMemoryFilesystem();
    const runner = new InMemoryProcessRunner();
    const config = createConfig(['rust'], [], { enabled: true, language: 'en-GB', words: [] });

    await init(makeCommand({ packs: [pack], config }), fs, runner, makeResolver());

    const content = await fs.readFile('/target/.typos.toml');
    expect(content).toContain('locale = "en-gb"');
  });

  it('adds spell config paths to filesWritten', async () => {
    const pack = createPack('typescript', 'TypeScript', [SPELL_GATE_CSPELL]);
    const fs = new InMemoryFilesystem();
    const runner = new InMemoryProcessRunner();
    const config = createConfig(['typescript'], [], DEFAULT_SPELL_CONFIG);

    const result = await init(makeCommand({ packs: [pack], config }), fs, runner, makeResolver());

    expect(result.filesWritten).toContain('/target/cspell.json');
  });

  it('skips spell config file when existing file conflicts and resolver returns skip', async () => {
    const pack = createPack('typescript', 'TypeScript', [SPELL_GATE_CSPELL]);
    const fs = new InMemoryFilesystem();
    fs.seed('/target/cspell.json', '{}');
    const runner = new InMemoryProcessRunner();
    const config = createConfig(['typescript'], [], DEFAULT_SPELL_CONFIG);

    const result = await init(
      makeCommand({ packs: [pack], config }),
      fs,
      runner,
      makeResolver('skip'),
    );

    expect(result.filesWritten).not.toContain('/target/cspell.json');
    expect(await fs.readFile('/target/cspell.json')).toBe('{}');
  });

  it('does not write spell config when pack has no spell gate', async () => {
    const pack = createPack('typescript', 'TypeScript', [GATE]);
    const fs = new InMemoryFilesystem();
    const runner = new InMemoryProcessRunner();
    const config = createConfig(['typescript'], [], DEFAULT_SPELL_CONFIG);

    await init(makeCommand({ packs: [pack], config }), fs, runner, makeResolver());

    expect(await fs.exists('/target/cspell.json')).toBe(false);
  });

  it('writes cspell.json only once for two packs that both use cspell', async () => {
    const tsPack = createPack('typescript', 'TypeScript', [SPELL_GATE_CSPELL]);
    const jsPack = createPack('javascript', 'JavaScript', [SPELL_GATE_CSPELL]);
    const spy = makeSpyResolver();
    const fs = new InMemoryFilesystem();
    const runner = new InMemoryProcessRunner();
    const config = createConfig(['typescript', 'javascript'], [], DEFAULT_SPELL_CONFIG);

    const result = await init(makeCommand({ packs: [tsPack, jsPack], config }), fs, runner, spy);

    const spellFiles = result.filesWritten.filter((f) => f.endsWith('cspell.json'));
    expect(spellFiles).toHaveLength(1);
    expect(spy.calls).toHaveLength(0); // no conflict, file did not exist before
    const content = await fs.readFile('/target/cspell.json');
    expect((JSON.parse(content) as Record<string, unknown>)['version']).toBe('0.2');
  });

  it('writes both cspell.json and .typos.toml for a polyglot repo with mixed spell tools', async () => {
    const tsPack = createPack('typescript', 'TypeScript', [SPELL_GATE_CSPELL]);
    const rustPack = createPack('rust', 'Rust', [SPELL_GATE_TYPOS]);
    const fs = new InMemoryFilesystem();
    const runner = new InMemoryProcessRunner();
    const config = createConfig(['typescript', 'rust'], [], DEFAULT_SPELL_CONFIG);

    const result = await init(
      makeCommand({ packs: [tsPack, rustPack], config }),
      fs,
      runner,
      makeResolver(),
    );

    expect(await fs.exists('/target/cspell.json')).toBe(true);
    expect(await fs.exists('/target/.typos.toml')).toBe(true);
    expect(result.filesWritten).toContain('/target/cspell.json');
    expect(result.filesWritten).toContain('/target/.typos.toml');
  });
});
