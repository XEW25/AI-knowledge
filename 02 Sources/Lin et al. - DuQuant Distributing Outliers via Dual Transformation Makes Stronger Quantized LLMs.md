# DuQuant: Distributing Outliers via Dual Transformation Makes Stronger Quantized LLMs

- Raw note: [[2026-06-03 - Lin et al. - DuQuant Distributing Outliers via Dual Transformation Makes Stronger Quantized LLMs]]

## Metadata
- Type: source note
- Format: arXiv paper / **NeurIPS 2024 (Oral)**
- Authors: [[Haokun Lin]]*, Haobo Xu*, Yichen Wu*, Jingzhi Cui, Yingtao Zhang, Linzhan Mou, Linqi Song, Zhenan Sun†, Ying Wei† (*equal; †corresponding)
- Organization: **UCAS** + **Tsinghua** + **CASIA (Institute of Automation, CAS)** + **City University of Hong Kong** + **Zhejiang University**. *(verified from PDF)* — first author **Haokun Lin later co-authored [[QuantVLA: Scale-Calibrated Post-Training Quantization for Vision-Language-Action Models|QuantVLA]]**.
- Date accessed: 2026-06-03
- Original URL: https://arxiv.org/abs/2406.01721
- PDF URL: https://arxiv.org/pdf/2406.01721
- arXiv ID: 2406.01721 (v3, 2024-11-01)
- Open source: **yes** — https://github.com/Hsu1023/DuQuant, MIT, verified real code (`quantize/`, `get_rot.py`, eval harness; 180★) + project page duquant.github.io. DuQuant++ follow-up announced (Apr 2026).
- Verification status: mechanism, baselines, results **hand-verified against the full PDF (v3, 29 pp incl. appendices) on 2026-06-03**.
- Related: [[Model quantization]], [[VLA quantization]], [[SmoothQuant: Accurate and Efficient Post-Training Quantization for Large Language Models]], [[QuantVLA: Scale-Calibrated Post-Training Quantization for Vision-Language-Action Models]], [[Ω-QVLA: Robust Quantization for Vision-Language-Action Models via Composite Rotation and Per-step Scaling]]
- Tags: #quantization #ptq #llm-quantization #w4a4 #rotation-quantization #permutation #activation-outliers #massive-outliers #neurips2024

## Summary
DuQuant is a **training-free, rotation-based W4A4 PTQ** method for LLMs and the **foundational method underneath the vault's whole VLA-quant cluster** — both [[QuantVLA: Scale-Calibrated Post-Training Quantization for Vision-Language-Action Models|QuantVLA]] and [[Ω-QVLA: Robust Quantization for Vision-Language-Action Models via Composite Rotation and Per-step Scaling|Ω-QVLA]] adopt its reparameterization, and QuantVLA shares its first author (Haokun Lin).

Its two contributions: (1) it **names and localizes "Massive Outliers"** — a few tokens with ~1000× magnitudes at the **FFN down-projection input** — and shows why smoothing-only methods (SmoothQuant) and optimization methods (OmniQuant/AffineQuant) break on them; (2) the **"dual transformation"**: a per-channel smoothing `Λ`, a greedy **data-aware block-diagonal rotation** `R̂(1)` that redistributes outliers within blocks, a **zigzag permutation** `P` that balances them across blocks, and a second rotation `R̂(2)`. All are orthogonal (rotation/permutation) or diagonal (smoothing), folded into a composite `G` and `G⁻¹` so the linear map is preserved. Because it smooths weights *and* activations and manages outliers so well, it reaches SOTA W4A4 **using plain RTN — no GPTQ** — and runs fast (quantizes LLaMA2-7B in 50 s, 2.08× pre-fill speedup with a real W4A4 kernel).

## Key claims
1. There are **two distinct outlier types** — Normal (all tokens, certain channels) and **Massive** (few tokens, ~1000× magnitude, at FFN down_proj) — and prior PTQ fails on the massive ones (smoothing blows up weights; optimization explodes).
2. A **greedy, prior-knowledge-guided rotation beats a random Hadamard** (QuaRot) at targeting outliers — it uses the actual outlier dimensions to construct the orthogonal block rotation.
3. A **zigzag permutation** is needed *in addition* to block rotation, because block-diagonal rotation can't move energy across blocks → permutation balances inter-block variance (Theorem 2).
4. Jointly smoothing weights+activations via the composite transform lets DuQuant **skip GPTQ** (use RTN) and still hit SOTA W4A4, fast.

## Why it matters
DuQuant is the **root of the vault's rotation-quantization line** and the concrete origin of several threads already in the vault:
- **It is the shared ancestor of QuantVLA and Ω-QVLA.** Both inherit DuQuant's block-wise rotation (block 64) + zigzag permutation + smoothing; QuantVLA adds ATM/OHB interface calibrations, Ω-QVLA swaps the greedy rotation for an SVD·Hadamard composite + per-step DiT scaling. Ingesting DuQuant turns "the methods build on DuQuant" from a dangling reference into a real node.
- **It is the origin of the "down_proj massive outlier" finding** that resurfaces as Ω-QVLA's pathological layer (`LLM.L02.down_proj`, where pure SVD is *actively harmful*). DuQuant identified this locus and the mechanism (smoothing factor → weight outliers).
- **It instantiates the "orthogonal + scaling" principle** from our condition-number discussion: DuQuant = orthogonal rotation + orthogonal permutation + diagonal smoothing — i.e. it stays in the well-conditioned (κ≈1 rotation, controlled diagonal scaling) regime rather than using a free dense invertible transform. It also sits at the **data-aware** end of the rotation axis (greedy, outlier-prior) vs QuaRot's **data-independent** Hadamard — the same SVD-vs-Hadamard distinction the vault's Ω-QVLA deep-dive draws.
- In the `Model quantization` taxonomy it is a **Route 2 (distribution reshaping)** anchor, the bridge from SmoothQuant (pure diagonal smoothing) to the modern rotation methods (QuaRot/DuQuant → SVD·Hadamard).

## What feels strong
- **Names a real phenomenon precisely** (massive outliers @ down_proj) and ties the method to it — the rotation+permutation directly target the thing prior methods break on. The ablations (Table 6/7) cleanly attribute the gains.
- **Greedy data-aware rotation + zigzag permutation** is a genuinely better outlier-redistributor than random Hadamard (Table 8: DuQuant-RTN ≈ QuaRot-GPTQ), *and* avoids GPTQ → much faster quantization (50 s vs hours).
- **Reports real, kernel-backed speedup** (2.08× pre-fill, 3.5× decode memory) — unlike its VLA descendants, this is a deployable, measured result, not a fake-quant accuracy harness.
- Block-reuse trick (Remark 2: one block rotation reused for all blocks) keeps the transform cheap.

## What feels limited
- **It is an LLM (text) method** — no embodiment/DiT/closed-loop element; its relevance to the vault is as the *foundation* the VLA methods adapt, not as a VLA result itself.
- The greedy rotation is a **heuristic** (approximates the "ideal" outlier-mitigating rotation); the optimality is empirical + the two within-block theorems, not a global guarantee.
- W4A4 still trails FP16 by a small margin on the hardest models (LLaMA3-8B 8.56 vs 6.14 PPL) — "near-lossless" is generous there.
- The online cost of the rotation/permutation is real (Perm-1 adds ~9% compute) — acceptable given the ~2× speedup, but it is the same online-transform overhead the vault flagged for the VLA descendants (here it's net-positive because there *is* a real INT4 kernel).

## Ada's notes
DuQuant is best filed as **the canonical Route-2 rotation method and the literal root of the VLA-quant cluster**. Three things make it the right "foundation" node:
1. The **massive-outlier-at-down_proj** discovery is upstream of Ω-QVLA's pathology and of why everyone keeps the FFN/attention interfaces special.
2. The **rotation + permutation + smoothing** recipe is exactly what QuantVLA and Ω-QVLA reparameterize over — reading DuQuant makes their "App B DuQuant config (block 64, zigzag, restore)" lines legible.
3. It is the clean illustration of the **conditioning argument** (orthogonal transforms for spreading + diagonal scaling for migration; data-aware greedy rotation as a middle point between SVD and Hadamard).

The most striking cross-cluster contrast: **DuQuant, the LLM root, reports real wall-clock speedup with a real INT4 kernel; its two VLA descendants (QuantVLA, Ω-QVLA) report only memory/accuracy.** The deployability *regressed* moving from text to embodied — precisely because the VLA action head (DiT attention, per-step scales) breaks the clean integer-GEMM path DuQuant relied on.

## Questions worth following up
1. What does **DuQuant++** (announced Apr 2026) change — and does it close the W3/W2 gap or address the down_proj massive outliers more directly?
2. DuQuant's rotation is **greedy/data-aware**; Ω-QVLA's is **SVD·Hadamard**; QuaRot's is **random Hadamard**. Is there a clean ordering of these on the data-aware↔data-independent axis vs accuracy/cost?
3. Does the **zigzag permutation** (DuQuant's distinctive piece) survive into the VLA methods, and how much does it contribute there vs the rotation?
4. Could the **real-INT4-kernel** path DuQuant uses be recovered for the VLA setting (the missing-latency problem) if one keeps the action-head layout integer-GEMM-friendly (QuantVLA's selective layout is the closest attempt)?

## Possible downstream vault work
- Linked as the shared ancestor from [[VLA quantization]] (moved DuQuant from "candidate stub / cited" to an ingested source) and added under Route 2 in [[Model quantization]]. *(done in this ingest)*
- A small **`Rotation-based quantization`** concept page could now anchor SmoothQuant → QuaRot/DuQuant → SVD·Hadamard, holding the data-aware-vs-data-independent and orthogonal-vs-general-invertible (condition-number) intuitions discussed with Ethan.
- **QuaRot** (arXiv:2404.00456) is the obvious sibling to ingest next (random-Hadamard counterpart; DuQuant's main comparison).
