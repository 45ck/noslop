import { describe, expect, it } from 'vitest';
import { parseProjectConfig } from './project-config.js';

describe('parseProjectConfig valid inputs', () => {
  it('parses minimal and full configs', () => {
    const minimal = parseProjectConfig({});
    const full = parseProjectConfig({
      packs: ['typescript'],
      spell: { language: 'en', words: ['noslop'] },
      skipGates: ['mutation'],
      customGates: [{ label: 'license', command: 'node scripts/check-headers.js', tier: 'fast' }],
      timeoutMs: 600000,
    });

    expect(minimal.packs).toBeUndefined();
    expect(minimal.spell).toBeUndefined();
    expect(full.packs).toEqual(['typescript']);
    expect(full.spell?.language).toBe('en');
    expect(full.skipGates).toEqual(['mutation']);
    expect(full.customGates?.[0]?.label).toBe('license');
    expect(full.timeoutMs).toBe(600000);
  });

  it('parses packs, spell, and skipGates fields individually', () => {
    expect(parseProjectConfig({ packs: ['typescript', 'rust'] }).packs).toEqual([
      'typescript',
      'rust',
    ]);
    expect(
      parseProjectConfig({ spell: { language: 'en-GB', words: ['noslop', 'guardrail'] } }).spell,
    ).toEqual({ language: 'en-GB', words: ['noslop', 'guardrail'] });
    expect(parseProjectConfig({ skipGates: ['mutation', 'spell'] }).skipGates).toEqual([
      'mutation',
      'spell',
    ]);
  });
});

describe('parseProjectConfig invalid scalar fields', () => {
  it('rejects non-object input', () => {
    expect(() => parseProjectConfig('string')).toThrow('must be a JSON object');
    expect(() => parseProjectConfig(null)).toThrow('must be a JSON object');
    expect(() => parseProjectConfig([])).toThrow('must be a JSON object');
  });

  it('rejects invalid packs, spell, and skipGates fields', () => {
    expect(() => parseProjectConfig({ packs: 'typescript' })).toThrow('"packs" must be an array');
    expect(() => parseProjectConfig({ packs: [123] })).toThrow('"packs" must be an array');
    expect(() => parseProjectConfig({ spell: 'en' })).toThrow('"spell" must be an object');
    expect(() => parseProjectConfig({ spell: { language: 123 } })).toThrow(
      '"spell.language" must be a string',
    );
    expect(() => parseProjectConfig({ spell: { words: [123] } })).toThrow(
      '"spell.words" must be an array',
    );
    expect(() => parseProjectConfig({ skipGates: 'mutation' })).toThrow(
      '"skipGates" must be an array',
    );
  });
});

describe('parseProjectConfig custom gates and timeout', () => {
  it('rejects malformed custom gate entries', () => {
    expect(() => parseProjectConfig({ customGates: 'bad' })).toThrow(
      '"customGates" must be an array',
    );
    expect(() => parseProjectConfig({ customGates: ['bad'] })).toThrow(
      '"customGates[0]" must be an object',
    );
    expect(() =>
      parseProjectConfig({ customGates: [{ label: '', command: 'cmd', tier: 'fast' }] }),
    ).toThrow('"customGates[0].label" must be a non-empty string');
    expect(() =>
      parseProjectConfig({ customGates: [{ label: 'test', command: '', tier: 'fast' }] }),
    ).toThrow('"customGates[0].command" must be a non-empty string');
    expect(() =>
      parseProjectConfig({ customGates: [{ label: 'test', command: 'cmd', tier: 'invalid' }] }),
    ).toThrow('"customGates[0].tier" must be one of');
  });

  it('parses and validates timeoutMs', () => {
    expect(parseProjectConfig({ timeoutMs: 600000 }).timeoutMs).toBe(600000);
    expect(() => parseProjectConfig({ timeoutMs: 1.5 })).toThrow('"timeoutMs" must be an integer');
    expect(() => parseProjectConfig({ timeoutMs: 0 })).toThrow(
      '"timeoutMs" must be a positive integer',
    );
    expect(() => parseProjectConfig({ timeoutMs: '600000' })).toThrow(
      '"timeoutMs" must be an integer',
    );
  });
});
