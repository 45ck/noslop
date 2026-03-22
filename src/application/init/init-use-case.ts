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
  targetDir: string,
  spell: SpellConfig,
  fs: IFilesystem,
  resolver: IConflictResolver,
): Promise<string | null> {
  const filePath = `${targetDir}/${fileName}`;
  const content = fileName === 'cspell.json' ? buildCspellJson(spell) : buildTyposToml(spell);

  if (await fs.exists(filePath)) {
    const resolution = await resolver.resolve(filePath);
    if (resolution === 'skip') return null;
  }

  await fs.writeFile(filePath, content);
  await fs.chmod(filePath, 0o644);
  return filePath;
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

  if (command.config.spell.enabled) {
    const handledSpellFiles = new Set<string>();
    for (const pack of command.packs) {
      const fileName = spellConfigFileName(pack);
      if (!fileName || handledSpellFiles.has(fileName)) continue;
      handledSpellFiles.add(fileName);
      const written = await writeSpellConfigForPack(
        fileName,
        command.targetDir,
        command.config.spell,
        fs,
        resolver,
      );
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
  targetDir: string,
  relativePrefix: string,
  fs: IFilesystem,
  resolver: IConflictResolver,
): Promise<string[]> {
  const written: string[] = [];
  const entries = await fs.readdir(templateDir);
  const normalizedTarget = toForwardSlash(targetDir);

  for (const entry of entries) {
    const srcPath = `${templateDir}/${entry}`;
    const relPath = relativePrefix ? `${relativePrefix}/${entry}` : entry;

    if (toForwardSlash(relPath).includes('..')) continue;

    const destPath = `${targetDir}/${relPath}`;

    if (!toForwardSlash(destPath).startsWith(normalizedTarget)) continue;

    const isDir = await fs.isDirectory(srcPath);
    if (isDir) {
      await fs.mkdir(destPath, { recursive: true });
      const subWritten = await copyTemplateDir(srcPath, targetDir, relPath, fs, resolver);
      written.push(...subWritten);
    } else {
      const normalized = toForwardSlash(destPath);
      const lastSlash = normalized.lastIndexOf('/');
      if (lastSlash > 0) {
        await fs.mkdir(destPath.slice(0, lastSlash), { recursive: true });
      }

      if (!isGateInfrastructure(destPath) && (await fs.exists(destPath))) {
        const resolution = await resolver.resolve(destPath);
        if (resolution === 'skip') continue;
      }

      await fs.copyFile(srcPath, destPath);
      const isExecutable =
        normalized.includes('/.githooks/') ||
        normalized.includes('/scripts/') ||
        normalized.includes('/.claude/hooks/');
      await fs.chmod(destPath, isExecutable ? 0o755 : 0o644);
      written.push(destPath);
    }
  }

  return written;
}
