# Agent orchestration

Agent orchestration is the coordination logic that determines how language-model calls, tools, memory, and subagents are organized to solve a larger task.

## Core idea
A single model call is often not enough for long-horizon work. Orchestration provides the control structure around those calls: planning, delegation, execution, retries, verification, memory updates, and synthesis.

## Common forms
- planner-executor systems
- orchestrator-subagent architectures
- tool-use loops
- workflow graphs
- recursive control structures
- code-defined execution plans

## Tension
Many current orchestration systems are hand-built and task-specific. This can make them brittle and can also obscure the actual capability of the underlying model.

## Open question
A major open question is whether orchestration should remain primarily an engineering layer or become something the model learns directly. The Mismanaged Geniuses Hypothesis argues for the latter direction: train models to manage themselves by learning good decompositions and compositions.

## Related
- [[Task decomposition]]
- [[Recursive Language Models]]
- [[AI coding agents]]
- [[Alex Zhang - The Mismanaged Geniuses Hypothesis]]
- [[Self-managing memory as an in-distribution control problem]]
- [[Meta-skills for memory orchestration]]
- [[Open questions in agent memory and decomposition]]
- [[Harness design]]
- [[Harness design for long-running application development]]
