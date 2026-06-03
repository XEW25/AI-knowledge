# DyQ-VLA: Temporal-Dynamic-Aware Quantization for Embodied Vision-Language-Action Models

- Raw note: [[2026-06-03 - Zheng et al. - DyQ-VLA Temporal-Dynamic-Aware Quantization for Embodied Vision-Language-Action Models]]

## Metadata
- Type: source note
- Format: arXiv paper (preprint; cs.LG / cs.RO)
- Authors: [[Zihao Zheng]] et al. (Hangyu Cao, Sicheng Tian, Jiayu Chen, Maoliang Li, Xinhao Sun, Hailong Zou, Zhaobo Zhang, Xuanzhe Liu, Donggang Cao, Hong Mei, Xiang Chen)
- Organization: not stated on the arXiv abstract page (author names suggest Peking University involvement — unverified)
- Date accessed: 2026-06-03
- Original URL: https://arxiv.org/abs/2603.07904
- PDF URL: https://arxiv.org/pdf/2603.07904
- arXiv ID: 2603.07904 (submitted 2026-03-09; v2 2026-03-14)
- Related: [[Model quantization]], [[SmoothQuant: Accurate and Efficient Post-Training Quantization for Large Language Models]], [[Ascend HiFloat8 Format for Deep Learning]], [[Embodied Brain Models]], [[Galaxea - G0.5 Autoregressive VLM-as-Actor VLA]]
- Tags: #quantization #ptq #vla-quantization #embodied-ai #mixed-precision #dynamic-quantization #w4ax #edge-deployment

## Summary
DyQ-VLA is a post-training **dynamic quantization** framework for Vision-Language-Action models, aimed at edge deployment. Its central observation is that VLA inference has **temporal-dynamic sensitivity**: the same quantization noise hurts very differently depending on *where in the manipulation episode* it occurs. Coarse free-space motion tolerates aggressive low-bit activations; fine-grained contact phases (grasp, insertion) are fragile because action errors compound through the closed observation→action loop. Static quantization is forced to hold peak precision for the whole episode, wasting it during the robust phases.

DyQ-VLA keeps weights at static INT4 and makes **activation precision a function of the robot's real-time kinematic state** (a "W4AX" paradigm, X ∈ {2, 4, 8, BF16}). A cheap runtime proxy — fusing *motion fineness* (translational) and *angular jerk* (rotational) into a sensitivity score — decides at each step whether to fall back to full precision (BF16) or to consult an offline-calibrated table that maps sensitivity to an activation bit-width. Dispatch is a constant-time lookup to pre-compiled kernels, so the control logic itself is nearly free at inference.

It reports retaining 99.5% of OpenVLA's task performance at 30.9% of the original memory footprint, with ~1.49× speedup in simulation (LIBERO) and up to ~1.43× in real-world tabletop manipulation.

## Key claims
1. VLA quantization error is **not stationary across time** — error tolerance varies by manipulation stage, so a single static bit-width is intrinsically suboptimal.
2. This per-step sensitivity can be **estimated online from kinematic signals already available at inference** (no extra forward pass, no learned predictor on the critical path).
3. A **static-weight / dynamic-activation** scheme (W4AX) with offline-calibrated thresholds plus a runtime lookup-table dispatch captures most of the benefit while keeping control overhead negligible.
4. Empirically this nearly closes the gap to full precision (99.5%) at a large memory/latency saving, on both simulation and a real robot.

## Why it matters
For this vault, DyQ-VLA is important on two axes at once.

First, it adds a **third route** to the `Model quantization` topic. The existing anchors are *representation design* ([[Ascend HiFloat8 Format for Deep Learning]] — redesign the number format) and *distribution reshaping / difficulty migration* ([[SmoothQuant: Accurate and Efficient Post-Training Quantization for Large Language Models]] — transform the distribution so a fixed low-bit format works). Both produce a **static** quantization configuration. DyQ-VLA is a different idea entirely: **make the bit allocation a function of the task's temporal state at runtime** — *input/state-conditioned dynamic mixed precision*. The novelty is not a better quantizer or a better format; it is treating precision as a control variable driven by a domain signal.

Second, it is the vault's **first embodied / VLA-specific quantization** note and the **first bridge** between the quantization cluster and the embodied/VLA cluster. The "domain signal" it exploits (kinematics) only exists because the model is a robot policy — this is what makes it VLA-specific rather than a generic LLM PTQ method. Notably, it quantizes **OpenVLA**, which sits in the autoregressive **VLM-as-actor** lineage discussed in [[Galaxea - G0.5 Autoregressive VLM-as-Actor VLA]] (RT-2 → OpenVLA → π0-FAST → G0.5), and it uses the vault's existing [[SmoothQuant: Accurate and Efficient Post-Training Quantization for Large Language Models]] (W4A4 static) as a baseline.

## What feels strong
- The core empirical observation is crisp and falsifiable: step-wise perturbation shows sensitivity concentrates in contact-rich phases. This is a genuinely VLA-specific insight, not borrowed from LLM PTQ.
- Using **kinematics as a free sensitivity proxy** is elegant — the signal is already on the robot, costs nothing extra, and ties precision to physical task difficulty rather than to activation statistics alone.
- The engineering is deployment-honest: offline calibration + constant-time LUT dispatch + hysteresis means the dynamic decision does not become a new bottleneck (the failure mode of most "adaptive" inference schemes).
- Evaluated on a **real robot**, not only in simulation — and the headline numbers are consistent across abstract and full text.

## What feels limited
- **Generalization is unproven.** Thresholds (θ_fp = 0.5) and window sizes are task-specific and hand-tuned; the paper reportedly does not probe out-of-distribution tasks or other embodiments. The kinematic proxy is validated on tabletop manipulation — unclear how it transfers to mobile, dexterous, or high-DoF settings.
- **Single base model.** Demonstrated on OpenVLA only. Whether the temporal-sensitivity pattern and the W4AX recipe hold for flow-matching / diffusion-action VLAs (π-style, GR00T-style) — where there is no single autoregressive action-decode step to gate — is open.
- **The proxy is a correlate, not a cause.** Motion fineness / angular jerk are assumed to track quantization sensitivity; the mapping is calibrated, not derived. Adversarial or contact-light-but-fragile cases (e.g. precise alignment at low speed) could break the assumption.
- **Speedups are modest** (~1.4–1.5×) relative to the framing. The memory win (to 30.9%) is the stronger result; the latency win is real but bounded by the BF16 fallbacks during the fragile phases that matter most.
- Mechanism details here are **extracted from the arXiv HTML via an automated reader and not yet hand-verified against the PDF** (see raw note); treat exact formulas, baseline names ("QVLA"), and ablation numbers as provisional.

## Ada's notes
The deepest idea in DyQ-VLA is **conditioning precision on task state**, which reframes quantization from a *static compilation-time decision* into a *runtime control problem*. That is conceptually adjacent to a theme the vault already cares about on the agent side — allocating compute/precision where the task is hard — and to the embodied dependability discussion in [[Home robot architecture - a hierarchical embodied agent]] (spend more capability budget in the fragile, contact-rich long tail; coast through the easy parts).

It also sharpens the `Model quantization` topic's open question "which low-bit strategies are about inference efficiency vs. which fundamentally affect training dynamics." DyQ-VLA is squarely the former — pure inference-time efficiency — but it adds a new sub-axis: *static vs. dynamic (input-conditioned) bit allocation*. SmoothQuant and HiFloat8 are both static; DyQ-VLA is the first dynamic example, and the lever it pulls (a domain signal) is what makes dynamic allocation cheap enough to be practical.

One caution for the vault: the result is currently a **single-model, single-domain** data point. I would resist generalizing "dynamic kinematic-gated precision" into a principle until there is a second instance (different VLA family or embodiment).

## Questions worth following up
1. Does the temporal-sensitivity pattern survive on **non-autoregressive** VLAs (flow-matching / diffusion action experts, π / GR00T families)? There the "action decode" is an iterative denoise, not a token step — what would the gating even gate?
2. How does DyQ-VLA compare against other VLA-specific quantization work — e.g. **EaqVLA** (Encoding-aligned Quantization, arXiv:2505.21567) and the "QVLA" baseline it reportedly cites? Are these static-per-channel methods strictly dominated, or better on different axes?
3. Is the kinematic proxy *necessary*, or would a cheap activation-statistics proxy (e.g. running outlier magnitude) recover most of the gain without needing robot state? I.e. how much of the win is "dynamic" vs. specifically "kinematic"?
4. Could the same idea be pushed to **weights** (dynamic-weight precision per phase via swappable kernels) rather than only activations?
5. What is the actual mechanism that maps sensitivity → bit-width thresholds, and how sensitive is performance to mis-calibration (the hand-tuned θ_fp / window sizes)?

## Possible downstream vault work
- Update [[Model quantization]] to add a third route — **dynamic / runtime-adaptive (input-conditioned) mixed precision** — beside representation-design and distribution-reshaping, and note DyQ-VLA as the first embodied/VLA entry. *(done in this ingest)*
- Consider a concept page **VLA quantization / efficient VLA inference** once a second source lands (EaqVLA, QVLA, or a diffusion-VLA quantization paper), to hold the static-vs-dynamic and per-channel-vs-temporal distinctions.
- Optionally cross-link from [[Embodied Brain Models]] (edge-deployment / cerebellum efficiency) once the cerebellum-side pages crystallize — kept light for now per incremental-maintenance.
