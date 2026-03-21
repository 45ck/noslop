import { describe, expect, it } from 'vitest';
import { parseProjectConfig } from './project-config.js';

describe('parseProjectConfig', () => {
  it('parses a minimal empty config', () => {
    const config = parseProjectConfig({});
    expect(config.packs).toBeUndefined();
    expect(config.spell).toBeUndefined();
    expect(config.skipGates).toBeUndefined();
  });

  it('parses packs array', () => {
    const config = parseProjectConfig({ packs: ['typescript', 'rust'] });
    expect(config.packs).toEqual(['typescript', 'rust']);
  });

  it('parses spell config with language and words', () => {
    const config = parseProjectConfig({
      spell: { language: 'en-GB', words: ['noslop', 'guardrail'] },
    });
    expect(config.spell?.language).toBe('en-GB');
    expect(config.spell?.words).toEqual(['noslop', 'guardrail']);
  });

  it('parses skipGates array', () => {
    const config = parseProjectConfig({ skipGates: ['mutation', 'spell'] });
    expect(config.skipGates).toEqual(['mutation', 'spell']);
  });

  it('parses a full config with all fields', () => {
    const config = parseProjectConfig({
      packs: ['typescript'],
      spell: { language: 'en', words: ['noslop'] },
      skipGates: ['mutation'],
    });
    expect(config.packs).toEqual(['typescript']);
    expect(config.spell?.language).toBe('en');
    expect(config.skipGates).toEqual(['mutation']);
  });

  it('throws on non-object input', () => {
    expect(() => parseProjectConfig('string')).toThrow('must be a JSON object');
    expect(() => parseProjectConfig(null)).toThrow('must be a JSON object');
    expect(() => parseProjectConfig([])).toThrow('must be a JSON object');
  });

  it('throws when packs is not an array of strings', () => {
    expect(() => parseProjectConfig({ packs: 'typescript' })).toThrow('"packs" must be an array');
    expect(() => parseProjectConfig({ packs: [123] })).toThrow('"packs" must be an array');
  });

  it('throws when spell is not an object', () => {
    expect(() => parseProjectConfig({ spell: 'en' })).toThrow('"spell" must be an object');
  });

  it('throws when spell.language is not a string', () => {
    expect(() => parseProjectConfig({ spell: { language: 123 } })).toThrow(
      '"spell.language" must be a string',
    );
  });

  it('throws when spell.words is not an array of strings', () => {
    expect(() => parseProjectConfig({ spell: { words: [123] } })).toThrow(
      '"spell.words" must be an array',
    );
  });

  it('throws when skipGates is not an array of strings', () => {
    expect(() => parseProjectConfig({ skipGates: 'mutation' })).toThrow(
      '"skipGates" must be an array',
    );
  });

  it('parses customGates array', () => {
    const config = parseProjectConfig({
      customGates: [
        { label: 'license', command: 'node scripts/check-headers.js', tier: 'fast' },
        { label: 'secrets', command: 'gitleaks detect', tier: 'ci' },
      ],
    });
    expect(config.customGates).toHaveLength(2);
    expect(config.customGates?.[0]?.label).toBe('license');
    expect(config.customGates?.[0]?.tier).toBe('fast');
  });

  it('throws when customGates is not an array', () => {
    expect(() => parseProjectConfig({ customGates: 'bad' })).toThrow(
      '"customGates" must be an array',
    );
  });

  it('throws when customGates entry is not an object', () => {
    expect(() => parseProjectConfig({ customGates: ['bad'] })).toThrow(
      '"customGates[0]" must be an object',
    );
  });

  it('throws when customGates entry has empty label', () => {
    expect(() =>
      parseProjectConfig({
        customGates: [{ label: '', command: 'cmd', tier: 'fast' }],
      }),
    ).toThrow('"customGates[0].label" must be a non-empty string');
  });

  it('throws when customGates entry has empty command', () => {
    expect(() =>
      parseProjectConfig({
        customGates: [{ label: 'test', command: '', tier: 'fast' }],
      }),
    ).toThrow('"customGates[0].command" must be a non-empty string');
  });

  it('throws when customGates entry has invalid tier', () => {
    expect(() =>
      parseProjectConfig({
        customGates: [{ label: 'test', command: 'cmd', tier: 'invalid' }],
      }),
    ).toThrow('"customGates[0].tier" must be one of');
  });

  it('parses timeoutMs', () => {
    const config = parseProjectConfig({ timeoutMs: 600000 });
    expect(config.timeoutMs).toBe(600000);
  });

  it('throws when timeoutMs is not an integer', () => {
    expect(() => parseProjectConfig({ timeoutMs: 1.5 })).toThrow('"timeoutMs" must be an integer');
  });

  it('throws when timeoutMs is not positive', () => {
    expect(() => parseProjectConfig({ timeoutMs: 0 })).toThrow(
      '"timeoutMs" must be a positive integer',
    );
  });

  it('throws when timeoutMs is a string', () => {
    expect(() => parseProjectConfig({ timeoutMs: '600000' })).toThrow(
      '"timeoutMs" must be an integer',
    );
  });
});
