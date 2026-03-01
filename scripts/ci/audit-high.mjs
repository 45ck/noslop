#!/usr/bin/env node
/**
 * audit-high.mjs — CI gate for npm audit.
 *
 * Fails only when HIGH or CRITICAL severity vulnerabilities are found.
 * Works around npm 10.x behaviour where `npm audit --audit-level=high`
 * exits with code 1 even when no qualifying vulnerabilities exist.
 *
 * Scope: production dependencies only (--omit=dev).
 */

import { execSync } from 'child_process';

let raw;
try {
  raw = execSync('npm audit --json --omit=dev', { encoding: 'utf8' });
} catch (err) {
  // npm audit exits non-zero when ANY vulnerabilities exist; capture stdout.
  raw = err.stdout ?? '';
  if (!raw) {
    console.error('[audit-high] npm audit produced no output:', err.message);
    process.exit(1);
  }
}

let report;
try {
  // Strip BOM if present (npm on Windows occasionally emits UTF-8 BOM).
  const clean = raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw;
  report = JSON.parse(clean);
} catch {
  console.error('[audit-high] Failed to parse npm audit JSON output.');
  console.error(raw.slice(0, 500));
  process.exit(1);
}

const v = report?.metadata?.vulnerabilities ?? {};
const high = v.high ?? 0;
const critical = v.critical ?? 0;

if (high + critical > 0) {
  console.error(
    `[audit-high] FAIL — found ${high} high and ${critical} critical ` +
      `vulnerabilities in production dependencies.`,
  );
  process.exit(1);
}

const moderate = v.moderate ?? 0;
const low = v.low ?? 0;
const info = v.info ?? 0;

console.log(
  `[audit-high] PASS — no high/critical vulnerabilities in production deps. ` +
    `(moderate: ${moderate}, low: ${low}, info: ${info})`,
);
