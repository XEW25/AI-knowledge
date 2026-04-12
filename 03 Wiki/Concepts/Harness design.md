# Harness design

Harness design is the design of the surrounding system that structures how an AI model or agent operates over time.

## Core idea
A harness is not just a wrapper. It is the operational scaffold that determines how work is decomposed, how context is managed, how tools are invoked, how artifacts are handed off, how evaluation is performed, and how multiple agents or sessions are coordinated.

## Why it matters
For long-running and complex tasks, raw model quality is often not enough. A strong harness can materially change system behavior by compensating for specific model weaknesses such as context degradation, weak self-evaluation, poor long-horizon coherence, or insufficient decomposition.

## Typical harness components
Common harness components include:
- planners or initializers
- generators / executors
- evaluators / critics / QA agents
- context reset or compaction strategies
- structured artifacts or handoff files
- contracts or intermediate specifications
- tool and environment interfaces
- retry / iteration loops

## Load-bearing harnesses
A useful way to think about harness design is that each component encodes an assumption about what the base model cannot yet do reliably on its own. As models improve, some harness components may stop being load-bearing and should be simplified or removed.

## From harness design to meta-harness design
A further extension of this idea is that if harness assumptions are perishable, then the surrounding system should not be too tightly coupled to today’s harness. This points toward a higher-level design problem: building stable interfaces around future harnesses.

One useful framing is to separate:
- the **session** as the durable event/state layer
- the **harness** as the orchestration or reasoning loop
- the **sandbox / tools** as the execution layer

This kind of abstraction allows harness implementations to evolve while keeping the broader system architecture stable. In that sense, harness design can grow into a broader concern with platform abstractions or meta-harness design.

## Relevance to long-horizon agent systems
Harness design is especially important for:
- long-running coding agents
- multi-agent systems
- autonomous research and planning loops
- tasks where quality must be externally evaluated rather than self-assessed

## Relation to this vault
Harness design is closely connected to:
- [[Agent orchestration]]
- [[Task decomposition]]
- [[Claude Code]]
- [[OpenClaw]]
- [[Harness design for long-running application development]]
- [[Scaling Managed Agents Decoupling the brain from the hands]]

It is a useful concept for understanding when capability gains come from better scaffolding rather than only from better base models, and when platform abstractions should be designed to outlast any single harness implementation.

## Open questions
- Which harness components generalize across domains?
- How do we tell whether a harness component is still load-bearing for a newer model?
- Which parts of a harness should remain engineered versus learned?
- How should artifact interfaces be designed for long-running collaboration?

## Related
- [[Agent orchestration]]
- [[Task decomposition]]
- [[Harness design for long-running application development]]
- [[Scaling Managed Agents Decoupling the brain from the hands]]
- [[Claude Code]]
- [[OpenClaw]]
- [[Anthropic]]
- [[Harnesses and managed agent systems]]
