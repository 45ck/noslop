import { DEFAULT_SPELL_CONFIG } from '../domain/config/noslop-config.js';
import type { SpellConfig } from '../domain/config/noslop-config.js';

/**
 * Build a SpellConfig from raw CLI option values.
 * noSpell corresponds to Commander's --no-spell flag (options.spell === false).
 * spellWords is a comma-separated string; empty tokens are filtered out.
 */
export function buildSpellConfig(
  noSpell: boolean,
  spellLanguage: string | undefined,
  spellWords: string | undefined,
): SpellConfig {
  return {
    enabled: !noSpell,
    language: spellLanguage ?? DEFAULT_SPELL_CONFIG.language,
    words: spellWords
      ? spellWords
          .split(',')
          .map((w) => w.trim())
          .filter((w) => w.length > 0)
      : [],
  };
}
