import { describe, expect, it } from 'vitest';
import type { Pack } from '../../pack/pack.js';
import { DOTNET_PACK } from './dotnet.js';

const gate = (pack: Pack, label: string) => pack.gates.find((g) => g.label === label);

describe('DOTNET_PACK', () => {
  it('has correct id and name', () => {
    expect(DOTNET_PACK.id).toBe('dotnet');
    expect(DOTNET_PACK.name).toBe('.NET / C#');
  });

  it('has 6 gates', () => {
    expect(DOTNET_PACK.gates).toHaveLength(6);
  });

  it('format-check gate is fast with exact command', () => {
    const g = gate(DOTNET_PACK, 'format-check');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toBe('dotnet format --verify-no-changes');
  });

  it('spell gate is fast with exact command', () => {
    const g = gate(DOTNET_PACK, 'spell');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toBe('typos');
  });

  it('build gate is slow with exact command', () => {
    const g = gate(DOTNET_PACK, 'build');
    expect(g?.tier).toBe('slow');
    expect(g?.command).toBe('dotnet build /warnaserror');
  });

  it('test gate is slow with exact command', () => {
    const g = gate(DOTNET_PACK, 'test');
    expect(g?.tier).toBe('slow');
    expect(g?.command).toBe('dotnet test');
  });

  it('ci-full gate is ci tier with exact command', () => {
    const g = gate(DOTNET_PACK, 'ci-full');
    expect(g?.tier).toBe('ci');
    expect(g?.command).toBe(
      'dotnet format --verify-no-changes && typos && dotnet build /warnaserror && dotnet test',
    );
  });

  it('mutation gate is ci tier with exact command', () => {
    const g = gate(DOTNET_PACK, 'mutation');
    expect(g?.tier).toBe('ci');
    expect(g?.command).toBe('dotnet stryker');
  });
});
