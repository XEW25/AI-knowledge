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

## [2026-05-30] ingest | GR00T and PhysBrain source notes (Paradigm B representatives)
- Created `NVIDIA - GR00T N1 An Open Foundation Model for Generalist Humanoid Robots`:
  - Paradigm B (cross-attention encoder-decoder), code-verified via gr00t/model/modules/dit.py
  - Frozen VLM + diffusion DiT; N1 2B / N1.5+ 3B; N1.5 key changes (frozen VLM, simplified adapter+LayerNorm, FLARE loss 0.2, DreamGen synthetic data)
  - backbone evolution Eagle → Eagle 2.5 → Eagle → Cosmos-Reason2-2B (Qwen3-VL) at N1.7 — World Model × VLA fusion
  - Open-source: code Apache 2.0, weights NVIDIA Open Model License
  - Verified benchmarks (DreamGen 13.1→38.3, Language Table 52.8→93.2, etc.)
- Created `DeepCybo - PhysBrain Human Egocentric Data as a Bridge from VLMs to Physical Intelligence`:
  - VLM-as-brain school; PhysBrain = fine-tuned Qwen3-VL brain, PhysVLA = brain + FM DiT (Paradigm B)
  - Headline: zero-real-robot-trajectory pretraining on human egocentric video; E2E-3M (3M VQA, 7 modes, Ego4D/EgoDex/BuildAI)
  - Recorded corrections vs secondary sources: Qwen3-VL not Qwen2.5-VL; "PhysGR00T/PhysPI/TwinBrainVLA/LangForce" are marketing/separate-repo names not in paper; benchmark number v1/v2 discrepancies; NOT open-source (repo is just project HTML page)
- Updated index Sources + `Embodied Brain Models` (linked both notes in Paradigm B section, moved them from todo to done)

## [2026-05-30] research + synthesis | Player landscape: two-level coupling framework
- Verified VLM↔action coupling for Helix / AgiBot GO-1 / Galaxea G0 from primary sources (Figure blog, AgiBot World arXiv:2503.06669, Galaxea G0 arXiv:2509.00576)
- KEY FINDING: "coupling" has TWO orthogonal levels, previously conflated:
  - Level 1 (system interface, high-level brain → low-level executor): single latent vector (Helix) / discrete latent-action tokens via VQ-VAE (GO-1) / natural-language sub-tasks (G0, ChemBot) / subgoal images (π₀.7)
  - Level 2 (within-VLA VLM↔action coupling): Paradigm A (joint MoE) vs Paradigm B (cross-attention)
- The two levels are orthogonal: G0 decouples at system level (language sub-tasks) but G0-VLA is internally Paradigm A (PaliGemma + flow matching); GO-1 latent planner is also Paradigm A
- FALSIFIED the over-simple "deployment-oriented → Paradigm B" hypothesis; replaced with: deployment players pursue system-level decoupling + compressed interface via TWO routes — (1) single model with clean internal split (Paradigm B: GR00T, PhysVLA), or (2) explicit multi-system with compressed interface (Helix, GO-1, G0, ChemBot). Both avoid the tightly-coupled single-model joint-MoE (π's Paradigm A, hardest to split)
- Added a decoupling-degree spectrum (research→deployment) and a verified player landscape table to `Embodied Brain Models`
- Created 3 source notes: `Figure AI - Helix`, `AgiBot - GO-1 ViLLA`, `Galaxea - G0`
- Updated index Sources and concept-page source-note list

## [2026-05-30] deepen | GO-1 Latent Planner mechanism + latent-action synthesis candidate
- Re-verified GO-1 Latent Planner I/O from AgiBot World arXiv:2503.06669 and expanded the source note:
  - LAM = "question-setter": inverse-dynamics encoder I(z|I_t, I_{t+H}) + forward-dynamics decoder, VQ-VAE codebook (k=4), learnable from frame pairs alone (no action labels) → web/human video
  - Latent Planner = "answerer": inputs = multiview images + instruction + layer-wise VLM features (24 layers, Paradigm A joint); outputs = k=4 discrete latent-action tokens P(z_t|...)
  - Train vs inference crux: targets supervised by LAM from FUTURE frames (z_t := I(I_t^h, I_{t+H}^h)); at inference the planner predicts z_t from current obs+instruction only — the actual "planning"
  - Action Expert = "decoder": diffusion conditioned on latent tokens; planner=what-should-happen (embodiment-agnostic), expert=how-to-actuate (embodiment-specific) → cross-embodiment transfer
- Added a Synthesis candidate to `Embodied Brain Models`: "learn action/semantics from unlabeled video" trend line (GO-1 latent action, PhysBrain egocentric, LAPA, Genie)

## [2026-05-30] synthesis | Home robot architecture as a hierarchical embodied agent
- Created synthesis page `Home robot architecture - a hierarchical embodied agent` — the culmination of a multi-turn discussion arc (architecture verification → deployment reality → factory needs → home needs → architecture proposal)
- Core thesis: home general-purpose robot = hierarchical embodied agent, NOT a bigger VLA; the convergence point of the vault's two lines (embodied control + persistent agent cognition)
- Captured: four-axis deployment framework; capability-vs-dependability gap (with industry corroboration: Levine, Tedrake, Jang); dependability scaffolding with verified research lines (KnowNo, Sentinel, CBF/SHIELD, World Action Verifier); capability→architecture mapping; the refined hierarchical architecture (cloud reasoner+world-model+memory / edge expert+safety+procedural-skills+distilled-small-brain)
- Recorded critical refinements to Ethan's proposed architecture: (1) reasoner ≠ world model (propose-then-verify); (2) edge safety/monitoring layer is mandatory and must work offline; (3) edge expert needs local autonomy, not passive decoding; (4) interface is plan-level not action-level; (5) cloud-only intelligence → disconnection fragility, suggest distilled edge brain; (6) privacy vs cloud-memory tension → split/federated memory
- World-model multi-level necessity judgment: prediction is (very likely) necessary for the un-trainable long tail, but not necessarily a single decision-time generative MPC — more likely heavy world model in slow cloud + light/implicit prediction on edge + training-time use
- Dual-memory mapping (cloud explicit + edge procedural) maps to Memory in Embodied AI's ideal and to the biological cerebellum's skill-consolidation function
- Confidence markers throughout (established vs Ethan+Ada forward judgment)
- Updated index Syntheses; backlinks from Embodied Brain Models and Memory in Embodied AI

## [2026-05-30] entities | Embodied-AI company entity pages
- Created 6 organization entity pages referenced by the embodied source notes (resolving dangling links):
  - `NVIDIA` — full-stack player (GR00T VLA + Cosmos world model + Isaac sim + Jetson Thor); multi-school positioning
  - `Figure AI` — Brett Adcock, 2022, Sunnyvale; Helix dual-system, fully onboard, closed full-stack
  - `AgiBot 智元` — Deng Taihua + Peng Zhihui (稚晖君), 2023, Shanghai; GO-1 ViLLA + AgiBot World (open)
  - `Galaxea 星海图` — Xu Huazhe (Tsinghua+Stanford), 2023, Beijing; G0 dual-system (open)
  - `DeepCybo` — Chen Kai, Zhongguancun-incubated, Beijing; PhysBrain egocentric-video route (not open)
  - `LimX Dynamics 逐际动力` — Wei Zhang (张巍), 2022, Shenzhen; ChemBot fully-separated dual-layer
- Verified company facts from primary/secondary sources before writing (founders, founding year, HQ, Chinese names)
- CORRECTED an error introduced earlier: Galaxea's Chinese name is 星海图 (Xinghaitu), NOT 跨维智能 (that is a different company, Dexmal). Fixed the G0 source note (author metadata + entity wikilink)
- Backfilled index Entities (Physical Intelligence was also missing) + added the 6 new entities

## [2026-05-30] ingest | Galaxea G0.5 (autoregressive VLM-as-actor) — framework-reshaping
- Downloaded PDF to `01 Raw/2026 - Galaxea - G0.5.pdf`; read via pdftotext (Read-tool poppler unavailable)
- Created source note `Galaxea - G0.5 Autoregressive VLM-as-Actor VLA`
- KEY FINDING (direction-shaping): G0.5 introduces a MORE FUNDAMENTAL architectural axis than our Paradigm A/B — **VLM-as-actor (unified autoregressive, VLM produces actions) vs VLM-as-encoder (VLM conditions a separate flow/diffusion expert)**. Our Paradigm A (π joint MoE) and B (GR00T cross-attn) are BOTH sub-types of VLM-as-encoder; G0.5 is VLM-as-actor (RT-2/OpenVLA/π0-FAST lineage, scaled up)
- G0.5 architecture: single transformer decoder (Qwen3.5-2B init), single next-token objective, reasoning+action in one stream; 3 components — learnable cross-embodiment VQ ActionCodec (active-DoF, no padding, no new params per embodiment), native in-stream CoT (bbox + subtask text + 2D trace + action hint, prompt-switchable), visual memory; optional flow-matching head only as inference accelerator
- Galaxea PIVOTED: G0 (dual-system, VLM-as-encoder) → G0.5 (unified AR, VLM-as-actor) — strong signal the actor-vs-encoder debate is unsettled
- Argument: KI (π0.5) reintroducing AR action prediction implicitly concedes AR is the protective signal; VLA-0 shows plain-AR beats π0.5-KI/OpenVLA-OFT/SmolVLA on LIBERO
- Results: LIBERO 98.9 / RoboTwin2.0 93.3 / SimplerEnv-Bridge 87.3 / DROID zero-shot 82.5 / R1 real 76.7 (vs π0.5 53.3, GR00T-N1.7 24.4) / BEHAVIOR-1K 31.4
- Updated G0 source note (successor + pivot), Galaxea entity (pivot), index Sources
- TODO (proposed, pending user): restructure `Embodied Brain Models` coupling section around actor-vs-encoder as the top-level axis, with Paradigm A/B as encoder sub-types and unified-AR as a third class

## [2026-05-30] refine | Restructure VLA coupling axis (actor vs encoder) + raw-artifact policy
- Restructured `Embodied Brain Models` VLA section around **VLM-as-actor vs VLM-as-encoder** (per Ethan's scoping corrections):
  - SCOPED as a VLA-school-internal axis, explicitly NOT a cross-school top-level axis (World Model / Predictive Spatial noted as orthogonal)
  - TONED DOWN: "important, currently-unsettled architectural divergence", not "most fundamental"
  - VLM-as-encoder now contains Paradigm A (π joint MoE) + Paradigm B (GR00T/PhysVLA cross-attn); VLM-as-actor (unified AR: RT-2→OpenVLA→π0-FAST→G0.5) added as the other branch with both sides' arguments (unsettled)
  - Toned down the same wording in the G0.5 source note
- Raw-artifact policy: removed the 27MB G0.5 PDF from the repo (working tree + index); switched the note to URL-only (Tier 1), consistent with prior URL-only ingests (GigaWorld, RL Tokens)
  - Note: the blob remains in git history (commit 2b61d04); a full history purge would need a force-push — not done (non-destructive removal only)
  - Codified the practice in `90 System/AGENTS.md` 01 Raw section: large binaries (PDFs > a few MB) prefer URL-only; preserve local copies only when small/important

## [2026-05-30] deepen | G0.5 architecture + training details (from PDF)
- Re-read G0.5 PDF (cached text) to answer Ethan's precise questions; expanded the source note:
  - VLM: initialized from Qwen3.5-2B; core decoder essentially unchanged (no separate expert / MoE / cross-attn). Additions are minimal: vocabulary extension (action codes + DoF-group/noop special tokens), visual memory, external ActionCodec, optional FM head
  - Vocabulary unification: one AR stream holds three "sub-languages" sharing the vocab — text (Qwen native), spatial coords (`<loc####>` location tokens for bbox/trace), actions (`<action####>` RVQ codes + structural markers); one CE loss, one decoder
  - CoT = 4 self-describing primitives in fixed coarse-to-fine order: Subtask → BBox → Trace → ActionHint → Action; `<EOV>` marks reasoning→action boundary
  - ActionHint defined: frame-level natural-language gripper/motion directive (e.g., "close the left gripper while moving forward")
  - "When to reason vs act" is NOT free model choice — controlled by (1) self-describing labels + fixed order, (2) prompt directive selecting targets, (3) training over 8 CoT formats (incl. no-CoT); eval uses fixed no-CoT
  - Training: single next-token CE on generative segment only, no aux/distillation; ~100M VL co-training (50M web + 50M embodied + 5M in-house VQA), VQA:action 1:4; AdamW lr 1e-5
  - Autolabeling pipeline (key data trick): language (subtask/action-hint/instruction) via temporal segmentation + Gemini 3 / Doubao Seed 2.0 Pro API; bbox/masks via multimodal FM + SAM3 tracking; 2D traces via forward kinematics projected to head-camera plane → so the "reasoning" labels are partly DATA-LEVEL distillation from large multimodal models
- Updated checklist training-data row accordingly

## [2026-05-30] correct + deepen | G0.5 open-source status + AR-vs-FM CoT ablation
- CORRECTED over-optimistic open-source field: verified GitHub `OpenGalaxea/G05` is only the project webpage (TypeScript/Vite), `OpenGalaxea/G0` likewise (HTML); HF search finds only third-party fine-tunes — no official code/weights repo located. Softened metadata + checklist row 6 to "claimed but unverified; no code to reference"
- Added the §5.6 CoT × decoder-interface ablation (single checkpoint, inference-time toggle of AR-vs-FM head and CoT on/off):
  - Finding 1: CoT helps only on multi-stage long-horizon tasks (PP Bench single-stage ≤1.6pp; Air Fryer/Bacon clear gains)
  - Finding 2: AR follows CoT more closely than FM (Air Fryer 72 vs 48, Bacon 64 vs 44 language-following under matched CoT); hypothesis = decoding interface (AR attends CoT directly vs FM conditions on a pooled summary)
  - CoT quality equal across heads (~90/85/80%), supporting "interface not reasoning content"
- Recorded key clarification + limitations (resolving Ethan's questions): FM head conditions on a POOLED SUMMARY of the hidden state — NOT the full per-token embedding sequence, NOT cross-attention (Paradigm B); pooling is MORE compressed than B; exact pooling mechanism is underspecified and no code exists to check. Also flagged that the pooled FM baseline is not fully fair to the encoder camp, n=5 small samples, and the mechanism is an unverified hypothesis

## [2026-05-30] maintenance | Ingest-workflow cross-ref + history-purge correction
- Added a pointer in `90 System/AGENTS.md` Ingest workflow step 1 to the `01 Raw/` raw-tier rule (large PDFs → URL-only; keep local copy only when small/important), so the size-based capture decision is discoverable from the workflow itself, not only from the directory-semantics section
- Confirmed log↔reality consistency for the raw-tier rule: it is actually present in AGENTS.md (01 Raw section, "For large binaries... prefer URL-only"), matching the earlier log claim — verified, not just claimed
- CORRECTION to the earlier "refine ... raw-artifact policy" entry which said the G0.5 blob "remains in git history (force-push not done)": this was SUBSEQUENTLY superseded — the 27MB blob was fully purged from history via `git filter-branch` + `--force-with-lease` push (`.git` 40M→14M; backup branch + refs/original removed + reflog expire + gc --prune=now). Any other clones would need re-clone / hard reset to `origin/master`

## [2026-05-30] correct | π₀.5 action-expert size error (860M → 300M)
- While answering "π₀.5 vs π₀ differences", caught a cross-note inconsistency: π₀.5 note listed action expert as **860M**, but openpi config.py verifies all pi05 training configs use `Pi0Config(pi05=True)` → default `action_expert_variant="gemma_300m"` (300M), same as π₀. The 860M is **π₀.6's** action expert (Gemma 3 4B + 860M), mis-copied into the π₀.5 note
- Fixed both occurrences in `02 Sources/Physical Intelligence - pi0.5` (checklist row 2 + two-step section) with explicit note that 860M belongs to π₀.6
- Added a correction marker (not overwrite) to the `01 Raw` π₀.5 capture, per the raw-preservation principle, also flagging its stale "shared attention layer" wording
- Verified 860M is CORRECT for π₀.6 and π₀.7 notes (Gemma 3 4B + 860M) — left untouched
- Net: π₀.5 = π₀'s architecture (gemma_2b 3B + gemma_300m 300M, Paradigm A) + heterogeneous co-training recipe + two-step hierarchy + KI, all for open-world generalization; the two code-verified arch tweaks (state-as-discrete-token, adaRMS timestep) remain the only structural changes

## [2026-06-03] ingest | DyQ-VLA: Temporal-Dynamic-Aware Quantization for Embodied VLA Models
- Post-knowledge-cutoff paper (arXiv:2603.07904, submitted 2026-03-09, v2 2026-03-14) — located + verified via web search and arXiv abstract/HTML fetch; new ingest, not a backfill
- Raw: URL-only (Tier 1); raw note records the (partial verbatim) abstract + extracted method/eval, with an explicit caveat that mechanism details came from an automated HTML reader and are NOT yet hand-verified against the PDF
- Created source note `Zheng et al. - DyQ-VLA Temporal-Dynamic-Aware Quantization for Embodied Vision-Language-Action Models`
- KEY FRAMING: adds a THIRD route to `Model quantization` beside representation-design (HiFloat8) and distribution-reshaping (SmoothQuant): **dynamic / runtime-adaptive (input-conditioned) mixed precision** — bit allocation as a function of task temporal state. New orthogonal axis = *when the config is decided* (static vs runtime), above the existing *what you intervene on* (format vs distribution) axis
- First **embodied/VLA quantization** note in the vault and first bridge between the quantization cluster and the embodied/VLA cluster
- Method in one line: static W4 weights + dynamic activations (W4AX, X∈{2,4,8,BF16}) gated by a cheap real-time kinematic proxy (motion fineness + angular jerk → sensitivity score → BF16 fallback or offline-calibrated bit LUT); base model OpenVLA (VLM-as-actor lineage, cf. G0.5 note); uses the vault's existing SmoothQuant as a W4A4 baseline
- Results (high-confidence, triangulated across abstract/search/HTML): 99.5% perf at 30.9% memory; 1.49× sim (LIBERO) / up to 1.43× real-world
- Left light on purpose (incremental maintenance): deeper embodied-cluster integration (Embodied Brain Models cross-link, a dedicated VLA-quantization concept page) deferred pending a second source or user direction

## [2026-06-03] verification | DyQ-VLA mechanism hand-verified + open-source + raw-artifact decision
- Hand-verified mechanism/baselines/results by reading the full PDF (v2, 9 pp) directly — extracted text via `pypdf` (installed ad hoc; Read-tool poppler unavailable, as in prior ingests). The earlier automated-reader extraction proved accurate; this pass mainly added precision and caught items the secondary extraction missed
- CONFIRMED / REFINED:
  - Affiliations (were "unverified"): Peking University (lead — School of CS / School of EECS) + South China University of Technology + Beijing Normal University; corresponding = Xiang Chen (PKU)
  - Base = OpenVLA (~7B, autoregressive token-by-token, chosen for homogeneity); PTQ; W4AX = INT4-frozen weights + dynamic activations {2,4,8,BF16}
  - Proxy: Motion Fineness M=1−‖a_xyz‖/μ95 (macro, r=0.90), Angular Jerk J=‖Δa_rot‖/ν95 (micro, r=0.87) vs ground-truth s_t=D_T/e_t; fused S=max(0,λM̃+(1−λ)J̃); asymmetric hysteresis (instant upgrade, delayed downgrade via window K); offline-calibrated LUT Φ:S↦{2,4,8}; θ_fp=0.5, W_macro=10, W_micro=5
  - "QVLA" baseline is REAL (arXiv:2602.03782, per-channel) — removed the earlier "to verify" hedge; actual VLA-quant baselines = QVLA + SmoothQuant (SQAP-VLA arXiv:2509.09090 cited as related). EaqVLA is NOT used by this paper
  - Real-world results use QLoRA fine-tuning (rank 32, 4-bit frozen) for sim-to-real → not pure plug-in quantization (now flagged as a limitation)
  - Table-only critical read: DyQ-VLA beats QVLA by just +0.1% avg SR and at slightly MORE memory (4.7 vs 4.3 GB) → the real contribution is the dynamic paradigm + speed, not Pareto-dominating the static SOTA
  - Sibling work: same PKU group's KERV (kinematic-rectified speculative decoding, arXiv:2603.01581) reuses the same "kinematics as runtime signal" idea → broader thesis to watch
- OPEN SOURCE: none located — no release claim in the paper, no GitHub/project link, no repo found via web search (2026-06-03). Recorded as "none located"
- RAW-ARTIFACT DECISION: downloaded PDF measured 4.94 MB (> "a few MB") and is trivially re-accessible on arXiv → kept **URL-only (Tier 1), NOT committed**; matches the raw-tier rule and the G0.5 / GigaWorld / RL Tokens precedent. Temp PDF/text used only for verification, then deleted
- Upgraded both notes: caveats changed from "automated extraction, not hand-verified" → "hand-verified against PDF (v2)"; added verified formulas, full results tables, affiliations, open-source status, and the QVLA-margin / QLoRA / KERV refinements
- `Model quantization` topic + `index.md` left unchanged (re-checked, still accurate; avoided churn)
