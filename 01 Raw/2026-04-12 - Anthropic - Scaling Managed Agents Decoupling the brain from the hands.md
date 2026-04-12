# Scaling Managed Agents: Decoupling the brain from the hands

- Source URL: https://www.anthropic.com/engineering/managed-agents
- Source type: web article
- Accessed at: 2026-04-12 11:31 Asia/Shanghai
- Organization: Anthropic
- Authors: Lance Martin, Gabe Cemaj, Michael Cohen

## Raw capture

This article introduces Anthropic’s managed-agents design and frames it as a response to the fact that harness assumptions go stale as models improve. Earlier harness work showed that long-running agent performance can be improved through context resets, evaluator separation, and structured orchestration. But those interventions are not timeless; as models improve, some once-useful scaffolding becomes dead weight.

### Core thesis
The article’s central claim is that long-running agent systems should be designed around stable interfaces rather than tightly coupled implementations. Anthropic’s answer is a hosted “Managed Agents” architecture that decouples three components:
- **session**: the durable append-only log of what happened
- **harness / brain**: the orchestration loop that calls Claude and routes tool use
- **sandbox / hands**: execution environments and tools that perform actions

The key design goal is to let these components evolve independently so the system can outlast any single harness design.

### Main ideas
1. **Harness assumptions expire.** A harness often encodes workarounds for limitations of the current model. As models improve, those workarounds may become unnecessary.
2. **Decouple the brain from the hands.** Do not force the orchestration layer to live inside the same execution environment as the sandbox.
3. **Decouple the session from Claude’s context window.** Store the durable event log outside the model context and let the harness retrieve slices as needed.
4. **Use stable abstractions.** Anthropic compares this to operating systems virtualizing hardware behind abstractions like process and file. They want session, harness, and sandbox to be similarly stable interfaces.
5. **Support many brains and many hands.** Once decoupled, multiple harnesses can connect to multiple execution environments without assuming everything lives in one container.

### The “pet” problem
Anthropic first put session, harness, and sandbox into a single container. That made the container a fragile “pet”: if it failed, the session was lost; if it became unresponsive, engineers had to nurse it back to health. It also made debugging and customer deployment awkward, especially when customers wanted Claude to work against resources in their own VPCs.

The new design turns containers into “cattle.” If a sandbox dies, the harness treats it as a tool failure and can reinitialize a new one. If the harness dies, it can wake back up from the durable session log. This makes failure recovery cleaner and reduces dependence on any single long-lived container.

### Security boundary
The article argues that untrusted generated code should not be able to reach credentials. In the decoupled architecture, credentials are either bundled with resources or held in a vault outside the sandbox. Claude-generated code runs in the sandbox, while credentialed access to tools is mediated by proxies or secure services outside it.

### Session vs context window
A major design point is that the session is not Claude’s context window. Instead, the session is a durable context object outside the model window. The harness can retrieve slices of the event log with `getEvents()`, transform them, and then decide what to pass into Claude’s active context. This separates durable context storage from context-management strategy.

### Many brains, many hands
Decoupling enables:
- faster time-to-first-token because sandboxes are provisioned only when needed
- multiple brains that do not each require their own pre-provisioned container
- multiple hands / execution environments that can be addressed as tools
- a general tool interface that works across containers, MCP servers, and other execution targets

### Why this article matters
This article matters because it moves one level above harness design into what it calls, implicitly, a **meta-harness** problem. Instead of asking only how to build a better harness for today’s model, it asks how to expose the right abstractions so future harnesses can be swapped in without rebuilding the whole system.

### Key patterns relevant to this vault
- stable interfaces around changing harnesses
- session as durable context object
- harness as replaceable orchestration layer
- sandbox as replaceable execution hand
- many brains / many hands scaling
- security through structural separation, not only prompt discipline
