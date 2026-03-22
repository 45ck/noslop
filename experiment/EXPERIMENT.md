# noslop A/B Experiment

## Hypothesis

When an AI coding agent (Claude Code) operates inside a project with noslop's quality
guardrails installed, the resulting code will be measurably higher quality than when the
same agent performs the same task in an identical project without guardrails.

## Methodology

### Independent variable

**Presence of noslop quality infrastructure.** Two identical TypeScript calculator projects
are created from the same fixture. One receives `noslop install --pack typescript`; the
other remains bare.

### Controlled variables

| Variable | Value |
|---|---|
| Fixture source | `fixtures/typescript/` (5 source files, 7 tests, vitest/eslint/prettier/typescript) |
| Task prompt | Identical — see [task-prompt.md](task-prompt.md) |
| Model | `sonnet` (same for both) |
| Invocation | `claude -p --dangerously-skip-permissions --model sonnet --print` |
| Node version | Same runtime, same machine |
| npm dependencies | Same `package.json` devDependencies |

### Dependent variables (quality dimensions measured)

| Dimension | Tool | What it checks |
|---|---|---|
| Formatting | `npx prettier . --check` | Code style consistency |
| Linting | `npx eslint . --max-warnings=0` | Code quality rules, complexity caps |
| Type safety | `npx tsc -p tsconfig.json --noEmit` | TypeScript strict mode compliance |
| Tests pass | `npx vitest run` | Functional correctness |
| Test coverage | `npx vitest run --coverage` | How thoroughly code is tested |
| Spelling | `npx cspell "src/**/*"` | Typo-free identifiers and strings |
| Git hooks | `git config core.hooksPath` | Whether hooks enforce checks on commit |
| Quality infra | File existence checks | AGENTS.md, CI workflows, scripts, etc. |

---

## The Fixture: Calculator App

Both projects start as exact copies of `fixtures/typescript/`, a minimal calculator
application with clean separation of concerns.

### File structure

```
src/
  errors.ts          # DivisionByZeroError class
  operations.ts      # Pure functions: add, subtract, multiply, divide
  calculator.ts      # Calculator class wrapping operations with history
  calculator.test.ts # 7 vitest tests covering all operations + history
  index.ts           # Barrel exports
package.json         # devDeps: vitest, eslint, prettier, typescript, etc.
tsconfig.json        # ES2022, NodeNext, strict mode, noEmit
.prettierrc.json     # Default prettier config
```

### Source code (pre-experiment baseline)

**`src/errors.ts`** — Custom error class:

```typescript
export class DivisionByZeroError extends Error {
  constructor() {
    super('Cannot divide by zero');
    this.name = 'DivisionByZeroError';
  }
}
```

**`src/operations.ts`** — Pure arithmetic functions:

```typescript
import { DivisionByZeroError } from './errors.js';

export function add(a: number, b: number): number { return a + b; }
export function subtract(a: number, b: number): number { return a - b; }
export function multiply(a: number, b: number): number { return a * b; }
export function divide(a: number, b: number): number {
  if (b === 0) throw new DivisionByZeroError();
  return a / b;
}
```

**`src/calculator.ts`** — Stateful calculator with history:

```typescript
import { add, subtract, multiply, divide } from './operations.js';

export class Calculator {
  private history: number[] = [];

  add(a: number, b: number): number { /* calls add(), pushes to history */ }
  subtract(a: number, b: number): number { /* same pattern */ }
  multiply(a: number, b: number): number { /* same pattern */ }
  divide(a: number, b: number): number { /* same pattern */ }
  getHistory(): readonly number[] { return [...this.history]; }
  clearHistory(): void { this.history = []; }
}
```

**`src/calculator.test.ts`** — 7 baseline tests:

```typescript
describe('Calculator', () => {
  it('adds two numbers')
  it('subtracts two numbers')
  it('multiplies two numbers')
  it('divides two numbers')
  it('throws on division by zero')
  it('tracks history')
  it('clears history')
});
```

**`src/index.ts`** — Barrel exports:

```typescript
export { Calculator } from './calculator.js';
export { add, subtract, multiply, divide } from './operations.js';
export { DivisionByZeroError } from './errors.js';
```

---

## The Task (identical for both)

> Add a modulo (remainder) operation to the calculator. Requirements:
>
> 1. Add a `modulo` function to `src/operations.ts` that computes `a % b`
> 2. Add a `modulo` method to the Calculator class in `src/calculator.ts`
> 3. Add comprehensive tests for modulo in `src/calculator.test.ts`
> 4. Handle edge cases (division by zero for modulo should throw DivisionByZeroError)
> 5. Export the new function from `src/index.ts`
> 6. After implementing, run all quality checks available in this project and fix any issues

This task is deliberately simple enough to complete in one shot, but exercises multiple
quality dimensions:

- **Formatting** — will the new code match the existing style?
- **Linting** — will it pass eslint rules (complexity, no-any, etc.)?
- **Type safety** — proper TypeScript signatures?
- **Testing** — edge cases covered? Division by zero handled?
- **Integration** — barrel export updated?
- **Self-correction** — does the agent run quality checks and fix what it finds?

---

## What noslop adds (with-noslop only)

The `noslop install --pack typescript` command writes **17 files** into the project.
The without-noslop project has **none of these**.

### AGENTS.md — AI agent instructions

Tells Claude Code (and any AI agent) to:
- Run `noslop check --tier=fast` before every commit
- Never use `--no-verify` or `--force`
- Never modify protected paths (.githooks/, .github/workflows/, .claude/)
- Fix lint/type errors instead of disabling rules
- Never use `[skip ci]` in commit messages

### .claude/settings.json — Permission deny rules

Prevents the AI from:
- Running `--no-verify` or `--force` commands
- Editing git hooks, CI workflows, or Claude settings
- Modifying eslint, prettier, tsconfig, or vitest configs
- Overwriting AGENTS.md

```json
{
  "permissions": {
    "deny": [
      "Bash(*--no-verify*)", "Bash(*--force*)", "Bash(git push -f*)",
      "Edit(.githooks/**)", "Edit(.github/workflows/**)",
      "Edit(.claude/settings.json)", "Edit(.claude/hooks/**)",
      "Edit(eslint.config.js)", "Edit(tsconfig.json)", "Edit(vitest.config.ts)",
      "Write(eslint.config.js)", "Write(tsconfig.json)", "Write(vitest.config.ts)",
      "Write(.githooks/**)", "Write(.github/workflows/**)",
      "Write(.claude/settings.json)", "Write(AGENTS.md)"
    ]
  }
}
```

### eslint.config.js — Strict lint rules

Adds rules the bare project doesn't have:
- `complexity: 10` — cyclomatic complexity cap
- `max-depth: 4` — nesting depth cap
- `max-lines-per-function: 80` — function size cap
- `max-lines: 350` — file size cap
- `max-params: 4` — parameter count cap
- `sonarjs/cognitive-complexity: 15` — cognitive complexity cap
- `@typescript-eslint/no-explicit-any: error`
- `@typescript-eslint/no-floating-promises: error`

### .githooks/ — Git hooks (3 hooks)

**pre-commit**: Runs formatting, linting, and spell checks. Also blocks commits that
modify protected files (hooks, CI workflows, settings).

**commit-msg**: Enforces Conventional Commits format and blocks `[skip ci]` patterns.

**pre-push**: Runs typecheck and full test suite.

### .github/workflows/ — CI pipelines (2 workflows)

**quality.yml**: Runs `npm run ci` on every PR and push to main.

**guardrails.yml**: Blocks PRs that modify protected files unless they have the
`noslop-approved` label.

### scripts/ — Quality gate scripts (7 scripts)

`check`, `fmt`, `lint`, `mutation`, `spell`, `test`, `typecheck` — thin wrappers
around npm commands, used by hooks and CI.

### cspell.json — Spell checking config

Enables spell checking of source code identifiers and strings.

---

## Setup procedure

The `experiment/setup.sh` script:

1. **Clean slate** — removes any existing experiment folders (with Windows retry logic)
2. **Copy fixture** — copies `fixtures/typescript/` into both `with-noslop/` and `without-noslop/`
3. **Strip noslop traces** — removes `.noslop.json` from the bare folder
4. **Add .gitignore** — adds `node_modules/` and `coverage/` to both
5. **npm install** — installs dependencies in both
6. **Git init** — initializes git repos in both (before noslop install, which needs git)
7. **noslop install** — runs `noslop install --pack typescript` in with-noslop only
8. **Initial commit** — commits everything in both (`--no-verify` for the initial commit)

### Starting state comparison

| Aspect | with-noslop | without-noslop |
|---|---|---|
| Source files | 5 (same) | 5 (same) |
| Tests | 7 (same) | 7 (same) |
| eslint config | strict (noslop-generated) | none |
| prettier | yes | yes (.prettierrc.json) |
| cspell | yes (cspell.json) | no |
| git hooks | 3 (pre-commit, commit-msg, pre-push) | none |
| CI workflows | 2 (quality.yml, guardrails.yml) | none |
| AGENTS.md | yes (AI instructions) | no |
| .claude/settings.json | yes (permission deny rules) | no |
| core.hooksPath | `.githooks` | not set |
| Commits | 1 ("initial commit") | 1 ("initial commit") |

---

## Execution

Both Claude Code instances are launched simultaneously with identical invocations:

```bash
cd experiment/with-noslop
claude -p --dangerously-skip-permissions --model sonnet --print "<task-prompt>"

cd experiment/without-noslop
claude -p --dangerously-skip-permissions --model sonnet --print "<task-prompt>"
```

### Flag explanation

| Flag | Purpose |
|---|---|
| `-p` / `--print` | Non-interactive mode: execute and print response |
| `--dangerously-skip-permissions` | Skip all permission prompts (automated run) |
| `--model sonnet` | Use same model for both (fair comparison) |

---

## Comparison procedure

The `experiment/compare.sh` script runs after both Claude instances finish. For each
folder it checks:

1. **Formatting** — `npx prettier . --check` (PASS/FAIL)
2. **Linting** — `npx eslint . --max-warnings=0` (PASS/FAIL/SKIP if no config)
3. **Type checking** — `npx tsc -p tsconfig.json --noEmit` (PASS/FAIL)
4. **Tests** — `npx vitest run` (PASS/FAIL + count)
5. **Test coverage** — `npx vitest run --coverage` (coverage table)
6. **Spell checking** — `npx cspell "src/**/*"` (PASS/FAIL/SKIP if no config)
7. **Git hooks** — `git config core.hooksPath` (configured or not)
8. **Quality infrastructure** — checks for AGENTS.md, .claude/settings.json, CI workflows, scripts, cspell.json
9. **Git diff from initial commit** — shows what Claude changed

---

## Expected outcomes

### with-noslop (guardrails active)

- AGENTS.md tells Claude what quality standards to follow
- Git hooks run formatting, linting, spell checking on every commit attempt
- If Claude's code fails a check, the commit is rejected and Claude must fix it
- .claude/settings.json prevents Claude from weakening configs or bypassing hooks
- The strict eslint config catches complexity, type safety, and style issues
- cspell catches typos in identifiers

**Expected result**: Claude iterates until all checks pass. Clean, well-formatted,
fully-tested code with proper error handling.

### without-noslop (bare repo)

- No AGENTS.md — Claude has no project-specific quality instructions
- No git hooks — commits succeed regardless of code quality
- No eslint config — no linting feedback
- No cspell — no spell checking
- No .claude/settings.json — no permission restrictions
- Claude may or may not run quality checks (the prompt says "run all quality checks
  available" but with nothing configured, there may be nothing to run)

**Expected result**: Claude implements the feature but may skip quality steps, leave
formatting inconsistencies, miss edge cases in tests, or produce code that wouldn't
pass a strict review.

---

## Reproducibility

To reproduce this experiment:

```bash
# 1. Build the noslop CLI
npm run build

# 2. Set up both project folders
bash experiment/setup.sh

# 3. Run Claude Code in both (requires claude CLI installed)
bash experiment/run.sh

# 4. Compare quality results
bash experiment/compare.sh
```

All scripts are deterministic. The only variable is Claude's non-deterministic output,
which is why running multiple trials would strengthen conclusions.

---

## Results (Trial 1 — 2026-03-22)

### Claude output summary

| Aspect | with-noslop | without-noslop |
|---|---|---|
| Files changed | 4 | 4 |
| Lines added | 53 (+) / 2 (-) | 58 (+) / 2 (-) |
| `modulo` function | Yes, with DivisionByZeroError | Yes, with DivisionByZeroError |
| Calculator method | Yes, follows existing pattern | Yes, follows existing pattern |
| Barrel export updated | Yes | Yes |
| Test count (new) | 7 modulo tests (14 total) | 8 modulo tests (15 total) |

### Quality check results

| Check | with-noslop | without-noslop |
|---|---|---|
| Formatting (prettier) | PASS | PASS |
| Linting (eslint) | PASS (strict config) | SKIP (no config) |
| Type checking (tsc) | PASS | PASS |
| Tests (vitest) | PASS — 14 tests | PASS — 15 tests |
| Coverage | 100% statements, branches, functions, lines | 100% statements, branches, functions, lines |
| Spell checking (cspell) | PASS — 0 issues | SKIP (no config) |
| Git hooks | Active (core.hooksPath = .githooks) | Not configured |

### Cross-validation

To determine whether the without-noslop code _would_ pass strict checks if they existed,
the with-noslop eslint config and cspell config were temporarily copied into the
without-noslop folder and run:

| Cross-check | Result |
|---|---|
| without-noslop code vs strict eslint | PASS |
| without-noslop code vs cspell | PASS — 0 issues |

### Code diff comparison

Both instances produced nearly identical `operations.ts` and `calculator.ts` code:

```typescript
// operations.ts — IDENTICAL in both
export function modulo(a: number, b: number): number {
  if (b === 0) {
    throw new DivisionByZeroError();
  }
  return a % b;
}

// calculator.ts — IDENTICAL in both
modulo(a: number, b: number): number {
  const result = modulo(a, b);
  this.history.push(result);
  return result;
}

// index.ts — IDENTICAL in both
export { add, subtract, multiply, divide, modulo } from './operations.js';
```

Test suites differ slightly:

| Test case | with-noslop | without-noslop |
|---|---|---|
| Positive remainder (10 % 3) | Yes | Yes |
| Even divisibility (9 % 3) | Yes | Yes |
| Dividend < divisor (3 % 10) | Yes | Yes |
| Negative dividend (-7 % 3) | Yes | Yes |
| Negative divisor (7 % -3) | Yes | Yes |
| Both negative (-7 % -3) | No | Yes |
| Division by zero throws | Yes | Yes |
| Result in history | Yes | Yes |

The without-noslop version included one additional edge case (both operands negative).

---

## Analysis

### What this trial shows

For a **simple, well-defined task** on a **clean codebase**, both instances performed
comparably well. Sonnet produced correct, well-formatted, well-tested code regardless
of whether guardrails were present. The without-noslop version even had one more test.

### What this trial does NOT show

This was the best-case scenario for the bare repo: a trivial addition to a clean project.
noslop's value compounds with:

1. **Complexity** — As tasks grow (multi-file refactors, architecture changes, 500+ line
   files), the probability of quality failures increases. Guardrails provide feedback loops
   that catch issues the agent might not notice.

2. **Accumulated drift** — Over many commits, small quality erosions stack. Without
   enforced checks, formatting drifts, types weaken, test coverage drops. With noslop,
   every commit must pass the same bar.

3. **Adversarial scenarios** — When an agent encounters a difficult bug, it may be
   tempted to `--no-verify` a commit, disable an eslint rule, or `@ts-ignore` a type
   error. noslop's deny rules make these shortcuts impossible.

4. **Multi-agent collaboration** — When multiple agents (or humans + agents) work on the
   same repo, shared enforcement ensures consistent quality regardless of who committed.

5. **The "no config to run" problem** — The without-noslop instance was told to "run all
   quality checks available" but had no eslint, no cspell, no hooks. It could only check
   prettier, tsc, and tests. The noslop project had 6 quality dimensions actively checked.

### Infrastructure gap (the real difference)

Even though both produced clean code _this time_, the projects are fundamentally different:

| Infrastructure | with-noslop | without-noslop |
|---|---|---|
| Linting enforced | Yes — pre-commit hook + CI | No |
| Formatting enforced | Yes — pre-commit hook + CI | No (prettier exists but isn't enforced) |
| Spell checking enforced | Yes — pre-commit hook + CI | No |
| Conventional Commits enforced | Yes — commit-msg hook | No |
| Type checking enforced | Yes — pre-push hook + CI | No |
| Tests enforced | Yes — pre-push hook + CI | No |
| Config tampering blocked | Yes — deny rules + guardrails.yml | No |
| AI bypass attempts blocked | Yes — deny rules | No |
| Quality documented for agents | Yes — AGENTS.md | No |

The with-noslop project will maintain quality on the next 100 commits. The without-noslop
project has no mechanism to prevent quality degradation on commit #2.

---

## Recommended follow-up experiments

To better demonstrate noslop's value, future trials should test:

1. **Larger task** — "Refactor the calculator to support expression parsing" (multi-file,
   higher complexity, more opportunities for quality failures)

2. **Accumulated commits** — Run 5-10 sequential tasks on both projects and measure
   quality drift over time

3. **Adversarial task** — "Fix this bug as fast as possible" with a tricky type error
   that tempts `@ts-ignore` or `--no-verify`

4. **Config weakening** — "The eslint rule is too strict, disable it" (noslop blocks this;
   bare repo allows it)

5. **Multiple models** — Repeat with haiku (weaker model) where guardrails matter more

6. **Multiple trials** — Run the same task 5+ times to account for non-determinism
