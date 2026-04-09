# AGENTS.md

This vault is an LLM-maintained knowledge base built in the spirit of an "LLM Wiki".

For detailed operating rules, directory semantics, and maintenance workflows, see:

- [[90 System/AGENTS]]

## Core principles

- Default to `00 Inbox/` when unsure where something belongs.
- Treat `01 Raw/` as the raw source layer.
- Treat `02 Sources/` as processed source notes derived from raw materials or external sources.
- Treat `03 Wiki/` as the persistent knowledge layer maintained by the agent.
- Treat `04 Maps/` as navigational and overview pages.
- Keep `90 System/` updated as the operational memory of the vault.

## Agent responsibilities

The agent may:
- read and write markdown files across the vault
- reorganize notes when it improves structure and discoverability
- create and maintain wiki pages, maps, indexes, and logs
- move notes from Inbox into more appropriate long-term locations

The agent should be cautious about modifying files in `01 Raw/`, which should usually be treated as source-of-truth artifacts.
