# Elixir — noslop pack

> Enforces code consistency with Credo, type correctness with Dialyzer, and standard formatting via mix format.

## Prerequisites

| Tool     | Version   | Install                                                 |
| -------- | --------- | ------------------------------------------------------- |
| Elixir   | 1.14+     | [elixir-lang.org](https://elixir-lang.org/install.html) |
| mix      | (bundled) | Included with Elixir                                    |
| Dialyzer | (bundled) | Included with Erlang/OTP                                |

## Install

```sh
noslop init --pack elixir   # or: auto-detected from mix.exs
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
- `scripts/fmt` — wrapper: runs mix format for this pack
- `scripts/lint` — wrapper: runs mix credo for this pack
- `scripts/test` — wrapper: runs mix test for this pack
- `AGENTS.md` — plain-language rules for AI coding agents
- `.credo.exs` — Credo configuration (complexity, length, arity checks)

## Quality rules

| Config file | Rule                    | Threshold                       |
| ----------- | ----------------------- | ------------------------------- |
| .credo.exs  | Cyclomatic complexity   | CC ≤ 10                         |
| .credo.exs  | Function length         | ≤ 80 lines                      |
| .credo.exs  | Parameter count (arity) | ≤ 4                             |
| .credo.exs  | Nesting depth           | ≤ 4                             |
| .credo.exs  | Unused code             | error                           |
| (dialyzer)  | Type strictness         | strictest (Dialyzer type specs) |

> **Note:** Cognitive complexity is not enforced — Credo has no cognitive complexity check. Elixir's functional style with small composable functions means file length is less meaningful than in OOP languages; Credo's module-level checks partially cover this.

## Gate tiers

| Tier | Trigger        | Command                                                                                                   |
| ---- | -------------- | --------------------------------------------------------------------------------------------------------- |
| fast | pre-commit     | `mix format --check-formatted`                                                                            |
| fast | pre-commit     | `mix credo --strict`                                                                                      |
| fast | pre-commit     | `typos` (spell)                                                                                           |
| slow | pre-push       | `mix dialyzer`                                                                                            |
| slow | pre-push       | `mix test`                                                                                                |
| ci   | GitHub Actions | `mix format --check-formatted && mix credo --strict && typos && mix dialyzer && mix test` (full pipeline) |

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

- **mix credo fails with "Credo not found"** — Add `{:credo, "~> 1.7", only: [:dev, :test], runtime: false}` to your `mix.exs` deps and run `mix deps.get`.
- **Dialyzer PLT not built** — Run `mix dialyzer --plt` to build the Persistent Lookup Table before first use. This can take several minutes.
- **mix format reports differences but files look correct** — Ensure your editor is not adding trailing whitespace or using a different line-ending style. Run `mix format` to auto-fix.
