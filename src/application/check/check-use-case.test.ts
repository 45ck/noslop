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

function makePack(gates: Parameters<typeof createPack>[2]) {
  return createPack('ts', 'TS', gates);
}

describe('check use case basics', () => {
  it('passes with no packs', async () => {
    const runner = new InMemoryProcessRunner();
    const result = await check(makeCommand(), runner);
    expect(result.passed).toBe(true);
    expect(result.outcomes).toHaveLength(0);
  });

  it('runs gates matching the requested tier', async () => {
    const pack = makePack([
      createGate('lint', 'eslint .', 'fast'),
      createGate('test', 'vitest run', 'slow'),
    ]);
    const runner = new InMemoryProcessRunner({ 'eslint .': 0, 'vitest run': 0 });

    const result = await check(makeCommand({ packs: [pack], tier: 'fast' }), runner);
    expect(result.outcomes).toHaveLength(1);
    expect(result.outcomes[0]?.label).toBe('lint');
  });

  it('passes when all gate exit codes are 0', async () => {
    const pack = makePack([
      createGate('fmt', 'prettier .', 'fast'),
      createGate('lint', 'eslint .', 'fast'),
    ]);
    const runner = new InMemoryProcessRunner({ 'prettier .': 0, 'eslint .': 0 });

    const result = await check(makeCommand({ packs: [pack], tier: 'fast' }), runner);
    expect(result.passed).toBe(true);
  });

  it('fails when any gate has non-zero exit code', async () => {
    const pack = makePack([
      createGate('fmt', 'prettier .', 'fast'),
      createGate('lint', 'eslint .', 'fast'),
    ]);
    const runner = new InMemoryProcessRunner({ 'prettier .': 0, 'eslint .': 1 });

    const result = await check(makeCommand({ packs: [pack], tier: 'fast' }), runner);
    expect(result.passed).toBe(false);
    expect(result.outcomes.find((outcome) => outcome.label === 'lint')?.passed).toBe(false);
    expect(result.outcomes.find((outcome) => outcome.label === 'fmt')?.passed).toBe(true);
  });

  it('runs gates from multiple packs', async () => {
    const tsPack = makePack([createGate('lint', 'eslint .', 'fast')]);
    const rustPack = createPack('rust', 'Rust', [createGate('clippy', 'cargo clippy', 'fast')]);
    const runner = new InMemoryProcessRunner({ 'eslint .': 0, 'cargo clippy': 0 });

    const result = await check(makeCommand({ packs: [tsPack, rustPack], tier: 'fast' }), runner);
    expect(result.outcomes).toHaveLength(2);
    expect(result.passed).toBe(true);
  });
});

describe('check use case result details', () => {
  it('returns outcomes with command and result info', async () => {
    const pack = makePack([createGate('lint', 'eslint .', 'fast')]);
    const runner = new InMemoryProcessRunner({ 'eslint .': 0 });

    const result = await check(makeCommand({ packs: [pack], tier: 'fast' }), runner);
    const outcome = result.outcomes[0];
    expect(outcome?.command).toBe('eslint .');
    expect(outcome?.result.exitCode).toBe(0);
  });

  it('calls onGateStart listener before each gate', async () => {
    const pack = makePack([
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
    const pack = makePack([createGate('lint', 'eslint .', 'fast')]);
    const capturedOptions: ({ timeoutMs?: number } | undefined)[] = [];
    const runner = {
      run: async (_cmd: string, _cwd?: string, options?: { timeoutMs?: number }) => {
        capturedOptions.push(options);
        return { exitCode: 0, stdout: '', stderr: '' };
      },
    };

    await check(makeCommand({ packs: [pack], tier: 'fast', timeoutMs: 600000 }), runner);
    expect(capturedOptions[0]?.timeoutMs).toBe(600000);
  });

  it('does not pass options when timeoutMs is undefined', async () => {
    const pack = makePack([createGate('lint', 'eslint .', 'fast')]);
    const capturedOptions: ({ timeoutMs?: number } | undefined)[] = [];
    const runner = {
      run: async (_cmd: string, _cwd?: string, options?: { timeoutMs?: number }) => {
        capturedOptions.push(options);
        return { exitCode: 0, stdout: '', stderr: '' };
      },
    };

    await check(makeCommand({ packs: [pack], tier: 'fast' }), runner);
    expect(capturedOptions[0]).toBeUndefined();
  });
});

describe('check use case runner failures', () => {
  it('records failure with stderr when runner throws an Error', async () => {
    const pack = makePack([createGate('lint', 'eslint .', 'fast')]);
    const runner = {
      run: async () => {
        throw new Error('spawn ENOENT');
      },
    };

    const result = await check(makeCommand({ packs: [pack], tier: 'fast' }), runner);
    expect(result.passed).toBe(false);
    expect(result.outcomes[0]?.result.exitCode).toBe(1);
    expect(result.outcomes[0]?.result.stderr).toBe('spawn ENOENT');
    expect(result.outcomes[0]?.result.stderr).not.toContain('Error:');
  });

  it('records failure with stderr when runner throws a non-Error value', async () => {
    const pack = makePack([createGate('lint', 'eslint .', 'fast')]);
    const runner = {
      run: async () => {
        throw 'plain string error';
      },
    };

    const result = await check(makeCommand({ packs: [pack], tier: 'fast' }), runner);
    expect(result.passed).toBe(false);
    expect(result.outcomes[0]?.result.exitCode).toBe(1);
    expect(result.outcomes[0]?.result.stderr).toBe('plain string error');
  });
});
