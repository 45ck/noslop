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

- `.githooks/pre-commit` — runs fast gates before every commit
- `.githooks/pre-push` — runs slow gates before every push
- `.githooks/commit-msg` — enforces Conventional Commits format; blocks [skip ci] patterns
- `.github/workflows/quality.yml` — required CI check on PRs and pushes to main
- `.github/workflows/guardrails.yml` — blocks PRs touching protected files without noslop-approved label
- `.claude/settings.json` — denies --no-verify, --force, edits to protected paths
- `.claude/hooks/pre-tool-use.sh` — intercepts Claude Code tool calls; blocks bypass patterns
- `scripts/check` — wrapper: noslop check --tier=fast
- `scripts/fmt` — wrapper: runs zig fmt for this pack
- `scripts/lint` — wrapper: runs zig build for this pack
- `scripts/test` — wrapper: runs zig build test for this pack
- `AGENTS.md` — plain-language rules for AI coding agents

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

- **zig fmt reports errors in generated files** — Add generated files to a separate directory and exclude them from `zig fmt` by passing explicit source paths instead of `.`.
- **zig build test has no test step defined** — Ensure your `build.zig` includes a test step. Add `const tests = b.addTest(.{ .root_source_file = .{ .path = "src/main.zig" } });` and wire it to a "test" step.
- **Unused variable errors blocking compilation** — This is intentional. Zig does not allow `_ = value;` as a silencer for imports; use `_ = @import(...)` only during active development and remove before committing.
