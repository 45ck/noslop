import { describe, expect, it } from 'vitest';
import { createConfig, DEFAULT_PROTECTED_PATHS, DEFAULT_SPELL_CONFIG } from './noslop-config.js';

describe('createConfig', () => {
  it('creates a config with packs and protectedPaths', () => {
    const config = createConfig(['typescript'], ['.githooks/**']);
    expect(config.packs).toEqual(['typescript']);
    expect(config.protectedPaths).toEqual(['.githooks/**']);
  });

  it('throws when packs array is empty', () => {
    expect(() => createConfig([], [])).toThrow('NoslopConfig must include at least one pack.');
  });

  it('throws when any pack id is an empty string', () => {
    expect(() => createConfig([''], [])).toThrow('must not be empty strings');
  });

  it('throws when any pack id is whitespace-only', () => {
    expect(() => createConfig(['typescript', '  '], [])).toThrow('must not be empty strings');
  });

  it('accepts multiple packs', () => {
    const config = createConfig(['typescript', 'rust', 'dotnet'], []);
    expect(config.packs).toHaveLength(3);
  });

  it('accepts empty protectedPaths', () => {
    const config = createConfig(['typescript'], []);
    expect(config.protectedPaths).toHaveLength(0);
  });

  it('uses DEFAULT_SPELL_CONFIG when spell is not provided', () => {
    const config = createConfig(['typescript'], []);
    expect(config.spell).toEqual(DEFAULT_SPELL_CONFIG);
  });

  it('applies custom spell config', () => {
    const spell = { enabled: false, language: 'en-GB', words: ['EventSourcing'] };
    const config = createConfig(['typescript'], [], spell);
    expect(config.spell.enabled).toBe(false);
    expect(config.spell.language).toBe('en-GB');
    expect(config.spell.words).toEqual(['EventSourcing']);
  });

  it('accepts custom spell words', () => {
    const words = ['AggregateRoot', 'DomainEvent', 'EventSourcing'];
    const config = createConfig(['typescript'], [], { enabled: true, language: 'en', words });
    expect(config.spell.words).toEqual(words);
  });

  it('throws when spell language is an empty string', () => {
    expect(() =>
      createConfig(['typescript'], [], { enabled: true, language: '', words: [] }),
    ).toThrow('SpellConfig language must not be empty.');
  });

  it('throws when spell language is whitespace-only', () => {
    expect(() =>
      createConfig(['typescript'], [], { enabled: true, language: '   ', words: [] }),
    ).toThrow('SpellConfig language must not be empty.');
  });

  it('throws when spell words contains an empty string', () => {
    expect(() =>
      createConfig(['typescript'], [], { enabled: true, language: 'en', words: ['valid', ''] }),
    ).toThrow('SpellConfig words must not contain empty strings.');
  });

  it('throws when spell words contains a whitespace-only string', () => {
    expect(() =>
      createConfig(['typescript'], [], {
        enabled: true,
        language: 'en',
        words: ['valid', '   ', 'other'],
      }),
    ).toThrow('SpellConfig words must not contain empty strings.');
  });
});

describe('DEFAULT_SPELL_CONFIG', () => {
  it('has spell enabled by default', () => {
    expect(DEFAULT_SPELL_CONFIG.enabled).toBe(true);
  });

  it('defaults to English locale', () => {
    expect(DEFAULT_SPELL_CONFIG.language).toBe('en');
  });

  it('starts with no seed words', () => {
    expect(DEFAULT_SPELL_CONFIG.words).toEqual([]);
  });

  it('words array is frozen to prevent mutation of the shared default', () => {
    expect(Object.isFrozen(DEFAULT_SPELL_CONFIG.words)).toBe(true);
  });
});

describe('DEFAULT_PROTECTED_PATHS', () => {
  it('includes githooks directory', () => {
    expect(DEFAULT_PROTECTED_PATHS).toContain('.githooks/**');
  });

  it('includes github workflows directory', () => {
    expect(DEFAULT_PROTECTED_PATHS).toContain('.github/workflows/**');
  });

  it('includes claude settings and hooks', () => {
    expect(DEFAULT_PROTECTED_PATHS).toContain('.claude/settings.json');
    expect(DEFAULT_PROTECTED_PATHS).toContain('.claude/hooks/**');
  });

  it('includes common build artifacts', () => {
    expect(DEFAULT_PROTECTED_PATHS).toContain('node_modules/**');
    expect(DEFAULT_PROTECTED_PATHS).toContain('.git/**');
    expect(DEFAULT_PROTECTED_PATHS).toContain('dist/**');
    expect(DEFAULT_PROTECTED_PATHS).toContain('build/**');
  });
});
