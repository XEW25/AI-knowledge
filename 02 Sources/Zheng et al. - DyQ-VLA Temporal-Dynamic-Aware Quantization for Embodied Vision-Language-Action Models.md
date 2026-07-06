# DyQ-VLA: Temporal-Dynamic-Aware Quantization for Embodied Vision-Language-Action Models

- Raw note: [[2026-06-03 - Zheng et al. - DyQ-VLA Temporal-Dynamic-Aware Quantization for Embodied Vision-Language-Action Models]]

## Metadata
- Type: source note
- Format: arXiv paper (preprint; cs.LG / cs.RO)
- Authors: Zihao Zheng* , Hangyu Cao*, Sicheng Tian, Jiayu Chen, Maoliang Li, Xinhao Sun, Hailong Zou, Zhaobo Zhang, Xuanzhe Liu, Donggang Cao, Hong Mei, Xiang Chen† (*equal contribution; †corresponding)
- Organization: **Peking University** (lead — School of Computer Science / School of EECS), with **South China University of Technology** and **Beijing Normal University**. Corresponding author: Xiang Chen <xiang.chen@pku.edu.cn> *(verified from PDF)*
- Date accessed: 2026-06-03
- Original URL: https://arxiv.org/abs/2603.07904
- PDF URL: https://arxiv.org/pdf/2603.07904
- arXiv ID: 2603.07904 (v2, 2026-03-14; submitted 2026-03-09)
- Open source: **none located** — the paper makes no code/weights release claim, has no GitHub/project link, and no repository was found via web search (checked 2026-06-03)
- Verification status: mechanism, baselines, and results **hand-verified against the PDF (v2) on 2026-06-03**, reading the full 9-page text directly (supersedes the initial automated extraction; that extraction proved accurate, with refinements noted below)
- Related: [[Model quantization]], [[Xiao et al. - SmoothQuant Accurate and Efficient Post-Training Quantization for Large Language Models]], [[Luo et al. - Ascend HiFloat8 Format for Deep Learning]], [[Embodied Brain Models]], [[Galaxea - G0.5 Autoregressive VLM-as-Actor VLA]]
- Tags: #quantization #ptq #vla-quantization #embodied-ai #mixed-precision #dynamic-quantization #w4ax #edge-deployment

## Summary
DyQ-VLA is a post-training **dynamic quantization** framework for Vision-Language-Action models, aimed at edge deployment. Its central observation is that VLA inference has **temporal-dynamic sensitivity**: the same quantization noise hurts very differently depending on *where in the manipulation episode* it occurs. Coarse free-space motion tolerates aggressive low-bit activations; fine-grained contact phases (grasp, insertion) are fragile because, in the closed observation→action loop, a local error `e` compounds via `Δx_t ≈ J_T Δx_{t-1} + J_T(J_π·e)` (Eq. 3) into trajectory drift. Static quantization is forced to hold peak precision for the whole episode, wasting it during the robust phases.

DyQ-VLA keeps weights at static INT4 and makes **activation precision a function of the robot's real-time kinematic state** (a "W4AX" paradigm, X ∈ {2, 4, 8, 16=BF16}). A cheap runtime proxy — fusing *motion fineness* (translational, macro-trend) and *angular jerk* (rotational, micro-spikes) into a sensitivity score `S_t` — decides at each step whether to force full precision (BF16) or to consult an offline-calibrated table mapping `S_t` to an activation bit-width {2,4,8}. Dispatch is a constant-time lookup to pre-compiled CUTLASS kernels routed via an asynchronous CPU-GPU pipeline, so the control logic is nearly free at inference.

It retains 99.5% of OpenVLA's average task performance at 30.9% of the original memory footprint (4.7 GB vs 15.2 GB), with ~1.49× speedup in simulation (LIBERO) and up to ~1.43× in real-world tabletop manipulation.

## Key claims
1. VLA quantization error is **not stationary across time** — error tolerance varies by manipulation stage, and the closed-loop dynamics (Eq. 3) make fine phases fragile — so a single static bit-width is intrinsically suboptimal.
2. This per-step sensitivity (ground-truth `s_t = D_T / e_t`, only knowable post-hoc) can be **estimated online from kinematic signals** already available at inference, with high correlation (motion fineness r=0.90, angular jerk r=0.87).
3. A **static-weight / dynamic-activation** scheme (W4AX) with offline-calibrated thresholds plus a runtime lookup-table dispatch captures most of the benefit while keeping control overhead negligible (<0.5 ms, <64 KB, hidden under the GPU prefill).
4. The design is **orthogonal and plug-and-play** — it augments static methods rather than replacing them — and empirically nearly closes the gap to full precision (99.5%) at large memory/latency savings on both simulation and a real robot.

## Results (verified, Tab. I–III)
- **Simulation (LIBERO, OpenVLA; FP BF16 = 15.2 GB baseline).** DyQ-VLA: 4.7 GB peak (30.9%; −10.5 GB), 1.47–1.51×, avg SR 76.1% ≈ 99.5% of FP. Per-suite SR (FP → DyQ-VLA): Goal 79.2→78.5, Object 88.4→87.8, Spatial 84.7→84.7 (lossless), Long 53.7→53.4.
- **vs baselines.** QVLA (per-channel static W4A4, SOTA VLA-quant): DyQ-VLA is +0.1% avg SR but at *slightly more* memory (QVLA 4.3 GB). SmoothQuant (static W4A4): higher speed but large SR loss (Spatial 69.2 vs DyQ 84.7).
- **Real world (6-DoF arm + 1-DoF gripper; FP → DyQ-VLA SR).** Atomic grasping 86.7→86.7 (0.0% loss, 1.43×); spatial displacement 76.7→73.3 (1.32×); composite sequential 70.0→66.7 (1.38×). *(Real-robot model adapted via QLoRA, rank 32, 4-bit weights frozen.)*
- **Ablation (LIBERO-Spatial).** Static W4A4 69.2% / 84.9 ms → +kinematic dispatch 85.0% / 101.7 ms (+16.8 ms) → +mixed-precision backend 84.8% / 93.5 ms (−8.2 ms) → +async engine 84.7% / 89.4 ms (−4.1 ms), final 1.51×.

## Why it matters
For this vault, DyQ-VLA is important on two axes at once.

First, it adds a **third route** to the `Model quantization` topic. The existing anchors are *representation design* ([[Luo et al. - Ascend HiFloat8 Format for Deep Learning]]) and *distribution reshaping / difficulty migration* ([[Xiao et al. - SmoothQuant Accurate and Efficient Post-Training Quantization for Large Language Models]]) — both produce a **static** configuration. DyQ-VLA is *input/state-conditioned dynamic mixed precision*: bit allocation becomes a runtime control variable driven by a domain signal. Crucially, **the authors themselves frame it as "orthogonal, plug-and-play"** that *augments* static methods — strong support for treating it as a new *axis* (static-vs-runtime) rather than a competitor to HiF8/SmoothQuant.

Second, it is the vault's **first embodied / VLA-specific quantization** note and the **first bridge** between the quantization cluster and the embodied/VLA cluster. The signal it exploits (kinematics) only exists because the model is a robot policy. It quantizes **OpenVLA**, in the autoregressive **VLM-as-actor** lineage discussed in [[Galaxea - G0.5 Autoregressive VLM-as-Actor VLA]] (RT-2 → OpenVLA → π0-FAST → G0.5), and uses the vault's existing [[Xiao et al. - SmoothQuant Accurate and Efficient Post-Training Quantization for Large Language Models]] as a baseline.

## What feels strong
- The core empirical observation is crisp and falsifiable: step-wise perturbation (inject one W4A4 action at step `t`, then resume FP) shows local action error decouples from final success — sensitivity concentrates in contact-rich phases. This is a genuinely VLA-specific insight, not borrowed from LLM PTQ.
- **Kinematics as a free sensitivity proxy** is elegant and *empirically validated* (r=0.90 / 0.87), with a sensible split: motion fineness for the smooth macro-trend, angular jerk for transient spikes.
- The **systems engineering is serious**, not hand-waved: INT4-pinned weights across all precisions; a fused MMA kernel (scaling+quant+GMEM-pack); on-the-fly INT4→INT8 register decompression for the 8-bit path; GMEM pack/unpack for the 2-bit path; pre-compiled CUTLASS kernels; an async CPU-GPU pipeline writing the bit-width flag to zero-copy mapped memory; and bit-width chosen *per step/action-chunk, not per token*. Net dynamic-control overhead is <0.5 ms and hidden under the visual prefill.
- The **asymmetric hysteresis** is the right instinct: instant precision *upgrade* (recover BF16 the moment a hard action begins) but delayed *downgrade* (low-pass filter to absorb sensory noise) — accuracy-first.
- Evaluated on a **real robot**, not only in simulation.

## What feels limited
- **Single base model.** Demonstrated on OpenVLA only, and it explicitly *relies* on the "homogeneous, token-by-token, no independent modules" property. Whether the temporal-sensitivity pattern and the W4AX recipe transfer to flow-matching / diffusion-action VLAs (π / GR00T families) — where action "decode" is an iterative denoise with no single token step to gate — is wide open.
- **The win over QVLA is razor-thin.** +0.1% avg SR *and slightly more memory* (4.7 vs 4.3 GB). On the static Pareto point DyQ-VLA ≈ QVLA; the genuine contribution is the dynamic paradigm + the speed/accuracy balance, not dominating QVLA on accuracy or memory. The framing slightly oversells relative to the numbers.
- **Real-world numbers fold in task adaptation.** The real-robot model is QLoRA-fine-tuned (rank 32) to the new arm with 4-bit weights frozen — so the real-world results are not pure plug-in quantization of an off-the-shelf checkpoint.
- **Hand-tuned, task-specific knobs.** θ_fp = 0.5, W_macro = 10, W_micro = 5; no OOD-task or embodiment-shift study. The kinematic proxy is a *correlate* of sensitivity (calibrated, not derived) — a precise-but-slow alignment phase (low speed, low jerk, yet fragile) could fool it.
- **Speedups are modest** (1.3–1.5×); the memory result (to 30.9%) is the stronger headline, and that comes mostly from the static W4 weights — i.e. it is shared with QVLA/SmoothQuant, not unique to the dynamic part.

## Ada's notes
The deepest idea is **conditioning precision on task state** — reframing quantization from a static compile-time decision into a *runtime control problem*, adjacent to the vault's interest in spending capability budget where the task is hard (cf. [[Home robot architecture - a hierarchical embodied agent]]: coast through easy phases, concentrate effort in the fragile contact-rich long tail).

A useful realization from reading the references: this is one of (at least) **two papers by the same PKU group applying the same "kinematics as a cheap real-time signal" idea** — the sibling is *KERV: Kinematic-rectified speculative decoding for embodied VLA models* (arXiv:2603.01581, 2026; overlapping author set). So the group's deeper bet is not "dynamic quantization" specifically but **"robot kinematics is a free, reliable runtime controller for VLA inference efficiency"**, applicable across quantization, speculative decoding, caching, etc. That is the more general, more interesting thesis to watch.

Caution for the vault: the result is a **single-model, single-domain** data point, and its margin over the static SOTA (QVLA) is within noise. I would treat "dynamic kinematic-gated precision" as a *promising paradigm*, not an established principle, until a second instance (different VLA family / embodiment) lands.

## Questions worth following up
1. Does the temporal-sensitivity pattern survive on **non-autoregressive** VLAs (flow-matching / diffusion action experts)? There the gating target is unclear — what would replace the per-token bit switch?
2. How does DyQ-VLA actually compare to the VLA-quant SOTA it cites — **QVLA** (arXiv:2602.03782, per-channel) and **SQAP-VLA** (arXiv:2509.09090, quant+pruning co-design)? Given the ~0.1% margin, is the dynamic scheme worth its complexity over a well-tuned static per-channel method?
3. How much of the gain is from being *dynamic* vs. specifically *kinematic*? Would a cheap activation-statistics proxy recover most of it without robot state?
4. Could the same kinematic signal drive **other** efficiency levers jointly (the KERV speculative-decoding line + quantization + caching) for a unified runtime controller?
5. How brittle are the hand-tuned θ_fp / window sizes under task or embodiment shift?

## Possible downstream vault work
- Update [[Model quantization]] with a third route — **dynamic / runtime-adaptive (input-conditioned) mixed precision**. *(done)*
- A `VLA quantization / efficient VLA inference` concept page once a second source lands — natural candidates: **QVLA** (arXiv:2602.03782), **SQAP-VLA** (arXiv:2509.09090), and the kinematic-proxy sibling **KERV** (arXiv:2603.01581). It would hold the static-vs-dynamic, per-channel-vs-temporal, and quant-vs-prune-vs-spec-decode distinctions.
- Optionally cross-link from [[Embodied Brain Models]] (edge/cerebellum efficiency) once those pages crystallize — kept light for now.
