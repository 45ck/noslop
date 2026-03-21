# 05 — Prompt Company

## Vision

Your dev team's playbook — roles, processes, handoffs, quality gates — encoded as
structured prompt documents that AI agents can follow autonomously or
semi-autonomously.

Instead of tribal knowledge living in people's heads, every process is a document.
Instead of onboarding taking weeks, a new agent (human or AI) reads the docs and
starts contributing. The tech lead decomposes work, specialized agents implement,
QA validates — all following the same written playbook your human team already uses.

## When this makes sense

- **Mature teams** with established processes that are already documented (or should be).
- **Teams scaling with AI** who want agents to follow the same standards as humans.
- **Orgs with clear role boundaries** — backend, frontend, QA, tech lead.
- **Products with consistent patterns** — CRUD APIs, standard UI components, well-defined data models.

This approach does NOT make sense for greenfield exploration, research spikes, or
teams that haven't yet figured out what "good" looks like for them.

## What's included

```
05-prompt-company/
  CLAUDE.md                          # Company-wide engineering standards (all agents see this)
  AGENTS.md                          # Orchestration: routing, handoffs, conflict resolution
  .claude/agents/
    tech-lead.md                     # Decomposes features, reviews PRs, makes arch decisions
    backend-dev.md                   # Implements APIs, services, database changes
    frontend-dev.md                  # Implements UI features, pages, components
    qa-engineer.md                   # Reviews quality, writes tests, files bugs
  docs/processes/
    feature-lifecycle.md             # Feature request through production deployment
    incident-response.md             # Severity levels, triage, fix, postmortem
    code-review.md                   # Review checklist, feedback style, approval criteria
  docs/standards/
    api-design.md                    # REST conventions, error format, pagination
    testing.md                       # Test pyramid, naming, coverage targets
```

## How agents use it

1. **CLAUDE.md** is loaded for every agent. It sets the universal rules.
2. **AGENTS.md** determines which agent handles a given task.
3. The **tech lead** reads a feature request, decomposes it into tasks, and assigns
   them to backend-dev, frontend-dev, or both.
4. **Dev agents** pick up tasks, follow the checklists in their role docs, reference
   the standards in `docs/standards/`, and create PRs.
5. The **QA engineer** reviews implementations, writes additional tests, and files
   bugs when something doesn't meet the bar.
6. The **tech lead** does final PR review, resolves conflicts, and approves merges.

## Where This Falls Apart

Three failure modes appear consistently in multi-agent prompt-company setups:

**Telephone game.** Context degrades with each handoff. The product manager writes
a nuanced requirement ("reset tokens must be single-use to prevent replay attacks").
The tech lead decomposes it into tasks and preserves the security intent. But by the
time the frontend dev picks up their task, the handoff just says "show an error for
used tokens" -- the security reasoning is gone. When the frontend dev encounters an
edge case the task does not cover, they make a guess without the original context.
The more agents in the chain, the more nuance is lost. Mitigation: every handoff
must link back to the original feature request, and agents must read it.

**Process compliance theater.** Agents follow the process steps mechanically without
understanding the intent. The checklist says "write tests that cover acceptance
criteria," so the agent writes tests that technically assert each criterion but use
trivial inputs that never exercise real edge cases. The review checklist says "check
for backward compatibility," so the agent writes "no backward compatibility issues"
without actually checking. Every box is ticked, every artifact exists, and the
feature still ships with bugs. The process produces the appearance of rigor without
the substance. Mitigation: postcondition checks must be runnable commands, not
prose descriptions. If you cannot verify it automatically, it is not a real gate.

**Coordination overhead.** With four or more agents, the time spent on handoffs,
context sharing, waiting for dependencies, and resolving misunderstandings exceeds
the time saved by parallelism. A single agent with broad permissions and full
context can often complete a feature faster than a four-agent pipeline where each
agent waits for the previous one and writes handoff documentation. The sweet spot
for most teams is two to three agents with overlapping context. Add more agents only
when you have proven that the parallelism benefit outweighs the coordination cost.

## Limitations

- Prompt documents are not a substitute for good judgment. They encode the common
  case well but can't cover every edge case.
- **Human review checkpoints are essential.** The tech-lead agent should flag
  decisions it's uncertain about rather than guessing.
- Agents will follow the letter of the docs, not the spirit. If your process doc
  has a gap, the agent will do something unexpected in that gap.
- Complex architectural decisions (new service boundaries, technology choices,
  security-sensitive changes) should always involve a human.
- These docs need maintenance. When your team's process changes, update the prompts.

## How to customize

1. **Start with one role.** Pick the role with the most repetitive work (often
   backend-dev) and write its agent doc first.
2. **Add the CLAUDE.md** with your actual tech stack, conventions, and universal rules.
3. **Run it on real tasks.** Give the agent a recent feature ticket and see where it
   gets stuck or goes off-track.
4. **Fill gaps.** Every place the agent struggled is a place your docs need more detail.
5. **Add more roles** as you identify bottlenecks. If PRs pile up because no one
   reviews them, add the QA engineer. If tasks are poorly defined, add the tech lead.
6. **Iterate.** These docs are living documents. Review them monthly and update based
   on what the team has learned.

## Key principle

If a human on your team would need to know it to do their job, write it down.
If it's written down clearly enough for a new hire, it's written down clearly
enough for an AI agent.
