# 02 — Hierarchical Context

## Pattern

Place `CLAUDE.md` files at multiple directory levels. The root file covers global rules and architecture. Subdirectory files cover layer-specific conventions, patterns, and commands. The agent sees the root file plus whichever subdirectory file is relevant to its current working location.

## How CLAUDE.md inheritance works

When an agent works in `src/api/`, it sees:
1. The root `CLAUDE.md` (global rules, architecture overview, cross-cutting concerns)
2. `src/api/CLAUDE.md` (API-specific patterns, middleware conventions, route naming)

This means subdirectory files can assume the agent already knows the global rules. They should add detail, not repeat the root file.

## When to split

Move from flat to hierarchical when:
- Your codebase exceeds ~10,000 lines of code
- You have distinct subsystems (API, database, UI, workers, etc.)
- Different layers use different frameworks, languages, or conventions
- Your flat `CLAUDE.md` has grown past ~200 lines
- You find yourself writing conditional rules ("if working in X, do Y")

## What goes where

**Root CLAUDE.md:**
- Product description and purpose
- Full tech stack overview
- Global quality commands (`npm run ci`)
- Cross-layer rules (TypeScript strict, no `any`, error handling philosophy)
- Architecture diagram showing how layers connect
- Dependency rules between layers

**Subdirectory CLAUDE.md:**
- Framework-specific patterns (Express middleware, React component patterns)
- Local commands (e.g., `npm run test:api`)
- File naming and organization within that layer
- Testing approach specific to that layer
- Common pitfalls and gotchas for that layer

## The example

A full-stack SaaS project management tool with three layers:

```
CLAUDE.md              # Global rules, architecture overview
AGENTS.md              # Agent behavior and workflow rules
src/
  api/CLAUDE.md        # Express routes, middleware, auth patterns
  db/CLAUDE.md         # Prisma ORM, migrations, repository pattern
  ui/CLAUDE.md         # Next.js, components, styling, accessibility
```

## Hierarchy Gone Wrong

### Over-splitting

Fifteen tiny `CLAUDE.md` files with 2-3 lines each create more problems than they solve. The agent spends tokens navigating between files, and the navigation overhead can exceed the cost of a single well-organized file. A good heuristic: if a subdirectory file would be under ~20 lines, its content probably belongs in the parent file instead. Hierarchy should follow real architectural boundaries, not the directory tree.

### Stale subdirectory files

A subdirectory `CLAUDE.md` that references an API endpoint, middleware pattern, or naming convention that no longer exists is worse than having no file at all. The agent will confidently follow outdated instructions and produce code that contradicts the actual codebase. Review subdirectory context files whenever you make structural changes to that layer. If you rename the auth middleware from `authenticate` to `requireAuth`, update `src/api/CLAUDE.md` in the same commit.

## Files

- `CLAUDE.md` — Root context for the full project
- `AGENTS.md` — Agent behavior rules for multi-layer work
- `src/api/CLAUDE.md` — API layer conventions
- `src/db/CLAUDE.md` — Database layer conventions
- `src/ui/CLAUDE.md` — UI layer conventions
