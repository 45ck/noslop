# Execution Runbook

This runbook defines the protocol for working on the notification service. Follow
it at session start, during implementation, and at session end. These steps are
not optional -- they prevent the process drift that causes long sessions to fail.

## Session Start Protocol

Run these steps at the beginning of every session or after a context reset:

1. **Read Spec.md.** Read the entire spec. Confirm you understand the
   requirements, constraints, and non-goals. If anything is unclear, note the
   ambiguity and ask before implementing.

2. **Read Plan.md.** Find the current milestone (marked `[IN PROGRESS]`). Read
   what has been completed and what remains. If no milestone is in progress,
   find the first `[PENDING]` milestone and mark it `[IN PROGRESS]`.

3. **Verify environment.** Run the verification command for the last completed
   milestone to confirm the project is in a known-good state:

   ```bash
   npm test -- --run
   npm run build
   ```
   If either command fails, stop. Fix the failure before starting new work.

4. **Identify your next task.** Pick the first unchecked item in the current
   milestone. Do not jump ahead to later milestones.

## During Work

Follow this loop for each task within a milestone:

1. **Implement one task at a time.** Do not batch multiple tasks. Complete one,
   verify it, then move to the next.

2. **Run tests after each task.**

   ```bash
   npm test -- --run
   ```
   If tests fail, stop. Fix the failure before proceeding to the next task.

3. **Update Plan.md.** Check off the completed task (`- [ ]` to `- [x]`). If
   you discovered additional work needed, add it as a new unchecked item under
   the current milestone.

4. **Commit after meaningful progress.** Each task or logical group of tasks
   should be a commit:

   ```bash
   git add <files> && git commit -m "milestone-N: description of what was done"
   ```

## Stop-and-Fix Rule

**If any verification command fails, STOP current work immediately.**

Do not continue implementing new features while tests are broken. Do not
accumulate failures hoping to fix them later. The priority order is always:

1. Fix the failing test or build error
2. Re-run verification to confirm the fix
3. Resume the task you were working on

This rule exists because failures compound. One broken test becomes three
becomes ten, and by that point the failures interact in ways that are much
harder to debug than fixing each one immediately.

## Milestone Completion Protocol

When all tasks in a milestone are checked off:

1. **Run the milestone verification command** (listed in Plan.md under the
   milestone). All checks must pass.

2. **Update Plan.md.** Change the milestone status from `[IN PROGRESS]` to
   `[DONE]`. Add a completion note with the date and any observations.

3. **Commit with milestone reference.**

   ```bash
   git add <files> && git commit -m "milestone-N complete: brief summary"
   ```

4. **Review the next milestone.** Read its tasks. If any task is unclear or
   seems to conflict with the spec, note the issue and ask before starting.

5. **Mark the next milestone as `[IN PROGRESS]`** in Plan.md and begin work.

## Session End Protocol

Before ending a session (or when instructed to stop):

1. **Run the full test suite.** Ensure the project is in a clean state:

   ```bash
   npm test -- --run && npm run build
   ```

2. **Update Plan.md.** Mark the current state of all in-progress tasks. Add a
   "Notes" line under the current milestone describing where you left off and
   any known blockers.

3. **Commit your progress.**

   ```bash
   git add <files> && git commit -m "session end: progress on milestone-N"
   ```

4. **Do not leave failing tests.** If you cannot fix a failure before the
   session ends, revert the change that caused it and note it in Plan.md.

## Handling Spec Ambiguity

If the spec is ambiguous or you encounter a situation it does not cover:

1. Note the ambiguity in Plan.md under the current milestone.
2. State your interpretation and why you believe it is correct.
3. Ask for clarification before implementing.
4. Do not guess. A wrong guess that passes tests is worse than a question,
   because it silently encodes the wrong behavior.
