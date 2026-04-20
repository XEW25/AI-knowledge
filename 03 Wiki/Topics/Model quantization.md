# Model quantization

## Purpose
This topic page collects the vault’s current and future work on model quantization, low-bit numerical representations, and related training/inference tradeoffs.

## Scope
This topic includes:
- post-training quantization (PTQ)
- quantization-aware training (QAT)
- low-bit training
- FP8 and low-bit floating-point formats
- scaling and calibration strategies
- precision/range tradeoffs in numeric representation design

## Current entry points
### Sources
- [[Ascend HiFloat8 Format for Deep Learning]]
- [[SmoothQuant: Accurate and Efficient Post-Training Quantization for Large Language Models]]

## Current thesis direction
This topic is still at an early stage in the vault, but a clearer internal structure is beginning to emerge. Quantization should not be treated only as a compression or deployment trick. In some settings, especially LLM quantization and low-bit training, the problem becomes one of choosing where to intervene in the numerical system.

Two routes are already visible:
1. **Representation design**  redesign the number format itself to improve the precision/range tradeoff (e.g. [[Ascend HiFloat8 Format for Deep Learning]])
2. **Distribution reshaping / difficulty migration**  transform activations/weights so that standard low-bit quantization becomes viable and hardware-friendly (e.g. [[SmoothQuant: Accurate and Efficient Post-Training Quantization for Large Language Models]])

## Main subthemes likely to grow
- FP8 format design
- distribution reshaping and scaling
- activation outliers in LLM quantization
- low-bit training stability
- calibration and scaling
- precision versus dynamic range tradeoffs
- hardware-aware numerical representation design

## Open questions
- When do fixed FP8 formats become the bottleneck?
- How much can be gained by better numeric representation design rather than better scaling alone?
- Which low-bit strategies are mainly about inference efficiency, and which fundamentally affect training dynamics?
- How should one compare vendor-specific proposals against more standardized formats?
- When is quantization best framed as a representation-design problem versus a distribution-transformation problem?
- Which outlier-handling strategies generalize beyond SmoothQuant-style scaling?

## Related
- [[Ascend HiFloat8 Format for Deep Learning]]
- [[SmoothQuant: Accurate and Efficient Post-Training Quantization for Large Language Models]]
