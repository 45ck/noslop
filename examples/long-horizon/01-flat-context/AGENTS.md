# Agent Instructions

## Before starting any task

1. Read `CLAUDE.md` in full.
2. Run `npm run test` to confirm the test suite passes before making changes.

## Quality gate

Run `npm run ci` before declaring any task complete. If it fails, fix the issue. Do not skip failing tests or linting errors.

## Making changes

- Create or update tests for every change to `src/services/` or `src/routes/`.
- Run the relevant test file after each significant edit to catch regressions early.
- Do not modify ESLint, Prettier, or TypeScript configs to suppress errors.
- Do not add dependencies without explicit approval.

## Commits

- Use conventional commits: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`
- Keep commits atomic — one logical change per commit.
- Write the message in imperative mood: "add task filtering" not "added task filtering".

## Pull requests

- PR title matches the primary commit message.
- PR description includes: what changed, why, and how to test.
- If the PR touches the database schema, mention the migration in the description.

## When tests fail

1. Read the failure output carefully.
2. Check if the failure is in your changes or pre-existing.
3. If pre-existing, note it and proceed. If caused by your changes, fix it before continuing.
4. Never mark a task as done with failing tests.

## What not to do

- Do not push directly to `main`. Always use a feature branch.
- Do not hardcode secrets, URLs, or environment-specific values.
- Do not modify `prisma/migrations/` manually — use `npm run db:migrate` to generate migrations.
