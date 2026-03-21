import { describe, expect, it } from 'vitest';
import { InMemoryFilesystem } from './in-memory-filesystem.js';
import { DryRunFilesystem } from './dry-run-filesystem.js';

describe('DryRunFilesystem', () => {
  function setup() {
    const inner = new InMemoryFilesystem();
    inner.seed('/project/README.md', '# Hello');
    inner.seed('/templates/packs/rust/clippy.toml', 'deny = []');
    const dryFs = new DryRunFilesystem(inner);
    return { inner, dryFs };
  }

  it('delegates exists() to the underlying filesystem', async () => {
    const { dryFs } = setup();
    expect(await dryFs.exists('/project/README.md')).toBe(true);
    expect(await dryFs.exists('/project/missing.txt')).toBe(false);
  });

  it('delegates readFile() to the underlying filesystem', async () => {
    const { dryFs } = setup();
    expect(await dryFs.readFile('/project/README.md')).toBe('# Hello');
  });

  it('delegates readdir() to the underlying filesystem', async () => {
    const { dryFs } = setup();
    const entries = await dryFs.readdir('/project');
    expect(entries).toContain('README.md');
  });

  it('delegates isDirectory() to the underlying filesystem', async () => {
    const { dryFs } = setup();
    expect(await dryFs.isDirectory('/project')).toBe(true);
    expect(await dryFs.isDirectory('/project/README.md')).toBe(false);
  });

  it('records writeFile() without delegating', async () => {
    const { inner, dryFs } = setup();
    await dryFs.writeFile('/project/new.txt', 'content');
    expect(dryFs.writes).toEqual([{ type: 'writeFile', path: '/project/new.txt' }]);
    expect(await inner.exists('/project/new.txt')).toBe(false);
  });

  it('records copyFile() without delegating', async () => {
    const { inner, dryFs } = setup();
    await dryFs.copyFile('/templates/packs/rust/clippy.toml', '/project/clippy.toml');
    expect(dryFs.writes).toEqual([{ type: 'copyFile', path: '/project/clippy.toml' }]);
    expect(await inner.exists('/project/clippy.toml')).toBe(false);
  });

  it('records mkdir() without delegating', async () => {
    const { inner, dryFs } = setup();
    await dryFs.mkdir('/project/src', { recursive: true });
    expect(dryFs.writes).toEqual([{ type: 'mkdir', path: '/project/src' }]);
    expect(await inner.exists('/project/src')).toBe(false);
  });

  it('records chmod() without delegating', async () => {
    const { dryFs } = setup();
    await dryFs.chmod('/project/README.md', 0o755);
    expect(dryFs.writes).toEqual([{ type: 'chmod', path: '/project/README.md' }]);
  });

  it('writtenPaths returns only writeFile and copyFile paths', async () => {
    const { dryFs } = setup();
    await dryFs.mkdir('/project/src');
    await dryFs.writeFile('/project/src/main.rs', 'fn main() {}');
    await dryFs.copyFile('/templates/packs/rust/clippy.toml', '/project/clippy.toml');
    await dryFs.chmod('/project/src/main.rs', 0o644);

    expect(dryFs.writtenPaths).toEqual(['/project/src/main.rs', '/project/clippy.toml']);
  });

  it('starts with empty writes', () => {
    const { dryFs } = setup();
    expect(dryFs.writes).toEqual([]);
    expect(dryFs.writtenPaths).toEqual([]);
  });
});
