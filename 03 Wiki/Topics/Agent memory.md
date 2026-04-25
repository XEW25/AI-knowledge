# Agent memory

## Purpose
This topic page collects the vault’s current work on memory in agent systems.

## Scope
This topic covers:
- memory as policy
- self-managed memory
- memory operations and decomposition
- meta-skills for memory orchestration
- long-horizon memory behavior
- training memory-related skills and policies

## Key entry points
### Concepts
- [[Memory Policy]]
- [[Task decomposition]]
- [[Agent orchestration]]

### Syntheses
- [[Self-managing memory as an in-distribution control problem]]
- [[Meta-skills for memory orchestration]]

### Sources
- [[MemPO: Self-Memory Policy Optimization for Long-Horizon Agents]]
- [[Alex Zhang - The Mismanaged Geniuses Hypothesis]]
- [[Huang et al. - ChemBot Long-Term Memory for VLA-based Agents]]

## 具身智能中的记忆

ChemBot 提出了一个双层记忆架构用于化学实验室机器人：
- **短期记忆（Dashboard）**：结构化当前状态压缩进 context window
- **长期记忆（Episodic）**：跨 session 历史经验语义检索

**关键观察（Ethan）**：ChemBot 的记忆只在上层规划 agent，底层 Skill-VLA 没有记忆。这引发一个开放问题：
> 底层执行模型需不需要自己的记忆？理想情况下两层都应有——上层记"做什么"（策略经验），下层记"怎么做"（操作经验）。

不同工作的记忆分配：
- **ChemBot**：只有上层记忆（RAG 检索历史经验）
- **RL Tokens**：底层隐式记忆（RL 策略更新 = 肌肉记忆）
- **MemPO**：显式 memory as policy
- **Voyager**：技能库作为长期记忆（上层）

## Current thesis direction
A recurring idea in this cluster is that memory management may look out-of-distribution only when treated as a monolithic capability. If decomposed into explicit operations, many of those operations may already be close to in-distribution for strong models. The key challenge then becomes learning the right decomposition and orchestration policy over memory operations.

## Main subthemes
- memory as explicit policy or action
- memory write/compress as trainable subproblems
- retrieval versus write-path importance
- meta-skills as reusable memory-control policies
- trajectory-based training for memory operations

## Open questions
- Which memory operations are easiest to make trainable first?
- How should memory-policy training interact with retrieval systems and external stores?
- What is the right operation space for memory control?
- How do we learn the correct decomposition policy over memory work?

## Related
- [[Open questions in agent memory and decomposition]]
- [[Agent systems, decomposition, and memory]]
