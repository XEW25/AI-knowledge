# Index

## Inbox
- [[00 Inbox]]

## Raw
- [[01 Raw]]
- [[2026-04-11 - Andrej Karpathy - LLM Wiki]] — raw capture of the original `llm-wiki.md` idea document

## Sources
- [[02 Sources]]
- [[Andrej Karpathy - LLM Wiki]] — source note on the LLM Wiki pattern proposed by Andrej Karpathy
- [[Alex Zhang - The Mismanaged Geniuses Hypothesis]] — source note on learned decomposition, orchestration, and the claim that frontier LMs are underutilized by brittle scaffolds
- [[MemPO: Self-Memory Policy Optimization for Long-Horizon Agents]] — source note on training memory as an explicit agent action and policy for long-horizon tasks
- [[Harness design for long-running application development]] — source note on multi-agent harness design, evaluator separation, and long-running application builds
- [[Scaling Managed Agents Decoupling the brain from the hands]] — source note on managed-agent architecture, decoupled sessions/harnesses/sandboxes, and stable platform abstractions
- [[Ascend HiFloat8 Format for Deep Learning]] — source note on a proposed FP8-like tapered-precision format for low-bit training and inference
- [[SmoothQuant: Accurate and Efficient Post-Training Quantization for Large Language Models]] — source note on activation smoothing, difficulty migration, and hardware-friendly W8A8 PTQ for LLMs
- [[Kerbl et al. - 3D Gaussian Splatting for Real-Time Radiance Field Rendering]] — source note on the foundational 3DGS paper (SIGGRAPH 2023)
- [[Huang et al. - ReKep Spatiotemporal Reasoning Keypoint Constraints for Robotic Manipulation]] — source note on keypoint-constraint-based manipulation via task decomposition (Li Fei-Fei group, Stanford)
- [[Huang et al. - ChemBot Long-Term Memory for VLA-based Agents]] — source note on Agent-as-Planner + VLA-as-Skill with dual-layer memory for chemical lab automation
- [[GigaWorld Team - GigaWorld-Policy An Efficient Action-Centered World-Action Model]] — source note on action-centered WAM with causal mask architecture, "训繁推简" paradigm
- [[Physical Intelligence - RL Tokens Precise Manipulation with Efficient Online RL]] — source note on RL tokens: lightweight RL expert on top of frozen VLA for precise manipulation
- [[Physical Intelligence - pi0 a Vision-Language-Action Flow Model for General Robot Control]] — **canonical π series note**; code-verified Paradigm A (joint-attention MoE, block-causal); PaliGemma 3B + 300M flow-matching action expert; open-source (openpi)
- [[Physical Intelligence - pi0.5 a VLA with Open-World Generalization]] — co-training recipe for open-world generalization; two-step subtask→action inference; inherits π₀ Paradigm A
- [[Physical Intelligence - pi0.6 a VLA That Learns From Experience]] — source note on Recap: advantage-conditioned offline RL for end-to-end VLA self-improvement from deployment experience
- [[Physical Intelligence - pi0.7 a Steerable Generalist Robotic Foundation Model]] — diversified prompt conditioning; BAGEL world model (subgoal images) + MEM dual memory; inherits π₀ Paradigm A
- [[NVIDIA - GR00T N1 An Open Foundation Model for Generalist Humanoid Robots]] — open-source humanoid VLA series; **Paradigm B (cross-attention encoder-decoder, code-verified)**; frozen VLM + diffusion DiT; N1.7 switches backbone to Cosmos-Reason2
- [[DeepCybo - PhysBrain Human Egocentric Data as a Bridge from VLMs to Physical Intelligence]] — VLM-as-brain; zero-real-robot-trajectory pretraining on human egocentric video (E2E-3M); Qwen3-VL + FM DiT (Paradigm B); not open-source
- [[Figure AI - Helix a VLA for Generalist Humanoid Control]] — dual-system S2(7B VLM)+S1(80M); system interface = single continuous latent vector; both onboard; closed
- [[AgiBot - GO-1 ViLLA Generalist Embodied Foundation Model]] — ViLLA 3-stage; discrete latent-action-token interface (VQ-VAE from video); latent planner is Paradigm A; AgiBot World 1M+ trajectories; open
- [[Galaxea - G0 Dual-System VLA Model]] — dual-system; language-subtask interface (ChemBot-like); G0-VLA internally Paradigm A (PaliGemma + flow matching); open
- [[Galaxea - G0.5 Autoregressive VLM-as-Actor VLA]] — **architectural reversal of G0**: unified autoregressive VLM-as-actor (single decoder/weights/objective) vs the VLM-as-encoder mainstream; cross-embodiment VQ ActionCodec + in-stream CoT + visual memory; introduces the more fundamental actor-vs-encoder axis above Paradigm A/B; Qwen3.5-2B backbone; backbone released
- [[DeepCybo - TwinBrainVLA Asymmetric Mixture-of-Transformers for Anti-Forgetting VLA]] — DeepCybo (PhysBrain team); anti-catastrophic-forgetting via asymmetric dual-VLM (frozen generalist "Left Brain" + trainable specialist "Right Brain" + AsyMoT) → flow-matching expert; VLM-as-encoder / Paradigm-A variant; quantifies forgetting (POPE 88.87%→0.04%); no code released
- [[DyQ-VLA: Temporal-Dynamic-Aware Quantization for Embodied Vision-Language-Action Models]] — source note on runtime-adaptive (kinematic-gated) mixed-precision PTQ for VLAs; **first embodied/VLA quantization entry** and first bridge between the quantization and embodied clusters; static W4 weights + dynamic activations (W4AX), base model OpenVLA; 99.5% perf at 30.9% memory, 1.49× sim / up to 1.43× real
- [[Ω-QVLA: Robust Quantization for Vision-Language-Action Models via Composite Rotation and Per-step Scaling]] — source note on **uniform W4A4** PTQ of VLA models *including the diffusion DiT action head*, via composite SVD·Hadamard rotation + per-step scaling; second VLA-quant source and the counterpart to DyQ-VLA (uniform-precision vs dynamic-mixed-precision); quantizes π0.5 (98.0%) & GR00T N1.5 (87.8%) ≈ FP16 at ~71% memory saved; open source (Apache-2.0)
- [[QuantVLA: Scale-Calibrated Post-Training Quantization for Vision-Language-Action Models]] — source note on **selective W4A8** PTQ for VLAs (Zhang et al., CVPR 2026); third VLA-quant source and Ω-QVLA's main baseline; DuQuant-based, integerizes LLM + DiT MLP but **keeps DiT attention FP16** + ATM/OHB interface calibrations; designed for real integer GEMMs; π0.5 97.6% / GR00T 88.0% (> FP16) at 55–70% mem. NB: ≠ QVLA (Xu, ICLR)
- [[DuQuant: Distributing Outliers via Dual Transformation Makes Stronger Quantized LLMs]] — source note on the rotation-based W4A4 **LLM** quant method (Lin et al., NeurIPS 2024 Oral) **underpinning both QuantVLA and Ω-QVLA**; dual transformation = greedy data-aware block rotation + zigzag permutation + smoothing; named "massive outliers" @ FFN down_proj; reports real 2.08× speedup. Route-2 anchor / VLA-quant ancestor
- [[Bi et al. - Motus A Unified Latent Action World Model]] — unified latent-action **world-action model** (Tsinghua TSAIL × Horizon Robotics); tri-expert **MoT** (Qwen3-VL-2B understanding + Wan 2.2 5B video-gen + flow-matching action), **范式 A** joint attention; **UniDiffuser-style timestep scheduling → 5 switchable inference modes** (VLA / World Model / IDM / VGM / Joint); optical-flow "delta" latent actions + six-layer data pyramid; makes "world model at inference" a **runtime knob** (4th-gen WAM, vs GigaWorld's fixed drop); RoboTwin 2.0 88.66%, LIBERO-Long 97.6; project page only, no code

## Wiki

### Concepts
- [[LLM Wiki]] — persistent-wiki pattern for LLM-maintained knowledge bases
- [[Task decomposition]] — breaking large problems into solvable subtasks for LM systems
- [[Agent orchestration]] — how LM calls, tools, and subagents are coordinated
- [[Recursive Language Models]] — recursive structures for richer LM composition
- [[Memory Policy]] — framing memory management as part of agent behavior and control
- [[Harness design]] — system scaffolding for long-running and structured agent work, extending upward toward meta-harness/platform abstractions
- [[3D Gaussian Splatting]] — explicit scene representation via 3D Gaussian blobs, real-time splatting rendering, and applications in embodied AI
- [[3D Spatial Representation]] — 理想 3D 空间表征的必要性、特征、语言类比，及 open research question
- [[Object-Centric Representation]] — 以物体为基本单元的场景表示方法，支持组合泛化
- [[World-Action Models]] — WAM 范式：视频生成 backbone + 动作预测，架构演进与路线对比
- [[Embodied Brain Models]] — 大脑模型的部署驱动定义（云=大脑、端=小脑）、三个主流流派（LLM/VLM-as-brain, Predictive Spatial Models, VLA 特殊定位）、接口/方法学正交维度、前瞻预判（骨架页）
- [[VLA quantization]] — VLA-specific low-bit quantization sub-cluster: why it differs from LLM quant (closed-loop error compounding, action-head sensitivity), the DyQ-VLA (dynamic mixed precision) vs Ω-QVLA (uniform W4A4 rotation) contrast, route mapping, and the cited landscape

### Entities
- [[Alex Zhang]] — author associated with the Mismanaged Geniuses Hypothesis
- [[Andrej Karpathy]] — researcher associated with the LLM Wiki framing
- [[Anthropic]] — organization associated with Claude, harness design, and agent engineering work
- [[Prithvi Rajasekaran]] — author associated with long-running application harness design
- [[Claude Code]] — coding-agent style orchestrator-subagent system
- [[OpenClaw]] — agent orchestration environment and referenced scaffold
- [[Hermes Agent]] — agent scaffold referenced in discussion of longer-horizon decomposition
- [[Physical Intelligence (π)]] — VLA 头部实验室（π 系列；范式 A 源头）
- [[NVIDIA]] — 具身全栈玩家（GR00T VLA + Cosmos 世界模型 + Isaac 仿真 + Jetson 硬件）
- [[Figure AI]] — 美国人形 VLA（Helix 双系统，全端侧；闭源全栈）
- [[AgiBot 智元]] — 中国人形 + GO-1 ViLLA（latent action）+ AgiBot World 数据集（开源）
- [[Galaxea 星海图]] — 中国具身（G0 双系统 VLA，语言子任务接口；开源）
- [[DeepCybo]] — 中关村孵化，PhysBrain（VLM-as-brain，人类视频路线）
- [[LimX Dynamics]] — 深圳足式+具身（ChemBot 完全分离双层架构）

### Topics
- [[Agent memory]] — topic page for memory as policy, decomposition, and self-managed memory in agent systems
- [[Harnesses and managed agent systems]] — topic page for harness design, managed-agent architecture, and long-running orchestration systems
- [[Model quantization]] — topic page for quantization, low-bit training, FP8-like formats, and numeric representation design
- [[Open questions in agent memory and decomposition]] — unresolved questions and research directions around decomposition, memory control, and meta-skills
- [[Spatial Intelligence for Embodied AI]] — 3D 空间表征、object-centric 表示、spatial modality 的研究方向汇总

### Syntheses
- [[Self-managing memory as an in-distribution control problem]] — synthesis on reframing memory management as decomposed control over write, retrieve, consolidate, and discard operations, with emphasis on decomposition policy
- [[Meta-skills for memory orchestration]] — synthesis on reusable higher-order skills for controlling memory operations and composing trainable memory subskills
- [[Home robot architecture - a hierarchical embodied agent]] — synthesis on the home general-purpose robot as a hierarchical embodied agent (cloud reasoner+world-model+memory over edge expert+safety+procedural skills); capability-vs-dependability gap, multi-level world-model necessity, key cloud/edge/privacy/disconnection tensions; where the vault's embodied and agent-memory lines converge

## Maps
- [[Home]] — top-level navigation page for the vault
- [[Agent systems, decomposition, and memory]] — navigation page for the cluster around agent architecture, decomposition, and memory control

## System
- [[90 System/AGENTS]]
- [[90 System/log]]
