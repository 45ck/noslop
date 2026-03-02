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

**Hooks wiring.** Hooks connect via `git config core.hooksPath .githooks`, not via a dev-dependency. They activate for every contributor without requiring `npm install` or any other setup step beyond cloning the repo.

**Team rollout.** Run `noslop init` once, commit the generated files (`.githooks/`, `.github/workflows/`, `.claude/`), and push. Every contributor gets the gates automatically on `git clone` — no per-developer install of noslop is required. The hooks call the project's own toolchain (ESLint, cargo, ruff, etc.) which must already be available in each developer's environment.

**Opting out.** The gates are intentionally hard to skip locally. There is no supported way to disable them per-developer. To skip the spell gate for a single run, use `noslop check --no-spell` or pass `--no-verify` to git (which noslop's own Claude guardrail will block for AI agents but not for humans). To remove a gate permanently, delete or edit the relevant hook file — though this defeats the purpose.

**Claude guardrails.** The `pre-tool-use.sh` hook intercepts every Bash tool call Claude Code makes before execution and blocks commands containing `--no-verify`, `SKIP_CI`, `[skip ci]`, or ESLint config-disabling flags. Combined with the `settings.json` deny rules, this prevents any AI agent from bypassing the local gates.

---

## Language packs

Packs are auto-detected from your repo's files. Override detection with `--pack`.

| Pack           | Detected by                                      | Full details                                                 |
| -------------- | ------------------------------------------------ | ------------------------------------------------------------ |
| **TypeScript** | `tsconfig.json`, `package.json`                  | [docs/languages/typescript.md](docs/languages/typescript.md) |
| **JavaScript** | `package.json`                                   | [docs/languages/javascript.md](docs/languages/javascript.md) |
| **Rust**       | `Cargo.toml`                                     | [docs/languages/rust.md](docs/languages/rust.md)             |
| **.NET / C#**  | `.csproj`, `.sln`, `global.json`                 | [docs/languages/dotnet.md](docs/languages/dotnet.md)         |
| **Python**     | `pyproject.toml`, `setup.py`, `requirements.txt` | [docs/languages/python.md](docs/languages/python.md)         |
| **Go**         | `go.mod`                                         | [docs/languages/go.md](docs/languages/go.md)                 |
| **Java**       | `pom.xml`, `build.gradle`                        | [docs/languages/java.md](docs/languages/java.md)             |
| **Ruby**       | `Gemfile`                                        | [docs/languages/ruby.md](docs/languages/ruby.md)             |
| **Kotlin**     | `build.gradle` + `.kt` files                     | [docs/languages/kotlin.md](docs/languages/kotlin.md)         |
| **Swift**      | `Package.swift`                                  | [docs/languages/swift.md](docs/languages/swift.md)           |
| **PHP**        | `composer.json`                                  | [docs/languages/php.md](docs/languages/php.md)               |
| **Scala**      | `build.sbt`                                      | [docs/languages/scala.md](docs/languages/scala.md)           |
| **Elixir**     | `mix.exs`                                        | [docs/languages/elixir.md](docs/languages/elixir.md)         |
| **Dart**       | `pubspec.yaml`                                   | [docs/languages/dart.md](docs/languages/dart.md)             |
| **Haskell**    | `.cabal`                                         | [docs/languages/haskell.md](docs/languages/haskell.md)       |
| **Lua**        | `.rockspec`                                      | [docs/languages/lua.md](docs/languages/lua.md)               |
| **C / C++**    | `CMakeLists.txt`                                 | [docs/languages/cpp.md](docs/languages/cpp.md)               |
| **Zig**        | `build.zig`                                      | [docs/languages/zig.md](docs/languages/zig.md)               |
| **OCaml**      | `dune-project`                                   | [docs/languages/ocaml.md](docs/languages/ocaml.md)           |

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

## Quality policy enforcement matrix

noslop installs a **starter quality config** alongside every pack's gate plumbing. The config enforces the same eight categories across all languages. Where a category cannot be enforced by the language's standard toolchain, the reason is documented below.

### Categories

| #          | Category                 | Standard       |
| ---------- | ------------------------ | -------------- |
| **CC**     | Cyclomatic complexity    | ≤ 10           |
| **COG**    | Cognitive complexity     | ≤ 15           |
| **FN**     | Function / method length | ≤ 80 lines     |
| **FILE**   | File length              | ≤ 350 lines    |
| **PARAMS** | Parameter count          | ≤ 4            |
| **DEPTH**  | Nesting depth            | ≤ 4            |
| **TYPES**  | Static type safety       | strictest mode |
| **UNUSED** | Unused code detection    | error          |

### Coverage per pack

| Pack           | Config file                               |     CC      |     COG     |      FN      |     FILE     |  PARAMS   |    DEPTH     |        TYPES        |     UNUSED     |
| -------------- | ----------------------------------------- | :---------: | :---------: | :----------: | :----------: | :-------: | :----------: | :-----------------: | :------------: |
| **TypeScript** | `eslint.config.js`                        |      ✓      |  ✓ sonarjs  |      ✓       |      ✓       |     ✓     |      ✓       |     ✓ ts-eslint     |       ✓        |
| **JavaScript** | `eslint.config.js`                        |      ✓      |  ✓ sonarjs  |      ✓       |      ✓       |     ✓     |      ✓       |         — ¹         |      — ¹       |
| **C# / .NET**  | `.editorconfig` + `Directory.Build.props` |  ✓ CA1502   |   ✓ Sonar   |   ✓ Sonar    |   ✓ Sonar    |  ✓ Sonar  |   ✓ Sonar    |     ✓ Nullable      |    ✓ Roslyn    |
| **Python**     | `pyproject.toml`                          | ✓ ruff C901 |     — ²     |     — ²      |     — ²      | ✓ PLR0913 |     — ²      |    ✓ mypy strict    |  ✓ ruff F401   |
| **Java**       | `checkstyle.xml` + `pmd.xml`              |    ✓ PMD    |     — ³     | ✓ Checkstyle | ✓ Checkstyle |  ✓ both   | ✓ Checkstyle |         — ³         |     ✓ PMD      |
| **Go**         | `.golangci.yml`                           |  ✓ gocyclo  | ✓ gocognit  |   ✓ revive   |     — ⁴      | ✓ revive  |     — ⁴      |      ✓ go vet       |    ✓ unused    |
| **PHP**        | `phpstan.neon` + `phpmd.xml`              |   ✓ PHPMD   |     — ⁵     |   ✓ PHPMD    |   ✓ PHPMD    |  ✓ PHPMD  |     — ⁵      |    ✓ PHPStan L8     |    ✓ PHPMD     |
| **Ruby**       | `.rubocop.yml`                            |      ✓      | ✓ Perceived |      ✓       |      ✓       |     ✓     |      ✓       |         — ⁶         |  ✓ Lint cops   |
| **Kotlin**     | `detekt.yml`                              |      ✓      |      ✓      |      ✓       |      ✓       |     ✓     |      ✓       |     ✓ compiler      |    ✓ detekt    |
| **Swift**      | `.swiftlint.yml`                          |      ✓      |     — ⁷     |      ✓       |      ✓       |     ✓     |  ✓ nesting   |     ✓ compiler      |      — ⁷       |
| **Rust**       | `clippy.toml`                             |     — ⁸     |      ✓      |      ✓       |     — ⁸      |     ✓     |     — ⁸      |     ✓ compiler      |   ✓ compiler   |
| **C / C++**    | `.clang-tidy`                             |     — ⁹     |      ✓      |      ✓       |     — ⁹      |     ✓     |      ✓       | ✓ cppcoreguidelines |      — ⁹       |
| **Scala**      | `.scalafix.conf`                          |    — ¹⁰     |    — ¹⁰     |     — ¹⁰     |     — ¹⁰     |   — ¹⁰    |     — ¹⁰     |     ✓ compiler      | ✓ RemoveUnused |
| **Elixir**     | `.credo.exs`                              |      ✓      |    — ¹¹     |      ✓       |     — ¹¹     |  ✓ arity  |      ✓       |     ✓ dialyzer      |       ✓        |
| **Dart**       | `analysis_options.yaml`                   |    — ¹²     |    — ¹²     |     — ¹²     |     — ¹²     |   — ¹²    |     — ¹²     |      ✓ strict       |      — ¹²      |
| **Haskell**    | `.hlint.yaml`                             |    — ¹³     |    — ¹³     |     — ¹³     |     — ¹³     |   — ¹³    |     — ¹³     |     ✓ compiler      |    ✓ HLint     |
| **Lua**        | `.luacheckrc`                             |    — ¹⁴     |    — ¹⁴     |     — ¹⁴     |     — ¹⁴     |   — ¹⁴    |     — ¹⁴     |        — ¹⁴         |       ✓        |
| **Zig**        | _(compiler)_                              | ✓ compiler  |    — ¹⁵     |     — ¹⁵     |     — ¹⁵     |   — ¹⁵    |     — ¹⁵     |     ✓ compiler      |   ✓ compiler   |
| **OCaml**      | _(compiler)_                              |    — ¹⁶     |    — ¹⁶     |     — ¹⁶     |     — ¹⁶     |   — ¹⁶    |     — ¹⁶     |     ✓ compiler      |   ✓ compiler   |

### Justified gaps

**¹ JavaScript** has no type system. Unused-variable detection is omitted because it produces false positives in plain JS (no type flow to distinguish intentional from accidental omissions). Add TypeScript if you need it.

**² Python function/file/depth metrics** — ruff does not implement line-count rules; only complexity and argument counts are available in the ruff rule set. Installing pylint adds these but significantly slows CI. The PLR0913 (max-args) and C901 (cyclomatic) rules are enforced; line-length metrics are considered a lower-priority constraint in the Python community.

**³ Java cognitive complexity and type safety** — no standard Java tool exposes cognitive complexity as a configurable rule (PMD and Checkstyle use cyclomatic and NPath). Type safety is enforced at compile time by the JVM; SpotBugs or NullAway add null-safety checking but require build-tool plugin integration that noslop cannot safely inject into an existing `build.gradle`.

**⁴ Go file length and depth** — golangci-lint does not have a built-in file-length linter; `wsl` and `maintidx` cover related concerns. Nesting depth is not a standard Go lint rule; idiomatic Go uses early returns which make deep nesting structurally unlikely.

**⁵ PHP cognitive complexity** — no PHP tool (PHPStan, PHPMD, or PHP CS Fixer) exposes cognitive complexity as a metric. PHPMD provides NPath complexity as a combinatorial alternative. PHPStan level 8 covers type correctness.

**⁶ Ruby type safety** — Ruby is dynamically typed. Sorbet and RBS add optional type annotations but require codebase-wide adoption; noslop cannot enable them without modifying `Gemfile`. Perceived complexity (a RuboCop proxy for cognitive complexity) is enforced instead.

**⁷ Swift cognitive complexity and unused code** — SwiftLint has no cognitive complexity rule. Unused-variable detection is handled by the Swift compiler at `-warnUnusedResult` level; no separate lint rule is needed.

**⁸ Rust cyclomatic complexity, file length, and depth** — Clippy's cyclomatic complexity lint was deprecated; cognitive complexity is the enforced metric. File length and nesting depth are not Clippy rules; the Rust borrow checker and ownership model make deeply nested, large files structurally difficult to compile cleanly.

**⁹ C/C++ cyclomatic complexity, file length, and unused code** — clang-tidy's `readability-function-cognitive-complexity` and `readability-function-size` cover the function-level metrics. There is no clang-tidy check for total file length. Cyclomatic complexity is subsumed by cognitive complexity in the LLVM rule set. Unused code detection requires whole-program analysis (`-Wunused` during compilation, not via clang-tidy).

**¹⁰ Scala** — Scalafix is a refactoring tool (AST rewrites), not a metrics analyser. It has no complexity or size rules. Scalastyle provides these metrics but requires a `build.sbt` plugin entry that noslop cannot safely inject. The Scala compiler's strong type system and pattern-match exhaustiveness checking cover most correctness concerns that complexity metrics are intended to prevent.

**¹¹ Elixir cognitive complexity and file length** — Credo has no cognitive complexity check. Elixir's functional style (small, composable functions with pattern matching) means file length is less meaningful than in OOP languages; Credo's module-level checks partially cover this.

**¹² Dart** — `dart analyze` has no complexity or size metrics. The `dart_code_metrics` package adds all eight categories but requires a `dev_dependencies` entry in `pubspec.yaml`, which noslop cannot add without modifying project files it does not own. Type safety is enforced via `analysis_options.yaml` strict mode.

**¹³ Haskell** — HLint is a style linter, not a metrics tool. Haskell's type system (with GHC warnings as errors) and referential transparency make classical OOP-era complexity metrics largely inapplicable; a function with a complexity of 20 in imperative code often has complexity 2 when expressed as pattern matching.

**¹⁴ Lua** — No Lua tool exposes complexity, size, or type metrics. Luacheck covers unused variables and global leakage. Lua is primarily an embedding language; strict metrics enforcement is impractical without language-server-level analysis (`lua-language-server`), which has no batch-mode gate interface.

**¹⁵ Zig** — Zig has no external linter ecosystem. The compiler enforces exhaustive switch statements, no implicit casts, and no unused variables as hard errors. Complexity and size metrics are not yet available as standalone tooling; `zig build` with warnings-as-errors is the enforced gate.

**¹⁶ OCaml** — The OCaml ecosystem has no standalone complexity tool. `dune @check` runs the compiler with full type checking; `ocamlformat` enforces formatting. Warnings-as-errors (`-warn-error +a`) covers unused variables and non-exhaustive patterns. Complexity metrics exist only as proprietary tools without standard config files.

---

## License

MIT
