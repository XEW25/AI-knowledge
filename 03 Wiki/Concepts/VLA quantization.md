# VLA quantization

## Purpose
Concept page for compressing **Vision-Language-Action (VLA)** models to low bit-width for edge / on-device deployment. It collects the vault's VLA-specific quantization sources, explains why VLA quantization is *not* just LLM quantization applied to a robot policy, and holds the central methodological tensions. This is an **application sub-cluster of [[Model quantization]]**, bridging into the embodied/VLA cluster ([[Embodied Brain Models]]).

## Why VLA quantization is its own problem
Standard LLM/VLM PTQ (outlier handling via rotation, scaling, or saliency) transfers poorly to VLAs, for reasons rooted in *embodiment*:
- **Closed-loop error compounding.** The action output feeds back through the environment. A local quantization error `e` is recursively amplified (`Δx_t ≈ J_T Δx_{t-1} + J_T(J_π·e)`), so errors imperceptible on a language benchmark become trajectory drift / task failure.
- **Action-head sensitivity.** The action head emits continuous control into physical actuators, not discrete text tokens; perturbations are amplified by contact forces. Prior work routinely left it FP16/mixed, *believing* it too sensitive. QuantVLA makes this precise (DiT fragility = softmax-temperature `√d/(s_q s_k)` + residual-energy `s_v s_o` drift); QVLA measures it directly as **action-space sensitivity** per channel.
- **Architecture-dependent dynamics.** The "hard part" depends on how actions are produced — autoregressive action *tokens* vs **diffusion (DiT)** heads whose statistics drift across denoising steps vs flow-matching experts.

The recurring lesson: effective VLA compression needs **action-aware** design, not direct transfer of language-centric recipes.

## Sources in the vault
- [[DyQ-VLA: Temporal-Dynamic-Aware Quantization for Embodied Vision-Language-Action Models|DyQ-VLA]] (Zheng et al., PKU, 2026) — **dynamic** mixed precision (W4AX): INT4 weights + activation bit-width switched *per step* by a real-time *kinematic* proxy. Base: autoregressive **OpenVLA**. Reports latency; no code.
- [[QVLA: Not All Channels Are Equal in Vision-Language-Action Model's Quantization|QVLA]] (Xu et al., SJTU AutoLab + CASIA, **ICLR 2026**) — **static** per-channel mixed precision: action-space-sensitivity-driven bit allocation `{0,2,4,8,16}` (0-bit = **pruning**) via greedy demotion; uniform activation bits; keeps **projector + action head FP16**. Base: autoregressive **OpenVLA / OpenVLA-OFT** (+ UniVLA, π0 real-world). Open source (fakew eval). *Is DyQ-VLA's baseline.*
- [[QuantVLA: Scale-Calibrated Post-Training Quantization for Vision-Language-Action Models|QuantVLA]] (Zhang et al., Ohio State / Michigan / CityU HK, **CVPR 2026**) — **selective W4A8 reshaping**: integerize LLM + DiT **MLP**, keep DiT **attention FP16**; DuQuant rotation + ATM/OHB interface calibrations folded into dequant scales. Designed for **real integer GEMMs**. Base: **π0.5, GR00T N1.5**. Open source.
- [[Ω-QVLA: Robust Quantization for Vision-Language-Action Models via Composite Rotation and Per-step Scaling|Ω-QVLA]] (Wang et al., McGill/UdeM/Mila + BUPT/SJTU, 2026) — **uniform W4A4 reshaping** incl. DiT attention, via composite SVD·Hadamard rotation + per-step DiT activation scaling. DuQuant-based. Base: **π0.5, GR00T N1.5**. Open source (fake-quant impl).

## The four sources: a strategy × architecture diagonal
The four methods fall on a clean **diagonal**: the **autoregressive (OpenVLA-family)** methods use **sensitivity-driven bit allocation**; the **diffusion-DiT (π0.5/GR00T)** methods use **rotation/reshaping**. (Off-diagonal — DiT+allocation, OpenVLA+reshaping — is empty so far; plausibly the DiT's outlier problem invites rotation while autoregressive action-token sensitivity invites per-channel allocation.) Within each cell, the two methods split on a sub-axis.

| | DyQ-VLA | QVLA | QuantVLA | Ω-QVLA |
|---|---|---|---|---|
| Base / 动作头 | OpenVLA (autoregressive) | OpenVLA(-OFT) (autoregressive) | π0.5, GR00T (DiT) | π0.5, GR00T (DiT) |
| Strategy | **bit allocation** (dynamic) | **bit allocation** (static) | **reshaping** (selective) | **reshaping** (uniform) |
| Precision | dynamic **W4AX** | per-channel **{0,2,4,8,16}** + prune | **W4A8** | uniform **W4A4** |
| Keeps FP | BF16 fallback @ hard steps | **projector + action head** | **DiT attention** | only ViT |
| Driven by | runtime kinematics | action-space sensitivity (offline) | DuQuant + ATM/OHB calib | SVD·Hadamard + per-step calib |
| Latency reported? | **yes** (1.49× sim/1.43× real) | **yes** (1.47–1.49× sim, 1.28× real) | no | no |
| Real kernel? | real (measured) | fakew eval (speedup reported) | **real INT GEMM by design** | **fake-quant** |
| Headline | 99.5% @ 30.9% mem | OFT 96.0 (98.9%) @ 29.2% | π0.5 97.6 / GR00T 88.0 (>FP) @ 55–70% | π0.5 98.0 / GR00T 87.8 (≈FP) @ ~71% |
| Code | none | Apache repo (license unstated) | Apache-2.0 | Apache-2.0 |

Three axes organize the disagreement:
- **OpenVLA / bit-allocation cell — static vs dynamic.** QVLA decides bits **per-channel, offline** by action-space sensitivity (+ pruning); DyQ-VLA decides **per-step, at runtime** by a kinematic proxy. **DyQ-VLA uses QVLA as its baseline and beats it by only ~0.1%** — i.e. DyQ-VLA = "QVLA's static allocation, made dynamic," and the dynamic upside is marginal.
- **DiT / reshaping cell — selective vs uniform.** QuantVLA keeps DiT attention FP16 (selective, W4A8, real INT GEMM); Ω-QVLA quantizes *everything* (uniform W4A4, fake-quant). The central "does the DiT attention need FP?" debate — QuantVLA says yes, Ω-QVLA says no (but only at fake-quant).
- **Cross-cutting "protect the multimodal→action interface".** QVLA (projector + action head FP), QuantVLA (DiT-attn FP), DyQ-VLA (BF16 fallback at fragile phases) all keep the sensitive interface high-precision; **only Ω-QVLA quantizes it** — the aggressive outlier.

> Disambiguation: **QuantVLA** (Zhang et al., CVPR 2026, arXiv:2602.20309, *scale-calibrated rotation*) is **not** **QVLA** (Xu et al., ICLR 2026, arXiv:2602.03782, *per-channel "not all channels are equal"*). Different papers, both Feb 2026; QVLA is also called "AutoQVLA" in its own appendix.

## A recurring finding: four lenses on one phenomenon
Every method independently rediscovers **action-space / closed-loop error compounding** as what makes VLA quant ≠ LLM quant — each names a different lens on the same fragile locus (the multimodal→action interface / contact-rich phase):
- **QVLA** (objective): per-channel **action-space sensitivity** (Action-MSE + cumulative) — allocate bits by how much they move the action.
- **DyQ-VLA** (temporal): the **fine-manipulation sensitivity spike** (coarse motion robust; grasp/insertion fragile).
- **QuantVLA** (analytic): softmax **temperature** `√d/(s_q s_k)` + **residual energy** `s_v s_o` drift at DiT attention.
- **Ω-QVLA** (empirical): the **AdaLayerNorm-fed QKV** layers (per-channel, per-denoising-step drift).

## Where this sits in the Model quantization taxonomy
VLA quantization is an **application domain cutting across the routes of [[Model quantization]]**, not a method axis. Two method families appear:
- **Reshaping (Route 2):** QuantVLA, Ω-QVLA — the SmoothQuant → QuaRot / [[DuQuant: Distributing Outliers via Dual Transformation Makes Stronger Quantized LLMs|DuQuant]] → these rotation lineage (both reparam over DuQuant; QuantVLA shares DuQuant's first author).
- **Precision allocation (importance/sensitivity-driven mixed precision):** **QVLA** (static, per-channel, + pruning) and **DyQ-VLA** (dynamic, per-step). DyQ-VLA = **Route 3** (runtime-adaptive); **QVLA is its static sibling** — offline per-channel allocation, neither reshaping nor runtime (a static-mixed-precision flavor in the HAWQ lineage, made *action-guided* and unified with pruning).
- (No VLA Route-1 / representation-design (FP8) example yet — a gap worth watching.)

## Cited-but-not-yet-ingested landscape
VLA-specific: **EaqVLA** (Jiang et al., arXiv:2505.21567 — encoding-aligned quantization), **SQAP-VLA** (arXiv:2509.09090 — quant + pruning co-design). Related efficiency lines: **KERV** (arXiv:2603.01581 — kinematic-rectified speculative decoding, DyQ-VLA's group), **EfficientVLA** (prune/cache, shared QVLA author). Underlying methods: SmoothQuant, GPTQ, AWQ, OmniQuant, HAWQ (mixed-precision) (LLM); rotation lineage **[[DuQuant: Distributing Outliers via Dual Transformation Makes Stronger Quantized LLMs|DuQuant]]** (ingested — shared ancestor of QuantVLA + Ω-QVLA), QuaRot, FlatQuant, OSTQuant; SVDQuant, ViDiT-Q, PTQ4DiT (DiT).

## Open questions
- **Latency, honestly.** All four claim efficiency; only the two OpenVLA methods (DyQ-VLA, QVLA) report wall-clock, and both releases lean on fake-quant for accuracy. A controlled head-to-head (same base, same bits, real kernels) would settle the cluster's biggest open number.
- **Static vs dynamic bit allocation.** QVLA (static per-channel) ≈ DyQ-VLA (dynamic per-step) within ~0.1% on OpenVLA — **does dynamic allocation ever justify its runtime machinery**, or is static the practical sweet spot?
- **Is keeping the action interface FP necessary?** QVLA/QuantVLA keep it FP; Ω-QVLA quantizes it (but fake-quant). Who is right on real hardware?
- **Allocation × reshaping are orthogonal — compose them?** Action-sensitivity bit allocation *after* SVD·Hadamard flattening; or ATM/OHB + kinematic gating.
- Does each method's trick generalize off its home architecture (allocation→DiT, reshaping→autoregressive)?
- Is the **AdaLayerNorm → per-step-scale** locus a general DiT-quantization principle? How low can VLA go (W3/W2)?

## Related
- [[Model quantization]] — parent topic (routes, LLM/FP8 context)
- [[DyQ-VLA: Temporal-Dynamic-Aware Quantization for Embodied Vision-Language-Action Models]]
- [[QVLA: Not All Channels Are Equal in Vision-Language-Action Model's Quantization]]
- [[QuantVLA: Scale-Calibrated Post-Training Quantization for Vision-Language-Action Models]]
- [[Ω-QVLA: Robust Quantization for Vision-Language-Action Models via Composite Rotation and Per-step Scaling]]
- [[SmoothQuant: Accurate and Efficient Post-Training Quantization for Large Language Models]] · [[DuQuant: Distributing Outliers via Dual Transformation Makes Stronger Quantized LLMs]] — LLM-quant ancestors (smoothing / rotation)
- [[Embodied Brain Models]] — edge-deployment / cerebellum efficiency context
- [[Physical Intelligence - pi0.5 a VLA with Open-World Generalization]], [[NVIDIA - GR00T N1 An Open Foundation Model for Generalist Humanoid Robots]] — DiT backbones quantized by QuantVLA and Ω-QVLA
