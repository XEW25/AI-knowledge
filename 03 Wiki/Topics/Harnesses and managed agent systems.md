# Harnesses and managed agent systems

## Purpose
This topic page collects the vault’s current work on harness design, managed-agent architecture, and long-running agent system structure.

## Scope
This topic covers:
- long-running agent harnesses
- planner / generator / evaluator structures
- context reset versus compaction
- session / harness / sandbox separation
- managed-agent platform abstractions
- load-bearing versus obsolete harness components

## Key entry points
### Concepts
- [[Harness design]]
- [[Agent orchestration]]
- [[Task decomposition]]

### Sources
- [[Harness design for long-running application development]]
- [[Scaling Managed Agents Decoupling the brain from the hands]]

### Entities
- [[Anthropic]]
- [[Prithvi Rajasekaran]]
- [[Claude Code]]
- [[OpenClaw]]

## Current thesis direction
A recurring pattern in this cluster is that harnesses should be treated as evolving system components rather than fixed wrappers around a model. As models improve, some harness assumptions stop being load-bearing, which motivates both harness simplification and higher-level platform abstractions that can host future harness variants.

## Main subthemes
- evaluator separation as a quality lever
- context management strategies for long-running work
- artifact and contract interfaces between agents
- decoupling durable session state from active context
- meta-harness thinking and stable platform interfaces

## Open questions
- Which harness components generalize across domains?
- Which assumptions are most likely to go stale as models improve?
- What are the right stable interfaces for managed-agent platforms?
- How should many-brains / many-hands architectures be exposed to users and developers?

## Related
- [[Agent systems, decomposition, and memory]]
- [[Harness design]]
