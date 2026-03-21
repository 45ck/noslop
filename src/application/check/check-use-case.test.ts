import { describe, expect, it } from 'vitest';
import { check } from './check-use-case.js';
import type { CheckCommand } from './check-use-case.js';
import { createPack } from '../../domain/pack/pack.js';
import { createGate } from '../../domain/gate/gate.js';
import { InMemoryProcessRunner } from '../../infrastructure/adapters/in-memory-process-runner.js';

function makeCommand(overrides: Partial<CheckCommand> = {}): CheckCommand {
  return {
    targetDir: '/target',
    packs: [],
    tier: 'fast',
    ...overrides,
  };
}

describe('check use case', () => {
  it('passes with no packs', async () => {
    const runner = new InMemoryProcessRunner();
    const result = await check(makeCommand(), runner);
    expect(result.passed).toBe(true);
    expect(result.outcomes).toHaveLength(0);
  });

  it('runs gates matching the requested tier', async () => {
    const pack = createPack('ts', 'TS', [
      createGate('lint', 'eslint .', 'fast'),
      createGate('test', 'vitest run', 'slow'),
    ]);
    const runner = new InMemoryProcessRunner({ 'eslint .': 0, 'vitest run': 0 });

    const result = await check(makeCommand({ packs: [pack], tier: 'fast' }), runner);
    expect(result.outcomes).toHaveLength(1);
    expect(result.outcomes[0]?.label).toBe('lint');
  });

  it('passes when all gate exit codes are 0', async () => {
    const pack = createPack('ts', 'TS', [
      createGate('fmt', 'prettier .', 'fast'),
      createGate('lint', 'eslint .', 'fast'),
    ]);
    const runner = new InMemoryProcessRunner({ 'prettier .': 0, 'eslint .': 0 });

    const result = await check(makeCommand({ packs: [pack], tier: 'fast' }), runner);
    expect(result.passed).toBe(true);
  });

  it('fails when any gate has non-zero exit code', async () => {
    const pack = createPack('ts', 'TS', [
      createGate('fmt', 'prettier .', 'fast'),
      createGate('lint', 'eslint .', 'fast'),
    ]);
    const runner = new InMemoryProcessRunner({ 'prettier .': 0, 'eslint .': 1 });

    const result = await check(makeCommand({ packs: [pack], tier: 'fast' }), runner);
    expect(result.passed).toBe(false);
    expect(result.outcomes.find((o) => o.label === 'lint')?.passed).toBe(false);
    expect(result.outcomes.find((o) => o.label === 'fmt')?.passed).toBe(true);
  });

  it('runs gates from multiple packs', async () => {
    const ts = createPack('ts', 'TS', [createGate('lint', 'eslint .', 'fast')]);
    const rust = createPack('rust', 'Rust', [createGate('clippy', 'cargo clippy', 'fast')]);
    const runner = new InMemoryProcessRunner({ 'eslint .': 0, 'cargo clippy': 0 });

    const result = await check(makeCommand({ packs: [ts, rust], tier: 'fast' }), runner);
    expect(result.outcomes).toHaveLength(2);
    expect(result.passed).toBe(true);
  });

  it('returns outcomes with command and result info', async () => {
    const pack = createPack('ts', 'TS', [createGate('lint', 'eslint .', 'fast')]);
    const runner = new InMemoryProcessRunner({ 'eslint .': 0 });

    const result = await check(makeCommand({ packs: [pack], tier: 'fast' }), runner);
    const outcome = result.outcomes[0];
    expect(outcome?.command).toBe('eslint .');
    expect(outcome?.result.exitCode).toBe(0);
  });

  it('records failure with stderr when runner throws (M6)', async () => {
    const pack = createPack('ts', 'TS', [createGate('lint', 'eslint .', 'fast')]);
    const throwingRunner = {
      run: async () => {
        throw new Error('spawn ENOENT');
      },
    };

    const result = await check(makeCommand({ packs: [pack], tier: 'fast' }), throwingRunner);
    expect(result.passed).toBe(false);
    expect(result.outcomes[0]?.result.exitCode).toBe(1);
    // stderr must be exactly the Error message — no "Error: " prefix — killing the
    // `err instanceof Error` branch mutant (if branch were removed, String(err) would
    // produce "Error: spawn ENOENT" which does NOT equal the bare message).
    expect(result.outcomes[0]?.result.stderr).toBe('spawn ENOENT');
    expect(result.outcomes[0]?.result.stderr).not.toContain('Error:');
  });

  it('calls onGateStart listener before each gate', async () => {
    const pack = createPack('ts', 'TS', [
      createGate('fmt', 'prettier .', 'fast'),
      createGate('lint', 'eslint .', 'fast'),
    ]);
    const runner = new InMemoryProcessRunner({ 'prettier .': 0, 'eslint .': 0 });

    const started: string[] = [];
    const listener = { onGateStart: (label: string) => started.push(label) };
    await check(makeCommand({ packs: [pack], tier: 'fast' }), runner, listener);
    expect(started).toEqual(['fmt', 'lint']);
  });

  it('passes timeoutMs to runner when configured', async () => {
    const pack = createPack('ts', 'TS', [createGate('lint', 'eslint .', 'fast')]);
    const capturedOptions: ({ timeoutMs?: number } | undefined)[] = [];
    const capturingRunner = {
      run: async (_cmd: string, _cwd?: string, options?: { timeoutMs?: number }) => {
        capturedOptions.push(options);
        return { exitCode: 0, stdout: '', stderr: '' };
      },
    };

    await check(makeCommand({ packs: [pack], tier: 'fast', timeoutMs: 600000 }), capturingRunner);
    expect(capturedOptions[0]?.timeoutMs).toBe(600000);
  });

  it('does not pass options when timeoutMs is undefined', async () => {
    const pack = createPack('ts', 'TS', [createGate('lint', 'eslint .', 'fast')]);
    const capturedOptions: ({ timeoutMs?: number } | undefined)[] = [];
    const capturingRunner = {
      run: async (_cmd: string, _cwd?: string, options?: { timeoutMs?: number }) => {
        capturedOptions.push(options);
        return { exitCode: 0, stdout: '', stderr: '' };
      },
    };

    await check(makeCommand({ packs: [pack], tier: 'fast' }), capturingRunner);
    expect(capturedOptions[0]).toBeUndefined();
  });

  it('records failure with stderr when runner throws a non-Error value', async () => {
    const pack = createPack('ts', 'TS', [createGate('lint', 'eslint .', 'fast')]);
    const throwingRunner = {
      run: async () => {
        throw 'plain string error';
      },
    };

    const result = await check(makeCommand({ packs: [pack], tier: 'fast' }), throwingRunner);
    expect(result.passed).toBe(false);
    expect(result.outcomes[0]?.result.exitCode).toBe(1);
    // When thrown value is not an Error, String(value) is used directly
    expect(result.outcomes[0]?.result.stderr).toBe('plain string error');
  });
});
