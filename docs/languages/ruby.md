# Ruby — noslop pack

> Enforces complexity limits, code size rules, and consistent style via RuboCop.

## Prerequisites

- Ruby
- [Bundler](https://bundler.io/)
- [RuboCop](https://rubocop.org/) (`gem install rubocop`)
- [RSpec](https://rspec.info/) (`gem install rspec`)

## Install

```sh
noslop init --pack ruby   # or: auto-detected from Gemfile
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
- `.rubocop.yml` — RuboCop configuration with complexity, size, and style rules

## Quality rules

| Config file  | Rule                                                                         | Threshold                                                                                                                             |
| ------------ | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| .rubocop.yml | Cyclomatic complexity                                                        | <= 10                                                                                                                                 |
| .rubocop.yml | Cognitive complexity (Perceived complexity — proxy for cognitive complexity) | <= 15                                                                                                                                 |
| .rubocop.yml | Function length                                                              | <= 80 lines                                                                                                                           |
| .rubocop.yml | File length                                                                  | <= 350 lines                                                                                                                          |
| .rubocop.yml | Max parameters                                                               | <= 4                                                                                                                                  |
| .rubocop.yml | Max nesting depth                                                            | <= 4                                                                                                                                  |
| .rubocop.yml | Type strictness                                                              | Not enforced (Ruby is dynamically typed; Sorbet requires codebase-wide adoption which noslop cannot enable without modifying Gemfile) |
| .rubocop.yml | Unused variables (Lint cops)                                                 | Error                                                                                                                                 |

## Gate tiers

| Tier | Trigger        | Command run                        |
| ---- | -------------- | ---------------------------------- |
| fast | pre-commit     | `rubocop --only Layout`, `rubocop` |
| slow | pre-push       | `rspec`                            |
| ci   | GitHub Actions | None                               |

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

- **RuboCop version mismatch** — Pin RuboCop version in your `Gemfile` to avoid incompatible `.rubocop.yml` directives. Run `bundle update rubocop` to align versions.
- **`bundler exec` needed** — If RuboCop is installed via Bundler, run `bundle exec rubocop` instead of `rubocop` directly to ensure the correct version is used.
- **RSpec not found** — Add `gem 'rspec'` to your `Gemfile` and run `bundle install`. The slow gate expects `rspec` to be available.
