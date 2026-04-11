# Meta-skills for memory orchestration

## Core idea
A promising way to build stronger memory-capable agents is to treat memory management not as a single monolithic faculty, but as a controllable process composed of reusable higher-order skills.

These **meta-skills** are not ordinary task skills. They are skills for deciding how memory itself should be handled: what to store, how to structure it, when to retrieve it, how to consolidate it, and how to revise or discard it over time.

In this framing, meta-skills function as reusable policies for memory control.

## Why meta-skills
A model that manages memory from scratch on every task is likely to be brittle and inconsistent. The hope behind meta-skills is that many memory operations recur across tasks and can therefore be abstracted into reusable control templates.

Examples of recurring memory-control decisions:
- whether an observation is worth durable storage
- whether a memory should be episodic, semantic, or task-local
- how a new memory should align to an existing schema
- whether retrieved material should be summarized, merged, or left untouched
- whether existing memory should be revised in light of conflicting evidence
- when memory state should be compressed into a more reusable abstraction

## Meta-skills as decomposition policies
Meta-skills can be understood as decomposition policies over memory operations.

Instead of solving “memory management” end-to-end, the system learns reusable ways to decompose memory work into actions such as:
- detect
- classify
- write
- tag
- summarize
- retrieve
- rank
- compare
- merge
- consolidate
- revise
- archive
- discard

The role of a meta-skill is to decide when and how these operations should be invoked.

## Example meta-skills
### Intake skill
Determines whether new information should be ignored, kept only locally, or promoted into durable memory.

### Schema-alignment skill
Maps new information into an existing structure so that memory does not become a pile of unrelated fragments.

### Retrieval-and-grounding skill
Builds the right working set for the current task by selecting and shaping relevant memory.

### Consolidation skill
Rewrites fragmented or redundant memory into more compact and durable forms.

### Conflict-resolution skill
Handles contradictions, version drift, and uncertainty across multiple memories.

### Reflection skill
Examines recent task trajectories to identify what should be distilled into reusable memory or higher-level abstractions.

## Why this may help with OOD memory behavior
Advanced memory behavior often appears out-of-distribution when framed as a single autonomous capability. But many of its component operations are already familiar to strong models. Meta-skills may provide the bridge by turning open-ended memory management into a composition of more stable, near-distribution decisions.

This suggests that meta-skills could be a practical mechanism for implementing the broader idea in [[Self-managing memory as an in-distribution control problem]].

## Relationship to task decomposition
Meta-skills are a specialization of [[Task decomposition]] for memory control. They do not solve the external task directly. Instead, they regulate the information substrate on which longer-horizon task solving depends.

## Relationship to agent orchestration
Meta-skills can also be viewed as components of [[Agent orchestration]]. If orchestration governs how reasoning steps, tools, and subagents are coordinated, then memory meta-skills govern how information is preserved and transformed across time.

## Design implications
If memory is managed through meta-skills, then a strong memory architecture may need:
- explicit memory operation interfaces
- typed memory scopes
- schema-aware storage
- revision and merge policies
- provenance and confidence tracking
- periodic consolidation loops
- evaluation tasks that specifically test memory control quality

## Research hypotheses
1. Memory quality can improve substantially by learning reusable memory-control meta-skills.
2. Good memory systems require strong write, revise, and consolidate policies, not only good retrieval.
3. Meta-skills can stabilize memory behavior across tasks better than ad hoc prompting.
4. A useful path to self-managed memory may be to train meta-skills on simpler memory-control environments before scaling to open-ended tasks.

## Open questions
- What is the right ontology of memory meta-skills?
- Which memory operations should be explicit versus latent?
- How should meta-skills interact with task-specific skills?
- Can meta-skills be trained from delayed downstream reward, or do they need denser supervision?
- What benchmarks best reveal whether a model is actually managing memory well?

## Related
- [[Self-managing memory as an in-distribution control problem]]
- [[Task decomposition]]
- [[Agent orchestration]]
- [[Alex Zhang - The Mismanaged Geniuses Hypothesis]]
- [[Memory Policy]]
- [[MemPO: Self-Memory Policy Optimization for Long-Horizon Agents]]
