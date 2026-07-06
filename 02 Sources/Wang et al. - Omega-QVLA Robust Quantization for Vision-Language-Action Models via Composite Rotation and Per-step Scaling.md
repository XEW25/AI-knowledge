# Ω-QVLA: Robust Quantization for Vision-Language-Action Models via Composite Rotation and Per-step Scaling

- Raw note: [[2026-06-03 - Wang et al. - Omega-QVLA Robust Quantization for Vision-Language-Action Models via Composite Rotation and Per-step Scaling]]

## Metadata
- Type: source note
- Format: arXiv paper (preprint; cs.CV / cs.LG)
- Authors: Xinyu Wang*, Mingze Li*, Sicheng Lyu*, Dongxiu Liu, Kaicheng Yang, Ziyu Zhao, Yufei Cui, Xiao-Wen Chang, Peng Lu† (*equal; †corresponding)
- Organization: **McGill University** + **Université de Montréal** + **Mila – Quebec AI Institute** (lead), with **BUPT**, **Shanghai Jiao Tong University**, and **SimpleWay.ai**. Corresponding: Peng Lu (UdeM). *(verified from PDF)*
- Date accessed: 2026-06-03
- Original URL: https://arxiv.org/abs/2605.28803
- PDF URL: https://arxiv.org/pdf/2605.28803
- arXiv ID: 2605.28803 (v1, 2026-05-27)
- Open source: **yes** — https://github.com/UCMP13753/Omega-QVLA, Apache-2.0; verified to contain real quantization code (`gr00t/quantization/`, build/merge/eval scripts), weights via Hugging Face. (Contrast: [[Zheng et al. - DyQ-VLA Temporal-Dynamic-Aware Quantization for Embodied Vision-Language-Action Models|DyQ-VLA]] released no code.)
- Verification status: mechanism, baselines, results **hand-verified against the full PDF (v1, 18 pp) on 2026-06-03**
- Related: [[VLA quantization]], [[Model quantization]], [[Zheng et al. - DyQ-VLA Temporal-Dynamic-Aware Quantization for Embodied Vision-Language-Action Models]], [[Xiao et al. - SmoothQuant Accurate and Efficient Post-Training Quantization for Large Language Models]], [[Physical Intelligence - pi0.5 a VLA with Open-World Generalization]], [[NVIDIA - GR00T N1 An Open Foundation Model for Generalist Humanoid Robots]]
- Tags: #quantization #ptq #vla-quantization #embodied-ai #w4a4 #rotation-quantization #diffusion-transformer #dit #per-step-scaling

## Summary
Ω-QVLA is a training-free PTQ framework that is, by its own claim, the **first to compress both the LLM backbone *and* the entire diffusion (DiT) action head of a VLA to uniform W4A4** — no mixed precision. It directly attacks the prevailing belief (encoded in prior VLA-quant work, which leaves the DiT head at FP16 or mixed precision) that the action head is too sensitive to uniformly quantize. The argument for why it is sensitive: the DiT head emits continuous control into a closed loop, so quantization error is amplified by physical dynamics, and DiT activation statistics drift sharply across denoising steps.

Two ingredients make uniform W4A4 work: (1) a **composite SVD·Hadamard rotation** — SVD (left singular vectors of W) flattens weight row-energy; a normalized Hadamard mixes the residual activation outliers across channels — applied block-wise (size 64) with a zigzag weight-norm permutation; and (2) **per-step DiT activation scaling** — a per-step/per-layer/per-channel scale table calibrated over the T=8 denoising steps that absorbs timestep-dependent dynamic-range drift. A deliberate asymmetry: GPTQ on the LLM weights, plain RTN on the DiT weights (rotation already flattens DiT weights, so GPTQ there only adds a harmful calibration bias).

On LIBERO it quantizes **π0.5** to 98.0% (FP16 97.1%) and **GR00T N1.5** to 87.8% (FP16 87.0%) under W4A4, cutting static memory by ~71–72%, and shows smoother real-world bimanual manipulation than the QuantVLA baseline.

## Key claims
1. The DiT action head **can** survive uniform low-bit quantization — the prior "too sensitive" belief is an artifact of not addressing the two root causes: channel-level energy imbalance and denoising-step dynamic-range drift.
2. **Composite SVD·Hadamard rotation** beats either rotation alone: SVD handles weight row-energy (data-free, weight-derived), Hadamard handles residual *activation* outliers (which SVD-from-weights cannot guarantee). +8.5 avg points over SVD-only in ablation.
3. **Per-step (not static) activation scaling** is necessary in W4A4 specifically for the post-AdaLayerNorm attention inputs that carry the timestep-conditioned magnitude; worth +2.0 avg / +7.0 on long-horizon.
4. Uniform W4A4 (incl. DiT attention) matches/exceeds FP16 on two backbones and gives smoother, more reliable real-world control than mixed/selective W4A4 baselines — at ~71–72% static memory reduction.

## Results (verified, Tab. 1–4)
- **LIBERO W4A4 full (avg SR):** GR00T N1.5 **87.8%** (FP16 87.0); π0.5 **98.0%** (FP16 97.1). vs W4A4-full baselines: SmoothQuant 84.0 / 59.3, DuQuant 70.0 / 94.3, QuantVLA 69.8 / 82.0; naive GPTQ/AWQ/OmniQuant collapse on π0.5 (16/11.5/10.3). Biggest gap on π0.5-Long (QuantVLA 56 → Ω-QVLA 96).
- **Memory:** π0.5 4.27→1.20 GB (72.0%); GR00T 1.99 GB→586 MB (71.3%); metadata overhead ~56–90 MB.
- **Real world (progress score):** π0.5 base 49.6 → Ω-QVLA 51.0 vs QuantVLA 25.0.
- **Ablation:** SVD-only+PS 79.25 → +Hadamard 85.75 → +per-step 87.75.

## Why it matters
This is the vault's **second VLA-quantization source** and the natural counterpart to [[Zheng et al. - DyQ-VLA Temporal-Dynamic-Aware Quantization for Embodied Vision-Language-Action Models|DyQ-VLA]]. Together they justify the new concept page [[VLA quantization]], because they take **opposite stances on the central question — does VLA low-bit need mixed precision?**

- DyQ-VLA (autoregressive OpenVLA): *yes* — uniform low-bit is unstable in fragile phases, so allocate bit-width dynamically (W4AX) via a runtime kinematic proxy.
- Ω-QVLA (diffusion π0.5 / GR00T): *no* — with the right rotation + per-step scaling, even the notoriously fragile DiT head survives **uniform** W4A4; no mixed precision.

A clarifying distinction the pair surfaces: both react to *temporal dynamics*, but DyQ-VLA varies the **bit-width** over time while Ω-QVLA varies only the **quantization scale** (per denoising step) at a fixed bit-width. So in the vault's `Model quantization` taxonomy, Ω-QVLA is **Route 2 (distribution reshaping)** — the rotation lineage (QuaRot/DuQuant) extending SmoothQuant — *not* Route 3 (dynamic precision).

It is also a strong **cross-cluster bridge**: it quantizes [[Physical Intelligence - pi0.5 a VLA with Open-World Generalization|π0.5]] and [[NVIDIA - GR00T N1 An Open Foundation Model for Generalist Humanoid Robots|GR00T N1.5]] — both with their own vault notes — and reports their W4A4-vs-FP16 numbers directly. And it *answers* the open question I logged in the DyQ-VLA note ("does the temporal pattern survive on diffusion action heads?"): yes, the diffusion analog is denoising-step drift, handled by per-step scale rather than dynamic bit-width.

## What feels strong
- **Overturns a stated assumption with evidence**, not just a new recipe — the "DiT too sensitive" belief is named, then falsified on two backbones, including the DiT attention layers prior work explicitly protected.
- The **rotation decomposition is principled**: SVD = weight-side energy (`‖w̃_i‖²=σ_i²`), Hadamard = activation-side mixing (`‖zH‖∞ ≤ ‖z‖₂/√n`); the ablation + nMSE microscopy (2–5× per-layer error reduction) back the design rather than asserting it.
- The **solver asymmetry (GPTQ-LLM / RTN-DiT)** is unusually honest — derived from a per-layer error analysis (App. A.4) showing GPTQ *hurts* the DiT side. Most papers would apply their best solver everywhere.
- **Real code (Apache-2.0)** with build/eval scripts for both backbones — reproducible, and a contrast to DyQ-VLA's no-release.
- Cross-model generality: a single uniform recipe handles GR00T's sharply-peaked outliers *and* π0.5's diffuse outliers, where SmoothQuant vs DuQuant flip orderings between the two.

## What feels limited
- **No latency / throughput numbers.** The whole motivation is on-device efficiency, yet the paper reports only static memory + task success and explicitly defers wall-clock to "kernel-level support … beyond scope." W4A4's real speed benefit is therefore unproven here. (Sharp contrast with DyQ-VLA, which centers latency.) The released code confirms the root cause: it is fake-quant (BF16/FP32 matmul) and applies the SVD·Hadamard rotation **online every forward** (input + output), with no real INT4 kernel — so the rotation is pure overhead, and amortizing it is structurally hard because SVD is not a fast transform. Compounding it, the DiT's per-step × per-channel activation scale sits on the contraction axis and does not factor out of the matmul (unlike SmoothQuant's *static* per-channel scale, this one is per-step so can't be folded into the weight once). See *Method deep-dive (1), (6)–(7)*.
- **No Hadamard-only (SVD-removed) ablation.** Table 4 isolates remove-Hadamard (SVD-only 79.25) and remove-per-step, proving Hadamard's marginal value — but never isolates SVD, so SVD's *end-to-end* necessity is unproven, especially as QuaRot/SpinQuant reach strong W4A4 with Hadamard/learned rotation alone. SVD's only support is distribution/nMSE proxies (Fig. 2 / App. A.5). See *Method deep-dive (4)*.
- **Two backbones, one benchmark family.** π0.5 + GR00T N1.5, both DiT-based, on LIBERO + one ARX R5 setup. Autoregressive and flow-matching action heads explicitly untested — so the "first to uniformly quantize the action head" claim is scoped to *diffusion* heads.
- **Real-world is thin**: 10 rollouts/task, progress-score (not success), and the headline number (51.0 vs base 49.6) is within plausible noise; the qualitative "smoother" claim is the more credible signal.
- ViT left at FP16 — full-stack W4A4 is really backbone+DiT, not literally everything.
- Per-step scale tables + rotation matrices add metadata (56–90 MB) and an offline calibration dependency (n=10, T=8); robustness to calibration shift is untested.

## Ada's notes
The most useful framing for the vault: Ω-QVLA and DyQ-VLA are **not competitors but a dichotomy on the mixed-precision question, split by action-head architecture**. Autoregressive action tokens (DyQ-VLA/OpenVLA) tempt a *dynamic-bit* solution; diffusion action heads (Ω-QVLA/π0.5,GR00T) tempt a *static-uniform + per-step-scale* solution. That the same "temporal dynamics" motivation yields opposite mechanisms is the interesting tension, and it is exactly what [[VLA quantization]] should hold.

Methodologically, Ω-QVLA is squarely in the **rotation school** (QuaRot → DuQuant → this), which is itself the modern descendant of SmoothQuant's "reshape the distribution so uniform low-bit works." So in the `Model quantization` topic it deepens Route 2 rather than opening a new route — a good reminder that "VLA quantization" is an application domain, not a fourth method axis.

One genuinely novel, transferable nugget: the **AdaLayerNorm → per-step-scale** link. The layers that *need* per-step scaling are precisely those reading a time-conditioned `AdaLayerNorm` output (attention QKV); the plain-LayerNorm MLP path doesn't. That is a clean architectural explanation for *where* diffusion quantization difficulty lives, likely reusable for any DiT quantization (not just VLA).

## Method deep-dive (code + math, 2026-06-03)
A code + math deep-dive (discussion with Ethan), reading the released repo (`github.com/UCMP13753/Omega-QVLA`) alongside the algebra. Seven findings — (1)–(5) on the composite rotation, (6)–(7) on the DiT per-step activation quant. Code line refs are from the cloned commit.

### (1) The activation rotation is ONLINE — and in the released code it is pure overhead
- Both quantized layers apply the input rotation **every forward**, not folded offline: LLM path `DuQuantLinear.forward` (input permutation `index_select` + block-wise `einsum` rotation, `duquant_layers.py:591–600`) and DiT path `GptqLinear.forward` (permutation + block `bmm`, `gptq_layers.py:590–604`). There is **also** an online OUTPUT rotation ("row restore", `duquant_layers.py:635–648` / `gptq_layers.py:689–703`). Only the **weight-side** rotation is folded offline (cached `_W_t`).
- The DiT additionally selects a **per-denoising-step** activation scale online via a contextvar (`dit_step_context.py`) → rotation + dispatch run on each of T=8 steps × ~16 DiT blocks.
- Crucially the released code is **fake quantization**: the matmul runs in BF16/FP32 `F.linear`, *not* a real INT4 GEMM (`gptq_layers.py:662–678`; comment explicitly contrasts "Real INT4 GEMM (cutlass)"). So the rotation adds compute with **no compensating speedup** here — it is an accuracy-measurement harness.
- The codebase visibly fights this runtime cost (prebuilt stacked rotation buffers to avoid per-forward `torch.stack`, `:281–299`; env flags resolved once at init, `:360–368`) — evidence it is a measurable overhead.
- This is the **code-level root cause** of the paper reporting no wall-clock latency. Because SVD is data-dependent (a dense block rotation, not a structured fast transform), its online cost is inherently harder to amortize than QuaRot/SpinQuant's fast-Hadamard-only online step → the latency story is both unproven *and* structurally harder than DyQ-VLA's.

### (2) Why the rotated weight's row energy depends only on U and σ (Gram-matrix view)
- Row energy = diagonal of the Gram matrix `WWᵀ`. And `WWᵀ = (UΣVᵀ)(UΣVᵀ)ᵀ = UΣ²Uᵀ` — **V cancels** via `VᵀV=I`. So `WWᵀ = UΣ²Uᵀ` is literally the eigendecomposition of `WWᵀ`: eigenvalues `σ_k²`, eigenvectors = columns of U.
- Diagonal: `‖w_i‖² = (WWᵀ)_{ii} = Σ_k σ_k² u_ik²` — only U and σ². (So "eigenvalue" is exactly right: the `σ_k²` ARE the eigenvalues of `WWᵀ`.)
- Geometric reason V drops out: `W = (UΣ)Vᵀ`; right-multiplying by orthogonal `Vᵀ` is an **isometry** — it rotates each row's *direction*, not its *length*. Row energy is therefore independent of V (Parseval).
- After rotation `W̃ = UᵀW`: `W̃W̃ᵀ = Σ²` (diagonal) → rows become orthogonal, `‖w̃_i‖² = σ_i²` (each row = one singular value, "de-mixed"). **Caveat:** this removes *coordinate-induced* concentration but does NOT make energy uniform — the spectrum `σ_i²` is itself skewed; the residual is handled by block + zigzag permutation + Hadamard.

### (3) What per-channel quant actually optimizes: crest factor, not energy
- Symmetric per-channel quant: scale `Δ = max/qmax`; `SQNR ∝ (rms/max)² = 1/crest²`. The quantity that matters is the **crest factor `max/rms`**, NOT the energy.
- Energy is not the objective — it is the **reference**: `rms = √(energy/n)` is the level the max should be pulled down to. Energy-balancing (SVD) sets clean rms references but does **not** itself control the max.
- The operator that converts a balanced L2 energy into a low L∞ (max) is the **Hadamard**, via `‖zH‖∞ ≤ ‖z‖₂/√n`. So the two stages are: **SVD balances energy/rms (necessary, not sufficient); Hadamard pulls max→rms (the thing quant keys on).** The paper *needing* Hadamard (ablation SVD-only 79.25 → +Hadamard 85.75) is the implicit admission that energy-balancing alone is insufficient.
- For weights (≈zero-mean, heavy-tailed) the enemy is outliers (`max≫rms`), not a DC offset; the "values clustered far from 0 → wasted INT range" pathology is mainly an *activation*/asymmetric concern (handled by zero-point), not a weight one.

### (4) SVD vs Hadamard: incoherence (not orthogonality) is what spreads the max
- Both U and H are orthogonal; **orthogonality alone does not spread the max** — the decisive property is **incoherence**. Spike test: rotating a 1-sparse outlier `e_i` by R gives *row i of R*, whose peak `= max_j|R_ij|`. Hadamard: every entry `±1/√n` → peak `= 1/√n` for any i, any data (block 64 → `√64 ≈ 8×` attenuation, per App. A.5). SVD's U: `max_j|U_ij|` can `≈ 1` → **no spreading guarantee**, and on data it is not fit to (activations) it barely helps (Fig. 2: `X·R_SVD` 20×→17×).
- Framing: **Hadamard ≈ a deterministic stand-in for a random rotation** (data-independent universal spreader). **U is the *least* random orthogonal matrix** — maximally aligned to W's structure, hence energy-*concentrating* by design (PCA), the opposite of spreading.
- Division of labor (Fig. 2): SVD (data-adapted) wins on **weights** (row-norm 26×→6× vs Hadamard-only 19×); Hadamard (universal) wins on **activations** (20×→1.6× vs SVD-from-W 17×). Complementary, opposite strengths — not redundant.
- **Ablation gap:** Table 4 ablates remove-Hadamard (SVD-only, 79.25) and remove-per-step, but has **no Hadamard-only (remove-SVD) end-to-end row**. So Hadamard's necessity is proven (+8.5); **SVD's end-to-end necessity is NOT** — especially as QuaRot/SpinQuant reach strong W4A4 with Hadamard/learned rotation alone (no SVD). SVD's only evidence is Fig. 2 / App. A.5 distribution & nMSE (proxies), not task success — and SVD carries real cost (data-dependent, per-block SVD, heavier online rotation per (1)). "SVD is beneficial" is shown; "SVD is necessary / worth it" is not.

### (5) The Figure 2 "transpose trap" — what "row norm" actually is
- **Ironclad:** the rotation is on the **input axis** (built as `[in,in]` block-diagonal; applied `X·R` / `W·R`). An orthogonal input-axis rotation **preserves every output channel's L2 norm** (it rotates the in-vector *within* each output channel). So Fig. 2's weight "row norm" changing 26×→6× **cannot** be the per-output-channel L2 norm — that is invariant.
- **What it actually is:** the per-**input**-channel norm. Code-verified — in this repo "weight energy" is `np.mean(W**2, axis=0)` over the *output* dim (`plot_outlier_flow_3d.py:73`), i.e. one value per *input* channel; and the text's `‖w̃_i‖²=σ_i²` is the i-th *input* channel (`W∈[Cin,Cout]`, row = input channel). Same quantity.
- **The trap:** the TEXT uses `W∈[Cin,Cout]` (row = input channel) while the CODE/figures use PyTorch `[out,in]` (row = output channel) — "row" flips meaning. The axis read as "output channel" is the transposed label; the plotted, rotation-varying quantity is the input-channel norm. So "row energy controllable (→`σ_i²`)" and "Fig. 2 26×→6×" are the **same quantity** — an identity, not a derivation step. (This is why the apparent contradiction "output-channel L2 norm shouldn't change under an input rotation" felt unresolved: the figure simply isn't plotting that.)
- **Why it then helps per-output-channel quant** (the real quant unit: scale = max over in, `_quantize_per_out_channel`): a heavy input channel is a **"vertical stripe"** (a column large across all output rows) that inflates *every* output channel's max. Balancing input-channel energy (SVD de-mix) + Hadamard (spread) lowers each output channel's **max** toward its (invariant) rms — crest factor down. The output-channel L2 norm never moves; only its peak does.

### (6) DiT activation quant is per-step × per-channel (offline table), not per-token
- **Granularity map** (paper §4.2, Eq. 9–11): weights = per-output-channel (offline); **LLM activations = per-token (online/dynamic)**; **DiT activations = per-step × per-channel, offline-calibrated** — `∆_{ℓ,t,j} = σ̂(X'_{t,:,j})/qmax` (ℓ=layer, t=denoising step, j=channel), retrieved by step index at inference via a contextvar (`dit_step_context.py`).
- **"Per-step × per-channel" mirrors AdaLayerNorm's two axes of variation.** In DiT the pre-attention norm is **adaLN**: the per-channel affine `γ(τ), β(τ)` is *predicted from the timestep embedding* (vs fixed `γ, β` in plain LN). So `γ(τ)` varies **per-channel** (it's a vector) AND **per-step** (a function of τ) → the QKV-input activation carries a per-channel magnitude profile that drifts across the T=8 steps. App. A.6: post-adaLN QKV q999 drifts ~15–20% (monotonic, noise→converged); the pre-MLP norm is a **plain** LayerNorm that strips the time-conditioned magnitude, so the MLP path is flat (≤2%) → **the drift localizes to the attention QKV layers**, exactly where per-step scaling helps.
- **The per-step premise holds because the input genuinely differs each step.** Across the denoising loop the observation/VLM conditioning is computed **once** (shared; prefix-KV / cross-attn context), but the **noisy action iterate `x_τ`** and the **timestep `τ`** (→ `γ(τ)`) change every step → the activations through the repeatedly-run DiT linears differ per step (content change + adaLN modulation). Mirrors the LLM/DiT split: the VLM backbone is a one-shot **prefill** (→ per-token), the DiT runs **T times in a loop** (→ per-step). Calibration is viable because the step-dependence is dominated by the *deterministic* adaLN modulation (stable across rollouts), with the iterate's average magnitude trend averaged over n=10 trajectories.
- **Why per-step × per-channel (static) beats per-token (dynamic) — two orthogonal axes:**
  - *Axis A (channel vs token).* Writing magnitude ≈ `γ_j(τ)·content`: a per-channel scale **divides out the known `γ_j(τ)` structure**, giving every channel its own right-sized scale; a per-token scale = `max_j(γ_j(τ)·content_j)` is **dominated by the biggest channel**, so small-`γ` channels waste INT range. Per-token *can* track the per-step *overall* level (it reacts to the γ(τ)-scaled values) but **not the per-channel profile** — and the per-channel profile is the valuable part.
  - *Axis B (calibrated-static vs dynamic).* A robust-peak calibrated scale **clips rare spikes** (a runtime raw-max chases them, coarsening everything), is **deterministic** (no per-rollout variance — matters for closed-loop control; the code refuses to fall back to a runtime estimate for DiT layers), and is **stable on short action sequences** (per-token over a handful of action tokens is a noisy estimate; calibration pools over trajectories × tokens).
  - *Flip side:* per-token **factors out of the matmul** (kernel-friendly) and needs no calibration. So per-step×per-channel is an **accuracy/robustness-over-deployability** choice — consistent with the fake-quant, no-latency posture.

### (7) The real cost of per-step × per-channel is broken INT-GEMM factorization — not the lookup or the multiply
- **The lookup is ~free:** `scale = table[step]` is an O(1) index of a (GPU) buffer by a Python-int step — cheaper than per-token's runtime channel-reduction. The "CPU" part is just reading an int (no host↔device data transfer).
- **The per-channel multiply is *not* extra vs per-token:** any activation quant applies a scale element-wise; per-token (`[T,1]` broadcast) and per-channel (`[1,C]` broadcast) cost the *same* element-wise op over the `[T×C]` tensor — only the broadcast axis differs.
- **The genuine penalty: a per-channel *activation* scale sits on the contraction (input-channel) axis → it does NOT factor out of the matmul.** Per-token activation + per-output-channel weight → `Y = s_a[t]·s_w[o]·Σ_c q_a q_w`: scales pull *outside* the sum → clean INT-GEMM + one cheap rescale epilogue. Per-channel `s_a[c]` → `Y = s_w[o]·Σ_c s_a[c] q_a[t,c] q_w[c,o]`: `s_a[c]` is *inside* the sum → either (a) dequantize activations to ~FP before the GEMM (lose the INT speedup) or (b) fold `s_a[c]` into the weight — but it's **per-step**, so folding needs 8 weight copies (kills the memory win).
- **SmoothQuant contrast (why per-step is worse to deploy):** SmoothQuant also uses a per-channel activation scale, but a **static** one → it folds into the weight **offline, once** → zero runtime cost. Ω-QVLA's scale is **per-denoising-step** → can't fold once, can't afford 8× → no cheap deployment path. This is precisely why per-step×per-channel is *more* deployment-hostile than the SmoothQuant lineage it extends.
- **In the released code it is moot:** the matmul is fake-quant (BF16/FP32 `F.linear`, no INT GEMM), so the per-channel scale buys no speedup *and* exposes no real-kernel cost — pure simulation overhead. Another facet of "accuracy measured, latency deferred."

## Questions worth following up
1. Does uniform W4A4 hold on **non-DiT** action heads — autoregressive (OpenVLA, the DyQ-VLA setting) and flow-matching (π0 joint-MoE)? The paper's claim is diffusion-scoped.
2. Without latency numbers, **is uniform W4A4 actually faster than DyQ-VLA's dynamic W4AX** in practice, or only smaller in memory? The two papers can't currently be compared on speed.
3. How do the cited VLA-quant methods rank head-to-head: Ω-QVLA vs **QuantVLA** (arXiv:2602.20309) vs **QVLA** (ICLR 2026) vs DyQ-VLA — across accuracy, memory, latency, and code availability?
4. Could DyQ-VLA's kinematic runtime gating be *composed* with Ω-QVLA's uniform-W4A4 base (dynamic BF16 fallback only at the very hardest steps, on top of an already-uniform W4A4)? They may be complementary, not exclusive.
5. Is the AdaLayerNorm→per-step-scale insight a general DiT-quantization principle (image/video DiTs, cf. ViDiT-Q/SVDQuant)?

## Possible downstream vault work
- Created [[VLA quantization]] concept page (this ingest) to hold the landscape + the DyQ-VLA↔Ω-QVLA contrast.
- Updated [[Model quantization]] — Ω-QVLA added under Route 2 (distribution reshaping / rotation), with a pointer to the VLA-quantization sub-cluster.
- Candidate future sources to round out the cluster: **QuantVLA** (arXiv:2602.20309), **QVLA** (arXiv:2602.03782), **SQAP-VLA** (arXiv:2509.09090), and the kinematic-proxy sibling **KERV** (arXiv:2603.01581).
- Optional light backlinks from [[Physical Intelligence - pi0.5 a VLA with Open-World Generalization|π0.5]] and [[NVIDIA - GR00T N1 An Open Foundation Model for Generalist Humanoid Robots|GR00T]] notes ("a W4A4 quantization of this model exists") — deferred to avoid churn; outbound links here already create backlinks.
