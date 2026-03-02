import { describe, expect, it } from 'vitest';
import type { Pack } from '../../pack/pack.js';
import { GO_PACK } from './go.js';

const gate = (pack: Pack, label: string) => pack.gates.find((g) => g.label === label);

describe('GO_PACK', () => {
  it('has correct id and name', () => {
    expect(GO_PACK.id).toBe('go');
    expect(GO_PACK.name).toBe('Go');
  });

  it('has 6 gates', () => {
    expect(GO_PACK.gates).toHaveLength(6);
  });

  it('format-check gate is fast and uses gofmt', () => {
    const g = gate(GO_PACK, 'format-check');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toContain('gofmt');
  });

  it('lint gate is fast and uses go vet', () => {
    const g = gate(GO_PACK, 'lint');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toContain('go vet');
  });

  it('spell gate is fast and uses typos', () => {
    const g = gate(GO_PACK, 'spell');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toBe('typos');
  });

  it('build gate is slow and uses go build', () => {
    const g = gate(GO_PACK, 'build');
    expect(g?.tier).toBe('slow');
    expect(g?.command).toContain('go build');
  });

  it('test gate is slow and uses go test', () => {
    const g = gate(GO_PACK, 'test');
    expect(g?.tier).toBe('slow');
    expect(g?.command).toContain('go test');
  });

  it('ci-full includes all fast and slow commands', () => {
    const cmd = gate(GO_PACK, 'ci-full')?.command ?? '';
    expect(cmd).toContain('gofmt');
    expect(cmd).toContain('go vet');
    expect(cmd).toContain('typos');
    expect(cmd).toContain('go build');
    expect(cmd).toContain('go test');
  });

  it('has no mutation gate', () => {
    expect(gate(GO_PACK, 'mutation')).toBeUndefined();
  });
});
