#!/usr/bin/env node
// Cross-platform replacement for: git rev-parse --git-dir >/dev/null 2>&1 && git config core.hooksPath .githooks || true
import { spawnSync } from 'node:child_process';

const check = spawnSync('git', ['rev-parse', '--git-dir'], { stdio: 'ignore' });
if (check.status === 0) {
  spawnSync('git', ['config', 'core.hooksPath', '.githooks'], { stdio: 'inherit' });
}
