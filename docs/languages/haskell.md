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

- `.githooks/pre-commit` — runs fast gates before every commit
- `.githooks/pre-push` — runs slow gates before every push
- `.githooks/commit-msg` — enforces Conventional Commits format; blocks [skip ci] patterns
- `.github/workflows/quality.yml` — required CI check on PRs and pushes to main
- `.github/workflows/guardrails.yml` — blocks PRs touching protected files without noslop-approved label
- `.claude/settings.json` — denies --no-verify, --force, edits to protected paths
- `.claude/hooks/pre-tool-use.sh` — intercepts Claude Code tool calls; blocks bypass patterns
- `scripts/check` — wrapper: noslop check --tier=fast
- `scripts/fmt` — wrapper: runs Ormolu for this pack
- `scripts/lint` — wrapper: runs HLint for this pack
- `scripts/test` — wrapper: runs cabal test for this pack
- `AGENTS.md` — plain-language rules for AI coding agents
- `.hlint.yaml` — HLint configuration (style rules, unused code detection)

## Quality rules

| Config file | Rule            | Threshold                                        |
| ----------- | --------------- | ------------------------------------------------ |
| .hlint.yaml | Unused code     | error                                            |
| (compiler)  | Type strictness | strictest (GHC with -Werror, warnings-as-errors) |

> **Note:** Cyclomatic complexity, cognitive complexity, function length, file length, parameter count, and nesting depth are not enforced. HLint is a style linter, not a metrics tool. Haskell's type system and referential transparency make classical OOP-era complexity metrics largely inapplicable -- a function with complexity 20 in imperative code often has complexity 2 when expressed as pattern matching.

## Gate tiers

| Tier | Trigger        | Command run                                             |
| ---- | -------------- | ------------------------------------------------------- |
| fast | pre-commit     | `ormolu --mode check $(find . -name '*.hs')`, `hlint .` |
| slow | pre-push       | `cabal test`                                            |
| ci   | GitHub Actions | (quality.yml runs fast + slow gates)                    |

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

- **Ormolu version mismatch** — Ormolu formatting output can change between versions. Pin the same version in CI and locally via GHCup: `ghcup install ormolu <version>`.
- **HLint suggestions treated as errors** — The `.hlint.yaml` config may promote suggestions to errors. To demote a specific hint, add `- ignore: {name: "Hint Name"}` to `.hlint.yaml`.
- **cabal test cannot find test suite** — Ensure your `.cabal` file declares a `test-suite` component and that `cabal build` succeeds before running tests.
