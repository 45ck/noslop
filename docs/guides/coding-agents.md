# noslop — coding agent install guide

This guide is written for AI coding agents (Claude Code, Codex CLI, Copilot Workspace, Cursor, and similar tools). Follow it exactly.

## Claude Code

Claude Code gets three enforcement layers:

1. **`.claude/settings.json`** — Deny rules that prevent running `--no-verify`, `--force`, `git push -f`, and editing protected paths.
2. **`.claude/hooks/pre-tool-use.sh`** — Intercepts every tool call before execution. Blocks bypass patterns and returns structured JSON that Claude Code interprets as a hard block.
3. **`AGENTS.md`** — Plain-language rules read before working in the repo. Includes gate commands, prohibited actions, and recovery steps.

When a tool call is blocked, you will see a JSON response with a `"reason"` field. Read it — it tells you what failed, why, and the exact next step to fix it.

## Codex CLI

Codex reads `AGENTS.md` before working. It contains the same rules, gate commands, and recovery steps as the Claude Code integration.

Optional: Add a `.codex/config.toml` with `model = "o4-mini"` and any sandbox preferences. noslop does not generate this file.

## Quick install

Three commands. Run them in order.

```sh
# 1. Install noslop globally if not already present
npm install -g @45ck/noslop

# 2. Install quality gates into the current repo
noslop install

# 3. Verify the install is healthy — must exit 0
noslop doctor
```

If `noslop doctor` exits non-zero, do not proceed. Read the error output and fix each failed check before making any commits.

## Forcing a specific pack

If auto-detection picks the wrong pack, or you are working in a monorepo with multiple languages:

```sh
noslop install --pack typescript
noslop install --pack typescript --pack python   # monorepo: two packs
```

## Detection rules

Use this table to determine which `--pack` value to pass without running noslop:

| File present in repo root                                                   | Pack ID                                                                          |
| --------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `tsconfig.json` or `package.json`                                           | `typescript`                                                                     |
| `Cargo.toml`                                                                | `rust`                                                                           |
| `.csproj`, `.sln`, or `global.json`                                         | `dotnet`                                                                         |
| `go.mod`                                                                    | `go`                                                                             |
| `pyproject.toml`, `setup.py`, or `requirements.txt`                         | `python`                                                                         |
| `pom.xml`, `build.gradle`, or `build.gradle.kts` (no `.kt` files in `src/`) | `java`                                                                           |
| `Gemfile`                                                                   | `ruby`                                                                           |
| `Package.swift`                                                             | `swift`                                                                          |
| `build.gradle` or `build.gradle.kts` + `.kt` files in `src/`                | `kotlin`                                                                         |
| `composer.json`                                                             | `php`                                                                            |
| `build.sbt`                                                                 | `scala`                                                                          |
| `mix.exs`                                                                   | `elixir`                                                                         |
| `pubspec.yaml`                                                              | `dart`                                                                           |
| `build.zig`                                                                 | `zig`                                                                            |
| `.cabal`                                                                    | `haskell`                                                                        |
| `.rockspec` file or file ending in `.rockspec`                              | `lua`                                                                            |
| `CMakeLists.txt`                                                            | `cpp`                                                                            |
| `dune-project`                                                              | `ocaml`                                                                          |
| `package.json` (no `tsconfig.json`)                                         | `javascript` (not auto-detected; `package.json` routes to TypeScript by default) |
| (none of the above)                                                         | `typescript` (default)                                                           |

> **Note:** JavaScript is not auto-detected. A repo with `package.json` but no `tsconfig.json` still defaults to the TypeScript pack. Use `--pack=javascript` to force JavaScript.

## Post-install constraints

After `noslop install`, these constraints apply. You MUST NOT violate them:

1. **Do not bypass hooks.** Never run `git commit --no-verify` or `git push --no-verify`.
2. **Do not edit protected paths.** These paths are enforced by `.claude/settings.json` and CI:
   - `.githooks/`
   - `.github/workflows/`
   - `.claude/settings.json`
   - `.claude/hooks/`
3. **Gate must pass before committing.** Run `noslop check --tier=fast` and confirm it exits 0 before staging any commit.
4. **Do not use force push.** Never run `git push -f` or `git push --force`.
5. **Do not disable linters inline.** Do not add `// eslint-disable`, `#noqa`, `// NOLINT`, or equivalent suppression comments to pass a gate.
6. **Do not skip CI.** Never use `[skip ci]`, `skip-checks`, or `SKIP_CI` in commit messages or CI configuration. CI is the authoritative quality gate and cannot be bypassed.

## Before every commit

```sh
noslop check --tier=fast    # must exit 0
git add .
git commit -m "feat: your message"
```

The pre-commit hook also enforces `noslop check --tier=fast` automatically. If it fails, fix the reported issues before retrying.

## CI bootstrap

For CI pipelines that do not have noslop pre-installed:

```sh
npx @45ck/noslop install && noslop check --tier=ci
```

## Verifying a healthy install

`noslop doctor` on a correctly installed repo outputs:

```
✓ .githooks/pre-commit present and executable
✓ .githooks/pre-push present and executable
✓ .githooks/commit-msg present and executable
✓ git config core.hooksPath = .githooks
✓ .github/workflows/quality.yml present
✓ .github/workflows/guardrails.yml present
✓ .claude/settings.json present
✓ .claude/hooks/pre-tool-use.sh present

All checks passed.
```

Exit code 0 = healthy. Any non-zero exit code means one or more checks failed — read the output and re-run `noslop install` to repair.

## If a gate blocks you

1. Read the full error output — it tells you what failed and where
2. Fix the code (do not disable the rule or bypass the hook)
3. Rerun the gate: `noslop check --tier=fast`
4. Once it passes, stage and commit normally

## Block message examples

When the pre-tool-use hook blocks a tool call, you will receive a JSON response like:

**--no-verify attempt:**

```json
{
  "decision": "block",
  "reason": "noslop: --no-verify bypasses pre-commit hooks and is not allowed. Run 'noslop check --tier=fast' to see what is failing, fix the reported errors, then commit without --no-verify."
}
```

**CI-skip pattern:**

```json
{
  "decision": "block",
  "reason": "noslop: CI-skip patterns (SKIP_CI, [skip ci]) are not allowed. CI is the authoritative quality gate and cannot be bypassed. Remove the skip pattern and let CI run normally."
}
```

**Config file edit:**

```json
{
  "decision": "block",
  "reason": "noslop: editing 'eslint.config.js' is blocked — quality gate configs are protected. To change rules, run 'noslop install' to regenerate from templates, or ask a human to apply the noslop-approved PR label."
}
```

When the commit-msg hook rejects a message:

**CI-bypass pattern in commit message:**

```
noslop: commit message contains a CI-bypass pattern.
  Blocked: [skip ci], skip-checks, --no-verify
  Remove the pattern from your commit message. CI checks are required and cannot be skipped.
```

**Invalid Conventional Commits format:**

```
noslop: commit message does not follow Conventional Commits.
  Expected: type(scope): description
  Types: feat|fix|docs|style|refactor|perf|test|chore|ci|build|revert
  Example: feat(auth): add OAuth2 login flow
```

## What noslop installs

| File                               | Purpose                                               |
| ---------------------------------- | ----------------------------------------------------- |
| `.githooks/pre-commit`             | Runs fast gates before every commit                   |
| `.githooks/pre-push`               | Runs slow gates before every push                     |
| `.githooks/commit-msg`             | Enforces Conventional Commits; blocks `[skip ci]`     |
| `.github/workflows/quality.yml`    | Required CI check on PRs and main pushes              |
| `.github/workflows/guardrails.yml` | Blocks PRs touching protected files without label     |
| `.claude/settings.json`            | Denies `--no-verify`, `--force`, protected path edits |
| `.claude/hooks/pre-tool-use.sh`    | Intercepts tool calls; blocks bypass patterns         |
| `scripts/check`                    | Wrapper: `noslop check --tier=fast`                   |
| `scripts/fmt`                      | Wrapper: formatter for the detected pack              |
| `scripts/lint`                     | Wrapper: linter for the detected pack                 |
| `scripts/test`                     | Wrapper: test suite for the detected pack             |
| `AGENTS.md`                        | Plain-language rules for AI agents in this repo       |
