# Agent Guidelines

This repo is protected by **noslop** quality gates.

## Before every commit

```sh
noslop check --tier=fast
# or: dotnet format --verify-no-changes
```

## Before opening a PR

```sh
noslop check --tier=slow
# or: dotnet build /warnaserror && dotnet test
```

## Rules

- Never use `git commit --no-verify`
- Never use `git push --force` without explicit human approval
- Do not modify `AGENTS.md`, `.noslop.json`, `.githooks/`, `.github/workflows/`, `.claude/`, or `scripts/guardrails/` without the `noslop-approved` PR label
- Fix all build warnings; do not use `#pragma warning disable` without justification
- Maintainers changing protected gate files should use `node scripts/guardrails/unlock-protected-config.mjs "<reason>"` immediately before staging the change

## Verify your setup

```sh
noslop doctor
```
