import { describe, expect, it } from 'vitest';
import { InMemoryProcessRunner } from './in-memory-process-runner.js';

describe('InMemoryProcessRunner', () => {
  it('returns exit code 0 by default for unknown commands', async () => {
    const runner = new InMemoryProcessRunner();
    const result = await runner.run('unknown');
    expect(result.exitCode).toBe(0);
  });

  it('returns configured exit code for registered command', async () => {
    const runner = new InMemoryProcessRunner({ 'cargo test': 1 });
    const result = await runner.run('cargo test');
    expect(result.exitCode).toBe(1);
  });

  it('returns empty stdout by default', async () => {
    const runner = new InMemoryProcessRunner();
    const result = await runner.run('cmd');
    expect(result.stdout).toBe('');
  });

  it('returns configured stdout when setStdout is called', async () => {
    const runner = new InMemoryProcessRunner();
    runner.setStdout('git config', 'main');
    const result = await runner.run('git config');
    expect(result.stdout).toBe('main');
  });

  it('returns empty stderr by default', async () => {
    const runner = new InMemoryProcessRunner();
    const result = await runner.run('cmd');
    expect(result.stderr).toBe('');
  });

  it('returns configured stderr when setStderr is called', async () => {
    const runner = new InMemoryProcessRunner();
    runner.setStderr('eslint .', 'error on line 1');
    const result = await runner.run('eslint .');
    expect(result.stderr).toBe('error on line 1');
  });

  it('ignores cwd parameter', async () => {
    const runner = new InMemoryProcessRunner({ cmd: 0 });
    const result = await runner.run('cmd', '/some/dir');
    expect(result.exitCode).toBe(0);
  });
});
