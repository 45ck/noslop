# 01 — Flat Context

## Pattern

Put everything the agent needs into a single `CLAUDE.md` at the repository root. One file, no hierarchy, no indirection.

## When to use

- Solo projects, small teams
- Libraries, CLI tools, scripts, small APIs
- Codebases under ~5,000 lines of code
- When the full context fits comfortably in ~100-200 lines

## How it works

The agent reads `CLAUDE.md` at the start of every session. Because the file is small, it always fits in context and the agent always has complete information about the project's rules, architecture, and conventions.

The included `AGENTS.md` adds lightweight instructions for agent behavior (quality gates, commit conventions). In Claude Code, `AGENTS.md` is loaded alongside `CLAUDE.md` automatically.

## Tradeoffs

**Advantages:**
- Zero overhead — one file to maintain
- Agent always sees everything — no risk of missing context from another file
- Easy to review — anyone can read the full set of rules in 2 minutes

**Disadvantages:**
- Doesn't scale — past ~200 lines, the file becomes hard to maintain and wastes context tokens
- No layer-specific detail — a frontend developer and a backend developer see the same context
- Global changes only — you can't give the agent different rules for different parts of the codebase

## When to graduate to hierarchical (02)

Move to the hierarchical pattern when any of these are true:

- Your `CLAUDE.md` exceeds ~200 lines
- Your codebase has distinct subsystems with different conventions (e.g., API vs UI)
- Different parts of the codebase use different languages or frameworks
- You find yourself writing "if working in X, do Y; if working in Z, do W" — that's a sign to split

## Anti-patterns

### Bloated flat file

A 400-line `CLAUDE.md` defeats the purpose of flat context. The agent's attention to each individual rule degrades as the file grows. If you are past ~200 lines, you are paying a context-window tax for content the agent half-ignores. Split into hierarchical (02) instead.

### Contradictory rules

When one section says "always use semicolons" but your Prettier config has `semi: false`, the agent has to guess which authority wins. Rules in `CLAUDE.md` must agree with the config files already in the repo. When in doubt, defer to the config file and delete the prose rule.

### Kitchen-sink file mixing concerns

A file that interleaves behavioral instructions ("never push to main"), domain knowledge ("our billing model uses metered seats"), coding conventions ("use camelCase"), and architecture decisions ("we chose DynamoDB because...") forces the agent to context-switch constantly. Group related rules under clear headings, and keep behavioral/workflow rules in `AGENTS.md` rather than mixing them into the project knowledge file.

## Files

- `CLAUDE.md` — Complete project context for a small Express.js REST API
- `AGENTS.md` — Agent behavior rules (quality gate, commit conventions)
