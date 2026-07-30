# Task Decomposition as OOD Mitigation

## The idea
A recurring thesis across this vault: **breaking an out-of-distribution (OOD) task into a composition of in-distribution subtasks** turns an unsolvable end-to-end problem into a sequence/graph of individually-solvable steps. On this view decomposition is not just an engineering convenience — it is a **generalization mechanism**. (Ethan's framing; it recurs independently in both the embodied and the agent clusters, which is why it earns its own page distinct from the general [[Task decomposition]].)

## Why it works
A model can be strongly competent on short, in-distribution steps yet fail a long-horizon task end-to-end — per-step success `p` compounds as `p^N` over `N` steps. If each subtask is kept in-distribution **and** the composition is correct, the overall OOD task becomes tractable. The hard problem is traded from "scale a monolith until the whole task is in-distribution" to "find/learn the right decomposition + composition."

## The same idea in two clusters
- **Embodied** (the alternative to a monolithic [[VLA - Vision-Language-Action Models|VLA]]):
  - [[Huang et al. - ReKep Spatiotemporal Reasoning Keypoint Constraints for Robotic Manipulation|ReKep]] — task → per-stage keypoint constraints (LLM writes them, solver executes); "understand" decoupled from "actuate".
  - [[Physical Intelligence - RL Tokens Precise Manipulation with Efficient Online RL|RL Tokens]] — **capability-level** decomposition: freeze the VLA, add a small RL expert so precise manipulation becomes a small network's in-distribution problem.
  - [[Huang et al. - ChemBot Long-Term Memory for VLA-based Agents|ChemBot]] — agent-as-planner + VLA-as-skill (subtask-instruction interface).
- **Agent systems**:
  - [[Alex Zhang - The Mismanaged Geniuses Hypothesis|Mismanaged Geniuses Hypothesis]] — train models to choose good decompositions so each LM call stays in-distribution while the system composes many calls.
  - [[Recursive Language Models]] — code/recursion as a richer decomposition language.

## Decomposition spectrum (the interface varies, the kernel doesn't)
constraint functions (ReKep) ←→ compact tokens (RL Tokens) ←→ natural-language subtasks (ChemBot) ←→ code / recursion (RLM). All share one kernel: **OOD → in-distribution subproblems**. See [[Task decomposition]] for the general treatment and the interface/dimension spectrum.

## ⚠️ 边界条件：拆解不解决探索（实测反证）
本页主张"拆成分布内子任务即可解"。**[[Heravi et al. - LEACL LLM-Enhanced Automatic Curriculum Learning for RL in Long-Horizon Manipulation|LEACL]] 给出了它的边界**：在 5 个长程操控任务上，**任务拆解 + 稀疏奖励 ≈ 0% 成功率**（3 个任务全 0）。拆解把长程变短程，却**没让子任务变得可学**——"把夹爪送到抽屉旁"不等于"抓得住把手"；接触丰富的子任务即便 horizon 很短，稀疏奖励下依然学不动。

**应记入的修正**：拆解解决的是**任务长度 / 信用分配**，**不自动解决探索**。每个子任务内部仍需自己的易→难脚手架（课程 / 参数化难度梯度）。

对 Agentic 框架的含义：光把目标设成"一个短、高-p 的已验证技能库"不够——**技能本身怎么被训出来**需要多一层。分工是 **L3 管段间纠错（失败检测/重规划），课程管段内可学性**。

## Open questions
- What is the best decomposition **language** (natural language / code / DSL / latent)?
- **Credit assignment** for *learning* the decomposition itself (not just the final answer).
- Where decomposition genuinely beats scaling — vs where it merely relocates the hard part into the composition policy.

## Related
- [[Task decomposition]] — the general concept; this page is its OOD-specific lens
- [[Huang et al. - ReKep Spatiotemporal Reasoning Keypoint Constraints for Robotic Manipulation]] · [[Physical Intelligence - RL Tokens Precise Manipulation with Efficient Online RL]] · [[Huang et al. - ChemBot Long-Term Memory for VLA-based Agents]]
- [[Alex Zhang - The Mismanaged Geniuses Hypothesis]] · [[Recursive Language Models]] · [[Agent orchestration]]
- [[Embodied model function evolution - generalization as the master line]] — the `p^N` long-horizon collapse and why Agentic composition is the response

## tags
#concept #decomposition #ood #generalization #embodied #agent
