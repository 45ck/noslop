# Team Preferences

Conventions learned from human review feedback across sessions. When a reviewer
corrects your approach, add it here so future sessions follow the same standards.

---

## Testing

**Table-driven tests.** We prefer table-driven tests (test cases defined in a
slice of structs) over individual test functions. Use `t.Run(tc.name, ...)` to
get clear subtests in output. Learned 2024-08-20 from review feedback on
delivery handler tests.

**Testcontainers for integration tests.** Never mock PostgreSQL or Redis in
integration tests. Use `testcontainers-go` to spin up real instances. Pin the
container image tags to avoid flakes from upstream changes. Learned 2024-09-15.

**No `context.TODO()`.** Always propagate the parent context. Using
`context.TODO()` hides broken cancellation chains and has caused production
issues with leaked goroutines. Learned 2024-10-03 after a production incident.

---

## Code Style

**Error messages: lowercase, no trailing punctuation.** Follow Go convention:
`fmt.Errorf("failed to deliver webhook: %w", err)` not
`fmt.Errorf("Failed to deliver webhook: %w.", err)`. Learned 2024-08-22.

**Wrap errors with context.** Every error return should add context:
`fmt.Errorf("processing event %s: %w", eventID, err)`. Bare `return err` is
not acceptable except in trivial one-line functions. Learned 2024-09-01.

**Named return values only for documentation.** Use named returns to document
what a function returns, but never use naked `return` statements. They harm
readability. Learned 2024-11-10.

---

## Git and PRs

**PR descriptions need a "Test plan" section.** Every PR must explain how the
change was tested. Acceptable: "Added unit tests" or "Tested manually with
curl against staging." Not acceptable: no test plan at all. Learned 2024-08-25.

**Never squash-merge.** We want individual commit history on the main branch.
Each commit should be a coherent unit of work. Use `git rebase` to clean up
before merging, not squash. Learned 2024-09-05.

**Commit messages reference issue numbers.** Format: `fix(delivery): handle
timeout on large payloads (RELAY-456)`. Include the component prefix and
ticket number. Learned 2024-09-12.

---

## Architecture

**No business logic in `pkg/`.** The `pkg/` directory is for shared plumbing:
logging, config loading, error types. Business rules belong in `internal/`.
If you find yourself importing domain types into `pkg/`, the code belongs in
`internal/` instead. Learned 2025-01-20.

**Interfaces at the consumer, not the producer.** Define interfaces in the
package that uses them, not the package that implements them. This follows
Go convention and avoids premature abstraction. Learned 2025-02-14.
