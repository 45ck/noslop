/** Paths that noslop owns and can safely remove during uninstall. */

export const INFRASTRUCTURE_DIRS = ['.githooks', '.claude/hooks'] as const;

export const INFRASTRUCTURE_FILES = [
  '.github/workflows/quality.yml',
  '.github/workflows/guardrails.yml',
  '.claude/settings.json',
  'AGENTS.md',
] as const;

export const SCRIPT_NAMES = [
  'scripts/check',
  'scripts/fmt',
  'scripts/lint',
  'scripts/test',
  'scripts/typecheck',
  'scripts/mutation',
  'scripts/spell',
  'scripts/build',
] as const;

/** Parent dirs to remove if empty after file/dir cleanup. Ordered deepest-first. */
export const CLEANABLE_PARENTS = ['.claude', '.github/workflows', '.github', 'scripts'] as const;
