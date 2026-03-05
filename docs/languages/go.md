# Go — noslop pack

> Enforces cyclomatic and cognitive complexity, parameter limits, and consistent formatting via golangci-lint and gofmt.

## Prerequisites

- [Go 1.21+](https://go.dev/)
- [golangci-lint](https://golangci-lint.run/)

## Install

```sh
noslop init --pack go   # or: auto-detected from go.mod
noslop doctor
```

## What gets installed

Shared plumbing (`.githooks/`, `.github/workflows/`, `.claude/`, `scripts/`, `AGENTS.md`) — see [What gets dropped into your repo](../../README.md#what-gets-dropped-into-your-repo).

Additionally: `.golangci.yml` — golangci-lint configuration with gocyclo, gocognit, and revive linters

## Quality rules

| Config file   | Rule                            | Threshold                                                                                       |
| ------------- | ------------------------------- | ----------------------------------------------------------------------------------------------- |
| .golangci.yml | Cyclomatic complexity (gocyclo) | <= 10                                                                                           |
| .golangci.yml | Cognitive complexity (gocognit) | <= 15                                                                                           |
| .golangci.yml | Function length (revive)        | <= 80 lines                                                                                     |
| .golangci.yml | File length                     | Not enforced (golangci-lint has no file-length linter; wsl and maintidx cover related concerns) |
| .golangci.yml | Max parameters (revive)         | <= 4                                                                                            |
| .golangci.yml | Max nesting depth               | Not enforced (idiomatic Go uses early returns making deep nesting structurally unlikely)        |
| go vet        | Type strictness                 | Strictest (go vet)                                                                              |
| .golangci.yml | Unused variables (unused)       | Error                                                                                           |

## Gate tiers

| Tier | Trigger        | Command                                                                                               |
| ---- | -------------- | ----------------------------------------------------------------------------------------------------- |
| fast | pre-commit     | `test -z "$(gofmt -l .)"`                                                                             |
| fast | pre-commit     | `go vet ./...`                                                                                        |
| fast | pre-commit     | `typos` (spell)                                                                                       |
| slow | pre-push       | `go build ./...`                                                                                      |
| slow | pre-push       | `go test ./...`                                                                                       |
| ci   | GitHub Actions | `test -z "$(gofmt -l .)" && go vet ./... && typos && go build ./... && go test ./...` (full pipeline) |

## Verifying

```sh
noslop doctor
```

See [Quick start](../../README.md#quick-start) for expected output.

## Troubleshooting

- **golangci-lint not in PATH** — Install via `go install github.com/golangci-lint/golangci-lint/cmd/golangci-lint@latest` or download from the [releases page](https://github.com/golangci-lint/golangci-lint/releases). Ensure the Go bin directory is in your PATH.
- **gofmt reporting Windows line endings** — Configure Git to use `core.autocrlf=input` so files are checked in with LF endings. Run `gofmt -w .` to reformat after changing the setting.
- **`go vet` failing on generated files** — Add a `//go:generate` comment or exclude generated files from linting in `.golangci.yml` using the `skip-files` directive.
