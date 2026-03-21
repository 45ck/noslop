# Meridian Engineering Standards

Meridian is a B2B SaaS startup (~15 engineers) building a workflow automation
platform. We help mid-market companies automate their internal processes —
approvals, notifications, data syncing, and task routing.

## Tech stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, React Query
- **Backend:** Express.js, TypeScript, tRPC for internal APIs, REST for public API
- **Database:** PostgreSQL 16 (primary), Redis (caching, job queues)
- **Infrastructure:** AWS (ECS, RDS, ElastiCache, S3, CloudFront)
- **CI/CD:** GitHub Actions, Docker, Terraform
- **Observability:** Datadog (APM, logs, metrics), PagerDuty (alerts)

## Core values

1. **Ship fast, ship safe.** Speed matters, but never at the cost of data integrity or security.
2. **Write tests.** If it's not tested, it's not done.
3. **Keep it simple.** Prefer boring technology. Add complexity only when the simpler option has proven insufficient.
4. **Own your code.** You wrote it, you support it. Write it so the person debugging it at 2am can understand it.

## Universal rules

These apply to ALL code, no exceptions:

- TypeScript strict mode everywhere. No `any` types — use `unknown` and narrow.
- All API endpoints require authentication. No anonymous access to mutation endpoints.
- All data mutations require audit logging (who changed what, when, previous value).
- No secrets in code. Use environment variables via the config service.
- No direct database queries outside repository classes.
- All user input must be validated at the API boundary (Zod schemas).
- All monetary values stored as integers (cents), never floats.
- All timestamps stored as UTC. Convert to user timezone only in the presentation layer.

## Quality bar

- All PRs must include tests that cover the new behavior.
- CI must pass before merge. No "fix CI later" merges.
- Code coverage must stay above 85% statements, 80% branches.
- No `console.log` in committed code. Use the structured logger.
- No TODO comments without a linked issue number.
- Dependency updates go through a separate PR with a test run.

## Communication standards

- **PRs** describe the "why", not just the "what". Link the issue. Explain the approach.
- **Commits** follow conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`.
- **Branch names:** `{type}/{issue-number}-{short-description}` (e.g., `feat/1234-add-webhook-retry`).

## Architecture

```
Browser → Next.js (App Router) → tRPC → Express BFF → Domain Services → PostgreSQL
                                                     → Redis (cache/queue)
                                                     → External APIs
```

- **Next.js frontend:** Pages, components, hooks. Server components for data fetching.
- **BFF (Backend for Frontend):** Express server with tRPC router. Handles auth, session, request validation.
- **Domain services:** Pure business logic. No HTTP concerns. Accept DTOs, return results.
- **Repositories:** Database access layer. One per aggregate root.
- **Jobs:** Background processing via BullMQ + Redis. Retries, dead letter queues.

## Where to find details

- **Role-specific instructions:** `.claude/agents/` — tech-lead, backend-dev, frontend-dev, qa-engineer
- **Process docs:** `docs/processes/` — feature lifecycle, incident response, code review
- **Standards:** `docs/standards/` — API design, testing conventions
- **Agent orchestration:** `AGENTS.md` — routing table, handoffs, conflict resolution
