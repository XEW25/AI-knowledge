# Agent systems, decomposition, and memory

## Purpose
This map collects the cluster of pages in the vault that deal with agent organization, long-horizon behavior, decomposition, and memory control.

## Entry points
### Sources
- [[Alex Zhang - The Mismanaged Geniuses Hypothesis]]
- [[Andrej Karpathy - LLM Wiki]]
- [[MemPO: Self-Memory Policy Optimization for Long-Horizon Agents]]
- [[Harness design for long-running application development]]
- [[Scaling Managed Agents Decoupling the brain from the hands]]

### Concepts
- [[LLM Wiki]]
- [[Task decomposition]]
- [[Agent orchestration]]
- [[Recursive Language Models]]
- [[Harness design]]

### Topics
- [[Agent memory]]
- [[Harnesses and managed agent systems]]
- [[Open questions in agent memory and decomposition]]

### Syntheses
- [[Self-managing memory as an in-distribution control problem]]
- [[Meta-skills for memory orchestration]]

### Entities
- [[Alex Zhang]]
- [[Andrej Karpathy]]
- [[Anthropic]]
- [[Prithvi Rajasekaran]]
- [[Claude Code]]
- [[OpenClaw]]
- [[Hermes Agent]]

## Narrative spine
A useful narrative through these pages is:

1. [[LLM Wiki]] proposes that knowledge should be compiled into a persistent maintained wiki rather than reconstructed from raw sources every time.
2. [[Alex Zhang - The Mismanaged Geniuses Hypothesis]] argues that AI capability may be bottlenecked by poor decomposition and orchestration rather than only by base-model quality.
3. [[Task decomposition]] and [[Agent orchestration]] provide the core conceptual tools for understanding that claim.
4. [[Harness design]] adds the engineering perspective that system scaffolding and load-bearing components materially shape long-running agent performance.
5. [[Scaling Managed Agents Decoupling the brain from the hands]] extends that line upward into platform abstractions, arguing for stable interfaces around sessions, harnesses, and execution environments.
6. [[Recursive Language Models]] suggest that richer decomposition languages may unlock stronger long-horizon behavior.
7. [[Self-managing memory as an in-distribution control problem]] extends this logic into memory systems.
8. [[Meta-skills for memory orchestration]] proposes a concrete route for turning memory management into reusable control policies.

## Main themes
### 1. Decomposition as capability multiplier
A recurring theme in the vault is that models may already possess many useful local competencies, while failing mainly at composition, sequencing, and control.

### 2. Memory as control, not just storage
Another recurring theme is that memory systems should be thought of not just as retrieval layers but as actively managed substrates involving write, merge, revise, and discard decisions.

### 3. Systems matter
The vault increasingly treats capability as a property of systems, not just single model calls.

## Suggested next additions
- a page on long-horizon agents as composition systems
- a page on open questions for agent memory research
- more entity pages for authors and systems in this cluster
- comparisons among agent scaffolds and decomposition languages

## Related maps
- [[Home]]
