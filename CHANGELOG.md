# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-03-21

### Added

- `noslop init` — detect language packs, drop templates, and wire git hooks
- `noslop install` — non-interactive / idempotent init for CI and bootstrap scripts
- `noslop update` — re-install hooks and CI files while preserving user config
- `noslop check` — run quality gates by tier (`fast`, `slow`, `ci`)
- `noslop doctor` — verify hooks, CI files, and Claude Code settings are wired
- `noslop setup` — interactive wizard for guided pack selection and installation
- 19 language packs: TypeScript, JavaScript, Rust, .NET/C#, Python, Go, Java, Kotlin, Ruby, PHP, Swift, Scala, Elixir, Dart, Haskell, Lua, C/C++, Zig, OCaml
- Three enforcement layers: git hooks, CI required checks, Claude Code guardrails
- Tier system: `fast` (pre-commit), `slow` (pre-push), `ci` (GitHub Actions)
- Spell checking support via cspell (JS/TS) and typos (Rust, Go, etc.)
- `--no-spell` flag to disable spell checking
- `--pack` flag to force specific packs (repeatable for monorepos)
- `--verbose` flag for `check` command to show all gate output
- Conflict resolution for existing config files during init
- Claude Code guardrails: `settings.json` deny rules and `pre-tool-use.sh` hook
- `AGENTS.md` template with plain-language rules for AI coding agents
