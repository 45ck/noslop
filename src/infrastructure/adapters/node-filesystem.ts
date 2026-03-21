import { constants, promises as fsp } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { IFilesystem } from '../../application/ports/filesystem.js';

export class NodeFilesystem implements IFilesystem {
  async exists(filePath: string): Promise<boolean> {
    try {
      await fsp.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async readFile(filePath: string): Promise<string> {
    return fsp.readFile(filePath, 'utf8');
  }

  async writeFile(filePath: string, content: string): Promise<void> {
    await fsp.writeFile(filePath, content, 'utf8');
  }

  async mkdir(filePath: string, options?: { recursive?: boolean }): Promise<void> {
    await fsp.mkdir(filePath, options);
  }

  async copyFile(src: string, dest: string): Promise<void> {
    await fsp.copyFile(src, dest);
  }

  async readdir(filePath: string): Promise<string[]> {
    return fsp.readdir(filePath);
  }

  async isDirectory(filePath: string): Promise<boolean> {
    try {
      const stat = await fsp.stat(filePath);
      return stat.isDirectory();
    } catch {
      return false;
    }
  }

  async chmod(filePath: string, mode: number): Promise<void> {
    await fsp.chmod(filePath, mode);
  }

  async isExecutable(filePath: string): Promise<boolean> {
    if (process.platform === 'win32') return true;
    try {
      await fsp.access(filePath, constants.X_OK);
      return true;
    } catch {
      return false;
    }
  }
}

export function resolveTemplatesDir(): string {
  const currentDir = path.dirname(fileURLToPath(import.meta.url));
  return path.resolve(currentDir, '..', '..', '..', 'templates');
}
