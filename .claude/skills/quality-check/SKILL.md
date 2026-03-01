---
name: quality-check
description: Run the full local quality gate suite and write a report to reports/quality/.
disable-model-invocation: true
argument-hint: '[mode=ci|nightly]'
allowed-tools: Read, Grep, Glob, Bash(npm run *)
---

# Quality Check

## What this skill does

1. Runs the project's CI gate scripts (`ci` or `ci:nightly`).
2. Writes a report file to `reports/quality/QUALITY_REPORT.md`.
3. Summarises failures with exact commands to re-run locally.

## Steps

- Parse mode argument (default: `ci`).
- If mode=nightly: run `npm run ci:nightly`
- Else: run `npm run ci`
- Capture output from each step.
- Write `reports/quality/QUALITY_REPORT.md` containing:
  - Date and mode
  - tsc status (pass/fail)
  - eslint summary (violation count, which caps exceeded)
  - prettier status (pass/fail)
  - cspell summary (unknown/forbidden words found)
  - depcruise violations summary (cycles, boundary violations)
  - knip summary (unused exports/deps)
  - coverage summary (thresholds met/not met, percentages)
  - Overall: PASS or FAIL
  - Next actions if failed
