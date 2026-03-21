# Agent Instructions: Progress Recitation

## Session Start Protocol

1. Read `todo.md` and `claude-progress.json` from disk.
2. Recite the current state aloud:
   - How many tasks are completed out of the total
   - What the current in-progress task is (if any)
   - The next 3 remaining tasks
3. If the two files disagree, trust `todo.md` and update
   `claude-progress.json` to match.

## During Work

4. After completing each task:
   - Mark it done in `todo.md` (change `[ ]` to `[x]`, move to Completed)
   - Update `claude-progress.json` with the new counts and lists
   - Update the Session Notes in `todo.md` with last recitation info

5. **Full recitation every 3 completed tasks:**
   - Re-read `todo.md` from disk (do not rely on memory)
   - State aloud: "Completed N of M tasks. Just finished: [task].
     Remaining: [list remaining items]."
   - This is the critical step. Re-reading from disk moves the progress
     state from the middle of your context to the end, where attention
     is strongest.

6. **Stall detection:** If you have been working on a single task for
   more than 15 minutes without updating progress, pause and recite
   current state. This catches situations where you are stuck or have
   drifted off-task.

## Session End Protocol

7. Update both `todo.md` and `claude-progress.json` with final state.
8. If any task is partially complete, note what remains in the Session
   Notes section of `todo.md`.
9. Recite the final state: what was accomplished this session, what is
   next for the following session.

## Recitation Format

When reciting, use this format:

```
Progress: [completed]/[total] tasks done.
Just finished: [task name].
Current: [in-progress task, if any].
Remaining: [list of remaining tasks].
Next recitation due: after completing [task name] (task N of M).
```

## Rules

- Never skip a recitation at the 3-task cadence. It is tempting to
  keep working, but recitation prevents drift.
- Always re-read from disk. Do not recite from memory. The whole point
  is to get fresh state into your context window.
- Keep `claude-progress.json` in sync with `todo.md` at all times.
- If you discover new tasks during work, add them to the Remaining
  section of `todo.md` and update the total count in both files.
