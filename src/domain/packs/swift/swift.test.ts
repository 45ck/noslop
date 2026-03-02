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

  it('format-check gate is fast and uses swift-format', () => {
    const g = gate(SWIFT_PACK, 'format-check');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toContain('swift-format');
  });

  it('lint gate is fast and uses swiftlint', () => {
    const g = gate(SWIFT_PACK, 'lint');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toContain('swiftlint');
  });

  it('spell gate is fast and uses typos', () => {
    const g = gate(SWIFT_PACK, 'spell');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toBe('typos');
  });

  it('build gate is slow and uses swift build', () => {
    const g = gate(SWIFT_PACK, 'build');
    expect(g?.tier).toBe('slow');
    expect(g?.command).toContain('swift build');
  });

  it('test gate is slow and uses swift test', () => {
    const g = gate(SWIFT_PACK, 'test');
    expect(g?.tier).toBe('slow');
    expect(g?.command).toContain('swift test');
  });

  it('ci-full includes all fast and slow commands', () => {
    const cmd = gate(SWIFT_PACK, 'ci-full')?.command ?? '';
    expect(cmd).toContain('swift-format');
    expect(cmd).toContain('swiftlint');
    expect(cmd).toContain('typos');
    expect(cmd).toContain('swift build');
    expect(cmd).toContain('swift test');
  });

  it('has no mutation gate', () => {
    expect(gate(SWIFT_PACK, 'mutation')).toBeUndefined();
  });
});
