# Agent Guidelines

This repo is protected by **noslop** quality gates.

## Before every commit

```sh
noslop check --tier=fast
# or: stylua --check . && luacheck .
```

## Before opening a PR

```sh
noslop check --tier=slow
# or: busted
```

## Rules

- Never use `git commit --no-verify`
- Never use `git push --force` without explicit human approval
- Fix all luacheck warnings; do not add `--ignore` suppressions without justification

## Verify your setup

```sh
noslop doctor
```
