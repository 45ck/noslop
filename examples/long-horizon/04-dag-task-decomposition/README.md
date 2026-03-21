# 04 — DAG Task Decomposition

A pattern for managing complex features with parallel workstreams and
explicit dependencies between tasks.

## The Problem

Complex features are not linear. An authentication system has work that
can happen in parallel (password hashing and session tokens have no
dependency on each other) and work that must happen in sequence (you
cannot build login without both hashing and sessions). Linear checklists
force serial execution and hide parallelism. Agents waste time on tasks
whose dependencies are not finished yet.

## The Pattern

Model your feature as a **directed acyclic graph** (DAG) of tasks. Each
task declares what it is blocked by. An agent (or multiple agents) reads
the DAG, finds tasks with no unfinished blockers, and works on them.

```
[1. Design schema]----\
                       +-->[3. Prisma migration]-->[6. Auth repo]-->[7. Login]-->[11. UI]
[2. Permission model]--/                               |              |
                                                       v              v
[4. Password hashing]-------------------------->[8. Registration]--->/
[5. Session tokens]--->[9. Auth middleware]-->[10. Route guards]-->[12. Permission checks]
```

Tasks 1, 2, 4, and 5 can all run in parallel. Task 3 waits for 1 and 2.
Task 6 waits for 3. And so on. The DAG makes this explicit.

## How to Express a DAG

Use a markdown table with these columns:

| ID | Task | Status | Blocked By | Acceptance Criteria |
|----|------|--------|------------|---------------------|
| 1  | Design auth schema | done | -- | Schema documented in `docs/auth-schema.md` |
| 2  | Create Prisma migration | pending | 1 | `prisma migrate dev` succeeds |

The `Blocked By` column lists task IDs that must be `done` before this
task can start. Use `--` for tasks with no blockers.

## Status Values

| Status | Meaning |
|--------|---------|
| `done` | Work complete, acceptance criteria verified |
| `in-progress` | Currently being worked on |
| `pending` | Not started, waiting for blockers or claiming |
| `blocked` | Cannot proceed due to unexpected issue |
| `cut` | Removed from scope (reason documented) |

## How Agents Use It

1. Read the DAG from `.claude/plans/`
2. Find all tasks where status is `pending` AND every task in
   `Blocked By` has status `done`
3. Claim one unblocked task (prefer lowest ID for determinism)
4. Work on it until acceptance criteria are met
5. Mark it `done`, then repeat from step 2

## Parallel Execution

Multiple agents can work on independent branches of the DAG
simultaneously. To avoid conflicts:

- Each agent claims a task by writing their name in a `Claimed By` column
- Agents only claim tasks that are unclaimed and unblocked
- If two agents need to modify the same file, the DAG should express
  that dependency (one blocks the other)

## When to Use This Pattern

- Features with natural parallelism (auth, payment, notification systems)
- Epics with many subtasks spanning multiple areas of the codebase
- Work involving multiple services or packages in a monorepo
- Any task where a linear checklist would hide important dependencies

## When DAGs Break

Two common failure modes undermine DAG-based task decomposition:

### Hidden Dependencies

Task C depends on a side effect of Task A (for example, A creates a temp
file that C reads, or A's migration adds a column that C's query needs)
but the DAG does not capture this relationship. The agent runs B and C
in parallel after A finishes, and C fails because B was claimed first and
the side effect has not been set up in C's environment. The fix is to
audit each task's *actual* inputs, not just its *logical* inputs. If a
task reads a file, env var, or database state that another task creates,
that is a dependency — add it to `Blocked By`.

### Over-Serialized DAG

Every task depends on the previous one, creating a linear chain:
1 -> 2 -> 3 -> 4 -> 5 -> ... This defeats the purpose of DAG
decomposition and prevents parallelism. The result is a fancy checklist
with extra overhead. If your DAG has no tasks that can run in parallel,
reconsider your decomposition. Look for subtasks within each large task
that have independent outputs and can be pulled into separate nodes.

### Token Budget

Keep DAGs under 30 tasks per file. Beyond that, split into sub-DAGs
with explicit interface points. A sub-DAG defines its inputs (what it
needs from the parent DAG) and outputs (what it provides back). This
keeps each DAG scannable within a single screen and within token limits
when loaded as context.

## Tips

- **Size tasks for 1-4 hours of work.** Smaller tasks finish faster and
  unblock downstream work sooner.
- **Make acceptance criteria specific and testable.** "Tests pass" is
  better than "code works." Include the exact command to run.
- **Avoid long dependency chains.** If your DAG is 10 levels deep,
  look for ways to parallelize. Deep chains serialize your schedule.
- **Update the DAG as you learn.** Discovering a new dependency mid-work
  is normal. Add it to the table rather than ignoring it.
- **Keep the DAG in version control.** Commit status updates so the
  team can see progress in the git log.

## Files in This Example

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Project context the agent reads every session |
| `AGENTS.md` | Instructions for how agents work with the DAG |
| `.claude/plans/feature-dag.md` | A realistic in-progress task DAG |
| `.claude/plans/DAG-TEMPLATE.md` | Blank template for new DAGs |
