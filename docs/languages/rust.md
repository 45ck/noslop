# Rust — noslop pack

> Enforces cognitive complexity limits, strict compiler warnings, and consistent formatting via Clippy and rustfmt.

## Prerequisites

- [Rust toolchain](https://rustup.rs/) (rustup, cargo, rustfmt, clippy)

## Install

```sh
noslop init --pack rust   # or: auto-detected from Cargo.toml
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
- `clippy.toml` — Clippy configuration with cognitive complexity and parameter limits

## Quality rules

| Config file | Rule                  | Threshold                                                                                               |
| ----------- | --------------------- | ------------------------------------------------------------------------------------------------------- |
| clippy.toml | Cyclomatic complexity | Not enforced (Clippy's cyclomatic lint was deprecated; cognitive complexity is enforced instead)        |
| clippy.toml | Cognitive complexity  | <= 15                                                                                                   |
| clippy.toml | Function length       | <= 80 lines                                                                                             |
| clippy.toml | File length           | Not enforced (borrow checker and ownership model make deeply nested large files structurally difficult) |
| clippy.toml | Max parameters        | <= 4                                                                                                    |
| clippy.toml | Max nesting depth     | Not enforced (ownership model)                                                                          |
| compiler    | Type strictness       | Strictest (compiler-enforced)                                                                           |
| compiler    | Unused variables      | Error (compiler-enforced)                                                                               |

## Gate tiers

| Tier | Trigger        | Command run                                                      |
| ---- | -------------- | ---------------------------------------------------------------- |
| fast | pre-commit     | `cargo fmt --check`, `cargo clippy -- -D warnings`               |
| slow | pre-push       | `cargo test`                                                     |
| ci   | GitHub Actions | `cargo fmt --check && cargo clippy -- -D warnings && cargo test` |

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

- **clippy not installed** — Run `rustup component add clippy` to add the Clippy linter to your toolchain.
- **`cargo fmt` requires nightly** — Some formatting options require the nightly toolchain. Run `rustup install nightly` and use `cargo +nightly fmt` if needed.
- **`cargo clippy` warnings treated as errors** — The `-D warnings` flag promotes all warnings to errors. Fix the reported issues or allow specific lints with `#[allow(...)]` attributes where justified.
