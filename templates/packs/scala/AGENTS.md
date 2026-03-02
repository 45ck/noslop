# Agent Guidelines

This repo is protected by **noslop** quality gates.

## Before every commit

```sh
noslop check --tier=fast
# or: sbt scalafmtCheckAll && sbt scalafix
```

## Before opening a PR

```sh
noslop check --tier=slow
# or: sbt test
```

## Rules

- Never use `git commit --no-verify`
- Never use `git push --force` without explicit human approval
- Fix all Scalafix violations; do not add `@SuppressWarnings` without justification

## Verify your setup

```sh
noslop doctor
```
