import { describe, expect, it } from 'vitest';
import { init } from './init-use-case.js';
import type { InitCommand } from './init-use-case.js';
import type { IConflictResolver, ConflictResolution } from '../ports/conflict-resolver.js';
import { createPack } from '../../domain/pack/pack.js';
import { createGate } from '../../domain/gate/gate.js';
import { createConfig, DEFAULT_SPELL_CONFIG } from '../../domain/config/noslop-config.js';
import { InMemoryFilesystem } from '../../infrastructure/adapters/in-memory-filesystem.js';
import { InMemoryProcessRunner } from '../../infrastructure/adapters/in-memory-process-runner.js';

const SPELL_GATE_CSPELL = createGate('spell', 'cspell --no-progress "src/**/*"', 'fast');
const SPELL_GATE_TYPOS = createGate('spell', 'typos', 'fast');
const TYPESCRIPT_SPELL_PACK = createPack('typescript', 'TypeScript', [SPELL_GATE_CSPELL]);
const RUST_SPELL_PACK = createPack('rust', 'Rust', [SPELL_GATE_TYPOS]);

function makeResolver(resolution: ConflictResolution = 'overwrite'): IConflictResolver {
  return { resolve: async () => resolution };
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

describe('init use case spell config generation', () => {
  it('writes cspell.json when a pack uses cspell', async () => {
    const fs = new InMemoryFilesystem();
    const runner = new InMemoryProcessRunner();
    const config = createConfig(['typescript'], [], DEFAULT_SPELL_CONFIG);

    await init(makeCommand({ packs: [TYPESCRIPT_SPELL_PACK], config }), fs, runner, makeResolver());

    const parsed = JSON.parse(await fs.readFile('/target/cspell.json')) as Record<string, unknown>;
    expect(parsed['version']).toBe('0.2');
    expect(parsed['language']).toBe('en');
    expect(parsed['$schema']).toBeDefined();
    expect(parsed['words']).toEqual([]);
    expect(Array.isArray(parsed['ignorePaths'])).toBe(true);
  });

  it('writes .typos.toml when a pack uses typos', async () => {
    const fs = new InMemoryFilesystem();
    const runner = new InMemoryProcessRunner();
    const config = createConfig(['rust'], [], DEFAULT_SPELL_CONFIG);

    await init(makeCommand({ packs: [RUST_SPELL_PACK], config }), fs, runner, makeResolver());
    const content = await fs.readFile('/target/.typos.toml');
    expect(content).toContain('locale = "en-us"');
    expect(content).toContain('[default.extend-words]');
  });

  it('does not write spell config files when spell is disabled or the pack has no spell gate', async () => {
    const disabledFs = new InMemoryFilesystem();
    const noGateFs = new InMemoryFilesystem();
    const runner = new InMemoryProcessRunner();

    await init(
      makeCommand({
        packs: [TYPESCRIPT_SPELL_PACK],
        config: createConfig(['typescript'], [], { enabled: false, language: 'en', words: [] }),
      }),
      disabledFs,
      runner,
      makeResolver(),
    );
    await init(
      makeCommand({
        packs: [createPack('typescript', 'TypeScript', [createGate('lint', 'eslint .', 'fast')])],
        config: createConfig(['typescript'], [], DEFAULT_SPELL_CONFIG),
      }),
      noGateFs,
      runner,
      makeResolver(),
    );

    expect(await disabledFs.exists('/target/cspell.json')).toBe(false);
    expect(await disabledFs.exists('/target/.typos.toml')).toBe(false);
    expect(await noGateFs.exists('/target/cspell.json')).toBe(false);
  });
});

describe('init use case spell locale and content handling', () => {
  it('includes custom cspell words', async () => {
    const fs = new InMemoryFilesystem();
    const runner = new InMemoryProcessRunner();
    const config = createConfig(['typescript'], [], {
      enabled: true,
      language: 'en',
      words: ['EventSourcing', 'AggregateRoot'],
    });

    await init(makeCommand({ packs: [TYPESCRIPT_SPELL_PACK], config }), fs, runner, makeResolver());
    const parsed = JSON.parse(await fs.readFile('/target/cspell.json')) as Record<string, unknown>;
    expect(parsed['words']).toEqual(['EventSourcing', 'AggregateRoot']);
  });

  it('maps en-US and en-GB locales for typos and preserves other locales', async () => {
    const runner = new InMemoryProcessRunner();
    const usFs = new InMemoryFilesystem();
    const gbFs = new InMemoryFilesystem();
    const frFs = new InMemoryFilesystem();

    await init(
      makeCommand({
        packs: [RUST_SPELL_PACK],
        config: createConfig(['rust'], [], { enabled: true, language: 'en-US', words: [] }),
      }),
      usFs,
      runner,
      makeResolver(),
    );
    await init(
      makeCommand({
        packs: [RUST_SPELL_PACK],
        config: createConfig(['rust'], [], { enabled: true, language: 'en-GB', words: [] }),
      }),
      gbFs,
      runner,
      makeResolver(),
    );
    await init(
      makeCommand({
        packs: [RUST_SPELL_PACK],
        config: createConfig(['rust'], [], { enabled: true, language: 'fr', words: [] }),
      }),
      frFs,
      runner,
      makeResolver(),
    );

    expect(await fsContains(usFs, '/target/.typos.toml', 'locale = "en-us"')).toBe(true);
    expect(await fsContains(gbFs, '/target/.typos.toml', 'locale = "en-gb"')).toBe(true);
    expect(await fsContains(frFs, '/target/.typos.toml', 'locale = "fr"')).toBe(true);
  });
});

describe('init use case spell mixed tool behavior', () => {
  it('writes cspell.json only once for multiple cspell packs and writes both files for mixed spell tools', async () => {
    const jsPack = createPack('javascript', 'JavaScript', [SPELL_GATE_CSPELL]);
    const cspellFs = new InMemoryFilesystem();
    const mixedFs = new InMemoryFilesystem();
    const runner = new InMemoryProcessRunner();

    const cspellResult = await init(
      makeCommand({
        packs: [TYPESCRIPT_SPELL_PACK, jsPack],
        config: createConfig(['typescript', 'javascript'], [], DEFAULT_SPELL_CONFIG),
      }),
      cspellFs,
      runner,
      makeResolver(),
    );
    const mixedResult = await init(
      makeCommand({
        packs: [TYPESCRIPT_SPELL_PACK, RUST_SPELL_PACK],
        config: createConfig(['typescript', 'rust'], [], DEFAULT_SPELL_CONFIG),
      }),
      mixedFs,
      runner,
      makeResolver(),
    );

    expect(cspellResult.filesWritten.filter((file) => file.endsWith('cspell.json'))).toHaveLength(
      1,
    );
    expect(await mixedFs.exists('/target/cspell.json')).toBe(true);
    expect(await mixedFs.exists('/target/.typos.toml')).toBe(true);
    expect(mixedResult.filesWritten).toContain('/target/cspell.json');
    expect(mixedResult.filesWritten).toContain('/target/.typos.toml');
  });
});

describe('init use case spell conflicts and formatting', () => {
  it('adds spell config files to filesWritten and honors conflict resolution', async () => {
    const runner = new InMemoryProcessRunner();
    const freshFs = new InMemoryFilesystem();
    const skipFs = new InMemoryFilesystem();
    const overwriteFs = new InMemoryFilesystem();
    skipFs.seed('/target/cspell.json', '{}');
    overwriteFs.seed('/target/cspell.json', '{}');
    const config = createConfig(['typescript'], [], DEFAULT_SPELL_CONFIG);

    const fresh = await init(
      makeCommand({ packs: [TYPESCRIPT_SPELL_PACK], config }),
      freshFs,
      runner,
      makeResolver(),
    );
    const skipped = await init(
      makeCommand({ packs: [TYPESCRIPT_SPELL_PACK], config }),
      skipFs,
      runner,
      makeResolver('skip'),
    );
    const overwritten = await init(
      makeCommand({ packs: [TYPESCRIPT_SPELL_PACK], config }),
      overwriteFs,
      runner,
      makeResolver('overwrite'),
    );

    expect(fresh.filesWritten).toContain('/target/cspell.json');
    expect(skipped.filesWritten).not.toContain('/target/cspell.json');
    expect(await skipFs.readFile('/target/cspell.json')).toBe('{}');
    expect(overwritten.filesWritten).toContain('/target/cspell.json');
    expect(
      (JSON.parse(await overwriteFs.readFile('/target/cspell.json')) as Record<string, unknown>)[
        'version'
      ],
    ).toBe('0.2');
  });

  it('writes prettier-formatted cspell.json content', async () => {
    const fs = new InMemoryFilesystem();
    const runner = new InMemoryProcessRunner();
    const config = createConfig(['typescript'], [], DEFAULT_SPELL_CONFIG);

    await init(makeCommand({ packs: [TYPESCRIPT_SPELL_PACK], config }), fs, runner, makeResolver());
    const content = await fs.readFile('/target/cspell.json');
    const prettier = await import('prettier');
    expect(content).toBe(await prettier.format(content, { parser: 'json' }));
  });
});

async function fsContains(fs: InMemoryFilesystem, path: string, value: string): Promise<boolean> {
  return (await fs.readFile(path)).includes(value);
}
