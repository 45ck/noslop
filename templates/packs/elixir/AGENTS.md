# Agent Guidelines

This repo is protected by **noslop** quality gates.

## Before every commit

```sh
noslop check --tier=fast
# or: mix format --check-formatted && mix credo --strict
```

## Before opening a PR

```sh
noslop check --tier=slow
# or: mix test
```

## Rules

- Never use `git commit --no-verify`
- Never use `git push --force` without explicit human approval
- Fix all Credo violations at `--strict` level; do not add `# credo:disable` without justification

## Verify your setup

```sh
noslop doctor
```
