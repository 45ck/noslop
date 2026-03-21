# Feature: User Authentication & Authorization

- **Feature:** Add auth system with login, registration, sessions, and RBAC
- **Created:** 2026-03-12
- **Status:** active
- **Progress:** 5/12 tasks done

---

## Task DAG

| ID | Task | Status | Blocked By | Acceptance Criteria |
|----|------|--------|------------|---------------------|
| 1 | Design auth database schema (User, Session, Role, UserRole tables) | done | -- | Schema documented in `docs/auth-schema.md` with all columns, types, indexes, and relationships |
| 2 | Design RBAC permission model (roles: owner, editor, viewer; resource-level permissions) | done | -- | Permission matrix documented in `docs/rbac-model.md` covering all document operations |
| 3 | Create Prisma schema and migration for auth tables | done | 1, 2 | `npx prisma migrate dev` succeeds; `npx prisma generate` produces client with User, Session, Role, UserRole models |
| 4 | Implement password hashing service (`src/lib/auth/password.ts`) | done | -- | Unit tests pass for hash, verify, and rejection of weak passwords; bcrypt with cost factor 12 |
| 5 | Implement session token service (`src/lib/auth/tokens.ts`) | done | -- | Unit tests pass for JWT sign, verify, refresh, and expiration; access token 15min, refresh 7 days |
| 6 | Create auth repository — CRUD for users, sessions, roles (`src/server/repositories/auth.repository.ts`) | in-progress | 3 | All repository methods have unit tests; methods: createUser, findByEmail, createSession, revokeSession, assignRole, getUserRoles |
| 7 | Create login tRPC endpoint (`src/server/routers/auth.ts` — login procedure) | pending | 4, 5, 6 | Integration test: valid credentials return access + refresh tokens; invalid credentials return UNAUTHORIZED; rate limited to 5 attempts per minute |
| 8 | Create registration tRPC endpoint (`src/server/routers/auth.ts` — register procedure) | pending | 4, 6 | Integration test: creates user with hashed password; rejects duplicate emails with CONFLICT; validates email format and password strength |
| 9 | Create auth middleware for tRPC context (`src/server/middleware/auth.ts`) | pending | 5 | Middleware extracts JWT from Authorization header, verifies it, attaches user to tRPC context; returns UNAUTHORIZED for invalid/expired tokens |
| 10 | Add role-based route guards (`src/server/middleware/rbac.ts`) | pending | 6, 9 | Guard middleware checks user role against required permission; returns FORBIDDEN for insufficient permissions; unit tests for each role (owner, editor, viewer) |
| 11 | Create login and registration UI pages (`src/app/(auth)/login/page.tsx`, `register/page.tsx`) | pending | 7, 8 | Playwright E2E test: user can register, log in, and see dashboard; form validation shows errors; loading states during submission |
| 12 | Add permission checks to existing document endpoints | pending | 10 | Existing document CRUD endpoints enforce ownership and role checks; integration tests verify owner can edit, viewer can only read, anonymous users are rejected |

---

## Dependency Graph (Visual)

```
1 (done) ----\
              +--> 3 (done) --> 6 (in-progress) --> 7 (pending) --\
2 (done) ----/                       |                |            +--> 11 (pending)
                                     |                v            |
4 (done) ----------------------------+-------> 8 (pending) -------/
                                     |
5 (done) --------> 9 (pending) --> 10 (pending) --> 12 (pending)
                                     ^
                                     |
                              6 (in-progress)
```

## Notes

- 2026-03-12: Tasks 1 and 2 completed in first session. Schema uses
  UUID primary keys and includes `deleted_at` for soft deletes on users.
- 2026-03-14: Tasks 4 and 5 completed. Password service uses bcrypt
  with cost 12. Token service uses `jose` library for JWT (no `jsonwebtoken`
  -- it has no ESM support).
- 2026-03-15: Task 3 completed. Migration applied cleanly. Had to add
  a composite unique index on `(user_id, role, resource_id)` in UserRole
  to prevent duplicate role assignments.
- 2026-03-18: Started task 6. createUser and findByEmail done. Session
  and role methods still need implementation.
