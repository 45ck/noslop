import chalk from 'chalk';
import { init } from '../application/init/init-use-case.js';
import type { InitCommand } from '../application/init/init-use-case.js';
import {
  AlwaysOverwriteConflictResolver,
  DryRunFilesystem,
  DryRunProcessRunner,
} from '../infrastructure/index.js';
import type { IFilesystem } from '../application/ports/filesystem.js';

export async function runDryInit(command: InitCommand, realFs: IFilesystem): Promise<void> {
  const dryFs = new DryRunFilesystem(realFs);
  const dryRunner = new DryRunProcessRunner();
  const resolver = new AlwaysOverwriteConflictResolver();
  await init(command, dryFs, dryRunner, resolver);

  const packNames = command.packs.map((p) => p.name).join(', ');
  const paths = dryFs.writtenPaths;
  console.log(chalk.cyan(`[dry-run] Packs: ${packNames}`));
  console.log(chalk.cyan(`[dry-run] ${paths.length} file(s) would be written:`));
  for (const file of paths) {
    console.log(chalk.dim(`  ${file}`));
  }
  for (const cmd of dryRunner.commands) {
    console.log(chalk.dim(`  [dry-run] would run: ${cmd}`));
  }
  console.log(chalk.cyan('[dry-run] No files were written.'));
}
