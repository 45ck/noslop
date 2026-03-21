# Agent Instructions: Checkpoint Sessions

## On Session Start

1. Read all plans in `.claude/plans/`. Find the one with `status: active`.
   If no plan is active, tell the user and stop.

2. Read `claude-progress.json` if it exists. Compare its state against the
   markdown plan to verify consistency. If they disagree, trust the markdown
   plan and update the JSON file to match.

3. Find the first checkpoint that is NOT marked `[x] done` or `[-] skipped`.
   This is your current checkpoint.

4. Read the entry criteria for that checkpoint. Validate each one by
   running the specified commands or checking that files exist. If any
   entry criterion is not met, report which ones failed and stop.

## Working a Checkpoint

5. Work through the work items in order. After completing each item,
   mark it `[x]` in the plan file and save. This ensures progress is
   preserved if the session ends unexpectedly.

6. If a work item is blocked (e.g., a test fails for reasons outside
   this checkpoint's scope), mark it with `[ ] BLOCKED: <reason>` and
   continue to the next item if possible.

7. When all work items are done (or accounted for), validate every
   exit criterion. Run the commands. Check the files. Do not skip this.

8. If exit criteria pass, mark the checkpoint `[x] done` and update
   `Current checkpoint` in the plan header to the next number.

9. If exit criteria fail, keep the checkpoint as `[~] in progress`,
   document what failed in the Notes section, and report to the user.

## Handling a Failed Checkpoint

10. If a work item fails in a way that cannot be resolved within the
    current checkpoint, mark it `[!] FAILED: <error details>`.

11. Mark the entire checkpoint as `[!] FAILED` in the heading.

12. Execute the checkpoint's Rollback plan. Document what was reverted
    and what was kept in the Notes section.

13. Create a recovery checkpoint numbered `Nb` (e.g., 3b) immediately
    after the failed one. Include:
    - Entry criteria referencing the failure
    - Steps to fix the root cause
    - Remaining work items from the failed checkpoint
    - A new rollback plan for the recovery attempt

14. Update `Current checkpoint` in the plan header to the recovery
    checkpoint.

## Continuing to the Next Checkpoint

15. If context and time allow, proceed to the next checkpoint.
    Validate its entry criteria before starting.

16. If you are running low on context, stop after completing the
    current checkpoint. This is a clean stopping point.

## Recovering from a Failed Session

When starting a session and discovering a failed checkpoint or interrupted
state:

1. Read `claude-progress.json` first. It gives you a quick summary of
   which checkpoints are done, failed, or in progress. If the file
   does not exist, read the markdown plan directly.

2. If the current checkpoint has status `failed`:
   - Read the Notes section for the failure reason and any partial progress.
   - Check whether a recovery checkpoint (e.g., 3b) already exists.
   - If a recovery checkpoint exists, validate its entry criteria and
     start working from there.
   - If no recovery checkpoint exists, create one following step 13 above.

3. If the current checkpoint has status `in_progress` but the session
   clearly ended mid-work (some items checked, some not):
   - Validate the entry criteria still hold.
   - Check which work items are already marked done.
   - Continue from the first unchecked item.
   - Do NOT re-do items already marked `[x]` unless exit criteria suggest
     they were done incorrectly.

4. After recovering, update `claude-progress.json` to reflect the
   current state before continuing work.

## Rules

- Never skip a checkpoint unless its entry criteria are independently
  met (i.e., the work was done outside this plan).
- Never mark a checkpoint done if any exit criterion fails.
- Always update the plan file as you work, not just at the end.
- Update `claude-progress.json` after completing or failing each checkpoint.
- Add observations, decisions, or surprises to the Notes section.
  The next session will rely on these notes for context.
- If you discover work that does not fit any checkpoint, add it to
  the Notes of the current checkpoint and flag it for the user.
- Prefer small, tested commits after each work item rather than one
  large commit per checkpoint.
