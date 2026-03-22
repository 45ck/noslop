import chalk from 'chalk';
import { uninstall } from '../application/uninstall/uninstall-use-case.js';
import { NodeFilesystem, NodeProcessRunner } from '../infrastructure/index.js';

export type UninstallOptions = Readonly<{
  dir: string;
  dryRun?: boolean;
  json?: boolean;
  quiet?: boolean;
}>;

export async function runUninstall(options: UninstallOptions): Promise<void> {
  const fs = new NodeFilesystem();
  const runner = new NodeProcessRunner();

  const result = await uninstall({ targetDir: options.dir }, fs, runner);

  if (options.json) {
    console.log(
      JSON.stringify(
        {
          filesRemoved: result.filesRemoved,
          dirsRemoved: result.dirsRemoved,
          hooksReset: result.hooksReset,
        },
        null,
        2,
      ),
    );
    return;
  }

  if (options.quiet) return;

  if (result.filesRemoved.length === 0 && result.dirsRemoved.length === 0) {
    console.log(chalk.dim('Nothing to remove — no noslop infrastructure found.'));
    return;
  }

  for (const file of result.filesRemoved) {
    console.log(chalk.red(`  ✗ ${file}`));
  }
  for (const dir of result.dirsRemoved) {
    console.log(chalk.red(`  ✗ ${dir}/`));
  }

  if (result.hooksReset) {
    console.log(chalk.green('  ✓ git core.hooksPath unset'));
  }

  const total = result.filesRemoved.length + result.dirsRemoved.length;
  console.log(chalk.bold(`\nRemoved ${total} item(s). noslop infrastructure is gone.`));
}
