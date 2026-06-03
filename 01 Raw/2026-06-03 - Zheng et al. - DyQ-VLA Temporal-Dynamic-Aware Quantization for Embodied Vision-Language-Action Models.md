# DyQ-VLA: Temporal-Dynamic-Aware Quantization for Embodied Vision-Language-Action Models

- Canonical URL: https://arxiv.org/abs/2603.07904
- PDF URL: https://arxiv.org/pdf/2603.07904
- HTML URL: https://arxiv.org/html/2603.07904
- Source type: arXiv (URL-only)
- Accessed at: 2026-06-03 Asia/Shanghai
- arXiv ID: 2603.07904 (submitted 2026-03-09; v2 2026-03-14)
- Authors: Zihao Zheng, Hangyu Cao, Sicheng Tian, Jiayu Chen, Maoliang Li, Xinhao Sun, Hailong Zou, Zhaobo Zhang, Xuanzhe Liu, Donggang Cao, Hong Mei, Xiang Chen
- Affiliation: not stated on the arXiv abstract page (several author names — Xuanzhe Liu, Donggang Cao, Hong Mei — suggest Peking University involvement, but this is **unverified**)
- Subjects: cs.LG, cs.RO
- Tier: 1

## Raw capture

> Note: this is a post-knowledge-cutoff paper (March 2026). Content below was gathered from the arXiv abstract page and the arXiv HTML full text via an automated reader. The abstract and headline numbers are triangulated across the abstract page, the search overview, and the HTML and are high-confidence; the **mechanism details and exact ablation numbers were extracted by an intermediary model and have NOT been hand-verified against the PDF**.

### Abstract (verbatim, partial — only the opening was captured)
Vision-Language-Action (VLA) models are dominant in embodied intelligence but are constrained by inference overheads. While model quantization alleviates these bottlenecks for edge deployment, static quantization approaches remain suboptimal for VLAs due to two critical challenges: (1) Temporal-dynamic sensitivity, where fixed precision wastes resources by ignoring stage-varying error tolerances; and (2) Real-time allocation, where identifying real-time sensitivity to guide bit allocation remains unsolved. To address these challenges, we propose DyQ-VLA, a dynamic quantization framework for VLAs.

### Headline results (from abstract — high confidence)
- 30.9% of original memory footprint (≈10.5 GB reduction reported)
- 99.5% of original performance retained
- 1.49× simulation speedup; up to 1.43× real-world (end-to-end latency) speedup

### Two motivating observations
1. **Temporal-dynamic sensitivity.** Identical quantization noise affects task outcomes differently depending on the execution stage. Step-wise perturbation analysis on LIBERO reportedly shows: coarse-grained free-space transit is highly error-tolerant, while fine-grained manipulation (grasping, insertion) spikes in sensitivity because errors compound through recursive state deviations. A static quantizer must hold peak precision throughout → wasted resources during robust phases.
2. **Real-time allocation.** There was no established way to read out this per-step sensitivity *online* (cheaply, from signals already available at inference) to drive bit allocation.

### Method (extracted from HTML — pending hand-verification)
- **Base model quantized:** OpenVLA (~7B), chosen as a homogeneous architecture to avoid downstream interference.
- **Quantization type:** post-training quantization (PTQ).
- **Precision paradigm "W4AX":** weights statically INT4 throughout; activations dynamically switched among BF16 (full-precision fallback) / INT8 / INT4 / INT2.
- **Real-time kinematic proxy** (two complementary metrics from robot-arm state during inference):
  - *Motion Fineness* (ℳₜ): inversely scales translational magnitude; macroscopic trend over a broad temporal window.
  - *Angular Jerk* (𝒥ₜ): rotational fluctuation; microscopic spikes over a tight window.
  - Fused into a unified sensitivity score 𝒮ₜ (reported as 𝒮ₜ = max(0, λℳ̃ₜ + (1−λ)𝒥̃ₜ)).
- **Sensitivity-aware switching:** if 𝒮ₜ > threshold θ_fp → force BF16; else invoke the bit-allocation module. An asymmetric hysteresis operator suppresses rapid oscillation.
- **Kinematic-guided bit allocation (3 stages):**
  1. *Accuracy-preserving error bounding:* map sensitivity to a max allowable action error ε_a(𝒮ₜ).
  2. *Offline threshold calibration:* precompute a discrete map Φ: 𝒮ₜ ↦ {2,4,8} from where quantization error crosses the bound.
  3. *Online hardware dispatch:* constant-time lookup-table routing to pre-compiled kernels; a stateful counter approximates the sliding window with <64 KB overhead.

### Evaluation (extracted — pending hand-verification)
- **Simulation:** LIBERO (4 suites: Goal, Object, Spatial, Long; 40 tasks, 200 trials each).
- **Real-world:** tabletop 6-DoF arm + 1-DoF gripper; ~400 human demos per task category; 3 complexity levels (atomic grasping / spatial displacement / composite sequential).
- **Hardware:** NVIDIA A100 GPU + Intel Xeon Silver 4410T CPU.
- **Baselines:** static PTQ (W4A4, SmoothQuant-style) and a VLA-specific quantization baseline (exact name reported as "QVLA" by the automated reader — **to verify**); BF16 full precision as upper bound.
- **Reported ablation (LIBERO-Spatial):** static W4A4 ≈ 69.2% (≈15.5pp degradation) → +kinematic dispatch ≈ 85.0% (+16.8 ms) → +mixed-precision backend ≈ 84.8% (−8.2 ms recovered) → +async engine ≈ 84.7%, ~89.4 ms total, 1.51×.

### Stated limitations (extracted)
- No explicit failure-mode / domain-generalization discussion beyond LIBERO + the tabletop setup.
- θ_fp = 0.5 is task-specific; window sizes (W_macro = 10, W_micro = 5) require tuning.
