import { describe, expect, it } from 'vitest';
import { resolvePacks } from './resolve-packs.js';
import { InMemoryFilesystem } from '../infrastructure/adapters/in-memory-filesystem.js';
import { TYPESCRIPT_PACK } from '../domain/packs/typescript/typescript.js';
import { RUST_PACK } from '../domain/packs/rust/rust.js';

describe('resolvePacks', () => {
  it('uses CLI pack ids when provided', async () => {
    const fs = new InMemoryFilesystem();
    const packs = await resolvePacks(['rust'], null, '/project', fs);
    expect(packs).toEqual([RUST_PACK]);
  });

  it('uses project config packs when no CLI packs and config exists', async () => {
    const fs = new InMemoryFilesystem();
    const config = { packs: ['typescript'] };
    const packs = await resolvePacks([], config, '/project', fs);
    expect(packs).toEqual([TYPESCRIPT_PACK]);
  });

  it('falls back to auto-detection when no CLI packs and no config packs', async () => {
    const fs = new InMemoryFilesystem();
    fs.seed('/project/Cargo.toml', '');
    const packs = await resolvePacks([], null, '/project', fs);
    expect(packs).toContain(RUST_PACK);
  });

  it('CLI packs take precedence over project config', async () => {
    const fs = new InMemoryFilesystem();
    const config = { packs: ['typescript'] };
    const packs = await resolvePacks(['rust'], config, '/project', fs);
    expect(packs).toEqual([RUST_PACK]);
  });
});
