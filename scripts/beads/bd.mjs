import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const VALID_PRIORITIES = ['P0', 'P1', 'P2', 'P3'];
const PRIORITY_ORDER = { P0: 0, P1: 1, P2: 2, P3: 3, 0: 0, 1: 1, 2: 2, 3: 3, undefined: 4 };
// Upstream bd exports integer priorities (0=P0, 1=P1, …) via bd sync.
// normalizePriority converts either format to 'P0'..'P3' for display/comparison.
function normalizePriority(p) {
  if (p === null || p === undefined) return undefined;
  if (typeof p === 'number') return `P${p}`;
  return p;
}

function usage() {
  const lines = [
    'Beads (bd) - local issue tracker',
    '',
    'Usage:',
    '  bd issue list   [--open] [--phase <phase>] [--priority <P0|P1|P2|P3>]',
    '                  [--claimed|--unclaimed|--claimed-by <owner>] [--json]',
    '  bd issue next   [--phase <phase>] [--priority <P0|P1|P2|P3>]',
    '                  [--claimed|--unclaimed|--claimed-by <owner>] [--json]',
    '  bd issue view   <id>',
    '  bd issue create --title "..." [--priority P0] [--phase <phase>] [--blocked-by "id1,id2"] [--body "..."] [--json]',
    '  bd issue close  <id> [--json]',
    '  bd issue reopen <id> [--json]',
    '  bd issue start  <id> --by "<owner>"',
    '  bd issue finish <id> [--no-merge]',
    '  bd issue claim  <id> --by "<owner>" [--force] [--json]',
    '  bd issue unclaim <id> [--by "<owner>"] [--force] [--json]',
    '  bd issue update <id> [--title "..."] [--status open|closed] [--priority <P0|P1|P2|P3>]',
    '                       [--phase <phase>] [--blocked-by "id1,id2"] [--add-blocked-by "id1,id2"]',
    '                       [--remove-blocked-by "id1,id2"] [--body "..."] [--json]',
    '',
    'Fields:',
    '  priority   P0 (must-have) | P1 (important) | P2 (nice-to-have) | P3 (future)',
    '  phase      devenv | domain | application | infrastructure | presentation |',
    '             integration | governance | security | release | cross-cutting',
    '  blockedBy  comma-separated list of bead IDs that must be closed first',
    '  claimedBy  current owner actively working this bead',
    '  claimedAt  UTC timestamp when the bead was claimed',
    '  body       free-text description / acceptance criteria',
    '',
    'Commands:',
    '  next       shows open beads with no unresolved blockers, sorted by priority',
    '  view       shows all fields of a bead including body and blockers',
    '',
    'Notes:',
    '  - Issues are stored in .beads/issues.jsonl (JSON Lines).',
    '  - Commit .beads/issues.jsonl with code changes (project rule).',
  ];
  process.stdout.write(lines.join('\n') + '\n');
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

function nowIsoUtc() {
  return new Date().toISOString();
}

function spawnGit(args, cwd) {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8' });
  return { status: r.status ?? 1, stdout: r.stdout ?? '', stderr: r.stderr ?? '' };
}

function repoRoot() {
  return process.cwd();
}

function beadsDir(root) {
  return path.join(root, '.beads');
}

function issuesPath(root) {
  return path.join(beadsDir(root), 'issues.jsonl');
}

function ensureBeadsDir(root) {
  fs.mkdirSync(beadsDir(root), { recursive: true });
}

function readIssues(root) {
  const filePath = issuesPath(root);
  if (!fs.existsSync(filePath)) return [];
  const raw = fs.readFileSync(filePath, 'utf8');
  const lines = raw.split('\n').filter((l) => l.trim().length > 0);

  const issues = [];
  for (const [idx, line] of lines.entries()) {
    try {
      const parsed = JSON.parse(line);
      issues.push(parsed);
    } catch {
      throw new Error(`Invalid JSON in ${path.relative(root, filePath)} at line ${idx + 1}.`);
    }
  }
  return issues;
}

function writeIssues(root, issues) {
  ensureBeadsDir(root);
  const filePath = issuesPath(root);
  const lines = issues.map((i) => JSON.stringify(i));
  fs.writeFileSync(filePath, lines.join('\n') + '\n', 'utf8');
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function nextIssueId(issues) {
  let max = 0;
  for (const issue of issues) {
    const id = issue?.id;
    if (typeof id !== 'string') continue;
    const m = /^bead-(\d{4})$/.exec(id);
    if (!m) continue;
    const n = Number(m[1]);
    if (Number.isFinite(n) && n > max) max = n;
  }
  const next = max + 1;
  return `bead-${String(next).padStart(4, '0')}`;
}

function findIssueIndex(issues, id) {
  const idx = issues.findIndex((i) => i?.id === id);
  if (idx < 0) throw new Error(`Issue not found: ${id}`);
  return idx;
}

function readOption(argv, name) {
  const idx = argv.indexOf(name);
  if (idx < 0) return null;
  const value = argv[idx + 1];
  if (!isNonEmptyString(value)) throw new Error(`Missing value for ${name}.`);
  return value;
}

function parseBlockedBy(raw) {
  if (!raw) return undefined;
  const ids = raw
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  if (ids.length === 0) return undefined;
  for (const id of ids) {
    if (!/^bead-\d{4}$/.test(id)) throw new Error(`Invalid bead ID in --blocked-by: "${id}"`);
  }
  return ids;
}

function getClaimedBy(issue) {
  if (!isNonEmptyString(issue?.claimedBy)) return null;
  return issue.claimedBy.trim();
}

function hasClaim(issue) {
  return getClaimedBy(issue) !== null;
}

function readClaimFilters(argv) {
  const claimedOnly = argv.includes('--claimed');
  const unclaimedOnly = argv.includes('--unclaimed');
  if (claimedOnly && unclaimedOnly) {
    throw new Error('Cannot combine --claimed and --unclaimed.');
  }

  const claimedByRaw = readOption(argv, '--claimed-by');
  const claimedBy = claimedByRaw ? claimedByRaw.trim() : null;

  return { claimedOnly, unclaimedOnly, claimedBy };
}

function applyClaimFilters(issues, claimFilters) {
  let result = issues;
  if (claimFilters.claimedOnly) result = result.filter((issue) => hasClaim(issue));
  if (claimFilters.unclaimedOnly) result = result.filter((issue) => !hasClaim(issue));
  if (claimFilters.claimedBy) {
    result = result.filter((issue) => getClaimedBy(issue) === claimFilters.claimedBy);
  }
  return result;
}

/** Return true if the issue is unblocked (no open prerequisites). */
function isUnblocked(issue, closedIds) {
  const blockedBy = issue.blockedBy;
  if (!blockedBy || blockedBy.length === 0) return true;
  return blockedBy.every((dep) => closedIds.has(dep));
}

function prioritySortKey(issue) {
  return PRIORITY_ORDER[normalizePriority(issue.priority)] ?? PRIORITY_ORDER['undefined'];
}

/** Sort: priority asc (P0 first), then createdAt asc. */
function sortByPriority(issues) {
  return [...issues].sort((a, b) => {
    const pd = prioritySortKey(a) - prioritySortKey(b);
    if (pd !== 0) return pd;
    return (a.createdAt ?? '').localeCompare(b.createdAt ?? '');
  });
}

function formatPriority(p) {
  const n = normalizePriority(p);
  if (!n) return '  --';
  return n;
}

function formatClaimSuffix(issue) {
  const claimedBy = getClaimedBy(issue);
  if (!claimedBy) return '';
  return ` [claimed:${claimedBy}]`;
}

function print(value, jsonFlag) {
  if (jsonFlag) {
    process.stdout.write(JSON.stringify(value, null, 2) + '\n');
    return;
  }

  if (Array.isArray(value)) {
    for (const v of value) {
      const pri = formatPriority(v.priority);
      const phase = v.phase ? ` [${v.phase}]` : '';
      const claim = formatClaimSuffix(v);
      process.stdout.write(`${v.id} ${pri} [${v.status}]${phase}${claim} ${v.title}\n`);
    }
    return;
  }

  if (value && typeof value === 'object') {
    const pri = formatPriority(value.priority);
    const phase = value.phase ? ` [${value.phase}]` : '';
    const claim = formatClaimSuffix(value);
    process.stdout.write(`${value.id} ${pri} [${value.status}]${phase}${claim} ${value.title}\n`);
    return;
  }

  process.stdout.write(String(value) + '\n');
}

function printView(issue) {
  const lines = [
    `ID:        ${issue.id}`,
    `Title:     ${issue.title}`,
    `Status:    ${issue.status}`,
    `Priority:  ${normalizePriority(issue.priority) ?? '(unset)'}`,
    `Phase:     ${issue.phase ?? '(unset)'}`,
    `BlockedBy: ${issue.blockedBy?.join(', ') ?? '(none)'}`,
    `ClaimedBy: ${issue.claimedBy ?? '(none)'}`,
    `ClaimedAt: ${issue.claimedAt ?? '(none)'}`,
    `Created:   ${issue.createdAt}`,
    `Updated:   ${issue.updatedAt}`,
    '',
    issue.body ? issue.body : '(no body)',
  ];
  process.stdout.write(lines.join('\n') + '\n');
}

function applyUpdate(issues, id, changes) {
  const idx = findIssueIndex(issues, id);
  const issue = issues[idx];
  issues[idx] = { ...issue, ...changes, updatedAt: nowIsoUtc() };
  return issues[idx];
}

function buildUpdateChanges(argv, existingIssue) {
  const changes = {};

  const title = readOption(argv, '--title');
  if (title) changes.title = title.trim();

  const status = readOption(argv, '--status');
  if (status) {
    if (status !== 'open' && status !== 'closed') {
      throw new Error(`Invalid status "${status}". Expected "open" or "closed".`);
    }
    changes.status = status;
    if (status === 'closed') {
      changes.claimedBy = undefined;
      changes.claimedAt = undefined;
    }
  }

  const priority = readOption(argv, '--priority');
  if (priority) {
    if (!VALID_PRIORITIES.includes(priority)) {
      throw new Error(
        `Invalid priority "${priority}". Expected one of: ${VALID_PRIORITIES.join(', ')}.`,
      );
    }
    changes.priority = priority;
  }

  const phase = readOption(argv, '--phase');
  if (phase) changes.phase = phase.trim();

  const body = readOption(argv, '--body');
  if (body) changes.body = body.trim();

  // --blocked-by replaces entirely
  const blockedByRaw = readOption(argv, '--blocked-by');
  if (blockedByRaw !== null) {
    const parsed = parseBlockedBy(blockedByRaw);
    changes.blockedBy = parsed ?? [];
  }

  // --add-blocked-by merges
  const addRaw = readOption(argv, '--add-blocked-by');
  if (addRaw !== null) {
    const toAdd = parseBlockedBy(addRaw) ?? [];
    const current = changes.blockedBy ?? existingIssue.blockedBy ?? [];
    changes.blockedBy = [...new Set([...current, ...toAdd])];
  }

  // --remove-blocked-by removes
  const removeRaw = readOption(argv, '--remove-blocked-by');
  if (removeRaw !== null) {
    const toRemove = new Set(parseBlockedBy(removeRaw) ?? []);
    const current = changes.blockedBy ?? existingIssue.blockedBy ?? [];
    changes.blockedBy = current.filter((id) => !toRemove.has(id));
  }

  return changes;
}

function main() {
  const root = repoRoot();
  const rawArgv = process.argv.slice(2);

  if (rawArgv.length === 0 || rawArgv.includes('--help') || rawArgv.includes('-h')) {
    usage();
    return;
  }

  const asJson = rawArgv.includes('--json');

  // Split into positional args (non-flag) and flags
  const positional = rawArgv.filter((a) => !a.startsWith('--'));
  const [noun, verb, ...rest] = positional;

  if (noun !== 'issue') {
    fail(`Unknown noun "${noun}". Expected "issue".\n\nRun: bd --help`);
  }

  const issues = readIssues(root);

  // ── list ──────────────────────────────────────────────────────────────────
  if (verb === 'list') {
    const filterPhase = readOption(rawArgv, '--phase');
    const filterPriority = readOption(rawArgv, '--priority');
    const claimFilters = readClaimFilters(rawArgv);
    const openOnly = rawArgv.includes('--open');

    let result = issues;
    if (openOnly) result = result.filter((i) => i.status === 'open');
    if (filterPhase) result = result.filter((i) => i.phase === filterPhase);
    if (filterPriority)
      result = result.filter((i) => normalizePriority(i.priority) === filterPriority);
    result = applyClaimFilters(result, claimFilters);

    print(result, asJson);
    return;
  }

  // ── next ──────────────────────────────────────────────────────────────────
  if (verb === 'next') {
    const filterPhase = readOption(rawArgv, '--phase');
    const filterPriority = readOption(rawArgv, '--priority');
    const claimFilters = readClaimFilters(rawArgv);

    const closedIds = new Set(issues.filter((i) => i.status === 'closed').map((i) => i.id));

    let ready = issues.filter((i) => i.status === 'open').filter((i) => isUnblocked(i, closedIds));

    if (filterPhase) ready = ready.filter((i) => i.phase === filterPhase);
    if (filterPriority)
      ready = ready.filter((i) => normalizePriority(i.priority) === filterPriority);
    ready = applyClaimFilters(ready, claimFilters);

    ready = sortByPriority(ready);

    if (asJson) {
      print(ready, true);
    } else {
      if (ready.length === 0) {
        process.stdout.write('No ready beads found.\n');
      } else {
        process.stdout.write(`Ready to work on (${ready.length} beads):\n\n`);
        for (const v of ready) {
          const pri = formatPriority(v.priority);
          const phase = v.phase ? ` [${v.phase}]` : '';
          const claim = formatClaimSuffix(v);
          process.stdout.write(`  ${v.id} ${pri}${phase}${claim} ${v.title}\n`);
        }
      }
    }
    return;
  }

  // ── view ──────────────────────────────────────────────────────────────────
  if (verb === 'view') {
    const id = rest[0];
    if (!isNonEmptyString(id)) fail('Missing issue id for issue view.');
    const idx = findIssueIndex(issues, id);
    if (asJson) {
      process.stdout.write(JSON.stringify(issues[idx], null, 2) + '\n');
    } else {
      printView(issues[idx]);
    }
    return;
  }

  // ── claim ───────────────────────────────────────────────────────────────
  if (verb === 'claim') {
    const id = rest[0];
    if (!isNonEmptyString(id)) fail('Missing issue id for issue claim.');

    const claimedByRaw = readOption(rawArgv, '--by');
    if (!claimedByRaw) fail('Missing --by for issue claim.');
    const claimedBy = claimedByRaw.trim();
    const force = rawArgv.includes('--force');

    const idx = findIssueIndex(issues, id);
    const issue = issues[idx];
    if (issue.status !== 'open') {
      fail(`Cannot claim non-open issue: ${id} is ${issue.status}.`);
    }

    const existingClaim = getClaimedBy(issue);
    if (existingClaim && existingClaim !== claimedBy && !force) {
      fail(`Issue ${id} is already claimed by "${existingClaim}". Use --force to reassign.`);
    }

    const now = nowIsoUtc();
    issues[idx] = { ...issue, claimedBy, claimedAt: now, updatedAt: now };
    writeIssues(root, issues);
    print(issues[idx], asJson);
    return;
  }

  // ── unclaim ─────────────────────────────────────────────────────────────
  if (verb === 'unclaim') {
    const id = rest[0];
    if (!isNonEmptyString(id)) fail('Missing issue id for issue unclaim.');

    const byRaw = readOption(rawArgv, '--by');
    const by = byRaw ? byRaw.trim() : null;
    const force = rawArgv.includes('--force');

    const idx = findIssueIndex(issues, id);
    const issue = issues[idx];
    const existingClaim = getClaimedBy(issue);
    if (!existingClaim) fail(`Issue ${id} is not claimed.`);

    if (by && existingClaim !== by && !force) {
      fail(`Issue ${id} is claimed by "${existingClaim}", not "${by}". Use --force to clear.`);
    }

    const updated = applyUpdate(issues, id, { claimedBy: undefined, claimedAt: undefined });
    writeIssues(root, issues);
    print(updated, asJson);
    return;
  }

  // ── start ─────────────────────────────────────────────────────────────────
  if (verb === 'start') {
    const id = rest[0];
    if (!isNonEmptyString(id)) fail('Missing issue id for issue start.');

    const claimedByRaw = readOption(rawArgv, '--by');
    if (!claimedByRaw) fail('Missing --by for issue start.');
    const claimedBy = claimedByRaw.trim();

    const idx = findIssueIndex(issues, id);
    const issue = issues[idx];
    if (issue.status !== 'open') fail(`Cannot start non-open bead: ${id} is ${issue.status}.`);

    const worktreePath = path.join(root, '.trees', id);
    if (fs.existsSync(worktreePath)) {
      fail(`Worktree already exists at .trees/${id}. Remove it or run issue finish.`);
    }

    const closedIds = new Set(issues.filter((i) => i.status === 'closed').map((i) => i.id));
    if (!isUnblocked(issue, closedIds)) {
      const openBlockers = (issue.blockedBy ?? []).filter((dep) => !closedIds.has(dep));
      fail(`Bead ${id} is blocked by: ${openBlockers.join(', ')}`);
    }

    const gitResult = spawnGit(
      ['worktree', 'add', '-b', id, path.join('.trees', id), 'main'],
      root,
    );
    if (gitResult.status !== 0) {
      fail(`git worktree add failed:\n${gitResult.stderr}`);
    }

    const now = nowIsoUtc();
    issues[idx] = { ...issue, claimedBy, claimedAt: now, updatedAt: now };
    writeIssues(root, issues);

    if (!asJson) {
      process.stdout.write(`Started ${id}: worktree created at .trees/${id}\n`);
      process.stdout.write(`Next: cd .trees/${id} && npm install\n`);
      process.stdout.write(
        `Commit: git add .beads/issues.jsonl && git commit -m "chore: start ${id}"\n`,
      );
    } else {
      print(issues[idx], true);
    }
    return;
  }

  // ── finish ────────────────────────────────────────────────────────────────
  if (verb === 'finish') {
    const id = rest[0];
    if (!isNonEmptyString(id)) fail('Missing issue id for issue finish.');

    const idx = findIssueIndex(issues, id);
    const issue = issues[idx];
    if (issue.status !== 'open') fail(`Bead ${id} is already ${issue.status}.`);

    const worktreePath = path.join(root, '.trees', id);
    if (!fs.existsSync(worktreePath)) {
      fail(
        `Worktree .trees/${id} not found. Did you run bd issue start ${id}?\n` +
          `If the worktree was removed manually, close the bead with: bd issue close ${id}`,
      );
    }

    const cwd = process.cwd();
    if (cwd.includes(path.sep + '.trees' + path.sep + id)) {
      fail(`Run finish from repo root, not from inside the worktree.`);
    }

    const noMerge = rawArgv.includes('--no-merge');
    if (!noMerge) {
      const mergeResult = spawnGit(['merge', '--no-ff', id, '-m', `merge: ${id}`], root);
      if (mergeResult.status !== 0) {
        fail(
          `Merge failed:\n${mergeResult.stderr}\n` +
            `Resolve conflicts then re-run: bd issue finish ${id} --no-merge`,
        );
      }
    }

    const removeResult = spawnGit(['worktree', 'remove', path.join('.trees', id)], root);
    if (removeResult.status !== 0) {
      spawnGit(['worktree', 'remove', '--force', path.join('.trees', id)], root);
    }

    spawnGit(['branch', '-d', id], root);

    applyUpdate(issues, id, { status: 'closed', claimedBy: undefined, claimedAt: undefined });
    writeIssues(root, issues);

    // Auto-commit .beads/issues.jsonl and push so no agent can forget this step.
    spawnGit(['add', path.join('.beads', 'issues.jsonl')], root);
    const commitResult = spawnGit(['commit', '-m', `chore: close ${id}`], root);
    if (commitResult.status !== 0) {
      process.stderr.write(`Warning: git commit failed:\n${commitResult.stderr}\n`);
    }
    let pushOk = false;
    const pushResult = spawnGit(['push', 'origin', 'main'], root);
    if (pushResult.status !== 0) {
      // Another agent may have pushed first — rebase and retry.
      spawnGit(['pull', '--rebase', 'origin', 'main'], root);
      const retryPush = spawnGit(['push', 'origin', 'main'], root);
      if (retryPush.status !== 0) {
        process.stderr.write(`Warning: git push failed:\n${retryPush.stderr}\n`);
        process.stderr.write(
          `Run manually: git pull --rebase origin main && git push origin main\n`,
        );
      } else {
        pushOk = true;
      }
    } else {
      pushOk = true;
    }

    if (!asJson) {
      if (pushOk) {
        process.stdout.write(
          `Finished ${id}: worktree removed, bead closed, pushed to origin/main.\n`,
        );
      } else {
        process.stdout.write(
          `Finished ${id}: worktree removed, bead closed. Push PENDING — run git push manually.\n`,
        );
      }
    } else {
      print(issues[idx], true);
    }
    return;
  }

  // ── create ────────────────────────────────────────────────────────────────
  if (verb === 'create') {
    const title = readOption(rawArgv, '--title');
    if (!title) fail('Missing --title for issue create.');

    const priority = readOption(rawArgv, '--priority');
    if (priority && !VALID_PRIORITIES.includes(priority)) {
      fail(`Invalid priority "${priority}". Expected one of: ${VALID_PRIORITIES.join(', ')}.`);
    }

    const phase = readOption(rawArgv, '--phase');
    const body = readOption(rawArgv, '--body');
    const blockedByRaw = readOption(rawArgv, '--blocked-by');
    const blockedBy = parseBlockedBy(blockedByRaw);

    const id = nextIssueId(issues);
    const now = nowIsoUtc();
    const issue = {
      id,
      title: title.trim(),
      status: 'open',
      ...(priority ? { priority } : {}),
      ...(phase ? { phase } : {}),
      ...(blockedBy ? { blockedBy } : {}),
      ...(body ? { body: body.trim() } : {}),
      createdAt: now,
      updatedAt: now,
    };
    issues.push(issue);
    writeIssues(root, issues);
    print(issue, asJson);
    return;
  }

  // ── close ─────────────────────────────────────────────────────────────────
  if (verb === 'close') {
    const id = rest[0];
    if (!isNonEmptyString(id)) fail('Missing issue id for issue close.');
    const updated = applyUpdate(issues, id, {
      status: 'closed',
      claimedBy: undefined,
      claimedAt: undefined,
    });
    writeIssues(root, issues);
    print(updated, asJson);
    return;
  }

  // ── reopen ────────────────────────────────────────────────────────────────
  if (verb === 'reopen') {
    const id = rest[0];
    if (!isNonEmptyString(id)) fail('Missing issue id for issue reopen.');
    const updated = applyUpdate(issues, id, { status: 'open' });
    writeIssues(root, issues);
    print(updated, asJson);
    return;
  }

  // ── update ────────────────────────────────────────────────────────────────
  if (verb === 'update') {
    const id = rest[0];
    if (!isNonEmptyString(id)) fail('Missing issue id for issue update.');
    const idx = findIssueIndex(issues, id);
    const changes = buildUpdateChanges(rawArgv, issues[idx]);
    if (Object.keys(changes).length === 0) fail('No changes specified for issue update.');
    const updated = applyUpdate(issues, id, changes);
    writeIssues(root, issues);
    print(updated, asJson);
    return;
  }

  fail(`Unknown verb "${verb}".\n\nRun: bd --help`);
}

try {
  main();
} catch (err) {
  const message = err instanceof Error ? err.message : String(err);
  fail(message);
}
