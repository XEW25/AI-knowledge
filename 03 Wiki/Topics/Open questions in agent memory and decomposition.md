# Open questions in agent memory and decomposition

## Purpose
This page collects unresolved questions, tensions, and possible research directions around agent systems, task decomposition, and memory orchestration.

## Core open questions
### Decomposition language
- What is the best representation for decomposition: natural language, code, graphs, DSLs, or latent programs?
- Which control structures matter most: loops, recursion, branching, reflection, explicit task trees?
- How expressive does the decomposition language need to be before new behaviors emerge?

### Memory control
- What should the action space for memory management look like?
- Which memory operations should be first-class: write, consolidate, revise, merge, archive, discard?
- How should episodic, semantic, and working memory interact?
- What is the right balance between explicit memory control and latent model behavior?
- Can `memory as action / policy` scale beyond summarization into richer memory lifecycles?
- How can memory usefulness be supervised without relying on gold answers?

### Meta-skills
- What is the minimal useful ontology of meta-skills for memory orchestration?
- How reusable are memory meta-skills across tasks and domains?
- How should meta-skills compose with domain-specific skills?
- Can meta-skills be discovered automatically, or must they be hand-designed initially?

### Training
- Can decomposition policies be learned from sparse end-task reward alone?
- What kinds of intermediate supervision help models learn better memory-control behavior?
- Can simpler toy environments bootstrap to open-ended long-horizon tasks?
- How should test-time compute and training-time structure interact?
- Can trajectory-based RL turn individual memory operations into trainable skills?
- Which operations are easiest to train first: write/compress, retrieve/rank, merge/consolidate, or archive/discard?
- How do we move from training local memory actions to training the correct higher-level decomposition policy?

### Evaluation
- How do we measure memory-control quality rather than just raw retrieval quality?
- What benchmarks isolate decomposition quality from base-model quality?
- How do we detect whether a system is truly self-managing memory versus merely following brittle heuristics?
- How should long-delayed credit assignment be evaluated?

## Tensions
### Engineering vs learning
Should orchestration and memory management primarily be hand-engineered, or should they be learned directly by the model?

### Explicit vs implicit control
How much should be exposed as explicit operations and policies, and how much should remain latent inside the model?

### Flexibility vs stability
Richer action spaces and decomposition languages may increase capability, but they may also make behavior harder to stabilize and train.

### Compression vs fidelity
Memory systems need abstraction and consolidation, but too much compression can erase the very detail needed later.

## Candidate research directions
- learned memory-write policies
- decomposition-aware memory benchmarks
- task-tree-based working memory
- schema-aware long-term memory consolidation
- meta-skills as reusable memory controllers
- recursive memory-management loops
- comparisons between retrieval-centric and write-centric memory architectures

## Related
- [[Meta-skills for memory orchestration]]
- [[Self-managing memory as an in-distribution control problem]]
- [[Task decomposition]]
- [[Agent orchestration]]
- [[Recursive Language Models]]
