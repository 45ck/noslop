# Agent Instructions: DAG Task Decomposition

## On Session Start

1. Read the active DAG in `.claude/plans/`. Find the file with
   `status: active`. If no DAG is active, tell the user and stop.

2. Parse the task table. Build a mental model of what is done, what
   is in progress, and what is available to work on.

## Finding Unblocked Tasks

3. A task is **unblocked** when:
   - Its status is `pending`, AND
   - Every task ID listed in its `Blocked By` column has status `done`

4. List all unblocked tasks. Pick the one with the **lowest ID** for
   deterministic ordering. If the user requests a specific task, prefer
   that one instead.

5. If there are no unblocked tasks and some tasks are `in-progress`,
   check if you can continue the in-progress task from where it was
   left off. Read the Notes section for context.

## Working a Task

6. Before writing code, re-read the acceptance criteria. Make sure
   you understand what "done" means for this task.

7. Implement the task. Write tests alongside the code, not after.

8. When finished, verify every acceptance criterion explicitly.
   Run the commands listed. Check that files exist. Do not assume
   things work without checking.

9. If all criteria pass, mark the task `done` in the DAG table.
   Update the progress counter in the header (e.g., "6/12 tasks done").

10. If criteria fail, keep the task as `in-progress`. Document what
    went wrong in the Notes section with today's date.

## After Completing a Task

11. Re-scan the DAG for newly unblocked tasks. Completing one task
    may unblock several downstream tasks.

12. If context and time allow, pick the next unblocked task (lowest
    ID) and continue. Otherwise, save your progress and stop cleanly.

## Handling Unexpected Blockers

13. If you discover a dependency that is not in the DAG (e.g., task 8
    actually needs something from task 9), update the DAG table to add
    the dependency. Do not silently work around it.

14. If a task is blocked by something outside the DAG (a bug, a missing
    library, an environment issue), mark it `blocked` and add a note
    explaining the blocker. Move to the next unblocked task.

## Multi-Agent Coordination

15. When multiple agents work on the same DAG, claim a task by writing
    your agent name in a `Claimed By` column before starting work.

16. Never claim a task that another agent has already claimed. If all
    unblocked tasks are claimed, wait or ask the team lead for guidance.

17. When done, commit your changes and mark the task `done` so other
    agents can see updated blockers.

## Rules

- Never start a task whose blockers are not all `done`.
- Never mark a task `done` unless every acceptance criterion passes.
- Always update the DAG file as you work, not just at the end.
- Add notes with dates for any decisions, surprises, or blockers.
- Prefer small commits after meaningful progress rather than one
  large commit at the end.
