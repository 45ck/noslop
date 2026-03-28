import { describe, expect, it } from 'vitest';
import {
  cli,
  distExists,
  initGitRepo,
  readPackageVersion,
  withTempDir,
} from './cli-spawn-support.js';

describe('CLI spawn smoke tests', () => {
  it('dist/presentation/cli.js exists when the build has run', () => {
    expect(distExists).toBe(true);
  });

  it('prints help and version output', () => {
    if (!distExists) return;
    const help = cli(['--help']);
    expect(help.status).toBe(0);
    for (const command of [
      'init',
      'install',
      'update',
      'list',
      'check',
      'doctor',
      'uninstall',
      'setup',
    ]) {
      expect(help.stdout).toContain(command);
    }
    expect(help.stdout).toContain('Exit codes:');

    const version = cli(['--version']);
    expect(version.status).toBe(0);
    expect(String(version.stdout).trim()).toBe(readPackageVersion());
  });

  it(
    'returns config errors for missing directories and unhealthy empty repos',
    { timeout: 20_000 },
    async () => {
      if (!distExists) return;
      const missingDir = cli(['doctor', '--dir', '/tmp/noslop-nonexistent-dir-xyz']);
      expect(missingDir.status).toBe(2);
      expect(missingDir.stderr).toContain('directory does not exist');

      await withTempDir('noslop-cli-spawn-empty-', async (tmpDir) => {
        const result = cli(['doctor', '--dir', tmpDir]);
        expect(result.status).toBe(1);
      });
    },
  );
});

describe('CLI spawn install and doctor flows', () => {
  it('installs rust and repeated multi-pack repos', { timeout: 20_000 }, async () => {
    if (!distExists) return;

    await withTempDir('noslop-cli-spawn-rust-', async (tmpDir) => {
      initGitRepo(tmpDir);
      const result = cli(['install', '--pack', 'rust', '--dir', tmpDir]);
      expect(result.status).toBe(0);
      expect(result.stdout).toContain('Rust');
    });

    await withTempDir('noslop-cli-spawn-multi-', async (tmpDir) => {
      initGitRepo(tmpDir);
      const result = cli(['install', '--pack', 'typescript', '--pack', 'rust', '--dir', tmpDir]);
      expect(result.status).toBe(0);
      expect(result.stdout).toContain('TypeScript');
      expect(result.stdout).toContain('Rust');
    });
  });

  it('updates existing repos without overwriting user config', { timeout: 20_000 }, async () => {
    if (!distExists) return;
    await withTempDir('noslop-cli-spawn-update-', async (tmpDir) => {
      initGitRepo(tmpDir);
      cli(['install', '--pack', 'typescript', '--dir', tmpDir]);
      const configPath = `${tmpDir}/eslint.config.js`;
      await import('node:fs/promises').then((fs) =>
        fs.writeFile(configPath, '// my custom config'),
      );

      const result = cli(['update', '--pack', 'typescript', '--dir', tmpDir]);
      expect(result.status).toBe(0);
      expect(result.stdout).toContain('noslop update');
      await expect(
        import('node:fs/promises').then((fs) => fs.readFile(configPath, 'utf8')),
      ).resolves.toBe('// my custom config');
    });
  });

  it(
    'runs doctor successfully on installed repos and emits JSON when requested',
    { timeout: 20_000 },
    async () => {
      if (!distExists) return;

      await withTempDir('noslop-cli-spawn-doctor-json-', async (tmpDir) => {
        initGitRepo(tmpDir);
        cli(['install', '--pack', 'rust', '--dir', tmpDir]);
        const result = cli(['doctor', '--json', '--dir', tmpDir]);
        const parsed = JSON.parse(String(result.stdout).trim()) as {
          healthy: boolean;
          checks: { name: string; passed: boolean; detail: string }[];
        };
        expect(result.status).toBe(0);
        expect(typeof parsed.healthy).toBe('boolean');
        expect(Array.isArray(parsed.checks)).toBe(true);
      });

      await withTempDir('noslop-cli-spawn-ts-', async (tmpDir) => {
        initGitRepo(tmpDir);
        expect(cli(['install', '--pack', 'typescript', '--dir', tmpDir]).status).toBe(0);
        expect(cli(['doctor', '--dir', tmpDir]).status).toBe(0);
      });
    },
  );
});

describe('CLI spawn dry-run and quiet output', () => {
  it('supports install --dry-run and install --quiet', { timeout: 20_000 }, async () => {
    if (!distExists) return;

    await withTempDir('noslop-cli-spawn-dryrun-', async (tmpDir) => {
      const dryRun = cli(['install', '--pack', 'rust', '--dry-run', '--dir', tmpDir]);
      expect(dryRun.status).toBe(0);
      expect(dryRun.stdout).toContain('[dry-run]');
      expect(dryRun.stdout).toContain('No files were written');
      await expect(import('node:fs/promises').then((fs) => fs.readdir(tmpDir))).resolves.toEqual(
        [],
      );
    });

    await withTempDir('noslop-cli-spawn-quiet-', async (tmpDir) => {
      initGitRepo(tmpDir);
      const quiet = cli(['install', '--quiet', '--pack', 'rust', '--dir', tmpDir]);
      expect(quiet.status).toBe(0);
      expect(String(quiet.stdout).trim()).toBe('');
    });
  });
});
