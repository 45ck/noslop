# Agent Guidelines

This repo is protected by **noslop** quality gates.

## Before every commit

```sh
noslop check --tier=fast
# or: test -z "$(gofmt -l .)" && go vet ./...
```

## Before opening a PR

```sh
noslop check --tier=slow
# or: go test ./...
```

## Rules

- Never use `git commit --no-verify`
- Never use `git push --force` without explicit human approval
- Fix all `go vet` warnings before committing

## Verify your setup

```sh
noslop doctor
```
