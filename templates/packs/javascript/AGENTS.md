# Agent Guidelines

This repo is protected by **noslop** quality gates.

## Before every commit

```sh
noslop check --tier=fast
# or: npx prettier --check . && npx eslint .
```

## Before opening a PR

```sh
noslop check --tier=slow
# or: npm test
```

## Rules

- Never use `git commit --no-verify`
- Never use `git push --force` without explicit human approval
- Fix all ESLint warnings; do not disable rules without justification

## Verify your setup

```sh
noslop doctor
```
