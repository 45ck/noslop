import { describe, expect, it } from 'vitest';
import type { Pack } from '../../pack/pack.js';
import { DART_PACK } from './dart.js';

const gate = (pack: Pack, label: string) => pack.gates.find((g) => g.label === label);

describe('DART_PACK', () => {
  it('has correct id and name', () => {
    expect(DART_PACK.id).toBe('dart');
    expect(DART_PACK.name).toBe('Dart');
  });

  it('has 5 gates', () => {
    expect(DART_PACK.gates).toHaveLength(5);
  });

  it('format-check gate is fast with exact command', () => {
    const g = gate(DART_PACK, 'format-check');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toBe('dart format --output=none --set-exit-if-changed .');
  });

  it('lint gate is fast with exact command', () => {
    const g = gate(DART_PACK, 'lint');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toBe('dart analyze');
  });

  it('spell gate is fast with exact command', () => {
    const g = gate(DART_PACK, 'spell');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toBe('typos');
  });

  it('test gate is slow with exact command', () => {
    const g = gate(DART_PACK, 'test');
    expect(g?.tier).toBe('slow');
    expect(g?.command).toBe('dart test');
  });

  it('ci-full gate is ci tier with exact command', () => {
    const g = gate(DART_PACK, 'ci-full');
    expect(g?.tier).toBe('ci');
    expect(g?.command).toBe(
      'dart format --output=none --set-exit-if-changed . && dart analyze && typos && dart test',
    );
  });

  it('has no mutation gate', () => {
    expect(gate(DART_PACK, 'mutation')).toBeUndefined();
  });
});
