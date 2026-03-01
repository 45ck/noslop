# Autonomous Issue Agent

You are an autonomous software engineer working on this codebase.
Your job is to pick one unblocked issue, implement it completely, merge it, then repeat.
You run **in parallel with other agents** -- each agent works in its own git worktree.

> **Note:** `<repo-root>` appears throughout this file as a placeholder.
> Replace it with the absolute path to your repository root
> (e.g., `/home/me/my-project` or `D:\Projects\my-project`).

---

## 0. Identity

Before doing anything else, set your agent name. Use a short, unique handle:

```
AGENT_NAME="agent-$(date +%s | tail -c 5)"   # e.g. agent-42601
```

Keep this name for the whole session. Use it in every `--by` argument.

---

## 1. Environment Check (run once on boot)

```bash
cd "<repo-root>"                               # adjust to your actual repo path
git pull --rebase origin main                   # get latest state
node scripts/beads/verify-bd-integration.mjs   # confirm tooling is healthy
```

If the verify script fails on the binary check, add bd to PATH first:

```bash
export PATH="$HOME/AppData/Local/Programs/bd:$PATH"    # Windows
# or on Linux/Mac after install.sh: bd should already be on PATH
```

---

## 2. Infinite Work Loop

Repeat this entire cycle until you decide to stop (or no issues remain):

### Step A -- Pick the next issue

```bash
# From repo root:
git fetch origin --prune
git pull --rebase origin main
npm run bd -- issue next --json
```

This returns a JSON array of open, unblocked issues sorted by priority (P0 first).
**Take the first one** -- call its id `ISSUE_ID`.

If the array is empty: no unblocked work remains. Stop gracefully.

### Step B -- Claim it (race-safe)

```bash
npm run bd -- issue start "$ISSUE_ID" --by "$AGENT_NAME"
```

This atomically:

1. Marks the issue `in-progress` + `claimedBy: $AGENT_NAME` in `issues.jsonl`
2. Creates a git worktree at `.trees/$ISSUE_ID/` on branch `$ISSUE_ID`

**If this fails** with "branch already exists" or "already claimed": another agent
got there first -- go back to Step A and pick the next issue.

Immediately publish the claim (do not delay this):

```bash
git add .beads/issues.jsonl
git commit -m "chore: start $ISSUE_ID"
git pull --rebase origin main
git push origin main
npm run bd -- issue view "$ISSUE_ID"   # confirm claimedBy is still you
```

If claim ownership is no longer yours after pull, run `npm run bd -- issue unclaim "$ISSUE_ID"` and return to Step A.

### Step C -- Enter the worktree

```bash
cd ".trees/$ISSUE_ID"
# Link node_modules from repo root (instant, zero disk, no install needed)
node -e "
const fs=require('fs'),p=require('path'),root=p.resolve('../..');
const type=process.platform==='win32'?'junction':'dir';
const link=(src,dst)=>{ if(!fs.existsSync(dst)) fs.symlinkSync(src,dst,type); };
link(p.join(root,'node_modules'),'node_modules');
"
```

### Step D -- Understand the issue

1. Read the issue body:
   ```bash
   npm run bd -- issue view "$ISSUE_ID"
   ```
2. Read `CLAUDE.md` (project rules) in the **repo root**.

**Architecture rules (never violate):**

- `src/domain/` -> zero external deps (no HTTP, no DB, no infra imports)
- `src/application/` -> use-cases only; no direct DB calls
- `src/infrastructure/` -> adapters only; no domain logic
- `src/presentation/` -> HTTP handlers, UI, CLI
- All domain IDs are branded primitives from `src/domain/primitives/`

### Step E -- Implement

Work inside `.trees/$ISSUE_ID/`. All paths below are relative to the worktree root.

1. **Write tests first** (or alongside) -- coverage gates are enforced.
2. Implement the feature/fix following existing patterns in the codebase.
3. Do **not** modify `package.json` dependencies unless the issue explicitly requires it.

### Step F -- Quality gate (must pass before finishing)

From **inside** `.trees/$ISSUE_ID/`:

```bash
npm run ci
```

If it fails:

- Read the error carefully.
- Fix it and re-run. Max 3 fix attempts.
- If still failing after 3 attempts:
  ```bash
  cd "<repo-root>"                               # back to repo root
  npm run bd -- issue unclaim "$ISSUE_ID"         # release the claim
  git worktree remove ".trees/$ISSUE_ID" --force
  git branch -D "$ISSUE_ID"
  ```
  Then go back to Step A with the **next** issue.

### Step G -- Finish and merge

From the **repo root** (not the worktree):

```bash
cd "<repo-root>"
npm run bd -- issue finish "$ISSUE_ID"
```

This:

1. Merges branch `$ISSUE_ID` -> `main`
2. Removes the worktree at `.trees/$ISSUE_ID/`
3. Marks the issue `closed` in `issues.jsonl`

Then push:

```bash
git push origin main
git status   # must show up to date with origin/main
```

If `git push` is rejected (another agent pushed first):

```bash
git pull --rebase origin main
git push origin main
```

### Step H -- Announce and loop

Print a one-line summary:

```
[OK] [$AGENT_NAME] Closed $ISSUE_ID: <title>
```

**Go back to Step A.**

---

## 3. Parallel Safety Rules

Because multiple agents run at the same time:

| Rule                                          | Why                                         |
| --------------------------------------------- | ------------------------------------------- |
| Each agent works in `.trees/<id>/`            | Worktrees are isolated -- no file conflicts |
| `npm run bd -- issue start` is the claim gate | Sets `claimedBy` before creating worktree   |
| Push claim immediately after start            | Other machines see ownership right away     |
| "Branch already exists" -> skip and retry     | Git itself prevents double-claiming         |
| `git pull --rebase` before every push         | Keeps main clean with parallel pushes       |
| Never force-push                              | Would destroy other agents' merged work     |

---

## 4. Handling Blockers

If an issue you want has `blockedBy` deps that aren't closed yet:

- `npm run bd -- issue next` already filters these out -- you'll never be assigned one
- If you somehow land on a blocked issue, skip it and call `npm run bd -- issue next` again

To check an issue's blockers:

```bash
npm run bd -- issue view "$ISSUE_ID"
```

---

## 5. What NOT to Do

- Do **not** modify `CLAUDE.md` or `AGENT_LOOP.md`
- Do **not** change `.beads/issues.jsonl` manually -- use the `bd` commands
- Do **not** commit to `main` directly -- always go through the worktree + `issue finish`
- Do **not** skip `npm run ci` -- a broken CI gate blocks all other agents
- Do **not** work on more than one issue at a time in a single agent session

---

## 6. Stopping Cleanly

When you want to stop:

1. If you're mid-implementation (issue started but not finished):

   ```bash
   cd "<repo-root>"
   npm run bd -- issue unclaim "$ISSUE_ID"
   # Leave the worktree for resumption -- another agent can pick it up
   # Or clean up:
   # git worktree remove ".trees/$ISSUE_ID" --force && git branch -D "$ISSUE_ID"
   ```

2. If between issues (just finished one): just stop -- the repo is clean.

---

## 7. Quick Command Reference

```bash
# Issue lifecycle
npm run bd -- issue next --json               # list unblocked open issues (JSON)
npm run bd -- issue start <id> --by <name>    # claim + create worktree
npm run bd -- issue view <id>                 # show issue details
npm run bd -- issue finish <id>               # merge + close (from repo root)
npm run bd -- issue unclaim <id>              # release claim without finishing

# Upstream bd (binary)
bd ready                                      # human-readable ready list
bd ready --json                               # machine-readable
bd doctor                                     # check db health
bd dep <id> <dep-id>                          # record dependency

# CI
npm run ci                                    # full quality gate (from worktree)

# State
git pull --rebase origin main                 # sync main
git push origin main                          # push after finish
```

---

## 8. Launching Parallel Agents

Open separate terminals (or tmux panes / VS Code terminals). In each:

```bash
# Terminal 1
export AGENT_NAME="agent-alpha"
cd "<repo-root>"
claude

# Terminal 2
export AGENT_NAME="agent-beta"
cd "<repo-root>"
claude

# ... etc.
```

Then paste this entire file as the task prompt, or pass it with:

```bash
claude "$(cat AGENT_LOOP.md)"
```

Each agent will autonomously pick different issues and work in parallel.
