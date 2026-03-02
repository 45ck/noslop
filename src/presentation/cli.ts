#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import * as p from '@clack/prompts';
import { init } from '../application/init/init-use-case.js';
import { check } from '../application/check/check-use-case.js';
import { doctor } from '../application/doctor/doctor-use-case.js';
import type { IConflictResolver } from '../application/ports/conflict-resolver.js';
import {
  NodeFilesystem,
  NodeProcessRunner,
  resolveTemplatesDir,
  AlwaysOverwriteConflictResolver,
} from '../infrastructure/index.js';
import { createConfig, DEFAULT_PROTECTED_PATHS } from '../domain/config/noslop-config.js';
import { gatesWithoutLabel } from '../domain/gate/gate.js';
import type { GateTier } from '../domain/gate/gate.js';
import { fileURLToPath } from 'node:url';
import { ALL_PACKS, detectPacks } from './packs.js';
import { runSetup } from './setup-command.js';
import { buildSpellConfig } from './spell-options.js';

const program = new Command();

program.name('noslop').description('Enforcement-first quality gate installer').version('0.1.0');

function makePromptResolver(): IConflictResolver {
  return {
    resolve: async (filePath: string) => {
      const answer = await p.confirm({ message: `${filePath} already exists. Overwrite?` });
      if (p.isCancel(answer) || !answer) return 'skip';
      return 'overwrite';
    },
  };
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
  .action(
    async (options: {
      dir: string;
      pack: string[];
      spell: boolean;
      spellLanguage?: string;
      spellWords?: string;
    }) => {
      const fs = new NodeFilesystem();
      const runner = new NodeProcessRunner();
      const targetDir = options.dir;
      const templatesDir = resolveTemplatesDir();

      const packs =
        options.pack.length > 0
          ? ALL_PACKS.filter((p) => options.pack.includes(p.id))
          : await detectPacks(targetDir, fs);

      if (packs.length === 0) {
        console.error(chalk.red(`Unknown pack(s): ${options.pack.join(', ')}`));
        process.exit(1);
      }

      console.log(chalk.cyan(`noslop init → ${targetDir}`));
      console.log(chalk.dim(`Packs: ${packs.map((p) => p.name).join(', ')}`));

      const config = createConfig(
        packs.map((p) => p.id),
        [...DEFAULT_PROTECTED_PATHS],
        buildSpellConfig(!options.spell, options.spellLanguage, options.spellWords),
      );

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
  .action(
    async (options: {
      dir: string;
      pack: string[];
      spell: boolean;
      spellLanguage?: string;
      spellWords?: string;
    }) => {
      const fs = new NodeFilesystem();
      const runner = new NodeProcessRunner();
      const targetDir = options.dir;
      const templatesDir = resolveTemplatesDir();

      const packs =
        options.pack.length > 0
          ? ALL_PACKS.filter((p) => options.pack.includes(p.id))
          : await detectPacks(targetDir, fs);

      if (packs.length === 0) {
        console.error(`noslop install: unknown pack(s): ${options.pack.join(', ')}`);
        process.exit(1);
      }

      const config = createConfig(
        packs.map((p) => p.id),
        [...DEFAULT_PROTECTED_PATHS],
        buildSpellConfig(!options.spell, options.spellLanguage, options.spellWords),
      );

      const resolver = new AlwaysOverwriteConflictResolver();
      const result = await init({ targetDir, templatesDir, packs, config }, fs, runner, resolver);
      const packNames = packs.map((p) => p.name).join(', ');
      const fileCount = result.filesWritten.length;
      const hookStatus = result.hooksConfigured ? 'hooks wired' : 'hooks skipped';
      console.log(`noslop install: ${packNames} — ${fileCount} files written, ${hookStatus}`);
    },
  );

program
  .command('check')
  .description('Run quality gates for detected packs')
  .option('-d, --dir <path>', 'target directory', process.cwd())
  .option('--tier <tier>', 'gate tier to run (fast|slow|ci)', 'fast')
  .option('--verbose', 'show output for all gates, not just failures')
  .option('--pack <id>', 'limit to a specific pack')
  .option('--no-spell', 'skip the spell gate')
  .action(
    async (options: {
      dir: string;
      tier: string;
      verbose?: boolean;
      pack?: string;
      spell: boolean;
    }) => {
      const fs = new NodeFilesystem();
      const runner = new NodeProcessRunner();
      const targetDir = options.dir;

      const validTiers: GateTier[] = ['fast', 'slow', 'ci'];
      if (!validTiers.includes(options.tier as GateTier)) {
        console.error(chalk.red(`Unknown tier: '${options.tier}' — use fast, slow, or ci`));
        process.exit(1);
      }
      const tier = options.tier as GateTier;

      const rawPacks = options.pack
        ? ALL_PACKS.filter((p) => p.id === options.pack)
        : await detectPacks(targetDir, fs);

      const packs = options.spell
        ? rawPacks
        : rawPacks.map((p) => ({ ...p, gates: gatesWithoutLabel(p.gates, 'spell') }));

      console.log(chalk.cyan(`noslop check --tier=${tier}`));

      const result = await check({ targetDir, packs, tier }, runner);

      for (const outcome of result.outcomes) {
        const icon = outcome.passed ? chalk.green('✓') : chalk.red('✗');
        console.log(`  ${icon} ${outcome.label}`);
        if ((options.verbose || !outcome.passed) && outcome.result.stdout) {
          console.log(chalk.dim(outcome.result.stdout.trim()));
        }
        if ((options.verbose || !outcome.passed) && outcome.result.stderr) {
          console.log(chalk.dim(outcome.result.stderr.trim()));
        }
      }

      if (result.passed) {
        console.log(chalk.green('\nAll gates passed.'));
      } else {
        console.log(chalk.red('\nSome gates failed.'));
        process.exit(1);
      }
    },
  );

program
  .command('doctor')
  .description('Verify hooks, CI files, and Claude Code settings are wired')
  .option('-d, --dir <path>', 'target directory', process.cwd())
  .action(async (options: { dir: string }) => {
    const fs = new NodeFilesystem();
    const runner = new NodeProcessRunner();

    console.log(chalk.cyan(`noslop doctor → ${options.dir}`));

    const result = await doctor({ targetDir: options.dir }, fs, runner);

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
      process.exit(1);
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
