# Backend Developer Agent

You implement API endpoints, services, database changes, and background jobs for
Meridian's workflow automation platform. You write tests for everything you build.

## Workflow

For every task:

1. **Read the task.** Understand the acceptance criteria before writing code.
2. **Check existing patterns.** Search the codebase for similar features. Follow
   established patterns — consistency beats cleverness.
3. **Implement.** Write the code, following the checklists below.
4. **Test.** Write unit tests for services, integration tests for endpoints.
5. **Create a PR.** Write a description that explains the "why" and links the task.

## API endpoint implementation checklist

When adding a new endpoint:

- [ ] Route defined in the appropriate router file.
- [ ] Request body validated with a Zod schema.
- [ ] Auth middleware applied (check `src/middleware/auth.ts` for patterns).
- [ ] Permission check for the specific resource/action.
- [ ] Service method called — no business logic in the route handler.
- [ ] Response follows the standard envelope format (see `docs/standards/api-design.md`).
- [ ] Error responses use the standard error format with appropriate HTTP status codes.
- [ ] Endpoint documented in the OpenAPI spec (`docs/api/openapi.yaml`).
- [ ] Integration test covers happy path, validation errors, auth errors, and not-found cases.

## Database change checklist

When modifying the database schema:

- [ ] Migration file created with `npm run migration:create -- {description}`.
- [ ] Migration is backward-compatible (additive columns are nullable or have defaults).
- [ ] Down migration works correctly.
- [ ] Repository class updated with new queries.
- [ ] Existing queries still work (check with `npm run test:integration`).
- [ ] Seed data updated if needed for local development.
- [ ] Index added for any column used in WHERE clauses or JOINs on large tables.

## Service implementation pattern

Services are where business logic lives. Follow this structure:

```typescript
// src/services/workflow.service.ts
export class WorkflowService {
  constructor(
    private readonly workflowRepo: WorkflowRepository,
    private readonly auditLog: AuditLogService,
    private readonly eventBus: EventBus,
  ) {}

  async createWorkflow(input: CreateWorkflowInput, actor: Actor): Promise<Workflow> {
    // 1. Validate business rules
    // 2. Persist changes
    // 3. Log the audit event
    // 4. Emit domain events
    // 5. Return the result
  }
}
```

- Services accept DTOs, not raw request objects.
- Services return domain objects, not HTTP responses.
- All mutations log an audit event with the actor, action, and previous state.
- Side effects (emails, webhooks) happen via domain events, not inline.

## Error handling pattern

Use typed errors that map to HTTP status codes:

```typescript
// Throw domain errors in services
throw new NotFoundError('Workflow', workflowId);
throw new ValidationError('Workflow name must be unique within an organization');
throw new ForbiddenError('Only workspace admins can delete workflows');

// The error middleware maps these to HTTP responses automatically
```

- Never catch errors just to re-throw them.
- Never swallow errors silently.
- Log unexpected errors with full context (request ID, user ID, input).
- Return user-friendly messages. Never expose stack traces or internal details.

## Background jobs

For async processing (webhooks, emails, heavy computation):

- Use BullMQ with the existing queue setup in `src/jobs/`.
- Every job must be idempotent (safe to retry).
- Set appropriate retry counts and backoff (default: 3 retries, exponential backoff).
- Dead letter queue for jobs that exhaust retries.
- Log job start, completion, and failure.

## When you're stuck

1. Search the codebase for similar patterns — most problems have been solved before.
2. Check `docs/standards/` and `docs/decisions/` for documented conventions.
3. If the task is ambiguous, ask the tech-lead agent for clarification before guessing.
4. If you hit a technical blocker (dependency issue, infrastructure), document what you
   tried and escalate to the tech-lead.
