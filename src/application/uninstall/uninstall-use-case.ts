import {
  INFRASTRUCTURE_DIRS,
  INFRASTRUCTURE_FILES,
  SCRIPT_NAMES,
  CLEANABLE_PARENTS,
} from '../../domain/config/uninstall-manifest.js';
import type { IFilesystem } from '../ports/filesystem.js';
import type { IProcessRunner } from '../ports/process-runner.js';

export type UninstallCommand = Readonly<{
  targetDir: string;
}>;

export type UninstallResult = Readonly<{
  filesRemoved: readonly string[];
  dirsRemoved: readonly string[];
  hooksReset: boolean;
}>;

export async function uninstall(
  command: UninstallCommand,
  fs: IFilesystem,
  runner: IProcessRunner,
): Promise<UninstallResult> {
  const filesRemoved = [
    ...(await removeExistingPaths(command.targetDir, INFRASTRUCTURE_FILES, fs)),
    ...(await removeExistingPaths(command.targetDir, SCRIPT_NAMES, fs)),
  ];
  const dirsRemoved = [
    ...(await removeExistingDirectories(command.targetDir, INFRASTRUCTURE_DIRS, fs)),
    ...(await removeEmptyParents(command.targetDir, CLEANABLE_PARENTS, fs)),
  ];
  const hooksReset = await unsetHooksPath(command.targetDir, runner);

  return { filesRemoved, dirsRemoved, hooksReset };
}

async function removeExistingPaths(
  targetDir: string,
  paths: readonly string[],
  fs: IFilesystem,
): Promise<string[]> {
  const removed: string[] = [];
  for (const relativePath of paths) {
    const fullPath = `${targetDir}/${relativePath}`;
    if (!(await fs.exists(fullPath))) continue;
    await fs.rm(fullPath);
    removed.push(relativePath);
  }
  return removed;
}

async function removeExistingDirectories(
  targetDir: string,
  dirs: readonly string[],
  fs: IFilesystem,
): Promise<string[]> {
  const removed: string[] = [];
  for (const dir of dirs) {
    const fullPath = `${targetDir}/${dir}`;
    if (!(await fs.exists(fullPath))) continue;
    await fs.rmdir(fullPath, { recursive: true });
    removed.push(dir);
  }
  return removed;
}

async function removeEmptyParents(
  targetDir: string,
  parents: readonly string[],
  fs: IFilesystem,
): Promise<string[]> {
  const removed: string[] = [];
  for (const parent of parents) {
    if (await tryRemoveEmptyParent(targetDir, parent, fs)) {
      removed.push(parent);
    }
  }
  return removed;
}

async function tryRemoveEmptyParent(
  targetDir: string,
  parent: string,
  fs: IFilesystem,
): Promise<boolean> {
  const fullPath = `${targetDir}/${parent}`;
  if (!(await fs.exists(fullPath))) return false;

  try {
    const entries = await fs.readdir(fullPath);
    if (entries.length > 0) return false;
    await fs.rmdir(fullPath);
    return true;
  } catch {
    return false;
  }
}

async function unsetHooksPath(targetDir: string, runner: IProcessRunner): Promise<boolean> {
  try {
    const result = await runner.run('git config --unset core.hooksPath', targetDir);
    return result.exitCode === 0;
  } catch {
    return false;
  }
}
