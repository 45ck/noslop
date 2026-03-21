#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import * as p from '@clack/prompts';
import { init } from '../application/init/init-use-case.js';
import { doctor } from '../application/doctor/doctor-use-case.js';
import { loadProjectConfig } from '../application/config/load-project-config.js';
import type { IConflictResolver } from '../application/ports/conflict-resolver.js';
import {
  NodeFilesystem,
  NodeProcessRunner,
  resolveTemplatesDir,
  AlwaysOverwriteConflictResolver,
  AlwaysSkipConflictResolver,
} from '../infrastructure/index.js';
import { createConfig, DEFAULT_PROTECTED_PATHS } from '../domain/config/noslop-config.js';
import { EXIT_CONFIG_ERROR, EXIT_GATE_FAILURE } from '../domain/exit-code.js';
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

const require = createRequire(import.meta.url);
const { version } = require('../../package.json') as { version: string };

const program = new Command();

program.name('noslop').description('Agent-boundary quality gates for any repo').version(version);

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
      validateDir(options.dir, 'noslop init');
      const nodeFs = new NodeFilesystem();
      const targetDir = options.dir;
      const templatesDir = resolveTemplatesDir();
      const projectConfig = await loadProjectConfig(targetDir, nodeFs);
      const packs = await resolvePacks(options.pack, projectConfig, targetDir, nodeFs);

      if (packs.length === 0) {
        const allIds = ALL_PACKS.map((p) => p.id).join(', ');
        console.error(chalk.red(`noslop init: unknown pack(s): ${options.pack.join(', ')}`));
        console.error(chalk.dim(`Available packs: ${allIds}`));
        process.exit(EXIT_CONFIG_ERROR);
      }

      const config = createConfig(
        packs.map((p) => p.id),
        [...DEFAULT_PROTECTED_PATHS],
        buildSpellConfig(!options.spell, options.spellLanguage, options.spellWords),
      );

      if (options.dryRun) {
        await runDryInit({ targetDir, templatesDir, packs, config }, nodeFs);
        return;
      }

      console.log(chalk.cyan(`noslop init → ${targetDir}`));
      console.log(chalk.dim(`Packs: ${packs.map((p) => p.name).join(', ')}`));

      const fs = nodeFs;
      const runner = new NodeProcessRunner();
      const resolver = makePromptResolver();
      const result = await init({ targetDir, templatesDir, packs, config }, fs, runner, resolver);

      for (const file of result.filesWritten) {
        console.log(chalk.green(`  ✓ ${file}`));
      }

      if (result.hooksConfigured) {
        console.log(chalk.green('  ✓ git core.hooksPath = .githooks'));
      } else {
        console.log(chalk.yellow('  ⚠ hooks not configured (not a git repo?)'));
      }

      console.log(chalk.bold('\nDone. Run noslop doctor to verify.'));
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
      validateDir(options.dir, 'noslop install');
      const nodeFs = new NodeFilesystem();
      const targetDir = options.dir;
      const templatesDir = resolveTemplatesDir();
      const projectConfig = await loadProjectConfig(targetDir, nodeFs);
      const packs = await resolvePacks(options.pack, projectConfig, targetDir, nodeFs);

      if (packs.length === 0) {
        const allIds = ALL_PACKS.map((p) => p.id).join(', ');
        console.error(chalk.red(`noslop install: unknown pack(s): ${options.pack.join(', ')}`));
        console.error(chalk.dim(`Available packs: ${allIds}`));
        process.exit(EXIT_CONFIG_ERROR);
      }

      const config = createConfig(
        packs.map((p) => p.id),
        [...DEFAULT_PROTECTED_PATHS],
        buildSpellConfig(!options.spell, options.spellLanguage, options.spellWords),
      );

      if (options.dryRun) {
        await runDryInit({ targetDir, templatesDir, packs, config }, nodeFs);
        return;
      }

      const fs = nodeFs;
      const runner = new NodeProcessRunner();
      const resolver = new AlwaysOverwriteConflictResolver();
      const result = await init({ targetDir, templatesDir, packs, config }, fs, runner, resolver);
      const packNames = packs.map((p) => p.name).join(', ');
      const fileCount = result.filesWritten.length;
      const hookStatus = result.hooksConfigured ? 'hooks wired' : 'hooks skipped';
      console.log(`noslop install: ${packNames} — ${fileCount} files written, ${hookStatus}`);
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
    validateDir(options.dir, 'noslop update');
    const fs = new NodeFilesystem();
    const runner = new NodeProcessRunner();
    const targetDir = options.dir;
    const templatesDir = resolveTemplatesDir();
    const projectConfig = await loadProjectConfig(targetDir, fs);
    const packs = await resolvePacks(options.pack, projectConfig, targetDir, fs);

    if (packs.length === 0) {
      const allIds = ALL_PACKS.map((p) => p.id).join(', ');
      console.error(chalk.red(`noslop update: unknown pack(s): ${options.pack.join(', ')}`));
      console.error(chalk.dim(`Available packs: ${allIds}`));
      process.exit(EXIT_CONFIG_ERROR);
    }

    const config = createConfig(
      packs.map((p) => p.id),
      [...DEFAULT_PROTECTED_PATHS],
    );
    const resolver = new AlwaysSkipConflictResolver();
    const result = await init({ targetDir, templatesDir, packs, config }, fs, runner, resolver);
    const packNames = packs.map((p) => p.name).join(', ');
    const fileCount = result.filesWritten.length;
    const hookStatus = result.hooksConfigured ? 'hooks wired' : 'hooks skipped';
    console.log(`noslop update: ${packNames} — ${fileCount} files updated, ${hookStatus}`);
    console.log('User config files (eslint, pyproject, etc.) were not overwritten.');
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
  .action(async (options: { dir: string; strict?: boolean }) => {
    validateDir(options.dir, 'noslop doctor');
    const fs = new NodeFilesystem();
    const runner = new NodeProcessRunner();
    const projectConfig = await loadProjectConfig(options.dir, fs);
    const packs = await resolvePacks([], projectConfig, options.dir, fs);

    console.log(chalk.cyan(`noslop doctor → ${options.dir}`));

    const doctorCommand = options.strict
      ? { targetDir: options.dir, packs, strict: true }
      : { targetDir: options.dir, packs };
    const result = await doctor(doctorCommand, fs, runner);

    for (const checkItem of result.checks) {
      const icon = checkItem.passed ? chalk.green('✓') : chalk.red('✗');
      console.log(`  ${icon} ${checkItem.name}`);
      console.log(chalk.dim(`    ${checkItem.detail}`));
    }

    if (result.healthy) {
      console.log(chalk.green('\nAll checks passed — repo is protected.'));
    } else {
      const failed = result.checks.filter((c) => !c.passed).length;
      console.log(chalk.red(`\n${failed} check(s) failed — run: noslop init`));
      process.exit(EXIT_GATE_FAILURE);
    }
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
