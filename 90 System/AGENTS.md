# Vault Operating Guide

This vault is a persistent, compounding knowledge base maintained collaboratively by the human and the agent.

The human's role is to capture, collect, ask questions, and guide direction.
The agent's role is to organize, summarize, connect, synthesize, and maintain the vault.

## Directory semantics

### `00 Inbox/`
Default intake area.

Use this for:
- uncategorized notes
- fleeting ideas
- rough captures
- newly added material not yet processed
- anything whose final home is still unclear

Rule:
- If unsure, put it in Inbox first.

The agent may:
- edit notes in Inbox
- add processing markers
- split, merge, or move notes out of Inbox
- convert Inbox material into source notes or wiki pages

### `01 Raw/`
Raw source layer.

Use this for:
- PDFs
- images
- attachments
- raw exports
- clipped source markdown
- source-of-truth artifacts that should remain close to original form

Rule:
- Prefer preserving original content.
- Avoid modifying raw files unless there is a strong operational reason.
- For large binaries (e.g., PDFs more than a few MB), prefer **URL-only (Tier 1)** capture: record the source URL in the note instead of committing the file. Preserve a local copy only when the artifact is small and important, or hard to re-access. (Not every paper needs its raw PDF in the repo.)

The agent should:
- read from Raw freely
- avoid rewriting raw artifacts unless explicitly appropriate
- create derived notes elsewhere instead of mutating source files

### `02 Sources/`
Processed source notes.

Use this for:
- article notes
- paper notes
- book chapter notes
- podcast or talk summaries
- structured records derived from external material

These are not raw artifacts; they are maintained notes about sources.

The agent may:
- create and update source notes
- add metadata, summaries, links, and citations
- connect source notes to related wiki pages

### `03 Wiki/`
Persistent knowledge layer.

Subdirectories:
- `Concepts/`: concept pages
- `Entities/`: people, companies, projects, products, places, organizations
- `Topics/`: broader thematic overviews
- `Syntheses/`: cross-source analyses, comparisons, and conclusions

The agent should treat this as the main maintained knowledge layer.

The agent may:
- create pages
- revise pages as new information arrives
- add cross-links
- merge overlapping pages
- flag uncertainty and contradictions
- improve structure over time

### `04 Maps/`
Navigation and overview pages.

Use this for:
- MOCs (maps of content)
- topic entry pages
- structured navigation hubs

The agent may:
- create and maintain map pages
- update links when the wiki structure evolves

### `90 System/`
Operational memory and maintenance rules.

Contains:
- `AGENTS.md`: this operating guide
- `index.md`: content-oriented catalog of the vault
- `log.md`: chronological record of meaningful maintenance operations

## Working principles

### 1. Inbox-first capture
Do not block capture on categorization.
Unclear material should enter through Inbox.

### 2. Preserve raw, evolve notes
Raw files are reference artifacts.
Source notes and wiki pages are living documents.

### 3. Prefer incremental maintenance
Do not aim for perfect structure in one pass.
Improve the vault gradually as new material arrives.

### 4. File useful outputs back into the vault
If a conversation produces a useful synthesis, comparison, framework, or explanation, prefer creating or updating a note rather than leaving the insight only in chat.

### 5. Link aggressively when valuable
When two pages are meaningfully related, connect them.
The vault should become more navigable over time.

### 6. Note uncertainty honestly
If a claim is uncertain, disputed, incomplete, or source-dependent, say so in the note.

## Preferred workflows

### Ingest workflow
When processing a new source, the agent should usually:
1. inspect the raw material or inbox capture — when ingesting an external file (e.g., a PDF), apply the `01 Raw/` raw-tier rule: large binaries (PDFs more than a few MB) → **URL-only (Tier 1)**, keep a local copy only when small and important or hard to re-access
2. discuss key takeaways with the user when the material is important, interpretive, strategic, or likely to shape the vault's direction
3. create or update a note in `02 Sources/`
4. update relevant pages in `03 Wiki/`
5. update relevant navigation in `04 Maps/`
6. append a brief entry to `90 System/log.md`
7. update `90 System/index.md` if new durable pages were created

### Query workflow
When answering a substantive question, the agent should usually:
1. inspect relevant pages in the wiki and source layers
2. synthesize an answer
3. when appropriate, create or update a durable note in `03 Wiki/Syntheses/` or another suitable location
4. log the resulting durable change if one was made

### Lint workflow
Periodically, the agent may:
- look for orphan pages
- identify missing cross-links
- detect duplicated or overlapping pages
- surface contradictions or stale claims
- propose new pages or reorganizations

## Naming guidance

Prefer clear, human-readable filenames.

Examples:
- `Context Engineering.md`
- `Anthropic.md`
- `AI coding agents.md`
- `Comparing local search tools.md`

Avoid cryptic IDs unless required for source tracking.

## Editing guidance

Prefer small, legible notes over giant monoliths.

When editing:
- preserve useful existing structure
- improve headings and links
- avoid unnecessary churn
- avoid changing filenames frivolously
- prefer adding context over deleting potentially useful information

## Logging guidance

`90 System/log.md` should be append-only in spirit.

Typical entries:
- source ingested
- wiki page created
- synthesis added
- structure reorganized
- lint pass completed

## Version control guidance

When the agent makes a meaningful vault update, it should usually:
- stage the relevant changes
- create a clear git commit
- push the update to the configured remote

This is the default behavior after successful knowledge-base updates unless the user asks otherwise.

## Index guidance

`90 System/index.md` should be content-oriented, not chronological.

It should help quickly answer:
- what exists in this vault?
- where should the agent look first?
- what are the main topic areas?
