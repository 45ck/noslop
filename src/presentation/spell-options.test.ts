import { describe, it, expect } from 'vitest';
import { buildSpellConfig } from './spell-options.js';
import { DEFAULT_SPELL_CONFIG } from '../domain/config/noslop-config.js';

describe('buildSpellConfig', () => {
  it('returns enabled=true when noSpell=false', () => {
    const result = buildSpellConfig(false, undefined, undefined);
    expect(result.enabled).toBe(true);
  });

  it('returns enabled=false when noSpell=true', () => {
    const result = buildSpellConfig(true, undefined, undefined);
    expect(result.enabled).toBe(false);
  });

  it('defaults language to DEFAULT_SPELL_CONFIG.language when not provided', () => {
    const result = buildSpellConfig(false, undefined, undefined);
    expect(result.language).toBe(DEFAULT_SPELL_CONFIG.language);
  });

  it('uses provided spellLanguage', () => {
    const result = buildSpellConfig(false, 'en-GB', undefined);
    expect(result.language).toBe('en-GB');
  });

  it('returns empty words array when spellWords is undefined', () => {
    const result = buildSpellConfig(false, undefined, undefined);
    expect(result.words).toEqual([]);
  });

  it('splits comma-separated spellWords', () => {
    const result = buildSpellConfig(false, undefined, 'foo,bar,baz');
    expect(result.words).toEqual(['foo', 'bar', 'baz']);
  });

  it('trims whitespace from each word', () => {
    const result = buildSpellConfig(false, undefined, ' foo , bar , baz ');
    expect(result.words).toEqual(['foo', 'bar', 'baz']);
  });

  it('filters out empty tokens from spellWords', () => {
    const result = buildSpellConfig(false, undefined, 'foo,,bar,');
    expect(result.words).toEqual(['foo', 'bar']);
  });

  it('filters whitespace-only tokens from spellWords', () => {
    const result = buildSpellConfig(false, undefined, 'foo,  ,bar');
    expect(result.words).toEqual(['foo', 'bar']);
  });
});
