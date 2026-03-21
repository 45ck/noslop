import { describe, expect, it } from 'vitest';
import { getToolchainRequirements } from './toolchain.js';

const ALL_PACK_IDS = [
  'typescript',
  'javascript',
  'rust',
  'python',
  'go',
  'java',
  'dotnet',
  'ruby',
  'php',
  'kotlin',
  'swift',
  'cpp',
  'scala',
  'elixir',
  'dart',
  'haskell',
  'lua',
  'zig',
  'ocaml',
];

describe('getToolchainRequirements', () => {
  it.each(ALL_PACK_IDS)('returns at least one requirement for pack "%s"', (packId) => {
    const results = getToolchainRequirements(packId);
    expect(results.length).toBeGreaterThanOrEqual(1);
  });

  it.each(ALL_PACK_IDS)(
    'every requirement for pack "%s" has non-empty binary, versionCommand, installHint',
    (packId) => {
      const results = getToolchainRequirements(packId);
      for (const req of results) {
        expect(req.binary.trim().length).toBeGreaterThan(0);
        expect(req.versionCommand.trim().length).toBeGreaterThan(0);
        expect(req.installHint.trim().length).toBeGreaterThan(0);
      }
    },
  );

  it('returns empty array for unknown pack id', () => {
    expect(getToolchainRequirements('nonexistent')).toEqual([]);
  });

  it('returns correct binaries for typescript', () => {
    const results = getToolchainRequirements('typescript');
    const binaries = results.map((r) => r.binary);
    expect(binaries).toContain('tsc');
    expect(binaries).toContain('eslint');
    expect(binaries).toContain('prettier');
  });

  it('returns correct binaries for rust', () => {
    const results = getToolchainRequirements('rust');
    const binaries = results.map((r) => r.binary);
    expect(binaries).toContain('cargo');
    expect(binaries).toContain('clippy');
  });
});
