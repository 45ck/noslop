import { describe, expect, it } from 'vitest';
import type { Pack } from '../../pack/pack.js';
import { PHP_PACK } from './php.js';

const gate = (pack: Pack, label: string) => pack.gates.find((g) => g.label === label);

describe('PHP_PACK', () => {
  it('has correct id and name', () => {
    expect(PHP_PACK.id).toBe('php');
    expect(PHP_PACK.name).toBe('PHP');
  });

  it('has 6 gates', () => {
    expect(PHP_PACK.gates).toHaveLength(6);
  });

  it('format-check gate is fast and uses php-cs-fixer', () => {
    const g = gate(PHP_PACK, 'format-check');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toContain('php-cs-fixer');
  });

  it('lint gate is fast and uses phpstan', () => {
    const g = gate(PHP_PACK, 'lint');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toContain('phpstan');
  });

  it('spell gate is fast and uses typos', () => {
    const g = gate(PHP_PACK, 'spell');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toBe('typos');
  });

  it('test gate is slow and uses phpunit', () => {
    const g = gate(PHP_PACK, 'test');
    expect(g?.tier).toBe('slow');
    expect(g?.command).toContain('phpunit');
  });

  it('ci-full includes all fast and slow commands', () => {
    const cmd = gate(PHP_PACK, 'ci-full')?.command ?? '';
    expect(cmd).toContain('php-cs-fixer');
    expect(cmd).toContain('phpstan');
    expect(cmd).toContain('typos');
    expect(cmd).toContain('phpunit');
  });

  it('mutation gate is ci tier and uses infection', () => {
    const g = gate(PHP_PACK, 'mutation');
    expect(g?.tier).toBe('ci');
    expect(g?.command).toContain('infection');
  });
});
