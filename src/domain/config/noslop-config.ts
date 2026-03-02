import type { PackId } from '../pack/pack.js';

export type SpellConfig = Readonly<{
  enabled: boolean;
  language: string; // BCP-47 locale: 'en', 'en-GB', 'fr', etc.
  words: readonly string[]; // seed vocabulary — project domain terms
}>;

export const DEFAULT_SPELL_CONFIG: SpellConfig = {
  enabled: true,
  language: 'en',
  words: Object.freeze([]) as readonly string[],
};

export type NoslopConfig = Readonly<{
  packs: readonly PackId[];
  protectedPaths: readonly string[];
  spell: SpellConfig;
}>;

export function createConfig(
  packs: readonly string[],
  protectedPaths: readonly string[],
  spell: SpellConfig = DEFAULT_SPELL_CONFIG,
): NoslopConfig {
  if (packs.length === 0) {
    throw new Error('NoslopConfig must include at least one pack.');
  }
  if (packs.some((p) => p.trim().length === 0)) {
    throw new Error('NoslopConfig pack ids must not be empty strings.');
  }
  if (spell.language.trim().length === 0) {
    throw new Error('SpellConfig language must not be empty.');
  }
  if (spell.words.some((w) => w.trim().length === 0)) {
    throw new Error('SpellConfig words must not contain empty strings.');
  }
  return { packs: packs as PackId[], protectedPaths, spell };
}

export const DEFAULT_PROTECTED_PATHS: readonly string[] = Object.freeze([
  '.githooks/**',
  '.github/workflows/**',
  '.claude/settings.json',
  '.claude/hooks/**',
  'node_modules/**',
  '.git/**',
  'dist/**',
  'build/**',
]);
