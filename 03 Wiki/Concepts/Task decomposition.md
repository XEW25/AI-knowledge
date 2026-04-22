# Task decomposition

Task decomposition is the process of breaking a larger problem into smaller subproblems that can be solved more reliably, more efficiently, or with better generalization than the original task considered as a single monolithic problem.

## Why it matters
In language-model systems, decomposition is often the bridge between strong local competence and weak long-horizon performance. A model may be capable on many short, in-distribution subtasks while still failing to solve an extended problem end-to-end. Decomposition can turn an apparently out-of-distribution task into a composition of in-distribution steps.

## In agent systems
Task decomposition appears in many forms:
- planner-executor pipelines
- orchestrator-subagent systems
- tree search over candidate steps
- recursive tool use
- code-generated workflows
- multi-stage memory retrieval and synthesis

## In embodied manipulation
任务拆解在具身操控中同样是一条重要路径。将复杂操控任务分解为子任务和约束，可以消解 OOD 问题——每个子任务/约束在分布内可解，整体组合覆盖复杂行为。

代表工作：
- **ReKep** (Huang et al., 2024) — 将操控任务表示为关键点约束序列（Python 函数），LLM 生成约束，优化器求解动作。与端到端 VLA 不同，ReKep 将「理解任务」和「执行动作」解耦，泛化性强、无需 task-specific 训练数据。

### ReKep 范式 vs VLA/WAM
- **ReKep 路线**：任务拆解 → 约束推理 → 优化求解，模块化、可解释、泛化强、zero-shot
- **VLA 路线**：端到端感知→动作，数据饥渴但上限可能更高
- **WAM 路线**（如 GigaWorld-Policy）：端到端世界模型，视频生成提供密集监督，靠数据覆盖泛化
- 目前无法定论哪条路线更有前景，但任务拆解路线在数据效率和泛化性上有明显优势
- 端到端路线内部（如 GigaWorld-Policy vs Motus）仍有大量效率优化空间

## Design questions
Important design questions include:
- What decomposition language is available to the model?
- Can the model express loops, recursion, branching, and reusable abstractions?
- How are subtasks passed state and constraints?
- How is progress tracked across a task tree?
- How is credit assigned when the final outcome depends on many intermediate choices?

## Research significance
The Mismanaged Geniuses Hypothesis argues that progress may depend less on scaling a single model and more on improving and training decomposition itself. On this view, decomposition is not merely an engineering convenience; it is a first-class capability target.

## Related
- [[Agent orchestration]]
- [[Recursive Language Models]]
- [[AI coding agents]]
- [[Alex Zhang - The Mismanaged Geniuses Hypothesis]]
- [[Self-managing memory as an in-distribution control problem]]
- [[Meta-skills for memory orchestration]]
- [[Open questions in agent memory and decomposition]]
- [[Huang et al. - ReKep Spatiotemporal Reasoning Keypoint Constraints for Robotic Manipulation]]
- [[Spatial Intelligence for Embodied AI]]
