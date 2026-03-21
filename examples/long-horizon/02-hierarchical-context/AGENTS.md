# Agent Instructions

## Context loading

Before working in any layer, read the relevant `CLAUDE.md` files:

- **Always read:** root `CLAUDE.md` (this directory)
- **Working in `src/api/`:** also read `src/api/CLAUDE.md`
- **Working in `src/db/`:** also read `src/db/CLAUDE.md`
- **Working in `src/ui/`:** also read `src/ui/CLAUDE.md`
- **Cross-layer changes:** read all affected layer files before starting

Do not guess at conventions. The answers are in the context files.

## Dependency rules

The dependency direction is strict:

```
ui → api → db
```

- UI code must never import from `src/api/` or `src/db/`. It talks to the API over HTTP.
- API code may import from `src/db/` (repositories) and `src/shared/`.
- DB code may only import from `src/shared/`.
- `src/shared/` must not import from any layer.

If a change requires violating these rules, stop and discuss it before proceeding.

## Quality gate

Run `npm run ci` before declaring any task complete. This runs lint, typecheck, all tests, and build. All must pass.

For faster feedback during development, run the layer-specific test command:

```bash
npm run test:api    # After API changes
npm run test:db     # After database changes
npm run test:ui     # After UI changes
```

## Working across layers

When a feature touches multiple layers (e.g., adding a new API endpoint that requires a schema change and a new UI page):

1. Start with the database layer: schema change and migration
2. Then the API layer: repository, service, controller, route
3. Then the UI layer: API client call, components, page
4. Run `npm run ci` at the end to verify everything integrates

This order follows the dependency direction and avoids working against partially-built foundations.

## Commits

- Use conventional commits: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`
- Scope by layer when the change is contained: `feat(api): add task filtering endpoint`
- One logical change per commit. Cross-layer features may be one commit if tightly coupled.
- Imperative mood: "add task filtering" not "added task filtering"

## Pull requests

- PR title: conventional commit format, under 72 characters
- PR body must include:
  - What changed and why
  - Which layers were affected
  - How to test (manual steps or relevant test commands)
  - Database migration note if applicable

## When tests fail

1. Read the full error output.
2. Determine if the failure is in your changes or pre-existing.
3. If pre-existing: note it, continue with your work, mention it in the PR.
4. If caused by your changes: fix before continuing. Do not defer.
5. Never skip or disable tests to make CI pass.

## What not to do

- Do not weaken TypeScript, ESLint, or Prettier configs.
- Do not add dependencies without explicit approval.
- Do not commit `.env` files, secrets, or credentials.
- Do not modify migration files that have already been committed.
- Do not push directly to `main`.
