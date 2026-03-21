# Agent Orchestration

This document defines how agents collaborate at Meridian. It covers routing (which
agent handles what), handoffs (how work moves between agents), and conflict
resolution (who decides when agents disagree).

## Agent roster

| Agent          | Role                                         | Agent doc                             |
|----------------|----------------------------------------------|---------------------------------------|
| tech-lead      | Decomposes features, reviews PRs, decides    | `.claude/agents/tech-lead.md`         |
| backend-dev    | Implements APIs, services, database changes  | `.claude/agents/backend-dev.md`       |
| frontend-dev   | Implements UI, pages, components             | `.claude/agents/frontend-dev.md`      |
| qa-engineer    | Reviews test coverage, writes tests, files bugs | `.claude/agents/qa-engineer.md`   |

## Routing table

| Task type                          | Primary agent   | Supporting agent |
|------------------------------------|-----------------|------------------|
| Feature request decomposition      | tech-lead       | --               |
| API endpoint implementation        | backend-dev     | --               |
| Database migration                 | backend-dev     | tech-lead (review) |
| Service / business logic           | backend-dev     | --               |
| Background job                     | backend-dev     | --               |
| UI component                       | frontend-dev    | --               |
| Page implementation                | frontend-dev    | --               |
| API integration (frontend)         | frontend-dev    | backend-dev (consult) |
| Test coverage review               | qa-engineer     | --               |
| Bug report and reproduction        | qa-engineer     | --               |
| PR review                          | tech-lead       | qa-engineer      |
| Architectural decision             | tech-lead       | --               |
| Incident response                  | tech-lead       | backend-dev      |

## Handoff protocol

When work moves from one agent to another, the handoff must include:

1. **What was done.** Summary of completed work with relevant file paths.
2. **What to do next.** Specific, actionable next step for the receiving agent.
3. **Context.** Link to the task, PR, or issue. Any decisions made and why.
4. **Blockers.** Anything that might prevent the next agent from proceeding.

### Example handoff: backend-dev to frontend-dev

> Backend work for task #42 is complete. The `POST /api/v1/workflows` and
> `GET /api/v1/workflows` endpoints are live and tested.
>
> Next step: Build the workflow list page and creation form. The tRPC types
> are already generated — see `src/types/api.ts`.
>
> Note: The create endpoint requires `organizationId` in the body. The current
> user's org ID is available from the auth context (`useAuth().organizationId`).

### Example handoff: dev agent to qa-engineer

> PR #87 implements webhook retry logic (task #45). The PR includes unit tests
> for the retry service and integration tests for the API endpoint.
>
> Areas that need extra scrutiny: concurrent webhook deliveries, retry backoff
> timing, and behavior when the dead letter queue is full.

## How to invoke each agent

Agents are invoked by the tech-lead based on the task type (see routing table
above). The tech-lead assigns tasks using the task management system. Each agent
picks up their assigned tasks, works through them, and hands off when complete.

The typical flow:

1. Tech-lead creates and assigns tasks from a feature request.
2. Backend-dev and frontend-dev work on their tasks (in parallel when possible).
3. Dev agents create PRs when their tasks are done.
4. QA-engineer reviews PRs for test quality and edge cases.
5. Tech-lead does final review and approves the merge.

## Conflict resolution

When agents disagree or a decision needs to be made:

- **Tech-lead has final say** on architecture, patterns, and trade-offs.
- **QA-engineer has final say** on whether test coverage meets the bar.
- **Backend-dev has final say** on database schema design within tech-lead's guidelines.
- **Frontend-dev has final say** on component structure within tech-lead's guidelines.

If the tech-lead is unsure, the decision is escalated to a human engineer.

## File Pattern to Agent Routing

| File Pattern | Primary Agent | Reviewer |
|---|---|---|
| `src/api/**`, `src/routes/**` | backend-dev | tech-lead |
| `src/services/**`, `src/domain/**` | backend-dev | tech-lead |
| `src/components/**`, `src/app/**` | frontend-dev | tech-lead |
| `src/hooks/**`, `src/utils/ui/**` | frontend-dev | tech-lead |
| `tests/**`, `*.test.ts` | qa-engineer | tech-lead |
| `*.sql`, `migrations/**`, `src/repositories/**` | backend-dev | tech-lead |
| `docs/**`, `.claude/**` | tech-lead | -- |
| `infrastructure/**`, `terraform/**` | tech-lead | backend-dev |
| `package.json`, `tsconfig.json` | tech-lead | -- |

When a file change touches multiple patterns (e.g., a PR modifies both `src/api/`
and `src/components/`), the tech-lead coordinates the review, assigning each portion
to the relevant agent.

## Worked Example: Add Password Reset Feature

This transcript shows a complete feature flowing through the team, demonstrating
what good handoffs look like in practice.

### 1. Feature Request (Product)

> **User story:** As a user who forgot my password, I want to reset it via email
> link so that I can regain access to my account.
>
> **Acceptance criteria:**
> 1. User submits email address on reset form
> 2. System sends a reset link valid for 1 hour
> 3. Clicking the link opens a form to set a new password
> 4. After reset, user is redirected to login with a success message
> 5. Expired or already-used tokens show a clear error
>
> **Priority:** P1

### 2. Tech Lead Decomposition

tech-lead reads the request, identifies affected systems, and creates tasks:

- **Task #101 (backend-dev):** Create `POST /api/v1/auth/reset-request` endpoint.
  Accepts `{ email }`, generates a signed token (SHA-256, 1-hour expiry), stores
  token hash in `password_reset_tokens` table, sends email via SendGrid.
- **Task #102 (backend-dev):** Create `POST /api/v1/auth/reset-confirm` endpoint.
  Accepts `{ token, newPassword }`, validates token, updates password hash,
  invalidates token, logs the event in the audit table.
- **Task #103 (frontend-dev):** Build reset request page at `/auth/reset`. Form
  with email input, loading state, success/error feedback. Build reset confirm
  page at `/auth/reset/[token]`. Form with password + confirm fields, validation.
- **Task #104 (qa-engineer):** Write test plan covering: happy path, expired
  token, already-used token, invalid token format, rate limiting (max 5 requests
  per email per hour), SQL injection in email field.

Dependency order: #101 and #102 first (parallel), then #103 (needs API), then #104.

### 3. Backend Implementation

backend-dev picks up tasks #101 and #102. Implements the migration, repository,
service, and endpoints. Writes unit tests for the service and integration tests
for both endpoints.

**Handoff message (backend-dev to frontend-dev):**

> Tasks #101 and #102 are complete. PR #88 has the implementation.
>
> **API endpoints ready:**
> - `POST /api/v1/auth/reset-request` takes `{ email: string }`. Returns 200 on
>   success (always, even if email not found, to prevent enumeration). On success,
>   sends email with link `{APP_URL}/auth/reset/{token}`.
> - `POST /api/v1/auth/reset-confirm` takes `{ token: string, newPassword: string }`.
>   Returns 200 on success, 400 with `{ code: "TOKEN_EXPIRED" | "TOKEN_INVALID" | "TOKEN_USED" }` on failure.
>
> **tRPC types** are generated in `src/types/api.ts` -- see `ResetRequestInput`,
> `ResetConfirmInput`, and `ResetConfirmError`.
>
> **Note:** The reset-request endpoint is rate-limited to 5 requests per email per
> hour. The frontend should show a generic "if this email exists, you'll receive
> a link" message regardless of the response.

### 4. Frontend Implementation

frontend-dev picks up task #103. Builds the two pages following the existing auth
page patterns (`src/app/(auth)/login/page.tsx` as reference).

**Handoff message (frontend-dev to qa-engineer):**

> Task #103 is complete. PR #89 adds the reset request page and reset confirm page.
>
> **Pages added:**
> - `/auth/reset` -- email input form with loading/success/error states
> - `/auth/reset/[token]` -- password + confirm password form, validates match
>   client-side, displays server error codes as user-friendly messages
>
> **Decisions made:** I used the existing `AuthLayout` wrapper and `FormField`
> components. Error messages map `TOKEN_EXPIRED` to "This link has expired.
> Please request a new one." with a link back to `/auth/reset`.

### 5. QA Review

qa-engineer picks up task #104 and reviews both PRs #88 and #89.

> **QA review for PRs #88 and #89:**
>
> **Passing:** Happy path, invalid token format, SQL injection attempts (Zod
> validation catches them), rate limiting, UI error messages for all error codes.
>
> **Bug found:** The reset token does not get invalidated after a successful
> password reset. I can reuse the same token multiple times within the 1-hour
> window. This fails acceptance criterion #5.
>
> Steps to reproduce:
> 1. Request a reset link
> 2. Use the link to reset password
> 3. Use the same link again -- it works again instead of showing "token already used"
>
> **Filed as bug on task #102.** Assigning back to backend-dev.

### 6. Fix Cycle

backend-dev receives the bug report, identifies the issue (the `invalidateToken`
call was in a `finally` block that did not run on the success path due to an
early return), fixes it, and adds a specific regression test.

> **Fix applied in PR #88 (updated):** Moved token invalidation before the
> password update in a transaction. Added test: "rejects token that was already
> used." The fix is 4 lines changed in `src/services/auth/reset.service.ts`.

### 7. Final Approval

qa-engineer re-runs the test plan. All scenarios pass.

> **QA re-review:** All 6 test scenarios pass. Token invalidation works correctly.
> Coverage is at 94% for the new code. Approving both PRs.

tech-lead does final review, approves, and squash-merges both PRs to `main`.

## Quality gates

Work cannot proceed past these checkpoints without meeting the criteria:

| Checkpoint               | Gate                                              | Gatekeeper    |
|--------------------------|---------------------------------------------------|---------------|
| Task ready for dev       | Task has clear acceptance criteria and assignment  | tech-lead     |
| PR ready for review      | CI passes, tests included, PR description complete | dev agent     |
| PR ready for merge       | Reviews approved, all blockers resolved            | tech-lead     |
| Ready for staging        | CI green on main branch                            | automated     |
| Ready for production     | QA validation passes on staging                    | qa-engineer   |
| Post-deploy              | 24h monitoring with no related incidents           | tech-lead     |
