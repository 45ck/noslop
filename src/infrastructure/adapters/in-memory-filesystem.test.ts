import { describe, expect, it } from 'vitest';
import { InMemoryFilesystem } from './in-memory-filesystem.js';

describe('InMemoryFilesystem', () => {
  it('returns false for exists on unknown path', async () => {
    const fs = new InMemoryFilesystem();
    expect(await fs.exists('/unknown')).toBe(false);
  });

  it('returns false for exists on a path that was never seeded or written', async () => {
    const fs = new InMemoryFilesystem();
    expect(await fs.exists('/never/written/file.txt')).toBe(false);
  });

  it('returns true for exists on seeded file', async () => {
    const fs = new InMemoryFilesystem();
    fs.seed('/a/b.txt', 'hello');
    expect(await fs.exists('/a/b.txt')).toBe(true);
  });

  it('reads a seeded file', async () => {
    const fs = new InMemoryFilesystem();
    fs.seed('/file.txt', 'content');
    expect(await fs.readFile('/file.txt')).toBe('content');
  });

  it('throws when reading a non-existent file', async () => {
    const fs = new InMemoryFilesystem();
    await expect(fs.readFile('/missing.txt')).rejects.toThrow('File not found: /missing.txt');
  });

  it('writes and reads back a file', async () => {
    const fs = new InMemoryFilesystem();
    await fs.writeFile('/out.txt', 'written');
    expect(await fs.readFile('/out.txt')).toBe('written');
  });

  it('mkdir marks path as directory', async () => {
    const fs = new InMemoryFilesystem();
    await fs.mkdir('/some/dir');
    expect(await fs.exists('/some/dir')).toBe(true);
  });

  it('copyFile copies seeded content to dest', async () => {
    const fs = new InMemoryFilesystem();
    fs.seed('/src/file.txt', 'data');
    await fs.copyFile('/src/file.txt', '/dest/file.txt');
    expect(await fs.readFile('/dest/file.txt')).toBe('data');
  });

  it('copyFile copies content exactly — dest content matches src content byte-for-byte', async () => {
    const fs = new InMemoryFilesystem();
    const content = '#!/bin/sh\nnoslop check\nexit $?\n';
    fs.seed('/src/hook', content);
    await fs.copyFile('/src/hook', '/dest/hook');
    expect(await fs.readFile('/dest/hook')).toBe(content);
  });

  it('copyFile throws when source does not exist', async () => {
    const fs = new InMemoryFilesystem();
    await expect(fs.copyFile('/missing.txt', '/dest.txt')).rejects.toThrow(
      'Source file not found: /missing.txt',
    );
  });

  it('readdir returns file entries under path', async () => {
    const fs = new InMemoryFilesystem();
    fs.seed('/dir/a.txt', '');
    fs.seed('/dir/b.txt', '');
    const entries = await fs.readdir('/dir');
    expect(entries).toContain('a.txt');
    expect(entries).toContain('b.txt');
  });

  it('readdir returns only immediate children, not deeper descendants', async () => {
    const fs = new InMemoryFilesystem();
    fs.seed('/dir/child.txt', 'c');
    fs.seed('/dir/sub/grandchild.txt', 'g');
    const entries = await fs.readdir('/dir');
    expect(entries).toContain('child.txt');
    expect(entries).toContain('sub');
    expect(entries).not.toContain('grandchild.txt');
    expect(entries).toHaveLength(2);
  });

  it('readdir returns both a file child and a directory child at the same level', async () => {
    const fs = new InMemoryFilesystem();
    fs.seed('/base/file.txt', 'f');
    fs.seed('/base/subdir/nested.txt', 'n');
    const entries = await fs.readdir('/base');
    expect(entries).toContain('file.txt');
    expect(entries).toContain('subdir');
    expect(entries).toHaveLength(2);
  });

  it('readdir does not return entries from sibling directories', async () => {
    const fs = new InMemoryFilesystem();
    fs.seed('/a/file1.txt', '1');
    fs.seed('/b/file2.txt', '2');
    const entries = await fs.readdir('/a');
    expect(entries).toEqual(['file1.txt']);
  });

  it('isDirectory returns false for a file', async () => {
    const fs = new InMemoryFilesystem();
    fs.seed('/dir/file.txt', 'x');
    expect(await fs.isDirectory('/dir/file.txt')).toBe(false);
  });

  it('isDirectory returns true for a path with children', async () => {
    const fs = new InMemoryFilesystem();
    fs.seed('/dir/child.txt', 'x');
    expect(await fs.isDirectory('/dir')).toBe(true);
  });

  it('isDirectory returns true for mkdir-created path', async () => {
    const fs = new InMemoryFilesystem();
    await fs.mkdir('/created');
    expect(await fs.isDirectory('/created')).toBe(true);
  });

  it('isDirectory returns true for a path that has file children but was never explicitly mkdir-d', async () => {
    const fs = new InMemoryFilesystem();
    fs.seed('/implicit/dir/file.txt', 'x');
    // '/implicit/dir' was never passed to mkdir but has a file child
    expect(await fs.isDirectory('/implicit/dir')).toBe(true);
  });

  it('isDirectory returns false for an unknown path with no children', async () => {
    const fs = new InMemoryFilesystem();
    expect(await fs.isDirectory('/ghost')).toBe(false);
  });

  it('readdir throws for non-existent path', async () => {
    const fs = new InMemoryFilesystem();
    await expect(fs.readdir('/nonexistent')).rejects.toThrow('Directory not found: /nonexistent');
  });

  it('exists returns false for a path that has never been seeded, written, or mkdir-d', async () => {
    const fs = new InMemoryFilesystem();
    const result = await fs.exists('/completely/unknown/path');
    expect(result).toBe(false);
  });

  it('chmod records calls with path and mode', async () => {
    const fs = new InMemoryFilesystem();
    fs.seed('/script.sh', '#!/bin/sh');
    await fs.chmod('/script.sh', 0o755);
    expect(fs.chmodCalls).toEqual([{ path: '/script.sh', mode: 0o755 }]);
  });

  it('chmod accumulates multiple calls in order', async () => {
    const fs = new InMemoryFilesystem();
    fs.seed('/a.sh', '');
    fs.seed('/b.sh', '');
    await fs.chmod('/a.sh', 0o755);
    await fs.chmod('/b.sh', 0o644);
    expect(fs.chmodCalls).toHaveLength(2);
    expect(fs.chmodCalls[0]).toEqual({ path: '/a.sh', mode: 0o755 });
    expect(fs.chmodCalls[1]).toEqual({ path: '/b.sh', mode: 0o644 });
  });
});
