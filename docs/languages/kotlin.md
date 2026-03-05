# Kotlin — noslop pack

> Enforces complexity limits, code size rules, and consistent formatting via detekt and ktlint.

## Prerequisites

- JDK 17+
- [Kotlin](https://kotlinlang.org/)
- [ktlint](https://pinterest.github.io/ktlint/)
- [detekt](https://detekt.dev/) (Gradle plugin)

## Install

```sh
noslop init --pack kotlin   # or: auto-detected from build.gradle or build.gradle.kts with .kt files in src/
noslop doctor
```

## What gets installed

Shared plumbing (`.githooks/`, `.github/workflows/`, `.claude/`, `scripts/`, `AGENTS.md`) — see [What gets dropped into your repo](../../README.md#what-gets-dropped-into-your-repo).

Additionally: `detekt.yml` — detekt configuration with complexity, size, and style rules

## Quality rules

| Config file | Rule                  | Threshold                   |
| ----------- | --------------------- | --------------------------- |
| detekt.yml  | Cyclomatic complexity | <= 10                       |
| detekt.yml  | Cognitive complexity  | <= 15                       |
| detekt.yml  | Function length       | <= 80 lines                 |
| detekt.yml  | File length           | <= 350 lines                |
| detekt.yml  | Max parameters        | <= 4                        |
| detekt.yml  | Max nesting depth     | <= 4                        |
| compiler    | Type strictness       | Strictest (Kotlin compiler) |
| detekt.yml  | Unused variables      | Error                       |

## Gate tiers

| Tier | Trigger        | Command                                                                                              |
| ---- | -------------- | ---------------------------------------------------------------------------------------------------- |
| fast | pre-commit     | `./gradlew ktlintCheck`                                                                              |
| fast | pre-commit     | `./gradlew detekt`                                                                                   |
| fast | pre-commit     | `typos` (spell)                                                                                      |
| slow | pre-push       | `./gradlew build -x test`                                                                            |
| slow | pre-push       | `./gradlew test`                                                                                     |
| ci   | GitHub Actions | `./gradlew ktlintCheck detekt && typos && ./gradlew build -x test && ./gradlew test` (full pipeline) |
| ci   | GitHub Actions | `./gradlew pitest` (mutation testing)                                                                |

## Verifying

```sh
noslop doctor
```

See [Quick start](../../README.md#quick-start) for expected output.

## Troubleshooting

- **detekt plugin not in `build.gradle`** — Add `id("io.gitlab.arturbosch.detekt")` to your `plugins` block and configure detekt to use the `detekt.yml` config file.
- **ktlint version mismatch** — Pin ktlint version in your build configuration. Different versions may have incompatible formatting rules. Use `ktlint --version` to check.
- **`gradlew` not executable** — Run `chmod +x gradlew` to make the Gradle wrapper executable. On Windows, use `gradlew.bat` instead.
