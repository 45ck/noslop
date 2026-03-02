import { describe, expect, it } from 'vitest';
import type { Pack } from '../../pack/pack.js';
import { RUBY_PACK } from './ruby.js';

const gate = (pack: Pack, label: string) => pack.gates.find((g) => g.label === label);

describe('RUBY_PACK', () => {
  it('has correct id and name', () => {
    expect(RUBY_PACK.id).toBe('ruby');
    expect(RUBY_PACK.name).toBe('Ruby');
  });

  it('has 6 gates', () => {
    expect(RUBY_PACK.gates).toHaveLength(6);
  });

  it('format-check gate is fast and uses rubocop layout', () => {
    const g = gate(RUBY_PACK, 'format-check');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toContain('rubocop');
    expect(g?.command).toContain('--only Layout');
  });

  it('lint gate is fast and uses rubocop', () => {
    const g = gate(RUBY_PACK, 'lint');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toContain('rubocop');
  });

  it('spell gate is fast and uses typos', () => {
    const g = gate(RUBY_PACK, 'spell');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toBe('typos');
  });

  it('test gate is slow and uses rspec', () => {
    const g = gate(RUBY_PACK, 'test');
    expect(g?.tier).toBe('slow');
    expect(g?.command).toContain('rspec');
  });

  it('ci-full includes all fast and slow commands', () => {
    const cmd = gate(RUBY_PACK, 'ci-full')?.command ?? '';
    expect(cmd).toContain('rubocop');
    expect(cmd).toContain('typos');
    expect(cmd).toContain('rspec');
  });

  it('mutation gate is ci tier and uses mutant', () => {
    const g = gate(RUBY_PACK, 'mutation');
    expect(g?.tier).toBe('ci');
    expect(g?.command).toContain('mutant');
  });
});
