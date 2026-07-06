# QuantVLA: Scale-Calibrated Post-Training Quantization for Vision-Language-Action Models

- Raw note: [[2026-06-03 - Zhang et al. - QuantVLA Scale-Calibrated Post-Training Quantization for Vision-Language-Action Models]]

## Metadata
- Type: source note
- Format: arXiv paper / **CVPR 2026**
- Authors: Jingxuan Zhang*, Yunta Hsieh*, Zhongwei Wan, Haokun Lin, Xin Wang, Ziqi Wang, Yingtie Lei, Mi Zhang† (*equal; †corresponding)
- Organization: **The Ohio State University** (Mi Zhang's AIoT-MLSys-Lab) + **University of Michigan** + **City University of Hong Kong**. *(verified from PDF)* — author **Haokun Lin is the first author of DuQuant**, the method QuantVLA builds on.
- Date accessed: 2026-06-03
- Original URL: https://arxiv.org/abs/2602.20309
- PDF URL: https://arxiv.org/pdf/2602.20309
- arXiv ID: 2602.20309 (v1 2026-02-23; v4 2026-04-06)
- Open source: **yes** — https://github.com/AIoT-MLSys-Lab/QuantVLA, Apache-2.0; verified real quant code (`gr00t/`, scripts/tests, 34★) + project page quantvla.github.io.
- Verification status: mechanism, baselines, results **hand-verified against the full PDF (v4, 13 pp incl. App. A–G) on 2026-06-03**.
- ⚠️ Not to be confused with **QVLA** (Xu et al., ICLR 2026, arXiv:2602.03782, per-channel "not all channels are equal") — a *different* paper, also Feb 2026. This is **QuantVLA** (Zhang et al., scale-calibrated, CVPR 2026).
- Related: [[VLA quantization]], [[Model quantization]], [[Wang et al. - Omega-QVLA Robust Quantization for Vision-Language-Action Models via Composite Rotation and Per-step Scaling]], [[Zheng et al. - DyQ-VLA Temporal-Dynamic-Aware Quantization for Embodied Vision-Language-Action Models]], [[Xiao et al. - SmoothQuant Accurate and Efficient Post-Training Quantization for Large Language Models]], [[Physical Intelligence - pi0.5 a VLA with Open-World Generalization]], [[NVIDIA - GR00T N1 An Open Foundation Model for Generalist Humanoid Robots]]
- Tags: #quantization #ptq #vla-quantization #embodied-ai #w4a8 #rotation-quantization #duquant #diffusion-transformer #dit #cvpr2026

## Summary
QuantVLA is a training-free, **rotation-based** PTQ framework for VLA models, and (by its own claim) the **first PTQ for VLA / first to quantize a DiT action head**. Its thesis is the *opposite engineering bet* to [[Wang et al. - Omega-QVLA Robust Quantization for Vision-Language-Action Models via Composite Rotation and Per-step Scaling|Ω-QVLA]]: rather than push *uniform* low-bit onto the whole DiT, QuantVLA **selectively** quantizes (all LLM linear + all DiT **MLP**) while **keeping the DiT attention projections Q,K,V,O in FP16** — precisely to avoid the two failure modes it identifies and to **preserve the integer-GEMM operator schedule** for real deployment.

The analytical core (§3.2.2 + App. C) is a clean first-order account of *why* the DiT head is fragile under upstream quantization: dequant-scale drift changes two deterministic quantities — the **effective softmax temperature** `T_eff=√d/(s_q s_k)` and the **residual-stream energy** (`s_v s_o`) — and these biases accumulate across the DiT's residual/normalization stack. Two tiny calibrations fix exactly these: **ATM** (per-head scalar matching teacher/student logit dispersion) restores the temperature; **OHB** (per-layer scalar matching output-projection RMS) restores the residual energy. Both are folded into existing dequant scales → no new operators, no extra GEMM.

On LIBERO (W4A8) it **exceeds the FP16 baseline** on both π0.5 (97.6% vs 97.1%, 4.27→1.28 GB) and GR00T N1.5 (88.0% vs 86.5%, 2.02→0.91 GB), at ~55–70% memory savings; it also holds at W4A4 (π0.5 95.3%). Built on DuQuant (one of its authors is DuQuant's first author).

## Key claims
1. The DiT action head's quantization fragility is **explained, not just observed**: it reduces to softmax-temperature drift (`s_q s_k`) and residual-energy drift (`s_v s_o`), derived via first-order error propagation from upstream-LLM quantization.
2. A **selective layout** (LLM + DiT MLP integerized, DiT attention kept FP16) avoids compounding errors at the most fragile interfaces while keeping the integer-GEMM schedule intact — and Table 1 shows full-DiT/full-stack quant collapses long-horizon tasks, whereas LLM+DiT-MLP stays near baseline.
3. Two near-free scalars — **ATM** (per-head temperature) and **OHB** (per-layer output energy) — folded into dequant scales recover the residual gap and let W4A8 **exceed** FP16.
4. The result is the **first effective PTQ for VLA / first DiT-head quantization**, training-free, architecture-preserving, and **integer-kernel-compatible** (deployment-oriented).

## Results (verified, Tab. 1–7)
- **LIBERO W4A8 (Table 2, SR / mem / saving):** π0.5 97.6% / 1.28 GB / **70.0%** (FP16 97.1% / 4.27 GB); GR00T N1.5 88.0% / 0.91 GB / **55.0%** (FP16 86.5% / 2.02 GB). Beats FP16 on both. DuQuant(LLM+DiT full) collapses (76.3% / 70.0%).
- **W4A4 (Table 3):** π0.5 95.3% (−2.3 vs W4A8). **W8A16 OpenVLA (App G, non-DiT):** 86.0 vs FP16 84.7 (ATM/OHB n/a).
- **Steps (Table 4):** GR00T 8-step 88.0%, 16-step 88.5%. **Pick-Can (App F):** GR00T FP16 31/50, SmoothQuant W4A8 16/50, QuantVLA W4A8 27/50.
- **Memory only — no wall-clock latency reported** (but designed for real integer GEMMs).

## Why it matters
QuantVLA is the vault's **third VLA-quantization source** and completes a tight, three-way picture (with [[VLA quantization]] as the hub). It is the **direct predecessor and main baseline of Ω-QVLA**, and the two are an unusually clean controlled comparison: **both are DuQuant-based rotation PTQ, on the same two models (π0.5, GR00T N1.5), making opposite choices.**

| | [[Zheng et al. - DyQ-VLA Temporal-Dynamic-Aware Quantization for Embodied Vision-Language-Action Models\|DyQ-VLA]] | **QuantVLA** | [[Wang et al. - Omega-QVLA Robust Quantization for Vision-Language-Action Models via Composite Rotation and Per-step Scaling\|Ω-QVLA]] |
|---|---|---|---|
| Base | OpenVLA (autoregressive) | π0.5, GR00T (DiT) | π0.5, GR00T (DiT) |
| Precision | dynamic W4AX | **W4A8** (also W4A4) | uniform W4A4 |
| DiT attention | n/a (no DiT) | **kept FP16** | quantized |
| Route ([[Model quantization]]) | 3 (dynamic) | 2 (rotation / DuQuant) | 2 (rotation / SVD·Hadamard) |
| Deployability | real (centers latency, 1.4×) | **real integer GEMM by design** (no wall-clock reported) | fake-quant (no real kernel) |
| Reports latency? | yes | **no** | no |
| Code | none | Apache-2.0 | Apache-2.0 |

The single sharpest axis is **DiT attention**: QuantVLA keeps it FP16 (believing it too sensitive + to protect the operator schedule); Ω-QVLA's entire contribution is showing you *don't* have to (uniform W4A4 incl. attention via SVD·Hadamard + per-step scaling). Their "first" claims are thus consistent at different granularities — QuantVLA = first to quantize a DiT head (the MLP), Ω-QVLA = first to do it *uniformly* (incl. attention).

A second, under-appreciated axis is **deployability vs accuracy, which flips between the two DiT papers**: QuantVLA is the conservative-but-deployable one (W4A8, FP attention, real integer GEMMs, schedule preserved), Ω-QVLA is the aggressive-but-fake-quant one (W4A4 uniform, no real kernel). Notably **neither reports wall-clock latency** — only DyQ-VLA does. So across the vault's VLA-quant cluster, *latency remains the systematically missing number for DiT-based VLAs.*

## What feels strong
- **It explains the failure mode, not just patches it.** The `T_eff=√d/(s_q s_k)` temperature + `s_v s_o` residual-energy decomposition (Eqs 2–8, App. C) is a genuine analytical contribution; ATM and OHB are derived *from* it (fix the temperature, fix the energy), not bolted on.
- **Deployment honesty.** Keeping attention FP16 to preserve the operator schedule, and folding ATM/OHB into existing dequant scales (no new ops, no extra GEMM), is a real integer-kernel design — the most deployable of the three VLA-quant works.
- **Exceeds FP16** on both backbones — the calibration genuinely recovers (and slightly overshoots) the baseline, not merely "near-lossless."
- **Real, reproducible code** (Apache-2.0) and a clean ablation (Table 1) isolating the layer-selection effect before adding calibrations.

## What feels limited
- **No wall-clock latency** (like Ω-QVLA). The motivation is deployment efficiency, but only memory + accuracy are reported; the integer-GEMM speed benefit is argued by design, not measured.
- **Selective ≠ full**: it does *not* quantize DiT attention (the hardest, most memory-relevant part on attention-heavy models like GR00T — hence GR00T's saving is only 55% vs π0.5's 70%). This is exactly the gap Ω-QVLA then attacks; QuantVLA's W4A4 (Table 3) also trails Ω-QVLA's uniform W4A4 (π0.5 95.3 vs 98.0; and Ω-QVLA reports GR00T 87.8 at full-W4A4).
- **Two DiT backbones + LIBERO** (Simpler/Pick-Can and OpenVLA only in appendices, the latter at W8A16). Scope is π0.5/GR00T-style DiT VLAs.
- **ATM/OHB are interface band-aids**: they restore *aggregate* statistics (logit Std, output RMS) at the LLM→DiT interface; they don't touch the within-attention quantization (since attention stays FP), so they're inseparable from the "keep attention FP" choice.

## Ada's notes
The most useful vault framing: **QuantVLA and Ω-QVLA are a matched pair — same DuQuant lineage, same two models, opposite bets on DiT attention and on the accuracy↔deployability trade.** QuantVLA says "protect the fragile attention (keep it FP), restore the interface scales, ship real integer GEMMs"; Ω-QVLA says "with a strong enough rotation you can quantize attention too, at the cost of a deployable kernel." That makes them the cleanest illustration in the vault of the **conservative-deployable vs aggressive-accuracy** spectrum within one method family (rotation PTQ).

A second insight worth keeping: QuantVLA's analysis **localizes DiT fragility to two scalar quantities** (temperature, residual energy), and Ω-QVLA's App. A.6 **localizes it to AdaLayerNorm-fed QKV layers**. These are two lenses on the same phenomenon (the attention path is where DiT quantization breaks). DyQ-VLA's "fine-manipulation sensitivity spike" is the *temporal* version of the same story. Three papers, three lenses on "the action head's attention/contact-phase is the fragile locus."

Caution: the "first PTQ for VLA / first DiT quantization" claim is real but narrow — it's *first to quantize a DiT MLP head while keeping attention FP*. Combined with QVLA (Xu) and DyQ-VLA also claiming firsts in the same months, the "first" race here is mostly about precise scope; the vault should track *what exactly* each quantizes rather than the marketing.

## Questions worth following up
1. **Latency, finally**: QuantVLA has real integer GEMMs and a deployable design — why no wall-clock? A head-to-head latency of QuantVLA (W4A8, real kernel) vs DyQ-VLA (W4AX, real kernel) vs FP16 would settle the cluster's biggest open number.
2. Is keeping DiT attention FP16 *necessary*, or did ATM/OHB + a better attention rotation (à la Ω-QVLA) make it unnecessary? Ω-QVLA argues the latter — but at fake-quant only. **Who is right on real hardware?**
3. Could ATM/OHB (cheap interface scalars) be **composed with Ω-QVLA's uniform-W4A4 attention** to get both deployability and full quantization?
4. ATM/OHB restore aggregate logit/energy statistics — do they help or are they redundant once the attention is itself quantized + rotated?
5. How does QuantVLA compare to **QVLA (Xu, per-channel)** and **SQAP-VLA (quant+prune)** head-to-head on the same models?

## Possible downstream vault work
- Update [[VLA quantization]] to a **three-way** landscape (DyQ-VLA / QuantVLA / Ω-QVLA) with the contrast table above and the "QuantVLA(Zhang)≠QVLA(Xu)" disambiguation. *(done in this ingest)*
- Update [[Model quantization]] — add QuantVLA under Route 2 (rotation / DuQuant lineage). *(done)*
- Remaining cited landscape to round out the cluster: **QVLA** (Xu, arXiv:2602.03782), **SQAP-VLA** (arXiv:2509.09090). DuQuant itself is now cited by two vault sources → a candidate concept/source page.
- Optional: a small **DuQuant** stub (it underpins both QuantVLA and Ω-QVLA).
