# Log

## [2026-04-09] vault initialized
- Established initial vault structure
- Defined directory semantics
- Added agent operating guides
- Created index and log files

## [2026-04-09] ingest | Andrej Karpathy - LLM Wiki
- Added source note for `llm-wiki.md`
- Added concept page `LLM Wiki`
- Added map page `Home`
- Updated `90 System/index.md`

## [2026-04-11] maintenance | Andrej Karpathy - LLM Wiki raw backfill
- Added raw capture `2026-04-11 - Andrej Karpathy - LLM Wiki`
- Linked the existing source note back to the raw note
- Updated `90 System/index.md`

## [2026-04-11] ingest | MemPO: Self-Memory Policy Optimization for Long-Horizon Agents
- Added raw capture and source note for the MemPO arXiv paper
- Added concept page `Memory Policy`
- Updated memory-related syntheses and open questions pages
- Updated `90 System/index.md`

## [2026-04-11] maintenance | MemPO arXiv backfill
- Downloaded the paper PDF into `01 Raw/` as the raw anchor artifact
- Added local PDF links to the raw note and source note
- Brought the paper closer to the current PDF-first arXiv ingest standard

## [2026-04-11] ingest | Alex Zhang - The Mismanaged Geniuses Hypothesis
- Added raw capture for the X article in `01 Raw/`
- Added source note `Alex Zhang - The Mismanaged Geniuses Hypothesis`
- Added concept pages `Task decomposition`, `Agent orchestration`, and `Recursive Language Models`
- Added synthesis page `Self-managing memory as an in-distribution control problem`
- Added synthesis page `Meta-skills for memory orchestration`
- Added topic page `Open questions in agent memory and decomposition`
- Added map page `Agent systems, decomposition, and memory`
- Added entity pages `Alex Zhang`, `Andrej Karpathy`, `Claude Code`, `OpenClaw`, and `Hermes Agent`
- Updated cross-links among source, concept, synthesis, topic, map, and entity pages
- Updated `90 System/index.md`

## [2026-04-12] ingest | Harness design for long-running application development
- Added raw capture and source note for the Anthropic engineering article
- Added concept page `Harness design`
- Added entity pages `Anthropic` and `Prithvi Rajasekaran`
- Updated `Agent orchestration` and the main agent/decomposition/memory map
- Updated `90 System/index.md`

## [2026-04-12] ingest | Scaling Managed Agents: Decoupling the brain from the hands
- Added raw capture and source note for the Anthropic managed-agents article
- Extended `Harness design` upward toward meta-harness / platform-abstraction framing
- Updated `Agent orchestration`, the main agent/decomposition/memory map, and `90 System/index.md`

## [2026-04-12] synthesis | Memory decomposition, MemPO, and meta-skills
- Extended memory-related syntheses with the idea that memory management may be OOD only globally but decomposable into in-distribution subproblems
- Added the stronger claim that the main bottleneck may be learning the correct decomposition policy over memory operations
- Updated the MemPO source note to emphasize trajectory-trained write/compress as a proof of trainability for one memory subproblem
- Expanded open questions around which memory operations are easiest to train and how trajectory signals can scale from local actions to higher-level memory orchestration
- Updated `90 System/index.md`

## [2026-04-12] maintenance | Topic-layer and navigation cleanup
- Added topic pages `Agent memory` and `Harnesses and managed agent systems`
- Linked topic pages into related concept and map pages
- Expanded the main agent/decomposition/memory map to include topic entry points
- Updated `90 System/index.md`

## [2026-04-13] ingest | Ascend HiFloat8 Format for Deep Learning
- Added raw capture and source note for the HiF8 arXiv paper
- Added topic page `Model quantization` as the starting point for a quantization cluster
- Updated `90 System/index.md`

## [2026-04-13] ingest | SmoothQuant: Accurate and Efficient Post-Training Quantization for Large Language Models
- Added raw capture and source note for the SmoothQuant paper
- Updated `Model quantization` to distinguish representation-design from distribution-reshaping / difficulty-migration routes
- Updated `90 System/index.md`

## [2026-04-20] ingest | Kerbl et al. - 3D Gaussian Splatting
- Added source note for the foundational 3DGS paper (SIGGRAPH 2023)
- Added concept page `3D Gaussian Splatting` covering core properties, splatting rendering, training, vs NeRF, vs point cloud, embodied AI input forms
- Updated `90 System/index.md`

## [2026-04-21] synthesis | 3D Spatial Representation for Embodied AI
- Added concept page `3D Spatial Representation` — necessity of spatial modality, language analogy, ideal properties, physical invariance, compositional structure, open questions
- Added concept page `Object-Centric Representation` — object as basic unit, compositional generalization, key approaches
- Added topic page `Spatial Intelligence for Embodied AI` — research directions, key papers (SPA, UniSplat, GROOT, Object-Centric 3DGS), open questions
- Updated `3D Gaussian Splatting` with cross-links to new pages
- Updated `90 System/index.md`

## 2026-04-22
- **Ingest**: ReKep (Huang et al., 2024, arXiv:2409.01652) — Li Fei-Fei 团队的关键点约束操控范式
  - Raw: PDF + raw note created
  - Source note created with Ethan's perspective on task decomposition as OOD mitigation
  - Updated [[Task decomposition]] — added embodied manipulation section, ReKep vs VLA comparison
  - Updated [[Spatial Intelligence for Embodied AI]] — added constraint-based manipulation section
  - Key insight from Ethan: 任务拆解消解 OOD 问题，与知识库已有思路一致

- **Ingest**: GigaWorld-Policy (GigaAI, 2026, arXiv:2603.17240) — Action-centered WAM, "训繁推简" causal mask 架构
  - Raw: URL-only (Tier 1), 详细架构分析
  - Source note created with method, experiments, generalization analysis, comparison with ReKep
  - Created [[World-Action Models]] concept page — WAM 范式综述、架构演进、路线对比
  - Updated [[Task decomposition]] — added WAM to route comparison
  - Updated [[Spatial Intelligence for Embodied AI]] — added WAM optimization section

- **Ingest**: RL Tokens (Physical Intelligence, 2026) — RL token 作为 VLA 与轻量 RL 专家的接口
  - Raw: URL-only (Tier 1)
  - Source note created with Ethan's insight on capability-level decomposition
  - Updated [[Task decomposition]] — added 拆解维度光谱：任务步骤拆解 (ReKep) vs 能力层级拆解 (RLT) vs 时间尺度拆解

- **Ingest**: ChemBot (Huang et al., 2026, arXiv:2604.15671) — Agent-as-Planner + VLA-as-Skill 框架
  - Raw: URL-only (Tier 1), 详细架构和记忆机制分析
  - Source note with Ethan's insight on memory asymmetry (上层有记忆，底层无记忆)
  - Updated [[Task decomposition]] — added ChemBot to interface spectrum (约束/token/子任务指令)
  - Updated [[Agent memory]] — added 具身智能中的记忆 section, memory asymmetry discussion
  - Key insight: 理想情况下两层都应有记忆——上层记策略经验，下层记操作经验

- **Ingest**: π*₀.6 (Physical Intelligence, 2025, arXiv:2511.14759) — Recap: advantage-conditioned offline RL for VLA self-improvement
  - Raw: URL-only (Tier 1)
  - Source note with PI 双路线分析 (π*₀.6 全模型 RL vs RL Tokens 轻量插件)
  - Updated [[Agent memory]] — added π*₀.6 as implicit memory, explicit+implicit combination insight
  - Updated [[Spatial Intelligence for Embodied AI]] — cross-link
  - Key relation: 隐式记忆(π*₀.6) + 显式记忆(ChemBot) = 理想双层记忆

- **Ingest**: π₀.5 (Physical Intelligence, 2025, arXiv:2504.16054) — open-world generalization VLA
  - Raw: URL-only (Tier 1), 详细架构和训练配方
  - Source note: 两层推理详解（半共享架构）、co-training 配方、vs ChemBot 对比
  - Key insight: 子任务 token 不 round-trip，在 embedding 空间内传递；97.6% 训练数据非目标场景
  - Updated [[Task decomposition]] — added π₀.5 as single-model decomposition example
  - Three architecture paradigms: 完全分离(ChemBot) / 半共享(π₀.5) / 完全端到端

- **Ingest**: π₀.7 (Physical Intelligence, 2026, arXiv:2604.15483) — steerable generalist VLA with emergent capabilities
  - Raw: URL-only (Tier 1), 9 维 model checklist
  - Source note: diversified prompt conditioning, subgoal images (BAGEL 14B), MEM 双记忆, verbal coaching
  - Key insights: subgoal image = VLA+WAM 融合桥梁; metadata conditioning = Recap 的泛化版本; verbal coaching = 教模型拆任务
  - Updated [[Memory in Embodied AI]] — π₀.7 为 PI 第一个双记忆 VLA
  - Updated [[Task decomposition]] — verbal coaching + subgoal as task decomposition
  - Updated [[Physical Intelligence]] — π₀.7 详情, RL 路线统一

## [2026-05-30] synthesis | Embodied Brain Models concept skeleton
- Established deployment-driven framework distinguishing brain (cloud) vs cerebellum (edge) models in embodied AI
- Defined three brain model schools via iterative discussion with Ethan:
  - LLM/VLM-as-brain (with Talker / Coder / Constraint / Affordance interface sub-branches; MCP-Toolkit retired as transitional)
  - Predictive Spatial Models (merged World Model and representation streams — prediction and representation as two sides of one problem)
  - VLA assigned special "transitional/being-fragmented" positioning instead of being a parallel school
- Identified interface dimension (NL / code / subgoal image / embedding / affordance / action token) and methodology dimension (scaling / sim2real / self-improvement / distillation / co-training / multi-embodiment) as orthogonal to school axis
- Mapped existing vault works onto school × interface matrix (π series, ChemBot, ReKep, RL Tokens, GigaWorld-Policy)
- Added per-school forward predictions across three layers: 2-3 yr (high certainty) / 5 yr+ (speculative) / reverse hypothesis (if wrong)
- Recorded Ethan's three core positions:
  - Monolithic VLA won't be cloud-brain mainstream
  - VLM-as-brain has best cloud-edge fit
  - World Model + Representation form a unified school (Predictive Spatial Models)
- Recorded deeper meta-observation: the real divide between schools is "how to acquire world understanding," not "what to output"
- Created skeleton page `Embodied Brain Models` intended for incremental fill-in as new materials are ingested
- Updated `Spatial Intelligence for Embodied AI` cross-link
- Updated `90 System/index.md`
- TODO: future companion page `Embodied Cerebellum Models` once cerebellum schools crystallize

## [2026-05-30] research + verification | VLA landscape and architecture coupling
- Ran background research on the global VLA landscape (US + Chinese players) feeding the brain-model survey
- Verified PhysBrain 1.0 (DeepCybo + Zhongguancun, arXiv:2512.16793): egocentric-video-only pretraining (E2E-3M, zero real-robot trajectories), Qwen3-VL backbone + FM DiT
  - Confirmed PhysBrain has NO open-source code/weights — the `ZGC-EmbodyAI/PhysBrain` repo is only the HTML project page (index.html/styles.css/imgs/videos)
  - Corrected secondary-source errors: backbone is Qwen3-VL (not Qwen2.5-VL); "PhysGR00T/PhysPI/TwinBrainVLA/LangForce" not in paper (some are separate real repos in the org, not paper content)
- Code-level verification of VLA VLM↔action coupling (key finding): two distinct paradigms
  - Paradigm A (Joint Attention / MoE-style): π series — separate weights per expert, KV concatenation, layer-wise lockstep, block-causal; NOT a true MoE (no router). Verified via openpi pi0_pytorch.py, lucidrains, open-pi-zero
  - Paradigm B (Cross-Attention / Encoder-Decoder): GR00T, PhysVLA — VLM runs once → embedding injected as per-layer K/V into DiT, cross/self interleaved. Verified via Isaac-GR00T dit.py
  - Cloud-edge implication: Paradigm A interface = per-layer KV cache (heavy); Paradigm B interface = single embedding tensor (light) → explains deployment-oriented players (NVIDIA, DeepCybo) choosing B, research-oriented (PI) choosing A
- Corrected earlier overstatement "dual-system is industry consensus" → "functional layering is consensus; physical split still diverging, deployment-oriented work tends to split"
- Corrected π₀.5 source note attention description (earlier wrongly said "shared attention layer" / "bidirectional"): actual is MoE two-expert + block-causal joint attention, code-verified
- Added "VLA 内部的两种耦合范式" subsection to `Embodied Brain Models`
- Updated `Physical Intelligence - pi0.5` source note with code-level coupling-paradigm verification
- Method note: every accurate coupling-mechanism conclusion required primary source / code reading; no secondary summary got it right

## [2026-05-30] verification + reorg | Full π series coupling verification and per-model notes
- Verified VLM↔action coupling for the ENTIRE π series from primary sources (previously only π₀ code + π₀.5 paper were verified):
  - π*₀.6 (arXiv:2511.14759): Paradigm A inherited ("otherwise the same"); action expert "can attend to the activations in the rest of the model"; value function is a SEPARATE 670M VLM, training-only, discarded at inference
  - π₀.7 (arXiv:2604.15483): Paradigm A base (Gemma3 4B + 860M FM expert); block-causal explicitly quoted; BAGEL world model is a SEPARATE external model feeding subgoal-image tokens (Paradigm-B-like interface); MEM is a video-history encoder feeding tokens
  - RL Tokens: freezes π₀ VLA (internal Paradigm A unchanged) + separate RL adapter (capability-level decomposition, not a coupling change)
  - Conclusion: the whole π series keeps Paradigm A (joint-attention MoE) unchanged 2024→2026; capability growth comes from bolt-on modules (value fn / BAGEL+MEM / RL adapter)
- Created the MISSING canonical note `Physical Intelligence - pi0 a Vision-Language-Action Flow Model for General Robot Control` (the most-verified model previously had no source note); holds the code-verified Paradigm A mechanism
- Reorganized: moved cross-cutting Paradigm A/B comparison + GR00T + PhysVLA details OUT of the π₀.5 note (they belong in the concept page / π₀ canonical note); π₀.5 note trimmed to π₀.5-specific facts (two-step subtask→action decomposition) + pointers
- Added concise verified coupling sections to π₀.6, π₀.7, RL Tokens notes, each pointing to the canonical π₀ note
- Backfilled index Sources (π₀, π₀.5, π₀.7 were missing) and updated `Physical Intelligence` entity page (π₀ source note link, Paradigm A annotation, full Related list)

## [2026-05-30] verification | π₀.5 code-level architecture confirmation + open-source boundary
- Confirmed open-source status: openpi releases ONLY π₀ / π₀-FAST / π₀.5; π*₀.6 / π₀.7 / RL Tokens are all closed (open-source ends at π₀.5 = PI's commercialization line)
- Code-verified π₀.5 architecture against openpi JAX source (src/openpi/models/pi0.py + pi0_config.py):
  - π₀.5 shares the SAME model class as π₀ (no separate pi05.py; only a `pi05: bool` flag in Pi0Config) — strongest possible evidence of architectural consistency
  - pi0_config.py documents exactly TWO differences from π₀, neither touching the VLM↔action coupling:
    1. state input moved to discrete language tokens in the prefix (vs continuous state token in the suffix)
    2. action expert uses adaRMSNorm to inject the flow-matching timestep
  - Same make_attn_mask (block-causal), same joint two-expert forward (PaliGemma.llm([prefix, suffix], mask)), same prefix-KV-cache-then-suffix-attends inference path
  - Upgraded π₀.5 note from "paper-verified inheritance" to "code-verified same model class"
- Firmed up π₀.7 open-source field from "未开源（大概率）" to definitive (openpi only to π₀.5)
