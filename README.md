# noslop

**Agent-boundary quality gates for any repo.**

noslop installs three enforcement layers — git hooks, CI required checks, and Claude Code guardrails — into any existing repository with a single command. It supports 19 language packs. It targets teams using Claude Code, Codex CLI, or similar AI coding agents where automated enforcement matters more than developer convenience.

## Who this is for

- Teams using Claude Code, Codex CLI, or similar AI coding agents
- Teams wanting zero-config enforcement on existing repos
- Repos where agents must not bypass lint, test, or CI gates

## Who this is NOT for

- Greenfield scaffolding — noslop bolts onto existing repos, it does not generate projects
- Replacing your linter or formatter — noslop enforces what you already have, it does not replace tools
- Manual-only workflows — if no AI agents touch your code, noslop is overkill

## Prerequisites

| Requirement | Version     | Notes                                                                                                     |
| ----------- | ----------- | --------------------------------------------------------------------------------------------------------- |
| Node.js     | 22 or later | Required to run `noslop`                                                                                  |
| git         | any recent  | Required for hook wiring (`core.hooksPath`)                                                               |
| `jq`        | any recent  | Required by `.claude/hooks/pre-tool-use.sh`; the hook blocks all Claude Code tool calls if `jq` is absent |

Language toolchains (TypeScript compiler, ESLint, Prettier, Cargo, .NET SDK) must already be present in the target repo. noslop installs the enforcement layer; it does not install the tools themselves.

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

## Three enforcement layers

Three independent enforcement layers, each able to catch bypasses that slip past the previous one:

**Layer 1 — Local git hooks.** The `pre-commit` hook runs fast gates (format, lint, spell) on every `git commit`. The `pre-push` hook runs slow gates (type check, tests) before every push. The `commit-msg` hook rejects messages containing CI-bypass patterns or not following Conventional Commits. Wired via `git config core.hooksPath .githooks` — no `npm install` required.

**Layer 2 — CI required checks.** `quality.yml` runs on every PR and push to `main`. Configured as a required status check, it cannot be skipped by bypassing local hooks. `guardrails.yml` blocks any PR that modifies the protected enforcement files unless a human reviewer has applied the `noslop-approved` label.

**Layer 3 — Claude Code guardrails.** `.claude/settings.json` denies the agent permission to run `--no-verify`, `--force`, or `git push -f`, and denies edits to any protected path. `.claude/hooks/pre-tool-use.sh` intercepts every Bash tool call before execution and blocks bypass patterns. `AGENTS.md` states all rules in plain language for any AI agent working in the repo.

## Claude Code quickstart

**`.claude/settings.json`** — Deny rules that prevent Claude Code from running bypass commands (`--no-verify`, `--force`, `git push -f`) and from editing protected paths (`.githooks/`, `.github/workflows/`, `.claude/`).

**`.claude/hooks/pre-tool-use.sh`** — Intercepts every tool call before execution. Blocks `--no-verify`, `SKIP_CI`, `[skip ci]`, ESLint config-disabling flags, and direct edits to quality gate config files. Returns structured JSON that Claude Code interprets as a hard block.

**`AGENTS.md`** — Plain-language rules that Claude Code reads before working in the repo. Includes gate commands, prohibited actions, and recovery steps when a gate fails.

**Verify:** `noslop doctor` — confirms all three guardrail files are present and hooks are wired.

## Codex quickstart

**`AGENTS.md`** — Codex reads `AGENTS.md` before working. It contains the same rules, gate commands, and recovery steps.

**Optional:** Add a `.codex/config.toml` with `model = "o4-mini"` and any sandbox preferences. noslop does not generate this file.

**Verify:** `noslop doctor` — confirms hooks and CI files are in place.

## What gets installed

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

## Configuration file

You can commit a `.noslop.json` file in your repo root to set defaults. CLI flags always take precedence over the config file.

```json
{
  "packs": ["typescript", "python"],
  "spell": {
    "language": "en",
    "words": ["noslop", "guardrail"]
  },
  "skipGates": ["mutation"]
}
```

| Field            | Type       | Description                               |
| ---------------- | ---------- | ----------------------------------------- |
| `packs`          | `string[]` | Pack IDs to use instead of auto-detection |
| `spell.language` | `string`   | BCP-47 locale for spell checking          |
| `spell.words`    | `string[]` | Seed vocabulary words                     |
| `skipGates`      | `string[]` | Gate labels to skip during `check`        |

## Troubleshooting

### `noslop doctor` reports failures

Run `noslop doctor --dir .` and check which items fail:

- **Hook files missing** — Run `noslop init` (or `noslop update` to preserve your configs) to regenerate them.
- **`git config core.hooksPath` not set** — Make sure the directory is a git repo (`git init`), then run `noslop init` again.
- **CI workflow files missing** — Run `noslop update --pack <your-pack>` to regenerate `.github/workflows/` files.

### Gate fails with "command not found"

noslop runs your project's own toolchain. If a gate reports a missing command:

1. Install project dependencies (`npm install`, `pip install -r requirements.txt`, etc.)
2. Verify the tool is on your PATH: `which eslint`, `which cargo`, etc.
3. For Node.js projects, ensure `node_modules/.bin` is populated.

### Pre-commit hook is slow

The `pre-commit` hook runs `--tier=fast` gates only. If it's still slow:

- Check which gates are in the `fast` tier for your pack (see `docs/languages/<pack>.md`).
- Use `git commit --no-verify` to skip hooks for a single commit (note: Claude Code guardrails block this for AI agents).
- Move expensive gates to the `slow` tier by editing your `.githooks/pre-commit` to use `--tier=fast` (default) and letting `pre-push` handle heavier checks.

### Windows-specific issues

- **`chmod` is a no-op on Windows** — Hook files are always created with correct content; the `chmod` call is for Unix permissions and is safely ignored on Windows.
- **Shell compatibility** — Git hooks use `#!/bin/sh`. On Windows, Git for Windows provides a POSIX shell. If hooks fail, ensure Git for Windows is installed and `sh` is available on PATH.
- **Path separators** — noslop uses forward slashes internally. If you see path errors, ensure you're using the `--dir` flag with forward slashes or quoted backslashes.

### `noslop check` passes locally but fails in CI

- CI runs `--tier=ci` which includes all gates (fast + slow + ci-only). Run `noslop check --tier=ci` locally to reproduce.
- Check that CI has the same toolchain versions as your local environment.
- Ensure CI installs project dependencies before running `noslop check`.

## Limits and non-goals

- **Repo policy layer, not host-level security.** noslop enforces rules within a repository. It does not sandbox processes or restrict network access.
- **Does not install toolchains.** Your language's linter, formatter, and test runner must already be available. noslop installs the enforcement config, not the tools.
- **GitHub Actions only.** CI workflows target GitHub Actions. GitLab CI and Bitbucket Pipelines are not yet supported.
- **A determined human can still bypass.** Local hooks can be skipped with `--no-verify`. CI is the authoritative gate. noslop makes bypass hard for agents, not impossible for humans.

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
  --json             Emit machine-readable JSON output
  --debug            Show internal diagnostics (resolved paths, commands)
  --skip-gate <label> Skip a gate by label; repeat for multiple (e.g. --skip-gate mutation)
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

### `noslop uninstall`

Removes all noslop-installed infrastructure files and resets git hook configuration. User config files (ESLint, pyproject, clippy, etc.) are left untouched.

```
noslop uninstall [options]

Options:
  -d, --dir <path>   Target directory (default: current working directory)
  --dry-run          Show what would be removed without deleting
  --json             Emit machine-readable JSON output
```

**What gets removed:**

- `.githooks/` directory
- `.github/workflows/quality.yml`, `.github/workflows/guardrails.yml`
- `.claude/settings.json`, `.claude/hooks/` directory
- `AGENTS.md`
- `scripts/check`, `scripts/fmt`, `scripts/lint`, `scripts/test`, `scripts/typecheck`, `scripts/mutation`, `scripts/spell`, `scripts/build`
- Empty parent directories (`.claude/`, `.github/workflows/`, `.github/`, `scripts/`)
- `git config core.hooksPath` is unset

**What is NOT removed:**

- Language-specific config files (`eslint.config.js`, `pyproject.toml`, `clippy.toml`, etc.)
- `.noslop.json`, `cspell.json`, `.typos.toml`

### `noslop doctor`

Verifies that hooks, CI workflow files, and Claude Code settings are all present and correctly wired. Exits with a non-zero code and lists every failed check if anything is missing.

## Exit codes

| Code | Constant            | Meaning                                                                          |
| ---- | ------------------- | -------------------------------------------------------------------------------- |
| `0`  | `EXIT_SUCCESS`      | All checks / gates passed, command completed successfully.                       |
| `1`  | `EXIT_GATE_FAILURE` | One or more gates failed (`check`) or health checks failed (`doctor`).           |
| `2`  | `EXIT_CONFIG_ERROR` | Invalid configuration: unknown pack, bad `--tier` value, missing `--dir` target. |

CI scripts can rely on these codes to distinguish between gate failures and config errors.

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
| **Zig**        | _(compiler)_                              |    — ¹⁵     |    — ¹⁵     |     — ¹⁵     |     — ¹⁵     |   — ¹⁵    |     — ¹⁵     |     ✓ compiler      |   ✓ compiler   |
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

## Guides

- [Monorepos](docs/guides/monorepos.md) — installing multiple packs, layout patterns, how gates fire per pack
- [Greenfield projects](docs/guides/greenfield.md) — setup wizard walkthrough, first-commit checklist, recommended configs per stack
- [Coding agents](docs/guides/coding-agents.md) — machine-readable install guide for Claude Code, Copilot Workspace, Cursor

## License

MIT
