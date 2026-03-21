# Project: csv-transform

## Product

csv-transform is a CLI tool for transforming CSV files. It supports column
selection, row filtering, column renaming, and output format conversion.
Designed for piping into other tools or generating reports from raw data.

## Tech Stack

- **Runtime:** Node.js 20 LTS
- **Language:** TypeScript 5.4
- **Testing:** Vitest
- **CLI parsing:** yargs
- **CSV parsing:** Custom streaming parser (no dependencies)

## Key Commands

```bash
npm run build        # Compile TypeScript
npm run test         # Run all tests
npm run test:watch   # Watch mode
npm run lint         # ESLint check
```

## File Structure

```
src/
  cli.ts             # CLI entry point and argument parsing
  parser.ts          # Streaming CSV parser
  transforms/
    select.ts        # Column selection
    filter.ts        # Row filtering
    rename.ts        # Column renaming
    format.ts        # Output format conversion (CSV, JSON, TSV)
  pipeline.ts        # Chains transforms together
  types.ts           # Shared types
tests/
  parser.test.ts
  transforms/
    select.test.ts
    filter.test.ts
    rename.test.ts
    format.test.ts
  pipeline.test.ts
  integration.test.ts
```

## Coding Rules

- No external dependencies for CSV parsing (streaming parser is custom)
- All transforms must implement the `Transform` interface
- Pure functions where possible; side effects only in `cli.ts`
- Every transform needs unit tests with edge cases (empty input,
  single row, headers only, malformed data)

## Progress Tracking

Track implementation progress in `todo.md` and `claude-progress.json`.

- After completing each task, update both files with current state.
- Every 3 completed tasks, re-read `todo.md` from disk and recite
  the remaining items aloud. This re-anchors your attention on what
  is left to do and prevents skipping or re-doing work.
- If working on a single task for more than 15 minutes without a
  progress update, pause and recite current state before continuing.
- When reciting, explicitly state: what was just completed, what is
  currently in progress, and what remains.
