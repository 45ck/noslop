# noslop

**Enforcement-first quality gate installer.**

`noslop` drops pre-commit hooks, CI workflows, and Claude Code guardrails into any existing repository in a single command. It supports 19 language packs. It does not generate project scaffolding or manage dependencies — it installs the enforcement layer on top of what you already have: git hooks that block bad commits locally, required GitHub Actions that block bad PRs centrally, and Claude Code permission rules that stop an agent from bypassing either of those layers. All three defences are wired together and verified by `noslop doctor`.

---

## Install

```sh
npm install -g @45ck/noslop
```

Or run without installing:

```sh
npx @45ck/noslop init
```

**Requirements:** Node 22+, git, `jq` (required by the Claude Code hook for secure JSON parsing).

---

## Quick start

```sh
# 1. Go to your existing repo
cd your-repo

# 2. Install quality gates
noslop init

# 3. Verify everything is wired
noslop doctor
```

---

## Commands

### `noslop init`

Detects the language pack for the current repo, copies templates into it, and sets `git config core.hooksPath .githooks`.

```
noslop init [options]

Options:
  -d, --dir <path>   Target directory (default: current working directory)
  --pack <id>        Force a specific pack (e.g. typescript, rust, dotnet, go, python)
```

Pack detection rules:

- **TypeScript** — `tsconfig.json` or `package.json` present
- **Rust** — `Cargo.toml` present
- **.NET** — any `.csproj` / `.sln` file, or `global.json` present

If none of the above are found, the TypeScript pack is used as a default.

---

### `noslop install`

Identical to `init` but non-interactive. Intended for CI pipelines and bootstrap scripts. Exits silently on success with a one-line summary.

```
noslop install [options]

Options:
  -d, --dir <path>   Target directory (default: current working directory)
  --pack <id>        Force a specific pack (e.g. typescript, rust, dotnet, go, python)
```

---

### `noslop check`

Runs the quality gates for a given tier against the detected packs.

```
noslop check [options]

Options:
  -d, --dir <path>   Target directory (default: current working directory)
  --tier <tier>      Gate tier to run: fast | slow | ci  (default: fast)
  --pack <id>        Limit to a specific pack
  --verbose          Show stdout/stderr for passing gates as well as failures
```

Examples:

```sh
noslop check --tier=fast
noslop check --tier=slow
noslop check --tier=ci --verbose
noslop check --tier=fast --pack=typescript
```

---

### `noslop doctor`

Verifies that hooks, CI workflow files, and Claude Code settings are all present and correctly wired. Exits with a non-zero code and lists every failed check if anything is missing.

```
noslop doctor [options]

Options:
  -d, --dir <path>   Target directory (default: current working directory)
```

Run this after `noslop init` to confirm the repo is fully protected.

---

## Language packs

Each pack is detected automatically from the contents of the target directory. You can override detection with `--pack`.

| Pack           | Detected by                          | Fast gates                                              | Slow gates                                 | CI gate                                                                         |
| -------------- | ------------------------------------ | ------------------------------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------- |
| **TypeScript** | `tsconfig.json`, `package.json`      | `prettier --check`, `eslint --max-warnings=0`, `cspell` | `tsc --noEmit`, `vitest run`               | `npm run ci`                                                                    |
| **Rust**       | `Cargo.toml`                         | `cargo fmt --check`, `cargo clippy -- -D warnings`      | `cargo test`                               | `cargo fmt --check && cargo clippy -- -D warnings && cargo test`                |
| **.NET / C#**  | `.csproj`, `.sln`, `global.json`     | `dotnet format --verify-no-changes`                     | `dotnet build /warnaserror`, `dotnet test` | `dotnet format --verify-no-changes && dotnet build /warnaserror && dotnet test` |
| **JavaScript** | `package.json`, `tsconfig.json`      | prettier, eslint                                        | npm test                                   | —                                                                               |
| **Go**         | `go.mod`                             | gofmt check, go vet                                     | go test                                    | —                                                                               |
| **Python**     | `pyproject.toml`, `requirements.txt` | black check, ruff                                       | pytest                                     | —                                                                               |
| **Java**       | `pom.xml`, `build.gradle`            | checkstyle, pmd                                         | gradle test                                | —                                                                               |
| **PHP**        | `composer.json`                      | php-cs-fixer, phpstan                                   | phpunit                                    | —                                                                               |
| **Ruby**       | `Gemfile`                            | rubocop layout, rubocop                                 | rspec                                      | —                                                                               |
| **Swift**      | `Package.swift`                      | swift-format, swiftlint                                 | swift test                                 | —                                                                               |
| **Kotlin**     | `build.gradle` + `.kt` files         | ktlint, detekt                                          | gradle test                                | —                                                                               |
| **C/C++**      | `CMakeLists.txt`                     | clang-format, cppcheck                                  | cmake+ctest                                | —                                                                               |
| **Scala**      | `build.sbt`                          | scalafmt check, scalafix                                | sbt test                                   | —                                                                               |
| **Elixir**     | `mix.exs`                            | mix format, mix credo                                   | mix test                                   | —                                                                               |
| **Dart**       | `pubspec.yaml`                       | dart format, dart analyze                               | dart test                                  | —                                                                               |
| **Zig**        | `build.zig`                          | zig fmt check, zig build                                | zig build test                             | —                                                                               |
| **Haskell**    | `.cabal`                             | ormolu, hlint                                           | cabal test                                 | —                                                                               |
| **Lua**        | `.rockspec`                          | stylua check, luacheck                                  | busted                                     | —                                                                               |
| **OCaml**      | `dune-project`                       | dune @fmt, dune @check                                  | dune runtest                               | —                                                                               |

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

## What gets dropped into your repo

`noslop init` copies the following files. Existing files are overwritten so the installed gates remain authoritative.

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

**Protected paths** — these paths may not be edited by Claude Code or modified in a PR without the `noslop-approved` label applied by a human reviewer:

- `.githooks/`
- `.github/workflows/`
- `.claude/settings.json`
- `.claude/hooks/`

---

## Tier system

Gates are grouped into three tiers, each mapped to a point in the development workflow.

| Tier   | Trigger                                      | Purpose                                                             |
| ------ | -------------------------------------------- | ------------------------------------------------------------------- |
| `fast` | `pre-commit` hook — before every commit      | Format, lint, spell check. Must complete in a few seconds.          |
| `slow` | `pre-push` hook — before every push          | Type checking and full test suite. Slower but still runs locally.   |
| `ci`   | GitHub Actions — on PRs and pushes to `main` | Full pipeline. Authoritative: cannot be skipped by any local trick. |

The hooks installed by `noslop init` call `noslop check --tier=fast` and `noslop check --tier=slow` when the `noslop` binary is on `PATH`, and fall back to the native toolchain commands if it is not.

---

## The --verbose flag

By default, `noslop check` only prints stdout and stderr for gates that fail. Pass `--verbose` to see output for every gate regardless of outcome. This is useful when diagnosing why a gate is slow, confirming which commands are actually running, or auditing a clean run end-to-end.

```sh
noslop check --tier=slow --verbose
```

---

## Defence-in-depth model

noslop installs three independent enforcement layers. Each layer can catch bypasses that slip past the previous one.

**Layer 1 — Local git hooks**

The `pre-commit` hook runs fast gates on every `git commit`. The `pre-push` hook runs slow gates on every `git push`. The `commit-msg` hook rejects commit messages that contain CI-bypass patterns (`[skip ci]`, `skip-checks`, `--no-verify`) or that do not follow Conventional Commits format. Hooks are wired via `git config core.hooksPath .githooks`, not via a dev-dependency, so they activate for every contributor without requiring `npm install` or any other setup step.

**Layer 2 — CI required checks**

`quality.yml` runs on every pull request and on pushes to `main`. Configured as a required status check, it cannot be skipped by bypassing local hooks or using `--no-verify`. `guardrails.yml` adds a second required check that triggers whenever a PR modifies the protected paths (`.githooks/`, `.github/workflows/`, `.claude/`), blocking that PR unless a human reviewer has applied the `noslop-approved` label.

**Layer 3 — Claude Code guardrails**

`.claude/settings.json` denies the agent permission to run commands containing `--no-verify`, `--force`, or `git push -f`, and denies it permission to edit any of the protected paths. `.claude/hooks/pre-tool-use.sh` intercepts every Bash tool call before execution and blocks commands containing `--no-verify`, `SKIP_CI`, `[skip ci]`, or ESLint config-disabling flags. `AGENTS.md` states all rules in plain language so that any AI coding agent working in the repo receives explicit written instructions at the start of each session.

---

## Requirements

| Requirement | Version     | Notes                                                                                                     |
| ----------- | ----------- | --------------------------------------------------------------------------------------------------------- |
| Node.js     | 22 or later | Required to run `noslop`                                                                                  |
| git         | any recent  | Required for hook wiring (`core.hooksPath`)                                                               |
| `jq`        | any recent  | Required by `.claude/hooks/pre-tool-use.sh`; the hook blocks all Claude Code tool calls if `jq` is absent |

Language toolchains (TypeScript compiler, ESLint, Prettier, Cargo, .NET SDK) must already be present in the target repo. noslop installs the enforcement layer; it does not install the tools themselves.

---

## License

MIT
