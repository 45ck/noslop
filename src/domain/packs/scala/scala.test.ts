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

  it('format-check gate is fast with exact command', () => {
    const g = gate(SCALA_PACK, 'format-check');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toBe('sbt scalafmtCheckAll');
  });

  it('lint gate is fast with exact command', () => {
    const g = gate(SCALA_PACK, 'lint');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toBe('sbt "scalafix --check"');
  });

  it('spell gate is fast with exact command', () => {
    const g = gate(SCALA_PACK, 'spell');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toBe('typos');
  });

  it('build gate is slow with exact command', () => {
    const g = gate(SCALA_PACK, 'build');
    expect(g?.tier).toBe('slow');
    expect(g?.command).toBe('sbt compile');
  });

  it('test gate is slow with exact command', () => {
    const g = gate(SCALA_PACK, 'test');
    expect(g?.tier).toBe('slow');
    expect(g?.command).toBe('sbt test');
  });

  it('ci-full gate is ci tier with exact command', () => {
    const g = gate(SCALA_PACK, 'ci-full');
    expect(g?.tier).toBe('ci');
    expect(g?.command).toBe(
      'sbt scalafmtCheckAll "scalafix --check" && typos && sbt compile && sbt test',
    );
  });

  it('mutation gate is ci tier with exact command', () => {
    const g = gate(SCALA_PACK, 'mutation');
    expect(g?.tier).toBe('ci');
    expect(g?.command).toBe('sbt stryker4s');
  });
});
