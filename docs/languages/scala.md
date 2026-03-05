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

Shared plumbing (`.githooks/`, `.github/workflows/`, `.claude/`, `scripts/`, `AGENTS.md`) — see [What gets dropped into your repo](../../README.md#what-gets-dropped-into-your-repo).

Additionally: `.scalafix.conf` — Scalafix rules (RemoveUnused, organizing imports)

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

```sh
noslop doctor
```

See [Quick start](../../README.md#quick-start) for expected output.

## Troubleshooting

- **Scalafmt not installed** — Install via Coursier: `cs install scalafmt`. Ensure `cs` is in your PATH.
- **Scalafix requires Scala 2.13+** — Scalafix semantic rules need Scala 2.13 or 3.x. If using an older version, upgrade your Scala version in `build.sbt`.
- **sbt not in PATH** — Install sbt from [scala-sbt.org](https://www.scala-sbt.org/download.html) and verify with `sbt --version`.
