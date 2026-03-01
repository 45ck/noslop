import { describe, expect, it } from 'vitest';
import { createGate } from '../gate/gate.js';
import { createPack } from './pack.js';

describe('createPack', () => {
  const gates = [createGate('lint', 'eslint .', 'fast'), createGate('test', 'vitest run', 'slow')];

  it('creates a pack with valid inputs', () => {
    const pack = createPack('typescript', 'TypeScript', gates);
    expect(pack.id).toBe('typescript');
    expect(pack.name).toBe('TypeScript');
    expect(pack.gates).toHaveLength(2);
  });

  it('throws when id is empty', () => {
    expect(() => createPack('', 'TypeScript', gates)).toThrow('Pack id must not be empty.');
  });

  it('throws when id is whitespace only', () => {
    expect(() => createPack('  ', 'TypeScript', gates)).toThrow('Pack id must not be empty.');
  });

  it('throws when name is empty', () => {
    expect(() => createPack('typescript', '', gates)).toThrow('Pack name must not be empty.');
  });

  it('throws when name is whitespace only', () => {
    expect(() => createPack('typescript', '   ', gates)).toThrow('Pack name must not be empty.');
  });

  it('throws when gates array is empty', () => {
    expect(() => createPack('empty', 'Empty', [])).toThrow(
      "Pack 'empty' must define at least one gate.",
    );
  });

  it('throws when gate labels are duplicated', () => {
    const dupeGates = [
      createGate('lint', 'eslint .', 'fast'),
      createGate('lint', 'eslint src/', 'slow'),
    ];
    expect(() => createPack('ts', 'TypeScript', dupeGates)).toThrow(
      "Pack 'ts' has duplicate gate labels: lint.",
    );
  });
});
