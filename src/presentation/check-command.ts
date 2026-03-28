import chalk from 'chalk';
import path from 'node:path';
import { check } from '../application/check/check-use-case.js';
import type { CheckListener } from '../application/check/check-use-case.js';
import { loadProjectConfig } from '../application/config/load-project-config.js';
import { createGate, gatesWithoutLabel } from '../domain/gate/gate.js';
import type { GateTier } from '../domain/gate/gate.js';
import { createPack } from '../domain/pack/pack.js';
import type { Pack } from '../domain/pack/pack.js';
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
  const tier = parseTierOrExit(options.tier);
  const packArg = options.pack ? [options.pack] : [];
  const resolvedPacks = await resolvePacks(packArg, projectConfig, targetDir, fs);
  const rawPacks = appendCustomPack(resolvedPacks, projectConfig?.customGates ?? []);
  const labelsToSkip = buildLabelsToSkip(options, projectConfig?.skipGates ?? []);
  const packs = applySkippedLabels(rawPacks, labelsToSkip);

  if (options.debug) writeDebugInfo(targetDir, packs);
  if (!options.json) console.log(chalk.cyan(`noslop check --tier=${tier}`));

  const result = await check(
    createCheckCommand(targetDir, packs, tier, projectConfig?.timeoutMs),
    runner,
    createProgressListener(options),
  );
  await handleResult(result, tier, options);
}

function parseTierOrExit(tier: string): GateTier {
  const validTiers: readonly GateTier[] = ['fast', 'slow', 'ci'];
  if (validTiers.includes(tier as GateTier)) {
    return tier as GateTier;
  }
  console.error(chalk.red(`Unknown tier: '${tier}' — use fast, slow, or ci`));
  process.exit(EXIT_CONFIG_ERROR);
}

function appendCustomPack(
  packs: readonly Pack[],
  customGates: readonly {
    label: string;
    command: string;
    tier: GateTier;
  }[],
): Pack[] {
  if (customGates.length === 0) return [...packs];
  return [
    ...packs,
    createPack(
      'custom',
      'Custom',
      customGates.map((gate) => createGate(gate.label, gate.command, gate.tier)),
    ),
  ];
}

function buildLabelsToSkip(options: CheckOptions, configSkipGates: readonly string[]): string[] {
  const labelsToSkip = [...options.skipGate, ...configSkipGates];
  if (!options.spell) labelsToSkip.push('spell');
  return labelsToSkip;
}

function applySkippedLabels(packs: readonly Pack[], labelsToSkip: readonly string[]): Pack[] {
  if (labelsToSkip.length === 0) return [...packs];
  return packs.map((pack) => ({
    ...pack,
    gates: labelsToSkip.reduce((gates, label) => gatesWithoutLabel(gates, label), pack.gates),
  }));
}

function writeDebugInfo(targetDir: string, packs: readonly Pack[]): void {
  const binDir = path.join(targetDir, 'node_modules', '.bin');
  process.stderr.write(chalk.dim(`[debug] cwd: ${targetDir}\n`));
  process.stderr.write(chalk.dim(`[debug] node_modules/.bin: ${binDir}\n`));
  process.stderr.write(chalk.dim(`[debug] packs: ${packs.map((pack) => pack.id).join(', ')}\n`));
}

function createProgressListener(options: CheckOptions): CheckListener | undefined {
  const showProgress = !options.json && process.stdout.isTTY;
  if (!showProgress) return undefined;
  return {
    onGateStart: (label: string) => {
      process.stdout.write(chalk.dim(`  \u25b8 running: ${label}...\r`));
    },
  };
}

function createCheckCommand(
  targetDir: string,
  packs: readonly Pack[],
  tier: GateTier,
  timeoutMs?: number,
) {
  return timeoutMs ? { targetDir, packs, tier, timeoutMs } : { targetDir, packs, tier };
}

async function handleResult(
  result: Awaited<ReturnType<typeof check>>,
  tier: GateTier,
  options: CheckOptions,
): Promise<void> {
  if (options.json) {
    printJsonResult(result, tier);
  } else {
    printTextResult(result, options);
  }
  if (!result.passed) process.exit(EXIT_GATE_FAILURE);
}

function printJsonResult(result: Awaited<ReturnType<typeof check>>, tier: GateTier): void {
  const output = {
    passed: result.passed,
    tier,
    gates: result.outcomes.map((outcome) => ({
      label: outcome.label,
      command: outcome.command,
      passed: outcome.passed,
      exitCode: outcome.result.exitCode,
      stdout: outcome.result.stdout,
      stderr: outcome.result.stderr,
    })),
  };
  console.log(JSON.stringify(output, null, 2));
}

function printTextResult(result: Awaited<ReturnType<typeof check>>, options: CheckOptions): void {
  for (const outcome of result.outcomes) {
    printOutcome(outcome, options);
  }
  printSummary(result.passed);
}

function printOutcome(
  outcome: Awaited<ReturnType<typeof check>>['outcomes'][number],
  options: CheckOptions,
): void {
  const icon = outcome.passed ? chalk.green('✓') : chalk.red('✗');
  const shouldPrintOutput = options.verbose === true || !outcome.passed;
  console.log(`  ${icon} ${outcome.label}`);
  if (options.debug) {
    process.stderr.write(chalk.dim(`  [debug] command: ${outcome.command}\n`));
    process.stderr.write(chalk.dim(`  [debug] exitCode: ${outcome.result.exitCode}\n`));
  }
  printGateOutput(outcome.result.stdout, shouldPrintOutput);
  printGateOutput(outcome.result.stderr, shouldPrintOutput);
}

function printGateOutput(output: string, shouldPrint: boolean): void {
  if (shouldPrint && output) {
    console.log(chalk.dim(output.trim()));
  }
}

function printSummary(passed: boolean): void {
  if (passed) {
    console.log(chalk.green('\nAll gates passed.'));
    return;
  }
  console.log(chalk.red('\nSome gates failed.'));
  console.log(chalk.dim('Run with --verbose for details, or --skip-gate <label> to skip.'));
}
