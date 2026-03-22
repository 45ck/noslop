import { afterEach, describe, expect, it, vi } from 'vitest';

const mockRun = vi.fn().mockResolvedValue({ exitCode: 0, stdout: '.githooks', stderr: '' });
const mockExists = vi.fn().mockResolvedValue(true);
const mockIsExecutable = vi.fn().mockResolvedValue(true);
const mockReadFile = vi.fn().mockResolvedValue('{}');

vi.mock('../infrastructure/index.js', () => ({
  NodeFilesystem: class {
    exists = mockExists;
    readFile = mockReadFile;
    readdir = vi.fn().mockResolvedValue([]);
    isDirectory = vi.fn().mockResolvedValue(false);
    writeFile = vi.fn();
    copyFile = vi.fn();
    mkdir = vi.fn();
    chmod = vi.fn();
    isExecutable = mockIsExecutable;
  },
  NodeProcessRunner: class {
    run = mockRun;
  },
}));

const { runDoctor } = await import('./doctor-command.js');

describe('runDoctor', () => {
  const exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => {
    throw new Error('process.exit');
  }) as () => never);
  const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('prints human-readable output for healthy repo', async () => {
    await runDoctor({ dir: '/project' });
    const output = logSpy.mock.calls.map((c) => String(c[0])).join('\n');
    expect(output).toContain('noslop doctor');
    expect(output).toContain('All checks passed');
    expect(exitSpy).not.toHaveBeenCalled();
  });

  it('outputs JSON when --json flag is set on healthy repo', async () => {
    await runDoctor({ dir: '/project', json: true });
    const output = logSpy.mock.calls.map((c) => String(c[0])).join('\n');
    const parsed = JSON.parse(output) as {
      healthy: boolean;
      checks: { name: string; passed: boolean; detail: string }[];
    };
    expect(parsed.healthy).toBe(true);
    expect(Array.isArray(parsed.checks)).toBe(true);
    for (const check of parsed.checks) {
      expect(typeof check.name).toBe('string');
      expect(typeof check.passed).toBe('boolean');
      expect(typeof check.detail).toBe('string');
    }
    expect(exitSpy).not.toHaveBeenCalled();
  });

  it('exits 1 and outputs JSON with healthy=false for unhealthy repo', async () => {
    mockExists.mockResolvedValue(false);
    mockRun.mockResolvedValue({ exitCode: 1, stdout: '', stderr: 'not a git repo' });

    await expect(runDoctor({ dir: '/project', json: true })).rejects.toThrow('process.exit');
    const output = logSpy.mock.calls.map((c) => String(c[0])).join('\n');
    const parsed = JSON.parse(output) as { healthy: boolean };
    expect(parsed.healthy).toBe(false);
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it('exits 1 for unhealthy repo in human mode', async () => {
    mockExists.mockResolvedValue(false);
    mockRun.mockResolvedValue({ exitCode: 1, stdout: '', stderr: 'not a git repo' });

    await expect(runDoctor({ dir: '/project' })).rejects.toThrow('process.exit');
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it('suppresses output with quiet flag but still exits 1 on failure', async () => {
    mockExists.mockResolvedValue(false);
    mockRun.mockResolvedValue({ exitCode: 1, stdout: '', stderr: 'not a git repo' });

    await expect(runDoctor({ dir: '/project', quiet: true })).rejects.toThrow('process.exit');
    expect(logSpy).not.toHaveBeenCalled();
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it('suppresses output with quiet flag on healthy repo', async () => {
    mockExists.mockResolvedValue(true);
    mockRun.mockResolvedValue({ exitCode: 0, stdout: '.githooks', stderr: '' });

    await runDoctor({ dir: '/project', quiet: true });
    expect(logSpy).not.toHaveBeenCalled();
    expect(exitSpy).not.toHaveBeenCalled();
  });
});
