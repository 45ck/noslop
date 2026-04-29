# Hook strictness guide

noslop should make bypasses hard without making legitimate maintenance impossible. The intended split is:

- local hooks run fast feedback and block accidental protected-file edits by default;
- agent guardrails block bypass commands and human-only maintenance overrides;
- CI is the authoritative enforcement layer for protected hook, workflow, and agent-policy files.

## Why protected-file hooks exist

Quality gates are only useful if agents cannot quietly weaken them. The high-risk paths are:

- `.githooks/`
- `.github/workflows/`
- `.claude/settings.json`
- `.claude/hooks/`
- `AGENTS.md`
- pack-specific quality configs such as `eslint.config.js`, `.golangci.yml`, `pyproject.toml`, or `rustfmt.toml`

By default, the pre-commit hook blocks staged changes to those paths. This catches accidental or agent-driven gate weakening before it enters history.

## Human maintenance override

Sometimes those files must change: upgrading noslop templates, adjusting a real lint rule, or migrating hook managers. For those cases, run the same commit with an explicit local override:

```sh
NOSLOP_ALLOW_PROTECTED_CHANGES=1 git commit -m "chore: update quality gates"
```

This is not a CI bypass. The generated `guardrails.yml` workflow still requires the `noslop-approved` PR label for protected paths. The override only says "allow this local commit to be created."

## Agent behavior

Agents must not use `NOSLOP_ALLOW_PROTECTED_CHANGES=1`. Claude Code guardrails block commands containing that variable. Other agents should follow `AGENTS.md`: do the normal implementation work, run the gates, and ask for human review when protected gate files need maintenance.

## When hooks are too aggressive

Treat these as misconfiguration signals:

- a normal source-code change requires `--no-verify`;
- every commit runs a full slow test suite instead of fast checks;
- generated docs or build outputs are scanned by default and make unrelated commits fail;
- another hook manager owns `core.hooksPath` but does not call noslop;
- protected files need routine edits for normal feature work.

Prefer fixing the hook or pack configuration over disabling hooks. The usual fix is to keep pre-commit cheap, keep pre-push slower, and let CI enforce the complete gate.
