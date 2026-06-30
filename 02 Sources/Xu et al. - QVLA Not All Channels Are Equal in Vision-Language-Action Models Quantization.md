# QVLA: Not All Channels Are Equal in Vision-Language-Action Model's Quantization

- Raw note: [[2026-06-23 - Xu et al. - QVLA Not All Channels Are Equal in Vision-Language-Action Models Quantization]]

## Metadata
- Type: source note
- Format: arXiv paper / **ICLR 2026**
- Authors: [[Yuhao Xu]]*, Yantai Yang*, Zhenyang Fan, Yufan Liu†, Yuming Li, Bing Li†, Zhipeng Zhang† (*equal; †corresponding)
- Organization: **Shanghai Jiao Tong University (AutoLab)** + **CASIA** + UCAS + Ant Group + Anyverse Dynamics. *(verified from PDF)*
- Date accessed: 2026-06-23
- Original URL: https://arxiv.org/abs/2602.03782
- PDF URL: https://arxiv.org/pdf/2602.03782
- arXiv ID: 2602.03782 (v1 2026-02-03)
- Open source: **yes** — https://github.com/AutoLab-SAI-SJTU/QVLA (real code: sensitivity proxy + greedy gate assignment + eval; 44★). NB: eval is **`fakew` (fake-quant simulation)**; LICENSE not stated.
- Verification status: method, results, baselines **hand-verified against the full PDF (v1, 17 pp incl. App. A–E) on 2026-06-23**.
- ⚠️ **QVLA (Xu, this paper) ≠ QuantVLA (Zhang, CVPR 2026, 2602.20309)** — different papers, both Feb 2026. Also called **"AutoQVLA"** in this paper's appendix tables.
- Related: [[VLA quantization]], [[Model quantization]], [[DyQ-VLA: Temporal-Dynamic-Aware Quantization for Embodied Vision-Language-Action Models]], [[QuantVLA: Scale-Calibrated Post-Training Quantization for Vision-Language-Action Models]], [[Ω-QVLA: Robust Quantization for Vision-Language-Action Models via Composite Rotation and Per-step Scaling]], [[SmoothQuant: Accurate and Efficient Post-Training Quantization for Large Language Models]]
- Tags: #quantization #ptq #vla-quantization #embodied-ai #mixed-precision #bit-allocation #pruning #action-centric #iclr2026

## Summary
QVLA is the **first action-centric VLA quantization** method and the vault's **fourth VLA-quant source**. Its thesis: LLM-style **uniform-bit** PTQ optimizes feature/text fidelity, but VLA output is continuous action in a closed loop where small errors compound — so quantization should be guided by **action-space sensitivity**, not internal-feature reconstruction. Mechanism: measure how much quantizing each **output channel** to each bit-width `{0,2,4,8,16}` perturbs the final action (single-step Action-MSE + a cumulative long-horizon variant), via a cheap Taylor/Jacobian proxy; then a **global greedy demotion** assigns per-channel bits under an average-bit budget — **unifying quantization and pruning (0-bit = drop the channel)**. Activations stay **uniform-bit** (branch-free, stable latency); the **projector + action head are kept FP16** (most sensitive).

On LIBERO, OpenVLA-OFT at W4A4 retains 98.9% of FP (96.0%) at 29.2% VRAM with a reported **1.49× speedup** (+22.6% over SmoothQuant); it also generalizes to UniVLA, CALVIN, and a real-world π0 deployment (W8A16, 1.28×).

## Key claims
1. **VLA quantization must be action-centric**: anchor the objective in the action space (Action-MSE / cumulative deviation), not internal-feature reconstruction — because action errors compound autoregressively into task failure (Fig. 3).
2. **"Not all channels are equal"**: strong per-module *and* per-channel sensitivity heterogeneity (projector + action head most sensitive) → uniform-bit (even per-layer, à la HAWQ) is too coarse; **per-channel** mixed precision is needed.
3. **Quantization and pruning are one problem**: 0-bit = pruning, so a single per-channel bit-allocation `{0,2,4,8,16}` + greedy demotion unifies them under a budget.
4. **Action-guided allocation beats LLM-derived uniform PTQ** at equal average bits (W4A4 OpenVLA-OFT: 96.0 vs SmoothQuant 73.4), even matching/exceeding FP, while keeping a hardware-friendly (uniform-activation, branch-free) layout.

## Results (verified, Tab. 1–8)
- **W4A4 LIBERO:** OpenVLA-OFT 96.0% (98.9% retained) / 29.2% VRAM / **1.49×**; OpenVLA 76.0% (99.3%) / 28.2% / 1.47×. SmoothQuant collapses (OFT −23.7%).
- **Weight-only W4A16:** OpenVLA 0.0% loss (vs AWQ −4.7%); generalizes to **UniVLA-7B** + **CALVIN**.
- **Ablations:** channel-wise > layer-wise; prune(0-bit) + mixed bits > uniform-8bit; lower cumulative long-horizon error than uniform.
- **Real-world:** **π0** W8A16, dual-arm IMETA-Y1, ≈FP, 1.28×.
- Speedup reported as measured (4090/4070); released eval is fake-quant (`fakew`).

## Why it matters
QVLA **completes a clean 2×2** of the vault's VLA-quant cluster (the hub is [[VLA quantization]]):

| | **静态 / 离线决定精度** | **动态 / 运行时决定精度** |
|---|---|---|
| **敏感度驱动比特分配** | **QVLA** (per-channel action-sensitivity + 0-bit prune) | [[DyQ-VLA: Temporal-Dynamic-Aware Quantization for Embodied Vision-Language-Action Models\|DyQ-VLA]] (per-step kinematic bit-switch) |
| **分布重塑 / 旋转** | [[QuantVLA: Scale-Calibrated Post-Training Quantization for Vision-Language-Action Models\|QuantVLA]] (selective, keep DiT-attn FP) · [[Ω-QVLA: Robust Quantization for Vision-Language-Action Models via Composite Rotation and Per-step Scaling\|Ω-QVLA]] (uniform W4A4) | — |

Three sharp relationships:
- **QVLA is DyQ-VLA's static sibling.** Both are on the OpenVLA family and allocate precision by *action sensitivity*; QVLA decides **per-channel, offline** (+ pruning), DyQ-VLA decides **per-step, at runtime** (via a kinematic proxy). **DyQ-VLA literally uses QVLA as a baseline and beats it by only ~0.1%** — i.e. DyQ-VLA = "QVLA's static allocation, made dynamic," and the dynamic gain over the static allocator is marginal. Reading QVLA explains what DyQ-VLA's "QVLA (per-channel)" baseline actually is.
- **QVLA mirrors QuantVLA on "keep the sensitive interface FP."** QVLA keeps the **projector + action head** FP16; QuantVLA keeps **DiT attention** FP16; both locate the fragile multimodal→action interface and protect it. Only **Ω-QVLA quantizes everything** — the aggressive outlier.
- **Architecture split lines up with method choice.** The two OpenVLA/autoregressive methods (QVLA, DyQ-VLA) use **sensitivity-driven bit allocation**; the two diffusion-DiT methods (QuantVLA, Ω-QVLA) use **rotation/reshaping**. (Plausibly: the DiT's outlier problem invites rotation, while autoregressive action-token sensitivity invites per-channel allocation — an observation, not a proven necessity.)

In the `Model quantization` taxonomy, QVLA is neither Route 2 (no reshaping) nor strictly Route 3 (its allocation is *static/offline*, not runtime). It is best filed as **static importance-driven mixed-precision (bit allocation + structured pruning)** — the static half of the "adaptive precision allocation" family whose dynamic half is DyQ-VLA.

## What feels strong
- **The right objective.** Anchoring sensitivity in the *action space* (Action-MSE + cumulative) rather than feature reconstruction is the correct VLA-specific move, and the per-module/per-channel sensitivity maps (Fig. 1) are clean evidence that uniform-bit is wrong.
- **Unifying quant + pruning** via `{0,...,16}`-bit per channel + a budgeted greedy demotion is elegant and the ablation (Tab. 4) shows pruning genuinely helps.
- **Directly targets long-horizon error compounding** (Fig. 3) — the VLA-specific failure mode that aggregate success rate hides, and that LLM perplexity can't see.
- **Reports a measured speedup** (1.47–1.49× sim, 1.28× real) and is **architecture-general** (OpenVLA, OpenVLA-OFT, UniVLA, π0 real-world) — broader than DyQ-VLA's OpenVLA-only scope.
- **Hardware-pragmatic choices**: uniform activation bits (branch-free) + per-row weight dequant, an explicit nod to deployability.

## What feels limited
- **Released eval is fake-quant (`fakew`).** Accuracy is via simulated quant; the headline speedup is reported separately, and supporting true **mixed-bit (0/2/4/8/16) per-channel weight GEMM** as a real kernel is non-trivial and under-specified — so the "1.49× + branch-free" deployability is plausible-but-not-fully-demonstrated in the release. **(Re-verified 2026-06-30 against the arXiv full text: the paper describes _no_ mixed-bit kernel and gives _no_ timing methodology — only "weights stored per-row with own scale/zp, dequantized upon access," on RTX 4090. So the 1.49× is _not reproducible from the release_; it is bandwidth-plausible — memory-bound autoregressive decode makes weight compression ≈ speedup, no INT-GEMM required — but unsubstantiated, unlike DyQ-VLA's real-CUTLASS measurement.)**
- **Weight-only mixed precision; activations uniform.** The hard activation-outlier problem (the focus of QuantVLA/Ω-QVLA on the DiT side) is sidestepped by keeping activations uniform-bit; QVLA's novelty is on the *weight* allocation axis.
- **Sensitivity is offline/static.** It cannot adapt to runtime task phase (DyQ-VLA's pitch); the marginal gap to DyQ-VLA suggests static per-channel already captures most of the available benefit on OpenVLA, leaving the dynamic upside small.
- **Naming/clarity debt:** "QVLA" vs "AutoQVLA" used inconsistently within the paper; easily confused with QuantVLA.
- **Calibration dependency** (LIBERO demos + instruction subset) and the greedy allocator's heuristics (gate ratios, dual-threshold prune) are hand-tuned (App. C).

## Ada's notes
The cleanest way to file QVLA: it is the **static, weight-side, action-sensitivity bit-allocation** corner of the VLA-quant 2×2, and the **baseline DyQ-VLA is built on**. The vault now has all four corners — two reshaping (DiT) + two allocation (OpenVLA), and across them a recurring "**protect the multimodal→action interface**" instinct (QVLA: projector+action-head FP; QuantVLA: DiT-attn FP; DyQ-VLA: BF16 at hard phases) that Ω-QVLA alone rejects.

The deepest cross-paper point QVLA sharpens: **every VLA-quant paper independently rediscovers "action-space / closed-loop error compounding" as the thing that makes VLA quant ≠ LLM quant** — QVLA names it as the *objective* (action-MSE sensitivity), DyQ-VLA as *temporal sensitivity*, QuantVLA as *residual-energy + temperature drift*, Ω-QVLA as *DiT denoising-step drift*. Four lenses, one phenomenon (already the spine of the [[VLA quantization]] page).

Caution: QVLA's "first action-centric / first systematic VLA-quant analysis" (Feb 2026) competes with QuantVLA's "first PTQ for VLA" (also Feb 2026) and DyQ-VLA's framing — the "firsts" are simultaneous and scope-dependent; track *what each actually does*, not the banner.

## Questions worth following up
1. Is the **1.49× speedup real on a mixed-bit kernel**, or does the `{0,2,4,8,16}`-per-channel scheme fall back to dequant-then-FP (no real INT GEMM)? **Checked 2026-06-30: the paper documents no kernel and no timing method (only per-row dequant-on-access, RTX 4090), so the figure is _not reproducible from the `fakew` release_** — bandwidth-plausible (memory-bound decode ⇒ compression ≈ speedup) but unsubstantiated. Still open: whether a true mixed-bit GEMM was run off-paper, or the number is a roofline/bandwidth estimate. Same latency-credibility question dogs the whole cluster.
2. QVLA (static per-channel) vs DyQ-VLA (dynamic per-step) gap is ~0.1% on OpenVLA — **does the dynamic upside ever justify its runtime machinery**, or is static allocation the practical sweet spot?
3. QVLA keeps the **action head FP**; Ω-QVLA quantizes it (on DiT). On the *same* model, would action-sensitivity allocation let you quantize the action head safely, or is FP the right call there?
4. Could QVLA's **action-sensitivity bit allocation** be composed with the **rotation** methods (allocate bits per channel *after* SVD·Hadamard flattening)? Allocation and reshaping are orthogonal axes.

## Possible downstream vault work
- Update [[VLA quantization]] to a **4-way** landscape (add QVLA; reorganize around the strategy×timing 2×2) and move QVLA from "cited" to ingested. *(done in this ingest)*
- Update [[Model quantization]] — add QVLA under a "static importance-driven mixed-precision" note (sibling to Route-3 dynamic allocation). *(done)*
- Remaining cited VLA-quant: **EaqVLA** (arXiv:2505.21567, encoding-aligned), **SQAP-VLA** (arXiv:2509.09090, quant+prune). The cluster is now dense enough that a comparison synthesis (the 4-way matrix) is warranted.
