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

  const doctorCommand = options.strict
    ? { targetDir: options.dir, packs, strict: true }
    : { targetDir: options.dir, packs };
  const result = await doctor(doctorCommand, fs, runner);

  if (options.json) {
    const output = {
      healthy: result.healthy,
      checks: result.checks.map((c) => ({
        name: c.name,
        passed: c.passed,
        detail: c.detail,
      })),
    };
    console.log(JSON.stringify(output, null, 2));
    if (!result.healthy) process.exit(EXIT_GATE_FAILURE);
    return;
  }

  if (!options.quiet) {
    console.log(chalk.cyan(`noslop doctor → ${options.dir}`));
  }

  for (const checkItem of result.checks) {
    const icon = checkItem.passed ? chalk.green('✓') : chalk.red('✗');
    if (!options.quiet) {
      console.log(`  ${icon} ${checkItem.name}`);
      console.log(chalk.dim(`    ${checkItem.detail}`));
    }
  }

  if (!options.quiet) {
    if (result.healthy) {
      console.log(chalk.green('\nAll checks passed — repo is protected.'));
    } else {
      const failed = result.checks.filter((c) => !c.passed).length;
      console.log(chalk.red(`\n${failed} check(s) failed — run: noslop init`));
    }
  }

  if (!result.healthy) {
    process.exit(EXIT_GATE_FAILURE);
  }
}
