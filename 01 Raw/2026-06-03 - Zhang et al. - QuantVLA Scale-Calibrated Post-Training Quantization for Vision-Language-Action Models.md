# QuantVLA: Scale-Calibrated Post-Training Quantization for Vision-Language-Action Models

- Canonical URL: https://arxiv.org/abs/2602.20309
- PDF URL: https://arxiv.org/pdf/2602.20309
- Code: https://github.com/AIoT-MLSys-Lab/QuantVLA (Apache-2.0; verified real code — `gr00t/` quant dir + scripts/tests/examples, 34★, W4A8 GR00T N1.5; project page quantvla.github.io)
- Source type: arXiv (URL-only, Tier 1)
- Accessed at: 2026-06-03 Asia/Shanghai
- arXiv ID: 2602.20309 (v1 2026-02-23; v4 2026-04-06)
- Venue: **CVPR 2026**
- Authors: Jingxuan Zhang*, Yunta Hsieh*, Zhongwei Wan, Haokun Lin, Xin Wang, Ziqi Wang, Yingtie Lei, Mi Zhang† (*equal; †corresponding)
- Affiliation (verified from PDF): The Ohio State University (Mi Zhang's AIoT-MLSys-Lab), University of Michigan, City University of Hong Kong. Corresponding: Mi Zhang <mizhang.1@osu.edu>. **Note: author Haokun Lin is the first author of DuQuant**, which QuantVLA builds on.
- Subjects: cs.LG
- Tier: 1
- Raw-artifact decision: PDF 3.99 MB, trivially re-accessible on arXiv → **URL-only, not committed**.
- ⚠️ Disambiguation: **QuantVLA (Zhang et al., this paper, CVPR 2026, 2602.20309)** is NOT the same as **QVLA (Xu et al., ICLR 2026, 2602.03782, "Not all channels are equal…")** — both Feb 2026, easily confused.

## Raw capture
> Verification: hand-verified against the full PDF (v4, 13 pp incl. appendices A–G) on 2026-06-03 (pypdf). High confidence.

### Abstract (verbatim)
Vision-language-action (VLA) models unify perception, language, and control for embodied agents but face significant challenges in practical deployment due to rapidly increasing compute and memory demands, especially as models scale to longer horizons and larger backbones. To address these bottlenecks, we introduce QuantVLA, a training-free post-training quantization (PTQ) framework that, to our knowledge, is the first PTQ approach for VLA systems and the first to successfully quantize a diffusion transformer (DiT) action head. QuantVLA incorporates three scale-calibrated components: (1) a selective quantization layout that integerizes all linear layers in both the language backbone and the DiT while keeping attention projections in floating point to preserve the original operator schedule; (2) attention temperature matching, a lightweight per-head scaling mechanism that stabilizes attention logits and is folded into the dequantization scales at inference; and (3) output head balancing, a per-layer residual interface calibration that mitigates post-projection energy drift. The framework requires no additional training, uses only a small unlabeled calibration buffer, and supports integer kernels for low-bit weights and activations while leaving the architecture unchanged. Across representative VLA models on LIBERO, QuantVLA exceeds the task success rates of full-precision baselines, achieves about 70% relative memory savings on the quantized components, providing a practical pathway toward scalable low-bit embodied intelligence under strict compute, memory, and power constraints.

### Core thesis
First training-free PTQ for VLA **and** first to quantize a DiT action head. Quantizes all LLM linear + all DiT **MLP**, but **keeps DiT attention projections Q,K,V,O in FP16** (selective layout) to preserve the integer-GEMM operator schedule and avoid amplifying two drifts. Two lightweight calibrations (ATM, OHB) restore the broken scales. Primary precision **W4A8**.

### Why the DiT head is fragile (analysis, §3.2.2 + App C — the analytical contribution)
- Dequant scales control two *deterministic* factors in DiT attention: the **effective logits temperature** `T_eff = √d/(s_q s_k)` and the **residual-stream energy** (`s_v s_o`).
- First-order error propagation (Eqs 2–8): quantizing the upstream LLM perturbs the input that conditions the DiT (`X_Q = X_T + ε_up`); even with FP attention weights, this propagates → logits drift `∆L` → softmax **temperature bias** (persists/accumulates across layers) + output-amplitude drift → shifts the **residual injection gain** and the LayerNorm operating point → compounds in deep DiT stacks.

### Method — 3 scale-calibrated components (§3.3)
1. **Selective quantization layout**: integerize all LLM linear + all DiT MLP; keep DiT attention `W_q,W_k,W_v,W_o` in FP16. Justified by Table 1 ablation (no ATM/OHB): quantizing the full DiT or full stack tanks Long-horizon (π0.5 Long 93.5→50.0 at LLM+DiT-full); LLM+DiT(MLP) stays near baseline (π0.5 95.4% avg). 
2. **ATM (Attention Temperature Matching)**: per-head scalar `α = Std(L_T)/Std(L_Q)` (Eq. 9), clamp `|log α| ≤ 0.30`, neutrality band ε=0.03; quantized logits `L_Q = L_T/α`. Folded into dequant scales. Corrects softmax temperature drift.
3. **OHB (Output Head Balancing)**: per-layer scalar `β = RMS(Z_T)/RMS(Z_Q)` (Eq. 14), same clamp/band; rescales output-head activation entering the residual path `Z_Q = Z_l/β(l)`. Scope limited to the DiT head. Corrects residual-energy drift.
- Backbone reparam = **DuQuant** (per-channel smoothing Λ with α=0.15 + block-orthogonal rotations R̂(1),R̂(2) + zigzag permutation; block size 64 in/out; row-rotation mode "restore"; activation percentile 99.9; 32 calibration batches). ATM/OHB fit from an unlabeled buffer (128 steps, ≤5 trials/task).
- **Deployment property (key)**: ATM/OHB are tiny per-head/per-layer scalars folded into existing dequant scales → introduce **no new operators**, preserve the **operator schedule and integer GEMMs**, and incur **no additional GEMM computation at inference** (only one-time scalar folding at calibration).

### Models & results
- Base: **OpenPI π0.5** and **GR00T N1.5** (both DiT-based) — same two as Ω-QVLA. Plus OpenVLA (App G, non-DiT). Hardware: NVIDIA A100. Primary W4A8.
- **Table 2 (W4A8, success rate / memory / relative saving):** π0.5 FP16 97.1% / 4.27 GB → QuantVLA **97.6% / 1.28 GB / 70.0%**; GR00T N1.5 FP16 86.5% / 2.02 GB → **88.0% / 0.91 GB / 55.0%**. **Beats FP16 on both.**
- DuQuant(LLM+DiT, full) collapses: π0.5 76.3%, GR00T 70.0% — "unimodal/loosely-coupled methods don't transfer."
- **W4A4 (Table 3):** π0.5 95.3% avg (vs 97.6% W4A8, 97.1% FP16) — drops ~2pp at A4.
- Denoising steps (Table 4): GR00T 8-step 88.0%, 16-step 88.5%.
- App E (SmoothQuant): SQ W8A8 competitive; QuantVLA matches/slightly-better at the more aggressive W4A8. App F (Pick-Can): GR00T FP16 31/50, SQ W4A8 16/50, QuantVLA W4A8 27/50. App G (OpenVLA, non-DiT): FP16 84.7 → QuantVLA W8A16 86.0 (ATM/OHB not applicable to non-DiT heads).
- **Efficiency reported = MEMORY + accuracy only; NO wall-clock latency/speedup** anywhere (main text or appendices). But the design targets **real integer GEMMs** (selective layout preserves the operator schedule; ATM/OHB folded into dequant → zero extra GEMM) — i.e. genuinely deployable, unlike a fake-quant accuracy harness.

### Stated framing / contributions
- "First systematic analysis of quantization sensitivity in VLA models with DiT action heads."
- "First **rotation-based**, training-free PTQ framework for VLA models." / "first PTQ for VLA" / "first to quantize a DiT action head."
- (Reconciles with Ω-QVLA's later claim: QuantVLA quantizes the DiT **MLP** keeping attention FP; Ω-QVLA quantizes the **entire** DiT incl. attention to uniform W4A4.)
