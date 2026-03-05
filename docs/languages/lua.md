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

Shared plumbing (`.githooks/`, `.github/workflows/`, `.claude/`, `scripts/`, `AGENTS.md`) — see [What gets dropped into your repo](../../README.md#what-gets-dropped-into-your-repo).

Additionally: `.luacheckrc` — Luacheck configuration (unused variables, global leakage)

## Quality rules

| Config file | Rule             | Threshold |
| ----------- | ---------------- | --------- |
| .luacheckrc | Unused variables | error     |
| .luacheckrc | Global leakage   | error     |

> **Note:** Cyclomatic complexity, cognitive complexity, function length, file length, parameter count, nesting depth, and type strictness are not enforced. No Lua tool exposes complexity metrics, and Lua is dynamically typed.

## Gate tiers

| Tier | Trigger        | Command                                                             |
| ---- | -------------- | ------------------------------------------------------------------- |
| fast | pre-commit     | `stylua --check .`                                                  |
| fast | pre-commit     | `luacheck .`                                                        |
| fast | pre-commit     | `typos` (spell)                                                     |
| slow | pre-push       | `busted`                                                            |
| ci   | GitHub Actions | `stylua --check . && luacheck . && typos && busted` (full pipeline) |

## Verifying

```sh
noslop doctor
```

See [Quick start](../../README.md#quick-start) for expected output.

## Troubleshooting

- **StyLua not installed** — Install via Cargo: `cargo install stylua`. Alternatively, download a binary from [github.com/JohnnyMorganz/StyLua](https://github.com/JohnnyMorganz/StyLua/releases).
- **Luacheck reports false positives for globals** — Add known globals to the `globals` table in `.luacheckrc` (e.g., `globals = {"love", "vim"}`).
- **Busted not found** — Install via LuaRocks: `luarocks install busted`. Ensure the LuaRocks bin directory is in your `$PATH`.
