# LLM Wiki

## Definition
LLM Wiki is a knowledge-management pattern in which an LLM incrementally builds and maintains a persistent markdown wiki that sits between raw sources and future questions.

Instead of rediscovering relevant facts from scratch on every query, the agent continuously compiles knowledge into durable notes, links, summaries, and syntheses.

## Core claims
- A persistent wiki compounds over time.
- Useful knowledge should be compiled once and then maintained.
- Source notes, concept pages, entity pages, and syntheses should be updated as new information arrives.
- Valuable outputs from conversations should often become durable notes.
- The maintenance burden that causes most human-run wikis to decay can be offloaded to an LLM.

## Typical layers
- Raw source layer
- Source note layer
- Persistent wiki layer
- Schema / operating guide layer

## Operational pattern
A typical LLM Wiki workflow includes:
- ingesting new sources
- updating source notes
- revising related wiki pages
- maintaining indexes and logs
- answering questions from the maintained wiki
- filing useful answers back into the wiki
- periodically linting for gaps, contradictions, and stale claims

## Benefits
- stronger continuity across sessions
- less repeated reconstruction work
- more durable synthesis
- better cross-linking and discoverability
- lower maintenance burden for the human

## Risks and caveats
- the wiki can drift if source discipline is weak
- bad summaries can harden into durable notes if not corrected
- naming, linking, and maintenance conventions matter
- raw sources should remain accessible as a grounding layer

## Related notes
- [[Andrej Karpathy - LLM Wiki]]
- [[90 System/AGENTS]]
