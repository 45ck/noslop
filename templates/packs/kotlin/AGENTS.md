# Agent Guidelines

This repo is protected by **noslop** quality gates.

## Before every commit

```sh
noslop check --tier=fast
# or: ./gradlew ktlintCheck && ./gradlew detekt
```

## Before opening a PR

```sh
noslop check --tier=slow
# or: ./gradlew test
```

## Rules

- Never use `git commit --no-verify`
- Never use `git push --force` without explicit human approval
- Fix all Detekt violations; do not add `@Suppress` without justification

## Verify your setup

```sh
noslop doctor
```
