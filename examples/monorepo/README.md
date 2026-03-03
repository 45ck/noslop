# Polyglot Monorepo Example

This directory is a reference polyglot monorepo equipped with
[noslop](https://github.com/45ck/noslop) quality gates for all 19 supported language packs.

## What this demonstrates

- All 19 noslop packs installed at a single monorepo root
- Per-language quality config files co-existing in one directory
- Shared git hooks and CI workflows wired to `noslop check`
- Minimal "hello world" source for each language under its own subdirectory

## How it was installed

```sh
node dist/presentation/cli.js install \
  --pack typescript --pack javascript --pack rust --pack python --pack go \
  --pack java --pack kotlin --pack ruby --pack php --pack cpp \
  --pack scala --pack elixir --pack dart --pack swift --pack haskell \
  --pack lua --pack dotnet --pack zig --pack ocaml \
  --dir examples/monorepo
```

`install` uses `AlwaysOverwriteConflictResolver`, so the last pack in the iteration wins
for shared files (`.githooks/pre-commit`, `AGENTS.md`, etc.). This is intentional — every
hook delegates to `noslop check --tier=fast` when noslop is available, so the last-writer
content is functionally identical across packs.

## Directory layout

```
monorepo/
├── <quality configs>        # eslint.config.js, clippy.toml, .golangci.yml, …
├── .claude/                 # Claude Code settings + hooks
├── .githooks/               # pre-commit, pre-push, commit-msg
├── .github/workflows/       # quality.yml, guardrails.yml
├── scripts/                 # check, fmt, lint, test, spell, mutation, typecheck, build
├── typescript/              # src/index.ts
├── javascript/              # src/index.js
├── rust/                    # src/main.rs
├── python/                  # src/main.py
├── go/                      # main.go
├── java/                    # src/main/java/App.java
├── kotlin/                  # src/main/kotlin/App.kt
├── ruby/                    # lib/app.rb
├── php/                     # src/App.php
├── cpp/                     # src/main.cpp
├── scala/                   # src/main/scala/Main.scala
├── elixir/                  # lib/app.ex
├── dart/                    # lib/app.dart
├── swift/                   # Sources/App/main.swift
├── haskell/                 # Main.hs
├── lua/                     # src/main.lua
├── dotnet/                  # App.cs
├── zig/                     # src/main.zig
└── ocaml/                   # bin/main.ml
```

## Running quality gates

Run the fast tier across all languages (requires each toolchain to be installed):

```sh
noslop check --tier=fast --dir examples/monorepo
```

Or use the installed scripts directly:

```sh
cd examples/monorepo
./scripts/check       # noslop check --tier=fast
./scripts/lint        # language-specific linters
./scripts/fmt         # language-specific formatters
```

## Multi-pack hook behaviour

When multiple packs are installed, the shared hook files (`.githooks/pre-commit` etc.) are
overwritten by each pack in sequence. The final file belongs to the last pack written. Because
every pack's hook delegates to `noslop check --tier=fast` when noslop is available (and falls
back to the pack-specific command otherwise), the result is the same regardless of which pack
wrote last.

## Verifying the installation

```sh
# Requires git config core.hooksPath to be set:
noslop doctor --dir examples/monorepo
```
