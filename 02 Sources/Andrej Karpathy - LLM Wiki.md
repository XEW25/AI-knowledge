# LLM Wiki

## Summary
LLM Wiki is a pattern for building a personal or team knowledge base in which an LLM incrementally maintains a persistent, interlinked markdown wiki rather than answering solely by retrieving raw files at query time. The central claim is that knowledge should be compiled into durable notes, cross-links, syntheses, and indexes that improve over time instead of being rediscovered from scratch for every question.

## Core idea
Most document-oriented LLM workflows behave like RAG: raw files are uploaded, relevant chunks are retrieved at query time, and the model reconstructs an answer each time. LLM Wiki proposes a different architecture:

- keep raw sources as an immutable reference layer
- maintain a persistent wiki as the compiled knowledge layer
- use an agent guide or schema to define how the LLM should ingest, update, query, and lint the wiki

The wiki is the key artifact. It is cumulative, interlinked, and continuously revised as new material arrives. Contradictions can be flagged, syntheses can be refined, and useful outputs from conversations can be filed back into the wiki as durable pages.

## Architecture
The method describes three layers:

1. Raw sources
   - source documents, articles, papers, images, and other reference materials
   - treated as source-of-truth artifacts
   - read by the LLM but usually not modified

2. The wiki
   - a directory of markdown pages maintained by the LLM
   - includes summaries, concept pages, entity pages, comparisons, overviews, and syntheses
   - serves as the primary knowledge interface for future queries

3. The schema
   - a configuration document such as `AGENTS.md`
   - defines structure, naming conventions, workflows, maintenance rules, and behavioral expectations for the agent

## Key operations
The method highlights three recurring operations:

### Ingest
When a new source arrives, the agent should:
- read the source
- discuss or identify key takeaways
- write or update a source note
- revise relevant wiki pages
- maintain indexes and logs

A single source may update many wiki pages if it affects multiple entities or themes.

### Query
Questions should be answered primarily through the wiki and source notes rather than raw retrieval alone. When a useful synthesis, comparison, or analysis emerges, it should often be persisted back into the wiki as a durable note.

### Lint
The agent should periodically inspect the vault for:
- contradictions
- stale claims
- orphan pages
- missing cross-links
- missing concept pages
- opportunities for further search or refinement

## Indexing and logging
The method explicitly recommends two system files:

- `index.md`: a content-oriented catalog of the knowledge base
- `log.md`: a chronological record of ingests, queries, and maintenance operations

This matches the operating pattern of a vault that compounds over time.

## Why it matters
The method argues that the bottleneck in knowledge management is not reading but maintenance: updating summaries, cross-references, and syntheses across many pages. LLMs are well-suited to this bookkeeping work because they can revise many related pages in one pass without boredom or friction. This makes a maintained wiki much more realistic than a human-only workflow.

## Relevance to this vault
This idea strongly aligns with the design of this vault:
- `01 Raw/` corresponds to the raw source layer
- `02 Sources/` corresponds to processed source notes
- `03 Wiki/` corresponds to the persistent knowledge layer
- `90 System/AGENTS.md` corresponds to the schema / operating guide

In other words, this vault is an implementation of the LLM Wiki pattern.

## Notes
The idea was described by Andrej Karpathy in `llm-wiki.md` and framed as a general pattern rather than a fixed software product or rigid specification.
