import chalk from 'chalk';
import { doctor } from '../application/doctor/doctor-use-case.js';
import { loadProjectConfig } from '../application/config/load-project-config.js';
import { EXIT_GATE_FAILURE } from '../domain/exit-code.js';
import { NodeFilesystem, NodeProcessRunner } from '../infrastructure/index.js';
import { resolvePacks } from './resolve-packs.js';

export type DoctorOptions = Readonly<{
  dir: string;
  strict?: boolean;
  json?: boolean;
  quiet?: boolean;
}>;

export async function runDoctor(options: DoctorOptions): Promise<void> {
  const fs = new NodeFilesystem();
  const runner = new NodeProcessRunner();
  const projectConfig = await loadProjectConfig(options.dir, fs);
  const packs = await resolvePacks([], projectConfig, options.dir, fs);
  const result = await doctor(createDoctorCommand(options, packs), fs, runner);

  if (options.json) {
    printJsonResult(result);
    if (!result.healthy) process.exit(EXIT_GATE_FAILURE);
    return;
  }

  printTextResult(options, result);

  if (!result.healthy) {
    process.exit(EXIT_GATE_FAILURE);
  }
}

function createDoctorCommand(
  options: DoctorOptions,
  packs: Awaited<ReturnType<typeof resolvePacks>>,
) {
  return options.strict
    ? { targetDir: options.dir, packs, strict: true }
    : { targetDir: options.dir, packs };
}

function printJsonResult(result: Awaited<ReturnType<typeof doctor>>): void {
  const output = {
    healthy: result.healthy,
    checks: result.checks.map((check) => ({
      name: check.name,
      passed: check.passed,
      detail: check.detail,
    })),
  };
  console.log(JSON.stringify(output, null, 2));
}

function printTextResult(options: DoctorOptions, result: Awaited<ReturnType<typeof doctor>>): void {
  if (options.quiet) return;

  console.log(chalk.cyan(`noslop doctor → ${options.dir}`));
  for (const checkItem of result.checks) {
    const icon = checkItem.passed ? chalk.green('✓') : chalk.red('✗');
    console.log(`  ${icon} ${checkItem.name}`);
    console.log(chalk.dim(`    ${checkItem.detail}`));
  }

  if (result.healthy) {
    console.log(chalk.green('\nAll checks passed — repo is protected.'));
    return;
  }

  const failed = result.checks.filter((check) => !check.passed).length;
  console.log(chalk.red(`\n${failed} check(s) failed — run: noslop init`));
}
