import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { promises as fsp } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { NodeFilesystem, resolveTemplatesDir } from './node-filesystem.js';

let tmpDir: string;

beforeEach(async () => {
  tmpDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'noslop-node-fs-test-'));
});

afterEach(async () => {
  await fsp.rm(tmpDir, { recursive: true, force: true });
});

describe('NodeFilesystem', () => {
  it('exists returns false for a path that does not exist', async () => {
    const fs = new NodeFilesystem();
    expect(await fs.exists(path.join(tmpDir, 'nonexistent.txt'))).toBe(false);
  });

  it('exists returns true for a written file', async () => {
    const fs = new NodeFilesystem();
    const filePath = path.join(tmpDir, 'test.txt');
    await fsp.writeFile(filePath, 'hello');
    expect(await fs.exists(filePath)).toBe(true);
  });

  it('writeFile and readFile round-trip', async () => {
    const fs = new NodeFilesystem();
    const filePath = path.join(tmpDir, 'round-trip.txt');
    await fs.writeFile(filePath, 'round trip content');
    expect(await fs.readFile(filePath)).toBe('round trip content');
  });

  it('readFile throws for missing file', async () => {
    const fs = new NodeFilesystem();
    await expect(fs.readFile(path.join(tmpDir, 'missing.txt'))).rejects.toThrow();
  });

  it('mkdir creates a directory', async () => {
    const fs = new NodeFilesystem();
    const dirPath = path.join(tmpDir, 'newdir');
    await fs.mkdir(dirPath);
    expect(await fs.exists(dirPath)).toBe(true);
    expect(await fs.isDirectory(dirPath)).toBe(true);
  });

  it('mkdir with recursive creates nested directories', async () => {
    const fs = new NodeFilesystem();
    const dirPath = path.join(tmpDir, 'a', 'b', 'c');
    await fs.mkdir(dirPath, { recursive: true });
    expect(await fs.isDirectory(dirPath)).toBe(true);
  });

  it('copyFile copies content to destination', async () => {
    const fs = new NodeFilesystem();
    const srcPath = path.join(tmpDir, 'src.txt');
    const destPath = path.join(tmpDir, 'dest.txt');
    await fsp.writeFile(srcPath, 'copy me');
    await fs.copyFile(srcPath, destPath);
    expect(await fsp.readFile(destPath, 'utf8')).toBe('copy me');
  });

  it('readdir returns directory entries', async () => {
    const fs = new NodeFilesystem();
    await fsp.writeFile(path.join(tmpDir, 'a.txt'), '');
    await fsp.writeFile(path.join(tmpDir, 'b.txt'), '');
    const entries = await fs.readdir(tmpDir);
    expect(entries).toContain('a.txt');
    expect(entries).toContain('b.txt');
  });

  it('isDirectory returns true for a directory', async () => {
    const fs = new NodeFilesystem();
    expect(await fs.isDirectory(tmpDir)).toBe(true);
  });

  it('isDirectory returns false for a file', async () => {
    const fs = new NodeFilesystem();
    const filePath = path.join(tmpDir, 'file.txt');
    await fsp.writeFile(filePath, 'x');
    expect(await fs.isDirectory(filePath)).toBe(false);
  });

  it('isDirectory returns false for a non-existent path', async () => {
    const fs = new NodeFilesystem();
    expect(await fs.isDirectory(path.join(tmpDir, 'ghost'))).toBe(false);
  });

  it('chmod does not throw on a valid file', async () => {
    const fs = new NodeFilesystem();
    const filePath = path.join(tmpDir, 'script.sh');
    await fsp.writeFile(filePath, '#!/bin/sh');
    await expect(fs.chmod(filePath, 0o755)).resolves.toBeUndefined();
  });
});

describe('resolveTemplatesDir', () => {
  it('returns an existing path', async () => {
    const templatesDir = resolveTemplatesDir();
    const stat = await fsp.stat(templatesDir);
    expect(stat.isDirectory()).toBe(true);
  });

  it('contains a packs subdirectory', async () => {
    const templatesDir = resolveTemplatesDir();
    const packsDir = path.join(templatesDir, 'packs');
    const stat = await fsp.stat(packsDir);
    expect(stat.isDirectory()).toBe(true);
  });
});
