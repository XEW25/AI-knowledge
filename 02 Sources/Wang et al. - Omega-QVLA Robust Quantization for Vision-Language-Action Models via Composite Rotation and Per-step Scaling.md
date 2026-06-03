# Ω-QVLA: Robust Quantization for Vision-Language-Action Models via Composite Rotation and Per-step Scaling

- Raw note: [[2026-06-03 - Wang et al. - Omega-QVLA Robust Quantization for Vision-Language-Action Models via Composite Rotation and Per-step Scaling]]

## Metadata
- Type: source note
- Format: arXiv paper (preprint; cs.CV / cs.LG)
- Authors: [[Xinyu Wang]]*, Mingze Li*, Sicheng Lyu*, Dongxiu Liu, Kaicheng Yang, Ziyu Zhao, Yufei Cui, Xiao-Wen Chang, Peng Lu† (*equal; †corresponding)
- Organization: **McGill University** + **Université de Montréal** + **Mila – Quebec AI Institute** (lead), with **BUPT**, **Shanghai Jiao Tong University**, and **SimpleWay.ai**. Corresponding: Peng Lu (UdeM). *(verified from PDF)*
- Date accessed: 2026-06-03
- Original URL: https://arxiv.org/abs/2605.28803
- PDF URL: https://arxiv.org/pdf/2605.28803
- arXiv ID: 2605.28803 (v1, 2026-05-27)
- Open source: **yes** — https://github.com/UCMP13753/Omega-QVLA, Apache-2.0; verified to contain real quantization code (`gr00t/quantization/`, build/merge/eval scripts), weights via Hugging Face. (Contrast: [[DyQ-VLA: Temporal-Dynamic-Aware Quantization for Embodied Vision-Language-Action Models|DyQ-VLA]] released no code.)
- Verification status: mechanism, baselines, results **hand-verified against the full PDF (v1, 18 pp) on 2026-06-03**
- Related: [[VLA quantization]], [[Model quantization]], [[DyQ-VLA: Temporal-Dynamic-Aware Quantization for Embodied Vision-Language-Action Models]], [[SmoothQuant: Accurate and Efficient Post-Training Quantization for Large Language Models]], [[Physical Intelligence - pi0.5 a VLA with Open-World Generalization]], [[NVIDIA - GR00T N1 An Open Foundation Model for Generalist Humanoid Robots]]
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
This is the vault's **second VLA-quantization source** and the natural counterpart to [[DyQ-VLA: Temporal-Dynamic-Aware Quantization for Embodied Vision-Language-Action Models|DyQ-VLA]]. Together they justify the new concept page [[VLA quantization]], because they take **opposite stances on the central question — does VLA low-bit need mixed precision?**

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
- **No latency / throughput numbers.** The whole motivation is on-device efficiency, yet the paper reports only static memory + task success and explicitly defers wall-clock to "kernel-level support … beyond scope." W4A4's real speed benefit is therefore unproven here. (Sharp contrast with DyQ-VLA, which centers latency.)
- **Two backbones, one benchmark family.** π0.5 + GR00T N1.5, both DiT-based, on LIBERO + one ARX R5 setup. Autoregressive and flow-matching action heads explicitly untested — so the "first to uniformly quantize the action head" claim is scoped to *diffusion* heads.
- **Real-world is thin**: 10 rollouts/task, progress-score (not success), and the headline number (51.0 vs base 49.6) is within plausible noise; the qualitative "smoother" claim is the more credible signal.
- ViT left at FP16 — full-stack W4A4 is really backbone+DiT, not literally everything.
- Per-step scale tables + rotation matrices add metadata (56–90 MB) and an offline calibration dependency (n=10, T=8); robustness to calibration shift is untested.

## Ada's notes
The most useful framing for the vault: Ω-QVLA and DyQ-VLA are **not competitors but a dichotomy on the mixed-precision question, split by action-head architecture**. Autoregressive action tokens (DyQ-VLA/OpenVLA) tempt a *dynamic-bit* solution; diffusion action heads (Ω-QVLA/π0.5,GR00T) tempt a *static-uniform + per-step-scale* solution. That the same "temporal dynamics" motivation yields opposite mechanisms is the interesting tension, and it is exactly what [[VLA quantization]] should hold.

Methodologically, Ω-QVLA is squarely in the **rotation school** (QuaRot → DuQuant → this), which is itself the modern descendant of SmoothQuant's "reshape the distribution so uniform low-bit works." So in the `Model quantization` topic it deepens Route 2 rather than opening a new route — a good reminder that "VLA quantization" is an application domain, not a fourth method axis.

One genuinely novel, transferable nugget: the **AdaLayerNorm → per-step-scale** link. The layers that *need* per-step scaling are precisely those reading a time-conditioned `AdaLayerNorm` output (attention QKV); the plain-LayerNorm MLP path doesn't. That is a clean architectural explanation for *where* diffusion quantization difficulty lives, likely reusable for any DiT quantization (not just VLA).

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
