# Monorepo guide

How to use noslop in repositories that contain multiple languages or sub-projects.

## How pack detection works

noslop scans the **repo root** for well-known detection files when you run `noslop init` without `--pack`. Detection priority (first match wins):

1. `tsconfig.json` or `package.json` → TypeScript
2. `Cargo.toml` → Rust
3. `.csproj`, `.sln`, or `global.json` → .NET
4. `go.mod` → Go
5. `pyproject.toml` or `requirements.txt` → Python
6. `pom.xml` or `build.gradle` (no `.kt` files) → Java
7. `Gemfile` → Ruby
8. `Package.swift` → Swift
9. `build.gradle` + `.kt` files → Kotlin
10. `composer.json` → PHP
11. `build.sbt` → Scala
12. `mix.exs` → Elixir
13. `pubspec.yaml` → Dart
14. `build.zig` → Zig
15. `.cabal` → Haskell
16. `.rockspec` → Lua
17. `CMakeLists.txt` → C/C++
18. `dune-project` → OCaml
19. (none matched) → TypeScript (default)

In a monorepo where the root contains `package.json` and a subdirectory `backend/` contains `Cargo.toml`, auto-detection will pick TypeScript (root wins). Use `--pack` to be explicit.

## Installing multiple packs

Pass `--pack` multiple times to install gates for every language in your monorepo:

```sh
noslop init --pack typescript --pack python
noslop init --pack typescript --pack rust
noslop init --pack typescript --pack go
noslop init --pack java --pack kotlin
```

Each pack installs its own config file (e.g. `eslint.config.js` and `pyproject.toml`). The shared plumbing (`.githooks/`, `.github/workflows/`, `.claude/`) is installed once and covers all packs.

## How gates fire

When `noslop check --tier=fast` runs (via the pre-commit hook or directly), it runs the fast commands for **every installed pack** in sequence. A failure in any pack's gate blocks the commit.

```sh
# With typescript + python installed:
noslop check --tier=fast
# Runs: prettier + eslint + cspell, then black + ruff
# Both must pass

noslop check --tier=fast --pack=typescript
# Limit to one pack
```

## Layout patterns

### TypeScript frontend + Python backend

```
my-app/
├── package.json          # TypeScript detection
├── tsconfig.json
├── src/                  # Frontend TS code
└── backend/
    ├── pyproject.toml    # Python config installed by noslop
    └── app/              # Python code
```

Install: `noslop init --pack typescript --pack python`

The `eslint.config.js` and `pyproject.toml` both sit at the repo root. ESLint scopes to JS/TS files automatically; ruff and black scope to `.py` files.

### TypeScript frontend + Rust backend

```
my-app/
├── package.json
├── tsconfig.json
├── web/                  # Frontend
└── server/
    ├── Cargo.toml
    └── src/
```

Install: `noslop init --pack typescript --pack rust`

Fast gates: `prettier --check` + `eslint`, then `cargo fmt --check` + `cargo clippy`. The Rust gates run `cargo` from the repo root — ensure your `Cargo.toml` is at the root or the server/ path is in a workspace.

### TypeScript + Rust via wasm-pack

```
my-app/
├── package.json          # JS orchestration
├── Cargo.toml            # Rust wasm crate
├── src/                  # Rust source
└── js/                   # Generated JS bindings
```

Install: `noslop init --pack typescript --pack rust`

Both markers exist at root. Pass both `--pack` flags explicitly to avoid auto-detection choosing one.

### TypeScript frontend + Go backend

```
my-app/
├── package.json
├── tsconfig.json
├── frontend/
└── api/
    ├── go.mod
    └── main.go
```

Install: `noslop init --pack typescript --pack go`

The `.golangci.yml` config is installed at the repo root. golangci-lint discovers `go.mod` automatically from there.

### Java microservices monorepo

```
services/
├── user-service/
│   └── build.gradle
├── order-service/
│   └── build.gradle
└── gateway/
    └── build.gradle
```

If the root has no `build.gradle`, run init from the root with `--pack java`. The `checkstyle.xml` and `pmd.xml` configs are installed at root; Gradle looks for them via project-relative paths configured in the installed config.

Install: `noslop init --pack java`

## Partial protection

Each pack's quality rules apply only to its own file types:

- TypeScript/JavaScript rules only lint `.ts`, `.js`, `.tsx`, `.jsx` files
- Python rules only lint `.py` files
- Rust rules only apply to the Rust project

The **enforcement layer** (hooks, CI, Claude guardrails) protects the whole repo regardless of which pack's files changed. A commit touching only Python files still triggers the Python fast gates.
