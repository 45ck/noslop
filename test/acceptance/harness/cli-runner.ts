import { spawnSync, type SpawnSyncReturns } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const harnessDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(harnessDir, '..', '..', '..');
const cliPath = path.join(projectRoot, 'dist', 'presentation', 'cli.js');

export function runCheck(
  dir: string,
  tier: 'fast' | 'slow',
  opts: { timeoutMs: number; skipGates?: readonly string[] },
): SpawnSyncReturns<string> {
  const args = [cliPath, 'check', '--tier', tier, '--dir', dir];

  if (opts.skipGates) {
    for (const gate of opts.skipGates) {
      args.push('--skip-gate', gate);
    }
  }

  return spawnSync('node', args, {
    encoding: 'utf8',
    timeout: opts.timeoutMs,
    stdio: 'pipe',
  });
}
