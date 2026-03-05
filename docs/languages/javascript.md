# JavaScript — noslop pack

> Enforces complexity limits and formatting via ESLint and Prettier for plain JavaScript projects.

## Prerequisites

- [Node.js 22+](https://nodejs.org/)
- npm

## Install

```sh
noslop init --pack javascript   # or: auto-detected from package.json
noslop doctor
```

## What gets installed

Shared plumbing (`.githooks/`, `.github/workflows/`, `.claude/`, `scripts/`, `AGENTS.md`) — see [What gets dropped into your repo](../../README.md#what-gets-dropped-into-your-repo).

Additionally: `eslint.config.js` — ESLint flat config with sonarjs complexity rules

## Quality rules

| Config file      | Rule                           | Threshold                                                                                   |
| ---------------- | ------------------------------ | ------------------------------------------------------------------------------------------- |
| eslint.config.js | Cyclomatic complexity          | <= 10                                                                                       |
| eslint.config.js | Cognitive complexity (sonarjs) | <= 15                                                                                       |
| eslint.config.js | Function length                | <= 80 lines                                                                                 |
| eslint.config.js | File length                    | <= 350 lines                                                                                |
| eslint.config.js | Max parameters                 | <= 4                                                                                        |
| eslint.config.js | Max nesting depth              | <= 4                                                                                        |
| eslint.config.js | Type strictness                | Not enforced (no type system)                                                               |
| eslint.config.js | Unused variables               | Not enforced (false positives in plain JS — add TypeScript for type-level unused detection) |

## Gate tiers

| Tier | Trigger        | Command                                                                                                   |
| ---- | -------------- | --------------------------------------------------------------------------------------------------------- |
| fast | pre-commit     | `npx prettier --check .`                                                                                  |
| fast | pre-commit     | `npx eslint .`                                                                                            |
| fast | pre-commit     | `cspell --no-progress "{src}/**/*"` (spell)                                                               |
| slow | pre-push       | `npm test`                                                                                                |
| ci   | GitHub Actions | `npx prettier --check . && npx eslint . && cspell --no-progress "{src}/**/*" && npm test` (full pipeline) |
| ci   | GitHub Actions | `npx stryker run` (mutation testing)                                                                      |

## Verifying

```sh
noslop doctor
```

See [Quick start](../../README.md#quick-start) for expected output.

## Troubleshooting

- **ESLint or Prettier not installed** — Run `npm install` to restore dev dependencies. Both are required for the fast gate.
- **ESLint flat config not recognized** — Ensure you are using ESLint 9+. Older versions do not support `eslint.config.js` flat config format.
- **`npm test` not defined** — The slow gate runs `npm test`. Add a `test` script to your `package.json` or the pre-push hook will fail.
- **cspell fails in Windows git hooks when using lint-staged** — cspell v8+ spawns a worker process that fails inside lint-staged v16 on Windows. Run cspell via noslop (`noslop check --tier=fast`) rather than invoking it directly from lint-staged. Alternatively, use `noslop init --no-spell` and add cspell to CI only.
