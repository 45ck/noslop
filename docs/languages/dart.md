# Dart — noslop pack

> Enforces strict static analysis via dart analyze and consistent formatting via dart format.

## Prerequisites

| Tool     | Version | Install                               |
| -------- | ------- | ------------------------------------- |
| Dart SDK | 3+      | [dart.dev](https://dart.dev/get-dart) |

## Install

```sh
noslop init --pack dart   # or: auto-detected from pubspec.yaml
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
- `scripts/fmt` — wrapper: runs dart format for this pack
- `scripts/lint` — wrapper: runs dart analyze for this pack
- `scripts/test` — wrapper: runs dart test for this pack
- `AGENTS.md` — plain-language rules for AI coding agents
- `analysis_options.yaml` — Dart analysis configuration (strict mode)

## Quality rules

| Config file           | Rule            | Threshold                            |
| --------------------- | --------------- | ------------------------------------ |
| analysis_options.yaml | Type strictness | strictest (dart analyze strict mode) |

> **Note:** Cyclomatic complexity, cognitive complexity, function length, file length, parameter count, nesting depth, and unused code are not enforced by the default toolchain. The `dart_code_metrics` package adds all 8 categories but requires a `dev_dependencies` entry in `pubspec.yaml`, which noslop cannot add without modifying project files it does not own.

## Gate tiers

| Tier | Trigger        | Command run                                   |
| ---- | -------------- | --------------------------------------------- |
| fast | pre-commit     | `dart format --output=none .`, `dart analyze` |
| slow | pre-push       | `dart test`                                   |
| ci   | GitHub Actions | (quality.yml runs fast + slow gates)          |

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

- **dart analyze reports errors in generated files** — Add generated file paths to the `exclude` list in `analysis_options.yaml` (e.g., `lib/**/*.g.dart`, `lib/**/*.freezed.dart`).
- **dart test cannot discover tests** — Ensure test files are in the `test/` directory and filenames end with `_test.dart`.
- **dart format reports differences on CI but not locally** — Verify you are using the same Dart SDK version locally and in CI. Format rules can differ between versions.
