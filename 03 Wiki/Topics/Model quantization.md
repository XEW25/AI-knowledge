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
- rotation-based outlier suppression (QuaRot / DuQuant / SVD·Hadamard)
- dynamic / input-conditioned mixed precision (runtime-adaptive bit allocation)
- domain-specific quantization (e.g. embodied / VLA models — see [[VLA quantization]])

## Current entry points
### Sources
- [[Ascend HiFloat8 Format for Deep Learning]]
- [[SmoothQuant: Accurate and Efficient Post-Training Quantization for Large Language Models]]
- [[DyQ-VLA: Temporal-Dynamic-Aware Quantization for Embodied Vision-Language-Action Models]]
- [[Ω-QVLA: Robust Quantization for Vision-Language-Action Models via Composite Rotation and Per-step Scaling]]

### Concepts / sub-clusters
- [[VLA quantization]] — VLA-specific low-bit quantization (application sub-cluster cutting across the routes below)

## Current thesis direction
This topic is still at an early stage in the vault, but a clearer internal structure is beginning to emerge. Quantization should not be treated only as a compression or deployment trick. In some settings, especially LLM quantization and low-bit training, the problem becomes one of choosing where to intervene in the numerical system.

Three routes are now visible:
1. **Representation design** — redesign the number format itself to improve the precision/range tradeoff (e.g. [[Ascend HiFloat8 Format for Deep Learning]])
2. **Distribution reshaping / difficulty migration** — transform activations/weights so that standard low-bit quantization becomes viable and hardware-friendly. From [[SmoothQuant: Accurate and Efficient Post-Training Quantization for Large Language Models]] (per-channel smoothing) the line extends into **rotation-based** outlier suppression (QuaRot, DuQuant), reaching [[Ω-QVLA: Robust Quantization for Vision-Language-Action Models via Composite Rotation and Per-step Scaling]], which composes an SVD·Hadamard rotation with per-step scaling to push *uniform* W4A4 onto VLA diffusion action heads.
3. **Dynamic / runtime-adaptive precision** — keep the format fixed but make the bit allocation a *function of the input or task state at inference*, spending precision only where the task is currently hard (e.g. [[DyQ-VLA: Temporal-Dynamic-Aware Quantization for Embodied Vision-Language-Action Models]])

The first cut runs along **what you intervene on**: the *format* (route 1) vs. the *distribution* (route 2). Route 3 adds an orthogonal cut along **when the configuration is decided**: routes 1–2 both produce a *static* quantization config; route 3 makes precision a *runtime control variable*.

A useful caution comes from the two VLA-quantization sources, which now form their own sub-cluster ([[VLA quantization]]): **they sit in different routes and take opposite stances on whether VLA low-bit needs mixed precision.** DyQ-VLA (route 3) varies the *bit-width* dynamically; Ω-QVLA (route 2) keeps *uniform* W4A4 and varies only the *scale* per denoising step. So "VLA quantization" is an application domain that cuts across the routes, not a fourth method axis — a reminder to keep the *method* taxonomy (format / distribution / dynamic) separate from the *domain* taxonomy (LLM / VLM / diffusion-DiT / VLA).

## Main subthemes likely to grow
- FP8 format design
- distribution reshaping and scaling
- rotation-based outlier suppression (orthogonal transforms; SVD vs Hadamard; block-wise)
- activation outliers in LLM quantization
- low-bit training stability
- calibration and scaling (incl. per-step calibration for diffusion / DiT)
- precision versus dynamic range tradeoffs
- hardware-aware numerical representation design
- dynamic / input-conditioned bit allocation and the cost of the runtime control loop
- VLA / embodied-model quantization (domain signals as sensitivity proxies; action-head sensitivity)

## Open questions
- When do fixed FP8 formats become the bottleneck?
- How much can be gained by better numeric representation design rather than better scaling alone?
- Which low-bit strategies are mainly about inference efficiency, and which fundamentally affect training dynamics?
- How should one compare vendor-specific proposals against more standardized formats?
- When is quantization best framed as a representation-design problem versus a distribution-transformation problem?
- Which outlier-handling strategies generalize beyond SmoothQuant-style scaling? (rotation methods are the current answer)
- When does **dynamic (input-conditioned) bit allocation** pay for its runtime control overhead, versus a well-tuned static config?
- **Does VLA low-bit fundamentally need mixed precision?** DyQ-VLA argues yes (dynamic bits); Ω-QVLA argues no (uniform W4A4 via rotation + per-step scaling). Likely architecture-dependent (autoregressive vs diffusion action heads).
- Do LLM-PTQ insights (e.g. activation outliers) transfer to **VLA / embodied policies**, where errors compound through a closed observation→action loop?

## Related
- [[VLA quantization]]
- [[Ascend HiFloat8 Format for Deep Learning]]
- [[SmoothQuant: Accurate and Efficient Post-Training Quantization for Large Language Models]]
- [[DyQ-VLA: Temporal-Dynamic-Aware Quantization for Embodied Vision-Language-Action Models]]
- [[Ω-QVLA: Robust Quantization for Vision-Language-Action Models via Composite Rotation and Per-step Scaling]]
