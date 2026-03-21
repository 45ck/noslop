# Project: DocuFlow — Collaborative Document Platform

## Product

DocuFlow is a SaaS document collaboration tool. Teams create, edit, and
share documents with real-time collaboration, comments, and version
history. Think of a simplified Notion or Google Docs.

Currently the app has no user authentication -- all documents are public
and anonymous. We are adding a full authentication and authorization
system to support private documents, team workspaces, and role-based
access control.

## Tech Stack

- **Framework:** Next.js 14 (App Router) with TypeScript 5.4
- **API:** tRPC v11 for type-safe API routes
- **ORM:** Prisma 5.x with PostgreSQL 16
- **Auth:** Building from scratch (bcrypt + JWT, no third-party provider)
- **Testing:** Vitest for unit tests, Playwright for E2E
- **Styling:** Tailwind CSS
- **Deployment:** Vercel (app) + Neon (database)

## Key Commands

```bash
npm run dev           # Start Next.js dev server
npm run build         # Production build
npm run test          # Run Vitest unit + integration tests
npm run test:e2e      # Run Playwright E2E tests
npm run lint          # ESLint + type checking
npm run db:migrate    # Run Prisma migrations
npm run db:generate   # Regenerate Prisma client
npm run db:studio     # Open Prisma Studio
npm run db:reset      # Reset dev database (destructive)
```

## Architecture

```
src/
  app/                # Next.js App Router pages and layouts
    (auth)/           # Auth-related pages (login, register)
    (dashboard)/      # Authenticated pages
    api/trpc/         # tRPC API handler
  server/
    routers/          # tRPC routers (document, user, workspace)
    services/         # Business logic
    repositories/     # Data access layer (Prisma)
    middleware/        # tRPC middleware (auth, logging)
  lib/
    auth/             # Auth utilities (hashing, tokens, sessions)
    trpc.ts           # tRPC client + server setup
    prisma.ts         # Prisma client singleton
  components/         # React components
    auth/             # Login form, register form, guards
    editor/           # Document editor
    layout/           # Navigation, sidebar
prisma/
  schema.prisma
  migrations/
```

## Current Work

We are implementing user authentication and role-based authorization.

**Active task DAGs live in `.claude/plans/`.**
Read the DAG to find unblocked tasks and continue where the last
session left off.

## Conventions

- tRPC routers go in `src/server/routers/` and are registered in `_app.ts`
- Repository files do not import from `next` or `trpc` -- they are
  framework-agnostic
- Services contain business logic; repositories contain only data access
- All passwords stored as bcrypt hashes, never plaintext
- JWT tokens: 15-minute access token, 7-day refresh token
- API errors use tRPC error codes (`UNAUTHORIZED`, `FORBIDDEN`, etc.)
