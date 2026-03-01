import { describe, expect, it } from 'vitest';
import { NodeProcessRunner } from './node-process-runner.js';

describe('NodeProcessRunner', () => {
  const runner = new NodeProcessRunner();

  it('returns exit code 0 for successful command', async () => {
    const result = await runner.run('node -e "process.exit(0)"');
    expect(result.exitCode).toBe(0);
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
});
