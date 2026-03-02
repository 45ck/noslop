import { describe, expect, it } from 'vitest';
import type { Pack } from '../../pack/pack.js';
import { SWIFT_PACK } from './swift.js';

const gate = (pack: Pack, label: string) => pack.gates.find((g) => g.label === label);

describe('SWIFT_PACK', () => {
  it('has correct id and name', () => {
    expect(SWIFT_PACK.id).toBe('swift');
    expect(SWIFT_PACK.name).toBe('Swift');
  });

  it('has 6 gates', () => {
    expect(SWIFT_PACK.gates).toHaveLength(6);
  });

  it('format-check gate is fast with exact command', () => {
    const g = gate(SWIFT_PACK, 'format-check');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toBe('swift-format lint --recursive .');
  });

  it('lint gate is fast with exact command', () => {
    const g = gate(SWIFT_PACK, 'lint');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toBe('swiftlint lint');
  });

  it('spell gate is fast with exact command', () => {
    const g = gate(SWIFT_PACK, 'spell');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toBe('typos');
  });

  it('build gate is slow with exact command', () => {
    const g = gate(SWIFT_PACK, 'build');
    expect(g?.tier).toBe('slow');
    expect(g?.command).toBe('swift build');
  });

  it('test gate is slow with exact command', () => {
    const g = gate(SWIFT_PACK, 'test');
    expect(g?.tier).toBe('slow');
    expect(g?.command).toBe('swift test');
  });

  it('ci-full gate is ci tier with exact command', () => {
    const g = gate(SWIFT_PACK, 'ci-full');
    expect(g?.tier).toBe('ci');
    expect(g?.command).toBe(
      'swift-format lint --recursive . && swiftlint lint && typos && swift build && swift test',
    );
  });

  it('has no mutation gate', () => {
    expect(gate(SWIFT_PACK, 'mutation')).toBeUndefined();
  });
});
