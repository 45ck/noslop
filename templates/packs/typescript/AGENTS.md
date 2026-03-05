# Agent Guidelines

This repo is protected by **noslop** quality gates.

## Before every commit

```sh
noslop check --tier=fast
```

## Before opening a PR

```sh
noslop check --tier=slow
```

## Rules

- Never use `git commit --no-verify`
- Never use `git push --force` without explicit human approval
- Do not modify `AGENTS.md`, `.noslop.json`, `.githooks/`, `.github/workflows/`, `.claude/`, or `scripts/guardrails/` without the `noslop-approved` PR label
- Do not modify `eslint.config.*`, `prettier.config.*`, `tsconfig*.json`, `vitest.config.*`, `.dependency-cruiser*`, `knip.config.*`, `Directory.Build.props`, or `.editorconfig` without the same review path
- Fix lint/type errors; do not disable rules
- Maintainers changing protected gate files should use `node scripts/guardrails/unlock-protected-config.mjs "<reason>"` immediately before staging the change

## Verify your setup

```sh
noslop doctor
```
