import type { Pack } from '../../domain/pack/pack.js';
import type { NoslopConfig } from '../../domain/config/noslop-config.js';
import type { IFilesystem } from '../ports/filesystem.js';
import type { IProcessRunner } from '../ports/process-runner.js';
import type { IConflictResolver } from '../ports/conflict-resolver.js';

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

function isGateInfrastructure(destPath: string): boolean {
  return (
    destPath.includes('/.githooks/') ||
    destPath.includes('/scripts/') ||
    destPath.includes('/.github/') ||
    destPath.includes('/.claude/')
  );
}

export async function init(
  command: InitCommand,
  fs: IFilesystem,
  runner: IProcessRunner,
  resolver: IConflictResolver,
): Promise<InitResult> {
  const filesWritten: string[] = [];

  for (const pack of command.packs) {
    const packTemplateDir = `${command.templatesDir}/packs/${pack.id}`;
    const exists = await fs.exists(packTemplateDir);
    if (!exists) continue;

    const written = await copyTemplateDir(packTemplateDir, command.targetDir, '', fs, resolver);
    filesWritten.push(...written);
  }

  const hooksDir = `${command.targetDir}/.githooks`;
  const hooksExist = await fs.exists(hooksDir);
  let hooksConfigured = false;

  if (hooksExist) {
    try {
      const result = await runner.run('git config core.hooksPath .githooks', command.targetDir);
      hooksConfigured = result.exitCode === 0;
    } catch {
      hooksConfigured = false;
    }
  }

  return { filesWritten, hooksConfigured };
}

async function copyTemplateDir(
  templateDir: string,
  targetDir: string,
  relativePrefix: string,
  fs: IFilesystem,
  resolver: IConflictResolver,
): Promise<string[]> {
  const written: string[] = [];
  const entries = await fs.readdir(templateDir);

  for (const entry of entries) {
    const srcPath = `${templateDir}/${entry}`;
    const relPath = relativePrefix ? `${relativePrefix}/${entry}` : entry;
    const destPath = `${targetDir}/${relPath}`;

    const isDir = await fs.isDirectory(srcPath);
    if (isDir) {
      await fs.mkdir(destPath, { recursive: true });
      const subWritten = await copyTemplateDir(srcPath, targetDir, relPath, fs, resolver);
      written.push(...subWritten);
    } else {
      const lastSlash = destPath.lastIndexOf('/');
      if (lastSlash > 0) {
        await fs.mkdir(destPath.slice(0, lastSlash), { recursive: true });
      }

      if (!isGateInfrastructure(destPath) && (await fs.exists(destPath))) {
        const resolution = await resolver.resolve(destPath);
        if (resolution === 'skip') continue;
      }

      await fs.copyFile(srcPath, destPath);
      const isExecutable =
        destPath.includes('/.githooks/') ||
        destPath.includes('/scripts/') ||
        destPath.includes('/.claude/hooks/');
      await fs.chmod(destPath, isExecutable ? 0o755 : 0o644);
      written.push(destPath);
    }
  }

  return written;
}
