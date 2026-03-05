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

Shared plumbing (`.githooks/`, `.github/workflows/`, `.claude/`, `scripts/`, `AGENTS.md`) — see [What gets dropped into your repo](../../README.md#what-gets-dropped-into-your-repo).

Additionally: `analysis_options.yaml` — Dart analysis configuration (strict mode)

## Quality rules

| Config file           | Rule            | Threshold                            |
| --------------------- | --------------- | ------------------------------------ |
| analysis_options.yaml | Type strictness | strictest (dart analyze strict mode) |

> **Note:** Cyclomatic complexity, cognitive complexity, function length, file length, parameter count, nesting depth, and unused code are not enforced by the default toolchain. The `dart_code_metrics` package adds all 8 categories but requires a `dev_dependencies` entry in `pubspec.yaml`, which noslop cannot add without modifying project files it does not own.

## Gate tiers

| Tier | Trigger        | Command                                                                                                   |
| ---- | -------------- | --------------------------------------------------------------------------------------------------------- |
| fast | pre-commit     | `dart format --output=none --set-exit-if-changed .`                                                       |
| fast | pre-commit     | `dart analyze`                                                                                            |
| fast | pre-commit     | `typos` (spell)                                                                                           |
| slow | pre-push       | `dart test`                                                                                               |
| ci   | GitHub Actions | `dart format --output=none --set-exit-if-changed . && dart analyze && typos && dart test` (full pipeline) |

## Verifying

```sh
noslop doctor
```

See [Quick start](../../README.md#quick-start) for expected output.

## Troubleshooting

- **dart analyze reports errors in generated files** — Add generated file paths to the `exclude` list in `analysis_options.yaml` (e.g., `lib/**/*.g.dart`, `lib/**/*.freezed.dart`).
- **dart test cannot discover tests** — Ensure test files are in the `test/` directory and filenames end with `_test.dart`.
- **dart format reports differences on CI but not locally** — Verify you are using the same Dart SDK version locally and in CI. Format rules can differ between versions.
