import type { Pack } from '../../domain/pack/pack.js';
import type { NoslopConfig, SpellConfig } from '../../domain/config/noslop-config.js';
import { gateByLabel } from '../../domain/gate/gate.js';
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

type WriteSpellConfigContext = Readonly<{
  targetDir: string;
  spell: SpellConfig;
  fs: IFilesystem;
  resolver: IConflictResolver;
}>;

type CopyTemplateContext = Readonly<{
  targetDir: string;
  normalizedTarget: string;
  fs: IFilesystem;
  resolver: IConflictResolver;
}>;

type CopyTemplatePaths = Readonly<{
  srcPath: string;
  relPath: string;
  destPath: string;
  normalizedDestPath: string;
}>;

function toForwardSlash(p: string): string {
  return p.replaceAll('\\', '/');
}

function isGateInfrastructure(destPath: string): boolean {
  const normalized = toForwardSlash(destPath);
  return (
    normalized.includes('/.githooks/') ||
    normalized.includes('/scripts/') ||
    normalized.includes('/.github/') ||
    normalized.includes('/.claude/')
  );
}

function mapLocale(language: string): string {
  if (language === 'en' || language === 'en-US') return 'en-us';
  if (language === 'en-GB') return 'en-gb';
  return language;
}

function jsonArray(items: readonly string[]): string {
  return '[' + items.map((i) => JSON.stringify(i)).join(', ') + ']';
}

function buildCspellJson(spell: SpellConfig): string {
  const words = jsonArray(spell.words);
  const ignore = jsonArray(['node_modules/**', 'dist/**', 'build/**', '.git/**', '*.lock']);
  const schema =
    'https://raw.githubusercontent.com/streetsidesoftware/cspell/main/packages/cspell-types/cspell.schema.json';
  return `{
  "$schema": "${schema}",
  "version": "0.2",
  "language": "${spell.language}",
  "words": ${words},
  "ignorePaths": ${ignore}
}
`;
}

function buildTyposToml(spell: SpellConfig): string {
  const locale = mapLocale(spell.language);
  return `# typos configuration — https://github.com/crate-ci/typos
[default]
locale = "${locale}"

[default.extend-words]
# Add project-specific terms that typos should not flag as errors.
# Format: "wrong-spelling" = "correct-or-allowed-spelling"
# Example: "referer" = "referer"
`;
}

function spellConfigFileName(pack: Pack): string | null {
  const spellGate = gateByLabel(pack.gates, 'spell');
  if (!spellGate) return null;
  return spellGate.command.includes('cspell') ? 'cspell.json' : '.typos.toml';
}

async function writeSpellConfigForPack(
  fileName: string,
  context: WriteSpellConfigContext,
): Promise<string | null> {
  const filePath = `${context.targetDir}/${fileName}`;
  const content =
    fileName === 'cspell.json' ? buildCspellJson(context.spell) : buildTyposToml(context.spell);

  if (await context.fs.exists(filePath)) {
    const resolution = await context.resolver.resolve(filePath);
    if (resolution === 'skip') return null;
  }

  await context.fs.writeFile(filePath, content);
  await context.fs.chmod(filePath, 0o644);
  return filePath;
}

export async function init(
  command: InitCommand,
  fs: IFilesystem,
  runner: IProcessRunner,
  resolver: IConflictResolver,
): Promise<InitResult> {
  const filesWritten: string[] = [];
  const copyContext: CopyTemplateContext = {
    targetDir: command.targetDir,
    normalizedTarget: toForwardSlash(command.targetDir),
    fs,
    resolver,
  };

  for (const pack of command.packs) {
    const packTemplateDir = `${command.templatesDir}/packs/${pack.id}`;
    const exists = await fs.exists(packTemplateDir);
    if (!exists) continue;

    const written = await copyTemplateDir(packTemplateDir, '', copyContext);
    filesWritten.push(...written);
  }

  if (command.config.spell.enabled) {
    const handledSpellFiles = new Set<string>();
    for (const pack of command.packs) {
      const fileName = spellConfigFileName(pack);
      if (!fileName || handledSpellFiles.has(fileName)) continue;
      handledSpellFiles.add(fileName);
      const written = await writeSpellConfigForPack(fileName, {
        targetDir: command.targetDir,
        spell: command.config.spell,
        fs,
        resolver,
      });
      if (written) filesWritten.push(written);
    }
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
  relativePrefix: string,
  context: CopyTemplateContext,
): Promise<string[]> {
  const written: string[] = [];
  const entries = await context.fs.readdir(templateDir);

  for (const entry of entries) {
    const copied = await copyTemplateEntry(templateDir, relativePrefix, entry, context);
    written.push(...copied);
  }

  return written;
}

async function copyTemplateEntry(
  templateDir: string,
  relativePrefix: string,
  entry: string,
  context: CopyTemplateContext,
): Promise<string[]> {
  const paths = createCopyTemplatePaths(templateDir, relativePrefix, entry, context.targetDir);
  if (toForwardSlash(paths.relPath).includes('..')) return [];
  if (!paths.normalizedDestPath.startsWith(context.normalizedTarget)) return [];

  if (await context.fs.isDirectory(paths.srcPath)) {
    await context.fs.mkdir(paths.destPath, { recursive: true });
    return copyTemplateDir(paths.srcPath, paths.relPath, context);
  }

  await ensureDestinationParent(paths.destPath, context.fs);
  if (await shouldSkipExistingFile(paths.destPath, context)) return [];

  await context.fs.copyFile(paths.srcPath, paths.destPath);
  await context.fs.chmod(paths.destPath, getFileMode(paths.normalizedDestPath));
  return [paths.destPath];
}

function createCopyTemplatePaths(
  templateDir: string,
  relativePrefix: string,
  entry: string,
  targetDir: string,
): CopyTemplatePaths {
  const relPath = relativePrefix ? `${relativePrefix}/${entry}` : entry;
  const destPath = `${targetDir}/${relPath}`;
  return {
    srcPath: `${templateDir}/${entry}`,
    relPath,
    destPath,
    normalizedDestPath: toForwardSlash(destPath),
  };
}

async function ensureDestinationParent(destPath: string, fs: IFilesystem): Promise<void> {
  const normalized = toForwardSlash(destPath);
  const lastSlash = normalized.lastIndexOf('/');
  if (lastSlash > 0) {
    await fs.mkdir(destPath.slice(0, lastSlash), { recursive: true });
  }
}

async function shouldSkipExistingFile(
  destPath: string,
  context: CopyTemplateContext,
): Promise<boolean> {
  if (isGateInfrastructure(destPath)) return false;
  if (!(await context.fs.exists(destPath))) return false;
  return (await context.resolver.resolve(destPath)) === 'skip';
}

function getFileMode(normalizedDestPath: string): number {
  const isExecutable =
    normalizedDestPath.includes('/.githooks/') ||
    normalizedDestPath.includes('/scripts/') ||
    normalizedDestPath.includes('/.claude/hooks/');
  return isExecutable ? 0o755 : 0o644;
}
