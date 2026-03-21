# Feature Lifecycle

Every feature goes through these stages, from request to production. Each stage
has precondition checks, concrete actions, and postcondition checks that agents
can execute directly.

## 1. Requirements

**Owner:** Product manager (human) + Tech lead (validation)

**Precondition check:**

```bash
# A feature request document exists and has the required sections
grep -q "User story" docs/features/CURRENT_FEATURE.md \
  && grep -q "Acceptance criteria" docs/features/CURRENT_FEATURE.md \
  && grep -q "Scope boundaries" docs/features/CURRENT_FEATURE.md
```

**Actions:**

1. Product manager writes the feature request with user story, acceptance
   criteria, scope boundaries, and priority.
2. Tech lead reads the request and confirms it is implementable.
3. Tech lead flags any ambiguities or missing information back to product.
4. Tech lead confirms no conflicts with in-flight work by checking open PRs.

**Postcondition check:**

```bash
# Feature doc has at least 3 numbered acceptance criteria
grep -cE "^[0-9]+\." docs/features/CURRENT_FEATURE.md | awk '$1 >= 3'
```

## 2. Design

**Owner:** Tech lead

**Precondition check:**

```bash
# Requirements stage is complete (feature doc exists with acceptance criteria)
test -f docs/features/CURRENT_FEATURE.md \
  && grep -q "Acceptance criteria" docs/features/CURRENT_FEATURE.md
```

**Actions:**

1. Identify affected systems (frontend, backend, database, external services).
2. Break the feature into tasks ordered by dependency: data model first, then
   API, then UI.
3. Create tasks with acceptance criteria in the task tracker. Each task must
   reference the feature doc.
4. Assign each task to the appropriate agent using the routing table in
   `AGENTS.md`.
5. Identify risks and flag anything requiring human review.

**Postcondition check:**

```bash
# All tasks are created and assigned (check task tracker)
# At minimum, verify the decomposition doc exists
test -f docs/features/CURRENT_FEATURE_tasks.md \
  && grep -c "\- \[" docs/features/CURRENT_FEATURE_tasks.md | awk '$1 >= 1'
```

## 3. Implementation

**Owner:** Assigned dev agent (backend-dev or frontend-dev)

**Precondition check:**

```bash
# Branch exists and is up to date with main
git fetch origin main \
  && git log origin/main..HEAD --oneline | head -1
# Dependencies are installed and project builds
npm ci && npm run build
```

**Actions:**

1. Read the assigned task and the original feature request for full context.
2. Search the codebase for existing patterns to follow (`grep -r` for similar
   implementations).
3. Create a feature branch: `git checkout -b feat/{issue}-{description}`.
4. Implement the solution following the checklist in your agent doc.
5. Write tests that cover every acceptance criterion on the task.
6. Run local verification: `npm run lint && npm run test`.
7. Create a PR with description linking the task, explaining the approach, and
   listing what was changed and why.

**Postcondition check:**

```bash
# Lint passes, tests pass, build succeeds
npm run lint && npm test && npm run build
# PR exists and targets main
gh pr list --head "$(git branch --show-current)" --json number --jq '.[0].number'
```

## 4. Review

**Owner:** Tech lead + QA engineer (parallel)

**Precondition check:**

```bash
# PR exists and CI has run
PR_NUMBER=$(gh pr list --head "$(git branch --show-current)" --json number --jq '.[0].number')
gh pr checks "$PR_NUMBER" --json name,state --jq '.[] | .state' | grep -v PENDING
```

**Actions:**

1. **Tech lead** reviews for correctness, architecture, and backward
   compatibility. Leaves comments on the PR.
2. **QA engineer** reviews test coverage and test quality. Identifies missing
   scenarios and writes additional tests if needed.
3. Dev agent addresses all review comments with code changes, not just replies.
4. Reviewers re-review after changes and approve when satisfied.

**Postcondition check:**

```bash
# PR has required approvals and no open review threads
PR_NUMBER=$(gh pr list --head "$(git branch --show-current)" --json number --jq '.[0].number')
gh pr view "$PR_NUMBER" --json reviewDecision --jq '.reviewDecision' | grep -q "APPROVED"
```

## 5. Testing

**Owner:** Automated (CI) + QA engineer (staging validation)

**Precondition check:**

```bash
# PR is approved and ready to merge
PR_NUMBER=$(gh pr list --head "$(git branch --show-current)" --json number --jq '.[0].number')
gh pr view "$PR_NUMBER" --json reviewDecision --jq '.reviewDecision' | grep -q "APPROVED"
```

**Actions:**

1. CI runs the full suite: type checking, linting, unit tests, integration
   tests, coverage check, build verification.
2. Tech lead squash-merges the PR to `main` with a conventional commit message.
3. CD pipeline deploys to staging automatically.
4. QA engineer validates on staging: walks through each acceptance criterion,
   tests edge cases, checks for regressions, verifies performance.

**Postcondition check:**

```bash
# Main branch CI is green after merge
gh run list --branch main --limit 1 --json conclusion --jq '.[0].conclusion' | grep -q "success"
# QA validation log exists
test -f docs/features/CURRENT_FEATURE_qa.md
```

## 6. Deploy

**Owner:** Tech lead (initiates) + Automated (executes)

**Precondition check:**

```bash
# Staging validation passed
test -f docs/features/CURRENT_FEATURE_qa.md \
  && grep -q "APPROVED" docs/features/CURRENT_FEATURE_qa.md
# Main branch CI is green
gh run list --branch main --limit 1 --json conclusion --jq '.[0].conclusion' | grep -q "success"
```

**Actions:**

1. Tech lead triggers production deployment.
2. Pipeline runs the full test suite one more time.
3. Rolling deployment with zero downtime.
4. Automated smoke tests run against production.
5. Monitor error rates and latency for 24 hours post-deploy.
6. If any incident occurs, follow `docs/processes/incident-response.md`.

**Postcondition check:**

```bash
# Smoke tests passed
curl -sf https://app.meridian.io/health | jq -e '.status == "ok"'
# No new error spikes in the last hour (check monitoring)
# 24 hours later: no related incidents filed
```
