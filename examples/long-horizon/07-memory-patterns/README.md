# 07 — Memory Patterns

## What Memory Is

Memory files are persistent documents stored in `.claude/memory/` that survive
across Claude Code sessions. Unlike conversation context, which is lost when a
session ends, memory files accumulate knowledge about a project over time. They
let an AI coding agent build up expertise the same way a human developer does:
by recording what it learns.

## How It Works

Set up your project so that `MEMORY.md` (or `.claude/memory/MEMORY.md`) is
loaded at the start of every session. In Claude Code, reference it from your
root CLAUDE.md or AGENTS.md to ensure the agent reads it. This file serves as
an index pointing to more detailed topic files. Topic files are not loaded
automatically; the agent consults them on demand when the current task is
relevant.

The structure:

```
.claude/
  memory/
    MEMORY.md                    # Always loaded. Index + key facts.
    architecture-decisions.md    # Design choices and their rationale.
    debugging-playbook.md        # Known issues and their fixes.
    team-preferences.md          # Conventions learned from feedback.
```

## What to Remember

- **Architectural decisions** — design choices with context and reasoning
- **Debugging solutions** — symptoms, root cause, and fix for non-obvious bugs
- **Team preferences** — style corrections from human reviewers
- **Recurring patterns** — rules that apply across multiple tasks

## What NOT to Remember

- **Session-specific state** — "I am working on issue #42" is stale instantly
- **Temporary workarounds** — only record if the underlying issue remains open
- **Unverified assumptions** — memory should contain facts, not hypotheses

## Staleness Management

Memory files drift as the project evolves. Mitigate this:

- **Review on conflict.** If you encounter a situation that contradicts memory,
  update the memory file immediately. Do not leave incorrect entries.
- **Periodic review.** Every few weeks, scan memory files for outdated entries.
  Remove or update them.
- **Date entries.** Include dates on debugging playbook entries and architecture
  decisions so you can gauge how current they are.
- **Keep MEMORY.md small.** It loads every session, so every line costs tokens.
  Move details to topic files and keep MEMORY.md as an index with key facts.

## Memory Structure

Think of memory as a two-tier system:

1. **MEMORY.md** — The index. Always loaded. Key facts and links to topic files.
   Target: under 50 lines.
2. **Topic files** — Detailed reference. Loaded on demand. Each covers one area
   (architecture decisions, debugging solutions, team conventions). Can be longer
   since they are only read when relevant.

## When to Use

- **Multi-session projects** where the same agent (or different agents) return
  to the codebase over days or weeks and need accumulated context.
- **Projects with recurring debugging patterns** — the same class of bug keeps
  appearing and you want the agent to recognize it immediately.
- **Team projects where conventions evolve** — human reviewers give feedback
  that should persist across all future sessions, not just the current one.
- **Codebases with non-obvious design decisions** — ADRs and rationale that
  are not captured in code comments.

Skip memory patterns for one-off tasks, short-lived projects, or codebases
where a single CLAUDE.md already captures everything the agent needs.

## Files in This Example

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Project context for the example |
| `.claude/memory/MEMORY.md` | Auto-loaded index file |
| `.claude/memory/architecture-decisions.md` | Design choices with rationale |
| `.claude/memory/debugging-playbook.md` | Known issues and solutions |
| `.claude/memory/team-preferences.md` | Conventions from human feedback |
| `AGENTS.md` | Agent behavior instructions |
