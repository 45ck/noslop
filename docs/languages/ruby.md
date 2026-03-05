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

Shared plumbing (`.githooks/`, `.github/workflows/`, `.claude/`, `scripts/`, `AGENTS.md`) — see [What gets dropped into your repo](../../README.md#what-gets-dropped-into-your-repo).

Additionally: `.rubocop.yml` — RuboCop configuration with complexity, size, and style rules

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

| Tier | Trigger        | Command                                                                            |
| ---- | -------------- | ---------------------------------------------------------------------------------- |
| fast | pre-commit     | `bundle exec rubocop --only Layout --format=quiet`                                 |
| fast | pre-commit     | `bundle exec rubocop --format=quiet`                                               |
| fast | pre-commit     | `typos` (spell)                                                                    |
| slow | pre-push       | `bundle exec rspec`                                                                |
| ci   | GitHub Actions | `bundle exec rubocop --format=quiet && typos && bundle exec rspec` (full pipeline) |
| ci   | GitHub Actions | `bundle exec mutant run` (mutation testing)                                        |

## Verifying

```sh
noslop doctor
```

See [Quick start](../../README.md#quick-start) for expected output.

## Troubleshooting

- **RuboCop version mismatch** — Pin RuboCop version in your `Gemfile` to avoid incompatible `.rubocop.yml` directives. Run `bundle update rubocop` to align versions.
- **`bundler exec` needed** — If RuboCop is installed via Bundler, run `bundle exec rubocop` instead of `rubocop` directly to ensure the correct version is used.
- **RSpec not found** — Add `gem 'rspec'` to your `Gemfile` and run `bundle install`. The slow gate expects `rspec` to be available.
