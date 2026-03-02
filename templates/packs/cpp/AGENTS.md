# Agent Guidelines

This repo is protected by **noslop** quality gates.

## Before every commit

```sh
noslop check --tier=fast
# or: clang-format --dry-run --Werror <files> && cppcheck --error-exitcode=1 .
```

## Before opening a PR

```sh
noslop check --tier=slow
# or: cmake -B build && cmake --build build && ctest --test-dir build
```

## Rules

- Never use `git commit --no-verify`
- Never use `git push --force` without explicit human approval
- Fix all cppcheck errors; do not use suppression comments without justification

## Verify your setup

```sh
noslop doctor
```
