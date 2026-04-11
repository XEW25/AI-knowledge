# MemPO: Self-Memory Policy Optimization for Long-Horizon Agents

- Raw note: [[2026-04-11 - Li et al. - MemPO Self-Memory Policy Optimization for Long-Horizon Agents]]

## Metadata
- Type: source note
- Format: arXiv paper
- Authors: [[Ruoran Li]], [[Xinghua Zhang]], [[Haiyang Yu]], [[Shitong Duan]], [[Xiang Li]], [[Wenxin Xiang]], [[Chonghua Liao]], [[Xudong Guo]], [[Yongbin Li]], [[Jinli Suo]]
- Date accessed: 2026-04-11
- Original URL: https://arxiv.org/abs/2603.00680
- PDF URL: https://arxiv.org/pdf/2603.00680
- Local PDF: [[2026-04-11 - Li et al. - MemPO Self-Memory Policy Optimization for Long-Horizon Agents.pdf]]
- Code: https://github.com/TheNewBeeKing/MemPO
- Related: [[Memory Policy]], [[Task decomposition]], [[Agent orchestration]], [[Self-managing memory as an in-distribution control problem]], [[Meta-skills for memory orchestration]]
- Tags: #agent-memory #long-horizon #reinforcement-learning #memory-policy #agent-systems

## Summary
This paper argues that long-horizon agents should not rely only on external memory systems or retrieval-based memory modules. Instead, memory should become an explicit part of the agent policy. MemPO implements this by giving the agent a dedicated `<mem>` action, alongside reasoning and tool-use actions, and training that memory-writing behavior with a dedicated reinforcement-learning signal.

The core contribution is to treat memory summaries as trainable policy outputs. The paper then scores those memory outputs by whether they increase the model’s conditional probability of producing the correct answer. This gives memory tokens denser and more targeted credit assignment than a sparse trajectory-level success reward.

## Key claims
1. Memory should be treated as an intrinsic policy capability rather than only as an external retrieval subsystem.
2. Explicit memory-writing actions help long-horizon agents maintain useful compressed state across interaction steps.
3. Memory-specific reward improves credit assignment for long-horizon agents.
4. Stronger memory policy can improve both performance and token efficiency.

## Why it matters
For this vault, the most important part of the paper is not just that it improves benchmarks. It provides direct support for the idea that **memory can be reframed as a learned action policy** rather than merely as an external storage-and-retrieval pipeline.

This fits strongly with the emerging thesis in the vault that self-managing memory may become tractable when decomposed into explicit operations and trained as controllable behavior. MemPO is especially relevant because it focuses on the write/compress side of memory and ties memory quality to downstream task usefulness.

## What feels strong
- The paper gives a concrete operationalization of `memory as policy`.
- It does not merely add a memory module; it changes the action space of the agent.
- The memory-specific reward is a crisp answer to the question of how to supervise memory quality.
- The token-efficiency gains are a meaningful part of the contribution.

## What feels limited
- The method focuses most strongly on memory writing/compression, not the full memory lifecycle.
- It does not yet cover richer memory operations such as revise, merge, discard, or schema alignment.
- The memory reward depends on gold-answer availability during training.
- Group-based memory-advantage normalization may be biased when rollouts diverge substantially.

## Ada’s notes
The most valuable framing from this paper is `memory as action / policy`, more than the specific reward function itself. The reward is important, but mainly because it makes that framing trainable. In the context of this vault, MemPO looks like strong supporting evidence for the broader line:

- memory should not be viewed only as retrieval infrastructure
- memory management can be decomposed into explicit operations
- some parts of self-managed memory may be learnable as near-distribution control behavior

MemPO appears to be an early but concrete example of that shift.

## Questions worth following up
1. How far can the `memory as action` framing be extended beyond summarization into revise / merge / discard / retrieval control?
2. What is the right general action space for memory policy?
3. Can memory usefulness be supervised without gold answers?
4. How should explicit memory policy interact with meta-skills for memory orchestration?

## Possible downstream vault work
- Create or expand [[Memory Policy]]
- Update [[Self-managing memory as an in-distribution control problem]]
- Update [[Meta-skills for memory orchestration]]
- Extend the open problems thread in [[Open questions in agent memory and decomposition]]
