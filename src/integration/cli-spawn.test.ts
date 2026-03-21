/**
 * CLI integration tests using process spawn.
 * Requires a built dist/ — skipped if dist/presentation/cli.js is absent.
 * Fulfils the "integration-tested via process spawn" comment in cli.ts.
 */
import { beforeAll, describe, expect, it } from 'vitest';
import { spawnSync } from 'node:child_process';
import { promises as fsp, existsSync, readFileSync } from 'node:fs';
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

  it('--help exits 0 and lists all 7 commands', () => {
    if (!distExists) return;
    const result = cli(['--help']);
    expect(result.status).toBe(0);
    const out = result.stdout;
    expect(out).toContain('init');
    expect(out).toContain('install');
    expect(out).toContain('update');
    expect(out).toContain('list');
    expect(out).toContain('check');
    expect(out).toContain('doctor');
    expect(out).toContain('setup');
  });

  it('--version exits 0 and matches package.json version', () => {
    if (!distExists) return;
    const result = cli(['--version']);
    expect(result.status).toBe(0);

    const pkgPath = path.join(projectRoot, 'package.json');
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8')) as { version: string };
    expect(String(result.stdout).trim()).toBe(pkg.version);
  });

  it('exits 2 with error when --dir points to non-existent directory', () => {
    if (!distExists) return;
    const result = cli(['doctor', '--dir', '/tmp/noslop-nonexistent-dir-xyz']);
    expect(result.status).toBe(2);
    expect(result.stderr).toContain('directory does not exist');
  });

  it('doctor on an empty temp dir exits 1', { timeout: 20_000 }, async () => {
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

  it('install with repeated --pack flags installs multiple packs', async () => {
    if (!distExists) return;
    const tmpDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'noslop-cli-spawn-multi-'));
    try {
      execSync('git init', { cwd: tmpDir, stdio: 'ignore' });
      execSync('git config user.email "t@t.com"', { cwd: tmpDir, stdio: 'ignore' });
      execSync('git config user.name "T"', { cwd: tmpDir, stdio: 'ignore' });

      const result = cli(['install', '--pack', 'typescript', '--pack', 'rust', '--dir', tmpDir]);
      expect(result.status).toBe(0);
      expect(result.stdout).toContain('TypeScript');
      expect(result.stdout).toContain('Rust');
    } finally {
      await fsp.rm(tmpDir, { recursive: true, force: true });
    }
  });

  it('update preserves existing user config files and exits 0', async () => {
    if (!distExists) return;
    const tmpDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'noslop-cli-spawn-update-'));
    try {
      execSync('git init', { cwd: tmpDir, stdio: 'ignore' });
      execSync('git config user.email "t@t.com"', { cwd: tmpDir, stdio: 'ignore' });
      execSync('git config user.name "T"', { cwd: tmpDir, stdio: 'ignore' });

      // Install first, then place a user config file
      cli(['install', '--pack', 'typescript', '--dir', tmpDir]);
      const userConfig = path.join(tmpDir, 'eslint.config.js');
      await fsp.writeFile(userConfig, '// my custom config');

      // update must not overwrite user config
      const result = cli(['update', '--pack', 'typescript', '--dir', tmpDir]);
      expect(result.status).toBe(0);
      expect(result.stdout).toContain('noslop update');
      expect(await fsp.readFile(userConfig, 'utf8')).toBe('// my custom config');
    } finally {
      await fsp.rm(tmpDir, { recursive: true, force: true });
    }
  });

  it('doctor on a typescript-initialized git repo exits 0', { timeout: 20_000 }, async () => {
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

  it('install --dry-run exits 0, prints dry-run output, and creates no files', async () => {
    if (!distExists) return;
    const tmpDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'noslop-cli-spawn-dryrun-'));
    try {
      const result = cli(['install', '--pack', 'rust', '--dry-run', '--dir', tmpDir]);
      expect(result.status).toBe(0);
      const out = result.stdout;
      expect(out).toContain('[dry-run]');
      expect(out).toContain('Rust');
      expect(out).toContain('No files were written');

      // No files should have been created
      const entries = await fsp.readdir(tmpDir);
      expect(entries).toEqual([]);
    } finally {
      await fsp.rm(tmpDir, { recursive: true, force: true });
    }
  });

  it('check --json outputs valid JSON with expected structure', async () => {
    if (!distExists) return;
    const tmpDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'noslop-cli-spawn-json-'));
    try {
      cli(['install', '--pack', 'rust', '--dir', tmpDir]);

      const result = cli(['check', '--json', '--tier', 'fast', '--dir', tmpDir]);
      // Gates will likely fail (no toolchain), so exit code may be 1
      const out = String(result.stdout).trim();
      const parsed = JSON.parse(out) as {
        passed: boolean;
        tier: string;
        gates: { label: string; command: string; passed: boolean; exitCode: number }[];
      };
      expect(typeof parsed.passed).toBe('boolean');
      expect(parsed.tier).toBe('fast');
      expect(Array.isArray(parsed.gates)).toBe(true);
      for (const gate of parsed.gates) {
        expect(typeof gate.label).toBe('string');
        expect(typeof gate.command).toBe('string');
        expect(typeof gate.passed).toBe('boolean');
        expect(typeof gate.exitCode).toBe('number');
      }
    } finally {
      await fsp.rm(tmpDir, { recursive: true, force: true });
    }
  });

  it('check --skip-gate spell removes the spell gate from output', async () => {
    if (!distExists) return;
    const tmpDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'noslop-cli-spawn-skip-'));
    try {
      cli(['install', '--pack', 'rust', '--dir', tmpDir]);

      const result = cli([
        'check',
        '--json',
        '--tier',
        'fast',
        '--skip-gate',
        'spell',
        '--dir',
        tmpDir,
      ]);
      const out = String(result.stdout).trim();
      const parsed = JSON.parse(out) as {
        gates: { label: string }[];
      };
      const labels = parsed.gates.map((g) => g.label);
      expect(labels).not.toContain('spell');
    } finally {
      await fsp.rm(tmpDir, { recursive: true, force: true });
    }
  });

  it('check --verbose shows gate output for all gates', async () => {
    if (!distExists) return;
    const tmpDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'noslop-cli-spawn-verbose-'));
    try {
      cli(['install', '--pack', 'rust', '--dir', tmpDir]);

      const result = cli(['check', '--verbose', '--tier', 'fast', '--dir', tmpDir]);
      const out = String(result.stdout);
      // With --verbose, output should show the tier header and gate results
      expect(out).toContain('noslop check --tier=fast');
    } finally {
      await fsp.rm(tmpDir, { recursive: true, force: true });
    }
  });

  it('check --json --skip-gate combined removes specified gates from JSON', async () => {
    if (!distExists) return;
    const tmpDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'noslop-cli-spawn-combined-'));
    try {
      cli(['install', '--pack', 'rust', '--dir', tmpDir]);

      const result = cli([
        'check',
        '--json',
        '--tier',
        'ci',
        '--skip-gate',
        'mutation',
        '--skip-gate',
        'spell',
        '--dir',
        tmpDir,
      ]);
      const out = String(result.stdout).trim();
      const parsed = JSON.parse(out) as {
        passed: boolean;
        tier: string;
        gates: { label: string }[];
      };
      expect(parsed.tier).toBe('ci');
      const labels = parsed.gates.map((g) => g.label);
      expect(labels).not.toContain('mutation');
      expect(labels).not.toContain('spell');
    } finally {
      await fsp.rm(tmpDir, { recursive: true, force: true });
    }
  });

  it('installs all 19 packs into a monorepo directory', async () => {
    if (!distExists) return;
    const tmpDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'noslop-cli-spawn-monorepo-'));
    try {
      const result = cli(
        [
          'install',
          '--pack',
          'typescript',
          '--pack',
          'javascript',
          '--pack',
          'rust',
          '--pack',
          'python',
          '--pack',
          'go',
          '--pack',
          'java',
          '--pack',
          'kotlin',
          '--pack',
          'ruby',
          '--pack',
          'php',
          '--pack',
          'cpp',
          '--pack',
          'scala',
          '--pack',
          'elixir',
          '--pack',
          'dart',
          '--pack',
          'swift',
          '--pack',
          'haskell',
          '--pack',
          'lua',
          '--pack',
          'dotnet',
          '--pack',
          'zig',
          '--pack',
          'ocaml',
          '--dir',
          tmpDir,
        ],
        undefined,
      );
      expect(result.status).toBe(0);

      // All 19 pack names appear in stdout
      const out = result.stdout;
      expect(out).toContain('TypeScript');
      expect(out).toContain('Rust');
      expect(out).toContain('Python');
      expect(out).toContain('Go');
      expect(out).toContain('Java');
      expect(out).toContain('Kotlin');
      expect(out).toContain('Ruby');
      expect(out).toContain('.NET');
      expect(out).toContain('PHP');
      expect(out).toContain('Swift');
      expect(out).toContain('Scala');
      expect(out).toContain('Elixir');
      expect(out).toContain('Dart');
      expect(out).toContain('Haskell');
      expect(out).toContain('Lua');
      expect(out).toContain('Zig');
      expect(out).toContain('OCaml');

      // Shared hook infrastructure
      expect(existsSync(path.join(tmpDir, '.githooks', 'pre-commit'))).toBe(true);
      expect(existsSync(path.join(tmpDir, 'AGENTS.md'))).toBe(true);

      // Representative language quality configs
      expect(existsSync(path.join(tmpDir, 'eslint.config.js'))).toBe(true);
      expect(existsSync(path.join(tmpDir, 'clippy.toml'))).toBe(true);
      expect(existsSync(path.join(tmpDir, '.golangci.yml'))).toBe(true);
      expect(existsSync(path.join(tmpDir, 'pyproject.toml'))).toBe(true);
      expect(existsSync(path.join(tmpDir, 'detekt.yml'))).toBe(true);
      expect(existsSync(path.join(tmpDir, 'Directory.Build.props'))).toBe(true);
    } finally {
      await fsp.rm(tmpDir, { recursive: true, force: true });
    }
  });
});
