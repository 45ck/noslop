import { describe, expect, it } from 'vitest';
import { InMemoryFilesystem } from './in-memory-filesystem.js';

describe('InMemoryFilesystem', () => {
  it('returns false for exists on unknown path', async () => {
    const fs = new InMemoryFilesystem();
    expect(await fs.exists('/unknown')).toBe(false);
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

  it('readdir throws for non-existent path', async () => {
    const fs = new InMemoryFilesystem();
    await expect(fs.readdir('/nonexistent')).rejects.toThrow('Directory not found: /nonexistent');
  });
});
