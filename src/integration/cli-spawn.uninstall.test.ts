import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { cli, distExists, initGitRepo, withTempDir } from './cli-spawn-support.js';

const ALL_PACK_INSTALL_ARGS = [
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
] as const;

const PACK_NAMES = [
  'TypeScript',
  'Rust',
  'Python',
  'Go',
  'Java',
  'Kotlin',
  'Ruby',
  '.NET',
  'PHP',
  'Swift',
  'Scala',
  'Elixir',
  'Dart',
  'Haskell',
  'Lua',
  'Zig',
  'OCaml',
];

const REPRESENTATIVE_CONFIGS = [
  'eslint.config.js',
  'clippy.toml',
  '.golangci.yml',
  'pyproject.toml',
  'detekt.yml',
  'Directory.Build.props',
];

function expectInstalledFiles(tmpDir: string): void {
  expect(existsSync(path.join(tmpDir, '.githooks', 'pre-commit'))).toBe(true);
  expect(existsSync(path.join(tmpDir, 'AGENTS.md'))).toBe(true);
  for (const configPath of REPRESENTATIVE_CONFIGS) {
    expect(existsSync(path.join(tmpDir, configPath))).toBe(true);
  }
}

describe('CLI spawn uninstall flows', () => {
  it('removes noslop infrastructure after install and keeps user config', async () => {
    if (!distExists) return;
    await withTempDir('noslop-cli-spawn-remove-', async (tmpDir) => {
      initGitRepo(tmpDir);
      expect(cli(['install', '--pack', 'rust', '--dir', tmpDir]).status).toBe(0);
      expect(existsSync(path.join(tmpDir, '.githooks', 'pre-commit'))).toBe(true);

      const result = cli(['uninstall', '--dir', tmpDir]);
      expect(result.status).toBe(0);
      expect(existsSync(path.join(tmpDir, '.githooks'))).toBe(false);
      expect(existsSync(path.join(tmpDir, 'AGENTS.md'))).toBe(false);
      expect(existsSync(path.join(tmpDir, '.claude'))).toBe(false);
      expect(existsSync(path.join(tmpDir, 'clippy.toml'))).toBe(true);
    });
  });

  it('supports uninstall --json', async () => {
    if (!distExists) return;
    await withTempDir('noslop-cli-spawn-rm-json-', async (tmpDir) => {
      initGitRepo(tmpDir);
      cli(['install', '--pack', 'rust', '--dir', tmpDir]);

      const result = cli(['uninstall', '--json', '--dir', tmpDir]);
      const parsed = JSON.parse(String(result.stdout).trim()) as {
        filesRemoved: string[];
        dirsRemoved: string[];
        hooksReset: boolean;
      };

      expect(result.status).toBe(0);
      expect(Array.isArray(parsed.filesRemoved)).toBe(true);
      expect(Array.isArray(parsed.dirsRemoved)).toBe(true);
      expect(typeof parsed.hooksReset).toBe('boolean');
      expect(parsed.filesRemoved.length).toBeGreaterThan(0);
    });
  });
});

describe('CLI spawn large multi-pack install', () => {
  it('installs all 19 packs into one target directory', async () => {
    if (!distExists) return;
    await withTempDir('noslop-cli-spawn-monorepo-', async (tmpDir) => {
      const result = cli([...ALL_PACK_INSTALL_ARGS, '--dir', tmpDir], undefined);

      expect(result.status).toBe(0);
      for (const name of PACK_NAMES) {
        expect(result.stdout).toContain(name);
      }
      expectInstalledFiles(tmpDir);
    });
  });
});
