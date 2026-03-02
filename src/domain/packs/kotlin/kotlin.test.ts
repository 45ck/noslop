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

  it('format-check gate is fast with exact command', () => {
    const g = gate(KOTLIN_PACK, 'format-check');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toBe('./gradlew ktlintCheck');
  });

  it('lint gate is fast with exact command', () => {
    const g = gate(KOTLIN_PACK, 'lint');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toBe('./gradlew detekt');
  });

  it('spell gate is fast with exact command', () => {
    const g = gate(KOTLIN_PACK, 'spell');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toBe('typos');
  });

  it('build gate is slow with exact command', () => {
    const g = gate(KOTLIN_PACK, 'build');
    expect(g?.tier).toBe('slow');
    expect(g?.command).toBe('./gradlew build -x test');
  });

  it('test gate is slow with exact command', () => {
    const g = gate(KOTLIN_PACK, 'test');
    expect(g?.tier).toBe('slow');
    expect(g?.command).toBe('./gradlew test');
  });

  it('ci-full gate is ci tier with exact command', () => {
    const g = gate(KOTLIN_PACK, 'ci-full');
    expect(g?.tier).toBe('ci');
    expect(g?.command).toBe(
      './gradlew ktlintCheck detekt && typos && ./gradlew build -x test && ./gradlew test',
    );
  });

  it('mutation gate is ci tier with exact command', () => {
    const g = gate(KOTLIN_PACK, 'mutation');
    expect(g?.tier).toBe('ci');
    expect(g?.command).toBe('./gradlew pitest');
  });
});
