# noslop — coding agent install guide

This guide is written for AI coding agents (Claude Code, Copilot Workspace, Cursor, and similar tools). Follow it exactly.

## Quick install

Three commands. Run them in order.

```sh
# 1. Install noslop globally if not already present
npm install -g @45ck/noslop

# 2. Install quality gates into the current repo
noslop install

# 3. Verify the install is healthy — must exit 0
noslop doctor
```

If `noslop doctor` exits non-zero, do not proceed. Read the error output and fix each failed check before making any commits.

## Forcing a specific pack

If auto-detection picks the wrong pack, or you are working in a monorepo with multiple languages:

```sh
noslop install --pack typescript
noslop install --pack typescript --pack python   # monorepo: two packs
```

## Detection rules

Use this table to determine which `--pack` value to pass without running noslop:

| File present in repo root                                                   | Pack ID                                                                          |
| --------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `tsconfig.json` or `package.json`                                           | `typescript`                                                                     |
| `Cargo.toml`                                                                | `rust`                                                                           |
| `.csproj`, `.sln`, or `global.json`                                         | `dotnet`                                                                         |
| `go.mod`                                                                    | `go`                                                                             |
| `pyproject.toml`, `setup.py`, or `requirements.txt`                         | `python`                                                                         |
| `pom.xml`, `build.gradle`, or `build.gradle.kts` (no `.kt` files in `src/`) | `java`                                                                           |
| `Gemfile`                                                                   | `ruby`                                                                           |
| `Package.swift`                                                             | `swift`                                                                          |
| `build.gradle` or `build.gradle.kts` + `.kt` files in `src/`                | `kotlin`                                                                         |
| `composer.json`                                                             | `php`                                                                            |
| `build.sbt`                                                                 | `scala`                                                                          |
| `mix.exs`                                                                   | `elixir`                                                                         |
| `pubspec.yaml`                                                              | `dart`                                                                           |
| `build.zig`                                                                 | `zig`                                                                            |
| `.cabal`                                                                    | `haskell`                                                                        |
| `.rockspec` file or file ending in `.rockspec`                              | `lua`                                                                            |
| `CMakeLists.txt`                                                            | `cpp`                                                                            |
| `dune-project`                                                              | `ocaml`                                                                          |
| `package.json` (no `tsconfig.json`)                                         | `javascript` (not auto-detected; `package.json` routes to TypeScript by default) |
| (none of the above)                                                         | `typescript` (default)                                                           |

> **Note:** JavaScript is not auto-detected. A repo with `package.json` but no `tsconfig.json` still defaults to the TypeScript pack. Use `--pack=javascript` to force JavaScript.

## Post-install constraints

After `noslop install`, these constraints apply. You MUST NOT violate them:

1. **Do not bypass hooks.** Never run `git commit --no-verify` or `git push --no-verify`.
2. **Do not edit protected paths.** These paths are enforced by `.claude/settings.json` and CI:
   - `.githooks/`
   - `.github/workflows/`
   - `.claude/settings.json`
   - `.claude/hooks/`
3. **Gate must pass before committing.** Run `noslop check --tier=fast` and confirm it exits 0 before staging any commit.
4. **Do not use force push.** Never run `git push -f` or `git push --force`.
5. **Do not disable linters inline.** Do not add `// eslint-disable`, `#noqa`, `// NOLINT`, or equivalent suppression comments to pass a gate.

## Before every commit

```sh
noslop check --tier=fast    # must exit 0
git add .
git commit -m "feat: your message"
```

The pre-commit hook also enforces `noslop check --tier=fast` automatically. If it fails, fix the reported issues before retrying.

## CI bootstrap

For CI pipelines that do not have noslop pre-installed:

```sh
npx @45ck/noslop install && noslop check --tier=ci
```

## Verifying a healthy install

```sh
noslop doctor
```

Exit code 0 = healthy. Any non-zero exit means one or more checks failed — read the output and re-run `noslop install` to repair. See [Quick start](../../README.md#quick-start) for expected output.
