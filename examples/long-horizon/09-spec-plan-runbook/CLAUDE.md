# Notification Service

Multi-channel notification service supporting email (SendGrid), SMS (Twilio),
and push notifications (Firebase Cloud Messaging). Built with Node.js and
TypeScript, backed by PostgreSQL.

## Project constraints

- Node.js 20+ with TypeScript in strict mode
- PostgreSQL 16 for persistence (delivery tracking, templates, audit log)
- Must handle 1000 notifications/min sustained throughput
- Retry with exponential backoff on transient failures (max 3 retries)
- All channels share a common template system (Handlebars)

## Key files

- **Spec.md** -- The specification for what to build. Requirements, constraints,
  acceptance criteria, and non-goals.
- **Plan.md** -- The milestone plan with progress tracking. Updated after each
  milestone is verified.
- **Runbook.md** -- The execution protocol. Follow this at session start, during
  work, and at session end.

## Rules

1. **Spec.md is FROZEN.** Do not modify it. If you believe a spec change is
   needed, stop and ask. Do not reinterpret requirements to fit your
   implementation -- implement what the spec says.

2. **Update Plan.md status markers after completing each milestone.** Change
   `[PENDING]` to `[IN PROGRESS]` when you start, and `[IN PROGRESS]` to
   `[DONE]` when the verification command passes. Update individual task
   checkboxes as you complete them.

3. **Follow Runbook.md protocol at session start and milestone boundaries.**
   The runbook is not optional. Read it at the start of every session and
   follow the milestone completion protocol after every milestone.

4. **Stop-and-fix on test failure.** If any verification command fails, stop
   current work immediately. Fix the failure before proceeding. Do not
   accumulate failures.

5. **Commit at milestone boundaries.** Each milestone completion should be a
   commit with a message referencing the milestone number.
