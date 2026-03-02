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

  it('format-check gate is fast and uses dotnet format', () => {
    const g = gate(DOTNET_PACK, 'format-check');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toContain('dotnet format');
  });

  it('spell gate is fast and uses typos', () => {
    const g = gate(DOTNET_PACK, 'spell');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toBe('typos');
  });

  it('build gate is slow and uses dotnet build', () => {
    const g = gate(DOTNET_PACK, 'build');
    expect(g?.tier).toBe('slow');
    expect(g?.command).toContain('dotnet build');
  });

  it('test gate is slow and uses dotnet test', () => {
    const g = gate(DOTNET_PACK, 'test');
    expect(g?.tier).toBe('slow');
    expect(g?.command).toContain('dotnet test');
  });

  it('ci-full includes all fast and slow commands', () => {
    const cmd = gate(DOTNET_PACK, 'ci-full')?.command ?? '';
    expect(cmd).toContain('dotnet format');
    expect(cmd).toContain('typos');
    expect(cmd).toContain('dotnet build');
    expect(cmd).toContain('dotnet test');
  });

  it('mutation gate is ci tier and uses dotnet stryker', () => {
    const g = gate(DOTNET_PACK, 'mutation');
    expect(g?.tier).toBe('ci');
    expect(g?.command).toContain('dotnet stryker');
  });
});
