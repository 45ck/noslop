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

  it('format-check gate is fast with exact command', () => {
    const g = gate(PHP_PACK, 'format-check');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toBe('vendor/bin/php-cs-fixer check .');
  });

  it('lint gate is fast with exact command', () => {
    const g = gate(PHP_PACK, 'lint');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toBe('vendor/bin/phpstan analyse');
  });

  it('spell gate is fast with exact command', () => {
    const g = gate(PHP_PACK, 'spell');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toBe('typos');
  });

  it('test gate is slow with exact command', () => {
    const g = gate(PHP_PACK, 'test');
    expect(g?.tier).toBe('slow');
    expect(g?.command).toBe('vendor/bin/phpunit');
  });

  it('ci-full gate is ci tier with exact command', () => {
    const g = gate(PHP_PACK, 'ci-full');
    expect(g?.tier).toBe('ci');
    expect(g?.command).toBe(
      'vendor/bin/php-cs-fixer check . && vendor/bin/phpstan analyse && typos && vendor/bin/phpunit',
    );
  });

  it('mutation gate is ci tier with exact command', () => {
    const g = gate(PHP_PACK, 'mutation');
    expect(g?.tier).toBe('ci');
    expect(g?.command).toBe('vendor/bin/infection');
  });
});
