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

Shared plumbing (`.githooks/`, `.github/workflows/`, `.claude/`, `scripts/`, `AGENTS.md`) — see [What gets dropped into your repo](../../README.md#what-gets-dropped-into-your-repo).

No additional config file — the compiler is the quality gate for this pack.

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

```sh
noslop doctor
```

See [Quick start](../../README.md#quick-start) for expected output.

## Troubleshooting

- **OCamlFormat not installed** — Run `opam install ocamlformat` and ensure your opam switch is active: `eval $(opam env)`.
- **dune @fmt fails with version mismatch** — OCamlFormat requires a `.ocamlformat` file in the project root specifying the version (e.g., `version = 0.26.1`). Ensure it matches the installed version.
- **dune @check reports warnings-as-errors** — This is intentional with `-warn-error +a`. Fix the warnings rather than disabling them. Common causes: unused `open` statements, partial pattern matches.
