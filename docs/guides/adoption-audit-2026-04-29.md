# Adoption audit: noslop, agent-docs, and skill-harness

Date: 2026-04-29

This audit checked active 45ck repositories for three things:

- whether `@45ck/noslop`, `@45ck/agent-docs`, or `skill-harness` are present;
- whether they are actually wired into scripts, git hooks, and CI;
- whether the observed wiring supports the quality claims made by the tooling docs.

## Executive findings

1. Installed files do not mean active enforcement. The most common failure mode is committed hook files with `git core.hooksPath` unset or pointed at another hook manager.
2. `core.hooksPath` is local git config. It is not cloned with the repo. Every checkout must run `noslop init`, `noslop doctor`, or `git config core.hooksPath .githooks` once.
3. Some repos declare noslop but never run it in their active CI or active git hooks.
4. `agent-docs` had its own activation problems: generated hooks were not always executable, and fallback commands assumed package availability that clean machines did not have.
5. `skill-harness` is mostly used as a generator/source of copied agent definitions. It is not generally installed as an active package in the inspected repos.
6. The quality evidence is real but narrow: controlled experiments show process and traceability gains, while current repo adoption is too inconsistent to prove broad production quality improvement.

## Repo matrix

| Repo               | noslop status                                                                                           | agent-docs status                                                  | skill-harness status                                            | Effective enforcement                                              |
| ------------------ | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | --------------------------------------------------------------- | ------------------------------------------------------------------ |
| Portarium          | Not installed. Uses Husky and `npm run ci:pr`.                                                          | Not installed.                                                     | Not installed.                                                  | Strong native `ci:pr`, but no noslop layer.                        |
| luxury-stays       | Dependency present, but local `core.hooksPath` was unset and active quality scripts did not run noslop. | Current package present; docs check passed.                        | Not installed.                                                  | High bypass risk for noslop gates.                                 |
| portfolio-monorepo | Dependency and scripts present, but active hooks point at Beads and do not run noslop fully.            | Present but stale lockfile; docs check denied many markdown files. | Not installed.                                                  | Partial local enforcement; CI did not run noslop quality scripts.  |
| hydra-reach        | Declared as `link:../noslop`, but local binary was missing.                                             | Declared as `link:../agent-docs`, but local binary was missing.    | Copied agent definitions present.                               | High bypass risk; generated outputs are mostly inert.              |
| vibe-ts            | Remote manifests include noslop and quality scripts.                                                    | Stale `0.3.1` package lock with broken binary packaging.           | Not installed.                                                  | Medium risk; CI should run quality scripts and refresh agent-docs. |
| content-machine    | Not installed.                                                                                          | Not installed as repo gate.                                        | Has repo-local harness/runtime; catalog command works directly. | Harness active locally, but not through noslop.                    |
| video-evaluator    | Not installed.                                                                                          | Not installed as repo gate.                                        | Has repo-local harness/runtime; catalog command works.          | Harness active locally, but not through noslop.                    |
| demo-machine       | Not installed.                                                                                          | Not installed as repo gate.                                        | Consumes video-evaluator rather than skill-harness.             | Uses its own test suite, not noslop.                               |

## What is working

- `noslop init` does write `.githooks/` and set `git config core.hooksPath .githooks` in the current checkout.
- `noslop doctor` already catches missing `core.hooksPath`, missing hook files, missing CI workflows, and missing Claude guardrail files.
- `luxury-stays` can run `agent-docs` successfully with its current package and permissive markdown policy.
- `content-machine` and `video-evaluator` have runnable repo-local harness surfaces, even though they are not using the `skill-harness` repo as a dependency.

## What is not working

- Clones do not inherit `core.hooksPath`. A committed `.githooks/` directory can sit unused forever.
- Repos with another hook manager, such as Husky or Beads, can bypass noslop unless that manager delegates to `.githooks/` or directly calls `noslop check`.
- Some generated hooks call global commands or package fallbacks instead of the local `node_modules/.bin` binary, which makes clean-machine behavior drift by repo.
- `agent-docs` configs using strict markdown-deny mode do not fit markdown-heavy repos unless the allowed paths are curated.
- `skill-harness` generated `.codex/agents` files are source templates unless rendered into the user's Codex agent directory.

## Quality impact read

The current evidence supports this narrower claim:

> The 45ck toolkit improves process discipline, traceability, and scoping in controlled tasks, especially ambiguous tasks. It does not automatically improve active repo quality unless the repo wires the tools into local hooks, CI, and agent guardrails.

The component-isolation result matters: noslop alone measured a smaller independent gain than the full toolkit. The bigger gains came from specgraph and structured workflow behavior. For production repos, the first metric should be activation coverage: local hook path, script path, CI path, and agent guardrail path all running the intended checks.

## Required adoption checks

For every repo that claims noslop adoption:

```sh
git config --get core.hooksPath
npx noslop doctor
npx noslop check --tier=fast
npx noslop check --tier=ci
```

The hook path must be `.githooks` or the active hook manager must call noslop explicitly. CI must run the same `ci` tier or an equivalent repo-owned quality script.

For every repo that claims agent-docs adoption:

```sh
node_modules/.bin/agent-docs check --strict .
git config --get core.hooksPath
```

The active hook path must point at executable hooks that can find the local `agent-docs` binary. Markdown policy should be `allow` or `warn` for markdown-heavy repos unless structured source docs are the actual source of truth.

For every repo that claims skill-harness adoption:

```sh
skill-harness check
skill-harness render
```

If the repo only has copied `.claude/agents` or `.codex/agents`, document that as generated agent definitions, not an active `skill-harness` runtime.

## Remediation queue

1. Tighten `noslop doctor` so a non-empty hook path is not enough; it must be `.githooks`.
2. Correct noslop docs to say `core.hooksPath` is local per checkout and CI branch protection must be configured separately.
3. Fix `agent-docs install-gates` to write executable hooks and avoid unreliable package fallbacks.
4. Update consumer repos so CI runs the intended quality scripts, not only base lint/test commands.
5. For repos using Beads, Husky, or another hook manager, make that active hook call `noslop check` and `agent-docs check`.
6. Add a small adoption smoke test to each consumer repo that checks `core.hooksPath`, local binaries, and the expected fast gate.
