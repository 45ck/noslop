# 10 — Context Degradation Lab

A framework for measuring how AI agent performance degrades over the course
of a long task, and for detecting when context management is failing.

## The Degradation Thesis

Model performance on long tasks degrades gradually, not as a cliff edge.
An agent that perfectly follows your coding conventions in the first 10
minutes of a session may silently drift by minute 30. This drift is
measurable if you know what to look for.

The danger is that degradation is invisible in the moment. The agent does
not announce "I have forgotten your naming convention." It simply starts
using a different one. By the time you notice, several files may already
be inconsistent.

Research supports this:
- **Anthropic** documented a context degradation gradient: instructions
  placed earlier in the context window are followed more reliably than
  those placed later, and adherence decays as conversation length grows.
- Cognition ("Deep Agents") observed a roughly 35-minute effective working window
  for complex multi-step tasks before measurable quality loss.
- **Manus** quantified the token economics: cache misses cost 10x more
  than hits, meaning context that gets evicted and re-injected is both
  expensive and less reliably followed.

## Four Measurement Dimensions

### 1. Rule Adherence

Does the agent still follow naming conventions, architectural boundaries,
and project-specific rules? This is the easiest dimension to measure
because rules are binary: either the file has a module header comment or
it does not.

### 2. Task Coherence

Are later implementations consistent with earlier ones? If the agent
created a `UserService` with constructor injection in feature 1, does it
use the same pattern in feature 5? Inconsistency across a session
indicates the agent is no longer referencing its earlier decisions.

### 3. Memory Recall

Can the agent reference decisions made 20+ messages ago without being
prompted? For example, if an early message established that all database
queries need a timeout parameter, does the agent still include it in
queries written much later in the session?

### 4. Error Accumulation

Does the agent start ignoring failing tests or lint errors? Early in a
session, agents typically fix test failures immediately. Later, they may
acknowledge failures but move on, or produce code that introduces new
failures without addressing existing ones.

## Canary Rules

A canary rule is a deliberately embedded, easy-to-verify rule that serves
as a degradation marker. Unlike organic project rules (which the agent
may follow out of habit or training data familiarity), canary rules are
unusual enough that the agent must be actively reading and following
instructions to comply.

Good canary rules:
- Are easy to grep for (a specific comment format, a required parameter)
- Do not conflict with natural coding patterns
- Are scattered through the CLAUDE.md, not clustered together
- Would not be followed by an agent relying purely on training data

If the agent stops following a canary rule, context is degrading. The
specific rule that fails first tells you something about what the agent
is losing: rules about function signatures degrade differently than rules
about file headers.

## Anti-patterns

**Too many canary rules.** If you embed 15 canary rules, they become
noise. The agent spends tokens on compliance instead of the actual task,
and you spend time checking rules instead of reviewing code. Four to six
canary rules is the sweet spot.

**Canary rules that conflict with natural coding.** A rule like
"never use arrow functions" in a TypeScript project fights the agent's
training data. The agent may override it not because of degradation but
because the rule feels wrong. Choose rules that are unusual but not
adversarial.

**Canary rules hidden in rarely-loaded files.** A canary rule in a file
that only loads during context expansion is testing whether expansion
works, not whether the agent retains context. Put canary rules in
CLAUDE.md where they are loaded at session start.

## When to Use This

- When establishing context management practices for a team and you want
  empirical evidence for how long your context files remain effective
- When evaluating whether your CLAUDE.md, AGENTS.md, and memory files
  are structured well enough to survive long sessions
- When comparing different context strategies (flat CLAUDE.md vs. layered
  context loading vs. skill-based loading)
- When onboarding a new model version and you want to benchmark its
  context retention against the previous version

## Files in This Example

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Sample project with 4 embedded canary rules |
| `AGENTS.md` | Degradation self-check protocol for agents |
| `experiments/canary-test.md` | Protocol for measuring canary rule adherence |
| `experiments/compaction-test.md` | Protocol for testing whether compaction preserves rules |

## Further Reading

- Example 06 (Context Compression) covers the structural techniques for
  managing context. This lab measures whether those techniques work.
- Example 07 (Memory Patterns) covers persistent memory. Canary rules
  can test whether memory files survive across sessions.
