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

  it('format-check gate is fast with exact command', () => {
    const g = gate(JAVA_PACK, 'format-check');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toBe('./gradlew checkstyleMain checkstyleTest -q');
  });

  it('lint gate is fast with exact command', () => {
    const g = gate(JAVA_PACK, 'lint');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toBe('./gradlew pmdMain -q');
  });

  it('spell gate is fast with exact command', () => {
    const g = gate(JAVA_PACK, 'spell');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toBe('typos');
  });

  it('build gate is slow with exact command', () => {
    const g = gate(JAVA_PACK, 'build');
    expect(g?.tier).toBe('slow');
    expect(g?.command).toBe('./gradlew build -x test');
  });

  it('test gate is slow with exact command', () => {
    const g = gate(JAVA_PACK, 'test');
    expect(g?.tier).toBe('slow');
    expect(g?.command).toBe('./gradlew test');
  });

  it('ci-full gate is ci tier with exact command', () => {
    const g = gate(JAVA_PACK, 'ci-full');
    expect(g?.tier).toBe('ci');
    expect(g?.command).toBe(
      './gradlew checkstyleMain checkstyleTest -q && ./gradlew pmdMain -q && typos && ./gradlew build -x test && ./gradlew test',
    );
  });

  it('mutation gate is ci tier with exact command', () => {
    const g = gate(JAVA_PACK, 'mutation');
    expect(g?.tier).toBe('ci');
    expect(g?.command).toBe('./gradlew pitest');
  });
});
