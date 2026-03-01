#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import { init } from '../application/init/init-use-case.js';
import { check } from '../application/check/check-use-case.js';
import { doctor } from '../application/doctor/doctor-use-case.js';
import { NodeFilesystem, NodeProcessRunner, resolveTemplatesDir } from '../infrastructure/index.js';
import { TYPESCRIPT_PACK } from '../domain/packs/typescript.js';
import { RUST_PACK } from '../domain/packs/rust.js';
import { DOTNET_PACK } from '../domain/packs/dotnet.js';
import { createConfig, DEFAULT_PROTECTED_PATHS } from '../domain/config/noslop-config.js';
import type { Pack } from '../domain/pack/pack.js';
import type { GateTier } from '../domain/gate/gate.js';

const ALL_PACKS: Pack[] = [TYPESCRIPT_PACK, RUST_PACK, DOTNET_PACK];

async function detectPacks(targetDir: string, fs: NodeFilesystem): Promise<Pack[]> {
  const detected: Pack[] = [];

  const tsIndicators = ['tsconfig.json', 'package.json'];
  for (const indicator of tsIndicators) {
    if (await fs.exists(`${targetDir}/${indicator}`)) {
      detected.push(TYPESCRIPT_PACK);
      break;
    }
  }

  if (await fs.exists(`${targetDir}/Cargo.toml`)) {
    detected.push(RUST_PACK);
  }

  const dotnetIndicators = ['*.csproj', '*.sln', 'global.json'];
  for (const indicator of dotnetIndicators) {
    if (await fs.exists(`${targetDir}/${indicator}`)) {
      detected.push(DOTNET_PACK);
      break;
    }
  }

  if (detected.length === 0) {
    const entries = await fs.readdir(targetDir).catch(() => []);
    const csprojFound = entries.some((e) => e.endsWith('.csproj') || e.endsWith('.sln'));
    if (csprojFound) detected.push(DOTNET_PACK);
  }

  return detected.length > 0 ? detected : [TYPESCRIPT_PACK];
}

const program = new Command();

program.name('noslop').description('Enforcement-first quality gate installer').version('0.1.0');

program
  .command('init')
  .description('Detect language packs, drop templates, and wire git hooks')
  .option('-d, --dir <path>', 'target directory', process.cwd())
  .option('--pack <id>', 'force a specific pack (typescript|rust|dotnet)')
  .action(async (options: { dir: string; pack?: string }) => {
    const fs = new NodeFilesystem();
    const runner = new NodeProcessRunner();
    const targetDir = options.dir;
    const templatesDir = resolveTemplatesDir();

    const packs = options.pack
      ? ALL_PACKS.filter((p) => p.id === options.pack)
      : await detectPacks(targetDir, fs);

    if (packs.length === 0) {
      console.error(chalk.red(`Unknown pack: ${options.pack ?? '(none detected)'}`));
      process.exit(1);
    }

    console.log(chalk.cyan(`noslop init → ${targetDir}`));
    console.log(chalk.dim(`Packs: ${packs.map((p) => p.name).join(', ')}`));

    const config = createConfig(
      packs.map((p) => p.id),
      [...DEFAULT_PROTECTED_PATHS],
    );

    const result = await init({ targetDir, templatesDir, packs, config }, fs, runner);

    for (const file of result.filesWritten) {
      console.log(chalk.green(`  ✓ ${file}`));
    }

    if (result.hooksConfigured) {
      console.log(chalk.green('  ✓ git core.hooksPath = .githooks'));
    } else {
      console.log(chalk.yellow('  ⚠ hooks not configured (not a git repo?)'));
    }

    console.log(chalk.bold('\nDone. Run noslop doctor to verify.'));
  });

program
  .command('install')
  .description('Non-interactive / idempotent init (for CI and bootstrap scripts)')
  .option('-d, --dir <path>', 'target directory', process.cwd())
  .option('--pack <id>', 'force a specific pack (typescript|rust|dotnet)')
  .action(async (options: { dir: string; pack?: string }) => {
    const fs = new NodeFilesystem();
    const runner = new NodeProcessRunner();
    const targetDir = options.dir;
    const templatesDir = resolveTemplatesDir();

    const packs = options.pack
      ? ALL_PACKS.filter((p) => p.id === options.pack)
      : await detectPacks(targetDir, fs);

    if (packs.length === 0) {
      console.error(`noslop install: unknown pack '${options.pack ?? ''}'`);
      process.exit(1);
    }

    const config = createConfig(
      packs.map((p) => p.id),
      [...DEFAULT_PROTECTED_PATHS],
    );

    const result = await init({ targetDir, templatesDir, packs, config }, fs, runner);
    const fileCount = result.filesWritten.length;
    const hookStatus = result.hooksConfigured ? 'hooks wired' : 'hooks skipped';
    console.log(`noslop install: ${fileCount} files written, ${hookStatus}`);
  });

program
  .command('check')
  .description('Run quality gates for detected packs')
  .option('-d, --dir <path>', 'target directory', process.cwd())
  .option('--tier <tier>', 'gate tier to run (fast|slow|ci)', 'fast')
  .option('--pack <id>', 'limit to a specific pack')
  .action(async (options: { dir: string; tier: string; pack?: string }) => {
    const fs = new NodeFilesystem();
    const runner = new NodeProcessRunner();
    const targetDir = options.dir;

    const validTiers: GateTier[] = ['fast', 'slow', 'ci'];
    if (!validTiers.includes(options.tier as GateTier)) {
      console.error(chalk.red(`Unknown tier: '${options.tier}' — use fast, slow, or ci`));
      process.exit(1);
    }
    const tier = options.tier as GateTier;

    const packs = options.pack
      ? ALL_PACKS.filter((p) => p.id === options.pack)
      : await detectPacks(targetDir, fs);

    console.log(chalk.cyan(`noslop check --tier=${tier}`));

    const result = await check({ targetDir, packs, tier }, runner);

    for (const outcome of result.outcomes) {
      const icon = outcome.passed ? chalk.green('✓') : chalk.red('✗');
      console.log(`  ${icon} ${outcome.label}`);
      if (!outcome.passed && outcome.result.stdout) {
        console.log(chalk.dim(outcome.result.stdout.trim()));
      }
      if (!outcome.passed && outcome.result.stderr) {
        console.log(chalk.dim(outcome.result.stderr.trim()));
      }
    }

    if (result.passed) {
      console.log(chalk.green('\nAll gates passed.'));
    } else {
      console.log(chalk.red('\nSome gates failed.'));
      process.exit(1);
    }
  });

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

program.parse();
