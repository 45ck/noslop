# Incident Response

When something goes wrong in production, follow this process. Speed matters, but
clear thinking matters more. A calm, structured response resolves incidents faster
than panicked heroics.

## Severity levels

| Level | Definition                                    | Examples                                             | Response time |
|-------|-----------------------------------------------|------------------------------------------------------|---------------|
| P0    | Service is down or data is being corrupted    | Database unreachable, auth broken, data loss          | Immediate     |
| P1    | Major feature is broken for all users         | Workflow execution failing, API returning 500s        | < 30 minutes  |
| P2    | Feature is degraded or broken for some users  | Slow queries, intermittent errors, UI rendering issue | < 4 hours     |
| P3    | Minor issue with a workaround                 | Cosmetic bug, misleading error message, typo          | Next sprint   |

## Triage

**Who responds:** The on-call engineer, plus the tech lead for P0/P1.

1. **Acknowledge.** Post in #incidents: "Investigating [brief description]."
2. **Assess severity.** How many users are affected? Is data at risk?
3. **Gather context.** Check:
   - Datadog dashboards for error rates and latency.
   - Recent deployments (was anything deployed in the last 2 hours?).
   - Recent configuration changes.
   - External service status pages (AWS, third-party APIs).
4. **Assign severity level.** Update the incident channel with the severity.

## Fix

### Rollback vs hotfix decision tree

```
Was the issue caused by a recent deployment?
  YES → Can we safely roll back without data migration issues?
    YES → ROLLBACK. Revert the deployment immediately.
    NO  → HOTFIX. Fix forward with a targeted change.
  NO  → Is it an infrastructure issue?
    YES → Engage infrastructure/AWS support.
    NO  → INVESTIGATE. Gather more data before acting.
```

**Rollback procedure:**
1. Trigger rollback via the deployment pipeline (do NOT deploy old code manually).
2. Verify health checks pass after rollback.
3. Confirm the issue is resolved.

**Hotfix procedure:**
1. Branch from `main`: `hotfix/{incident-id}-{description}`.
2. Make the minimal change needed to fix the issue. No refactoring.
3. Write a test that reproduces the bug.
4. Fast-track PR review (one approval from tech lead).
5. Deploy directly to production.

## Postmortem

Every P0 and P1 incident gets a postmortem within 48 hours. P2 incidents get a
postmortem if the root cause was surprising or systemic.

### Postmortem template

```
Title: [Date] - [Brief description]

## Summary
[1-2 sentences: what happened, how long, who was affected]

## Timeline
[Chronological list of key events with timestamps]
- HH:MM — Alert fired for [metric]
- HH:MM — On-call acknowledged, began investigation
- HH:MM — Root cause identified: [cause]
- HH:MM — Fix deployed / rollback completed
- HH:MM — Confirmed resolved

## Root cause
[Detailed technical explanation of why this happened]

## Impact
- Users affected: [count or percentage]
- Duration: [total time from start to resolution]
- Data impact: [any data loss or corruption, or "none"]

## What went well
- [Things that helped resolve the incident faster]

## What could be improved
- [Things that slowed us down or made the incident worse]

## Action items
- [ ] [Specific action] — Owner: [name] — Due: [date]
- [ ] [Specific action] — Owner: [name] — Due: [date]
```

### Blameless culture

Postmortems focus on systems, not people. The question is never "who made the
mistake?" but "what allowed the mistake to reach production?" Every incident is an
opportunity to improve our systems, tests, and processes.

## Communication

- **P0/P1:** Update the status page immediately. Post updates every 30 minutes
  until resolved.
- **P2:** Update the status page if users have noticed. Post in #incidents.
- **P3:** No external communication needed. Track in the issue tracker.
- **Stakeholders:** For P0/P1, notify the product lead and customer success team so
  they can proactively communicate with affected customers.
