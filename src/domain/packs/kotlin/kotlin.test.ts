import { describe, expect, it } from 'vitest';
import type { Pack } from '../../pack/pack.js';
import { KOTLIN_PACK } from './kotlin.js';

const gate = (pack: Pack, label: string) => pack.gates.find((g) => g.label === label);

describe('KOTLIN_PACK', () => {
  it('has correct id and name', () => {
    expect(KOTLIN_PACK.id).toBe('kotlin');
    expect(KOTLIN_PACK.name).toBe('Kotlin');
  });

  it('has 7 gates', () => {
    expect(KOTLIN_PACK.gates).toHaveLength(7);
  });

  it('format-check gate is fast and uses ktlintCheck', () => {
    const g = gate(KOTLIN_PACK, 'format-check');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toContain('ktlintCheck');
  });

  it('lint gate is fast and uses detekt', () => {
    const g = gate(KOTLIN_PACK, 'lint');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toContain('detekt');
  });

  it('spell gate is fast and uses typos', () => {
    const g = gate(KOTLIN_PACK, 'spell');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toBe('typos');
  });

  it('build gate is slow and uses gradlew build', () => {
    const g = gate(KOTLIN_PACK, 'build');
    expect(g?.tier).toBe('slow');
    expect(g?.command).toContain('gradlew build');
  });

  it('test gate is slow and uses gradlew test', () => {
    const g = gate(KOTLIN_PACK, 'test');
    expect(g?.tier).toBe('slow');
    expect(g?.command).toContain('gradlew test');
  });

  it('ci-full includes all fast and slow commands', () => {
    const cmd = gate(KOTLIN_PACK, 'ci-full')?.command ?? '';
    expect(cmd).toContain('ktlintCheck');
    expect(cmd).toContain('detekt');
    expect(cmd).toContain('typos');
    expect(cmd).toContain('build -x test');
    expect(cmd).toContain('./gradlew test');
  });

  it('mutation gate is ci tier and uses pitest', () => {
    const g = gate(KOTLIN_PACK, 'mutation');
    expect(g?.tier).toBe('ci');
    expect(g?.command).toContain('pitest');
  });
});
