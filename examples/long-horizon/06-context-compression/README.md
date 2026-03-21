# 06 — Context Compression

## The Problem

Large projects generate more context than fits in a single AI context window.
A 50k+ LOC codebase with dozens of modules, hundreds of files, and years of
accumulated conventions cannot be fully loaded into a conversation. Without a
compression strategy, agents either miss critical context or waste tokens on
irrelevant information, leaving less room for actual reasoning and code output.

## Techniques

### 1. Module Maps

Create a single document (`docs/module-map.md`) with one-paragraph summaries of
every module in the codebase. Each entry covers: what the module does, its key
files, and important patterns or constraints. This gives an agent a birds-eye
view without reading any source code.

Think of it as a table of contents for the codebase. An agent reads the map
first, then dives into only the modules relevant to its task.

### 2. Context Selectors

A lookup table mapping task types to file sets. Instead of the agent guessing
which files matter, you tell it: "for billing bugs, read these 8 files." This
eliminates exploratory reading and gets the agent working faster.

Context selectors answer three questions per task type:
- What files should I **read** to understand the problem?
- What files will I likely **modify**?
- What **tests** should I run to verify the fix?

### 3. Layered Detail

Structure documentation in three tiers:
1. **Summary** (CLAUDE.md) — fits in every conversation, always loaded
2. **Detail** (module map, context selectors) — loaded on demand per task
3. **Source code** — read only the specific files needed

The root CLAUDE.md stays short and points to the detail layers. An agent reads
the summary, decides what detail it needs, loads that, then reads source code.
Each layer adds precision but costs tokens.

### 4. Skills That Load Context on Demand

Define a Claude Code skill that takes a task description, matches it against
context selectors, and loads the relevant module summaries and file lists. This
automates the "figure out what to read" step so the agent starts with the right
context pre-loaded.

## Tradeoffs

Compressed context loses nuance. A one-paragraph module summary cannot capture
every edge case. But the tokens saved by not loading irrelevant code are
available for reasoning about the actual problem. In practice, targeted context
plus source code for the relevant files outperforms loading everything and
hoping the model finds what matters.

The main risk is stale documentation. If the module map drifts from the code,
agents get a wrong mental model. Mitigate this by including "update the module
map" in your workflow when modules change.

## Three-Tier Context Architecture

Organize context into three tiers based on how frequently it is needed:

**Hot context (~600 tokens, always loaded):** Project identity, critical
rules, and the current task. This is your CLAUDE.md — it loads every
session and stays in the context window for the entire conversation. Keep
it ruthlessly short. Every token here competes with reasoning tokens for
the duration of the session.

**Specialized context (~1,000-3,000 tokens per task, loaded by skills):**
Module documentation, API specs, context selectors, and module-specific
CLAUDE.md files. Loaded on demand when a task is identified. The
context-loader skill handles this. These tokens are amortized across the
task — loaded once, referenced many times.

**Cold context (~unlimited, on-demand grep/search):** Old ADRs, historical
decisions, full source code, test fixtures, configuration files. Never
pre-loaded. Retrieved via grep, file reads, or search when a specific
question arises. Zero token cost until needed.

The goal: hot context gives the agent enough orientation to know *what*
specialized context to load, and specialized context gives enough detail
to know *which* cold context files to read.

## Cache-Friendly Context Design

Language model APIs cache the internal representations (key-value pairs)
computed for each token. When the beginning of your prompt is identical
across API calls, those cached representations are reused instead of
recomputed — a cache hit costs roughly 10x less than a cache miss
(confirmed by Manus research on production workloads). This has practical
implications for how you structure context files:

- **Put stable content first.** Project identity, architecture rules, and
  naming conventions rarely change. Place them at the top of CLAUDE.md.
- **Put volatile content last.** Current task descriptions, recent
  decisions, and session-specific notes go at the bottom. Changes here
  do not invalidate the cache for everything above.
- **Do not reorder sections between sessions.** Even if a section is not
  relevant to the current task, moving it changes the token prefix and
  busts the cache for all subsequent content. Leave it in place.
- **Avoid templated timestamps in stable files.** A "last updated"
  timestamp at the top of CLAUDE.md changes every session, invalidating
  the entire file's cache. Put dates at the bottom or in separate files.

## Staleness Detection

Context that was accurate when written but is now wrong is worse than no
context. It actively misleads the agent into confident but incorrect
decisions. Watch for these signs of stale context:

- **References to deleted files.** The module map mentions `src/auth/legacy-adapter.ts`
  but the file was removed two months ago.
- **Version numbers that do not match.** CLAUDE.md says "Redis 6.x" but
  `package.json` (or `go.mod`) shows Redis 7.x.
- **API endpoints that return 404.** Context selectors reference
  `/api/v1/users` but the API was restructured to `/api/v2/accounts`.
- **Outdated architectural claims.** "All writes go through the batch
  writer" but a new module was added that writes directly.

Mitigation: add `last_verified` dates to module map entries and context
selector tables. Review on a monthly cadence. When an agent encounters a
contradiction between context and code, the code wins — update the context
file immediately.

## When to Use

- Codebases over 20,000 lines of code
- Monorepos with multiple packages or services
- Projects with many distinct subsystems (auth, billing, API, workers, etc.)
- Teams where multiple agents work on different parts of the codebase
- Any project where an agent frequently reads files it does not end up using

## Files in This Example

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Compact root context — under 40 lines |
| `docs/module-map.md` | One-paragraph summaries of every module |
| `docs/context-selectors.md` | Task-type to file-set lookup table |
| `.claude/skills/context-loader/SKILL.md` | Skill that loads context on demand |
| `AGENTS.md` | Agent behavior instructions |
