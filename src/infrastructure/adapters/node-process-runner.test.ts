import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { NodeProcessRunner } from './node-process-runner.js';

describe('NodeProcessRunner', () => {
  const runner = new NodeProcessRunner();

  it('returns exit code 0 for successful command', async () => {
    const result = await runner.run('node -e "process.exit(0)"');
    expect(result.exitCode).toBe(0);
  });

  it('finds binaries in node_modules/.bin relative to cwd', async () => {
    const projectRoot = path.resolve(import.meta.dirname, '..', '..', '..');
    const result = await runner.run('vitest --version', projectRoot);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toMatch(/\d+\.\d+/);
  });

  it('returns non-zero exit code', async () => {
    const result = await runner.run('node -e "process.exit(42)"');
    expect(result.exitCode).toBe(42);
  });

  it('captures stdout', async () => {
    const result = await runner.run('node -e "process.stdout.write(\'hello\')"');
    expect(result.stdout).toContain('hello');
  });

  it('captures stderr', async () => {
    const result = await runner.run('node -e "process.stderr.write(\'err\')"');
    expect(result.stderr).toContain('err');
  });

  it('kills process and reports timeout when timeoutMs is exceeded', async () => {
    const result = await runner.run('node -e "setTimeout(() => {}, 30000)"', undefined, {
      timeoutMs: 500,
    });
    expect(result.exitCode).not.toBe(0);
    expect(result.stderr).toContain('Gate timed out');
  }, 10_000);
});
