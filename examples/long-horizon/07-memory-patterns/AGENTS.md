# Agent Instructions — Relay

## Session Start

1. **MEMORY.md is auto-loaded.** At the start of every session, the contents
   of `.claude/memory/MEMORY.md` are available to you. Scan it for key facts,
   active gotchas, and recent lessons before doing anything else.

2. **Check relevant topic files.** Before starting work, consider whether any
   topic file applies to your current task:
   - Working on design or architecture? Read `architecture-decisions.md`.
   - Investigating a bug? Read `debugging-playbook.md`.
   - Writing code or preparing a PR? Read `team-preferences.md`.
   You do not need to read all topic files every session. Read only what is
   relevant.

## During Work

3. **When you learn something new, update memory.** If you discover a non-obvious
   fix, a pattern that tripped you up, or a convention the team follows, add it
   to the appropriate memory file. Future sessions will benefit.

4. **When you find outdated memory, correct it.** If a memory entry contradicts
   what you observe in the code, update or remove it immediately. Stale memory
   is worse than no memory because it actively misleads.

5. **Match the existing format.** When adding entries to a memory file, follow
   the structure of existing entries (headings, date format, level of detail).
   Consistency makes memory files scannable.

## Memory Hygiene

6. **Keep MEMORY.md under 50 lines.** It loads every session, so every line
   costs tokens. If MEMORY.md grows too long, move details into a topic file
   and replace the detail with a one-line pointer.

7. **Move detail to topic files.** MEMORY.md should contain key facts and links.
   Detailed explanations, multi-step playbooks, and lengthy rationales belong
   in dedicated topic files.

8. **Date your entries.** Include a date when adding debugging playbook entries
   or architecture decisions. This lets future sessions judge whether the
   information is current or potentially outdated.

9. **Delete, do not comment out.** When removing outdated memory, delete the
   entry entirely. Commented-out entries waste tokens and create confusion.

## Creating New Topic Files

10. **If a new area of knowledge accumulates, create a new topic file.** For
    example, if you find yourself repeatedly noting performance tuning tips,
    create `.claude/memory/performance-tuning.md` and add a pointer in
    MEMORY.md. Follow the same format as existing topic files.

## Memory Freshness Protocol

11. **At session start: check the Last Reviewed date.** Look at the
    `Last Reviewed` line at the bottom of MEMORY.md. If it is older than
    30 days, flag it to the user: "MEMORY.md has not been reviewed in
    over 30 days. Some entries may be stale." Then scan for obvious
    staleness before relying on any entry.

12. **Before using an ADR: verify version references.** If an ADR or
    memory entry mentions specific version numbers (Redis 6.x, Go 1.21,
    Node 18), check against current dependencies before following its
    guidance. Version-specific advice is the most common source of stale
    memory.

13. **After each session: update if you learned something.** If you
    discovered new debugging patterns, corrections to existing memory, or
    new gotchas, update the relevant memory file and bump the
    `Last Reviewed` date in MEMORY.md.

14. **Monthly: audit for staleness.** Scan all memory files for entries
    with no modifications in 60+ days. Either verify they are still
    accurate or mark them `[UNVERIFIED]`. Unverified entries should be
    treated as hints, not facts — always confirm against the code before
    relying on them.
