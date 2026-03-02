# OCaml — noslop pack

> Enforces quality through the OCaml compiler with full warnings-as-errors, type inference, and consistent formatting via OCamlFormat.

## Prerequisites

| Tool        | Version | Install                                |
| ----------- | ------- | -------------------------------------- |
| OCaml       | 5+      | [ocaml.org](https://ocaml.org/install) |
| opam        | latest  | Included with OCaml platform installer |
| dune        | latest  | `opam install dune`                    |
| OCamlFormat | latest  | `opam install ocamlformat`             |

## Install

```sh
noslop init --pack ocaml   # or: auto-detected from dune-project
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
- `scripts/fmt` — wrapper: runs dune @fmt for this pack
- `scripts/lint` — wrapper: runs dune @check for this pack
- `scripts/test` — wrapper: runs dune runtest for this pack
- `AGENTS.md` — plain-language rules for AI coding agents

> **Note:** OCaml has no separate config file -- the compiler with `-warn-error +a` is the quality gate.

## Quality rules

| Config file | Rule                    | Threshold                                                   |
| ----------- | ----------------------- | ----------------------------------------------------------- |
| (compiler)  | Type safety             | strictest (OCaml type inference + -warn-error +a)           |
| (compiler)  | Unused variables        | error (compiler -warn-error covers unused variables)        |
| (compiler)  | Non-exhaustive patterns | error (compiler -warn-error covers non-exhaustive patterns) |

> **Note:** Cyclomatic complexity, cognitive complexity, function length, file length, parameter count, and nesting depth are not enforced. No standalone OCaml complexity tool exists; proprietary tools exist without standard config files.

## Gate tiers

| Tier | Trigger        | Command                                                                         |
| ---- | -------------- | ------------------------------------------------------------------------------- |
| fast | pre-commit     | `dune build @fmt`                                                               |
| fast | pre-commit     | `dune build @check`                                                             |
| fast | pre-commit     | `typos` (spell)                                                                 |
| slow | pre-push       | `dune build`                                                                    |
| slow | pre-push       | `dune runtest`                                                                  |
| ci   | GitHub Actions | `dune build @fmt @check && typos && dune build && dune runtest` (full pipeline) |

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

- **OCamlFormat not installed** — Run `opam install ocamlformat` and ensure your opam switch is active: `eval $(opam env)`.
- **dune @fmt fails with version mismatch** — OCamlFormat requires a `.ocamlformat` file in the project root specifying the version (e.g., `version = 0.26.1`). Ensure it matches the installed version.
- **dune @check reports warnings-as-errors** — This is intentional with `-warn-error +a`. Fix the warnings rather than disabling them. Common causes: unused `open` statements, partial pattern matches.
