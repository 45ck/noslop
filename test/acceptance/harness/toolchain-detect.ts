import { spawnSync } from 'node:child_process';

export function isToolchainAvailable(probes: readonly string[]): boolean {
  for (const probe of probes) {
    const parts = probe.split(' ');
    const cmd = parts[0]!;
    const args = parts.slice(1);
    const result = spawnSync(cmd, args, {
      encoding: 'utf8',
      timeout: 15_000,
      stdio: 'pipe',
    });
    if (result.error) {
      return false;
    }
    if (result.status !== 0 && result.status !== null) {
      return false;
    }
  }
  return true;
}
