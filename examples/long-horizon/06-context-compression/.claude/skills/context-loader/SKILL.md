---
name: context-loader
description: >
  Load relevant codebase context based on task type. Trigger this skill when
  starting any task that involves understanding or modifying the Beacon codebase,
  especially when working in an unfamiliar area.
triggers:
  - "load context for"
  - "I need to work on"
  - "help me understand"
---

# Context Loader Skill

You help the agent load the right files for the current task instead of
reading the entire codebase.

## Instructions

When invoked with a task description, follow these steps:

### Step 1: Read the Module Map

Read `docs/module-map.md` to understand the high-level codebase structure.
Identify which modules are relevant to the described task.

### Step 2: Match Against Context Selectors

Read `docs/context-selectors.md` and find the task type that best matches
the description. If the task spans multiple categories, combine the selectors.

Task type mapping hints:
- Mentions "event", "tracking", "ingestion" → Adding a New Event Type
- Mentions "chart", "graph", "visualization" → Adding a New Chart Type
- Mentions "dashboard", "UI", "component" → Fixing a Dashboard Bug
- Mentions "login", "permission", "API key", "token" → Changing Auth Flow
- Mentions "billing", "subscription", "plan", "invoice" → Billing Issue
- Mentions "slow", "timeout", "latency", "memory" → Performance Problem
- Mentions "job", "worker", "queue", "scheduled" → Worker / Job Issue
- Mentions "schema", "API", "GraphQL", "endpoint" → API Schema Change

### Step 3: Load Targeted Context

Read only the files listed in the matched selector's **Read** column.
Do not read files outside this set unless you discover a dependency during
the investigation.

### Step 4: Summarize What You Loaded

Before starting work, output a brief summary:

```
Loaded context for: [task type]
Modules involved: [list]
Key files read: [list]
Files likely to be modified: [list]
Relevant tests: [list]
```

### Step 5: Check Layer-Specific Rules

If the relevant modules have their own `CLAUDE.md` files (e.g.,
`src/query/CLAUDE.md`), read those for module-specific constraints and
patterns before writing code.

## Notes

- If no selector matches, fall back to reading the module map summaries for
  the two most relevant modules and explore from there.
- Keep token budget in mind. Prefer reading key files (validators, services,
  resolvers) over utility or test files during the context-loading phase.
- If the task requires cross-cutting changes (more than 3 modules), flag
  this to the user before proceeding.

## Compaction

If total loaded context exceeds ~8,000 tokens:
1. Identify entries with `last_verified` older than 60 days — summarize to one line each
2. Collapse implementation details, keep only interface signatures
3. Remove examples, keep only the rule they demonstrate
4. Target: reduce to ~5,000 tokens while preserving all rules and current-task context
