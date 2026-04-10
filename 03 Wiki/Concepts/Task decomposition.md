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
