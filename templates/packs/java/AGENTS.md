# Agent Guidelines

This repo is protected by **noslop** quality gates.

## Before every commit

```sh
noslop check --tier=fast
# or: ./gradlew checkstyleMain checkstyleTest -q && ./gradlew pmdMain -q
```

## Before opening a PR

```sh
noslop check --tier=slow
# or: ./gradlew test
```

## Rules

- Never use `git commit --no-verify`
- Never use `git push --force` without explicit human approval
- Fix all Checkstyle and PMD violations; do not suppress without justification

## Verify your setup

```sh
noslop doctor
```
