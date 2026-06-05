# VLA quantization

## Purpose
Concept page for compressing **Vision-Language-Action (VLA)** models to low bit-width for edge / on-device deployment. It collects the vault's VLA-specific quantization sources, explains why VLA quantization is *not* just LLM quantization applied to a robot policy, and holds the central methodological tensions. This is an **application sub-cluster of [[Model quantization]]**, bridging into the embodied/VLA cluster ([[Embodied Brain Models]]).

## Why VLA quantization is its own problem
Standard LLM/VLM PTQ (outlier handling via rotation, scaling, or saliency) transfers poorly to VLAs, for reasons rooted in *embodiment*:
- **Closed-loop error compounding.** The action output feeds back through the environment. A local quantization error `e` is recursively amplified (`Δx_t ≈ J_T Δx_{t-1} + J_T(J_π·e)`), so errors imperceptible on a language benchmark become trajectory drift / task failure.
- **Action-head sensitivity.** The action head emits continuous control into physical actuators, not discrete text tokens; perturbations are amplified by contact forces. Prior work routinely left it FP16/mixed, *believing* it too sensitive. QuantVLA makes this precise: under upstream quantization the DiT's fragility reduces to two dequant-scale-driven quantities — the **softmax temperature** `√d/(s_q s_k)` and the **residual-stream energy** `s_v s_o`.
- **Architecture-dependent dynamics.** The "hard part" depends on how actions are produced — autoregressive action *tokens* vs **diffusion (DiT)** heads whose statistics drift across denoising steps vs flow-matching experts.

The recurring lesson: effective VLA compression needs **action-aware** design, not direct transfer of language-centric recipes.

## Sources in the vault
- [[DyQ-VLA: Temporal-Dynamic-Aware Quantization for Embodied Vision-Language-Action Models|DyQ-VLA]] (Zheng et al., PKU, 2026) — **dynamic mixed precision** (W4AX): INT4 weights + activation bit-width switched per step by a real-time *kinematic* proxy. Base: autoregressive **OpenVLA**. No code.
- [[QuantVLA: Scale-Calibrated Post-Training Quantization for Vision-Language-Action Models|QuantVLA]] (Zhang et al., Ohio State / Michigan / CityU HK, **CVPR 2026**) — **selective W4A8**: integerize LLM + DiT **MLP**, keep DiT **attention FP16**; two interface calibrations (**ATM** temperature, **OHB** residual energy) folded into dequant scales. DuQuant-based; designed for **real integer GEMMs**. "First PTQ for VLA / first DiT-head quantization." Base: **π0.5, GR00T N1.5**. Open source.
- [[Ω-QVLA: Robust Quantization for Vision-Language-Action Models via Composite Rotation and Per-step Scaling|Ω-QVLA]] (Wang et al., McGill/UdeM/Mila + BUPT/SJTU, 2026) — **uniform W4A4** incl. DiT attention, via composite SVD·Hadamard rotation + per-step DiT activation scaling. DuQuant-based. Base: **π0.5, GR00T N1.5**. Open source (fake-quant impl).

## The three sources: one family, opposite bets
All three are 2026 PTQ works, but **QuantVLA and Ω-QVLA are a matched pair** — both DuQuant-based rotation PTQ, on the *same two* DiT VLAs (π0.5, GR00T N1.5), with Ω-QVLA's *main baseline* being QuantVLA. DyQ-VLA is the autoregressive/dynamic outlier.

| | DyQ-VLA | QuantVLA | Ω-QVLA |
|---|---|---|---|
| Base | OpenVLA (autoregressive) | π0.5, GR00T (DiT) | π0.5, GR00T (DiT) |
| Precision | dynamic **W4AX** | **W4A8** (also W4A4) | uniform **W4A4** |
| DiT attention | n/a (no DiT) | **kept FP16** | **quantized** |
| Mechanism | kinematic-gated bit allocation + LUT | DuQuant + ATM (temperature) + OHB (residual energy) | DuQuant + SVD·Hadamard + per-step scale table |
| Route ([[Model quantization]]) | 3 (dynamic) | 2 (rotation) | 2 (rotation) |
| Deployability | real (centers latency, 1.4×) | **real integer GEMM by design** | **fake-quant** (no real kernel) |
| Latency reported? | **yes** | no | no |
| Headline | 99.5% perf @ 30.9% mem | π0.5 97.6 / GR00T 88.0 (> FP16) @ 55–70% mem | π0.5 98.0 / GR00T 87.8 (≈FP16) @ ~71% mem |
| Code | none | Apache-2.0 | Apache-2.0 |

Two axes organize the disagreement:
- **DiT attention: FP vs quantized** (the QuantVLA↔Ω-QVLA axis). QuantVLA keeps it FP16 — both because it's the most sensitive interface and to protect the integer-GEMM operator schedule. Ω-QVLA's entire contribution is showing you *don't* have to: uniform W4A4 incl. attention via a strong enough rotation + per-step scaling. Their "first" claims are consistent at different granularities — QuantVLA = first to quantize a DiT head (the MLP); Ω-QVLA = first to do it *uniformly* (incl. attention).
- **Deployability vs accuracy — which flips between the two DiT papers.** QuantVLA is conservative-but-deployable (W4A8, FP attention, real integer GEMMs, schedule preserved); Ω-QVLA is aggressive-but-fake-quant (W4A4 uniform, no real kernel). Crucially **neither reports wall-clock latency — only DyQ-VLA does.** Across the cluster, *latency is the systematically missing number for DiT-based VLAs.*

> Disambiguation: **QuantVLA** (Zhang et al., CVPR 2026, arXiv:2602.20309, *scale-calibrated*) is **not** **QVLA** (Xu et al., ICLR 2026, arXiv:2602.03782, *per-channel "not all channels are equal"*). Different papers, both Feb 2026, easily confused.

## A recurring finding: the fragile locus is the action head's attention / contact phase
Three papers, three lenses on the *same* phenomenon — the DiT action head's attention (or the contact-rich control phase) is where VLA quantization breaks:
- **QuantVLA** (analytic): the softmax **temperature** `√d/(s_q s_k)` and **residual energy** `s_v s_o` at DiT attention.
- **Ω-QVLA** (empirical, App A.6): the **AdaLayerNorm-fed QKV** layers (per-channel, per-denoising-step magnitude drift); plain-LayerNorm MLP path is flat.
- **DyQ-VLA** (temporal): the **fine-manipulation sensitivity spike** (coarse motion is robust; grasp/insertion is fragile).

## Where this sits in the Model quantization taxonomy
VLA quantization is an **application domain cutting across the routes of [[Model quantization]]**, not a fourth method axis:
- **Route 2 (distribution reshaping / rotation):** **QuantVLA** (DuQuant + ATM/OHB, selective) and **Ω-QVLA** (DuQuant + SVD·Hadamard + per-step, uniform). Lineage: SmoothQuant → QuaRot/DuQuant → these. (Both even share authorship/codebase roots with DuQuant.)
- **Route 3 (dynamic / runtime-adaptive precision):** DyQ-VLA.
- (No VLA Route-1 / representation-design example yet — an FP8-for-VLA gap worth watching.)

## Cited-but-not-yet-ingested landscape
VLA-specific: **QVLA** (Xu et al., ICLR 2026, arXiv:2602.03782 — per-channel action-aware bit allocation), **SQAP-VLA** (arXiv:2509.09090 — quant + pruning co-design). Related efficiency line by DyQ-VLA's group: **KERV** (arXiv:2603.01581 — kinematic-rectified speculative decoding). Underlying methods: SmoothQuant, GPTQ, AWQ, OmniQuant (LLM); **DuQuant** (now underpins *two* vault sources → candidate stub), QuaRot, FlatQuant, OSTQuant (rotation); SVDQuant, ViDiT-Q, PTQ4DiT (DiT).

## Open questions
- **Latency, finally.** Two of three report none; QuantVLA even has real integer GEMMs. A head-to-head wall-clock of QuantVLA (W4A8) vs DyQ-VLA (W4AX) vs Ω-QVLA vs FP16 would settle the cluster's biggest open number.
- **Is keeping DiT attention FP16 necessary?** QuantVLA says yes (sensitivity + schedule); Ω-QVLA says no (uniform W4A4) — but only at fake-quant. Who is right on real hardware?
- **Composability:** ATM/OHB (cheap interface scalars) + Ω-QVLA's uniform-attention rotation + DyQ-VLA's kinematic gating — complementary?
- Does uniform W4A4 generalize beyond diffusion heads (autoregressive, flow-matching)? Does dynamic-bit generalize beyond autoregressive?
- Is the **AdaLayerNorm → per-step-scale** locus a general DiT-quantization principle (image/video DiTs)?
- How low can VLA go (W3/W2) before action fidelity collapses?

## Related
- [[Model quantization]] — parent topic (routes, LLM/FP8 context)
- [[DyQ-VLA: Temporal-Dynamic-Aware Quantization for Embodied Vision-Language-Action Models]]
- [[QuantVLA: Scale-Calibrated Post-Training Quantization for Vision-Language-Action Models]]
- [[Ω-QVLA: Robust Quantization for Vision-Language-Action Models via Composite Rotation and Per-step Scaling]]
- [[SmoothQuant: Accurate and Efficient Post-Training Quantization for Large Language Models]] — ancestor of the rotation/reshaping line
- [[Embodied Brain Models]] — edge-deployment / cerebellum efficiency context
- [[Physical Intelligence - pi0.5 a VLA with Open-World Generalization]], [[NVIDIA - GR00T N1 An Open Foundation Model for Generalist Humanoid Robots]] — backbones quantized by QuantVLA and Ω-QVLA
