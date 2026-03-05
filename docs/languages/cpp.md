# C/C++ — noslop pack

> Enforces cognitive complexity limits, function size constraints, and C++ Core Guidelines via clang-tidy.

## Prerequisites

| Tool       | Version | Install                                                           |
| ---------- | ------- | ----------------------------------------------------------------- |
| Clang/LLVM | latest  | [llvm.org](https://llvm.org/) (includes clang-format, clang-tidy) |
| cppcheck   | latest  | [cppcheck.sourceforge.io](https://cppcheck.sourceforge.io/)       |
| CMake      | latest  | [cmake.org](https://cmake.org/)                                   |

## Install

```sh
noslop init --pack cpp   # or: auto-detected from CMakeLists.txt
noslop doctor
```

## What gets installed

Shared plumbing (`.githooks/`, `.github/workflows/`, `.claude/`, `scripts/`, `AGENTS.md`) — see [What gets dropped into your repo](../../README.md#what-gets-dropped-into-your-repo).

Additionally: `.clang-tidy` — clang-tidy configuration (cognitive complexity, function size, C++ Core Guidelines)

## Quality rules

| Config file | Rule                 | Threshold                                            |
| ----------- | -------------------- | ---------------------------------------------------- |
| .clang-tidy | Cognitive complexity | COG ≤ 15 (readability-function-cognitive-complexity) |
| .clang-tidy | Function length      | ≤ 80 lines (readability-function-size)               |
| .clang-tidy | Parameter count      | ≤ 4 (readability-function-size)                      |
| .clang-tidy | Nesting depth        | ≤ 4                                                  |
| .clang-tidy | Type safety          | strictest (cppcoreguidelines type rules)             |

> **Note:** Cyclomatic complexity is not separately enforced -- it is subsumed by cognitive complexity in the LLVM rule set. File length is not enforced (no clang-tidy check for total file length). Unused code detection requires `-Wunused` during compilation; clang-tidy operates on the AST, not whole-program analysis.

## Gate tiers

| Tier | Trigger        | Command                                                                                                                                                                                                                                                                                 |
| ---- | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| fast | pre-commit     | `find . \( -name "*.c" -o -name "*.cpp" -o -name "*.h" \) \| xargs clang-format --dry-run --Werror`                                                                                                                                                                                     |
| fast | pre-commit     | `cppcheck --error-exitcode=1 --quiet .`                                                                                                                                                                                                                                                 |
| fast | pre-commit     | `typos` (spell)                                                                                                                                                                                                                                                                         |
| slow | pre-push       | `cmake -B build -DCMAKE_BUILD_TYPE=Release && cmake --build build`                                                                                                                                                                                                                      |
| slow | pre-push       | `ctest --test-dir build --output-on-failure`                                                                                                                                                                                                                                            |
| ci   | GitHub Actions | `find . \( -name "*.c" -o -name "*.cpp" -o -name "*.h" \) \| xargs clang-format --dry-run --Werror && cppcheck --error-exitcode=1 --quiet . && typos && cmake -B build -DCMAKE_BUILD_TYPE=Release && cmake --build build && ctest --test-dir build --output-on-failure` (full pipeline) |

## Verifying

```sh
noslop doctor
```

See [Quick start](../../README.md#quick-start) for expected output.

## Troubleshooting

- **clang-format style conflict** — If your project already has a `.clang-format` file, clang-format will use it instead of defaults. Reconcile your style with the noslop expectations or remove the conflicting file.
- **cppcheck false positives in third-party headers** — Use `--suppress` flags or add a `cppcheck-suppressions.txt` file to exclude vendor/third-party directories.
- **CMake configure step needed first** — clang-tidy requires a `compile_commands.json`. Run `cmake -B build -DCMAKE_EXPORT_COMPILE_COMMANDS=ON` to generate it before linting.
- **clang-tidy not finding headers** — Ensure `compile_commands.json` is up to date and in the project root or build directory. Symlink it if needed: `ln -s build/compile_commands.json .`.
