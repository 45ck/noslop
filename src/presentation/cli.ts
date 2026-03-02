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
import { JAVASCRIPT_PACK } from '../domain/packs/javascript.js';
import { GO_PACK } from '../domain/packs/go.js';
import { PYTHON_PACK } from '../domain/packs/python.js';
import { JAVA_PACK } from '../domain/packs/java.js';
import { PHP_PACK } from '../domain/packs/php.js';
import { RUBY_PACK } from '../domain/packs/ruby.js';
import { SWIFT_PACK } from '../domain/packs/swift.js';
import { KOTLIN_PACK } from '../domain/packs/kotlin.js';
import { CPP_PACK } from '../domain/packs/cpp.js';
import { SCALA_PACK } from '../domain/packs/scala.js';
import { ELIXIR_PACK } from '../domain/packs/elixir.js';
import { DART_PACK } from '../domain/packs/dart.js';
import { ZIG_PACK } from '../domain/packs/zig.js';
import { HASKELL_PACK } from '../domain/packs/haskell.js';
import { LUA_PACK } from '../domain/packs/lua.js';
import { OCAML_PACK } from '../domain/packs/ocaml.js';
import { createConfig, DEFAULT_PROTECTED_PATHS } from '../domain/config/noslop-config.js';
import type { Pack } from '../domain/pack/pack.js';
import type { GateTier } from '../domain/gate/gate.js';
import type { IFilesystem } from '../application/ports/filesystem.js';
import { fileURLToPath } from 'node:url';

const ALL_PACKS: Pack[] = [
  TYPESCRIPT_PACK,
  RUST_PACK,
  DOTNET_PACK,
  JAVASCRIPT_PACK,
  GO_PACK,
  PYTHON_PACK,
  JAVA_PACK,
  PHP_PACK,
  RUBY_PACK,
  SWIFT_PACK,
  KOTLIN_PACK,
  CPP_PACK,
  SCALA_PACK,
  ELIXIR_PACK,
  DART_PACK,
  ZIG_PACK,
  HASKELL_PACK,
  LUA_PACK,
  OCAML_PACK,
];

export async function detectPacks(targetDir: string, fs: IFilesystem): Promise<Pack[]> {
  const detected: Pack[] = [];

  // TypeScript detection also covers pure JavaScript repos (both use package.json).
  // For repos that explicitly don't use TypeScript, use --pack=javascript.
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

  const rootEntries = await fs.readdir(targetDir).catch(() => []);
  const hasDotnet = rootEntries.some((e) => e.endsWith('.csproj') || e.endsWith('.sln'));
  const hasGlobalJson = await fs.exists(`${targetDir}/global.json`);
  if (hasDotnet || hasGlobalJson) detected.push(DOTNET_PACK);

  if (await fs.exists(`${targetDir}/go.mod`)) {
    detected.push(GO_PACK);
  }

  if (
    (await fs.exists(`${targetDir}/pyproject.toml`)) ||
    (await fs.exists(`${targetDir}/setup.py`)) ||
    (await fs.exists(`${targetDir}/requirements.txt`))
  ) {
    detected.push(PYTHON_PACK);
  }

  const hasMaven = await fs.exists(`${targetDir}/pom.xml`);
  const hasGradle =
    (await fs.exists(`${targetDir}/build.gradle`)) ||
    (await fs.exists(`${targetDir}/build.gradle.kts`));
  if (hasMaven || hasGradle) {
    // Distinguish Java from Kotlin: check for .kt files in src/
    const srcEntries = await fs.readdir(`${targetDir}/src`).catch(() => []);
    const hasKotlinSrc = srcEntries.some((e) => e.endsWith('.kt'));
    if (hasKotlinSrc) {
      detected.push(KOTLIN_PACK);
    } else {
      detected.push(JAVA_PACK);
    }
  }

  const hasComposer = await fs.exists(`${targetDir}/composer.json`);
  if (hasComposer) {
    detected.push(PHP_PACK);
  }

  const hasGemfile = await fs.exists(`${targetDir}/Gemfile`);
  if (hasGemfile) {
    detected.push(RUBY_PACK);
  }

  const hasPackageSwift = await fs.exists(`${targetDir}/Package.swift`);
  if (hasPackageSwift) {
    detected.push(SWIFT_PACK);
  }

  const hasCMakeLists = await fs.exists(`${targetDir}/CMakeLists.txt`);
  if (hasCMakeLists) {
    detected.push(CPP_PACK);
  }

  const hasBuildSbt = await fs.exists(`${targetDir}/build.sbt`);
  if (hasBuildSbt) {
    detected.push(SCALA_PACK);
  }

  const hasMixExs = await fs.exists(`${targetDir}/mix.exs`);
  if (hasMixExs) {
    detected.push(ELIXIR_PACK);
  }

  const hasPubspec = await fs.exists(`${targetDir}/pubspec.yaml`);
  if (hasPubspec) {
    detected.push(DART_PACK);
  }

  const hasBuildZig = await fs.exists(`${targetDir}/build.zig`);
  if (hasBuildZig) {
    detected.push(ZIG_PACK);
  }

  const hasCabalFile = rootEntries.some((e) => e.endsWith('.cabal'));
  if (hasCabalFile) {
    detected.push(HASKELL_PACK);
  }

  const hasLuaRock =
    (await fs.exists(`${targetDir}/rockspec`)) || rootEntries.some((e) => e.endsWith('.rockspec'));
  if (hasLuaRock) {
    detected.push(LUA_PACK);
  }

  const hasDuneProject = await fs.exists(`${targetDir}/dune-project`);
  if (hasDuneProject) {
    detected.push(OCAML_PACK);
  }

  return detected.length > 0 ? detected : [TYPESCRIPT_PACK];
}

const program = new Command();

program.name('noslop').description('Enforcement-first quality gate installer').version('0.1.0');

program
  .command('init')
  .description('Detect language packs, drop templates, and wire git hooks')
  .option('-d, --dir <path>', 'target directory', process.cwd())
  .option('--pack <id>', 'force a specific pack by id (e.g. typescript, rust, python, go)')
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
  .option('--pack <id>', 'force a specific pack by id (e.g. typescript, rust, python, go)')
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
  .option('--verbose', 'show output for all gates, not just failures')
  .option('--pack <id>', 'limit to a specific pack')
  .action(async (options: { dir: string; tier: string; verbose?: boolean; pack?: string }) => {
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

/* c8 ignore next 2 -- CLI entry guard, tested via process spawn */
if (process.argv[1] === fileURLToPath(import.meta.url)) program.parse();
