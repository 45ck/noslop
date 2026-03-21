# 09 — Spec / Plan / Runbook

## The Three-File Harness

This example demonstrates the Spec/Plan/Runbook separation -- a harness pattern
that enables coherent autonomous agent work across long sessions (tested up to
25 hours of continuous operation).

The insight is simple: different types of information have different change
frequencies, and mixing them causes drift.

- **Spec** (frozen): What to build. Never changes during execution.
- **Plan** (living): Where we are. Updated after every milestone.
- **Runbook** (protocol): How to work. Followed at every boundary.

## Why it works

### Spec is FROZEN -- prevents scope drift

The most common failure mode in long agent sessions is scope drift. The agent
starts implementing feature A, discovers that feature B would be useful, and
quietly pivots. Two hours later, feature A is half-done and feature B is
half-done. A frozen spec eliminates this. The agent has a single source of truth
for what "done" looks like, and it cannot modify that source. If the spec is
wrong, the agent must stop and ask -- it cannot silently reinterpret.

### Plan is LIVING -- tracks progress

The plan is the only mutable document. It tracks what is done, what is in
progress, and what is pending. Each milestone has a verification command that
the agent runs to prove completion. This prevents the agent from claiming
progress it has not actually made, and gives any observer (human or agent) an
accurate picture of the project state at any point.

### Runbook is PROTOCOL -- prevents process drift

Without a runbook, agents gradually degrade their working habits over long
sessions. They stop running tests, skip verification steps, accumulate failures
instead of fixing them. The runbook encodes the working protocol as explicit
steps that the agent follows at session start, during work, and at session end.
It acts as a reset mechanism that prevents process entropy.

## When to use this pattern

- Projects requiring more than ~2 hours of agent work
- Projects spanning multiple sessions (the plan provides continuity)
- Projects where scope creep is a risk (the frozen spec is the guard)
- Projects with multiple milestones that build on each other

Do NOT use this pattern for:

- Quick bug fixes or small features (overhead is not justified)
- Exploratory or research tasks where the goal is not yet clear
- Projects where the spec itself needs to be discovered iteratively

## Anti-patterns

**Mutable specs.** If the agent can edit the spec, it will. Usually subtly --
rewording a requirement to match what it already built rather than what was
requested. The `<!-- FROZEN -->` marker is a convention, not enforcement. For
real projects, consider making the spec file read-only at the filesystem level.

**Plans without verification commands.** A plan that says "Milestone 3: implement
SMS channel" with no way to verify completion is just a todo list. The
verification commands are the critical piece -- they turn the plan from
aspirational to observable.

**Runbooks that say "follow the plan."** A runbook must encode specific protocol
steps: read the spec first, run tests before committing, stop on failure. A
runbook that just says "work through the plan milestones" adds no value over
having the plan alone.

**Skipping session-start protocol.** After a context window reset or new session,
the agent has no memory. The runbook's session-start protocol (read spec, read
plan, verify environment) rebuilds the agent's understanding. Skipping it leads
to the agent re-doing completed work or working against stale assumptions.

## What's included

```
09-spec-plan-runbook/
  README.md       # This file -- explains the pattern
  CLAUDE.md       # Project-level instructions pointing to the three files
  AGENTS.md       # Brief agent protocol reinforcing the rules
  Spec.md         # FROZEN specification for a notification service
  Plan.md         # Living plan with milestones, partially completed
  Runbook.md      # Execution protocol for session and milestone boundaries
```

## The example project

The three files describe a notification service that sends email, SMS, and push
notifications. The spec is frozen. The plan shows milestones 1-2 completed,
milestone 3 in progress. The runbook defines the protocol for working on it.

This is realistic: the agent (or a human reading the files) can pick up where
the previous session left off, verify the current state, and continue from
milestone 3.

## Research context

This pattern draws from:

- **OpenAI Codex Cookbook** ("Building a Full-Stack App"): Demonstrated the
  spec/plan separation for structured agent work, achieving multi-hour coherent
  sessions.
- **Anthropic "Building Effective Agents"**: Emphasized the importance of
  explicit verification at boundaries and protocols that survive context resets.

The combination of frozen specs, living plans with verification, and protocol
runbooks is the minimal harness that reliably sustains long-horizon agent work.
