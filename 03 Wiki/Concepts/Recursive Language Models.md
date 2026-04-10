# Recursive Language Models

Recursive Language Models (RLMs) are language-model systems that can express plans and problem-solving procedures through recursive structure rather than only flat sequences of tool calls.

## Core intuition
If a model can call functions, subroutines, or subagents recursively, it can represent much richer decompositions than a shallow orchestrator. This can improve scalability on tasks involving long context, repeated structure, or deep task hierarchies.

## Why they matter
RLM-style systems expand the space of decompositions available to the model. This is important because the expressive power of the decomposition language constrains what kinds of long-horizon behavior can be learned or executed efficiently.

## Connection to current agent systems
Coding agents and orchestrator-subagent systems can be seen as partial steps toward recursive LM management. RLMs push the idea further by making recursion and structured control more central.

## Relevance to the Mismanaged Geniuses Hypothesis
The Mismanaged Geniuses Hypothesis uses RLMs as evidence that better decomposition scaffolds can unlock capabilities that appear inaccessible to ordinary LM usage. On this framing, recursion is not just a software trick but part of the representational substrate for scalable LM composition.

## Related
- [[Task decomposition]]
- [[Agent orchestration]]
- [[Alex Zhang - The Mismanaged Geniuses Hypothesis]]
- [[Self-managing memory as an in-distribution control problem]]
- [[Meta-skills for memory orchestration]]
- [[Open questions in agent memory and decomposition]]
