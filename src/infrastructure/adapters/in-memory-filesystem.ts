import type { IFilesystem } from '../../application/ports/filesystem.js';

export class InMemoryFilesystem implements IFilesystem {
  private readonly files = new Map<string, string>();
  private readonly dirs = new Set<string>();

  seed(path: string, content: string): void {
    this.files.set(path, content);
    this.ensureParentDirs(path);
  }

  async exists(path: string): Promise<boolean> {
    return this.files.has(path) || this.dirs.has(path);
  }

  async readFile(path: string): Promise<string> {
    const content = this.files.get(path);
    if (content === undefined) throw new Error(`File not found: ${path}`);
    return content;
  }

  async writeFile(path: string, content: string): Promise<void> {
    this.files.set(path, content);
    this.ensureParentDirs(path);
  }

  async mkdir(path: string, _options?: { recursive?: boolean }): Promise<void> {
    this.dirs.add(path);
  }

  async copyFile(src: string, dest: string): Promise<void> {
    const content = this.files.get(src);
    if (content === undefined) throw new Error(`Source file not found: ${src}`);
    await this.writeFile(dest, content);
  }

  async readdir(path: string): Promise<string[]> {
    const entries = new Set<string>();
    const prefix = path.endsWith('/') ? path : `${path}/`;

    for (const filePath of this.files.keys()) {
      if (filePath.startsWith(prefix)) {
        const rest = filePath.slice(prefix.length);
        const firstSegment = rest.split('/')[0];
        if (firstSegment !== undefined) entries.add(firstSegment);
      }
    }

    for (const dirPath of this.dirs) {
      if (dirPath.startsWith(prefix)) {
        const rest = dirPath.slice(prefix.length);
        if (!rest.includes('/')) entries.add(rest);
      }
    }

    return [...entries];
  }

  async isDirectory(path: string): Promise<boolean> {
    return this.dirs.has(path) || [...this.files.keys()].some((f) => f.startsWith(`${path}/`));
  }

  async chmod(_path: string, _mode: number): Promise<void> {
    // no-op: in-memory filesystem has no real permissions
  }

  private ensureParentDirs(path: string): void {
    const parts = path.split('/');
    for (let i = 1; i < parts.length - 1; i++) {
      this.dirs.add(parts.slice(0, i + 1).join('/'));
    }
  }
}
