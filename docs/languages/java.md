# Java — noslop pack

> Enforces cyclomatic complexity, code size limits, and style consistency via Checkstyle and PMD.

## Prerequisites

- JDK 17+
- [Gradle](https://gradle.org/) or [Maven](https://maven.apache.org/)

## Install

```sh
noslop init --pack java   # or: auto-detected from pom.xml or build.gradle
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
- `checkstyle.xml` — Checkstyle configuration for style and size rules
- `pmd.xml` — PMD configuration for complexity and unused code detection

## Quality rules

| Config file              | Rule                                             | Threshold                                                                                                                    |
| ------------------------ | ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| pmd.xml                  | Cyclomatic complexity (PMD CyclomaticComplexity) | <= 10                                                                                                                        |
| pmd.xml                  | Cognitive complexity                             | Not enforced (no standard Java tool exposes cognitive complexity as a configurable rule)                                     |
| checkstyle.xml           | Function length                                  | <= 80 lines                                                                                                                  |
| checkstyle.xml           | File length                                      | <= 350 lines                                                                                                                 |
| checkstyle.xml / pmd.xml | Max parameters                                   | <= 4                                                                                                                         |
| checkstyle.xml           | Max nesting depth                                | <= 4                                                                                                                         |
| compiler                 | Type strictness                                  | Not enforced (JVM enforces at compile time; SpotBugs/NullAway add null-safety but require build plugin noslop cannot inject) |
| pmd.xml                  | Unused variables                                 | Error                                                                                                                        |

## Gate tiers

| Tier | Trigger        | Command                                                                                                                                    |
| ---- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| fast | pre-commit     | `./gradlew checkstyleMain checkstyleTest -q`                                                                                               |
| fast | pre-commit     | `./gradlew pmdMain -q`                                                                                                                     |
| fast | pre-commit     | `typos` (spell)                                                                                                                            |
| slow | pre-push       | `./gradlew build -x test`                                                                                                                  |
| slow | pre-push       | `./gradlew test`                                                                                                                           |
| ci   | GitHub Actions | `./gradlew checkstyleMain checkstyleTest -q && ./gradlew pmdMain -q && typos && ./gradlew build -x test && ./gradlew test` (full pipeline) |
| ci   | GitHub Actions | `./gradlew pitest` (mutation testing)                                                                                                      |

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

- **`gradlew` not executable** — Run `chmod +x gradlew` to make the Gradle wrapper executable. On Windows, use `gradlew.bat` instead.
- **Checkstyle config not found** — Ensure `checkstyle.xml` is in the project root and your `build.gradle` references it with `configFile = file('checkstyle.xml')` in the `checkstyle` block.
- **PMD plugin not applied** — Add `id 'pmd'` to your `build.gradle` plugins block and configure the `pmd` block to reference `pmd.xml`.
- **Maven projects** — Replace `./gradlew` commands with the equivalent Maven plugin goals (`mvn checkstyle:check`, `mvn pmd:check`, `mvn test`).
