# Long-Horizon Context Management Examples

Practical examples of context management strategies for AI coding agents (Claude Code, Codex, etc.). Each example is a self-contained template you can copy into your own project and customize.

## Why Context Management Matters

Research and production experience converge on a single insight: **what you put in the agent's context determines the quality ceiling of its output.** These findings inform the patterns in this collection:

1. **Context degradation is a gradient, not a cliff.** Output quality erodes gradually as the context window fills. You lose nuance before you lose coherence, so problems are invisible until they compound. (Anthropic, "Long Context Tips")
2. **>50% of effective context should be domain knowledge, not behavioral instructions.** Projects that front-load rules ("never do X") and starve the agent of architectural knowledge produce worse results. (Codified Context paper, arxiv 2602.20478)
3. **Specification staleness is the #1 failure mode.** Outdated context files cause agents to confidently produce code that contradicts the current codebase. Keeping specs current matters more than making them comprehensive. (Codified Context paper)
4. **AGENTS.md reduces runtime by 29% and tokens by 17%.** Structured agent instructions measurably improve efficiency even on simple tasks. (Codified Context paper)
5. **Performance degrades after ~35 minutes of continuous agent interaction.** Long sessions accumulate stale intermediate state; checkpointing and session boundaries restore quality. (Cognition, "Deep Agents")
6. **KV-cache hit rate creates a 10x cost difference.** Stable context prefixes that remain identical across calls dramatically reduce inference cost. Put volatile content at the end, not the beginning. (Manus, "Context Engineering")
7. **JSON state tracking is more robust than markdown for long sessions.** Structured formats resist the drift and hallucination that accumulate in free-form text over many turns. (Anthropic, "Effective Harnesses"; Manus, "Context Engineering")

## Examples

| # | Example | Pattern | Complexity | Multi-session | Multi-agent |
|---|---------|---------|------------|---------------|-------------|
| 01 | [Flat Context](./01-flat-context/) | Single `CLAUDE.md` at repo root | Low | No | No |
| 02 | [Hierarchical Context](./02-hierarchical-context/) | Layered `CLAUDE.md` files at multiple directory levels | Medium | No | No |
| 03 | [Checkpoint Sessions](./03-checkpoint-sessions/) | Explicit checkpoint files written between sessions | Medium | Yes | No |
| 04 | [DAG Task Decomposition](./04-dag-task-decomposition/) | Directed acyclic graph of dependent tasks | High | Yes | Yes |
| 05 | [Prompt Company](./05-prompt-company/) | Organization-wide prompt documents encoding dev processes | High | No | Yes |
| 06 | [Context Compression](./06-context-compression/) | Summaries, progressive disclosure, and "do not load" rules | Medium | No | No |
| 07 | [Memory Patterns](./07-memory-patterns/) | Structured memory files read at session start, updated at session end | Medium | Yes | No |
| 08 | [Progress Recitation](./08-progress-recitation/) | Agent restates completed work and remaining plan at turn boundaries | Medium | Yes | No |
| 09 | [Spec-Plan-Runbook](./09-spec-plan-runbook/) | Three-document pipeline: specification, plan, then executable runbook | High | Yes | Yes |
| 10 | [Context Degradation Lab](./10-context-degradation-lab/) | Observable experiments measuring context quality over time | High | Yes | No |

### 01 - Flat Context

Single-file context for small projects under ~5k lines of code. Everything the agent needs lives in one `CLAUDE.md` at the repo root. Simple, zero-overhead, and the agent always has full context. Use this for scripts, libraries, small APIs, and solo projects where a single file won't exceed ~200 lines.

### 02 - Hierarchical Context

Layered `CLAUDE.md` files placed at multiple directory levels. The agent sees the root file plus whichever subdirectory file is relevant to its current task. Use this for monorepos, full-stack apps, and any codebase where different subsystems have distinct conventions, tech stacks, or architectural patterns.

### 03 - Checkpoint Sessions

Multi-session work with explicit checkpoints written to a memory file between sessions. Each session ends by recording decisions made, files changed, and what to do next. Use this when a feature takes multiple days or when you regularly context-switch between projects.

### 04 - DAG Task Decomposition

Directed acyclic graph of dependent tasks, defined upfront and tracked in a structured file. Tasks declare their dependencies so the agent (or a team of agents) can parallelize safely. Use this for large migrations, refactors, or any project with 10+ interdependent work items.

### 05 - Prompt Company

Encode an entire dev organization's processes as prompt documents: coding standards, review checklists, incident response, release procedures. Use this when multiple teams share conventions and you want every agent session to follow the same playbook without repeating yourself.

### 06 - Context Compression

Strategies for managing context window limits in large projects: summaries, layered detail, progressive disclosure, and explicit "do not load" rules. Use this when your codebase is large enough that naively dumping everything into context wastes tokens or hits limits.

### 07 - Memory Patterns

Persistent memory across sessions using structured files that the agent reads at session start and updates at session end. Covers what to remember (decisions, gotchas, environment quirks) and what to forget (stale info, resolved issues). Use this alongside any other strategy.

### 08 - Progress Recitation

The agent periodically restates what it has accomplished and what remains before continuing work. This counters mid-session context drift by forcing the model to re-anchor on the plan. Use this for tasks that span more than ~20 turns or where you notice the agent losing track of earlier decisions.

### 09 - Spec-Plan-Runbook

A three-phase pipeline: first write a specification (what to build), then derive a plan (how to build it), then generate an executable runbook (step-by-step commands and edits). Each document is reviewed before the next phase begins. Use this for complex features where ambiguity in the spec leads to wasted implementation effort.

### 10 - Context Degradation Lab

Observable experiments that measure how agent output quality changes as context accumulates. Includes baseline prompts, degradation triggers, and measurement rubrics. Use this to calibrate your own context management strategy and find the point where your project's context starts to degrade.

## Composability

These patterns are designed to combine. Some high-value compositions:

- **Checkpoints + Progress Recitation (03 + 08):** Checkpoints persist state across sessions; progress recitation keeps the agent anchored within a session. Together they cover both inter-session and intra-session coherence.
- **Hierarchical Context + DAG Decomposition (02 + 04):** Subdirectory context files give each agent the right local knowledge, while the DAG coordinates which tasks run in parallel. Essential for multi-agent work on large codebases.
- **Spec-Plan-Runbook + Checkpoints (09 + 03):** For multi-day features, write the spec and plan in session one, checkpoint, then execute the runbook across subsequent sessions.
- **Checkpoints + Progress Recitation + Spec-Plan-Runbook (03 + 08 + 09):** Maximum coherence for complex, multi-session features. The spec anchors intent, progress recitation prevents drift within sessions, and checkpoints carry state between them.
- **Memory Patterns + Any Strategy (07 + *):** Persistent memory is a universal add-on. Pair it with flat context for small projects or hierarchical context for large ones.

Start with the simplest pattern that fits your project (usually 01 or 02) and add layers only when you observe specific failure modes.

## How to Use

1. **Assess your project.** Pick the example that matches your codebase size, team structure, and session length. Most projects start with 01 (flat) or 02 (hierarchical).
2. **Copy the template files.** Copy the relevant `CLAUDE.md`, `AGENTS.md`, and any supporting files into your repo.
3. **Replace example content with your project's actual details.** The templates use various fictional projects (a task manager, an e-commerce platform, an analytics service, etc.) — swap in your real tech stack, architecture, conventions, and commands.
4. **Layer in additional patterns as needed.** If you work across multiple sessions, add checkpoints (03). If the agent drifts mid-session, add progress recitation (08). If your feature is complex, add spec-plan-runbook (09).
5. **Validate with the agent.** Ask the agent to summarize the context it sees. If it misses something, your files need restructuring.
6. **Review monthly — stale context is worse than no context.** Set a calendar reminder. When your codebase evolves, your context files must evolve with it. An outdated `CLAUDE.md` actively harms agent performance.

## Research References

- **Anthropic** — [Building Effective Agents](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/building-effective-agents), [Claude Long Context Tips](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/long-context-tips)
- **Manus** — [Context Engineering for AI Agents](https://manus.im/blog/Context-Engineering-for-AI-Agents-Lessons-from-Building-Manus)
- **OpenAI** — [Codex Cookbook](https://cookbook.openai.com/)
- **Codified Context** — Shankar et al., arxiv 2602.20478
- **Martin Fowler** — [Specification by Example](https://martinfowler.com/bliki/SpecificationByExample.html)
- **Cognition** — "Deep Agents" — Lessons from building long-horizon agent systems
