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

Shared plumbing (`.githooks/`, `.github/workflows/`, `.claude/`, `scripts/`, `AGENTS.md`) — see [What gets dropped into your repo](../../README.md#what-gets-dropped-into-your-repo).

Additionally: `eslint.config.js` — ESLint flat config with strict TypeScript and sonarjs rules

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

```sh
noslop doctor
```

See [Quick start](../../README.md#quick-start) for expected output.

## Troubleshooting

- **ESLint or Prettier not installed** — Run `npm install` to restore dev dependencies. Both are required for the fast gate.
- **`tsconfig.json` missing `strictNullChecks`** — The TypeScript pack assumes strict mode. Add `"strict": true` to your `tsconfig.json` `compilerOptions`.
- **cspell false positives** — Add project-specific words to `project-words.txt` or a `cspell.json` dictionary file.
- **ESLint flat config not recognized** — Ensure you are using ESLint 9+. Older versions do not support `eslint.config.js` flat config format.
- **cspell fails in Windows git hooks when using lint-staged** — cspell v8+ spawns a worker process that fails inside lint-staged v16 on Windows. Run cspell via noslop (`noslop check --tier=fast`) rather than invoking it directly from lint-staged. Alternatively, use `noslop init --no-spell` and add cspell to CI only.
