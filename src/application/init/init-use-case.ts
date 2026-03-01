import type { Pack } from '../../domain/pack/pack.js';
import type { NoslopConfig } from '../../domain/config/noslop-config.js';
import type { IFilesystem } from '../ports/filesystem.js';
import type { IProcessRunner } from '../ports/process-runner.js';

export type InitCommand = Readonly<{
  targetDir: string;
  templatesDir: string;
  packs: readonly Pack[];
  config: NoslopConfig;
}>;

export type InitResult = Readonly<{
  filesWritten: readonly string[];
  hooksConfigured: boolean;
}>;

export async function init(
  command: InitCommand,
  fs: IFilesystem,
  runner: IProcessRunner,
): Promise<InitResult> {
  const filesWritten: string[] = [];

  for (const pack of command.packs) {
    const packTemplateDir = `${command.templatesDir}/packs/${pack.id}`;
    const exists = await fs.exists(packTemplateDir);
    if (!exists) continue;

    const written = await copyTemplateDir(packTemplateDir, command.targetDir, packTemplateDir, fs);
    filesWritten.push(...written);
  }

  const hooksDir = `${command.targetDir}/.githooks`;
  const hooksExist = await fs.exists(hooksDir);
  let hooksConfigured = false;

  if (hooksExist) {
    const result = await runner.run('git config core.hooksPath .githooks', command.targetDir);
    hooksConfigured = result.exitCode === 0;
  }

  return { filesWritten, hooksConfigured };
}

async function copyTemplateDir(
  templateDir: string,
  targetDir: string,
  baseDir: string,
  fs: IFilesystem,
): Promise<string[]> {
  const written: string[] = [];
  const entries = await fs.readdir(templateDir);

  for (const entry of entries) {
    const srcPath = `${templateDir}/${entry}`;
    const relativePath = srcPath.replace(`${baseDir}/`, '');
    const destPath = `${targetDir}/${relativePath}`;

    const isDir = await fs.isDirectory(srcPath);
    if (isDir) {
      await fs.mkdir(destPath, { recursive: true });
      const subWritten = await copyTemplateDir(srcPath, targetDir, baseDir, fs);
      written.push(...subWritten);
    } else {
      const destDirPath = destPath.slice(0, destPath.lastIndexOf('/'));
      await fs.mkdir(destDirPath, { recursive: true });
      await fs.copyFile(srcPath, destPath);
      written.push(destPath);
    }
  }

  return written;
}
