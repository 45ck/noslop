# Agent Guidelines

This repo is protected by **noslop** quality gates.

## Before every commit

```sh
noslop check --tier=fast
# or: bundle exec rubocop --format=quiet
```

## Before opening a PR

```sh
noslop check --tier=slow
# or: bundle exec rspec
```

## Rules

- Never use `git commit --no-verify`
- Never use `git push --force` without explicit human approval
- Fix all RuboCop offences; do not add `# rubocop:disable` without justification

## Verify your setup

```sh
noslop doctor
```
