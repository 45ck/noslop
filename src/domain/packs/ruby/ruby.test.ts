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

  it('format-check gate is fast with exact command', () => {
    const g = gate(RUBY_PACK, 'format-check');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toBe('bundle exec rubocop --only Layout --format=quiet');
  });

  it('lint gate is fast with exact command', () => {
    const g = gate(RUBY_PACK, 'lint');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toBe('bundle exec rubocop --format=quiet');
  });

  it('spell gate is fast with exact command', () => {
    const g = gate(RUBY_PACK, 'spell');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toBe('typos');
  });

  it('test gate is slow with exact command', () => {
    const g = gate(RUBY_PACK, 'test');
    expect(g?.tier).toBe('slow');
    expect(g?.command).toBe('bundle exec rspec');
  });

  it('ci-full gate is ci tier with exact command', () => {
    const g = gate(RUBY_PACK, 'ci-full');
    expect(g?.tier).toBe('ci');
    expect(g?.command).toBe('bundle exec rubocop --format=quiet && typos && bundle exec rspec');
  });

  it('mutation gate is ci tier with exact command', () => {
    const g = gate(RUBY_PACK, 'mutation');
    expect(g?.tier).toBe('ci');
    expect(g?.command).toBe('bundle exec mutant run');
  });
});
