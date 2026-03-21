import { describe, expect, it } from 'vitest';
import { DryRunProcessRunner } from './dry-run-process-runner.js';

describe('DryRunProcessRunner', () => {
  it('starts with empty commands', () => {
    const runner = new DryRunProcessRunner();
    expect(runner.commands).toEqual([]);
  });

  it('records the command and returns success', async () => {
    const runner = new DryRunProcessRunner();
    const result = await runner.run('git config core.hooksPath .githooks', '/project');
    expect(result).toEqual({ exitCode: 0, stdout: '', stderr: '' });
    expect(runner.commands).toEqual(['git config core.hooksPath .githooks']);
  });

  it('records multiple commands in order', async () => {
    const runner = new DryRunProcessRunner();
    await runner.run('npm install');
    await runner.run('npm test');
    expect(runner.commands).toEqual(['npm install', 'npm test']);
  });
});
