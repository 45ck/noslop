# Agent Instructions — Beacon

## Context Loading Protocol

1. **Always read `docs/module-map.md` first** when working in an unfamiliar
   area. It gives you a one-paragraph summary of every module without reading
   any source code.

2. **Use `docs/context-selectors.md` to decide what to read.** Do not guess
   which files are relevant. Look up the task type and read the listed files.
   This is faster and more accurate than exploring the file tree.

3. **Read the minimal set of files needed for the task.** If the context
   selector says to read 6 files, read those 6 files. Do not preemptively
   read an entire module "just in case."

4. **Check layer-specific CLAUDE.md files** in the relevant `src/*/` directory
   for module-specific patterns and constraints before writing code.

## Working Conventions

5. **When creating PRs, reference which modules were affected** in the
   description. Use the module names from the module map (e.g., "ingestion",
   "query") so reviewers know what areas changed.

6. **If you add a new module, update the module map.** Add a paragraph to
   `docs/module-map.md` following the existing format: purpose, key files,
   important patterns. Update the dependency graph if needed.

7. **If you add a new task pattern, update context selectors.** When you
   discover a recurring task type that is not covered in
   `docs/context-selectors.md`, add a new entry with the appropriate file
   lists.

## Avoiding Common Mistakes

8. **Do not load the entire codebase.** This project has 50k+ lines of code.
   Loading everything wastes tokens and reduces the quality of your output.

9. **Do not skip the module map.** Reading source code without context leads
   to misunderstanding module boundaries and dependency directions.

10. **Do not modify files outside the modules relevant to your task** without
    first confirming with the user. Cross-cutting changes require broader
    context than a single task selector provides.
