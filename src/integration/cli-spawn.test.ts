/**
 * CLI integration tests using process spawn.
 * Requires a built dist/ — skipped if dist/presentation/cli.js is absent.
 * Fulfils the "integration-tested via process spawn" comment in cli.ts.
 */
import { beforeAll, describe, expect, it } from 'vitest';
import { spawnSync } from 'node:child_process';
import { promises as fsp, existsSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(currentDir, '..', '..');
const cliPath = path.join(projectRoot, 'dist', 'presentation', 'cli.js');

function cli(args: string[], cwd?: string): ReturnType<typeof spawnSync> {
  return spawnSync('node', [cliPath, ...args], {
    cwd,
    encoding: 'utf8',
    timeout: 15_000,
  });
}

let distExists = false;

beforeAll(() => {
  distExists = existsSync(cliPath);
});

describe('CLI spawn tests', () => {
  it('dist/presentation/cli.js exists (build was run)', () => {
    expect(distExists).toBe(true);
  });

  it('--help exits 0 and lists all 5 commands', () => {
    if (!distExists) return;
    const result = cli(['--help']);
    expect(result.status).toBe(0);
    const out = result.stdout;
    expect(out).toContain('init');
    expect(out).toContain('install');
    expect(out).toContain('check');
    expect(out).toContain('doctor');
    expect(out).toContain('setup');
  });

  it('--version exits 0', () => {
    if (!distExists) return;
    const result = cli(['--version']);
    expect(result.status).toBe(0);
  });

  it('doctor on an empty temp dir exits 1', async () => {
    if (!distExists) return;
    const tmpDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'noslop-cli-spawn-empty-'));
    try {
      const result = cli(['doctor', '--dir', tmpDir]);
      expect(result.status).toBe(1);
    } finally {
      await fsp.rm(tmpDir, { recursive: true, force: true });
    }
  });

  it('init --pack rust on a git repo exits 0 and creates expected files', async () => {
    if (!distExists) return;
    const tmpDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'noslop-cli-spawn-rust-'));
    try {
      execSync('git init', { cwd: tmpDir, stdio: 'ignore' });
      execSync('git config user.email "t@t.com"', { cwd: tmpDir, stdio: 'ignore' });
      execSync('git config user.name "T"', { cwd: tmpDir, stdio: 'ignore' });

      const result = cli(['install', '--pack', 'rust', '--dir', tmpDir]);
      expect(result.status).toBe(0);

      const preCommit = path.join(tmpDir, '.githooks', 'pre-commit');
      expect(existsSync(preCommit)).toBe(true);
    } finally {
      await fsp.rm(tmpDir, { recursive: true, force: true });
    }
  });

  it('doctor on a typescript-initialized git repo exits 0', async () => {
    if (!distExists) return;
    const tmpDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'noslop-cli-spawn-ts-'));
    try {
      execSync('git init', { cwd: tmpDir, stdio: 'ignore' });
      execSync('git config user.email "t@t.com"', { cwd: tmpDir, stdio: 'ignore' });
      execSync('git config user.name "T"', { cwd: tmpDir, stdio: 'ignore' });

      const installResult = cli(['install', '--pack', 'typescript', '--dir', tmpDir]);
      expect(installResult.status).toBe(0);

      const doctorResult = cli(['doctor', '--dir', tmpDir]);
      expect(doctorResult.status).toBe(0);
    } finally {
      await fsp.rm(tmpDir, { recursive: true, force: true });
    }
  });
});
