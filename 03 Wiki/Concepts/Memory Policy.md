# Memory Policy

Memory policy is the part of an agent system that determines how memory-related actions are selected and executed over time.

## Core idea
Instead of treating memory only as an external store that passively supports retrieval, memory policy treats memory management as part of the agent’s behavior. On this view, the agent should learn or execute policies for operations such as writing, summarizing, compressing, retrieving, revising, merging, archiving, or discarding memory.

## Why it matters
This framing shifts memory from infrastructure to control. The important question becomes not only what information is available, but how the agent decides what to preserve, how to represent it, and when to reuse or transform it.

## Relevance to long-horizon agents
Long-horizon tasks make raw interaction history expensive and brittle. A strong memory policy can help the agent maintain compact, useful state across many steps without depending on ever-growing context windows.

## Connection to current work
[[MemPO: Self-Memory Policy Optimization for Long-Horizon Agents]] is a useful example of this direction. It treats memory summarization as an explicit policy action and gives memory tokens dedicated credit assignment during training.

## Relation to this vault’s main line
Memory policy is closely connected to:
- [[Self-managing memory as an in-distribution control problem]]
- [[Meta-skills for memory orchestration]]
- [[Task decomposition]]
- [[Agent orchestration]]

This concept is especially relevant when asking whether self-managed memory can be decomposed into trainable and reusable memory operations.

## Open questions
- What is the right action space for memory policy?
- How much of memory policy should be explicit versus latent?
- How should memory policy interact with retrieval systems and external stores?
- How should write, revise, merge, and discard decisions be trained?

## Related
- [[MemPO: Self-Memory Policy Optimization for Long-Horizon Agents]]
- [[Self-managing memory as an in-distribution control problem]]
- [[Meta-skills for memory orchestration]]
- [[Open questions in agent memory and decomposition]]
