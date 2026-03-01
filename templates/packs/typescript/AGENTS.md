# Agent Guidelines

This repo is protected by **noslop** quality gates.

## Before every commit

```sh
noslop check --tier=fast
```

## Before opening a PR

```sh
noslop check --tier=slow
```

## Rules

- Never use `git commit --no-verify`
- Never use `git push --force` without explicit human approval
- Do not modify `.githooks/`, `.github/workflows/`, or `.claude/settings.json` without the `noslop-approved` PR label
- Fix lint/type errors; do not disable rules

## Verify your setup

```sh
noslop doctor
```
