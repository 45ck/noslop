<!-- ~83 lines, ~1,160 tokens -->
# Database Layer

PostgreSQL 16 accessed through Prisma 5 ORM. All database interaction flows through repository files in this layer.

## Schema

The Prisma schema lives at `src/db/prisma/schema.prisma`. Key models:

- `User` — accounts with email, hashed password, role
- `Project` — team workspaces with name, description, owner
- `Task` — work items with title, status, priority, assignee, due date
- `Comment` — threaded comments on tasks
- `AuditLog` — immutable log of all state changes

## Migration workflow

```bash
# Create a migration after changing schema.prisma
npm run db:migrate -- --name add-task-priority

# Apply pending migrations (dev)
npm run db:migrate

# Reset and reseed (destroys all data)
npm run db:reset
```

Migration naming: `kebab-case` describing the change. Examples: `add-task-priority`, `create-audit-log-table`, `add-index-on-task-status`.

Never edit migration files after they've been committed. If a migration is wrong, create a new one to fix it.

## Repository pattern

One repository file per entity. Repositories are the only files that import `PrismaClient`.

```typescript
// src/db/repositories/task-repository.ts
export function findByProject(projectId: string, opts: PaginationOpts) {
  return prisma.task.findMany({
    where: { projectId },
    select: { id: true, title: true, status: true, priority: true, assigneeId: true },
    skip: opts.offset,
    take: opts.limit,
    orderBy: { createdAt: 'desc' },
  });
}
```

### Rules

- Always use `select` to pick specific fields. Never return entire rows with all columns.
- Use `prisma.$transaction()` for operations that write to multiple tables.
- Return plain objects from repository functions, never Prisma model instances.
- Repository functions take simple arguments (IDs, filter objects), never Express request objects.

## Seed data

Seed scripts live in `src/db/prisma/seed.ts`. Seeds create:

- 3 test users (admin, member, viewer) with known passwords
- 2 projects with 10 tasks each
- Sample comments and audit log entries

Seed data uses deterministic IDs so tests can reference them. Run `npm run db:seed` after migrations.

## Testing

Tests use a dedicated test database (configured via `DATABASE_URL` in `.env.test`). Each test file:

1. Runs migrations in `beforeAll`
2. Cleans all tables in `beforeEach` (truncate, not drop)
3. Inserts only the data it needs
4. Never depends on seed data — tests must be self-contained

Run database tests: `npm run test:db`

## Common pitfalls

- **N+1 queries:** Use `include` or write a single query with joins, not loops with individual fetches.
- **Missing indexes:** Any column used in `WHERE` or `ORDER BY` on large tables needs an index. Add it in the schema and create a migration.
- **Timezone bugs:** Store all timestamps as UTC. Prisma does this by default with `DateTime` — do not override it.
- **Connection pooling:** The Prisma client is instantiated once in `src/db/client.ts`. Never create additional instances.
