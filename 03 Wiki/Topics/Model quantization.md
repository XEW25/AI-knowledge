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

## Current thesis direction
This topic is still at an early stage in the vault. A likely organizing line is that quantization should not be treated only as a compression or deployment trick. In some settings, especially low-bit training, the design of the numeric representation itself becomes part of the learning system design problem.

## Main subthemes likely to grow
- FP8 format design
- low-bit training stability
- calibration and scaling
- precision versus dynamic range tradeoffs
- hardware-aware numerical representation design

## Open questions
- When do fixed FP8 formats become the bottleneck?
- How much can be gained by better numeric representation design rather than better scaling alone?
- Which low-bit strategies are mainly about inference efficiency, and which fundamentally affect training dynamics?
- How should one compare vendor-specific proposals against more standardized formats?

## Related
- [[Ascend HiFloat8 Format for Deep Learning]]
