# Agent Instructions — url-shortener

## Session Start

1. Read `CLAUDE.md` fully. Pay attention to all rules, including naming,
   architecture boundaries, and the four annotated rules (database timeout,
   file header, error requestId, alphabetical parameters).
2. Read the current task or plan file to understand what you are building.

## Degradation Self-Check Protocol

Every 15 minutes of work (or every 5 completed tasks), perform a canary
check:

### Canary Check Procedure

1. Re-read `CLAUDE.md` from top to bottom.
2. Identify the four canary rules:
   - Database query functions include `timeoutMs` parameter (default 5000)
   - Every new file starts with `// Module: {filename} | Part of: url-shortener`
   - All error responses include a `requestId` field
   - Function parameters are alphabetically ordered in type definitions
3. Search the last 3 files you created or modified for compliance with
   each canary rule.
4. Report your adherence score: X/4 canary rules followed in the last
   3 files.

### Score Interpretation

- **4/4**: Context is holding. Continue working.
- **3/4**: Minor drift detected. Re-read the specific rule you missed
  and fix the violation before continuing.
- **2/4 or below**: Significant degradation. Pause all feature work.
  Re-read all context files (CLAUDE.md, AGENTS.md). Recite the current
  project state and task list from memory. If adherence does not recover,
  consider starting a new session.

### Logging

If `experiments/canary-results.md` exists, append your canary check
result:

```
| [timestamp] | [feature/task] | [score] | [missed rules] | [notes] |
```

## During Work

3. Follow all rules in CLAUDE.md. The canary rules are real project rules,
   not optional guidelines.
4. When creating new files, double-check the file header comment before
   moving on.
5. When writing database query functions, verify the `timeoutMs` parameter
   is present.
6. When returning error responses, verify `requestId` is included.
7. When defining type interfaces, verify parameters are alphabetical.
