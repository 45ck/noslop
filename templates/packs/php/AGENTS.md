# Agent Guidelines

This repo is protected by **noslop** quality gates.

## Before every commit

```sh
noslop check --tier=fast
# or: vendor/bin/php-cs-fixer check . && vendor/bin/phpstan analyse
```

## Before opening a PR

```sh
noslop check --tier=slow
# or: vendor/bin/phpunit
```

## Rules

- Never use `git commit --no-verify`
- Never use `git push --force` without explicit human approval
- Fix all PHPStan violations at the configured level; do not lower the level without justification

## Verify your setup

```sh
noslop doctor
```
