import type { IFilesystem } from '../../application/ports/filesystem.js';

export type RecordedWrite = Readonly<{
  type: 'writeFile' | 'copyFile' | 'mkdir' | 'chmod' | 'rm' | 'rmdir';
  path: string;
}>;

export class DryRunFilesystem implements IFilesystem {
  private readonly delegate: IFilesystem;
  private readonly recorded: RecordedWrite[] = [];

  constructor(delegate: IFilesystem) {
    this.delegate = delegate;
  }

  get writes(): readonly RecordedWrite[] {
    return this.recorded;
  }

  get writtenPaths(): readonly string[] {
    return this.recorded
      .filter((w) => w.type === 'writeFile' || w.type === 'copyFile')
      .map((w) => w.path);
  }

  async exists(path: string): Promise<boolean> {
    return this.delegate.exists(path);
  }

  async readFile(path: string): Promise<string> {
    return this.delegate.readFile(path);
  }

  async readdir(path: string): Promise<string[]> {
    return this.delegate.readdir(path);
  }

  async isDirectory(path: string): Promise<boolean> {
    return this.delegate.isDirectory(path);
  }

  async writeFile(path: string, _content: string): Promise<void> {
    this.recorded.push({ type: 'writeFile', path });
  }

  async copyFile(_src: string, dest: string): Promise<void> {
    this.recorded.push({ type: 'copyFile', path: dest });
  }

  async mkdir(path: string, _options?: { recursive?: boolean }): Promise<void> {
    this.recorded.push({ type: 'mkdir', path });
  }

  async chmod(path: string, _mode: number): Promise<void> {
    this.recorded.push({ type: 'chmod', path });
  }

  async isExecutable(path: string): Promise<boolean> {
    return this.delegate.isExecutable(path);
  }

  async rm(path: string): Promise<void> {
    this.recorded.push({ type: 'rm', path });
  }

  async rmdir(path: string, _options?: { recursive?: boolean }): Promise<void> {
    this.recorded.push({ type: 'rmdir', path });
  }
}
