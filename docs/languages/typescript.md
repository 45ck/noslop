# TypeScript — noslop pack

> Enforces strict type safety, complexity limits, and formatting via ESLint, Prettier, and the TypeScript compiler.

## Prerequisites

- [Node.js 22+](https://nodejs.org/)
- npm
- TypeScript (`npm install -D typescript`)
- [Prettier](https://prettier.io/)
- [ESLint](https://eslint.org/)

## Install

```sh
noslop init --pack typescript   # or: auto-detected from tsconfig.json or package.json
noslop doctor
```

## What gets installed

- `.githooks/pre-commit` — runs fast gates before every commit
- `.githooks/pre-push` — runs slow gates before every push
- `.githooks/commit-msg` — enforces Conventional Commits format; blocks [skip ci] patterns
- `.github/workflows/quality.yml` — required CI check on PRs and pushes to main
- `.github/workflows/guardrails.yml` — blocks PRs touching protected files without noslop-approved label
- `.claude/settings.json` — denies --no-verify, --force, edits to protected paths
- `.claude/hooks/pre-tool-use.sh` — intercepts Claude Code tool calls; blocks bypass patterns
- `scripts/check` — wrapper: noslop check --tier=fast
- `scripts/fmt` — wrapper: runs the formatter for this pack
- `scripts/lint` — wrapper: runs the linter for this pack
- `scripts/test` — wrapper: runs the test suite for this pack
- `AGENTS.md` — plain-language rules for AI coding agents
- `eslint.config.js` — ESLint flat config with strict TypeScript and sonarjs rules

## Quality rules

| Config file      | Rule                           | Threshold    |
| ---------------- | ------------------------------ | ------------ |
| eslint.config.js | Cyclomatic complexity          | <= 10        |
| eslint.config.js | Cognitive complexity (sonarjs) | <= 15        |
| eslint.config.js | Function length                | <= 80 lines  |
| eslint.config.js | File length                    | <= 350 lines |
| eslint.config.js | Max parameters                 | <= 4         |
| eslint.config.js | Max nesting depth              | <= 4         |
| eslint.config.js | Type strictness (ts-eslint)    | Strictest    |
| eslint.config.js | Unused variables               | Error        |

## Gate tiers

| Tier | Trigger        | Command                                     |
| ---- | -------------- | ------------------------------------------- |
| fast | pre-commit     | `prettier . --check`                        |
| fast | pre-commit     | `eslint . --max-warnings=0`                 |
| fast | pre-commit     | `cspell --no-progress "{src}/**/*"` (spell) |
| slow | pre-push       | `tsc -p tsconfig.json --noEmit`             |
| slow | pre-push       | `vitest run`                                |
| ci   | GitHub Actions | `npm run ci` (full pipeline)                |
| ci   | GitHub Actions | `npx stryker run` (mutation testing)        |

## Verifying

Expected output of `noslop doctor` for a healthy install:

```
$ noslop doctor
✓ .githooks/pre-commit present and executable
✓ .githooks/pre-push present and executable
✓ .githooks/commit-msg present and executable
✓ git config core.hooksPath = .githooks
✓ .github/workflows/quality.yml present
✓ .github/workflows/guardrails.yml present
✓ .claude/settings.json present
✓ .claude/hooks/pre-tool-use.sh present

All checks passed.
```

## Troubleshooting

- **ESLint or Prettier not installed** — Run `npm install` to restore dev dependencies. Both are required for the fast gate.
- **`tsconfig.json` missing `strictNullChecks`** — The TypeScript pack assumes strict mode. Add `"strict": true` to your `tsconfig.json` `compilerOptions`.
- **cspell false positives** — Add project-specific words to `project-words.txt` or a `cspell.json` dictionary file.
- **ESLint flat config not recognized** — Ensure you are using ESLint 9+. Older versions do not support `eslint.config.js` flat config format.
