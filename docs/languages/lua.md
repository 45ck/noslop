# Lua — noslop pack

> Enforces clean globals, unused variable detection via Luacheck, and consistent formatting via StyLua.

## Prerequisites

| Tool     | Version | Install                                      |
| -------- | ------- | -------------------------------------------- |
| Lua      | 5.4+    | [lua.org](https://www.lua.org/download.html) |
| LuaRocks | latest  | [luarocks.org](https://luarocks.org/)        |
| StyLua   | latest  | `cargo install stylua`                       |
| Luacheck | latest  | `luarocks install luacheck`                  |
| Busted   | latest  | `luarocks install busted`                    |

## Install

```sh
noslop init --pack lua   # or: auto-detected from .rockspec
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
- `scripts/fmt` — wrapper: runs StyLua for this pack
- `scripts/lint` — wrapper: runs Luacheck for this pack
- `scripts/test` — wrapper: runs Busted for this pack
- `AGENTS.md` — plain-language rules for AI coding agents
- `.luacheckrc` — Luacheck configuration (unused variables, global leakage)

## Quality rules

| Config file | Rule             | Threshold |
| ----------- | ---------------- | --------- |
| .luacheckrc | Unused variables | error     |
| .luacheckrc | Global leakage   | error     |

> **Note:** Cyclomatic complexity, cognitive complexity, function length, file length, parameter count, nesting depth, and type strictness are not enforced. No Lua tool exposes complexity metrics, and Lua is dynamically typed.

## Gate tiers

| Tier | Trigger        | Command run                          |
| ---- | -------------- | ------------------------------------ |
| fast | pre-commit     | `stylua --check .`, `luacheck .`     |
| slow | pre-push       | `busted`                             |
| ci   | GitHub Actions | (quality.yml runs fast + slow gates) |

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

- **StyLua not installed** — Install via Cargo: `cargo install stylua`. Alternatively, download a binary from [github.com/JohnnyMorganz/StyLua](https://github.com/JohnnyMorganz/StyLua/releases).
- **Luacheck reports false positives for globals** — Add known globals to the `globals` table in `.luacheckrc` (e.g., `globals = {"love", "vim"}`).
- **Busted not found** — Install via LuaRocks: `luarocks install busted`. Ensure the LuaRocks bin directory is in your `$PATH`.
