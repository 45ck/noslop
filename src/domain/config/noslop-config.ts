import type { PackId } from '../pack/pack.js';

export type NoslopConfig = Readonly<{
  packs: readonly PackId[];
  protectedPaths: readonly string[];
}>;

export function createConfig(
  packs: readonly PackId[],
  protectedPaths: readonly string[],
): NoslopConfig {
  return { packs, protectedPaths };
}

export const DEFAULT_PROTECTED_PATHS: readonly string[] = [
  '.githooks/**',
  '.github/workflows/**',
  '.claude/settings.json',
  '.claude/hooks/**',
];
