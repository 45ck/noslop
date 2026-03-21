# Code Review Standards

Code review is how we maintain quality, share knowledge, and catch mistakes before
they reach users. Every PR gets at least one review before merge.

## What the reviewer checks

Reviews evaluate five dimensions, in order of priority:

1. **Correctness:** Does the code do what it's supposed to? Does it handle edge cases?
2. **Tests:** Are the new behaviors tested? Are the tests meaningful?
3. **Security:** Are there auth checks? Input validation? Injection risks?
4. **Performance:** Any N+1 queries? Unnecessary re-renders? Missing indexes?
5. **Readability:** Can someone unfamiliar with this code understand it in 5 minutes?

## Review checklist

### Correctness
- [ ] Code solves the stated problem.
- [ ] All acceptance criteria from the task are addressed.
- [ ] Edge cases are handled (empty input, null, boundary values).
- [ ] Error paths return appropriate errors (not silent failures).

### Tests
- [ ] New behavior has corresponding tests.
- [ ] Tests cover happy path, error cases, and edge cases.
- [ ] Tests are deterministic (no flaky timing or ordering dependencies).
- [ ] Test descriptions clearly state the expected behavior.
- [ ] Coverage has not decreased.

### Security
- [ ] Authentication required on all new endpoints.
- [ ] Authorization checks prevent accessing other users' data.
- [ ] User input is validated and sanitized before use.
- [ ] No secrets, tokens, or credentials in the code.
- [ ] SQL queries use parameterized statements (no string interpolation).

### Performance
- [ ] Database queries are efficient (no N+1, appropriate indexes).
- [ ] Large datasets use pagination, not unbounded queries.
- [ ] Expensive operations are cached or queued for background processing.
- [ ] React components don't re-render unnecessarily.

### Readability
- [ ] Variable and function names are descriptive.
- [ ] Complex logic has comments explaining the "why."
- [ ] Functions are small and focused (single responsibility).
- [ ] No dead code, commented-out code, or leftover debugging.

## How to give feedback

- **Be specific.** "This could be clearer" is unhelpful. "Rename `processData` to
  `validateAndTransformWorkflowInput` to clarify what it does" is actionable.
- **Suggest alternatives.** Don't just say what's wrong — show what "right" looks like.
- **Distinguish nits from blockers.** Prefix minor suggestions with "Nit:" so the
  author knows they can merge without addressing it.
- **Ask questions instead of making demands.** "What happens if `items` is empty
  here?" is better than "You forgot to handle empty arrays."
- **Acknowledge good work.** If something is well-designed or clever in a good way,
  say so.

## Approval criteria

A PR can be merged when:

1. All **blocker** comments are resolved (not just replied to — actually fixed).
2. CI is green (all checks pass).
3. At least one approval from a reviewer.
4. For database changes: approval from the tech lead specifically.
5. For auth/security changes: approval from the tech lead specifically.

## Turnaround expectations

- **First response:** Within 4 hours during business hours.
- **Follow-up after changes:** Within 2 hours.
- **If you can't review in time:** Comment on the PR saying when you'll get to it,
  or ask someone else to cover.

Long review cycles kill momentum. If a PR has been waiting more than 8 hours, the
tech lead should reassign the review or unblock it.
