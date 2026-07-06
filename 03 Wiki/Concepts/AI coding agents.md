# AI coding agents

## Definition
LM-driven systems that autonomously **write, run, debug, and manage software over many steps** — planning, spawning subagents, using tools (shell / editor / browser), and coordinating long-horizon workflows — rather than answering a single prompt.

## Why they matter in this vault
Coding agents appear mainly as **evidence for the [[Alex Zhang - The Mismanaged Geniuses Hypothesis|Mismanaged Geniuses Hypothesis]]**: they show that today's LMs can already produce plausible plans, launch subagents, and coordinate multi-step work — i.e. that a model can *manage other model calls*. They are the most mature real-world instance of [[Agent orchestration]] + [[Task decomposition]], and the empirical foothold for the claim that the bottleneck is orchestration/decomposition, not raw single-call capability.

## Vault instances
- [[Claude Code]] — orchestrator-subagent coding agent
- [[OpenClaw]] — agent-orchestration environment / referenced scaffold
- [[Hermes Agent]] — scaffold referenced for longer-horizon decomposition

## Key tensions (from the vault)
- **Hand-built scaffold vs learned control.** Current coding agents are largely engineered harnesses ([[Harness design]], [[Harnesses and managed agent systems]]); the open question ([[Open questions in agent memory and decomposition]]) is whether orchestration/decomposition should be **learned by the model** rather than hand-coded — the MGH position.
- **Decomposition language.** Agents that express plans as **code / recursion** (vs API-style tool calls) unlock deeper, more scalable composition — the bridge to [[Recursive Language Models]].
- **Memory over long runs.** Sustaining task trees + intermediate state connects to [[Agent memory]].

## Related
- [[Agent orchestration]] · [[Task decomposition]] · [[Recursive Language Models]] · [[Harness design]]
- [[Anthropic - Scaling Managed Agents Decoupling the brain from the hands]] — managed-agent architecture (brain/hands split)
- [[Alex Zhang - The Mismanaged Geniuses Hypothesis]] — the hypothesis coding agents are evidence for

## tags
#concept #agent #coding-agents #orchestration
