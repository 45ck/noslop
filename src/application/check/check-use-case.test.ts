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
});
