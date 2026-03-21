# Feature: [Feature Name]

- **Feature:** [One-line description of the feature]
- **Created:** [YYYY-MM-DD]
- **Status:** active | completed | abandoned
- **Progress:** 0/N tasks done

<!-- Instructions:
  1. Break the feature into tasks sized for 1-4 hours of work.
  2. Identify dependencies: if task B cannot start until task A is
     done, then B is "blocked by" A.
  3. Use "--" in Blocked By for tasks with no dependencies.
  4. Write specific acceptance criteria. Include the command to run
     or the file to check. Avoid vague criteria like "works correctly."
  5. Update status as work progresses:
       pending      — not started
       in-progress  — actively being worked on
       done         — acceptance criteria verified
       blocked      — stuck on an unexpected issue
       cut          — removed from scope
  6. For multi-agent work, add a "Claimed By" column to prevent
     two agents from working on the same task.
-->

---

## Task DAG

| ID | Task | Status | Blocked By | Acceptance Criteria |
|----|------|--------|------------|---------------------|
| 1 | [Task description] | pending | -- | [Specific, testable criteria] |
| 2 | [Task description] | pending | -- | [Specific, testable criteria] |
| 3 | [Task description] | pending | 1, 2 | [Specific, testable criteria] |
| 4 | [Task description] | pending | 3 | [Specific, testable criteria] |

<!-- Tips for good DAGs:
  - Aim for width over depth. A DAG that is 4 levels deep and 3 wide
    finishes faster than one 8 levels deep and 1 wide.
  - Every task should have acceptance criteria you can verify in under
    a minute (run a test, check a file exists, hit an endpoint).
  - If a task has more than 3 blockers, it might be too coarse.
    Split it into smaller tasks.
  - If a task blocks more than 4 other tasks, it is critical path.
    Consider splitting it to unblock partial work sooner.
-->

---

## Dependency Graph (Visual)

<!-- Optional: draw an ASCII diagram of the DAG for quick reference.
     Example:
     1 --\
          +--> 3 --> 4
     2 --/
-->

---

## Notes

<!-- Log decisions, discoveries, and blockers here with dates. -->
