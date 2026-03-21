import type { GateTier } from '../gate/gate.js';

export type CustomGateConfig = Readonly<{
  label: string;
  command: string;
  tier: GateTier;
}>;

export type ProjectConfig = Readonly<{
  packs?: readonly string[];
  spell?: Readonly<{
    language?: string;
    words?: readonly string[];
  }>;
  skipGates?: readonly string[];
  customGates?: readonly CustomGateConfig[];
  timeoutMs?: number;
}>;

export function parseProjectConfig(raw: unknown): ProjectConfig {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    throw new Error('.noslop.json must be a JSON object.');
  }

  const obj = raw as Record<string, unknown>;
  const config: {
    packs?: string[];
    spell?: { language?: string; words?: string[] };
    skipGates?: string[];
    customGates?: CustomGateConfig[];
    timeoutMs?: number;
  } = {};

  if ('packs' in obj) {
    if (!Array.isArray(obj['packs']) || !obj['packs'].every((p) => typeof p === 'string')) {
      throw new Error('.noslop.json "packs" must be an array of strings.');
    }
    config.packs = obj['packs'];
  }

  if ('spell' in obj) {
    const spell = obj['spell'];
    if (typeof spell !== 'object' || spell === null || Array.isArray(spell)) {
      throw new Error('.noslop.json "spell" must be an object.');
    }
    const s = spell as Record<string, unknown>;
    const parsed: { language?: string; words?: string[] } = {};
    if ('language' in s) {
      if (typeof s['language'] !== 'string') {
        throw new Error('.noslop.json "spell.language" must be a string.');
      }
      parsed.language = s['language'];
    }
    if ('words' in s) {
      if (!Array.isArray(s['words']) || !s['words'].every((w) => typeof w === 'string')) {
        throw new Error('.noslop.json "spell.words" must be an array of strings.');
      }
      parsed.words = s['words'];
    }
    config.spell = parsed;
  }

  if ('skipGates' in obj) {
    if (!Array.isArray(obj['skipGates']) || !obj['skipGates'].every((g) => typeof g === 'string')) {
      throw new Error('.noslop.json "skipGates" must be an array of strings.');
    }
    config.skipGates = obj['skipGates'];
  }

  if ('customGates' in obj) {
    if (!Array.isArray(obj['customGates'])) {
      throw new Error('.noslop.json "customGates" must be an array.');
    }
    const validTiers = ['fast', 'slow', 'ci'];
    config.customGates = obj['customGates'].map((g: unknown, i: number) => {
      if (typeof g !== 'object' || g === null || Array.isArray(g)) {
        throw new Error(`.noslop.json "customGates[${i}]" must be an object.`);
      }
      const entry = g as Record<string, unknown>;
      if (typeof entry['label'] !== 'string' || entry['label'].trim().length === 0) {
        throw new Error(`.noslop.json "customGates[${i}].label" must be a non-empty string.`);
      }
      if (typeof entry['command'] !== 'string' || entry['command'].trim().length === 0) {
        throw new Error(`.noslop.json "customGates[${i}].command" must be a non-empty string.`);
      }
      if (typeof entry['tier'] !== 'string' || !validTiers.includes(entry['tier'])) {
        throw new Error(
          `.noslop.json "customGates[${i}].tier" must be one of: ${validTiers.join(', ')}.`,
        );
      }
      return {
        label: entry['label'],
        command: entry['command'],
        tier: entry['tier'] as GateTier,
      };
    });
  }

  if ('timeoutMs' in obj) {
    if (typeof obj['timeoutMs'] !== 'number' || !Number.isInteger(obj['timeoutMs'])) {
      throw new Error('.noslop.json "timeoutMs" must be an integer.');
    }
    if (obj['timeoutMs'] <= 0) {
      throw new Error('.noslop.json "timeoutMs" must be a positive integer.');
    }
    config.timeoutMs = obj['timeoutMs'];
  }

  return config;
}
