# Python — noslop pack

> Enforces cyclomatic complexity, strict typing, and consistent formatting via Ruff, Black, and mypy.

## Prerequisites

- Python 3.8+
- [black](https://github.com/psf/black) (`pip install black`)
- [ruff](https://docs.astral.sh/ruff/) (`pip install ruff`)
- [mypy](https://mypy-lang.org/) (`pip install mypy`)
- [pytest](https://docs.pytest.org/) (`pip install pytest`)

## Install

```sh
noslop init --pack python   # or: auto-detected from pyproject.toml or requirements.txt
noslop doctor
```

## What gets installed

- `.githooks/pre-commit` — runs fast gates before every commit
- `.githooks/pre-push` — runs slow gates before every push
- `.githooks/commit-msg` — enforces Conventional Commits format; blocks [skip ci] patterns
- `.github/workflows/quality.yml` — required CI check on PRs and pushes to main
- `.github/workflows/guardrails.yml` — blocks PRs touching protected files without noslop-approved label
- `.claude/settings.json` — denies --no-verify, --force, edits to protected paths
- `.claude/hooks/pre-tool-use.sh` — intercepts Claude Code tool calls; blocks bypass patterns
- `scripts/check` — wrapper: noslop check --tier=fast
- `scripts/fmt` — wrapper: runs the formatter for this pack
- `scripts/lint` — wrapper: runs the linter for this pack
- `scripts/test` — wrapper: runs the test suite for this pack
- `AGENTS.md` — plain-language rules for AI coding agents
- `pyproject.toml` — unified config for Black, Ruff, mypy, and pytest

## Quality rules

| Config file    | Rule                              | Threshold                                                                                      |
| -------------- | --------------------------------- | ---------------------------------------------------------------------------------------------- |
| pyproject.toml | Cyclomatic complexity (ruff C901) | <= 10                                                                                          |
| pyproject.toml | Cognitive complexity              | Not enforced (ruff has no cognitive complexity rule; only cyclomatic and arg counts available) |
| pyproject.toml | Function length                   | Not enforced (ruff has no line-count rules; pylint adds these but significantly slows CI)      |
| pyproject.toml | File length                       | Not enforced                                                                                   |
| pyproject.toml | Max parameters (PLR0913)          | <= 4                                                                                           |
| pyproject.toml | Max nesting depth                 | Not enforced                                                                                   |
| pyproject.toml | Type strictness (mypy strict)     | Strictest                                                                                      |
| pyproject.toml | Unused imports (ruff F401)        | Error                                                                                          |

## Gate tiers

| Tier | Trigger        | Command                                                                        |
| ---- | -------------- | ------------------------------------------------------------------------------ |
| fast | pre-commit     | `black --check .`                                                              |
| fast | pre-commit     | `ruff check .`                                                                 |
| fast | pre-commit     | `typos` (spell)                                                                |
| slow | pre-push       | `mypy .`                                                                       |
| slow | pre-push       | `pytest`                                                                       |
| ci   | GitHub Actions | `black --check . && ruff check . && typos && mypy . && pytest` (full pipeline) |
| ci   | GitHub Actions | `mutmut run` (mutation testing)                                                |

## Verifying

Expected output of `noslop doctor` for a healthy install:

```
$ noslop doctor
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

## Troubleshooting

- **mypy not installed** — Run `pip install mypy`. The slow gate and CI rely on mypy for type checking. Without it, type strictness is not enforced.
- **Black and Ruff version mismatch** — Black and Ruff must agree on formatting rules. Pin both versions in your `pyproject.toml` or `requirements-dev.txt` to avoid conflicts.
- **Ruff reports unknown rule codes** — Ensure you are using a recent version of Ruff. Rule codes like `PLR0913` require Ruff 0.1+.
