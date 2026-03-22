import { afterEach, describe, expect, it, vi } from 'vitest';

const mockRun = vi.fn().mockResolvedValue({ exitCode: 0, stdout: '', stderr: '' });
const mockExists = vi.fn().mockResolvedValue(false);
const mockRm = vi.fn().mockResolvedValue(undefined);
const mockRmdir = vi.fn().mockResolvedValue(undefined);
const mockReaddir = vi.fn().mockResolvedValue([]);

vi.mock('../infrastructure/index.js', () => ({
  NodeFilesystem: class {
    exists = mockExists;
    readFile = vi.fn();
    readdir = mockReaddir;
    isDirectory = vi.fn().mockResolvedValue(false);
    writeFile = vi.fn();
    copyFile = vi.fn();
    mkdir = vi.fn();
    chmod = vi.fn();
    isExecutable = vi.fn().mockResolvedValue(true);
    rm = mockRm;
    rmdir = mockRmdir;
  },
  NodeProcessRunner: class {
    run = mockRun;
  },
}));

const { runUninstall } = await import('./uninstall-command.js');

describe('runUninstall', () => {
  const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('prints nothing-to-remove when no infrastructure is found', async () => {
    await runUninstall({ dir: '/project' });
    const output = logSpy.mock.calls.map((c) => String(c[0])).join('\n');
    expect(output).toContain('Nothing to remove');
  });

  it('outputs JSON when --json flag is set', async () => {
    await runUninstall({ dir: '/project', json: true });
    const output = logSpy.mock.calls.map((c) => String(c[0])).join('\n');
    const parsed = JSON.parse(output) as {
      filesRemoved: string[];
      dirsRemoved: string[];
      hooksReset: boolean;
    };
    expect(Array.isArray(parsed.filesRemoved)).toBe(true);
    expect(Array.isArray(parsed.dirsRemoved)).toBe(true);
    expect(typeof parsed.hooksReset).toBe('boolean');
  });

  it('suppresses all output with --quiet flag', async () => {
    await runUninstall({ dir: '/project', quiet: true });
    expect(logSpy).not.toHaveBeenCalled();
  });

  it('lists removed items in human mode when infrastructure exists', async () => {
    mockExists.mockResolvedValue(true);
    mockReaddir.mockResolvedValue([]);

    await runUninstall({ dir: '/project' });
    const output = logSpy.mock.calls.map((c) => String(c[0])).join('\n');
    expect(output).toContain('Removed');
  });
});
