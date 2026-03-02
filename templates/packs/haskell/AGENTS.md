# Agent Guidelines

This repo is protected by **noslop** quality gates.

## Before every commit

```sh
noslop check --tier=fast
# or: ormolu --mode=check $(find . -name "*.hs") && hlint .
```

## Before opening a PR

```sh
noslop check --tier=slow
# or: cabal test
```

## Rules

- Never use `git commit --no-verify`
- Never use `git push --force` without explicit human approval
- Fix all HLint suggestions; do not add `{-# ANN ... #-}` suppressions without justification

## Verify your setup

```sh
noslop doctor
```
