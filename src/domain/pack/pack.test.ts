import { describe, expect, it } from 'vitest';
import { createGate } from '../gate/gate.js';
import { createPack, packGates } from './pack.js';

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

  it('accepts an empty gates array', () => {
    const pack = createPack('empty', 'Empty', []);
    expect(pack.gates).toHaveLength(0);
  });
});

describe('packGates', () => {
  it('returns the gates array', () => {
    const gates = [createGate('fmt', 'cargo fmt', 'fast')];
    const pack = createPack('rust', 'Rust', gates);
    expect(packGates(pack)).toBe(pack.gates);
  });
});
