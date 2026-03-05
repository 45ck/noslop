# Quality policy enforcement matrix

noslop installs a **starter quality config** alongside every pack's gate plumbing. The config enforces the same eight categories across all languages. Where a category cannot be enforced by the language's standard toolchain, the reason is documented below.

## Categories

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

## Coverage per pack

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

## Justified gaps

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
