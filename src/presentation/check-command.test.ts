import { afterEach, describe, expect, it, vi } from 'vitest';
import type { CheckOptions } from './check-command.js';

const mockRun = vi.fn().mockResolvedValue({ exitCode: 0, stdout: 'ok', stderr: '' });
const mockExists = vi.fn().mockResolvedValue(false);

vi.mock('../infrastructure/index.js', () => ({
  NodeFilesystem: class {
    exists = mockExists;
    readFile = vi.fn();
    readdir = vi.fn().mockResolvedValue([]);
    isDirectory = vi.fn().mockResolvedValue(false);
    writeFile = vi.fn();
    copyFile = vi.fn();
    mkdir = vi.fn();
    chmod = vi.fn();
  },
  NodeProcessRunner: class {
    run = mockRun;
  },
}));

const { runCheck } = await import('./check-command.js');

describe('runCheck', () => {
  const exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => {
    throw new Error('process.exit');
  }) as () => never);
  const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  const stderrSpy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);

  afterEach(() => {
    vi.clearAllMocks();
  });

  function makeOptions(overrides: Partial<CheckOptions> = {}): CheckOptions {
    return {
      dir: '/project',
      tier: 'fast',
      spell: true,
      skipGate: [],
      ...overrides,
    };
  }

  it('exits 2 with error for invalid tier (config error)', async () => {
    await expect(runCheck(makeOptions({ tier: 'invalid' }))).rejects.toThrow('process.exit');
    expect(exitSpy).toHaveBeenCalledWith(2);
    const errOutput = errorSpy.mock.calls.map((c) => String(c[0])).join('');
    expect(errOutput).toContain('Unknown tier');
  });

  it('runs check and prints passing result', async () => {
    await runCheck(makeOptions());
    const output = logSpy.mock.calls.map((c) => String(c[0])).join('\n');
    expect(output).toContain('noslop check --tier=fast');
  });

  it('outputs JSON when --json flag is set', async () => {
    await runCheck(makeOptions({ json: true }));
    const output = logSpy.mock.calls.map((c) => String(c[0])).join('\n');
    const parsed = JSON.parse(output) as { passed: boolean; tier: string; gates: unknown[] };
    expect(parsed.passed).toBe(true);
    expect(parsed.tier).toBe('fast');
    expect(Array.isArray(parsed.gates)).toBe(true);
  });

  it('shows debug output when --debug flag is set', async () => {
    await runCheck(makeOptions({ debug: true }));
    const stderrOutput = stderrSpy.mock.calls.map((c) => String(c[0])).join('');
    expect(stderrOutput).toContain('[debug] cwd');
    expect(stderrOutput).toContain('[debug] packs');
  });

  it('shows verbose output for passing gates', async () => {
    await runCheck(makeOptions({ verbose: true }));
    const output = logSpy.mock.calls.map((c) => String(c[0])).join('\n');
    expect(output).toContain('All gates passed');
  });

  it('skips spell gate when --no-spell is used', async () => {
    await runCheck(makeOptions({ spell: false }));
    expect(exitSpy).not.toHaveBeenCalled();
  });

  it('handles --skip-gate option', async () => {
    await runCheck(makeOptions({ skipGate: ['mutation'] }));
    expect(exitSpy).not.toHaveBeenCalled();
  });
});
