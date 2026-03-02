import * as p from '@clack/prompts';
import { ALL_PACKS, detectPacks } from './packs.js';
import { init } from '../application/init/init-use-case.js';
import {
  NodeFilesystem,
  NodeProcessRunner,
  resolveTemplatesDir,
  AlwaysOverwriteConflictResolver,
} from '../infrastructure/index.js';
import { createConfig, DEFAULT_PROTECTED_PATHS } from '../domain/config/noslop-config.js';

export async function runSetup(targetDir: string): Promise<void> {
  p.intro('noslop setup');

  const fs = new NodeFilesystem();
  const detected = await detectPacks(targetDir, fs);
  const detectedIds = new Set(detected.map((pack) => pack.id));

  const selected = await p.multiselect({
    message: 'Select language packs to install:',
    options: ALL_PACKS.map((pack) => ({
      value: pack.id,
      label: pack.name,
      ...(detectedIds.has(pack.id) ? { hint: 'detected' } : {}),
    })),
    initialValues: detected.map((pack) => pack.id),
  });
  if (p.isCancel(selected)) {
    p.cancel('Setup cancelled.');
    process.exit(0);
  }

  const packs = ALL_PACKS.filter((pack) => (selected as string[]).includes(pack.id));
  if (packs.length === 0) {
    p.cancel('No packs selected.');
    process.exit(0);
  }

  p.note(
    [
      '.githooks/   pre-commit · pre-push · commit-msg',
      '.github/     workflows/quality.yml · guardrails.yml',
      '.claude/     settings.json · hooks/pre-tool-use.sh',
      'scripts/     check · fmt · lint · test',
      'AGENTS.md',
    ].join('\n'),
    'Files to install',
  );

  const confirm = await p.confirm({ message: 'Install now?' });
  if (p.isCancel(confirm) || !confirm) {
    p.cancel('Setup cancelled.');
    process.exit(0);
  }

  const spinner = p.spinner();
  spinner.start('Installing...');

  const runner = new NodeProcessRunner();
  const config = createConfig(
    packs.map((pack) => pack.id),
    [...DEFAULT_PROTECTED_PATHS],
  );
  const resolver = new AlwaysOverwriteConflictResolver();
  const result = await init(
    { targetDir, templatesDir: resolveTemplatesDir(), packs, config },
    fs,
    runner,
    resolver,
  );

  spinner.stop(`Installed ${result.filesWritten.length} files`);

  if (result.hooksConfigured) {
    p.log.success('Git hooks configured (core.hooksPath = .githooks)');
  } else {
    p.log.warn('Hooks not configured — run inside a git repo');
  }

  p.outro('Done! Run: noslop doctor');
}
