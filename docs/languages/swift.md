# Swift — noslop pack

> Enforces complexity limits, code size rules, and consistent formatting via SwiftLint and swift-format.

## Prerequisites

- [Xcode](https://developer.apple.com/xcode/) or [Swift toolchain](https://swift.org/)
- [swift-format](https://github.com/apple/swift-format)
- [SwiftLint](https://github.com/realm/SwiftLint) (`brew install swiftlint`)

## Install

```sh
noslop init --pack swift   # or: auto-detected from Package.swift
noslop doctor
```

## What gets installed

Shared plumbing (`.githooks/`, `.github/workflows/`, `.claude/`, `scripts/`, `AGENTS.md`) — see [What gets dropped into your repo](../../README.md#what-gets-dropped-into-your-repo).

Additionally: `.swiftlint.yml` — SwiftLint configuration with complexity, size, and nesting rules

## Quality rules

| Config file    | Rule                             | Threshold                                                                                         |
| -------------- | -------------------------------- | ------------------------------------------------------------------------------------------------- |
| .swiftlint.yml | Cyclomatic complexity            | <= 10                                                                                             |
| .swiftlint.yml | Cognitive complexity             | Not enforced (SwiftLint has no cognitive complexity rule)                                         |
| .swiftlint.yml | Function length                  | <= 80 lines                                                                                       |
| .swiftlint.yml | File length                      | <= 350 lines                                                                                      |
| .swiftlint.yml | Max parameters                   | <= 4                                                                                              |
| .swiftlint.yml | Max nesting depth (nesting rule) | <= 4                                                                                              |
| compiler       | Type strictness                  | Strictest (Swift compiler)                                                                        |
| compiler       | Unused variables                 | Not enforced (handled by Swift compiler at -warnUnusedResult level; no separate lint rule needed) |

## Gate tiers

| Tier | Trigger        | Command                                                                                                   |
| ---- | -------------- | --------------------------------------------------------------------------------------------------------- |
| fast | pre-commit     | `swift-format lint --recursive .`                                                                         |
| fast | pre-commit     | `swiftlint lint`                                                                                          |
| fast | pre-commit     | `typos` (spell)                                                                                           |
| slow | pre-push       | `swift build`                                                                                             |
| slow | pre-push       | `swift test`                                                                                              |
| ci   | GitHub Actions | `swift-format lint --recursive . && swiftlint lint && typos && swift build && swift test` (full pipeline) |

## Verifying

```sh
noslop doctor
```

See [Quick start](../../README.md#quick-start) for expected output.

## Troubleshooting

- **SwiftLint not installed** — Install via Homebrew: `brew install swiftlint`. On Linux, download the binary from the [SwiftLint releases page](https://github.com/realm/SwiftLint/releases).
- **swift-format not in PATH** — Install via `brew install swift-format` or build from source. Ensure the binary location is in your PATH.
- **SwiftLint version incompatibility** — Some `.swiftlint.yml` keys change between major versions. Check `swiftlint version` and update the config if needed.
