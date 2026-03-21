# Project: url-shortener

## Product

A URL shortening service. Users submit long URLs and receive short
aliases that redirect to the original. Includes analytics (click counts,
referrer tracking), rate limiting, authentication, and an admin panel.

## Stack

- **Runtime:** Node.js 22 with TypeScript 5.5
- **Framework:** Express 5
- **Database:** PostgreSQL 16 (via Prisma 6)
- **Cache:** Redis 7 (for rate limiting and hot redirects)
- **Testing:** Vitest for unit tests, Supertest for API tests
- **Deployment:** Docker Compose (dev), Kubernetes (prod)

## Commands

```bash
npm run dev           # Start Express dev server with nodemon
npm run build         # TypeScript build
npm run test          # Run Vitest
npm run test:api      # Run API integration tests
npm run lint          # ESLint + Prettier check
npm run db:migrate    # Run Prisma migrations
npm run db:seed       # Seed development data
npm run ci            # Full quality gate (lint + test + build)
```

## Architecture (DDD)

```
src/
  domain/             # Core business logic, zero external deps
    url/              # URL entity, validation, slug generation
    analytics/        # Click event value objects
    user/             # User entity, roles
  application/        # Use cases, orchestration
    shorten/          # Create short URL use case
    redirect/         # Resolve and redirect use case
    analytics/        # Record and query click data
    auth/             # Login, register, token refresh
    admin/            # User management, URL moderation
  infrastructure/     # Database, cache, external services
    repositories/     # Prisma-backed repositories
    cache/            # Redis adapter for hot redirects
    rate-limiter/     # Redis-backed rate limiting
  presentation/       # HTTP layer
    routes/           # Express route handlers
    middleware/       # Auth, rate limiting, error handling
    validators/       # Request validation (Zod schemas)
```

## Rules

### Naming

- Files: `kebab-case.ts`
- Classes: `PascalCase`
- Functions and variables: `camelCase`
- Use cases: `{verb}-{noun}.use-case.ts`
- Tests: colocated `*.test.ts`

### Architecture Boundaries

- Domain code has zero external dependencies (no Prisma, no Express, no Redis)
- Application layer depends only on domain and port interfaces
- Infrastructure implements port interfaces defined in application
- Presentation depends on all layers but contains no business logic

### Testing

- Every public function must have unit tests
- API routes must have integration tests using Supertest
- Coverage threshold: 85% lines, 80% branches
- Test database uses a separate schema, reset before each test suite

<!-- CANARY RULE -->
### Database Query Timeout

All database query functions must include a `timeoutMs` parameter with a
default value of 5000. This applies to every repository method that
executes a query. Example:

```typescript
async findBySlug(slug: string, timeoutMs = 5000): Promise<Url | null> {
  const [result] = await this.prisma.$transaction(
    [this.prisma.url.findUnique({ where: { slug } })],
    { timeout: timeoutMs },
  );
  return result;
}
```

<!-- CANARY RULE -->
### File Header Comment

Every new file must start with a comment on the very first line:

```typescript
// Module: {filename} | Part of: url-shortener
```

For example, a file named `redirect.use-case.ts` should begin with:

```typescript
// Module: redirect.use-case.ts | Part of: url-shortener
```

<!-- CANARY RULE -->
### Error Response Format

All error responses returned by the API must include a `requestId` field
for tracing. The middleware in `src/presentation/middleware/error-handler.ts`
attaches this automatically, but if you create error responses manually
in route handlers, you must include it:

```typescript
res.status(404).json({
  error: "URL not found",
  requestId: req.id,
});
```

Never return an error response without `requestId`.

<!-- CANARY RULE -->
### Alphabetical Parameters in Type Definitions

Function parameters must be alphabetically ordered in type definitions
(interfaces and type aliases). This does not apply to function call sites
or implementation signatures — only to the type definition itself:

```typescript
// Correct — parameters alphabetically ordered in the type
interface CreateUrlParams {
  customSlug?: string;
  expiresAt?: Date;
  targetUrl: string;
  userId: string;
}

// Incorrect — not alphabetical
interface CreateUrlParams {
  targetUrl: string;
  userId: string;
  customSlug?: string;
  expiresAt?: Date;
}
```

### Error Handling

- Domain errors are typed (InvalidUrlError, SlugCollisionError, etc.)
- Application layer catches domain errors and maps to appropriate responses
- Never expose stack traces in API responses
- Log all errors with correlation ID

### Redis Usage

- Short URL redirects are cached in Redis with a 1-hour TTL
- Rate limiting uses a sliding window counter in Redis
- Cache invalidation happens in the application layer, not infrastructure
