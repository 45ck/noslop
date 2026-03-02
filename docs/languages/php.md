# PHP — noslop pack

> Enforces strict static analysis (PHPStan level 8), mess detection (PHPMD), and consistent formatting via php-cs-fixer.

## Prerequisites

| Tool         | Version | Install                                             |
| ------------ | ------- | --------------------------------------------------- |
| PHP          | 8+      | [php.net](https://www.php.net/)                     |
| Composer     | latest  | [getcomposer.org](https://getcomposer.org/)         |
| php-cs-fixer | latest  | `composer global require friendsofphp/php-cs-fixer` |
| PHPStan      | latest  | `composer require --dev phpstan/phpstan`            |
| PHPMD        | latest  | `composer require --dev phpmd/phpmd`                |
| PHPUnit      | latest  | `composer require --dev phpunit/phpunit`            |

## Install

```sh
noslop init --pack php   # or: auto-detected from composer.json
noslop doctor
```

## What gets installed

- `.githooks/pre-commit` — runs fast gates before every commit
- `.githooks/pre-push` — runs slow gates before every push
- `.githooks/commit-msg` — enforces Conventional Commits format; blocks [skip ci] patterns
- `.github/workflows/quality.yml` — required CI check on PRs and pushes to main
- `.github/workflows/guardrails.yml` — blocks PRs touching protected files without noslop-approved label
- `.claude/settings.json` — denies --no-verify, --force, edits to protected paths
- `.claude/hooks/pre-tool-use.sh` — intercepts Claude Code tool calls; blocks bypass patterns
- `scripts/check` — wrapper: noslop check --tier=fast
- `scripts/fmt` — wrapper: runs php-cs-fixer for this pack
- `scripts/lint` — wrapper: runs PHPStan and PHPMD for this pack
- `scripts/test` — wrapper: runs PHPUnit for this pack
- `AGENTS.md` — plain-language rules for AI coding agents
- `phpstan.neon` — PHPStan configuration (level 8, strictest)
- `phpmd.xml` — PHPMD ruleset (complexity, size, unused code)

## Quality rules

| Config file  | Rule                  | Threshold                                         |
| ------------ | --------------------- | ------------------------------------------------- |
| phpmd.xml    | Cyclomatic complexity | CC ≤ 10                                           |
| phpmd.xml    | NPath complexity      | combinatorial alternative to cognitive complexity |
| phpmd.xml    | Function length       | ≤ 80 lines                                        |
| phpmd.xml    | File length           | ≤ 350 lines                                       |
| phpmd.xml    | Parameter count       | ≤ 4                                               |
| phpstan.neon | Type strictness       | level 8 (strictest)                               |
| phpmd.xml    | Unused code           | error                                             |

> **Note:** Cognitive complexity is not enforced — no PHP tool exposes cognitive complexity; PHPMD provides NPath complexity as a combinatorial alternative. Nesting depth is not enforced — PHPMD has no depth rule; PHPStan level 8 covers type correctness.

## Gate tiers

| Tier | Trigger        | Command run                                            |
| ---- | -------------- | ------------------------------------------------------ |
| fast | pre-commit     | `php-cs-fixer fix --dry-run --diff`, `phpstan analyse` |
| slow | pre-push       | `phpunit`                                              |
| ci   | GitHub Actions | (quality.yml runs fast + slow gates)                   |

## Verifying

```
$ noslop doctor
✓ .githooks/pre-commit present and executable
✓ .githooks/pre-push present and executable
✓ .githooks/commit-msg present and executable
✓ git config core.hooksPath = .githooks
✓ .github/workflows/quality.yml present
✓ .github/workflows/guardrails.yml present
✓ .claude/settings.json present
✓ .claude/hooks/pre-tool-use.sh present

All checks passed.
```

## Troubleshooting

- **`phpstan.neon` not found** — Re-run `noslop install` to regenerate the config file.
- **`phpmd` not in PATH** — Install globally with `composer global require phpmd/phpmd` and ensure Composer's global bin directory is in your `$PATH`.
- **PHPUnit autoloader missing** — Run `composer dump-autoload` to regenerate the autoloader, then retry `scripts/test`.
- **php-cs-fixer reports "file not found" errors** — Ensure you are running from the project root where `composer.json` lives.
