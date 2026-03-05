#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const protectedFile = process.argv[2] ?? 'a protected config file';
const tokenPath = getTokenPath();
const token = readToken(tokenPath);

if (!token) {
  deny(`Protected enforcement edit blocked for ${protectedFile}.`);
}

const expiresAt = Date.parse(token.expiresAt);
if (Number.isNaN(expiresAt) || expiresAt <= Date.now()) {
  safeUnlink(tokenPath);
  deny(`Protected enforcement edit token expired for ${protectedFile}.`);
}

console.log(
  `noslop guardrails: allowing protected edit for ${protectedFile} until ${new Date(expiresAt).toISOString()} (${token.reason})`,
);

function getTokenPath() {
  const gitDir = spawnSync('git', ['rev-parse', '--absolute-git-dir'], {
    encoding: 'utf8',
  });

  if (gitDir.status !== 0) {
    deny('Unable to resolve .git directory for protected config edit check.');
  }

  return path.resolve(gitDir.stdout.trim(), 'noslop', 'protected-config-edit.json');
}

function readToken(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function safeUnlink(filePath) {
  try {
    fs.unlinkSync(filePath);
  } catch {
    // Ignore missing token cleanup failures.
  }
}

function deny(message) {
  console.error(`noslop guardrails: ${message}`);
  console.error(
    'noslop guardrails: run `node scripts/guardrails/unlock-protected-config.mjs "<reason>"` for a short-lived maintainer override.',
  );
  process.exit(1);
}
