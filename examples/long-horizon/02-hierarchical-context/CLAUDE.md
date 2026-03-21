<!-- ~105 lines, ~1,470 tokens -->
# Planwise — Project Management Tool

A project management SaaS application. Teams create projects, define tasks with priorities and deadlines, track progress on kanban boards, and generate sprint reports.

## Tech stack

| Layer    | Stack                                            |
| -------- | ------------------------------------------------ |
| Frontend | Next.js 14 (App Router), React 18, Tailwind CSS  |
| API      | Express 4, TypeScript, Zod validation             |
| Database | PostgreSQL 16, Prisma 5 ORM, Redis for caching   |
| Auth     | JWT access/refresh tokens, bcrypt password hashing |
| Testing  | Vitest, Supertest, Playwright, Testing Library     |
| CI       | GitHub Actions                                     |

## Monorepo structure

```
src/
  api/         # Express REST API (routes, controllers, middleware)
  db/          # Prisma schema, migrations, repositories, seeds
  ui/          # Next.js frontend (pages, components, hooks)
  shared/      # Types and utilities shared across layers
```

Each layer has its own `CLAUDE.md` with detailed conventions. Read the relevant file before working in that layer.

## Commands

```bash
# Global
npm run ci              # Full quality gate: lint + typecheck + test + build
npm run lint            # ESLint across all layers
npm run lint:fix        # Auto-fix lint issues
npm run format          # Prettier format all files
npm run typecheck       # TypeScript type checking

# Layer-specific
npm run dev:api         # Start API server (port 4000)
npm run dev:ui          # Start Next.js dev server (port 3000)
npm run test            # Run all tests
npm run test:api        # API tests only
npm run test:db         # Database tests only
npm run test:ui         # UI component + e2e tests
npm run test:e2e        # Playwright end-to-end tests
npm run db:migrate      # Apply pending migrations
npm run db:seed         # Seed development database
```

## Global rules

### TypeScript

- Strict mode enabled everywhere. No exceptions.
- Never use `any`. Use `unknown` and narrow with type guards.
- No `@ts-ignore` without a comment explaining why (minimum 5 words).
- Shared types go in `src/shared/types/`. Layer-specific types stay in their layer.

### Error handling

All errors flow through a unified `AppError` class:

```typescript
class AppError extends Error {
  constructor(
    public code: string,      // Machine-readable: 'TASK_NOT_FOUND'
    public message: string,   // Human-readable: 'Task with ID 42 was not found'
    public statusCode: number  // HTTP status: 404
  ) { super(message); }
}
```

- Services throw `AppError`.
- Controllers never catch errors — they propagate to the error middleware.
- The UI maps error codes to user-friendly messages.

### Naming

- Files: `kebab-case.ts` (e.g., `task-service.ts`)
- Types/interfaces: `PascalCase` (e.g., `TaskStatus`)
- Functions/variables: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Test files: colocated as `{name}.test.ts`

## Architecture and dependency rules

```
ui → api → db → PostgreSQL
       ↘     ↗
       shared
```

**Strict dependency direction:** UI may import from shared. API may import from shared and db. DB may import from shared. No reverse dependencies.

- `src/ui/` must NEVER import from `src/api/` or `src/db/` directly. It communicates with the API over HTTP.
- `src/api/` may import from `src/db/` (repositories) and `src/shared/`.
- `src/db/` may only import from `src/shared/`.
- `src/shared/` must have zero imports from any other layer.

## Environment

- `.env` files are git-ignored. Copy `.env.example` to `.env` for local development.
- Never hardcode secrets, database URLs, or API keys.
- Environment variables are validated at startup using Zod in `src/shared/env.ts`.
