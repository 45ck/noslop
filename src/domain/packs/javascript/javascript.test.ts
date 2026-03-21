import { describe, expect, it } from 'vitest';
import type { Pack } from '../../pack/pack.js';
import { JAVASCRIPT_PACK } from './javascript.js';

const gate = (pack: Pack, label: string) => pack.gates.find((g) => g.label === label);

describe('JAVASCRIPT_PACK', () => {
  it('has correct id and name', () => {
    expect(JAVASCRIPT_PACK.id).toBe('javascript');
    expect(JAVASCRIPT_PACK.name).toBe('JavaScript');
  });

  it('has 6 gates', () => {
    expect(JAVASCRIPT_PACK.gates).toHaveLength(6);
  });

  it('format-check gate is fast with exact command', () => {
    const g = gate(JAVASCRIPT_PACK, 'format-check');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toBe('npx prettier --check .');
  });

  it('lint gate is fast with exact command', () => {
    const g = gate(JAVASCRIPT_PACK, 'lint');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toBe('npx eslint .');
  });

  it('spell gate is fast with exact command', () => {
    const g = gate(JAVASCRIPT_PACK, 'spell');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toBe('cspell --no-progress "src/**/*"');
  });

  it('test gate is slow with exact command', () => {
    const g = gate(JAVASCRIPT_PACK, 'test');
    expect(g?.tier).toBe('slow');
    expect(g?.command).toBe('npm test');
  });

  it('ci-full gate is ci tier with exact command', () => {
    const g = gate(JAVASCRIPT_PACK, 'ci-full');
    expect(g?.tier).toBe('ci');
    expect(g?.command).toBe(
      'npx prettier --check . && npx eslint . && cspell --no-progress "src/**/*" && npm test',
    );
  });

  it('mutation gate is ci tier with exact command', () => {
    const g = gate(JAVASCRIPT_PACK, 'mutation');
    expect(g?.tier).toBe('ci');
    expect(g?.command).toBe('npx stryker run');
  });
});
