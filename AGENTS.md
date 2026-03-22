# Agent Guidelines

This repo is protected by **noslop** quality gates.

## Before every commit

```sh
noslop check --tier=fast
```

## Before opening a PR

```sh
noslop check --tier=slow
```

## Rules

- Never use `git commit --no-verify`
- Never use `git push --force` without explicit human approval
- Do not weaken quality gates in `.githooks/`, `.github/workflows/`, or `.claude/hooks/`
- Additive changes to infrastructure files (new CI jobs, new checks, new schedules) are allowed
- Fix lint/type errors; do not disable rules
- Never use `[skip ci]`, `skip-checks`, or `SKIP_CI` in commit messages or CI configuration

## Content-aware protection

The pre-commit hook uses two-tier content-aware checking on infrastructure files:

### Tier 1: Content-aware config protection

Quality gate configs are checked for weakening patterns. Strengthening changes pass through.

| Config                    | Blocked (weakening)                                                    | Allowed (strengthening)   |
| ------------------------- | ---------------------------------------------------------------------- | ------------------------- |
| `eslint.config.mjs`       | Adding `'off'` rules, `eslint-disable`, net removal of `'error'` rules | New rules, tighter limits |
| `vitest.config.ts`        | Lowering coverage thresholds, removing thresholds                      | Raising thresholds        |
| `tsconfig*.json`          | Adding `strict: false`, net removal of strict flags                    | New strict flags          |
| `.dependency-cruiser.cjs` | Net removal of `name:` rules, severity downgrade to warn/info/off      | New forbidden rules       |
| `knip.json`               | Expanding `ignore`/`ignoreDependencies`, `ignoreExportsUsedInFile`     | New entry points          |

### Escape hatch

If a change is intentionally weakening (e.g., removing an obsolete rule), submit it via PR with the `noslop-approved` label. The pre-commit hook blocks it locally; the guardrails workflow enforces the label requirement on GitHub.

### Tier 2a: Enforcement files (`.githooks/*`, `.claude/hooks/*`, `AGENTS.md`)

These files ARE the enforcement mechanism, so they naturally reference bypass keywords. The hook only checks:

- **Removal of quality commands** (`npm run ci`, `npm run test`, `noslop check`, etc.)
- **Net removal of `exit 1`** (removing more `exit 1` lines than are added)
- **Net removal of `set -e`** (removing fail-on-error without replacement)

### Tier 2b: CI and config files (`.github/workflows/*`, `.claude/settings.json`)

Full content check:

- **Removal of quality commands** (same as Tier 2a)
- **Addition of bypass patterns** (`continue-on-error: true`, `--no-verify`, `[skip ci]`, `SKIP_CI`, `skip-checks`)
- **Net removal of `exit 1`** (same as Tier 2a)

Lines containing `deny`, `block`, or `"Bash` are excluded from bypass detection to avoid false positives on enforcement logic.

Additive changes (new jobs, new schedules, new checks) pass through in all tiers.

## Verify your setup

```sh
noslop doctor
```
