# Agent Guidelines

This repo is protected by **noslop** quality gates.

## Before every commit

```sh
noslop check --tier=fast
# or: dart format --output=none --set-exit-if-changed . && dart analyze
```

## Before opening a PR

```sh
noslop check --tier=slow
# or: dart test
```

## Rules

- Never use `git commit --no-verify`
- Never use `git push --force` without explicit human approval
- Fix all `dart analyze` warnings; do not add `// ignore:` without justification

## Verify your setup

```sh
noslop doctor
```
