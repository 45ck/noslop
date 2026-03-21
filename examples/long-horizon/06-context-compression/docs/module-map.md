# Module Map

One-paragraph summaries of every module in the Beacon codebase. Read this before
exploring unfamiliar code. If you add a new module, add an entry here.

---

## `src/ingestion/`

> last_verified: 2026-03-01

HTTP and SDK event ingestion. The main entry points are `event-receiver.ts`
(Express routes for the `/track` and `/batch` endpoints) and `sdk-handler.ts`
(WebSocket handler for real-time SDK connections). All incoming events pass
through `validator.ts` which enforces the event schema, and `rate-limiter.ts`
which applies per-project rate limits using Redis. Events that pass validation
are published to the processing queue. Key pattern: all validation errors return
structured error responses with codes, never raw 400s.

## `src/processing/`

> last_verified: 2026-02-18

Event enrichment, sessionization, and real-time aggregation. The `enricher.ts`
pipeline adds geo-IP data, device info, and UTM parameter parsing to raw events.
`session-manager.ts` groups events into sessions using a 30-minute inactivity
window, maintaining session state in Redis. `aggregator.ts` computes real-time
counters (active users, event counts per minute) that feed the live dashboard.
Processing is idempotent: replaying the same event produces identical output.
Key file: `pipeline.ts` orchestrates the enrichment steps in order.

## `src/storage/`

> last_verified: 2026-02-25

ClickHouse adapters, schema management, and data retention. `clickhouse-client.ts`
wraps the ClickHouse HTTP interface with retry logic and connection pooling.
`schema-manager.ts` handles migrations using numbered SQL files in `migrations/`.
`retention-policy.ts` enforces per-project TTLs by scheduling partition drops.
Important constraint: all writes go through `batch-writer.ts` which buffers
inserts into 10-second batches for throughput. Never write single rows directly.

## `src/query/`

> last_verified: 2025-08-15

GraphQL resolvers, query builder, and caching layer. `schema.graphql` defines
the public API. Resolvers in `resolvers/` translate GraphQL queries into
ClickHouse SQL via `query-builder.ts`, which handles time bucketing, filtering,
and GROUP BY construction. `cache.ts` implements a two-tier cache: Redis for
hot queries (5-minute TTL) and in-memory LRU for repeat queries within a
session. Key pattern: resolvers never access ClickHouse directly; they always go
through the query builder.

## `src/dashboard/`

> last_verified: 2026-03-10

React SPA for visualizing analytics data. Component library in `components/`
includes chart types (line, bar, funnel, retention, heatmap) built on D3.
`views/` contains page-level components for the main dashboard, funnels, and
user explorer. State management uses Zustand in `stores/`. The API client in
`api-client.ts` is auto-generated from the GraphQL schema. Key pattern: chart
components accept a standard `DataSeries` prop shape, making them composable.

## `src/auth/`

> last_verified: 2026-03-05

Authentication, API keys, and team management. Supports session-based auth for
the dashboard (cookie + CSRF token) and bearer token auth for the API. API keys
are managed in `api-key-service.ts` with scoped permissions (read, write, admin).
`team-service.ts` handles multi-user workspaces with role-based access (owner,
member, viewer). Middleware in `middleware/auth.ts` extracts and validates
credentials on every request. Key file: `permissions.ts` defines the capability
matrix for each role.

## `src/billing/`

> last_verified: 2026-02-20

Subscription management, usage metering, and Stripe integration. `meter.ts`
tracks event volume per project per billing period, writing counts to PostgreSQL.
`subscription-service.ts` manages plan tiers (free, pro, enterprise) and
enforces limits. `stripe-adapter.ts` wraps the Stripe SDK for checkout,
invoicing, and webhook handling. Key constraint: metering must be accurate even
under replay, so it uses ClickHouse event counts as the source of truth, not
the ingestion counter.

## `src/workers/`

> last_verified: 2026-03-12

Background jobs, scheduled tasks, and dead letter queue. Uses BullMQ with Redis
for job queuing. `jobs/` contains job handlers for report generation, data
exports, scheduled digests, and retention cleanup. `scheduler.ts` registers
cron-based recurring jobs. `dead-letter.ts` captures failed jobs after 3 retries
and exposes them via an admin API for inspection and replay. Key pattern: every
job handler is idempotent and accepts a `jobId` for deduplication.

## `src/shared/`

> last_verified: 2026-03-08

Common types, utilities, and error classes used across all modules. `types.ts`
defines the core `Event`, `Session`, and `Project` interfaces. `errors.ts`
provides a typed error hierarchy (ValidationError, AuthError, RateLimitError)
with HTTP status code mapping. `logger.ts` wraps Pino with structured logging
and request correlation IDs. `config.ts` loads environment-specific configuration
with validation. Key rule: shared code must have zero business logic; it provides
types and plumbing only.

---

## Dependency Graph

```
dashboard ──> query ──> storage ──> shared
                │         │
                ▼         ▼
auth ────────> shared   processing ──> shared
  │                       │
  ▼                       ▼
billing ──> shared     ingestion ──> shared

workers ──> storage, processing, billing, shared
```

Arrows indicate "depends on." All modules depend on `shared`. The dashboard
depends on query (via the GraphQL API client). Workers orchestrate across
multiple modules. Auth and billing are siblings — billing reads team data from
auth but auth never reads billing data. Ingestion and processing form a pipeline
but are decoupled through the Redis queue.
