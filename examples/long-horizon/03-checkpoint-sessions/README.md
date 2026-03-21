# 03 — Checkpoint Sessions

A pattern for managing work that spans multiple AI coding sessions.

## The Problem

Long tasks get interrupted. Context windows fill up, sessions time out,
your laptop dies, or you simply need to stop for the day. When you start
a new session, the agent has no memory of what happened before. You lose
momentum re-explaining context, and risk duplicating or skipping work.

Research on long-horizon AI agents (Cognition, "Deep Agents") found
that model performance degrades significantly after roughly 35 minutes of
continuous work. Beyond that window, agents start losing track of their
objectives, skipping steps, and producing lower-quality output. Checkpoint
sessions address this by giving the agent a persistent, external plan it
can re-read at the start of every session to re-anchor its understanding.

## The Pattern

Write a **session plan** with numbered **checkpoints**. Each checkpoint
is a unit of work sized to fit within the 35-minute effective working
window. The plan lives in your repo so every new session can read it,
find where you left off, and continue.

```
Checkpoint 1: Audit & Plan          [x] done
Checkpoint 2: Schema Migration      [x] done
Checkpoint 3: Repository Layer      [!] FAILED
Checkpoint 3b: Repository Recovery  [~] in progress
Checkpoint 4: API Layer             [ ] pending
Checkpoint 5: Cleanup               [ ] pending
```

When an agent starts a new session, it reads the plan, finds checkpoint 3b
(first incomplete), validates the entry criteria, and picks up the work.

## Checkpoint Structure

Each checkpoint has four parts:

1. **Entry criteria** -- conditions that must be true before starting.
   These are verifiable: "migration SQL exists in `db/migrations/`",
   "all unit tests pass", "`npm run build` succeeds".

2. **Work items** -- specific tasks to complete. Each is a checkbox
   the agent marks as it finishes.

3. **Exit criteria** -- conditions that must be true when done.
   The agent validates these before marking the checkpoint complete.

4. **Rollback plan** -- what to undo if the checkpoint fails partway
   through. Which changes are safe to keep, which must be reverted,
   and the exact commands to run.

## Status Markers

| Marker | Meaning     | Description                                            |
|--------|-------------|--------------------------------------------------------|
| `[x]`  | Done        | All work items and exit criteria satisfied              |
| `[~]`  | In progress | Some work items started or completed                   |
| `[!]`  | Failed      | Checkpoint attempted but hit a blocking failure         |
| `[-]`  | Skipped     | Intentionally skipped (reason documented)              |
| `[ ]`  | Pending     | Not yet started                                        |

The `[!]` marker is distinct from `[~]` in progress. A failed checkpoint
means the agent tried, hit a problem it could not resolve within the
checkpoint's scope, and stopped. The failure reason and any partial
progress must be documented in the Notes section.

## How an Agent Picks Up

1. Read the session plan (e.g., `.claude/plans/migration-plan.md`)
2. Optionally read `claude-progress.json` for machine-readable state
3. Find the first checkpoint that is not `[x]` done or `[-]` skipped
4. Validate the entry criteria -- if they are not met, stop and report
5. Work through the items, checking each off as completed
6. When all items are done, validate the exit criteria
7. Mark the checkpoint `[x]` done and update the plan file
8. If time/context remains, continue to the next checkpoint

## When Checkpoints Break

Checkpoints fail. A migration throws an unexpected FK constraint error.
A test suite reveals a dependency on data that does not exist yet. A
build breaks because of a circular import introduced three checkpoints ago.

When a checkpoint fails mid-execution:

1. **Stop and document.** Mark the failing work item with `[!] FAILED`
   and write the error details in the Notes section. Do not try to
   power through -- a failed checkpoint with clear notes is more useful
   than a "completed" checkpoint with hidden problems.

2. **Execute the rollback plan.** Each checkpoint should have a Rollback
   section. Follow it to undo partial work that would block future
   attempts. If no rollback plan exists, document what needs to be undone.

3. **Create a recovery checkpoint.** Use the `Nb` naming convention
   (e.g., Checkpoint 3b) to insert a recovery checkpoint immediately
   after the failed one. The recovery checkpoint should:
   - Reference the failure in its entry criteria
   - Address the root cause (not just the symptom)
   - Include the remaining work from the failed checkpoint
   - Have its own rollback plan

4. **Update the plan header.** Set `Current checkpoint` to the recovery
   checkpoint (e.g., `3b`) so the next session picks up there.

The migration-plan.md example in this directory demonstrates this pattern:
Checkpoint 3 failed due to a foreign key constraint violation in test seed
data, and Checkpoint 3b was created to resolve it.

## JSON State Files

Alongside the markdown plan, consider maintaining a `claude-progress.json`
file. Structured JSON is less likely to be corrupted by models during long
sessions than free-form markdown. The JSON file provides machine-readable
state that agents can parse reliably, while the markdown plan remains the
human-readable source of truth.

See `claude-progress.json` in this directory for an example.

## Tips

- **Size checkpoints for the 35-minute window.** Research shows agent
  performance degrades after roughly 35 minutes of continuous work. Keep
  each checkpoint to 3-5 work items that fit comfortably within that window.
  If a checkpoint has more than 5-7 items, split it.
- **Make exit criteria verifiable.** "Code looks good" is not verifiable.
  "All tests pass and `npm run lint` reports zero errors" is.
- **Include rollback plans.** Every checkpoint should document how to undo
  partial work. When a checkpoint fails halfway, you need to know which
  changes are safe to keep and which must be reverted.
- **Keep the plan in version control.** Commit checkpoint status updates
  so you have a history of progress.
- **One active plan at a time.** Mark plans as "active" or "completed"
  to avoid confusion.

## When to Use This Pattern

- Database migrations with multiple phases
- Large refactors (e.g., moving from REST to GraphQL)
- Multi-phase feature rollouts
- Framework or language upgrades
- Any task you expect to take 3+ sessions

## Files in This Example

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Project context the agent reads every session |
| `AGENTS.md` | Instructions for how agents should follow the plan |
| `.claude/plans/migration-plan.md` | A realistic in-progress session plan with a failure |
| `.claude/plans/TEMPLATE.md` | Blank template for creating new plans |
| `claude-progress.json` | Machine-readable progress state (JSON companion to the plan) |
