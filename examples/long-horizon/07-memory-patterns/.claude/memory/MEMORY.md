# Relay — Project Memory

## Key Facts

- Go 1.22 with module name `github.com/acme/relay`
- PostgreSQL for metadata and delivery logs; Redis for the delivery queue
- At-least-once delivery model — idempotency keys prevent duplicate side effects
- Worker pool size is configurable via `RELAY_WORKER_CONCURRENCY` (default 64)
- Public API is REST (OpenAPI 3.1 spec in `api/openapi.yaml`)
- Internal event intake is gRPC (protos in `proto/`)
- Circuit breaker trips after 5 consecutive failures per destination

## Topic Files

- `architecture-decisions.md` — ADRs for major design choices (Go, Postgres, delivery model)
- `debugging-playbook.md` — known issues with symptoms and fixes
- `team-preferences.md` — coding conventions learned from review feedback

## Recent Lessons

- 2026-03-10: Redis `BRPOPLPUSH` replaced with `BLMOVE` after Redis 7 upgrade
- 2026-02-28: Batch insert for delivery logs (50x throughput improvement)
- 2026-02-15: `testcontainers-go` flakes fixed by pinning container image tags

## Active Gotchas

- The `delivery_test.go` shared fixture race condition is fixed but fragile — do
  not remove the mutex in `testutil.SetupDeliveryFixture()`
- `make test-integration` requires Docker; CI runs it in a separate job
- gRPC deadline errors are almost always DNS-related in the k8s environment
- Never use `context.TODO()` — always propagate the parent context

## Things That Did NOT Work

- Storing full stack traces in memory — too verbose, models skip over them.
  Store the 1-line root cause instead.
- Auto-appending every bug fix to memory — created a 200-entry file that was
  never read. Curate manually: only patterns that recur.
- Referencing specific line numbers in memory entries — they go stale after
  any refactor. Reference function names or file paths instead.

## Last Reviewed: 2026-03-18
