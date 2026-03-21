# 08 — Progress Recitation

A technique for keeping AI agents on track during long sessions by
periodically re-reading and reciting their progress state.

## The Problem: Lost in the Middle

LLMs have a well-documented attention pattern: they pay the most attention
to the beginning and end of their context window, while information in
the middle gets less attention. This is the "lost in the middle" problem
(Liu et al., 2023). In practice, it means an agent working through a
10-item task list will reliably remember items 1-2 and 9-10, but may
lose track of items 5-6 in the middle.

For long-horizon coding sessions, this creates a specific failure mode:
the agent completes early tasks, then gradually drifts. It skips items,
re-does work it already finished, or forgets the overall goal entirely.
The Manus team documented this pattern in their context engineering blog
post and proposed a solution: periodic progress recitation.

## The Technique

Progress recitation forces the agent to pause, re-read its progress file
from disk, and explicitly state what has been done and what remains. This
moves the critical state information from the middle of the context (where
it gets lost) to the end (where the model pays the most attention).

The cadence matters. Recite too often and you waste tokens on redundant
state management. Recite too rarely and the agent drifts. A good default
is to recite every 3 completed tasks, or after any task that took more
than 15 minutes.

## JSON Progress Files

Markdown todo lists work, but structured JSON is more reliable for
machine consumption. Models are less likely to accidentally corrupt a
JSON file than a markdown checklist during edits. Use both:

- `todo.md` -- human-readable progress for review
- `claude-progress.json` -- machine-readable state for the agent

The JSON file gives the agent a quick, parseable snapshot without needing
to interpret markdown formatting or checkbox syntax.

## Anti-patterns

**Reciting too frequently.** Every single task completion does not need a
full recitation. This wastes tokens and slows the agent down. Save
recitation for cadence boundaries (every 3 tasks) or after confusion.

**Never reciting.** Without periodic re-anchoring, the agent relies
entirely on what remains in its context window. After 30+ minutes of
work, critical details from the start of the session have likely
scrolled out of effective attention range.

**Reciting without updating.** Reading the progress file is only half
the technique. The agent must also update the file with its current
state. A stale progress file is worse than no progress file -- it
actively misleads the next recitation or the next session.

**Tracking too many items.** If your todo list has 30+ items, the
recitation itself becomes a context burden. Group items into phases or
milestones so each recitation covers 8-12 items at most.

## When to Use

- **Tasks spanning 20+ turns** where the agent may lose track of earlier work.
- **Sessions longer than 30 minutes** — the "lost in the middle" effect
  becomes measurable around this point.
- **Any task where you notice the agent skipping items, re-doing work, or
  forgetting the overall goal.** These are symptoms of attention drift that
  recitation directly addresses.
- **Multi-step implementations with a clear task list** — the pattern works
  best when there is a concrete checklist to recite against.

Skip recitation for short tasks (under 10 turns) or tasks with only 2-3
steps — the overhead is not justified.

## Research References

- Liu et al., "Lost in the Middle" (2023) -- attention degradation in
  long contexts
- Manus, "Context Engineering for AI Agents" (2025) -- progress
  recitation technique for maintaining agent coherence
- Anthropic, "Building Effective Agents" (2025) -- harness design
  patterns including external state management
- Cognition, "Deep Agents" -- 35-minute
  degradation window in autonomous coding agents

## Files in This Example

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Project rules including progress tracking cadence |
| `AGENTS.md` | Session protocols with recitation triggers |
| `todo.md` | A mid-session todo list showing the pattern in action |
| `claude-progress.json` | Machine-readable progress state |
