# Agent Instructions

This project uses the Spec/Plan/Runbook pattern for long-horizon autonomous work.

## Primary protocol

Follow **Runbook.md** as your execution protocol. It defines what to do at session
start, during work, at milestone boundaries, and at session end. Read it first.

## Rules (non-negotiable)

**Spec.md is FROZEN.** Never modify it. The spec defines what "done" looks like.
If you believe the spec is wrong or incomplete, stop and ask for clarification.
Do not reinterpret requirements to match your implementation. Do not add features
that the spec does not call for. Do not silently drop requirements that are hard
to implement.

**Stop-and-fix.** Never skip failing tests to make progress. If a test fails,
stop what you are doing, fix the failure, verify the fix, and only then resume.
Accumulating failures is the fastest way to make a project unrecoverable.

**Update Plan.md honestly.** Check off tasks only when they are truly complete
and verified. Do not mark a task as done if you know it has gaps. Add new tasks
if you discover work that the plan did not anticipate.

## Handling ambiguity

If the spec is ambiguous or a situation arises that it does not cover:

1. Note the ambiguity in Plan.md under the current milestone.
2. State your interpretation clearly.
3. Ask for clarification before implementing.

Do not guess. A wrong guess that passes tests is worse than a question, because
it silently encodes the wrong behavior and will be much harder to find later.

## File reference

| File | Purpose | Mutability |
|---|---|---|
| Spec.md | What to build | FROZEN -- never modify |
| Plan.md | Where we are | LIVING -- update after each task |
| Runbook.md | How to work | PROTOCOL -- follow, do not modify |
| CLAUDE.md | Project context | Reference only |
