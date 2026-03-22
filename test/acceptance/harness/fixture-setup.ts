import { promises as fsp } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import type { LanguageFixture } from './types.js';

const harnessDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(harnessDir, '..', '..', '..');
const cliPath = path.join(projectRoot, 'dist', 'presentation', 'cli.js');

export async function setupFixture(fixture: LanguageFixture): Promise<string> {
  const tmpDir = await fsp.mkdtemp(path.join(os.tmpdir(), `noslop-acceptance-${fixture.packId}-`));

  await fsp.cp(fixture.fixtureDir, tmpDir, { recursive: true });

  execSync('git init', { cwd: tmpDir, stdio: 'ignore' });
  execSync('git config user.email "test@test.com"', {
    cwd: tmpDir,
    stdio: 'ignore',
  });
  execSync('git config user.name "Test"', {
    cwd: tmpDir,
    stdio: 'ignore',
  });

  if (fixture.dependencyInstall) {
    execSync(fixture.dependencyInstall, {
      cwd: tmpDir,
      stdio: 'pipe',
      timeout: fixture.slowTimeoutMs,
    });
  }

  const installResult = spawnSync(
    'node',
    [cliPath, 'install', '--pack', fixture.packId, '--dir', tmpDir],
    { stdio: 'pipe', timeout: 30_000, encoding: 'utf8' },
  );

  if (installResult.status !== 0) {
    const msg = installResult.stderr || installResult.stdout || 'unknown error';
    throw new Error(`noslop install --pack ${fixture.packId} failed:\n${msg}`);
  }

  execSync('git add -A', { cwd: tmpDir, stdio: 'ignore' });
  execSync('git commit -m "initial" --no-verify', {
    cwd: tmpDir,
    stdio: 'ignore',
  });

  return tmpDir;
}

export async function cleanupFixture(tmpDir: string): Promise<void> {
  await fsp.rm(tmpDir, { recursive: true, force: true });
}
