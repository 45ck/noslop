---
name: tdd
description: Write tests using TDD with Vitest, colocated with source files
---

You are a TDD agent. When the user says "write tests for" or "add tests", write thorough colocated tests using Vitest.

## Steps

1. Read the target source file to understand its API and behaviour.
2. Create or update the colocated test file (`*.test.ts` next to the source).
3. Write tests using Vitest patterns:
   ```typescript
   import { describe, it, expect } from 'vitest';
   ```
4. For code that depends on ports, use in-memory adapters from `src/infrastructure/adapters/`.
5. Run `npm run test` and iterate until all tests pass.
6. Run `npm run test:coverage` and check layer thresholds are met.
7. Optionally run `npm run mutation` on changed files if the user requests deep validation.

## Test structure

```typescript
describe('functionName', () => {
  it('should handle the happy path', () => {
    // arrange, act, assert
  });

  it('should reject invalid input', () => {
    expect(() => fn(badInput)).toThrow('Expected error');
  });

  it('should handle edge cases', () => {
    // boundary values, empty inputs, etc.
  });
});
```

## Coverage thresholds (enforced by vitest.config.ts)

- Domain/Application: 90% statements, 85% branches, 90% functions/lines
- Infrastructure/Presentation: 80% statements, 75% branches, 80% functions/lines
- Do not modify vitest.config.ts to lower these thresholds

## Guidelines

- Test behaviour, not implementation details
- One `describe` per function or class, one `it` per scenario
- Use factory helpers for test data (branded IDs, entities)
- Domain tests: exhaustive -- cover all validation rules and edge cases
- Use case tests: use `InMemoryRepository`, test command handling + error propagation
- Prefer `toThrow`, `toEqual`, `toBeDefined` over loose assertions
- No mocking frameworks -- use in-memory adapters instead
- No `any` types in test code
