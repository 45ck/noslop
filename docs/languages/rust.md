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

Shared plumbing (`.githooks/`, `.github/workflows/`, `.claude/`, `scripts/`, `AGENTS.md`) — see [What gets dropped into your repo](../../README.md#what-gets-dropped-into-your-repo).

Additionally: `clippy.toml` — Clippy configuration with cognitive complexity and parameter limits

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

| Tier | Trigger        | Command                                                                                                  |
| ---- | -------------- | -------------------------------------------------------------------------------------------------------- |
| fast | pre-commit     | `cargo fmt --check`                                                                                      |
| fast | pre-commit     | `cargo clippy -- -D warnings`                                                                            |
| fast | pre-commit     | `typos` (spell)                                                                                          |
| slow | pre-push       | `cargo build`                                                                                            |
| slow | pre-push       | `cargo test`                                                                                             |
| ci   | GitHub Actions | `cargo fmt --check && cargo clippy -- -D warnings && typos && cargo build && cargo test` (full pipeline) |
| ci   | GitHub Actions | `cargo mutants` (mutation testing)                                                                       |

## Verifying

```sh
noslop doctor
```

See [Quick start](../../README.md#quick-start) for expected output.

## Troubleshooting

- **clippy not installed** — Run `rustup component add clippy` to add the Clippy linter to your toolchain.
- **`cargo fmt` requires nightly** — Some formatting options require the nightly toolchain. Run `rustup install nightly` and use `cargo +nightly fmt` if needed.
- **`cargo clippy` warnings treated as errors** — The `-D warnings` flag promotes all warnings to errors. Fix the reported issues or allow specific lints with `#[allow(...)]` attributes where justified.
