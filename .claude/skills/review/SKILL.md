---
name: review
description: Run a formal inspection-style review using a checklist, producing a review record.
disable-model-invocation: true
argument-hint: '[prTitle]'
allowed-tools: Read, Grep, Glob
---

# Formal Review Gate (Fagan-style)

## Outputs

- `reports/review/INSPECTION_RECORD.md`

## Entry criteria (must ALL be true before review starts)

- All CI checks pass (`npm run ci` green).
- Tests exist for changed domain logic.
- Contracts documented for changed public APIs.

## Review checklist

### Design correctness

- [ ] Architecture boundaries respected (domain independent of infra)
- [ ] Invariants stated and enforced
- [ ] Error handling explicit (no swallowed errors)
- [ ] No new circular dependencies

### Code correctness

- [ ] No unsafe promise usage (no-floating-promises)
- [ ] Complexity caps respected
- [ ] No `any` or `ts-ignore` without documented justification
- [ ] Domain primitives used (no raw strings for IDs)

### Test adequacy

- [ ] Boundary tests added for new contracts
- [ ] Mutation score acceptable for changed areas
- [ ] Regression tests for bugfixes

### Documentation

- [ ] API docs updated if public surface changed
- [ ] README updated if setup or usage changed

## Exit criteria (must ALL be true before merge)

- All defects resolved or documented with explicit rationale.
- CI passes green.
