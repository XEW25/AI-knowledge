# Model quantization

## Purpose
This topic page collects the vault's current and future work on model quantization, low-bit numerical representations, and related training/inference tradeoffs.

## Scope
This topic includes:
- post-training quantization (PTQ)
- quantization-aware training (QAT)
- low-bit training
- FP8 and low-bit floating-point formats
- scaling and calibration strategies
- precision/range tradeoffs in numeric representation design
- dynamic / input-conditioned mixed precision (runtime-adaptive bit allocation)
- domain-specific quantization (e.g. embodied / VLA models)

## Current entry points
### Sources
- [[Ascend HiFloat8 Format for Deep Learning]]
- [[SmoothQuant: Accurate and Efficient Post-Training Quantization for Large Language Models]]
- [[DyQ-VLA: Temporal-Dynamic-Aware Quantization for Embodied Vision-Language-Action Models]]

## Current thesis direction
This topic is still at an early stage in the vault, but a clearer internal structure is beginning to emerge. Quantization should not be treated only as a compression or deployment trick. In some settings, especially LLM quantization and low-bit training, the problem becomes one of choosing where to intervene in the numerical system.

Three routes are now visible:
1. **Representation design** — redesign the number format itself to improve the precision/range tradeoff (e.g. [[Ascend HiFloat8 Format for Deep Learning]])
2. **Distribution reshaping / difficulty migration** — transform activations/weights so that standard low-bit quantization becomes viable and hardware-friendly (e.g. [[SmoothQuant: Accurate and Efficient Post-Training Quantization for Large Language Models]])
3. **Dynamic / runtime-adaptive precision** — keep the format fixed but make the bit allocation a *function of the input or task state at inference*, spending precision only where the task is currently hard (e.g. [[DyQ-VLA: Temporal-Dynamic-Aware Quantization for Embodied Vision-Language-Action Models]])

The first cut runs along **what you intervene on**: the *format* (route 1) vs. the *distribution* (route 2). DyQ-VLA adds an orthogonal cut along **when the configuration is decided**: routes 1–2 both produce a *static* quantization config; route 3 makes precision a *runtime control variable*. DyQ-VLA is also the topic's first **embodied / VLA-specific** entry and the first bridge between this cluster and the [[Embodied Brain Models|embodied/VLA cluster]] — the runtime signal it exploits (robot kinematics) only exists because the model is a policy.

## Main subthemes likely to grow
- FP8 format design
- distribution reshaping and scaling
- activation outliers in LLM quantization
- low-bit training stability
- calibration and scaling
- precision versus dynamic range tradeoffs
- hardware-aware numerical representation design
- dynamic / input-conditioned bit allocation and the cost of the runtime control loop
- VLA / embodied-model quantization (domain signals as sensitivity proxies)

## Open questions
- When do fixed FP8 formats become the bottleneck?
- How much can be gained by better numeric representation design rather than better scaling alone?
- Which low-bit strategies are mainly about inference efficiency, and which fundamentally affect training dynamics?
- How should one compare vendor-specific proposals against more standardized formats?
- When is quantization best framed as a representation-design problem versus a distribution-transformation problem?
- Which outlier-handling strategies generalize beyond SmoothQuant-style scaling?
- When does **dynamic (input-conditioned) bit allocation** pay for its runtime control overhead, versus a well-tuned static config?
- How much of a dynamic scheme's gain comes from being *dynamic* versus from the specific *domain signal* used to drive it (e.g. kinematics in DyQ-VLA)?
- Do LLM-PTQ insights (e.g. activation outliers) transfer to **VLA / embodied policies**, where errors compound through a closed observation→action loop?

## Related
- [[Ascend HiFloat8 Format for Deep Learning]]
- [[SmoothQuant: Accurate and Efficient Post-Training Quantization for Large Language Models]]
- [[DyQ-VLA: Temporal-Dynamic-Aware Quantization for Embodied Vision-Language-Action Models]]
