# Zig — noslop pack

> Enforces quality through the Zig compiler itself -- unused variables are hard errors, implicit casts are rejected, and exhaustive switches are required.

## Prerequisites

| Tool | Version | Install                                      |
| ---- | ------- | -------------------------------------------- |
| Zig  | 0.12+   | [ziglang.org](https://ziglang.org/download/) |

## Install

```sh
noslop init --pack zig   # or: auto-detected from build.zig
noslop doctor
```

## What gets installed

Shared plumbing (`.githooks/`, `.github/workflows/`, `.claude/`, `scripts/`, `AGENTS.md`) — see [What gets dropped into your repo](../../README.md#what-gets-dropped-into-your-repo).

No additional config file — the compiler is the quality gate for this pack.

> **Note:** Zig has no separate config file -- the compiler itself is the quality gate.

## Quality rules

| Config file | Rule                     | Threshold                                                            |
| ----------- | ------------------------ | -------------------------------------------------------------------- |
| (compiler)  | Exhaustive switches      | required (compiler hard error)                                       |
| (compiler)  | Implicit type casts      | rejected (compiler hard error)                                       |
| (compiler)  | Comptime type safety     | strictest                                                            |
| (compiler)  | Unused variables/imports | error (compiler hard error: unused variables/imports fail the build) |

> **Note:** Cognitive complexity, function length, file length, parameter count, and nesting depth are not enforced. No Zig linter ecosystem exists yet.

## Gate tiers

| Tier | Trigger        | Command                                                                        |
| ---- | -------------- | ------------------------------------------------------------------------------ |
| fast | pre-commit     | `zig fmt --check src/`                                                         |
| fast | pre-commit     | `zig build`                                                                    |
| fast | pre-commit     | `typos` (spell)                                                                |
| slow | pre-push       | `zig build test`                                                               |
| ci   | GitHub Actions | `zig fmt --check src/ && zig build && typos && zig build test` (full pipeline) |

## Verifying

```sh
noslop doctor
```

See [Quick start](../../README.md#quick-start) for expected output.

## Troubleshooting

- **zig fmt reports errors in generated files** — Add generated files to a separate directory and exclude them from `zig fmt` by passing explicit source paths instead of `.`.
- **zig build test has no test step defined** — Ensure your `build.zig` includes a test step. Add `const tests = b.addTest(.{ .root_source_file = .{ .path = "src/main.zig" } });` and wire it to a "test" step.
- **Unused variable errors blocking compilation** — This is intentional. Zig does not allow `_ = value;` as a silencer for imports; use `_ = @import(...)` only during active development and remove before committing.
