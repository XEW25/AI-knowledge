# Agent memory

## Purpose
This topic page collects the vault’s current work on memory in agent systems.

## Scope
This topic covers:
- memory as policy
- self-managed memory
- memory operations and decomposition
- meta-skills for memory orchestration
- long-horizon memory behavior
- training memory-related skills and policies

## Key entry points
### Concepts
- [[Memory Policy]]
- [[Task decomposition]]
- [[Agent orchestration]]

### Syntheses
- [[Self-managing memory as an in-distribution control problem]]
- [[Meta-skills for memory orchestration]]

### Sources
- [[MemPO: Self-Memory Policy Optimization for Long-Horizon Agents]]
- [[Alex Zhang - The Mismanaged Geniuses Hypothesis]]

## Current thesis direction
A recurring idea in this cluster is that memory management may look out-of-distribution only when treated as a monolithic capability. If decomposed into explicit operations, many of those operations may already be close to in-distribution for strong models. The key challenge then becomes learning the right decomposition and orchestration policy over memory operations.

## Main subthemes
- memory as explicit policy or action
- memory write/compress as trainable subproblems
- retrieval versus write-path importance
- meta-skills as reusable memory-control policies
- trajectory-based training for memory operations

## Open questions
- Which memory operations are easiest to make trainable first?
- How should memory-policy training interact with retrieval systems and external stores?
- What is the right operation space for memory control?
- How do we learn the correct decomposition policy over memory work?

## Related
- [[Open questions in agent memory and decomposition]]
- [[Agent systems, decomposition, and memory]]
