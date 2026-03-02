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

  it('format-check gate is fast with exact command', () => {
    const g = gate(GO_PACK, 'format-check');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toBe('test -z "$(gofmt -l .)"');
  });

  it('lint gate is fast with exact command', () => {
    const g = gate(GO_PACK, 'lint');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toBe('go vet ./...');
  });

  it('spell gate is fast with exact command', () => {
    const g = gate(GO_PACK, 'spell');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toBe('typos');
  });

  it('build gate is slow with exact command', () => {
    const g = gate(GO_PACK, 'build');
    expect(g?.tier).toBe('slow');
    expect(g?.command).toBe('go build ./...');
  });

  it('test gate is slow with exact command', () => {
    const g = gate(GO_PACK, 'test');
    expect(g?.tier).toBe('slow');
    expect(g?.command).toBe('go test ./...');
  });

  it('ci-full gate is ci tier with exact command', () => {
    const g = gate(GO_PACK, 'ci-full');
    expect(g?.tier).toBe('ci');
    expect(g?.command).toBe(
      'test -z "$(gofmt -l .)" && go vet ./... && typos && go build ./... && go test ./...',
    );
  });

  it('has no mutation gate', () => {
    expect(gate(GO_PACK, 'mutation')).toBeUndefined();
  });
});
