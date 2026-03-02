# Agent Guidelines

This repo is protected by **noslop** quality gates.

## Before every commit

```sh
noslop check --tier=fast
# or: swift-format lint --recursive . && swiftlint lint
```

## Before opening a PR

```sh
noslop check --tier=slow
# or: swift test
```

## Rules

- Never use `git commit --no-verify`
- Never use `git push --force` without explicit human approval
- Fix all SwiftLint violations; do not add `// swiftlint:disable` without justification

## Verify your setup

```sh
noslop doctor
```
