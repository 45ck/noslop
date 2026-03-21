# Testing Standards

Tests are how we prove the code works and keep it working. Every feature, bug fix,
and refactor includes tests.

## Test pyramid

Aim for this distribution of test effort:

- **Unit tests (70%):** Test individual functions, classes, and services in isolation.
  Mock external dependencies. Fast (< 5ms per test).
- **Integration tests (20%):** Test components working together. Use a real test
  database. Test API endpoints end-to-end through the HTTP layer.
- **E2E tests (10%):** Test critical user journeys through the full stack. Run in
  CI against a staging-like environment. Slow but high confidence.

When in doubt about what level to test at, prefer the lowest level that gives you
confidence the behavior is correct.

## Naming conventions

```typescript
describe('WorkflowService', () => {
  describe('createWorkflow', () => {
    it('should create a workflow with valid input', async () => { ... });
    it('should throw ValidationError when name is empty', async () => { ... });
    it('should throw ForbiddenError when user lacks permission', async () => { ... });
  });
});
```

- `describe` blocks name the class or module, then the method.
- `it` blocks start with "should" and describe the expected behavior.
- Include the condition: "should [verb] when [condition]."
- Test one behavior per `it` block. If you need multiple asserts, they should all
  verify the same behavior.

## File location

Tests are colocated with the code they test:

```
src/services/workflow.service.ts
src/services/workflow.service.test.ts
```

Exception: integration tests that span multiple modules go in `tests/integration/`.
E2E tests go in `tests/e2e/`.

## Fixtures and factories

Use factory functions to create test data:

```typescript
// tests/factories/workflow.factory.ts
export function buildWorkflow(overrides: Partial<Workflow> = {}): Workflow {
  return {
    id: randomUUID(),
    name: 'Test Workflow',
    organizationId: randomUUID(),
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}
```

- Factories produce valid objects by default. Override only what your test cares about.
- Never share mutable state between tests. Each test creates its own data.
- For database integration tests, use a transaction that rolls back after each test.

## Mocking rules

- **Mock external services** (HTTP APIs, email providers, payment gateways). Use
  typed mocks that match the real interface.
- **Mock the database** in unit tests (use repository interfaces). Use a real test
  database in integration tests.
- **Never mock the unit under test.** If you're testing `WorkflowService`, don't
  mock `WorkflowService`.
- **Never mock value objects or simple utilities.** Use the real implementation.
- **Prefer dependency injection** over module-level mocking. Pass dependencies
  through the constructor so tests can substitute them cleanly.

## Coverage targets

| Metric      | Global target | Critical paths |
|-------------|---------------|----------------|
| Statements  | 85%           | 95%            |
| Branches    | 80%           | 90%            |
| Functions   | 85%           | 95%            |
| Lines       | 85%           | 95%            |

Critical paths include: authentication, authorization, payment processing, data
mutations, and workflow execution.

Coverage is enforced in CI. A PR that drops coverage below thresholds will fail.

## What NOT to test

- **Generated code** (OpenAPI types, Prisma client) — trust the generator.
- **Third-party library internals** — test YOUR code that uses the library.
- **Simple type definitions and interfaces** — they're checked by TypeScript.
- **Configuration files** — unless they contain logic.
- **Trivial getters/setters** with no logic.

## Test quality checks

Before submitting a PR, verify:

- [ ] Tests fail when you break the code they cover (delete a line and see).
- [ ] Tests don't depend on execution order.
- [ ] Tests don't depend on timing (no `setTimeout` in tests; use fake timers).
- [ ] Tests clean up after themselves (no leftover files, database rows, or env vars).
- [ ] Tests run in under 30 seconds total for the affected module.
