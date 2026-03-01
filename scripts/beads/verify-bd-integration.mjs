#!/usr/bin/env node
/**
 * verify-bd-integration.mjs
 *
 * Smoke-tests the Beads/bd integration for vibe-ts.
 * Run with:  node scripts/beads/verify-bd-integration.mjs
 */

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');
const BEADS_DIR = path.join(ROOT, '.beads');
const BD_BIN_DIR =
  process.platform === 'win32'
    ? path.join(os.homedir(), 'AppData', 'Local', 'Programs', 'bd')
    : path.join(os.homedir(), '.local', 'bin');
const ENV = {
  ...process.env,
  PATH: `${BD_BIN_DIR}${path.delimiter}${process.env.PATH ?? ''}`,
};

let passed = 0;
let failed = 0;
const failures = [];

function run(cmd, args = [], opts = {}) {
  return spawnSync(cmd, args, { encoding: 'utf8', env: ENV, cwd: ROOT, ...opts });
}

function check(label, fn) {
  try {
    const result = fn();
    if (result === true || result === undefined) {
      console.log(`  ✓  ${label}`);
      passed++;
    } else {
      console.log(`  ✗  ${label}`);
      console.log(`     → ${result}`);
      failed++;
      failures.push(label);
    }
  } catch (e) {
    console.log(`  ✗  ${label}`);
    console.log(`     → ${e.message}`);
    failed++;
    failures.push(label);
  }
}

// ─── 1. Binary ────────────────────────────────────────────────────────────────
console.log('\n── 1. Binary ──');

let bdAvailable = false;
check('bd is on PATH or at known location (optional)', () => {
  const r = run('bd', ['version']);
  if (r.status !== 0) {
    console.log('     (bd binary not found -- install from github.com/steveyegge/beads)');
    return true; // warn, don't fail -- bd binary is optional for template
  }
  if (!r.stdout.includes('bd version')) return 'unexpected output: ' + r.stdout;
  bdAvailable = true;
  return true;
});

check('bd version is >= 0.55.4 (skipped if bd not installed)', () => {
  if (!bdAvailable) {
    console.log('     (skipped -- bd not installed)');
    return true;
  }
  const r = run('bd', ['version']);
  const m = r.stdout.match(/bd version (\d+\.\d+\.\d+)/);
  if (!m) return 'could not parse version from: ' + r.stdout;
  const [maj, min, patch] = m[1].split('.').map(Number);
  if (maj > 0 || (maj === 0 && min > 55) || (maj === 0 && min === 55 && patch >= 4)) return true;
  return `version ${m[1]} is below 0.55.4`;
});

// ─── 2. Config ───────────────────────────────────────────────────────────────
console.log('\n── 2. Config ──');

check('.beads/config.yaml exists', () => {
  const p = path.join(BEADS_DIR, 'config.yaml');
  return fs.existsSync(p) || 'missing ' + p;
});

check('.beads/config.yaml has issue-prefix: bead', () => {
  const p = path.join(BEADS_DIR, 'config.yaml');
  const content = fs.readFileSync(p, 'utf8');
  return (
    content.includes('issue-prefix: "bead"') ||
    content.includes("issue-prefix: 'bead'") ||
    'missing issue-prefix in config.yaml'
  );
});

check('.gitignore excludes beads.db and bd.sock', () => {
  const content = fs.readFileSync(path.join(ROOT, '.gitignore'), 'utf8');
  if (!content.includes('.beads/beads.db')) return 'missing .beads/beads.db entry';
  if (!content.includes('.beads/bd.sock')) return 'missing .beads/bd.sock entry';
  return true;
});

// ─── 3. Git hooks ─────────────────────────────────────────────────────────────
console.log('\n── 3. Git hooks ──');

check('git core.hooksPath points to .beads/hooks', () => {
  const r = run('git', ['config', 'core.hooksPath'], { cwd: ROOT });
  if (r.status !== 0) return 'git config core.hooksPath not set';
  const val = r.stdout.trim();
  if (!val.includes('.beads/hooks')) return `core.hooksPath = "${val}", expected .beads/hooks`;
  console.log(`     → core.hooksPath = ${val}`);
  return true;
});

check('.beads/hooks/ directory has hook scripts', () => {
  const p = path.join(BEADS_DIR, 'hooks');
  if (!fs.existsSync(p)) return 'missing .beads/hooks/';
  const files = fs.readdirSync(p).filter((f) => !f.endsWith('.backup'));
  if (files.length === 0) return 'no hook scripts in .beads/hooks/';
  console.log(`     → hooks: ${files.join(', ')}`);
  return true;
});

// ─── 4. Custom bd.mjs ─────────────────────────────────────────────────────────
console.log('\n── 4. Custom bd.mjs ──');

check('npm run bd -- issue list works', () => {
  // Use shell:true so npm.cmd resolves on Windows
  const r = spawnSync('npm run bd -- issue list --json', [], {
    shell: true,
    encoding: 'utf8',
    cwd: ROOT,
    env: ENV,
  });
  if (r.status !== 0) return r.stderr?.slice(0, 300) || 'exit ' + r.status;
  const jsonStart = r.stdout.indexOf('[');
  if (jsonStart === -1) return 'no JSON array in output';
  let data;
  try {
    data = JSON.parse(r.stdout.slice(jsonStart));
  } catch {
    return 'invalid JSON';
  }
  if (!Array.isArray(data)) return 'non-array result';
  console.log(`     → ${data.length} issues from bd.mjs`);
  return true;
});

check('npm run bd -- issue next works', () => {
  const r = spawnSync('npm run bd -- issue next --json', [], {
    shell: true,
    encoding: 'utf8',
    cwd: ROOT,
    env: ENV,
  });
  if (r.status !== 0) return r.stderr?.slice(0, 300) || 'exit ' + r.status;
  return true;
});

check('bd.mjs normalizePriority handles integers', () => {
  const src = fs.readFileSync(path.join(ROOT, 'scripts/beads/bd.mjs'), 'utf8');
  if (!src.includes('normalizePriority')) return 'normalizePriority not defined';
  if (!src.includes("typeof p === 'number'")) return 'integer handling missing';
  return true;
});

// ─── 5. Package scripts ───────────────────────────────────────────────────────
console.log('\n── 5. Package scripts ──');

const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
for (const script of [
  'bd',
  'bd:verify',
  'bd:sync',
  'bd:ready',
  'bd:daemon:start',
  'bd:daemon:stop',
  'bd:doctor',
  'bd:prime',
  'bd:dep',
]) {
  check(`package.json has "${script}" script`, () => {
    return script in pkg.scripts || `script "${script}" missing`;
  });
}

// ─── 6. Documentation ────────────────────────────────────────────────────────
console.log('\n── 6. Documentation ──');

check('AGENT_LOOP.md exists', () => {
  return fs.existsSync(path.join(ROOT, 'AGENT_LOOP.md')) || 'missing AGENT_LOOP.md';
});

check('AGENT_LOOP.md uses <repo-root> placeholder', () => {
  const content = fs.readFileSync(path.join(ROOT, 'AGENT_LOOP.md'), 'utf8');
  return content.includes('<repo-root>') || 'missing <repo-root> placeholder';
});

check('CLAUDE.md has bd commands', () => {
  const content = fs.readFileSync(path.join(ROOT, 'CLAUDE.md'), 'utf8');
  return content.includes('npm run bd') || 'missing bd commands in CLAUDE.md';
});

// ─── Summary ──────────────────────────────────────────────────────────────────
console.log('\n' + '─'.repeat(60));
console.log(`Result: ${passed} passed, ${failed} failed`);
if (failures.length > 0) {
  console.log('\nFailed checks:');
  for (const f of failures) console.log(`  - ${f}`);
  process.exit(1);
} else {
  console.log('\nAll checks passed. bd integration is healthy ✓');
}
