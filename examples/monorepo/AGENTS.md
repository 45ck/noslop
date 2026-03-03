# Agent Guidelines

This repo is protected by **noslop** quality gates.

## Before every commit

```sh
noslop check --tier=fast
# or: dune build @fmt @check
```

## Before opening a PR

```sh
noslop check --tier=slow
# or: dune runtest
```

## Rules

- Never use `git commit --no-verify`
- Never use `git push --force` without explicit human approval
- Keep all source files `ocamlformat` clean; fix all dune build warnings

## Verify your setup

```sh
noslop doctor
```
