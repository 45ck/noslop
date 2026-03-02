/**
 * Integration tests for init + doctor use cases using real filesystem and process runner.
 * Excluded from coverage thresholds (see vitest.config.ts).
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { promises as fsp } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { init } from '../application/init/init-use-case.js';
import { doctor } from '../application/doctor/doctor-use-case.js';
import { NodeFilesystem, NodeProcessRunner, resolveTemplatesDir } from '../infrastructure/index.js';
import { AlwaysOverwriteConflictResolver } from '../infrastructure/adapters/always-overwrite-conflict-resolver.js';
import { createConfig, DEFAULT_PROTECTED_PATHS } from '../domain/config/noslop-config.js';
import { RUST_PACK } from '../domain/packs/rust/rust.js';
import { TYPESCRIPT_PACK } from '../domain/packs/typescript/typescript.js';

function makeGitRepo(dir: string): void {
  execSync('git init', { cwd: dir, stdio: 'ignore' });
  execSync('git config user.email "test@test.com"', { cwd: dir, stdio: 'ignore' });
  execSync('git config user.name "Test"', { cwd: dir, stdio: 'ignore' });
}

let tmpDir: string;
const fs = new NodeFilesystem();
const runner = new NodeProcessRunner();
const resolver = new AlwaysOverwriteConflictResolver();
const templatesDir = resolveTemplatesDir();

beforeEach(async () => {
  tmpDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'noslop-integration-test-'));
});

afterEach(async () => {
  await fsp.rm(tmpDir, { recursive: true, force: true });
});

describe('init with RUST_PACK', () => {
  it('creates all expected files', async () => {
    makeGitRepo(tmpDir);
    const config = createConfig(['rust'], [...DEFAULT_PROTECTED_PATHS]);
    const result = await init(
      { targetDir: tmpDir, templatesDir, packs: [RUST_PACK], config },
      fs,
      runner,
      resolver,
    );

    expect(result.filesWritten.length).toBeGreaterThan(0);

    const preCommit = path.join(tmpDir, '.githooks', 'pre-commit');
    const stat = await fsp.stat(preCommit);
    expect(stat.isFile()).toBe(true);
    // On Unix, check executable bit; skip on Windows (chmod is a no-op there)
    if (process.platform !== 'win32') {
      expect(stat.mode & 0o111).toBeGreaterThan(0);
    }
  });

  it('configures git hooks when run in a git repo', async () => {
    makeGitRepo(tmpDir);
    const config = createConfig(['rust'], [...DEFAULT_PROTECTED_PATHS]);
    const result = await init(
      { targetDir: tmpDir, templatesDir, packs: [RUST_PACK], config },
      fs,
      runner,
      resolver,
    );
    expect(result.hooksConfigured).toBe(true);
  });
});

describe('init with TYPESCRIPT_PACK', () => {
  it('creates expected gate infrastructure files', async () => {
    makeGitRepo(tmpDir);
    const config = createConfig(['typescript'], [...DEFAULT_PROTECTED_PATHS]);
    await init(
      { targetDir: tmpDir, templatesDir, packs: [TYPESCRIPT_PACK], config },
      fs,
      runner,
      resolver,
    );

    const githooksDir = path.join(tmpDir, '.githooks');
    expect(await fsp.stat(githooksDir).then((s) => s.isDirectory())).toBe(true);

    const agentsMd = path.join(tmpDir, 'AGENTS.md');
    expect(await fsp.stat(agentsMd).then((s) => s.isFile())).toBe(true);
  });
});

describe('doctor after init', () => {
  it('reports healthy after typescript init in a git repo', async () => {
    makeGitRepo(tmpDir);
    const config = createConfig(['typescript'], [...DEFAULT_PROTECTED_PATHS]);
    await init(
      { targetDir: tmpDir, templatesDir, packs: [TYPESCRIPT_PACK], config },
      fs,
      runner,
      resolver,
    );

    const result = await doctor({ targetDir: tmpDir }, fs, runner);
    expect(result.healthy).toBe(true);
  });

  it('reports unhealthy on an empty directory', async () => {
    const result = await doctor({ targetDir: tmpDir }, fs, runner);
    expect(result.healthy).toBe(false);
  });
});

describe('no-overwrite guard', () => {
  it('skips a config file that already exists when resolver returns skip', async () => {
    makeGitRepo(tmpDir);
    const config = createConfig(['typescript'], [...DEFAULT_PROTECTED_PATHS]);

    // First init to establish gate infrastructure
    await init(
      { targetDir: tmpDir, templatesDir, packs: [TYPESCRIPT_PACK], config },
      fs,
      runner,
      resolver,
    );

    // Plant a pre-existing eslint.config.js with sentinel content
    const eslintConfigPath = path.join(tmpDir, 'eslint.config.js');
    await fsp.writeFile(eslintConfigPath, '// sentinel — must not be overwritten');

    // Second init with skip resolver
    const skipResolver = { resolve: async () => 'skip' as const };
    await init(
      { targetDir: tmpDir, templatesDir, packs: [TYPESCRIPT_PACK], config },
      fs,
      runner,
      skipResolver,
    );

    const content = await fsp.readFile(eslintConfigPath, 'utf8');
    expect(content).toBe('// sentinel — must not be overwritten');
  });
});
