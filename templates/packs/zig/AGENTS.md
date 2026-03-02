# Agent Guidelines

This repo is protected by **noslop** quality gates.

## Before every commit

```sh
noslop check --tier=fast
# or: zig fmt --check src/ && zig build
```

## Before opening a PR

```sh
noslop check --tier=slow
# or: zig build test
```

## Rules

- Never use `git commit --no-verify`
- Never use `git push --force` without explicit human approval
- Keep all files `zig fmt` clean; format is enforced by the compiler community

## Verify your setup

```sh
noslop doctor
```
