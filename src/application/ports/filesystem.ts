export interface IFilesystem {
  exists(path: string): Promise<boolean>;
  readFile(path: string): Promise<string>;
  writeFile(path: string, content: string): Promise<void>;
  mkdir(path: string, options?: { recursive?: boolean }): Promise<void>;
  copyFile(src: string, dest: string): Promise<void>;
  readdir(path: string): Promise<string[]>;
  isDirectory(path: string): Promise<boolean>;
  chmod(path: string, mode: number): Promise<void>;
  isExecutable(path: string): Promise<boolean>;
}
