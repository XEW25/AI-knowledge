# DyQ-VLA: Temporal-Dynamic-Aware Quantization for Embodied Vision-Language-Action Models

- Canonical URL: https://arxiv.org/abs/2603.07904
- PDF URL: https://arxiv.org/pdf/2603.07904
- HTML URL: https://arxiv.org/html/2603.07904
- Source type: arXiv (URL-only, Tier 1)
- Accessed at: 2026-06-03 Asia/Shanghai
- arXiv ID: 2603.07904 (submitted 2026-03-09; v2 2026-03-14)
- Authors: Zihao Zheng*, Hangyu Cao*, Sicheng Tian, Jiayu Chen, Maoliang Li, Xinhao Sun, Hailong Zou, Zhaobo Zhang, Xuanzhe Liu, Donggang Cao, Hong Mei, Xiang Chen† (*equal contribution; †corresponding)
- Affiliation (verified from PDF): Peking University — School of Computer Science (most authors) + School of EECS (Xinhao Sun); South China University of Technology — School of Software Engineering (Hangyu Cao); Beijing Normal University — School of AI (Sicheng Tian). Corresponding: Xiang Chen <xiang.chen@pku.edu.cn>
- Subjects: cs.LG, cs.RO
- Open source: none located (no release claim in paper; no repo found via web search, 2026-06-03)
- Tier: 1
- Raw-artifact decision: PDF measured at **4.94 MB** > vault's "a few MB" threshold and trivially re-accessible on arXiv → **URL-only, not committed** (consistent with raw-tier rule and the G0.5 / GigaWorld / RL Tokens precedent)

## Raw capture

> Verification: the method, baselines, and results below were **hand-verified by reading the full PDF (v2, 9 pages) on 2026-06-03**, after extracting text with `pypdf` (Read-tool poppler unavailable on this machine, as in prior ingests). High confidence.

### Abstract (verbatim, complete)
Vision-Language-Action (VLA) models are dominant in embodied intelligence but are constrained by inference overheads. While model quantization alleviates these bottlenecks for edge deployment, static quantization approaches remain suboptimal for VLAs due to two critical challenges: (1) Temporal-dynamic sensitivity, where fixed precision wastes resources by ignoring stage-varying error tolerances; and (2) Real-time allocation, where identifying real-time sensitivity to guide bit allocation remains unsolved. To address these challenges, we propose DyQ-VLA, a dynamic quantization framework for VLAs. Specifically, a sensitivity-aware switching strategy leverages real-time kinematic proxies to trigger the bit-width switch, while a kinematic-guided module dynamically allocates the optimal bit-width. Experiments show that DyQ-VLA requires only 30.9% of the original memory footprint while maintaining 99.5% of its original performance, achieving 1.49× simulation and up to 1.43× real-world speedups.

### Headline results (verified)
- 30.9% of original memory footprint (4.7 GB vs 15.2 GB BF16; −10.5 GB)
- 99.5% of original performance retained (avg SR 76.1% on LIBERO)
- 1.49× simulation (1.47–1.51× per suite); up to 1.43× real-world end-to-end latency

### Two motivating observations (Sec. III)
1. **Temporal-dynamic sensitivity.** Step-wise perturbation analysis on OpenVLA + LIBERO: inject a single W4A4 action at step `t`, then resume full-precision control. Local action error `e_t = ‖p_int4 − p_bf16‖₂` decouples from final success — coarse free-space transit tolerates large `e_t`, fine manipulation (grasp/insertion) spikes. Ground-truth sensitivity `s_t = D_T / e_t` (terminal spatial deviation / local error) is only knowable post-hoc → needs an online proxy.
2. **Real-time allocation.** No prior cheap proxy for instantaneous sensitivity to drive bit allocation without prohibitive runtime overhead.

### Method (Sec. IV–V, verified)
- **Base model:** OpenVLA (~7B, ref [3]); chosen because its LLM backbone decodes actions token-by-token with no independent modules ("homogeneous architecture avoids downstream interference"). Quantization type = **PTQ**.
- **W4AX paradigm:** weights frozen at INT4 (no weight swapping — avoids autoregressive-decode bandwidth bottleneck); activations dynamically alternate full-precision fallback (BF16) and quantized X ∈ {2,4,8}. Target precision `b̂_t ∈ {2,4,8,16}`, 16 = BF16.
- **Kinematic-driven sensitivity fusion:**
  - Motion Fineness `M_t = 1 − ‖a_xyz_t‖₂ / μ_max`, μ_max = 95th-pct of historical magnitudes; averaged over a broad macro-window `W_macro` → `M̃_t`. Tracks macro-trend; r=0.90 vs `s_t`.
  - Angular Jerk `J_t = ‖a_rot_t − a_rot_{t-1}‖₂ / ν_max`, ν_max = 95th-pct of historical jerks; averaged over a tight micro-window `W_micro` (< W_macro) → `J̃_t`. Captures spikes; r=0.87.
  - Unified sensitivity `S_t = max(0, λ M̃_t + (1−λ) J̃_t)` (convex combination; metrics pre-normalized → cross-task scale consistency).
- **Hysteresis-based switching (Eq. 4):** if `S_t > θ_fp` → enforce BF16 (`b̂_t = 16`); else invoke bit-allocation → `b̂_t ∈ {2,4,8}`. Asymmetric: precision *upgrades* apply immediately (instant BF16 recovery when a hard action begins); *downgrades* pass through a delay window `K` (low-pass filter; hold previous higher precision until a stable downgrade is confirmed). A saturating counter (Alg. 1) approximates the window.
- **Kinematic-guided bit allocation (Sec. IV-B):**
  1. Error bounding: max single-step error `ε_a(S_t) = D_acc / (S_t + η)`; pick minimal `b̂ ∈ {2,4,8}` s.t. `E[‖â^(b)_t − a*_t‖²] ≤ ε_a(S_t)` (Eq. 5).
  2. Offline threshold calibration: derive Φ: S_t ↦ {2,4,8} on successful trajectories; boundaries Θ = {θ_2|4, θ_4|8} where lower-bit error crosses the bound.
  3. Online dispatch: piecewise LUT Φ(S_t) = 2 on [0,θ_2|4], 4 on (θ_2|4,θ_4|8], 8 on (θ_4|8,θ_fp] (Eq. 6); constant-time, supports non-sequential jumps (e.g. BF16 → 2-bit).
- **Mixed-precision backend (Sec. V):** INT4-pinned weights in GMEM across all precisions; fused MMA kernel (scaling + quant + GMEM packing); B=8 → on-the-fly INT4→INT8 register decompression (W8A8 pipeline); B=2 → GMEM activation pack/unpack into INT4 for W4A4 compute; pre-compiled CUTLASS kernels.
- **Async CPU-GPU pipeline:** CPU computes `M̃_t, J̃_t` + dispatch concurrently with GPU visual prefill; bit-width written to zero-copy mapped memory; decided per step / action-chunk (not per token) to avoid kernel-launch delays. Overhead (Tab. IV): kinematic eval <0.5 ms, dispatcher 0 ms (async), history buffer <64 KB, total <0.1 MB.

### Evaluation (Sec. VI, verified)
- **Simulation:** LIBERO, 4 suites (Goal, Object, Spatial, Long), 40 tasks × 200 trials. Hardware: NVIDIA A100 + Intel Xeon Silver 4410T.
- **Real-world:** tabletop 6-DoF arm + 1-DoF parallel gripper + primary-view RGB; 3 levels (atomic grasping / spatial displacement / composite sequential); 400 human demos/category at 10 Hz; **QLoRA fine-tune** (rank 32, dropout 0.05, into attention projections, 4-bit base frozen); client-server inference.
- **Baselines:** SmoothQuant [22] (static W4A4); **QVLA [23]** (arXiv:2602.03782, per-channel static W4A4, SOTA VLA-quant); BF16 = upper bound. (Related VLA-quant cited: SQAP-VLA [24] arXiv:2509.09090; plus GPTQ/AWQ/APTQ for LLMs.)
- **Sim results (SR / Speedup / Mem GB):** Goal — FP 79.2/1.00×/15.2, SmoothQuant 69.6/1.54×/4.7, QVLA 78.8/1.49×/4.3, DyQ-VLA 78.5/1.48×/4.7. Object — FP 88.4/–/15.2, SQ 73.2/1.49×/4.7, QVLA 87.6/1.44×/4.3, DyQ 87.8/1.47×/4.7. Spatial — FP 84.7/–/15.2, SQ 69.2/1.59×/4.7, QVLA 84.4/1.53×/4.3, DyQ 84.7/1.51×/4.7. Long — FP 53.7/–/15.2, SQ 40.9/1.47×/4.7, QVLA 53.0/1.42×/4.3, DyQ 53.4/1.49×/4.7. (DyQ avg SR 76.1% = 99.5% of FP; +0.1% over QVLA at ~0.4 GB more memory.)
- **Real-world (FP → DyQ-VLA SR, speedup):** atomic 86.7→86.7, 1.43×; spatial 76.7→73.3, 1.32×; composite 70.0→66.7, 1.38×.
- **Ablation (LIBERO-Spatial, SR / Lat ms / Mem):** static W4A4 69.2/84.9/4.7 → +kinematic dispatch 85.0/101.7/4.8 → +mixed-precision 84.8/93.5/4.7 → +async engine 84.7/89.4/4.7 (final 1.51×).
- **Hyperparameters:** W_macro=10, W_micro=5, θ_fp=0.5 (optimal inflection; higher θ_fp → up to 1.59× but −15.4% SR on complex tasks).

### Stated limitations (Sec. VI-D + observed)
- Hand-tuned task-specific knobs (θ_fp, window sizes); no OOD / embodiment-shift study.
- Demonstrated on OpenVLA only; relies on its token-by-token homogeneity.
- Win over QVLA is marginal (≈0.1% SR, slightly more memory) — the dynamic paradigm and speed are the real contribution, not Pareto-dominating QVLA.
