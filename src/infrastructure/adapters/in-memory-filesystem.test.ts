import { describe, expect, it } from 'vitest';
import { InMemoryFilesystem } from './in-memory-filesystem.js';

describe('InMemoryFilesystem file operations', () => {
  it('tracks existence, reading, writing, and copying', async () => {
    const fs = new InMemoryFilesystem();
    expect(await fs.exists('/unknown')).toBe(false);

    fs.seed('/file.txt', 'content');
    expect(await fs.exists('/file.txt')).toBe(true);
    expect(await fs.readFile('/file.txt')).toBe('content');

    await fs.writeFile('/out.txt', 'written');
    expect(await fs.readFile('/out.txt')).toBe('written');

    await fs.copyFile('/file.txt', '/copy.txt');
    expect(await fs.readFile('/copy.txt')).toBe('content');
  });

  it('throws for missing file reads and missing copy sources', async () => {
    const fs = new InMemoryFilesystem();
    await expect(fs.readFile('/missing.txt')).rejects.toThrow('File not found: /missing.txt');
    await expect(fs.copyFile('/missing.txt', '/dest.txt')).rejects.toThrow(
      'Source file not found: /missing.txt',
    );
  });

  it('copies content exactly and rm removes files without failing on missing paths', async () => {
    const fs = new InMemoryFilesystem();
    const content = '#!/bin/sh\nnoslop check\nexit $?\n';
    fs.seed('/src/hook', content);

    await fs.copyFile('/src/hook', '/dest/hook');
    expect(await fs.readFile('/dest/hook')).toBe(content);

    await fs.rm('/dest/hook');
    expect(await fs.exists('/dest/hook')).toBe(false);
    await expect(fs.rm('/nonexistent.txt')).resolves.toBeUndefined();
  });
});

describe('InMemoryFilesystem directories', () => {
  it('mkdir and isDirectory recognize directories and file-backed parents', async () => {
    const fs = new InMemoryFilesystem();
    await fs.mkdir('/created');
    fs.seed('/implicit/dir/file.txt', 'x');

    expect(await fs.exists('/created')).toBe(true);
    expect(await fs.isDirectory('/created')).toBe(true);
    expect(await fs.isDirectory('/implicit/dir')).toBe(true);
    expect(await fs.isDirectory('/dir/file.txt')).toBe(false);
    expect(await fs.isDirectory('/ghost')).toBe(false);
  });

  it('readdir returns immediate children only and excludes sibling entries', async () => {
    const fs = new InMemoryFilesystem();
    fs.seed('/dir/child.txt', 'c');
    fs.seed('/dir/sub/grandchild.txt', 'g');
    fs.seed('/other/file.txt', 'x');
    await fs.mkdir('/dir/empty-sub');

    const entries = await fs.readdir('/dir');
    expect(entries).toContain('child.txt');
    expect(entries).toContain('sub');
    expect(entries).toContain('empty-sub');
    expect(entries).not.toContain('grandchild.txt');
    expect(entries).not.toContain('file.txt');
  });

  it('readdir throws for non-existent paths', async () => {
    const fs = new InMemoryFilesystem();
    await expect(fs.readdir('/nonexistent')).rejects.toThrow('Directory not found: /nonexistent');
  });
});

describe('InMemoryFilesystem chmod and recursive removal', () => {
  it('records chmod calls in order', async () => {
    const fs = new InMemoryFilesystem();
    fs.seed('/a.sh', '');
    fs.seed('/b.sh', '');

    await fs.chmod('/a.sh', 0o755);
    await fs.chmod('/b.sh', 0o644);

    expect(fs.chmodCalls).toEqual([
      { path: '/a.sh', mode: 0o755 },
      { path: '/b.sh', mode: 0o644 },
    ]);
  });

  it('removes empty and recursive directories without touching siblings', async () => {
    const fs = new InMemoryFilesystem();
    await fs.mkdir('/empty');
    fs.seed('/a/file.txt', 'a');
    fs.seed('/a/sub/nested.txt', 'n');
    fs.seed('/b/file.txt', 'b');

    await fs.rmdir('/empty');
    expect(await fs.exists('/empty')).toBe(false);

    await fs.rmdir('/a', { recursive: true });
    expect(await fs.exists('/a/file.txt')).toBe(false);
    expect(await fs.exists('/a/sub/nested.txt')).toBe(false);
    expect(await fs.exists('/b/file.txt')).toBe(true);
  });
});
