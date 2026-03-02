import type { PackId } from '../pack/pack.js';

export type NoslopConfig = Readonly<{
  packs: readonly PackId[];
  protectedPaths: readonly string[];
}>;

export function createConfig(
  packs: readonly string[],
  protectedPaths: readonly string[],
): NoslopConfig {
  if (packs.length === 0) {
    throw new Error('NoslopConfig must include at least one pack.');
  }
  if (packs.some((p) => p.trim().length === 0)) {
    throw new Error('NoslopConfig pack ids must not be empty strings.');
  }
  return { packs: packs as PackId[], protectedPaths };
}

export const DEFAULT_PROTECTED_PATHS: readonly string[] = [
  '.githooks/**',
  '.github/workflows/**',
  '.claude/settings.json',
  '.claude/hooks/**',
  'node_modules/**',
  '.git/**',
  'dist/**',
  'build/**',
];
