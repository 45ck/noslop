# Agent Guidelines

This repo is protected by **noslop** quality gates.

## Before every commit

```sh
noslop check --tier=fast
# or: cargo fmt --check && cargo clippy -- -D warnings
```

## Before opening a PR

```sh
noslop check --tier=slow
# or: cargo test
```

## Rules

- Never use `git commit --no-verify`
- Never use `git push --force` without explicit human approval
- Fix all `cargo clippy -- -D warnings` issues; do not add `#[allow(...)]` without justification

## Verify your setup

```sh
noslop doctor
```
