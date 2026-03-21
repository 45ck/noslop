# Schema Migration Plan

- **Plan:** Restructure e-commerce database schema
- **Created:** 2026-03-10
- **Status:** active
- **Current checkpoint:** 3b

---

## Checkpoint 1: Audit & Plan [x] done

**Entry criteria:**
- Access to current production schema (`prisma db pull` works)
- Read access to query logs for identifying hot paths

**Work items:**
- [x] Run `prisma db pull` and document all 23 tables in `docs/schema-audit.md`
- [x] Identify denormalized columns (found 14 across 6 tables)
- [x] Map foreign key relationships and find orphaned references
- [x] List all breaking changes with affected repository files
- [x] Draft migration SQL in `prisma/migrations/draft/restructure.sql`

**Exit criteria:**
- `docs/schema-audit.md` exists with complete table catalog
- `docs/breaking-changes.md` lists every breaking change with affected files
- Draft SQL reviewed and saved in `prisma/migrations/draft/`

**Notes:** Audit found 14 denormalized columns, 3 tables with no foreign
keys that should have them, and 8 columns with inconsistent naming. Full
details in `docs/schema-audit.md`.

---

## Checkpoint 2: Schema Migration [x] done

**Entry criteria:**
- Checkpoint 1 complete
- Draft migration SQL exists in `prisma/migrations/draft/`
- Dev database is accessible and seeded

**Work items:**
- [x] Create Prisma migration from draft SQL (`npx prisma migrate dev --name restructure_schema`)
- [x] Rename tables: `Orders` -> `orders`, `OrderItems` -> `order_items`, etc.
- [x] Add missing foreign keys to `product_reviews`, `cart_items`, `wishlists`
- [x] Add `created_at`/`updated_at` to 8 tables that were missing them
- [x] Regenerate Prisma client and verify it compiles

**Exit criteria:**
- `npx prisma migrate dev` runs without errors
- `npx prisma generate` succeeds
- `npm run build` fails only on repository type errors (expected at this stage)

**Notes:** Migration required splitting into 3 sequential migrations to avoid
circular dependency issues. Order: (1) rename tables and columns, (2) add
missing columns and indexes, (3) add foreign key constraints. All three
applied cleanly on dev.

---

## Checkpoint 3: Repository Layer [!] FAILED

**Entry criteria:**
- Checkpoint 2 complete
- Prisma client regenerated with new schema
- `npm run build` shows only repository-layer type errors

**Work items:**
- [x] Update `src/repositories/product.repository.ts` — rename fields, fix queries
- [x] Update `src/repositories/order.repository.ts` — new join structure
- [x] Update `src/repositories/user.repository.ts` — add audit fields
- [x] Update `src/repositories/cart.repository.ts` — foreign key changes
- [!] FAILED: Update `src/repositories/review.repository.ts` — new relations
- [ ] Run unit tests for all updated repositories (`npm run test -- --grep repository`)

**Exit criteria:**
- All repository files compile without errors
- `npm run test -- --grep repository` passes (0 failures)
- No Prisma deprecation warnings in test output

**Rollback:** Revert `cart.repository.ts` and `review.repository.ts` to pre-checkpoint
state using `git checkout HEAD -- src/repositories/cart.repository.ts src/repositories/review.repository.ts`.
Product, order, and user repository changes are safe to keep (they pass tests independently).

**Notes:** Started 2026-03-19. Product and order repositories done. User
repository required adding `updatedAt` to all mutation methods. Cart repository
updated successfully.

Review repository update FAILED: `review.repository.ts` references `product_reviews.user_id`
as a foreign key, but the migration in Checkpoint 2 added a FK constraint from
`product_reviews.user_id -> users.id` with `ON DELETE CASCADE`. When running the
test suite, the seeded review data violates this constraint because 3 test reviews
reference `user_id = 999` (a user that does not exist in the test seed). Prisma
throws: `Foreign key constraint failed on the field: product_reviews_user_id_fkey`.

The root cause is that the FK constraint was added in Checkpoint 2 before the seed
data was updated (seed update is scheduled for Checkpoint 5). We need to temporarily
drop the FK constraint, complete the repository migration, then re-add it after the
seed is fixed.

---

## Checkpoint 3b: Repository Layer Recovery [~] in progress

**Entry criteria:**
- Checkpoint 3 attempted (FAILED state documented above)
- Root cause identified: FK constraint on `product_reviews.user_id` blocks test seed
- Cart repository changes from Checkpoint 3 are intact and working

**Work items:**
- [x] Create migration to temporarily drop FK on `product_reviews.user_id` (`npx prisma migrate dev --name temp_drop_review_fk`)
- [x] Fix test seed data in `prisma/seed.ts` to use valid user IDs for reviews
- [ ] Re-apply FK constraint via migration (`npx prisma migrate dev --name restore_review_fk`)
- [ ] Update `src/repositories/review.repository.ts` — new relations (retry from Checkpoint 3)
- [ ] Run unit tests for all repositories (`npm run test -- --grep repository`)

**Exit criteria:**
- All repository files compile without errors
- `npm run test -- --grep repository` passes (0 failures)
- FK constraint on `product_reviews.user_id` is active in the schema
- No Prisma deprecation warnings in test output

**Rollback:** If the temporary FK drop causes cascading issues, revert all Checkpoint 3b
migrations with `npx prisma migrate reset` on the dev database and re-apply only
Checkpoints 1-2. The repository source changes (product, order, user, cart) can be
kept as they do not depend on the review FK.

**Notes:** Recovery checkpoint created after Checkpoint 3 failed due to FK constraint
violation in test seed data. The fix requires a two-step migration: drop FK, fix seed,
re-add FK. This is safe on dev but must not be replicated in production — the production
migration plan should fix the seed data first.

---

## Checkpoint 4: API Layer [ ] pending

**Entry criteria:**
- Checkpoint 3b complete (Repository Layer Recovery)
- All repository unit tests pass
- `npm run build` succeeds

**Work items:**
- [ ] Update `src/controllers/order.controller.ts` — new response shapes
- [ ] Update `src/controllers/product.controller.ts` — renamed fields in API
- [ ] Update `src/controllers/cart.controller.ts` — new cart item structure
- [ ] Add response type mappings in `src/types/api-responses.ts`
- [ ] Run integration tests (`npm run test -- --grep integration`)

**Exit criteria:**
- All controllers compile without errors
- Integration tests pass (`npm run test -- --grep integration`)
- API response schemas match updated OpenAPI spec

---

## Checkpoint 5: Data Migration & Cleanup [ ] pending

**Entry criteria:**
- Checkpoint 4 complete
- Full test suite passes on dev
- Data migration scripts reviewed by team lead

**Work items:**
- [ ] Write backfill script for new `created_at` columns using order history timestamps
- [ ] Write script to populate `order_items.unit_price_at_purchase` from snapshot data
- [ ] Create migration to drop deprecated columns (`Orders.totalPrice`, `Users.fullName`, etc.)
- [ ] Run full test suite against migrated data
- [ ] Update seed script (`prisma/seed.ts`) to match new schema

**Exit criteria:**
- All backfill scripts run without errors on dev
- Deprecated columns removed via Prisma migration
- `npm run test` passes with zero failures
- `npm run db:seed` works with new schema
- `npm run lint` reports zero errors
