# Agent Guidelines

This repo is protected by **noslop** quality gates.

## Before every commit

```sh
noslop check --tier=fast
# or: vendor/bin/php-cs-fixer check . && vendor/bin/phpstan analyse && typos
```

## Before opening a PR

```sh
noslop check --tier=slow
# or: vendor/bin/phpunit
```

## Rules

- Never use `git commit --no-verify`
- Never use `git push --force` without explicit human approval
- Fix all PHPStan violations at the configured level; do not lower the level without justification
- Never use `[skip ci]`, `skip-checks`, or `SKIP_CI` in commit messages or CI configuration

## Do not modify protected paths

These paths are enforced by `.claude/settings.json` and CI guardrails:

- `.githooks/`
- `.github/workflows/`
- `.claude/settings.json`
- `.claude/hooks/`

To change these, run `noslop install` to regenerate from templates, or ask a human to apply the `noslop-approved` PR label.

## If a gate blocks you

1. Read the full error output — it tells you what failed and where
2. Fix the code (do not disable the rule or bypass the hook)
3. Rerun the gate: `noslop check --tier=fast`
4. Once it passes, stage and commit normally

**Fast tier fallback commands** (if noslop is unavailable):

```sh
vendor/bin/php-cs-fixer check . && vendor/bin/phpstan analyse && typos
```

**Slow tier fallback commands**:

```sh
vendor/bin/phpunit
```

## Verify your setup

```sh
noslop doctor
```
