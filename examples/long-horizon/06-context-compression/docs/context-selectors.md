# Context Selectors

Use this table to decide which files to read based on what you are working on.
Do not read the entire codebase. Load only the files listed for your task type.

---

## Adding a New Event Type

| | Files |
|---|---|
| **Read** | `src/ingestion/validator.ts`, `src/ingestion/event-receiver.ts`, `src/processing/enricher.ts`, `src/processing/pipeline.ts`, `src/storage/migrations/`, `src/shared/types.ts` |
| **Modify** | `src/shared/types.ts` (add type), `src/ingestion/validator.ts` (add schema), `src/processing/enricher.ts` (add enrichment), `src/storage/migrations/` (add column) |
| **Tests** | `src/ingestion/__tests__/`, `src/processing/__tests__/enricher.test.ts`, `src/storage/__tests__/` |

## Fixing a Dashboard Bug

| | Files |
|---|---|
| **Read** | `src/dashboard/components/`, `src/dashboard/views/`, `src/dashboard/stores/`, `src/dashboard/api-client.ts`, `src/query/schema.graphql` |
| **Modify** | Typically `src/dashboard/components/` or `src/dashboard/views/` |
| **Tests** | `src/dashboard/__tests__/`, run `npm run test:e2e` for visual regression |

## Changing Auth Flow

| | Files |
|---|---|
| **Read** | `src/auth/middleware/auth.ts`, `src/auth/permissions.ts`, `src/auth/api-key-service.ts`, `src/auth/team-service.ts`, `src/shared/errors.ts` |
| **Modify** | `src/auth/` (specific files depend on the change), possibly `src/shared/types.ts` |
| **Tests** | `src/auth/__tests__/`, `src/integration/auth.test.ts` |

## Billing Issue

| | Files |
|---|---|
| **Read** | `src/billing/meter.ts`, `src/billing/subscription-service.ts`, `src/billing/stripe-adapter.ts`, `src/auth/team-service.ts` (for team/project context) |
| **Modify** | `src/billing/` |
| **Tests** | `src/billing/__tests__/`, `src/integration/billing.test.ts` |

## Performance Problem

| | Files |
|---|---|
| **Read** | `src/query/query-builder.ts`, `src/query/cache.ts`, `src/storage/clickhouse-client.ts`, `src/storage/batch-writer.ts`, `src/processing/aggregator.ts` |
| **Modify** | Depends on where the bottleneck is; start with `src/query/` for read-path issues, `src/storage/` for write-path issues |
| **Tests** | `src/query/__tests__/`, `src/storage/__tests__/`, run `npm run bench` for benchmarks |

## Adding a New Chart Type

| | Files |
|---|---|
| **Read** | `src/dashboard/components/charts/`, `src/dashboard/stores/chart-store.ts`, `src/query/resolvers/`, `src/query/schema.graphql` |
| **Modify** | `src/dashboard/components/charts/` (new component), `src/query/resolvers/` (if new data shape needed), `src/query/schema.graphql` (if new query needed) |
| **Tests** | `src/dashboard/__tests__/charts/`, `src/query/__tests__/resolvers/` |

## Worker / Job Issue

| | Files |
|---|---|
| **Read** | `src/workers/jobs/`, `src/workers/scheduler.ts`, `src/workers/dead-letter.ts`, `src/shared/config.ts` (for queue settings) |
| **Modify** | `src/workers/jobs/` (specific job handler), `src/workers/scheduler.ts` (if timing related) |
| **Tests** | `src/workers/__tests__/`, check dead letter queue via admin API |

## API Schema Change

| | Files |
|---|---|
| **Read** | `src/query/schema.graphql`, `src/query/resolvers/`, `src/dashboard/api-client.ts`, `src/query/query-builder.ts` |
| **Modify** | `src/query/schema.graphql`, `src/query/resolvers/` (update resolvers), `src/dashboard/api-client.ts` (regenerate) |
| **Tests** | `src/query/__tests__/`, `src/dashboard/__tests__/`, `src/integration/api.test.ts` |

---

## How to Use This

1. Identify which task type above best matches your current work.
2. Read the files in the **Read** column first to build understanding.
3. Make changes in the **Modify** column.
4. Run the tests in the **Tests** column to verify.
5. If your task spans multiple categories, combine the file lists.
6. If no category matches, consult `docs/module-map.md` to identify the relevant modules, then read their key files.
