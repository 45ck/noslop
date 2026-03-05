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

Shared plumbing (`.githooks/`, `.github/workflows/`, `.claude/`, `scripts/`, `AGENTS.md`) — see [What gets dropped into your repo](../../README.md#what-gets-dropped-into-your-repo).

Additionally: `pyproject.toml` — unified config for Black, Ruff, mypy, and pytest

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

```sh
noslop doctor
```

See [Quick start](../../README.md#quick-start) for expected output.

## Troubleshooting

- **mypy not installed** — Run `pip install mypy`. The slow gate and CI rely on mypy for type checking. Without it, type strictness is not enforced.
- **Black and Ruff version mismatch** — Black and Ruff must agree on formatting rules. Pin both versions in your `pyproject.toml` or `requirements-dev.txt` to avoid conflicts.
- **Ruff reports unknown rule codes** — Ensure you are using a recent version of Ruff. Rule codes like `PLR0913` require Ruff 0.1+.
