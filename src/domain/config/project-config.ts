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

interface MutableProjectConfig {
  packs?: string[];
  spell?: { language?: string; words?: string[] };
  skipGates?: string[];
  customGates?: CustomGateConfig[];
  timeoutMs?: number;
}

export function parseProjectConfig(raw: unknown): ProjectConfig {
  const obj = asObject(raw, '.noslop.json must be a JSON object.');
  const config: MutableProjectConfig = {};

  const packs = parseOptionalStringArrayField(
    obj,
    'packs',
    '.noslop.json "packs" must be an array of strings.',
  );
  if (packs !== undefined) config.packs = packs;

  const spell = parseSpellField(obj);
  if (spell !== undefined) config.spell = spell;

  const skipGates = parseOptionalStringArrayField(
    obj,
    'skipGates',
    '.noslop.json "skipGates" must be an array of strings.',
  );
  if (skipGates !== undefined) config.skipGates = skipGates;

  const customGates = parseCustomGatesField(obj);
  if (customGates !== undefined) config.customGates = customGates;

  const timeoutMs = parseTimeoutMsField(obj);
  if (timeoutMs !== undefined) config.timeoutMs = timeoutMs;

  return config;
}

function asObject(raw: unknown, errorMessage: string): Record<string, unknown> {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    throw new Error(errorMessage);
  }
  return raw as Record<string, unknown>;
}

function parseOptionalStringArrayField(
  obj: Record<string, unknown>,
  key: string,
  errorMessage: string,
): string[] | undefined {
  if (!(key in obj)) return undefined;
  const value = obj[key];
  if (!Array.isArray(value) || !value.every((entry) => typeof entry === 'string')) {
    throw new Error(errorMessage);
  }
  return value;
}

function parseSpellField(obj: Record<string, unknown>): MutableProjectConfig['spell'] | undefined {
  if (!('spell' in obj)) return undefined;

  const spell = asObject(obj['spell'], '.noslop.json "spell" must be an object.');
  const parsed: NonNullable<MutableProjectConfig['spell']> = {};
  const language = parseOptionalStringField(
    spell,
    'language',
    '.noslop.json "spell.language" must be a string.',
  );
  const words = parseOptionalStringArrayField(
    spell,
    'words',
    '.noslop.json "spell.words" must be an array of strings.',
  );
  if (language !== undefined) parsed.language = language;
  if (words !== undefined) parsed.words = words;
  return parsed;
}

function parseOptionalStringField(
  obj: Record<string, unknown>,
  key: string,
  errorMessage: string,
): string | undefined {
  if (!(key in obj)) return undefined;
  const value = obj[key];
  if (typeof value !== 'string') {
    throw new Error(errorMessage);
  }
  return value;
}

function parseCustomGatesField(obj: Record<string, unknown>): CustomGateConfig[] | undefined {
  if (!('customGates' in obj)) return undefined;
  const value = obj['customGates'];
  if (!Array.isArray(value)) {
    throw new Error('.noslop.json "customGates" must be an array.');
  }
  return value.map((gate, index) => parseCustomGate(gate, index));
}

function parseCustomGate(raw: unknown, index: number): CustomGateConfig {
  const entry = asObject(raw, `.noslop.json "customGates[${index}]" must be an object.`);
  const validTiers: readonly GateTier[] = ['fast', 'slow', 'ci'];
  const label = parseRequiredTrimmedString(
    entry,
    'label',
    `.noslop.json "customGates[${index}].label" must be a non-empty string.`,
  );
  const command = parseRequiredTrimmedString(
    entry,
    'command',
    `.noslop.json "customGates[${index}].command" must be a non-empty string.`,
  );
  const tier = entry['tier'];
  if (typeof tier !== 'string' || !validTiers.includes(tier as GateTier)) {
    throw new Error(
      `.noslop.json "customGates[${index}].tier" must be one of: ${validTiers.join(', ')}.`,
    );
  }
  return { label, command, tier: tier as GateTier };
}

function parseRequiredTrimmedString(
  obj: Record<string, unknown>,
  key: string,
  errorMessage: string,
): string {
  const value = obj[key];
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(errorMessage);
  }
  return value;
}

function parseTimeoutMsField(obj: Record<string, unknown>): number | undefined {
  if (!('timeoutMs' in obj)) return undefined;
  const value = obj['timeoutMs'];
  if (typeof value !== 'number' || !Number.isInteger(value)) {
    throw new Error('.noslop.json "timeoutMs" must be an integer.');
  }
  if (value <= 0) {
    throw new Error('.noslop.json "timeoutMs" must be a positive integer.');
  }
  return value;
}
