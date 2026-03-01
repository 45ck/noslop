import { describe, expect, it } from 'vitest';
import {
  createGate,
  gatesForTier,
  isCi,
  isFast,
  isSlow,
  type Gate,
  type GateTier,
} from './gate.js';

describe('createGate', () => {
  it('creates a gate with valid inputs', () => {
    const gate = createGate('lint', 'eslint .', 'fast');
    expect(gate.label).toBe('lint');
    expect(gate.command).toBe('eslint .');
    expect(gate.tier).toBe('fast');
  });

  it('throws when label is empty', () => {
    expect(() => createGate('', 'eslint .', 'fast')).toThrow('Gate label must not be empty.');
  });

  it('throws when label is whitespace only', () => {
    expect(() => createGate('   ', 'eslint .', 'fast')).toThrow('Gate label must not be empty.');
  });

  it('throws when command is empty', () => {
    expect(() => createGate('lint', '', 'fast')).toThrow('Gate command must not be empty.');
  });

  it('throws when command is whitespace only', () => {
    expect(() => createGate('lint', '   ', 'fast')).toThrow('Gate command must not be empty.');
  });

  it('accepts all tier values', () => {
    expect(createGate('a', 'cmd', 'fast').tier).toBe('fast');
    expect(createGate('b', 'cmd', 'slow').tier).toBe('slow');
    expect(createGate('c', 'cmd', 'ci').tier).toBe('ci');
  });

  it('throws when tier is invalid', () => {
    const invalidTier = 'invalid' as GateTier;
    expect(() => createGate('lint', 'eslint .', invalidTier)).toThrow(
      "Invalid gate tier 'invalid'. Must be one of: fast, slow, ci.",
    );
  });
});

describe('tier predicates', () => {
  const fast = createGate('fmt', 'prettier .', 'fast');
  const slow = createGate('test', 'vitest run', 'slow');
  const ci = createGate('full', 'npm run ci', 'ci');

  it('isFast returns true only for fast gates', () => {
    expect(isFast(fast)).toBe(true);
    expect(isFast(slow)).toBe(false);
    expect(isFast(ci)).toBe(false);
  });

  it('isSlow returns true only for slow gates', () => {
    expect(isSlow(slow)).toBe(true);
    expect(isSlow(fast)).toBe(false);
    expect(isSlow(ci)).toBe(false);
  });

  it('isCi returns true only for ci gates', () => {
    expect(isCi(ci)).toBe(true);
    expect(isCi(fast)).toBe(false);
    expect(isCi(slow)).toBe(false);
  });
});

describe('gatesForTier', () => {
  const gates: Gate[] = [
    createGate('fmt', 'prettier .', 'fast'),
    createGate('lint', 'eslint .', 'fast'),
    createGate('test', 'vitest run', 'slow'),
    createGate('ci', 'npm run ci', 'ci'),
  ];

  it('returns only fast gates', () => {
    const result = gatesForTier(gates, 'fast');
    expect(result).toHaveLength(2);
    expect(result.every((g) => g.tier === 'fast')).toBe(true);
  });

  it('returns only slow gates', () => {
    const result = gatesForTier(gates, 'slow');
    expect(result).toHaveLength(1);
    expect(result[0]?.label).toBe('test');
  });

  it('returns only ci gates', () => {
    const result = gatesForTier(gates, 'ci');
    expect(result).toHaveLength(1);
    expect(result[0]?.label).toBe('ci');
  });

  it('returns empty array when no gates match', () => {
    expect(gatesForTier([], 'fast')).toHaveLength(0);
  });
});
