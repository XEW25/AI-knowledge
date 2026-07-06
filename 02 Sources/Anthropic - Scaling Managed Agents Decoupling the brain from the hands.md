# Scaling Managed Agents: Decoupling the brain from the hands

- Raw note: [[2026-04-12 - Anthropic - Scaling Managed Agents Decoupling the brain from the hands]]

## Metadata
- Type: source note
- Format: web engineering article
- Authors: Lance Martin, Gabe Cemaj, Michael Cohen
- Organization: [[Anthropic]]
- Date accessed: 2026-04-12
- Original URL: https://www.anthropic.com/engineering/managed-agents
- Related: [[Harness design]], [[Agent orchestration]], [[Memory Policy]], [[OpenClaw]]
- Tags: #managed-agents #agent-systems #harness-design #orchestration #long-horizon

## Summary
This article presents Anthropic’s managed-agents architecture as a response to a recurring problem in agent engineering: harness assumptions go stale as models improve. Rather than baking specific harness decisions into one tightly coupled runtime, the article proposes stable interfaces that separate the session, the harness (brain), and the sandbox/tool environment (hands).

The article’s strongest idea is that agent systems should be designed around abstractions that outlast any one implementation. In this framing, a managed-agent system is not just a particular harness but a meta-harness: a system of interfaces that can host many future harness designs.

## Key claims
1. Harnesses encode assumptions about current model weaknesses, and those assumptions may stop being valid over time.
2. Long-running agent systems benefit from decoupling the brain, the hands, and the durable session log.
3. The session should be treated as a durable context object outside Claude’s immediate context window.
4. Stable interfaces allow many brains and many hands to scale independently.
5. Security should be improved structurally by preventing sandboxes from directly accessing credentials.

## Why it matters
This article extends the harness-design discussion in the vault by moving from individual harness patterns to system abstractions around harnesses. It provides a useful engineering framing for questions like:
- what should remain stable as models improve?
- which parts of the agent runtime should be replaceable?
- how should durable context live outside the immediate model context?
- how do we scale orchestration across multiple brains and multiple execution environments?

It is especially relevant to any future work on agent platforms, managed execution, memory/state separation, or long-running orchestration systems.

## What feels strong
- The article clearly identifies harness assumptions as time-sensitive and perishable.
- The separation of session, harness, and sandbox is a strong systems design move.
- The OS analogy is useful: stable abstractions over changing implementations.
- The discussion of security boundaries is concrete and structural.
- The “session is not Claude’s context window” point is especially valuable.

## What feels limited
- This is an engineering architecture article, not a formal evaluation paper.
- The abstractions are persuasive, but the article does not fully specify all the tradeoffs or failure modes.
- It focuses on Anthropic’s managed-agents setting, so some implementation details may not transfer directly.

## Ada’s notes
The strongest contribution here is the move from **harness design** to **meta-harness design**. The article is not only saying “here is a better harness.” It is saying that if harnesses evolve with model capability, then the system around them should expose durable interfaces rather than hard-coding today’s assumptions.

What stands out most:
- session as durable context object outside the context window
- harness as a replaceable orchestration layer
- sandboxes/tools as interchangeable hands
- structural separation for security
- scaling to many brains and many hands

This feels like a useful next step in the vault’s current arc from decomposition → orchestration → harness design → platform abstractions.

## Questions worth following up
1. What are the right stable abstractions for future agent platforms?
2. How should session logs relate to memory systems and long-term state?
3. Which harness concerns belong in the harness itself versus in a higher-level meta-harness?
4. How general is the many-brains / many-hands interface beyond Anthropic’s setting?

## Possible downstream vault work
- Update [[Harness design]]
- Potentially add a future concept or synthesis around meta-harness design
- Extend agent-platform and long-running orchestration notes
- Add entities for the named authors if they become more central later
