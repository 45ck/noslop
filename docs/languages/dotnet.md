# .NET/C# — noslop pack

> Enforces complexity limits, nullable reference types, and consistent formatting via Roslyn analysers and SonarAnalyzer.

## Prerequisites

- [.NET SDK 8+](https://dotnet.microsoft.com/)

## Install

```sh
noslop init --pack dotnet   # or: auto-detected from .csproj, .sln, or global.json
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
- `.editorconfig` — code style and formatting rules for Roslyn
- `Directory.Build.props` — MSBuild properties enabling analysers and nullable reference types

## Quality rules

| Config file                           | Rule                                           | Threshold    |
| ------------------------------------- | ---------------------------------------------- | ------------ |
| .editorconfig / Directory.Build.props | Cyclomatic complexity (CA1502 Roslyn analyser) | <= 10        |
| .editorconfig / Directory.Build.props | Cognitive complexity (SonarAnalyzer)           | <= 15        |
| .editorconfig / Directory.Build.props | Function length (SonarAnalyzer)                | <= 80 lines  |
| .editorconfig / Directory.Build.props | File length (SonarAnalyzer)                    | <= 350 lines |
| .editorconfig / Directory.Build.props | Max parameters (SonarAnalyzer)                 | <= 4         |
| .editorconfig / Directory.Build.props | Max nesting depth (SonarAnalyzer)              | <= 4         |
| Directory.Build.props                 | Type strictness (Nullable enabled)             | Strictest    |
| .editorconfig / Directory.Build.props | Unused variables (Roslyn)                      | Error        |

## Gate tiers

| Tier | Trigger        | Command                                                                                                  |
| ---- | -------------- | -------------------------------------------------------------------------------------------------------- |
| fast | pre-commit     | `dotnet format --verify-no-changes`                                                                      |
| fast | pre-commit     | `typos` (spell)                                                                                          |
| slow | pre-push       | `dotnet build /warnaserror`                                                                              |
| slow | pre-push       | `dotnet test`                                                                                            |
| ci   | GitHub Actions | `dotnet format --verify-no-changes && typos && dotnet build /warnaserror && dotnet test` (full pipeline) |
| ci   | GitHub Actions | `dotnet stryker` (mutation testing)                                                                      |

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

- **SonarAnalyzer NuGet package not referenced** — Add `<PackageReference Include="SonarAnalyzer.CSharp" Version="..." PrivateAssets="all" />` to your project file or `Directory.Build.props`.
- **Nullable reference types not enabled** — Ensure `<Nullable>enable</Nullable>` is set in your `.csproj` or `Directory.Build.props`. The pack sets this in `Directory.Build.props` but per-project settings can override it.
- **`dotnet format` reports unexpected changes** — Run `dotnet format` (without `--verify-no-changes`) to auto-fix formatting, then commit the result.
- **CA1502 warnings not appearing** — Ensure the `Microsoft.CodeAnalysis.NetAnalyzers` package is enabled. It ships with .NET SDK 5+ but may need explicit opt-in via `<EnableNETAnalyzers>true</EnableNETAnalyzers>`.
