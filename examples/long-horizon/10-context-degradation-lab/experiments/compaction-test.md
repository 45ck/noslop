# Context Compaction Preservation Test

## Purpose

Determine whether automatic context compaction (summarization of earlier
conversation turns) preserves or drops canary rules. Compaction reduces
token usage but may discard rules it considers low-priority.

## Setup

1. Use the same `CLAUDE.md` and `AGENTS.md` as the canary test.
2. Start a new session with a fresh context.
3. Use the same 8-feature sequence and descriptions from `canary-test.md`.
4. After feature 4, trigger or wait for compaction (see Tools below).

## Tools and Measurement

How compaction works depends on your tool:

- **Claude Code:** Compaction happens automatically when the conversation
  approaches the context limit. You will see a "compacting conversation"
  message. You can also type `/compact` to trigger it manually.
- **API (direct):** Compaction is not automatic. You can simulate it by
  summarizing the conversation so far and starting a new API call with
  the summary as the system prompt prefix.
- **Measuring token count:** In Claude Code, the status bar shows an
  approximate context usage. In the API, the `usage` field in the response
  includes `input_tokens` and `output_tokens`. Note the token count before
  and after compaction.
- **If you cannot trigger compaction:** Generate enough conversation to
  trigger automatic compaction. Asking the agent to implement features
  1-4 with verbose explanations usually generates enough tokens.

## Protocol

1. **Features 1-4 (pre-compaction):** Implement normally. Record canary
   adherence at each step as a baseline.
2. **Compaction event:** After feature 4, trigger or observe automatic
   context compaction. Note the approximate conversation length and token
   count at the compaction point if available.
3. **Features 5-8 (post-compaction):** Continue implementing. Record
   canary adherence at each step.
4. Compare pre-compaction and post-compaction adherence.

## Recording Template

| Feature # | Phase | Files Created | Canary 1 (timeoutMs) | Canary 2 (file header) | Canary 3 (requestId) | Canary 4 (alphabetical) | Post-compaction | Notes |
|-----------|-------|--------------|----------------------|------------------------|---------------------|------------------------|-----------------|-------|
| 1 | Pre | | | | | | N/A | |
| 2 | Pre | | | | | | N/A | |
| 3 | Pre | | | | | | N/A | |
| 4 | Pre | | | | | | N/A | |
| -- | Compaction event | -- | -- | -- | -- | -- | -- | Note token count |
| 5 | Post | | | | | | Yes | |
| 6 | Post | | | | | | Yes | |
| 7 | Post | | | | | | Yes | |
| 8 | Post | | | | | | Yes | |

## Key Questions

1. **Do canary rules survive compaction?** If all four canary rules are
   followed in features 5-8 at the same rate as features 1-4, compaction
   preserved them.

2. **Which rules are dropped first?** If compaction is lossy, which type
   of rule gets summarized away? Mechanical rules (file headers) may be
   deemed less important than functional rules (error format) by the
   compaction process.

3. **Does re-reading CLAUDE.md after compaction restore adherence?** If
   the agent re-reads CLAUDE.md after compaction and adherence recovers,
   the issue is compaction loss. If adherence does not recover, the issue
   is deeper context degradation.

4. **Is there a difference between manual and automatic compaction?**
   Manual compaction (asking the agent to summarize its progress) may
   preserve different information than automatic system compaction.

## Interpreting Results

- **No degradation post-compaction:** Your CLAUDE.md rules are prominent
  enough to survive summarization. This is the ideal outcome.
- **Degradation only post-compaction:** Compaction is the bottleneck.
  Consider restructuring rules to be more prominent, or use a skill-based
  approach that re-loads rules on demand rather than relying on context.
- **Degradation both pre- and post-compaction:** The issue is not
  compaction-specific. Your context management needs structural changes
  (see examples 06 and 07 for techniques).
