import { describe, expect, it } from 'vitest';
import { detectPacks } from './cli.js';
import { InMemoryFilesystem } from '../infrastructure/adapters/in-memory-filesystem.js';
import { TYPESCRIPT_PACK } from '../domain/packs/typescript.js';
import { RUST_PACK } from '../domain/packs/rust.js';
import { DOTNET_PACK } from '../domain/packs/dotnet.js';

describe('detectPacks', () => {
  it('detects TypeScript pack when tsconfig.json exists', async () => {
    const fs = new InMemoryFilesystem();
    fs.seed('/project/tsconfig.json', '{}');

    const packs = await detectPacks('/project', fs);

    expect(packs).toEqual([TYPESCRIPT_PACK]);
  });

  it('detects TypeScript pack when package.json exists', async () => {
    const fs = new InMemoryFilesystem();
    fs.seed('/project/package.json', '{}');

    const packs = await detectPacks('/project', fs);

    expect(packs).toEqual([TYPESCRIPT_PACK]);
  });

  it('detects Rust pack when Cargo.toml exists', async () => {
    const fs = new InMemoryFilesystem();
    fs.seed('/project/Cargo.toml', '');

    const packs = await detectPacks('/project', fs);

    expect(packs).toEqual([RUST_PACK]);
  });

  it('detects dotnet pack when root .csproj file exists', async () => {
    const fs = new InMemoryFilesystem();
    fs.seed('/project/MyApp.csproj', '');

    const packs = await detectPacks('/project', fs);

    expect(packs).toEqual([DOTNET_PACK]);
  });

  it('detects dotnet pack when global.json exists', async () => {
    const fs = new InMemoryFilesystem();
    fs.seed('/project/global.json', '{}');

    const packs = await detectPacks('/project', fs);

    expect(packs).toEqual([DOTNET_PACK]);
  });

  it('returns TypeScript pack as default fallback for empty directory', async () => {
    const fs = new InMemoryFilesystem();

    const packs = await detectPacks('/project', fs);

    expect(packs).toEqual([TYPESCRIPT_PACK]);
  });
});
