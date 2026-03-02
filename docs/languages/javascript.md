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
- `eslint.config.js` — ESLint flat config with sonarjs complexity rules

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
- **ESLint flat config not recognized** — Ensure you are using ESLint 9+. Older versions do not support `eslint.config.js` flat config format.
- **`npm test` not defined** — The slow gate runs `npm test`. Add a `test` script to your `package.json` or the pre-push hook will fail.
