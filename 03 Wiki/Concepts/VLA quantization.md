# VLA quantization

## Purpose
Concept page for compressing **Vision-Language-Action (VLA)** models to low bit-width for edge / on-device deployment. It collects the vault's VLA-specific quantization sources, explains why VLA quantization is *not* just LLM quantization applied to a robot policy, and holds the central methodological tensions. This is an **application sub-cluster of [[Model quantization]]**, bridging into the embodied/VLA cluster ([[Embodied Brain Models]]).

## Why VLA quantization is its own problem
Standard LLM/VLM PTQ (outlier handling via rotation, scaling, or saliency) transfers poorly to VLAs, for reasons rooted in *embodiment*:
- **Closed-loop error compounding.** The action output feeds back through the environment. A local quantization error `e` is recursively amplified (`Δx_t ≈ J_T Δx_{t-1} + J_T(J_π·e)`), so errors that are imperceptible on a language benchmark become trajectory drift / task failure.
- **Action-head sensitivity.** The action head emits continuous control signals into physical actuators, not discrete text tokens; perturbations are amplified by contact forces. Prior work routinely left it at FP16 or mixed precision, *believing* it too sensitive to compress.
- **Architecture-dependent dynamics.** The "hard part" depends on how actions are produced — autoregressive action *tokens* vs **diffusion (DiT)** action heads with statistics that drift across denoising steps vs flow-matching experts.

The recurring lesson across sources: effective VLA compression needs **action-aware** design, not direct transfer of language-centric recipes.

## Sources in the vault
- [[DyQ-VLA: Temporal-Dynamic-Aware Quantization for Embodied Vision-Language-Action Models|DyQ-VLA]] (Zheng et al., PKU, 2026) — **dynamic mixed precision** (W4AX): INT4 weights + activation bit-width switched per step by a real-time *kinematic* proxy. Base: autoregressive **OpenVLA**.
- [[Ω-QVLA: Robust Quantization for Vision-Language-Action Models via Composite Rotation and Per-step Scaling|Ω-QVLA]] (Wang et al., McGill/UdeM/Mila + BUPT/SJTU, 2026) — **uniform W4A4** via composite SVD·Hadamard rotation + per-step DiT activation scaling; no mixed precision. Base: diffusion **π0.5** and **GR00T N1.5**. (Open source.)

## The central contrast: DyQ-VLA vs Ω-QVLA
The two in-vault sources take **opposite stances on the defining question — does VLA low-bit need mixed precision?** — and they split by action-head architecture.

| | DyQ-VLA | Ω-QVLA |
|---|---|---|
| Base model | OpenVLA (autoregressive, VLM-as-actor) | π0.5, GR00T N1.5 (diffusion DiT heads) |
| Mixed precision? | **Yes** — uniform low-bit is unstable, so adapt | **No** — uniform W4A4 even on the DiT head |
| What is "dynamic" | the **bit-width** (per step, input-conditioned) | the **quantization scale** (per denoising step); bit-width fixed |
| Trigger signal | runtime **kinematics** (motion fineness, angular jerk) | offline per-step calibration over T denoising steps |
| Core mechanism | sensitivity-gated bit allocation + LUT dispatch | SVD·Hadamard rotation + per-step scale table |
| `Model quantization` route | **Route 3** (dynamic / runtime-adaptive precision) | **Route 2** (distribution reshaping / rotation) |
| Headline | 99.5% perf @ 30.9% mem; 1.4–1.5× speedup | 87.8% / 98.0% ≈ FP16 @ ~71–72% mem saved |
| Latency reported | yes (centers it) | **no** (memory + success only) |
| Code | none released | Apache-2.0, real repo |

Both are motivated by *temporal dynamics*, but DyQ-VLA concludes "vary the precision," while Ω-QVLA concludes "keep precision uniform, vary only the scale, and flatten the distribution hard enough that uniform works." Whether these are genuinely exclusive or **composable** (uniform-W4A4 base + a thin kinematic BF16 fallback at the very hardest steps) is open.

## Where this sits in the Model quantization taxonomy
VLA quantization is an **application domain that cuts across the routes of [[Model quantization]]**, not a fourth method axis:
- **Route 2 (distribution reshaping):** Ω-QVLA (rotation lineage: SmoothQuant → QuaRot/DuQuant → composite SVD·Hadamard).
- **Route 3 (dynamic / runtime-adaptive precision):** DyQ-VLA.
- (No current VLA example of Route 1 / representation-design — an FP8-for-VLA gap worth watching.)

## Cited-but-not-yet-ingested landscape
VLA-specific: **QVLA** (Xu et al., ICLR 2026, arXiv:2602.03782 — per-channel action-aware bit allocation), **QuantVLA** (Zhang et al., arXiv:2602.20309 — scale-calibrated, DuQuant-based, keeps DiT attention FP16), **SQAP-VLA** (arXiv:2509.09090 — quant + pruning co-design). Related efficiency line by DyQ-VLA's group: **KERV** (arXiv:2603.01581 — kinematic-rectified speculative decoding). Underlying LLM/DiT methods: SmoothQuant, GPTQ, AWQ, OmniQuant (LLM); QuaRot, DuQuant, FlatQuant, OSTQuant (rotation); SVDQuant, ViDiT-Q, PTQ4DiT (DiT).

## Open questions
- Does uniform W4A4 generalize beyond diffusion heads (autoregressive, flow-matching)? Does dynamic-bit generalize beyond autoregressive?
- The two in-vault methods can't currently be compared on **latency** (Ω-QVLA reports none) — which actually deploys faster on real edge hardware?
- Are dynamic-precision (DyQ-VLA) and uniform-rotation (Ω-QVLA) **complementary**?
- Is the **AdaLayerNorm → per-step-scale** locus (time-conditioned attention inputs need per-step scales; plain-LayerNorm MLPs don't) a general DiT-quantization principle?
- How low can VLA go (W3/W2) before action fidelity collapses, and does that need new tools (low-rank residuals, learned codebooks)?

## Related
- [[Model quantization]] — parent topic (routes, LLM/FP8 context)
- [[DyQ-VLA: Temporal-Dynamic-Aware Quantization for Embodied Vision-Language-Action Models]]
- [[Ω-QVLA: Robust Quantization for Vision-Language-Action Models via Composite Rotation and Per-step Scaling]]
- [[SmoothQuant: Accurate and Efficient Post-Training Quantization for Large Language Models]] — ancestor of the rotation/reshaping line
- [[Embodied Brain Models]] — edge-deployment / cerebellum efficiency context
- [[Physical Intelligence - pi0.5 a VLA with Open-World Generalization]], [[NVIDIA - GR00T N1 An Open Foundation Model for Generalist Humanoid Robots]] — backbones quantized by Ω-QVLA
