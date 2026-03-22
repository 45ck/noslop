#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import * as p from '@clack/prompts';
import { init } from '../application/init/init-use-case.js';
import { loadProjectConfig } from '../application/config/load-project-config.js';
import type { IConflictResolver } from '../application/ports/conflict-resolver.js';
import {
  NodeFilesystem,
  NodeProcessRunner,
  resolveTemplatesDir,
  AlwaysOverwriteConflictResolver,
  AlwaysSkipConflictResolver,
} from '../infrastructure/index.js';
import {
  createConfig,
  DEFAULT_PROTECTED_PATHS,
  type NoslopConfig,
} from '../domain/config/noslop-config.js';
import type { Pack } from '../domain/pack/pack.js';
import { EXIT_CONFIG_ERROR } from '../domain/exit-code.js';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { resolvePacks } from './resolve-packs.js';
import { ALL_PACKS } from './packs.js';
import { runSetup } from './setup-command.js';
import { buildSpellConfig } from './spell-options.js';
import { runDryInit } from './dry-run.js';
import { runCheck } from './check-command.js';
import { runList } from './list-command.js';
import { runDoctor } from './doctor-command.js';
import { runUninstall } from './uninstall-command.js';

const require = createRequire(import.meta.url);
const { version } = require('../../package.json') as { version: string };

const program = new Command();

program.name('noslop').description('Agent-boundary quality gates for any repo').version(version);

program.option('-q, --quiet', 'suppress non-essential output');

program.addHelpText(
  'after',
  `
Exit codes:
  0   Success — command completed, all gates/checks passed
  1   Gate failure — one or more quality gates or doctor checks failed
  2   Config error — invalid pack, tier, or missing target directory`,
);

function makePromptResolver(): IConflictResolver {
  return {
    resolve: async (filePath: string) => {
      const answer = await p.confirm({ message: `${filePath} already exists. Overwrite?` });
      if (p.isCancel(answer) || !answer) return 'skip';
      return 'overwrite';
    },
  };
}

function validateDir(dir: string, command: string): void {
  if (!existsSync(dir)) {
    console.error(chalk.red(`${command}: directory does not exist: ${dir}`));
    process.exit(EXIT_CONFIG_ERROR);
  }
}

function isQuiet(): boolean {
  return Boolean(program.opts()['quiet']);
}

function log(msg: string): void {
  if (!isQuiet()) console.log(msg);
}

interface CommandContext {
  fs: NodeFilesystem;
  runner: NodeProcessRunner;
  targetDir: string;
  templatesDir: string;
  packs: Pack[];
  config: NoslopConfig;
}

async function resolveCommandContext(
  commandName: string,
  options: {
    dir: string;
    pack: string[];
    spell?: boolean;
    spellLanguage?: string;
    spellWords?: string;
  },
): Promise<CommandContext> {
  validateDir(options.dir, `noslop ${commandName}`);
  const fs = new NodeFilesystem();
  const runner = new NodeProcessRunner();
  const targetDir = options.dir;
  const templatesDir = resolveTemplatesDir();
  const projectConfig = await loadProjectConfig(targetDir, fs);
  const packs = await resolvePacks(options.pack, projectConfig, targetDir, fs);

  if (packs.length === 0) {
    const allIds = ALL_PACKS.map((p) => p.id).join(', ');
    console.error(chalk.red(`noslop ${commandName}: unknown pack(s): ${options.pack.join(', ')}`));
    console.error(chalk.dim(`Available packs: ${allIds}`));
    process.exit(EXIT_CONFIG_ERROR);
  }

  const spell =
    options.spell !== undefined
      ? buildSpellConfig(!options.spell, options.spellLanguage, options.spellWords)
      : undefined;
  const config = createConfig(
    packs.map((p) => p.id),
    [...DEFAULT_PROTECTED_PATHS],
    spell,
  );

  return { fs, runner, targetDir, templatesDir, packs, config };
}

program
  .command('init')
  .description('Detect language packs, drop templates, and wire git hooks')
  .option('-d, --dir <path>', 'target directory', process.cwd())
  .option(
    '--pack <id>',
    'force a specific pack by id; repeat for multiple packs (e.g. --pack typescript --pack python)',
    (val: string, prev: string[]) => [...prev, val],
    [] as string[],
  )
  .option('--no-spell', 'disable spell checking (skip spell config generation)')
  .option('--spell-language <loc>', 'locale code for spell checker (default: en)')
  .option('--spell-words <list>', 'comma-separated seed vocabulary words')
  .option('--dry-run', 'show what would be created without writing anything')
  .action(
    async (options: {
      dir: string;
      pack: string[];
      spell: boolean;
      spellLanguage?: string;
      spellWords?: string;
      dryRun?: boolean;
    }) => {
      const { fs, runner, targetDir, templatesDir, packs, config } = await resolveCommandContext(
        'init',
        options,
      );

      if (options.dryRun) {
        await runDryInit({ targetDir, templatesDir, packs, config }, fs);
        return;
      }

      log(chalk.cyan(`noslop init → ${targetDir}`));
      log(chalk.dim(`Packs: ${packs.map((p) => p.name).join(', ')}`));

      const resolver = makePromptResolver();
      const result = await init({ targetDir, templatesDir, packs, config }, fs, runner, resolver);

      for (const file of result.filesWritten) {
        log(chalk.green(`  ✓ ${file}`));
      }

      if (result.hooksConfigured) {
        log(chalk.green('  ✓ git core.hooksPath = .githooks'));
      } else {
        log(chalk.yellow('  ⚠ hooks not configured (not a git repo?)'));
      }

      log(chalk.bold('\nDone. Run noslop doctor to verify.'));
    },
  );

program
  .command('install')
  .description('Non-interactive / idempotent init (for CI and bootstrap scripts)')
  .option('-d, --dir <path>', 'target directory', process.cwd())
  .option(
    '--pack <id>',
    'force a specific pack by id; repeat for multiple packs (e.g. --pack typescript --pack python)',
    (val: string, prev: string[]) => [...prev, val],
    [] as string[],
  )
  .option('--no-spell', 'disable spell checking (skip spell config generation)')
  .option('--spell-language <loc>', 'locale code for spell checker (default: en)')
  .option('--spell-words <list>', 'comma-separated seed vocabulary words')
  .option('--dry-run', 'show what would be created without writing anything')
  .action(
    async (options: {
      dir: string;
      pack: string[];
      spell: boolean;
      spellLanguage?: string;
      spellWords?: string;
      dryRun?: boolean;
    }) => {
      const { fs, runner, targetDir, templatesDir, packs, config } = await resolveCommandContext(
        'install',
        options,
      );

      if (options.dryRun) {
        await runDryInit({ targetDir, templatesDir, packs, config }, fs);
        return;
      }

      const resolver = new AlwaysOverwriteConflictResolver();
      const result = await init({ targetDir, templatesDir, packs, config }, fs, runner, resolver);
      const packNames = packs.map((p) => p.name).join(', ');
      const fileCount = result.filesWritten.length;
      const hookStatus = result.hooksConfigured ? 'hooks wired' : 'hooks skipped';
      log(`noslop install: ${packNames} — ${fileCount} files written, ${hookStatus}`);
    },
  );

program
  .command('update')
  .description('Re-install hooks, CI, and Claude files; preserve user config files')
  .option('-d, --dir <path>', 'target directory', process.cwd())
  .option(
    '--pack <id>',
    'force a specific pack; repeat for multiple (e.g. --pack typescript --pack python)',
    (val: string, prev: string[]) => [...prev, val],
    [] as string[],
  )
  .action(async (options: { dir: string; pack: string[] }) => {
    const { fs, runner, targetDir, templatesDir, packs, config } = await resolveCommandContext(
      'update',
      options,
    );

    const resolver = new AlwaysSkipConflictResolver();
    const result = await init({ targetDir, templatesDir, packs, config }, fs, runner, resolver);
    const packNames = packs.map((p) => p.name).join(', ');
    const fileCount = result.filesWritten.length;
    const hookStatus = result.hooksConfigured ? 'hooks wired' : 'hooks skipped';
    log(`noslop update: ${packNames} — ${fileCount} files updated, ${hookStatus}`);
    log('User config files (eslint, pyproject, etc.) were not overwritten.');
  });

program
  .command('list')
  .description('List all available language packs and their gates')
  .option('--json', 'emit machine-readable JSON output')
  .action((options: { json?: boolean }) => {
    runList(options.json ?? false);
  });

program
  .command('check')
  .description('Run quality gates for detected packs')
  .option('-d, --dir <path>', 'target directory', process.cwd())
  .option('--tier <tier>', 'gate tier to run (fast|slow|ci)', 'fast')
  .option('--verbose', 'show output for all gates, not just failures')
  .option('--json', 'emit machine-readable JSON output')
  .option('--debug', 'show internal diagnostics (resolved paths, commands)')
  .option('--pack <id>', 'limit to a specific pack')
  .option('--no-spell', 'skip the spell gate')
  .option(
    '--skip-gate <label>',
    'skip a gate by label; repeat for multiple (e.g. --skip-gate mutation --skip-gate spell)',
    (val: string, prev: string[]) => [...prev, val],
    [] as string[],
  )
  .action(async (options: Parameters<typeof runCheck>[0]) => {
    validateDir(options.dir, 'noslop check');
    await runCheck(options);
  });

program
  .command('doctor')
  .description('Verify hooks, CI files, and Claude Code settings are wired')
  .option('-d, --dir <path>', 'target directory', process.cwd())
  .option('--strict', 'treat missing toolchain binaries as failures')
  .option('--json', 'emit machine-readable JSON output')
  .action(async (options: { dir: string; strict?: boolean; json?: boolean }) => {
    validateDir(options.dir, 'noslop doctor');
    const quiet = options.json ?? isQuiet();
    await runDoctor({ ...options, quiet });
  });

program
  .command('uninstall')
  .description('Remove noslop-installed files and reset git hooks')
  .option('-d, --dir <path>', 'target directory', process.cwd())
  .option('--dry-run', 'show what would be removed without deleting')
  .option('--json', 'emit machine-readable JSON output')
  .action(async (options: { dir: string; dryRun?: boolean; json?: boolean }) => {
    validateDir(options.dir, 'noslop uninstall');
    const quiet = options.json ?? isQuiet();
    await runUninstall({ ...options, quiet });
  });

program
  .command('setup')
  .description('Interactive wizard: detect packs, confirm, and install')
  .option('-d, --dir <path>', 'target directory', process.cwd())
  .action(async (options: { dir: string }) => {
    await runSetup(options.dir);
  });

/* c8 ignore next 2 -- CLI entry guard, tested via process spawn */
if (process.argv[1] === fileURLToPath(import.meta.url)) program.parse();
