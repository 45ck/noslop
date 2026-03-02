# noslop Glossary

Single source of truth for terms used across source code, tests, templates, and documentation.
When in doubt about what a word means in this codebase, look here first.

---

## Core domain concepts

### Gate

A single quality enforcement command with a label, a shell command, and a tier.

```ts
type Gate = Readonly<{ label: string; command: string; tier: GateTier }>;
```

A Gate is a **value object** — two gates with identical fields are identical. Gates have no
identity of their own; they exist only as members of a Pack's `gates` array.

Examples: `{ label: 'lint', command: 'cargo clippy -- -D warnings', tier: 'fast' }`

---

### Pack

A named set of Gates for a specific language or ecosystem.

```ts
type Pack = Readonly<{ id: string; name: string; gates: readonly Gate[] }>;
```

A Pack is an **entity** — it is identified by its `id` string (e.g. `'typescript'`, `'rust'`).
Nineteen packs ship with noslop. Packs are immutable constants defined in
`src/domain/packs/{id}/{id}.ts`.

---

### Tier

The execution context for a Gate. One of three values:

| Value  | Trigger           | Typical gates                   |
| ------ | ----------------- | ------------------------------- |
| `fast` | `pre-commit` hook | Format check, lint, spell       |
| `slow` | `pre-push` hook   | Type check, build, tests        |
| `ci`   | GitHub Actions    | Full pipeline, mutation testing |

Tiers enforce a **time budget contract**: fast gates must complete in seconds, slow gates in
under a minute, ci gates may take longer but run remotely.

---

### NoslopConfig

The configuration written to `.noslop.json` in the target repository. Captures which packs
are active, which paths are protected from agent modification, and spell-checking settings.

```ts
type NoslopConfig = Readonly<{
  packs: readonly string[]; // pack IDs
  protectedPaths: readonly string[]; // paths agents must not edit
  spell: SpellConfig;
}>;
```

---

### SpellConfig

The spell-checking configuration embedded in NoslopConfig.

```ts
type SpellConfig = Readonly<{
  enabled: boolean;
  language: string; // locale code, e.g. 'en'
  words: readonly string[]; // project-specific vocabulary
}>;
```

TypeScript/JavaScript packs use `cspell`; all other packs use `typos`. The init use case
writes the appropriate config file (`cspell.json` or `.typos.toml`) on install.

---

### Protected path

A file or directory path that AI coding agents are not permitted to edit after noslop is
installed. Stored in `NoslopConfig.protectedPaths`. Enforced by `.claude/settings.json`
and `.claude/hooks/pre-tool-use.sh`.

Default protected paths: `.githooks/`, `.github/`, `.claude/`, `.noslop.json`.

---

## Commands

### init

Interactive installation. Detects packs, prompts before overwriting existing files, writes
templates, and wires git hooks. Intended for developer workstations.

### install

Non-interactive / idempotent installation. Always overwrites. Intended for CI bootstrap
scripts and coding agents. Equivalent to `init` with `AlwaysOverwriteConflictResolver`.

### check

Runs quality gates for the detected packs at a given tier. Used by git hooks and CI.
Exit code 0 = all gates passed; exit code 1 = one or more gates failed.

### doctor

Verifies that hooks, CI files, and Claude Code settings are present and correctly wired.
Reports each check individually. Exit code 0 = healthy; exit code 1 = one or more checks failed.

### setup

Interactive wizard. Detects packs, confirms choices with the user via `@clack/prompts`,
then delegates to `install`. Entry point for first-time users.

---

## Architecture terms

### Use case

An async function in `src/application/` that orchestrates domain logic and calls ports.
Named `{verb}-{noun}-use-case.ts`. Has no knowledge of HTTP, CLI, or filesystem specifics —
those are injected via ports.

### Port

An interface in `src/application/ports/` that abstracts I/O. Implemented twice: once as an
in-memory adapter (tests) and once as a Node.js adapter (production).

Current ports: `IFilesystem`, `IProcessRunner`, `IConflictResolver`.

### Conflict resolver

A port (`IConflictResolver`) that decides what to do when a template file already exists at
the target path. Two implementations ship:

- `AlwaysOverwriteConflictResolver` — silently overwrites (used by `install`)
- Prompt resolver — asks the user interactively (used by `init`)

### Template

A file in `templates/packs/{id}/` that is copied verbatim into the target repository during
`init` or `install`. Templates are static — they are not rendered with variables.

---

## Testing terms

### In-memory adapter

A test double that satisfies a port interface using an in-memory data structure instead of
real I/O. `InMemoryFilesystem` seeds files via `fs.seed(path, content)`.
`InMemoryProcessRunner` returns pre-configured results.

### Integration test

A test in `src/integration/` that exercises real I/O — real filesystem, real process spawn,
or real file parsing. Excluded from unit coverage thresholds. Three suites:

- `init-doctor-integration.test.ts` — real temp-dir install + doctor cycle
- `cli-spawn.test.ts` — spawns `dist/presentation/cli.js` as a child process
- `docs-sync.test.ts` — parses `docs/languages/*.md` gate tables against pack source

---

## Spell checking

noslop installs one of two spell checkers depending on the pack:

| Tool     | Packs                  | Config file   |
| -------- | ---------------------- | ------------- |
| `cspell` | TypeScript, JavaScript | `cspell.json` |
| `typos`  | All other packs        | `.typos.toml` |

Both tools run at the `fast` tier (pre-commit).
