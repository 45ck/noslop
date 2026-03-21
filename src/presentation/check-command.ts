import chalk from 'chalk';
import path from 'node:path';
import { check } from '../application/check/check-use-case.js';
import type { CheckListener } from '../application/check/check-use-case.js';
import { loadProjectConfig } from '../application/config/load-project-config.js';
import { createGate, gatesWithoutLabel } from '../domain/gate/gate.js';
import type { GateTier } from '../domain/gate/gate.js';
import { createPack } from '../domain/pack/pack.js';
import { EXIT_CONFIG_ERROR, EXIT_GATE_FAILURE } from '../domain/exit-code.js';
import { NodeFilesystem, NodeProcessRunner } from '../infrastructure/index.js';
import { resolvePacks } from './resolve-packs.js';

export type CheckOptions = Readonly<{
  dir: string;
  tier: string;
  verbose?: boolean;
  json?: boolean;
  debug?: boolean;
  pack?: string;
  spell: boolean;
  skipGate: string[];
}>;

export async function runCheck(options: CheckOptions): Promise<void> {
  const fs = new NodeFilesystem();
  const runner = new NodeProcessRunner();
  const targetDir = options.dir;
  const projectConfig = await loadProjectConfig(targetDir, fs);

  const validTiers: GateTier[] = ['fast', 'slow', 'ci'];
  if (!validTiers.includes(options.tier as GateTier)) {
    console.error(chalk.red(`Unknown tier: '${options.tier}' — use fast, slow, or ci`));
    process.exit(EXIT_CONFIG_ERROR);
  }
  const tier = options.tier as GateTier;

  const packArg = options.pack ? [options.pack] : [];
  const resolvedPacks = await resolvePacks(packArg, projectConfig, targetDir, fs);

  const customGates = projectConfig?.customGates ?? [];
  const rawPacks =
    customGates.length > 0
      ? [
          ...resolvedPacks,
          createPack(
            'custom',
            'Custom',
            customGates.map((g) => createGate(g.label, g.command, g.tier)),
          ),
        ]
      : resolvedPacks;

  const labelsToSkip = [...options.skipGate, ...(projectConfig?.skipGates ?? [])];
  if (!options.spell) labelsToSkip.push('spell');

  const packs =
    labelsToSkip.length > 0
      ? rawPacks.map((p) => {
          let gates = p.gates;
          for (const label of labelsToSkip) {
            gates = gatesWithoutLabel(gates, label);
          }
          return { ...p, gates };
        })
      : rawPacks;

  if (options.debug) {
    const binDir = path.join(targetDir, 'node_modules', '.bin');
    process.stderr.write(chalk.dim(`[debug] cwd: ${targetDir}\n`));
    process.stderr.write(chalk.dim(`[debug] node_modules/.bin: ${binDir}\n`));
    process.stderr.write(chalk.dim(`[debug] packs: ${packs.map((p) => p.id).join(', ')}\n`));
  }

  if (!options.json) {
    console.log(chalk.cyan(`noslop check --tier=${tier}`));
  }

  const showProgress = !options.json && process.stdout.isTTY;
  const listener: CheckListener | undefined = showProgress
    ? {
        onGateStart: (label: string) => {
          process.stdout.write(chalk.dim(`  \u25b8 running: ${label}...\r`));
        },
      }
    : undefined;

  const checkCommand = projectConfig?.timeoutMs
    ? { targetDir, packs, tier, timeoutMs: projectConfig.timeoutMs }
    : { targetDir, packs, tier };
  const result = await check(checkCommand, runner, listener);

  if (options.json) {
    const output = {
      passed: result.passed,
      tier,
      gates: result.outcomes.map((o) => ({
        label: o.label,
        command: o.command,
        passed: o.passed,
        exitCode: o.result.exitCode,
        stdout: o.result.stdout,
        stderr: o.result.stderr,
      })),
    };
    console.log(JSON.stringify(output, null, 2));
    if (!result.passed) process.exit(EXIT_GATE_FAILURE);
    return;
  }

  for (const outcome of result.outcomes) {
    const icon = outcome.passed ? chalk.green('✓') : chalk.red('✗');
    console.log(`  ${icon} ${outcome.label}`);
    if (options.debug) {
      process.stderr.write(chalk.dim(`  [debug] command: ${outcome.command}\n`));
      process.stderr.write(chalk.dim(`  [debug] exitCode: ${outcome.result.exitCode}\n`));
    }
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
    console.log(chalk.dim('Run with --verbose for details, or --skip-gate <label> to skip.'));
    process.exit(EXIT_GATE_FAILURE);
  }
}
