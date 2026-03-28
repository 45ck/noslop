import { execSync, spawnSync } from 'node:child_process';
import { promises as fsp, existsSync, readFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
export const projectRoot = path.resolve(currentDir, '..', '..');
export const cliPath = path.join(projectRoot, 'dist', 'presentation', 'cli.js');
export const distExists = existsSync(cliPath);

export function cli(args: string[], cwd?: string): ReturnType<typeof spawnSync> {
  return spawnSync('node', [cliPath, ...args], {
    cwd,
    encoding: 'utf8',
    timeout: 15_000,
  });
}

export async function withTempDir(
  prefix: string,
  run: (tmpDir: string) => Promise<void>,
): Promise<void> {
  const tmpDir = await fsp.mkdtemp(path.join(os.tmpdir(), prefix));
  try {
    await run(tmpDir);
  } finally {
    await fsp.rm(tmpDir, { recursive: true, force: true, maxRetries: 3, retryDelay: 200 });
  }
}

export function initGitRepo(tmpDir: string): void {
  execSync('git init', { cwd: tmpDir, stdio: 'ignore' });
  execSync('git config user.email "t@t.com"', { cwd: tmpDir, stdio: 'ignore' });
  execSync('git config user.name "T"', { cwd: tmpDir, stdio: 'ignore' });
}

export function readPackageVersion(): string {
  return (
    JSON.parse(readFileSync(path.join(projectRoot, 'package.json'), 'utf8')) as { version: string }
  ).version;
}
