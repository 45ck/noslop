# Haskell — noslop pack

> Enforces idiomatic style via HLint, consistent formatting via Ormolu, and compiler strictness with warnings-as-errors.

## Prerequisites

| Tool   | Version | Install                                       |
| ------ | ------- | --------------------------------------------- |
| GHC    | 9+      | [haskell.org](https://www.haskell.org/ghcup/) |
| Cabal  | latest  | Included with GHCup                           |
| Ormolu | latest  | `cabal install ormolu` or via GHCup           |
| HLint  | latest  | `cabal install hlint` or via GHCup            |

## Install

```sh
noslop init --pack haskell   # or: auto-detected from .cabal
noslop doctor
```

## What gets installed

Shared plumbing (`.githooks/`, `.github/workflows/`, `.claude/`, `scripts/`, `AGENTS.md`) — see [What gets dropped into your repo](../../README.md#what-gets-dropped-into-your-repo).

Additionally: `.hlint.yaml` — HLint configuration (style rules, unused code detection)

## Quality rules

| Config file | Rule            | Threshold                                        |
| ----------- | --------------- | ------------------------------------------------ |
| .hlint.yaml | Unused code     | error                                            |
| (compiler)  | Type strictness | strictest (GHC with -Werror, warnings-as-errors) |

> **Note:** Cyclomatic complexity, cognitive complexity, function length, file length, parameter count, and nesting depth are not enforced. HLint is a style linter, not a metrics tool. Haskell's type system and referential transparency make classical OOP-era complexity metrics largely inapplicable -- a function with complexity 20 in imperative code often has complexity 2 when expressed as pattern matching.

## Gate tiers

| Tier | Trigger        | Command                                                                                                                                    |
| ---- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| fast | pre-commit     | `ormolu --mode=check $(find . -name "*.hs" -not -path "./.stack-work/*")`                                                                  |
| fast | pre-commit     | `hlint .`                                                                                                                                  |
| fast | pre-commit     | `typos` (spell)                                                                                                                            |
| slow | pre-push       | `cabal build`                                                                                                                              |
| slow | pre-push       | `cabal test`                                                                                                                               |
| ci   | GitHub Actions | `ormolu --mode=check $(find . -name "*.hs" -not -path "./.stack-work/*") && hlint . && typos && cabal build && cabal test` (full pipeline) |

## Verifying

```sh
noslop doctor
```

See [Quick start](../../README.md#quick-start) for expected output.

## Troubleshooting

- **Ormolu version mismatch** — Ormolu formatting output can change between versions. Pin the same version in CI and locally via GHCup: `ghcup install ormolu <version>`.
- **HLint suggestions treated as errors** — The `.hlint.yaml` config may promote suggestions to errors. To demote a specific hint, add `- ignore: {name: "Hint Name"}` to `.hlint.yaml`.
- **cabal test cannot find test suite** — Ensure your `.cabal` file declares a `test-suite` component and that `cabal build` succeeds before running tests.
