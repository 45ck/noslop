# noslop

**Enforcement-first quality gate installer.**

`noslop` drops pre-commit hooks, CI workflows, and Claude Code guardrails into any existing repository in a single command. It supports 19 language packs. It does not generate project scaffolding or manage dependencies — it installs the enforcement layer on top of what you already have.

---

## Quick start

```sh
# 1. Install noslop
npm install -g @45ck/noslop

# 2. Go to your existing repo and install quality gates
cd your-repo
noslop init

# 3. Verify everything is wired
noslop doctor
```

Expected output of `noslop doctor` on a healthy install:

```
✓ git core.hooksPath
    core.hooksPath = .githooks
✓ pre-commit
    pre-commit present
✓ pre-push
    pre-push present
✓ commit-msg
    commit-msg present
✓ .github/workflows/quality.yml
    .github/workflows/quality.yml present
✓ .github/workflows/guardrails.yml
    .github/workflows/guardrails.yml present
✓ .claude/settings.json
    .claude/settings.json present
✓ .claude/hooks/pre-tool-use.sh
    .claude/hooks/pre-tool-use.sh present
✓ AGENTS.md
    AGENTS.md present

All checks passed — repo is protected.
```

---

## What you get

Three independent enforcement layers, each able to catch bypasses that slip past the previous one:

**Layer 1 — Local git hooks.** The `pre-commit` hook runs fast gates (format, lint, spell) on every `git commit`. The `pre-push` hook runs slow gates (type check, tests) before every push. The `commit-msg` hook rejects messages containing CI-bypass patterns or not following Conventional Commits. Wired via `git config core.hooksPath .githooks` — no `npm install` required.

**Layer 2 — CI required checks.** `quality.yml` runs on every PR and push to `main`. Configured as a required status check, it cannot be skipped by bypassing local hooks. `guardrails.yml` blocks any PR that modifies the protected enforcement files unless a human reviewer has applied the `noslop-approved` label.

**Layer 3 — Claude Code guardrails.** `.claude/settings.json` denies the agent permission to run `--no-verify`, `--force`, or `git push -f`, and denies edits to any protected path. `.claude/hooks/pre-tool-use.sh` intercepts every Bash tool call before execution and blocks bypass patterns. `AGENTS.md` states all rules in plain language for any AI agent working in the repo.

---

## What gets dropped into your repo

```
your-repo/
├── .githooks/
│   ├── pre-commit      # Runs fast gates before every commit
│   ├── pre-push        # Runs slow gates before every push
│   └── commit-msg      # Enforces Conventional Commits; blocks [skip ci] patterns
├── .github/
│   └── workflows/
│       ├── quality.yml     # Required CI check: full gate suite on PRs and pushes to main
│       └── guardrails.yml  # Blocks PRs that touch protected files without noslop-approved label
├── .claude/
│   ├── settings.json       # Denies --no-verify, --force, and edits to protected paths
│   └── hooks/
│       └── pre-tool-use.sh # Intercepts Claude Code tool calls; blocks bypass patterns
├── scripts/
│   ├── check               # Wrapper: noslop check --tier=fast
│   ├── fmt                 # Wrapper: runs the formatter for the detected pack
│   ├── lint                # Wrapper: runs the linter for the detected pack
│   └── test                # Wrapper: runs the test suite for the detected pack
└── AGENTS.md               # Plain-language rules for AI coding agents in this repo
```

**Protected paths** — these paths may not be edited by Claude Code or modified in a PR without the `noslop-approved` label:

- `.githooks/`
- `.github/workflows/`
- `.claude/settings.json`
- `.claude/hooks/`

---

## How it works

**Tier system.** Gates are grouped into three tiers mapped to development workflow stages. The pre-commit hook runs `noslop check --tier=fast`; the pre-push hook runs `noslop check --tier=slow`; CI runs the full pipeline. Fast gates complete in seconds so they stay out of the way. The CI tier is authoritative and cannot be skipped by any local trick.

| Tier   | Trigger                                      | Purpose                                                             |
| ------ | -------------------------------------------- | ------------------------------------------------------------------- |
| `fast` | `pre-commit` hook — before every commit      | Format, lint, spell check. Must complete in a few seconds.          |
| `slow` | `pre-push` hook — before every push          | Type checking and full test suite. Slower but still runs locally.   |
| `ci`   | GitHub Actions — on PRs and pushes to `main` | Full pipeline. Authoritative: cannot be skipped by any local trick. |

**Hooks wiring.** Hooks connect via `git config core.hooksPath .githooks`, not via a dev-dependency. They activate for every contributor without requiring `npm install` or any other setup step beyond cloning the repo. If you already use another hook manager (Lefthook, Husky, Beads), `noslop init` will warn that it is overwriting `core.hooksPath`; restore your original setting and invoke `noslop check` from your hook manager's configuration instead.

**Hook fallback.** Each hook checks whether `noslop` is available before running. If it is not on `PATH`, the hook falls back to the pack's equivalent raw commands (e.g. `npm run format:check && npm run lint && npm run spell` for the pre-commit hook). This keeps hooks functional in contributor environments that have not installed noslop globally.

**Team rollout.** Run `noslop init` once, commit the generated files (`.githooks/`, `.github/workflows/`, `.claude/`), and push. Every contributor gets the gates automatically on `git clone` — no per-developer install of noslop is required. The hooks call the project's own toolchain (ESLint, cargo, ruff, etc.) which must already be available in each developer's environment.

**Opting out.** The gates are intentionally hard to skip locally. There is no supported way to disable them per-developer. To skip the spell gate for a single run, use `noslop check --no-spell` or pass `--no-verify` to git (which noslop's own Claude guardrail will block for AI agents but not for humans). To remove a gate permanently, delete or edit the relevant hook file — though this defeats the purpose.

**Claude guardrails.** The `pre-tool-use.sh` hook intercepts every Bash tool call Claude Code makes before execution and blocks commands containing `--no-verify`, `SKIP_CI`, `[skip ci]`, or ESLint config-disabling flags. Combined with the `settings.json` deny rules, this prevents any AI agent from bypassing the local gates.

---

## Language packs

Packs are auto-detected from your repo's files. Override detection with `--pack`.

| Pack           | Detected by                                                                 | Full details                                                 |
| -------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------ |
| **TypeScript** | `tsconfig.json`, `package.json`                                             | [docs/languages/typescript.md](docs/languages/typescript.md) |
| **JavaScript** | not auto-detected — use `--pack javascript`                                 | [docs/languages/javascript.md](docs/languages/javascript.md) |
| **Rust**       | `Cargo.toml`                                                                | [docs/languages/rust.md](docs/languages/rust.md)             |
| **.NET / C#**  | `.csproj`, `.sln`, `global.json`                                            | [docs/languages/dotnet.md](docs/languages/dotnet.md)         |
| **Python**     | `pyproject.toml`, `setup.py`, `requirements.txt`                            | [docs/languages/python.md](docs/languages/python.md)         |
| **Go**         | `go.mod`                                                                    | [docs/languages/go.md](docs/languages/go.md)                 |
| **Java**       | `pom.xml`, `build.gradle`, or `build.gradle.kts` (no `.kt` files in `src/`) | [docs/languages/java.md](docs/languages/java.md)             |
| **Ruby**       | `Gemfile`                                                                   | [docs/languages/ruby.md](docs/languages/ruby.md)             |
| **Kotlin**     | `build.gradle` or `build.gradle.kts` + `.kt` files in `src/`                | [docs/languages/kotlin.md](docs/languages/kotlin.md)         |
| **Swift**      | `Package.swift`                                                             | [docs/languages/swift.md](docs/languages/swift.md)           |
| **PHP**        | `composer.json`                                                             | [docs/languages/php.md](docs/languages/php.md)               |
| **Scala**      | `build.sbt`                                                                 | [docs/languages/scala.md](docs/languages/scala.md)           |
| **Elixir**     | `mix.exs`                                                                   | [docs/languages/elixir.md](docs/languages/elixir.md)         |
| **Dart**       | `pubspec.yaml`                                                              | [docs/languages/dart.md](docs/languages/dart.md)             |
| **Haskell**    | `.cabal`                                                                    | [docs/languages/haskell.md](docs/languages/haskell.md)       |
| **Lua**        | `.rockspec` file or file ending in `.rockspec`                              | [docs/languages/lua.md](docs/languages/lua.md)               |
| **C / C++**    | `CMakeLists.txt`                                                            | [docs/languages/cpp.md](docs/languages/cpp.md)               |
| **Zig**        | `build.zig`                                                                 | [docs/languages/zig.md](docs/languages/zig.md)               |
| **OCaml**      | `dune-project`                                                              | [docs/languages/ocaml.md](docs/languages/ocaml.md)           |

> **Note:** JavaScript is not auto-detected. A repo with `package.json` but no `tsconfig.json` still routes to the TypeScript pack by default. Use `--pack javascript` to force the JavaScript pack.

---

## Commands

### `noslop init`

Detects the language pack for the current repo, copies templates into it, and sets `git config core.hooksPath .githooks`.

```
noslop init [options]

Options:
  -d, --dir <path>        Target directory (default: current working directory)
  --pack <id>             Force a specific pack; repeat for multiple (e.g. --pack typescript --pack python)
  --no-spell              Skip spell config generation
  --spell-language <loc>  BCP-47 locale for the spell checker (default: en)
  --spell-words <list>    Comma-separated seed vocabulary (e.g. EventSourcing,AggregateRoot)
```

### `noslop install`

Identical to `init` but non-interactive. Intended for CI pipelines and bootstrap scripts.

```
noslop install [options]

Options:
  -d, --dir <path>        Target directory (default: current working directory)
  --pack <id>             Force a specific pack; repeat for multiple (e.g. --pack typescript --pack python)
  --no-spell              Skip spell config generation
  --spell-language <loc>  BCP-47 locale for the spell checker (default: en)
  --spell-words <list>    Comma-separated seed vocabulary (e.g. EventSourcing,AggregateRoot)
```

### `noslop check`

Runs the quality gates for a given tier against the detected packs.

```
noslop check [options]

Options:
  -d, --dir <path>   Target directory (default: current working directory)
  --tier <tier>      Gate tier to run: fast | slow | ci  (default: fast)
  --pack <id>        Limit to a specific pack
  --verbose          Show stdout/stderr for passing gates as well as failures
  --no-spell         Skip the spell gate for this run
```

### `noslop update`

Re-installs hooks, CI workflows, and Claude files from the latest templates while leaving user-owned config files untouched. Use this after upgrading noslop to pick up any template changes without overwriting your project's ESLint config, `pyproject.toml`, and similar customized files.

```
noslop update [options]

Options:
  -d, --dir <path>   Target directory (default: current working directory)
  --pack <id>        Force a specific pack; repeat for multiple (e.g. --pack typescript --pack python)
```

### `noslop setup`

Interactive wizard. Prompts for language pack, target directory, and confirmation, then installs quality gates. Equivalent to `noslop init` with guided prompts. Use this when you are unsure which pack to choose.

```
noslop setup [options]

Options:
  -d, --dir <path>   Target directory (default: current working directory)
```

### `noslop doctor`

Verifies that hooks, CI workflow files, and Claude Code settings are all present and correctly wired. Exits with a non-zero code and lists every failed check if anything is missing.

---

## Guides

- [Monorepos](docs/guides/monorepos.md) — installing multiple packs, layout patterns, how gates fire per pack
- [Greenfield projects](docs/guides/greenfield.md) — setup wizard walkthrough, first-commit checklist, recommended configs per stack
- [Coding agents](docs/guides/coding-agents.md) — machine-readable install guide for Claude Code, Copilot Workspace, Cursor

---

## Requirements

| Requirement | Version     | Notes                                                                                                     |
| ----------- | ----------- | --------------------------------------------------------------------------------------------------------- |
| Node.js     | 22 or later | Required to run `noslop`                                                                                  |
| git         | any recent  | Required for hook wiring (`core.hooksPath`)                                                               |
| `jq`        | any recent  | Required by `.claude/hooks/pre-tool-use.sh`; the hook blocks all Claude Code tool calls if `jq` is absent |

Language toolchains (TypeScript compiler, ESLint, Prettier, Cargo, .NET SDK) must already be present in the target repo. noslop installs the enforcement layer; it does not install the tools themselves.

---

## Quality policy

noslop installs a starter quality config enforcing eight categories (cyclomatic complexity, cognitive complexity, function length, file length, parameter count, nesting depth, type safety, unused code) across all language packs. Coverage varies by what each language's standard toolchain supports.

Full details and justified gaps: [docs/quality-matrix.md](docs/quality-matrix.md).

---

## License

MIT
