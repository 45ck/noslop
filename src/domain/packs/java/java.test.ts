import { describe, expect, it } from 'vitest';
import type { Pack } from '../../pack/pack.js';
import { JAVA_PACK } from './java.js';

const gate = (pack: Pack, label: string) => pack.gates.find((g) => g.label === label);

describe('JAVA_PACK', () => {
  it('has correct id and name', () => {
    expect(JAVA_PACK.id).toBe('java');
    expect(JAVA_PACK.name).toBe('Java');
  });

  it('has 7 gates', () => {
    expect(JAVA_PACK.gates).toHaveLength(7);
  });

  it('format-check gate is fast and uses checkstyle', () => {
    const g = gate(JAVA_PACK, 'format-check');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toContain('checkstyleMain');
  });

  it('lint gate is fast and uses pmd', () => {
    const g = gate(JAVA_PACK, 'lint');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toContain('pmdMain');
  });

  it('spell gate is fast and uses typos', () => {
    const g = gate(JAVA_PACK, 'spell');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toBe('typos');
  });

  it('build gate is slow and uses gradlew build', () => {
    const g = gate(JAVA_PACK, 'build');
    expect(g?.tier).toBe('slow');
    expect(g?.command).toContain('gradlew build');
  });

  it('test gate is slow and uses gradlew test', () => {
    const g = gate(JAVA_PACK, 'test');
    expect(g?.tier).toBe('slow');
    expect(g?.command).toContain('gradlew test');
  });

  it('ci-full includes all fast and slow commands', () => {
    const cmd = gate(JAVA_PACK, 'ci-full')?.command ?? '';
    expect(cmd).toContain('checkstyleMain');
    expect(cmd).toContain('pmdMain');
    expect(cmd).toContain('typos');
    expect(cmd).toContain('build -x test');
    expect(cmd).toContain('./gradlew test');
  });

  it('mutation gate is ci tier and uses pitest', () => {
    const g = gate(JAVA_PACK, 'mutation');
    expect(g?.tier).toBe('ci');
    expect(g?.command).toContain('pitest');
  });
});
