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
  const filesRemoved: string[] = [];
  const dirsRemoved: string[] = [];

  for (const file of INFRASTRUCTURE_FILES) {
    const fullPath = `${command.targetDir}/${file}`;
    if (await fs.exists(fullPath)) {
      await fs.rm(fullPath);
      filesRemoved.push(file);
    }
  }

  for (const script of SCRIPT_NAMES) {
    const fullPath = `${command.targetDir}/${script}`;
    if (await fs.exists(fullPath)) {
      await fs.rm(fullPath);
      filesRemoved.push(script);
    }
  }

  for (const dir of INFRASTRUCTURE_DIRS) {
    const fullPath = `${command.targetDir}/${dir}`;
    if (await fs.exists(fullPath)) {
      await fs.rmdir(fullPath, { recursive: true });
      dirsRemoved.push(dir);
    }
  }

  for (const parent of CLEANABLE_PARENTS) {
    const fullPath = `${command.targetDir}/${parent}`;
    if (await fs.exists(fullPath)) {
      try {
        const entries = await fs.readdir(fullPath);
        if (entries.length === 0) {
          await fs.rmdir(fullPath);
          dirsRemoved.push(parent);
        }
      } catch {
        // directory may not exist or may not be readable — skip
      }
    }
  }

  let hooksReset = false;
  try {
    const result = await runner.run('git config --unset core.hooksPath', command.targetDir);
    hooksReset = result.exitCode === 0;
  } catch {
    hooksReset = false;
  }

  return { filesRemoved, dirsRemoved, hooksReset };
}
