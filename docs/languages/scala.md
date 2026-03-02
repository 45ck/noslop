# Scala — noslop pack

> Enforces consistent formatting via Scalafmt, automated refactoring rules via Scalafix, and removes unused code.

## Prerequisites

| Tool     | Version | Install                                                              |
| -------- | ------- | -------------------------------------------------------------------- |
| JDK      | 17+     | [adoptium.net](https://adoptium.net/)                                |
| sbt      | latest  | [scala-sbt.org](https://www.scala-sbt.org/)                          |
| Scalafmt | latest  | `cs install scalafmt` or sbt plugin                                  |
| Scalafix | latest  | sbt plugin: `addSbtPlugin("ch.epfl.scala" % "sbt-scalafix" % "...")` |

## Install

```sh
noslop init --pack scala   # or: auto-detected from build.sbt
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
- `scripts/fmt` — wrapper: runs Scalafmt for this pack
- `scripts/lint` — wrapper: runs Scalafix for this pack
- `scripts/test` — wrapper: runs sbt test for this pack
- `AGENTS.md` — plain-language rules for AI coding agents
- `.scalafix.conf` — Scalafix rules (RemoveUnused, organizing imports)

## Quality rules

| Config file    | Rule                | Threshold                                                                    |
| -------------- | ------------------- | ---------------------------------------------------------------------------- |
| .scalafix.conf | Unused code removal | error (RemoveUnused rule)                                                    |
| (compiler)     | Type safety         | strictest (Scala compiler strong type system + pattern-match exhaustiveness) |

> **Note:** Cyclomatic complexity, cognitive complexity, function length, file length, parameter count, and nesting depth are not enforced. Scalafix is an AST rewriter, not a metrics analyser. Scalastyle provides metrics but requires a `build.sbt` plugin entry that noslop cannot safely inject.

## Gate tiers

| Tier | Trigger        | Command                                                                                       |
| ---- | -------------- | --------------------------------------------------------------------------------------------- |
| fast | pre-commit     | `sbt scalafmtCheckAll`                                                                        |
| fast | pre-commit     | `sbt "scalafix --check"`                                                                      |
| fast | pre-commit     | `typos` (spell)                                                                               |
| slow | pre-push       | `sbt compile`                                                                                 |
| slow | pre-push       | `sbt test`                                                                                    |
| ci   | GitHub Actions | `sbt scalafmtCheckAll "scalafix --check" && typos && sbt compile && sbt test` (full pipeline) |
| ci   | GitHub Actions | `sbt stryker4s` (mutation testing)                                                            |

## Verifying

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

- **Scalafmt not installed** — Install via Coursier: `cs install scalafmt`. Ensure `cs` is in your PATH.
- **Scalafix requires Scala 2.13+** — Scalafix semantic rules need Scala 2.13 or 3.x. If using an older version, upgrade your Scala version in `build.sbt`.
- **sbt not in PATH** — Install sbt from [scala-sbt.org](https://www.scala-sbt.org/download.html) and verify with `sbt --version`.
