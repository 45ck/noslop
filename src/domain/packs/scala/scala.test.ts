import { describe, expect, it } from 'vitest';
import type { Pack } from '../../pack/pack.js';
import { SCALA_PACK } from './scala.js';

const gate = (pack: Pack, label: string) => pack.gates.find((g) => g.label === label);

describe('SCALA_PACK', () => {
  it('has correct id and name', () => {
    expect(SCALA_PACK.id).toBe('scala');
    expect(SCALA_PACK.name).toBe('Scala');
  });

  it('has 7 gates', () => {
    expect(SCALA_PACK.gates).toHaveLength(7);
  });

  it('format-check gate is fast and uses scalafmt', () => {
    const g = gate(SCALA_PACK, 'format-check');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toContain('scalafmtCheckAll');
  });

  it('lint gate is fast and uses scalafix', () => {
    const g = gate(SCALA_PACK, 'lint');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toContain('scalafix');
  });

  it('spell gate is fast and uses typos', () => {
    const g = gate(SCALA_PACK, 'spell');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toBe('typos');
  });

  it('build gate is slow and uses sbt compile', () => {
    const g = gate(SCALA_PACK, 'build');
    expect(g?.tier).toBe('slow');
    expect(g?.command).toContain('sbt compile');
  });

  it('test gate is slow and uses sbt test', () => {
    const g = gate(SCALA_PACK, 'test');
    expect(g?.tier).toBe('slow');
    expect(g?.command).toContain('sbt test');
  });

  it('ci-full includes all fast and slow commands', () => {
    const cmd = gate(SCALA_PACK, 'ci-full')?.command ?? '';
    expect(cmd).toContain('scalafmtCheckAll');
    expect(cmd).toContain('scalafix');
    expect(cmd).toContain('typos');
    expect(cmd).toContain('sbt compile');
    expect(cmd).toContain('sbt test');
  });

  it('mutation gate is ci tier and uses stryker4s', () => {
    const g = gate(SCALA_PACK, 'mutation');
    expect(g?.tier).toBe('ci');
    expect(g?.command).toContain('stryker4s');
  });
});
