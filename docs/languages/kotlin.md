# Kotlin — noslop pack

> Enforces complexity limits, code size rules, and consistent formatting via detekt and ktlint.

## Prerequisites

- JDK 17+
- [Kotlin](https://kotlinlang.org/)
- [ktlint](https://pinterest.github.io/ktlint/)
- [detekt](https://detekt.dev/) (Gradle plugin)

## Install

```sh
noslop init --pack kotlin   # or: auto-detected from build.gradle with .kt files present
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
- `scripts/fmt` — wrapper: runs the formatter for this pack
- `scripts/lint` — wrapper: runs the linter for this pack
- `scripts/test` — wrapper: runs the test suite for this pack
- `AGENTS.md` — plain-language rules for AI coding agents
- `detekt.yml` — detekt configuration with complexity, size, and style rules

## Quality rules

| Config file | Rule                  | Threshold                   |
| ----------- | --------------------- | --------------------------- |
| detekt.yml  | Cyclomatic complexity | <= 10                       |
| detekt.yml  | Cognitive complexity  | <= 15                       |
| detekt.yml  | Function length       | <= 80 lines                 |
| detekt.yml  | File length           | <= 350 lines                |
| detekt.yml  | Max parameters        | <= 4                        |
| detekt.yml  | Max nesting depth     | <= 4                        |
| compiler    | Type strictness       | Strictest (Kotlin compiler) |
| detekt.yml  | Unused variables      | Error                       |

## Gate tiers

| Tier | Trigger        | Command run                                   |
| ---- | -------------- | --------------------------------------------- |
| fast | pre-commit     | `ktlint --reporter=plain`, `./gradlew detekt` |
| slow | pre-push       | `./gradlew test`                              |
| ci   | GitHub Actions | None                                          |

## Verifying

Expected output of `noslop doctor` for a healthy install:

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

- **detekt plugin not in `build.gradle`** — Add `id("io.gitlab.arturbosch.detekt")` to your `plugins` block and configure detekt to use the `detekt.yml` config file.
- **ktlint version mismatch** — Pin ktlint version in your build configuration. Different versions may have incompatible formatting rules. Use `ktlint --version` to check.
- **`gradlew` not executable** — Run `chmod +x gradlew` to make the Gradle wrapper executable. On Windows, use `gradlew.bat` instead.
