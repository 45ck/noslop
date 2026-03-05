# Java — noslop pack

> Enforces cyclomatic complexity, code size limits, and style consistency via Checkstyle and PMD.

## Prerequisites

- JDK 17+
- [Gradle](https://gradle.org/) or [Maven](https://maven.apache.org/)

## Install

```sh
noslop init --pack java   # or: auto-detected from pom.xml, build.gradle, or build.gradle.kts (no .kt files in src/)
noslop doctor
```

## What gets installed

Shared plumbing (`.githooks/`, `.github/workflows/`, `.claude/`, `scripts/`, `AGENTS.md`) — see [What gets dropped into your repo](../../README.md#what-gets-dropped-into-your-repo).

Additionally: `checkstyle.xml` and `pmd.xml` — Checkstyle and PMD configurations (complexity, length, unused code)

## Quality rules

| Config file              | Rule                                             | Threshold                                                                                                                    |
| ------------------------ | ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| pmd.xml                  | Cyclomatic complexity (PMD CyclomaticComplexity) | <= 10                                                                                                                        |
| pmd.xml                  | Cognitive complexity                             | Not enforced (no standard Java tool exposes cognitive complexity as a configurable rule)                                     |
| checkstyle.xml           | Function length                                  | <= 80 lines                                                                                                                  |
| checkstyle.xml           | File length                                      | <= 350 lines                                                                                                                 |
| checkstyle.xml / pmd.xml | Max parameters                                   | <= 4                                                                                                                         |
| checkstyle.xml           | Max nesting depth                                | <= 4                                                                                                                         |
| compiler                 | Type strictness                                  | Not enforced (JVM enforces at compile time; SpotBugs/NullAway add null-safety but require build plugin noslop cannot inject) |
| pmd.xml                  | Unused variables                                 | Error                                                                                                                        |

## Gate tiers

| Tier | Trigger        | Command                                                                                                                                    |
| ---- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| fast | pre-commit     | `./gradlew checkstyleMain checkstyleTest -q`                                                                                               |
| fast | pre-commit     | `./gradlew pmdMain -q`                                                                                                                     |
| fast | pre-commit     | `typos` (spell)                                                                                                                            |
| slow | pre-push       | `./gradlew build -x test`                                                                                                                  |
| slow | pre-push       | `./gradlew test`                                                                                                                           |
| ci   | GitHub Actions | `./gradlew checkstyleMain checkstyleTest -q && ./gradlew pmdMain -q && typos && ./gradlew build -x test && ./gradlew test` (full pipeline) |
| ci   | GitHub Actions | `./gradlew pitest` (mutation testing)                                                                                                      |

## Verifying

```sh
noslop doctor
```

See [Quick start](../../README.md#quick-start) for expected output.

## Troubleshooting

- **`gradlew` not executable** — Run `chmod +x gradlew` to make the Gradle wrapper executable. On Windows, use `gradlew.bat` instead.
- **Checkstyle config not found** — Ensure `checkstyle.xml` is in the project root and your `build.gradle` references it with `configFile = file('checkstyle.xml')` in the `checkstyle` block.
- **PMD plugin not applied** — Add `id 'pmd'` to your `build.gradle` plugins block and configure the `pmd` block to reference `pmd.xml`.
- **Maven projects** — Replace `./gradlew` commands with the equivalent Maven plugin goals (`mvn checkstyle:check`, `mvn pmd:check`, `mvn test`).
