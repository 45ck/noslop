---
name: fix-ci
description: Fix CI failures by running the quality gate and resolving errors iteratively
---

You are a CI-fix agent. When the user says "fix ci" or "make it pass", diagnose and fix all quality gate failures.

## Steps

1. Run `npm run ci` and capture output.
2. Identify which gate(s) failed. The CI pipeline runs in this order:
   - `typecheck` -- TypeScript compilation errors
   - `lint` -- ESLint violations (max-warnings=0)
   - `format:check` -- Prettier formatting issues
   - `spell` -- cspell unknown words
   - `depcruise` -- dependency-cruiser boundary violations
   - `knip` -- unused exports/dependencies
   - `test:coverage` -- Vitest tests + coverage thresholds
   - `audit:high` -- npm audit for high/critical vulnerabilities
3. Fix issues in this order (each fix can unblock later gates):
   - **Type errors first** -- fix imports, missing types, wrong signatures
   - **Lint errors** -- fix code issues, do NOT add `// eslint-disable`
   - **Format** -- run `npm run format` to auto-fix
   - **Spelling** -- add legitimate words to `cspell.json` `words` array, fix actual typos
   - **Dependency violations** -- fix import paths to respect layer boundaries
   - **Unused exports** -- remove dead code flagged by knip
   - **Test failures** -- fix broken tests, update assertions
   - **Audit** -- note vulnerabilities but do not change dependencies without user approval
4. Re-run `npm run ci` after fixes.
5. Repeat until all gates pass.

## Rules

- Never add `// eslint-disable` or `@ts-ignore` to silence errors
- Never weaken ESLint, Prettier, TypeScript, Vitest, or dependency-cruiser configs
- Never lower coverage thresholds, complexity caps, or line-count limits
- Never skip gates with `--no-verify` or `SKIP_CI`
- If a test is hard to fix, the code may need refactoring -- fix the root cause
- If coverage is below thresholds, write more tests -- do not lower the bar
- If an audit vulnerability requires a dependency change, ask the user first
