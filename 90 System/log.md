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

## [2026-05-30] deepen | π₀.5 action-expert I/O + cross-subtask memory (precise mechanism)
- Added "Action expert 的 I/O 与跨子任务记忆" subsection to the π₀.5 source note (answering Ethan's 3 precise questions, code-verified):
  - Q1: action expert input does NOT include VLM hidden states — each expert computes its own K/V from its own hidden states; VLM enters via concatenated joint-attention K/V, not as input embeddings
  - Q2: action expert's direct token input = action (noise) tokens only (`if self.pi05: action_expert_tokens = action_tokens`); (image+instruction+subtask+state) are the prefix, attended via PER-LAYER KV cache (lockstep, not final-layer, not pooled — contrast GR00T cross-attn-to-final / G0.5 pooled FM head); proprio/state in prefix (default discrete; discrete_state_input configurable, pi05_libero=False)
  - Q3: NO cross-subtask retention — context rebuilt from current observation each inference; KV cache only for current prefix; progress is observation-driven, not KV-retained. This is the structural gap π₀.7's MEM later fills (→ Memory in Embodied AI)
- Also fixed a stale "共享 attention 层" wording in the existing 信息流详解 step 3

## [2026-06-09] ingest | TwinBrainVLA (DeepCybo) — anti-forgetting dual-VLM
- Created source note `DeepCybo - TwinBrainVLA Asymmetric Mixture-of-Transformers for Anti-Forgetting VLA` (arXiv:2601.14133). PDF read from /tmp (URL-only per raw-tier rule, ~6.8MB not committed)
- Same org/team as PhysBrain (DeepCybo / ZGC-EmbodyAI; authors overlap, Kai Chen corresponding)
- Core: structural fix for catastrophic forgetting in VLA fine-tuning. Quantified the problem: Qwen3-VL POPE 88.87% → 0.04% after standard VLA training; 1:1 co-training also fails
- Architecture: asymmetric dual-VLM — frozen "Left Brain" (generalist, preserves pretrained knowledge) + trainable "Right Brain" (specialist, +proprio, generates actions); AsyMoT (Asymmetric Mixture-of-Transformers) lets Right Brain attend joint KV [sg(K_L);K_R] (stop-grad on frozen Left) — joint attention, NOT cross-attention (paper distinguishes); fused rep conditions a flow-matching action expert. So: VLM-as-encoder, Paradigm-A (joint MoT) variant with TWO full VLMs
- Benchmarks: SimplerEnv 64.5% (>GR00T-N1.6 57.1% +7.4%), RoboCasa 54.6% (>47.6%), LIBERO 97.6%, real-robot ≈ π0.5; ablation: unfreezing Left Brain -7%
- Framework placement: added a "catastrophic-forgetting: three structural solutions" mini-table to `Embodied Brain Models` (KI/π0.5, unified-AR/G0.5, dual-VLM/TwinBrainVLA). Flagged naming caveat: TwinBrain's Left/Right = generalist-vs-specialist VLMs, NOT cloud-brain/edge-cerebellum
- Updated DeepCybo entity (two complementary lines: PhysBrain=data-side, TwinBrainVLA=architecture-side), PhysBrain note (TwinBrainVLA now ingested, not just a marketing term), index Sources, concept-page source-note list
- GitHub repo ZGC-EmbodyAI/TwinBrainVLA = README+assets only (no code), consistent with PhysBrain/G0 pattern

## [2026-06-09] clarify | G0.5 uses NO world model (anti-world-model stance)
- Verified from the G0.5 paper: it contains no world-model component — no future-frame/state prediction, no subgoal-image generation (that's π0.7/BAGEL), no synthetic-data world model (that's GR00T Cosmos/DreamGen). Components are only VQ ActionCodec + in-stream CoT (subtask/bbox/2D-trace/action-hint, all reasoning primitives not future prediction) + visual memory (past history, not future)
- "world action models" appears only as the 3rd baseline family it compares against (cites Fast-WAM, Motus in related work)
- Added a "与 Predictive Spatial / World Model 流派的关系：明确不用" paragraph to the G0.5 note — positions G0.5 as the deliberate opposite of the world-model route, contrasting π0.7 (BAGEL) / GR00T (Cosmos) on the "does a VLA bolt on a world model?" axis

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

## [2026-06-03] ingest | Ω-QVLA: uniform-W4A4 VLA quantization (2nd VLA-quant source) + new `VLA quantization` concept page
- Ingested Ω-QVLA (Wang et al., McGill / Université de Montréal / Mila + BUPT / SJTU / SimpleWay.ai; arXiv:2605.28803, 2026-05-27) — the user's third quantization paper and second VLA-quant source
- Hand-verified against the full PDF (v1, 18 pp; pypdf). Raw: URL-only (Tier 1) — PDF measured 8.12 MB, not committed
- OPEN SOURCE verified REAL (not a landing page): https://github.com/UCMP13753/Omega-QVLA, Apache-2.0 — `gr00t/quantization/` modules + build/merge/eval scripts, weights via HF (contrast: DyQ-VLA released none)
- Method: first training-free PTQ to compress BOTH the LLM backbone AND the entire diffusion DiT action head to UNIFORM W4A4 (no mixed precision), overturning the "DiT action head too sensitive to uniformly quantize" belief. Two parts: (1) composite SVD·Hadamard rotation (SVD flattens weight row-energy; Hadamard diffuses residual activation outliers), block-wise (64) + zigzag weight-norm permutation; (2) per-step DiT activation scale table over T=8 Euler denoising steps. Asymmetric solver: GPTQ on LLM weights, plain RTN on DiT (rotation already flattens DiT weights → GPTQ there injects a harmful calibration bias)
- Models = π0.5 + GR00T N1.5 (both already in vault). Results: W4A4 ≈ FP16 (π0.5 98.0 vs 97.1; GR00T 87.8 vs 87.0), ~71–72% static memory saved; smoother real-world bimanual control (ARX R5) than QuantVLA. NOTE: NO wall-clock latency reported (deferred to kernel support) → cannot be compared to DyQ-VLA on speed
- KEY SYNTHESIS: Ω-QVLA and DyQ-VLA are opposite answers to "does VLA low-bit need mixed precision?", split by action-head architecture — DyQ-VLA (autoregressive OpenVLA) varies the BIT-WIDTH dynamically (route 3); Ω-QVLA (diffusion π0.5/GR00T) keeps UNIFORM W4A4 and varies only the SCALE per denoising step (route 2, rotation/reshaping). Both react to temporal dynamics but draw opposite conclusions
- Created concept page `VLA quantization` (second-source threshold met, as flagged in the prior DyQ-VLA ingest) holding the problem framing (why VLA quant ≠ LLM quant), the DyQ-VLA↔Ω-QVLA contrast table, the route mapping, and the cited landscape (QVLA arXiv:2602.03782, QuantVLA arXiv:2602.20309, SQAP-VLA arXiv:2509.09090, KERV arXiv:2603.01581)
- Updated `Model quantization` (Ω-QVLA under Route 2 = rotation/reshaping; VLA-quant sub-cluster pointer; new subthemes + the "does VLA need mixed precision?" open question) and `90 System/index.md` (Sources + new Concept)
- Cross-links: outbound wikilinks from the new notes to π0.5 / GR00T source notes (backlinks auto-surface in Obsidian); explicit backlinks into those notes deferred to avoid churn
- Transferable nugget recorded in the source note: AdaLayerNorm→per-step-scale — only the attention QKV layers reading the time-conditioned AdaLayerNorm output need per-step scales; plain-LayerNorm MLP paths don't. Candidate general DiT-quantization principle

## [2026-06-03] deepen | Ω-QVLA rotation internals — code + math deep-dive written into the source note
- Multi-turn discussion with Ethan dissecting Ω-QVLA's rotation; clone-read the repo (`UCMP13753/Omega-QVLA`) + worked the algebra. Added a `Method deep-dive — rotation internals` section to the Ω-QVLA source note (5 findings) and two new `What feels limited` bullets
- (1) Activation rotation is **online** (per-forward input perm + block rotation, plus an output "row restore"); only weight-side rotation is folded offline. DiT adds per-step scale dispatch online (T=8 × ~16 blocks). Released code is **fake-quant** (BF16/FP32 `F.linear`, no real INT4 GEMM) → rotation is pure overhead with no speedup; this is the code-level root cause of the paper's missing latency, and SVD (not a fast transform) is structurally hard to amortize vs QuaRot's FHT. Code refs: `gptq_layers.py:590–604/662–678/689–703`, `duquant_layers.py:591–600/635–648`, `dit_step_context.py`
- (2) Row energy depends only on U and σ because `WWᵀ = UΣ²Uᵀ` (V cancels via `VᵀV=I`); `‖w_i‖²=Σ_k σ_k² u_ik²` = diagonal of the Gram, and `σ_k²` are literally its eigenvalues. V drops out because right-mult by orthogonal Vᵀ is an isometry (preserves row length). After rotation `‖w̃_i‖²=σ_i²` (de-mixed, but spectrum still skewed)
- (3) Per-channel quant optimizes **crest factor** `max/rms` (`SQNR ∝ (rms/max)²`), not energy. Energy = the rms reference; SVD balances energy (necessary, not sufficient), Hadamard converts balanced L2 → low L∞ via `‖zH‖∞≤‖z‖₂/√n`. The paper *needing* Hadamard is the implicit admission energy alone is insufficient
- (4) **Incoherence, not orthogonality**, spreads the max: spike test → peak = `max_j|R_ij|`; Hadamard `=1/√n` guaranteed, SVD's U can `≈1` (no guarantee; U is the *least* incoherent / data-aligned rotation). Division of labor: SVD wins weights (26→6 vs H 19), Hadamard wins activations (20→1.6 vs SVD 17). **Ablation gap caught**: no Hadamard-only (SVD-removed) end-to-end row → SVD's necessity unproven (QuaRot/SpinQuant work with Hadamard/learned rotation alone)
- (5) **Figure 2 transpose trap**: input-axis orthogonal rotation **preserves** per-output-channel L2 norm, so Fig 2's changing "row norm" is NOT output-channel L2 norm — it's per-**input**-channel norm (code: `weight energy = mean(W²,axis=0)` over outputs, `plot_outlier_flow_3d.py:73`; text `σ_i²` = input channel). Text uses `[Cin,Cout]` (row=input ch), code/figures use `[out,in]` (row=output ch) → "row" flips meaning. Per-output-channel quant benefits via the "vertical stripe" mechanism (heavy input channel inflates every output channel's max → SVD+Hadamard lower the max, not the L2)
- No new pages; durable analysis filed into the existing source note. Temp clone removed after the dive

## [2026-06-03] deepen | Ω-QVLA DiT per-step activation quant — deep-dive findings (6)–(7)
- Continued the discussion into DiT activation quantization; extended the Ω-QVLA source note's `Method deep-dive` from 5 → 7 findings (renamed section from "rotation internals" since it now also covers DiT quant) + extended the latency `What feels limited` bullet
- (6) DiT activations are quantized **per-step × per-channel, offline-calibrated** (not per-token): `∆_{ℓ,t,j}=σ̂(X'_{t,:,j})/qmax`, retrieved by step index (`dit_step_context.py`). The two axes mirror **AdaLayerNorm**: `γ(τ),β(τ)` predicted from the timestep → per-channel (vector) × per-step (function of τ); drift localizes to post-adaLN QKV (App A.6, ~15–20% monotonic q999 drift), MLP path flat (its pre-norm is plain LN). Input genuinely differs each step (shared obs conditioning + changing action iterate x_τ + τ → γ(τ)). Why static-per-channel ≻ dynamic-per-token: (A) per-channel divides out the known γ_j(τ) structure, per-token is dominated by each token's biggest channel (wastes range on small-γ channels); (B) calibrated robust-peak clips spikes + deterministic (closed-loop) + stable on short action seqs. Trade: per-token factors out of matmul + needs no calib → per-channel is accuracy-over-deployability
- (7) The real cost is **not** the lookup (~free O(1) index; cheaper than per-token's runtime reduction) nor the per-channel multiply (same element-wise op as per-token) — it's that a per-channel **activation** scale sits on the contraction axis and **doesn't factor out of the matmul**: either dequant activations to FP (lose INT speedup) or fold per-step into weights (8× weights). SmoothQuant's per-channel scale is *static* → folds offline once (free); Ω-QVLA's is per-step → can't → more deployment-hostile than the lineage it extends. Moot in the released fake-quant code (BF16 matmul, no INT GEMM)
- Still no new pages; all filed into the existing source note

## [2026-06-03] ingest | QuantVLA (3rd VLA-quant source; Ω-QVLA's baseline) — completes a 3-way VLA-quant cluster
- Ingested QuantVLA (Zhang et al., Ohio State / Michigan / CityU HK; **CVPR 2026**; arXiv:2602.20309) at user request — it is Ω-QVLA's main baseline. Hand-verified against the full PDF (v4, 13pp incl. App A–G; pypdf). Raw: URL-only (Tier 1, PDF 3.99 MB)
- Open source verified real: https://github.com/AIoT-MLSys-Lab/QuantVLA (Apache-2.0, `gr00t/` quant code, 34★). **Disambiguation recorded: QuantVLA (Zhang, CVPR, scale-calibrated) ≠ QVLA (Xu, ICLR 2026, arXiv:2602.03782, per-channel)** — different papers, both Feb 2026. (Author Haokun Lin is DuQuant's first author.)
- Method: training-free, DuQuant-based rotation PTQ. (1) selective layout — integerize all LLM linear + all DiT MLP, KEEP DiT attention Q,K,V,O FP16 (preserve integer-GEMM operator schedule); (2) ATM (per-head α matching teacher/student logit Std → fixes softmax temperature √d/(s_q s_k)); (3) OHB (per-layer β matching output RMS → fixes residual energy s_v s_o). ATM/OHB folded into dequant scales → no new ops, no extra GEMM. Analytic contribution: first-order error-propagation account of DiT fragility
- Results (W4A8, LIBERO): π0.5 97.6% / 1.28 GB / 70% (> FP16 97.1%); GR00T N1.5 88.0% / 0.91 GB / 55% (> FP16 86.5%); also W4A4 π0.5 95.3%. Beats FP16. **Memory + accuracy only — NO wall-clock latency**, but designed for **real integer GEMMs** (unlike Ω-QVLA's fake-quant)
- KEY SYNTHESIS: QuantVLA + Ω-QVLA = a matched pair (same DuQuant lineage, same π0.5/GR00T, opposite bets) — QuantVLA keeps DiT attention FP16 + real int GEMM (conservative/deployable), Ω-QVLA quantizes it uniformly W4A4 (aggressive/fake-quant). "First" claims reconcile by granularity (DiT MLP vs whole DiT incl. attention). Neither reports latency, only DyQ-VLA does → latency is the cluster's systematically missing number. Three lenses on one fragile locus: QuantVLA temperature+residual-energy / Ω-QVLA AdaLayerNorm-QKV / DyQ-VLA fine-manipulation spike
- Upgraded `VLA quantization` to a **3-way** landscape (QuantVLA + 3-way table + "fragile locus" section + QuantVLA≠QVLA disambiguation); updated `Model quantization` (QuantVLA under Route 2; within-route DiT-attention disagreement) + `index.md` Sources. DuQuant flagged as candidate stub (now underpins 2 sources). Temp clone/PDF cleaned

## [2026-06-03] ingest | DuQuant (rotation-PTQ foundation of the VLA-quant cluster)
- Ingested DuQuant (Lin et al.; UCAS / Tsinghua / CASIA / CityU HK / ZJU; **NeurIPS 2024 Oral**; arXiv:2406.01721) at user request — the rotation-based W4A4 **LLM** quant method both QuantVLA and Ω-QVLA reparam over (QuantVLA shares its first author Haokun Lin). Hand-verified against the full PDF (v3, 29pp; pypdf). Raw: URL-only (Tier 1, PDF 22.86 MB — largest yet, not committed)
- Open source verified real: https://github.com/Hsu1023/DuQuant (MIT, `quantize/` + `get_rot.py`, 180★; DuQuant++ follow-up announced Apr 2026)
- Method: "dual transformation" = per-channel smoothing Λ + greedy **data-aware** block-diagonal rotation R̂(1) (uses outlier dims as prior; ≠ QuaRot's random Hadamard) + **zigzag permutation** P (balances inter-block variance, Thm 2) + 2nd rotation R̂(2); G=ΛR̂(1)PR̂(2) folded with G⁻¹ into weights. Per-token act / per-channel weight; RTN, no GPTQ. Two theorems (within-block max ↓; zigzag bounds per-block mean)
- KEY: first to localize **"massive outliers" at the FFN down-projection input** (few tokens, ~1000× the median) vs the long-known "normal outliers" — this is the **origin of Ω-QVLA's pathological `LLM.L02.down_proj` finding**. SmoothQuant fails on massive outliers (smoothing factor → new weight outliers)
- Results: SOTA W4A4 (LLaMA2-7B 6.28 PPL vs FP16 5.47, SmoothQuant 83); +5–10% QA over Atom; LLaMA3-8B robust (8.56 vs SmoothQuant 210). vs QuaRot: DuQuant-RTN ≈ QuaRot-GPTQ (skips GPTQ). **Reports REAL speedup** (2.08× prefill, 3.5× decode-mem, real W4A4 kernel; quantizes 7B in 50s) — notable that the LLM root reports latency while its VLA descendants don't
- Connections recorded in the source note: (a) DuQuant = the "orthogonal rotation + diagonal scaling" well-conditioned recipe from the κ(R) discussion; (b) greedy data-aware rotation = data-aware end vs QuaRot's data-independent Hadamard (same SVD-vs-Hadamard axis); (c) block-64 + zigzag is exactly what QuantVLA/Ω-QVLA inherit
- Updated `Model quantization` (DuQuant under Route 2 Sources + Route-2 narrative + Related) and `VLA quantization` (DuQuant linked as the ingested shared ancestor across taxonomy/landscape/related) + `index.md` Sources. Flagged QuaRot (arXiv:2404.00456) as the natural next ingest + a possible `Rotation-based quantization` concept page. Temp PDF/text cleaned

## [2026-06-13] ingest | Motus: A Unified Latent Action World Model (Tsinghua TSAIL × Horizon Robotics)
- Created source note `Bi et al. - Motus A Unified Latent Action World Model` (arXiv:2512.13030, v2 2025-12-25). Verified via arXiv abstract + HTML method/results sections (no PDF committed; URL-only Tier 1). Followed several multi-turn discussion turns on VLA inference data-flow / graph compilation / world-model-at-inference that set up this ingest
- Core: a unified **latent-action world model** that packs three experts — understanding (**Qwen3-VL-2B**) + video generation (**Wan 2.2 5B**) + action (flow-matching, AdaLN) — into one **MoT / 范式 A joint attention** ("Tri-model Joint Attention", shared MHSA). A **UniDiffuser-style per-modality timestep scheduler** turns one weight set into **5 switchable inference modes**: VLA / World Model / IDM / VGM / Joint Prediction
- Latent actions from **optical flow** (pixel-level "delta action"); **six-layer data pyramid** (web → egocentric human video → synthetic → task-agnostic → multi-robot → target-robot, quantity↓ quality↑) + **three-stage training** (VGM-only → unified w/ latent actions → SFT w/ real actions)
- Benchmarks (self-reported): RoboTwin 2.0 88.66% (+45% vs π0.5, +15% vs X-VLA); LIBERO-Long 97.6 (=X-VLA SOTA); real AC-One 63.22% vs π0.5 14.79%, Agilex-Aloha-2 59.30% vs 48.60%; +11~48% across real tasks. **No wall-clock/latency** (10 flow-matching steps stated). Open source: project page only (motus-robotics.github.io/motus), no code/weights located → treated as not-open
- KEY FRAMINGS recorded: (a) Motus makes "world model at inference" a **runtime knob** — a third path beyond train-time-only (GigaWorld/FLARE) and latent-compression (VPP/DreamVLA); (b) **structural rhyme with TwinBrainVLA** — both 3-transformer MoT joint attention, third slot = video generator (Motus) vs 2nd VLM (TwinBrain) → 范式 A's MoE slot is becoming a pluggable expansion socket; (c) vs GigaWorld-Policy: same "drop video at inference" goal, opposite mechanism (Motus timestep-mode-switching + bidirectional joint attention vs GigaWorld causal-mask hard-isolation + fixed drop); (d) vs G0.5: clean opposites on the world-model axis, yet both use latent/VQ-ish action tokens
- OPEN deployment question logged (no code/latency to resolve): in VLA mode, does the 5B video expert still run forward (tokens in joint attention) though video isn't denoised? Decides edge-deployability
- CORRECTION to `World-Action Models`: it had Motus mis-listed as "1st-gen Bidirectional (must generate video at inference)". Verified against the paper → Motus is **mode-switchable (VLA mode skips video)**; reworked the page's architecture-evolution into 4 generations (added "第四代: Mode-Switchable / 统一时间步调度"), wikilinked Motus + GigaWorld, added an explicit 修正记录 note
- Wiki updates: `Embodied Brain Models` (MoT "pluggable slot" note in 范式 A; Motus added to the latent-action synthesis candidate + a new "world-model-at-inference 4-tier" synthesis candidate); `World-Action Models` (4-gen rework + comparison-table + Related); wikilinked Motus in the G0.5 baseline reference; `index.md` Sources
- Horizon Robotics 地平线 flagged as a candidate entity page (not created — measured incremental maintenance; Motus is Tsinghua-led, Horizon is co-author)
- NOTE (pre-existing log quirk, not fixed): the [2026-06-03] quant-cluster block physically sits *after* the [2026-06-09] TwinBrainVLA/G0.5 entries (parallel work streams merged out of date order). Left as-is to avoid churn; candidate lint task if a chronological pass is wanted

## [2026-06-13] ingest | Kairos 3.0-4B (ACE Robotics) — edge generative video world model, NO PAPER, code-verified
- User request: add "Kairos 3.0 4B world model" + find its paper (gave GitHub kairos-agi/kairos-sensenova, couldn't find a paper)
- PAPER SEARCH RESULT: **no paper / no arXiv / no technical report exists** (as of 2026-06-13). Verified via: README "📑 Paper" badge = empty placeholder; arXiv search twice (general + arxiv.org-restricted) → nothing titled Kairos; 2026-03 launch press explicitly states no academic paper; June re-search found only reprints of the March press. → architecture verified directly from open code instead
- ORG puzzle resolved: **ACE Robotics (Shanghai), founded by Wang Xiaogang 王晓刚 = SenseTime co-founder** → repo/weights named `sensenova` (SenseTime/SenseNova lineage); GitHub org `kairos-agi` = "Kairos Team". Released 2026-03-13, Apache-2.0
- CODE-VERIFIED architecture (kairos_4b_config.py + kairos_dit.py): `KairosDiT` = video diffusion transformer, dim 2560 / 32 layers / 20 heads / ffn 10240, flow-matching, Conv3d patch [1,2,2]. **Hybrid linear attention CONFIRMED**: `use_linear_attns=[(i+1)%4==0...]` → every 4th layer GatedDeltaNet (FLA lib, chunked) + 3/4 full softmax = 1:3, 25% linear (this is the "custom hybrid linear attention operator"). VAE = Wan2.1; text encoder = Qwen2.5-VL-7B-AWQ; modes T2V/I2V/TI2V; edge variant via DMD (Distribution Matching Distillation)
- **KEY FINDING (verify-don't-assume)**: open release is a **pure video generator — NO action head, NO proprioceptive input, NO policy output** (Head outputs only video latents). PR's "unified understanding-generation-PREDICTION / action prediction / closed-loop control" is NOT in the open code → recorded the PR-vs-code gap explicitly; Kairos open = only the "world model" half of a WAM, action (if any) is external/unreleased
- Created source note `ACE Robotics - Kairos 3.0 a Real-Time Generative Video World Model` (separates code-verified facts / vendor-reported benchmarks / unverified action claims) + entity page `ACE Robotics`
- Wiki: `Embodied Brain Models` pixel-level WM row — added Kairos + softened the "云脑 imagination，不适合下端" claim (Kairos's 4B+linear-attn+DMD is an explicit edge-real-time attempt, to be reproduced); `World-Action Models` — added a "video WM ≠ WAM" boundary note (Cosmos/Kairos = the WM half only); index Sources + Entities
- Positioning recorded: vs NVIDIA Cosmos (explicit rival, "72× faster", DreamGen Bench); vs Motus (shared Wan+Qwen+flow-matching stack, opposite bet — Motus integrates an action expert, Kairos drops action for edge real-time)
- Benchmarks logged as vendor-reported only (PAI-Bench 80.03, WorldModelBench 8.94, VideoPHY 45.55; "1.5× real-time on Jetson Thor T5000"; 480P 11.7s/23.5GB on 1 A800) — no third-party reproduction, no paper
- Notable: a **real** open-source (code+weights, Apache-2.0) — the positive exception to the usual "PR-only / project-page-only" pattern in the China embodied cluster

## [2026-06-13] deepen | Kairos component relationship + DMD distillation (filed into the source note)
- Q from Ethan: how do the "4B" and Wan2.1 VAE + Qwen2.5-VL-7B + flow-matching relate, and what is DMD distillation? Added two subsections to the Kairos source note
- Component relationship: clarified the standard latent-video-diffusion stack — **"4B" = KairosDiT (the denoiser) ONLY**; Qwen2.5-VL-7B (text/MM encoder, frozen, 7B) and Wan2.1 VAE (pixel↔latent codec, frozen) are external/borrowed and NOT counted in the 4B; flow-matching is the DiT's generation math. SD/Flux-analogous. The "Wan video VAE + Qwen-VL + flow-matching" stack = a shared substrate with Motus (de-risks reading either note's size claims)
- DMD = Distribution Matching Distillation (Yin et al., MIT/Adobe, CVPR 2024; DMD2 follow-up): step-distillation (collapse ~30-step sampling to 1-4 steps, SAME params) via KL(student‖data) whose gradient = real-score(frozen teacher) − fake-score(online aux model), GAN-like. Distinguished from the vault's methodology-axis "Distillation 大模型→小模型" — that's SIZE distillation, DMD is STEP distillation (orthogonal). Kairos's edge trio = linear attention (per-step compute) × DMD (step count) × 4B (params), each cutting one multiplicative factor
- Honesty caveat recorded: DMD usage confirmed from filenames; DMD1-vs-2 / exact step count not line-verified. No new pages; deepened the existing source note only

## [2026-06-23] deepen | DuQuant rotation construction & relationship to QuaRot (filed into the source note)
- Multi-turn discussion with Ethan on *how* DuQuant builds its rotation R̃ (Eq. 2) and why it is not a Hadamard; added a `Rotation construction & relationship to QuaRot` section (6 points) to the DuQuant source note
- (1) **Right-mult row↔column duality**: X→XR̃, input column j fans out via ROW j of R̃; the outlier is swapped to col 1 (E_{d(1)}) → its fan-out is governed by R̃'s **first row**. (2) **Flat first row** spreads the col-1 outlier evenly → peak ↓ from |outlier| to |outlier|/√n (flat = L∞-minimal unit vector = optimal spreader for a spike). (3) **"uniform(flat)" ≠ "random orthonormal"**: both unit-norm, but flat = all |entries|=1/√n vs random = uneven (Haar max entry ~√(2 ln n)/√n, has peaks); the paper's "uniformly distributed" first row means flat, NOT uniformly-random
- (4) **Other rows = general random-orthogonal** because the non-outlier cols need no structure + randomness is robust (no fixed-structure adversarial alignment — exactly why QuaRot itself randomizes Hadamard) + fits the greedy scheme. HONEST SCOPING: DuQuant's win over QuaRot = the **data-aware flat-first-row + greedy targeting**, NOT random-vs-Hadamard (that completion is low-stakes). (5) **Hadamard boundary (all-or-nothing)**: flat first + flat orthogonal rest ≡ a (randomized) Hadamard (= QuaRot, by definition; orthogonality couples the rows); DuQuant = one flat row + random-orthogonal (uneven) rest ≠ Hadamard; flatten the rest → it collapses to QuaRot. (6) **Online cost**: both DuQuant & QuaRot rotate online (only Λ, G⁻¹ folded offline); DuQuant's ~8.9–9.3% ("Perm 1") amortizes into ~2.08× via a real W4A4 kernel, vs Ω-QVLA's same online rotation but fake-quant → pure overhead
- No new pages; durable analysis filed into the existing DuQuant source note (same pattern as the prior Ω-QVLA deep-dive). Dated 2026-06-23 per the append-only convention (after the 06-13 Motus/Kairos entries)

## [2026-06-13] lint | Embodied cluster optimization pass (audit → 4 fixes)
- Ethan asked "what can be optimized in the embodied cluster?" Ran a 2-agent parallel audit (structure/link-graph + content staleness), verified the high-value findings by hand (corrected one agent false-positive: table `[[X\|alias]]` backslashes are correct pipe-escapes, NOT broken links), then executed the four selected fixes
- FIX 1 (link hygiene): renamed `03 Wiki/Entities/Physical Intelligence.md` → `Physical Intelligence (π).md` via git mv — resolves ~8-13 dangling `[[Physical Intelligence (π)]]` links (the flagship-lab entity was unreachable due to filename mismatch; the whole vault incl. index refers to it WITH the π). Source-note links `[[Physical Intelligence - pi0...]]` are different files, unaffected. One archival `[[Physical Intelligence]]` (no π) in log.md left as-is (append-only history)
- FIX 2 (orphan): `Memory in Embodied AI` concept page existed but was absent from index.md → added to index Concepts (was undiscoverable)
- FIX 3 (biggest structural gap): created `03 Wiki/Concepts/Embodied Cerebellum Models` — the counterpart to Embodied Brain Models (the brain/cerebellum framing previously had only the brain half). Pulls together the scattered cerebellum material: the multi-rate control stack (50Hz VLA → 1kHz impedance/IK → 40kHz PD/FOC "spinal" floor; learning boundary stops above PD), four cerebellum forms (VLA-expert-downstreamed / native fast-head Helix S1 / edge world model Kairos / classical control), edge-deploy tech (size+step distillation, VLA quantization, hybrid linear attention, AOT graph compilation, action chunking+RTC), dependability scaffolding, edge procedural memory. Dropped the "（待建）" markers in Embodied Brain Models now that it exists
- FIX 4a (navigation): created `04 Maps/Embodied AI - VLAs, world models, and cerebellum` — the embodied cluster's first MOC (counterpart to the agent-memory map); the cluster is the vault's largest (20 sources) but had no nav hub. Entry points + narrative spine + themes + suggested additions
- FIX 4b (freshness): in Embodied Brain Models 前瞻预判 — marked two predictions as overtaken by ingested evidence: "World model + VLA 嫁接 (π0.7+BAGEL)" → 已确认 2026 (π0.7/Motus/GigaWorld/Kairos); "蒸馏 1-3B VLM 大脑" → 部分兑现 (Gemma 2-3B/Qwen3.5-2B/Qwen3-VL-4B). Refined the Kairos pixel-level-WM row to note the open release has no action head (only partial validation of edge-WAM viability)
- Updated index.md (2 new concepts + 1 new map) + this log. Audit also surfaced a known backlog (person pages Levine/Finn, academic baselines OpenVLA/RT-2/Cosmos, 2 synthesis candidates) — left for user direction
- Meta-finding: source→wiki integration is excellent (zero orphan sources); the lag was in the connective layer (cerebellum page, MOC) and the forward-looking layer (stale predictions) — ingest outran synthesis. This pass closed that gap

## [2026-06-16] ingest | NeuroVLA (HKUST-GZ × AI2 Robotics) — brain-inspired neuromorphic cortex/cerebellum/spinal VLA
- User request: ingest arXiv:2601.14628. Post-cutoff (v1 2026-01-21), verified from arXiv abstract + HTML + GitHub (no assumptions)
- Identity: **NeuroVLA** — "A Brain-inspired Embodied Intelligence for Fluid and Fast Reflexive Robotics Control", Guo et al., **HKUST-GZ (Hui Xiong) + AI2 Robotics (Shenzhen, Yandong Guo)**, cs.RO/cs.AI
- Open-source VERIFIED REAL: https://github.com/guoweiyu/NeuroVLA (Python, 258★, ~53MB, NeuroVLA/ pkg + deployment/ + scripts/ — not a project page)
- Architecture (verified v1 + code exists): three bio-inspired layers — **Cortex** = Qwen-VL + Layer-wise Q-Former → semantic latent (~10Hz, CUDA tier); **Cerebellum** = GRU (proprio state) + Gated FiLM (gain), 200Hz wrench/joint feedback, K=2 recurrence → stabilizes "intention tremor" (jerk −75.6%); **Spinal** = **SNN** (LIF, Deep Spiking Residual, "Continuous Integration Protocol" → smooth continuous actions) on a **customized neuromorphic FPGA** (LIF systolic-array, 20MHz, 2.19ms, 0.87mJ/inf, 0.4W). Safety reflex <20ms via "vestibulocerebellar loop" (wrench → cerebellar-spinal local correction, bypassing cortex). Temporal memory = SNN membrane potential (stateful LIF) + cerebellar GRU. SNN trained via surrogate gradient
- Benchmarks: beats OpenVLA/-OFT/UniVLA/WorldVLA on LIBERO/LIBERO-Plus + real bimanual humanoid; jerk −75.6%, accel −32.8~58%, collision recovery 54.8% (vs 0% baselines). "First neuromorphic VLA on real robots" = self-claim, logged as such
- PRECISION CALLS (verify-don't-assume): (a) the "neuromorphic" core is the **spinal SNN only**; the cerebellum is GRU+FiLM (conventional, stateful), not an SNN — did NOT over-claim "all-SNN". (b) NeuroVLA's cortex/cerebellum/spinal = **bio-structural + compute-substrate (CUDA vs neuromorphic-chip) axis, all on-board** — recorded the explicit caveat that this ≠ the vault's deployment-driven 大脑(cloud)/小脑(edge)/脊髓(classical MCU) axis (cf. TwinBrain left/right ≠ cloud/edge)
- Framework impact: (1) independent **corroboration** of the just-built [[Embodied Cerebellum Models]] three-layer functional decomposition; (2) **challenges** that page's "learning stops above PD / spinal stays classical" claim — NeuroVLA puts a LEARNED SNN in the <20ms reflex layer → softened to "boundary now descends to the reflex sub-layer; kHz FOC likely still classical"; (3) adds **neuromorphic/SNN as a new edge-efficiency route parallel to [[VLA quantization]]**; (4) adds a **third implicit-memory flavor** (runtime stateful membrane/hidden-state memory, ≠ weight-baked, ≠ retrieval) to [[Memory in Embodied AI]]
- Created source note `Guo et al. - NeuroVLA Brain-inspired Neuromorphic Cortex-Cerebellum-Spinal VLA` + entity `AI2 Robotics` (郭彦东/深圳; HKUST-GZ Hui Xiong as待补充 academic side). Updated Embodied Cerebellum Models (3 edits), Memory in Embodied AI (2), the embodied MOC, index (Sources + Entities)

## [2026-06-16] correct | NeuroVLA benchmark framing (Ethan caught the overstatement)
- Ethan questioned whether NeuroVLA uses standard sim benchmarks (LIBERO/RoboTwin) or its own designed tasks. Re-read the experiments section (HTML, enumerated all figures/tables) → he was right; my initial note overstated it
- VERIFIED: NeuroVLA reports **NO standard success-rate leaderboard table**. (a) The OpenVLA/-OFT/UniVLA/WorldVLA comparison is a **qualitative bar chart (Fig 8a–e) with no printed numbers** — "consistently outperforms" is unquantified. (b) LIBERO appears **only in an internal ablation (Fig 5d)** comparing NeuroVLA's own SNN variants, NOT external baselines. (c) RoboTwin is NOT used at all (that was Motus). (d) All headline numbers are **custom metrics on self-designed real-robot lab tasks**: MACJ jerk −75.6%, MACA accel, "Recover to Safe Area" recovery 54.8% vs 0%, FPGA energy 0.4W, <20ms reflex, "shake the cup" rhythmic memory
- Framing: this is partly a deliberate stance (they evaluate emergent "biological motor characteristics", not leaderboard SR) and partly a rigor gap (no numeric SOTA comparison)
- Fixed: source-note Benchmark row rewritten + added a "评测设计（用户核查后修正）" section; softened the index Sources line (removed "beats OpenVLA/..."). Demonstrates the vault's verify-don't-assume norm catching a same-session overstatement

## [2026-06-17] deepen | NeuroVLA cerebellar-function coverage — equation-level verification of ③④
- Ethan asked to read the methods EQUATIONS to settle two hedged points from the cerebellum-function discussion: ③ sensory cancellation / reafference suppression, ④ precise timing. Downloaded the PDF to a repo-external temp (22.6MB, NOT committed per raw-tier rule), extracted text via pypdf, read §4.3–4.4 + results §2.3 directly
- FINDINGS (equation-grounded): two functions are STRONGER than my earlier "神似" estimate, two confirmed absent:
  - ✅ Gain control: Gated FiLM z_mod=(1+γ)⊙(z_sem·g)+β, γ/β/g learned fns of h_t=GRU(state history) (§4.3.2)
  - ✅ Forward internal model: EXPLICIT K=2 Iterative Refinement z_mod^(k+1)←Refine(z_mod^(k),s_{t+1}), called "mental simulation", used to pre-compensate gravity/friction (§4.3.3) — upgraded from "◐神似" to "✅explicit"
  - ✅ Efference-copy FRAMING is explicit in the paper (z_sem=efference copy, h_t=re-afference, FiLM="sensory prediction error", §4.3.3 Biological Insight) — corrects my prior over-hedge
  - ③ ❌ reafference CANCELLATION: NOT implemented. No explicit (predicted − measured) force subtraction; γ/β/g are learned fns of RAW h_t; collision = "spike in h_t" (raw 6D wrench), not a residual. Self vs external forces not explicitly separated → self-motion could false-trigger. (Has a forward model, but uses it for feedforward pre-comp, not feedback cancellation.)
  - ④ ❌ explicit TIMING: only rhythmicity/phase-consistency (Shake-the-cup sinusoidal cycles, §2.3) + temporal working memory (LIF membrane u[τ]=βu[τ−1]+…, §4.4.1) — both EMERGENT from recurrent membrane dynamics, NOT explicit interval/event timing (no clock, no eyeblink-style predictive timing, no burst timing)
  - Systematic gap CONFIRMED + author-acknowledged: discussion states learning is offline behavior cloning, names online STDP as future work for fatigue/wear adaptation → no VOR-style online recalibration. Gaps cluster on the LEARNING side (missing deployment-time error loop; biology's climbing fiber has no analog here)
- Added a "小脑功能覆盖度（方程级核实，确认 ③④）" section to the NeuroVLA source note. Temp PDF removed after the read

## [2026-06-23] maintenance | AGENTS.md — "Reading source material" procedure + Windows PDF toolchain
- Set up & verified the Windows PDF-reading toolchain (the Read tool's native `pdftoppm` rendering had been broken): installed **pdfplumber** (structured tables) + official prebuilt **poppler-windows v26.02.0** (`pdftoppm`, added to User PATH) ; confirmed `pdftotext -layout`, PyMuPDF/`fitz`, `pypdf`, `tesseract`. ⚠️ choco's `poppler` package is a dud (ships source code only, no `.exe`) → used the `oschwartz10612/poppler-windows` release instead. Native `Read` PDF rendering works after a session restart (PATH refresh); tesseract too
- Codified the procedure into AGENTS.md as a new **"Reading source material"** section: (1) source-format priority **LaTeX/e-print > HTML > rendered images > extracted text > summarizer**; (2) per-need method map (tables→pdfplumber, equations→LaTeX/HTML, figures→render, scanned→tesseract, CJK→render-to-image); (3) reliability discipline — summarizers not authoritative for exact facts, read the primary source yourself, mark confidence by method, confirm a quantitative table exists before recording a comparative claim. Cross-referenced from Ingest workflow step 1
- Motivated by this session's NeuroVLA benchmark overstatement (a summarizer's "outperforms OpenVLA" hid that there was no quantitative table) — the rule operationalizes the verify-don't-assume norm at the source-reading layer

## [2026-06-23] synthesis | Cloud-edge co-evolving embodied agent — framework archived (brainstormed with Ethan)
- Long multi-turn brainstorm (used the brainstorming skill) co-designing a **cloud-edge continuous co-evolution framework** for embodied agents, then archived it as a Synthesis. Two files:
  - `03 Wiki/Syntheses/Cloud-edge co-evolving embodied agent - a continuous-evolution framework` — the framework
  - `03 Wiki/Syntheses/Cloud-edge co-evolving embodied agent - figures and evidence` — verified-data table (with sources) + 5 reconstructable SVG figures
- Framework content: **two core problems** (Ethan's framing — ① edge inference-vs-continuous-learning compute contention; ② personalization scenario diversity → cross-scenario co-evolution); reframe = "keep learning alive under embodied deployment constraints, not 'how to learn'". **Symmetric bridge + two asymmetric engines**; **B = modular independent experts**; edge **3 categories (学得好/稳/协同) + ports (hexagonal/HAL-redeploy-network-runtime)**; cloud **4 categories** (continual-learning / fleet-aggregation / skill-factory+governance / collaboration); the **evolution interface** under B (no weight push — capability registry + contract co-versioning + gap-signaling); **four key technologies (2+2 matrix)**: T1 efficient on-device self-evolution (LoRA+CLS+DMD+DSA), T2 safe self-evolution (Simplex + gates + classical floor), T3 modular federated co-evolution, T4 capability-registry + contract co-versioning
- Evidence (honesty-graded): core① hard data (Thor/Orin per-precision compute+bandwidth, training 8× memory, NVIDIA three-computer = Thor inference-only, TinyML/LoRA) — with the **honest correction** that for 2B/128GB memory FITS → real bottleneck is real-time compute contention + power + throughput (so the primary figure is contention→latency, not memory overflow; memory-overflow figure deprecated to a conditional footnote). core② is structural/scaling (siloed-vs-collaborative topology + linear-vs-sublinear cost), labeled conceptual not measured
- Figures verified during the session via the visualize tool; archived as fenced SVG (host-injected classes — re-render by pasting back into show_widget). Several numbers labeled 示意 (illustrative typical magnitudes) vs 已核实 (cited) — distinction preserved
- Cross-linked from `index.md` (Syntheses), the embodied MOC (`04 Maps/...`), and `Embodied Cerebellum Models` (Related). Outbound links to Embodied Brain/Cerebellum Models, Home robot architecture, VLA quantization, Memory in Embodied AI, NeuroVLA, Kairos, π0.6, GO-1/Motus, NVIDIA
- Follow-up: added figures for **T3 (modular federated co-evolution)** and **T4 (capability registry + contract co-versioning)** to the figures companion (now 7 reconstructable SVGs); updated index + MOC counts (5 → 7)
- Follow-up 2 (per Ethan, for future readability): converted all 7 figures from host-class ```svg code blocks → **self-contained `.svg` files** in `03 Wiki/Syntheses/assets/` (inline `<style>` defining the c-*/t/ts/th classes + light bg + concrete font/colors replacing `var(--*)`), embedded via `![[…]]` so they **display directly in Obsidian** yet stay editable vector text. Replaced the code blocks with embeds; updated the companion's intro. Decision recorded: keep only the viewable self-contained .svg (NOT PNG — vector stays editable/diffable), with data table + sources as searchable text

## [2026-06-23] verify + maintenance | Source-reading toolchain: native PDF Read confirmed (+ correction), Chinese OCR added, AGENTS.md hardened
- VERIFIED the prior entry's native-`Read` claim, with a CORRECTION: it works only after a **full Claude app restart**, NOT a mere new chat / "session restart". A new session reuses the same harness process, which keeps its original environment block, so the User-PATH poppler entry is not inherited and `Read` keeps failing with `pdftoppm failed: Command 'pdftoppm' not found`. After fully quitting + reopening the app, native rendering works (confirmed by `Read`-ing MemPO & ReKep page 1). Supersedes the prior "works after a session restart (PATH refresh)" wording
- Chinese OCR gap found + fixed: the prior "confirmed tesseract" covered only the binary — its tessdata had **English only** (`eng`/`osd`), so CJK scans would OCR to garbage. The default tessdata (under `C:\Program Files`) is not user-writable, so installed `chi_sim`/`chi_tra` (+ copied `eng`/`osd` for a complete set) to **`%LOCALAPPDATA%\tessdata`**; invoke via `tesseract --tessdata-dir "$env:LOCALAPPDATA\tessdata" -l chi_sim+eng` (verified via `--list-langs`). Chose `--tessdata-dir` over `TESSDATA_PREFIX` (version-ambiguous + would need a process restart to inherit)
- Hardened the AGENTS.md "Reading source material" section: (1) the Scanned/OCR line now documents the Chinese `--tessdata-dir` invocation (the default install is English-only); (2) added a recovery bullet — a tool reporting *not found* despite being installed is a harness-process-**PATH** issue, not a missing install → fully restart the Claude app, don't reinstall. Re-verified the rest of the toolchain is genuinely present (pdfplumber / pypdf / PyMuPDF / poppler / tesseract)

## [2026-06-23] asset | Interactive HiF8/FP8 value-density visualization
- Created `assets/hif8_value_density.html` — standalone, self-contained (no CDN, works offline) interactive stepped chart: representable values per **octave (binade)** on a log₂ axis for HiF8 vs FP8-E4M3 / E5M2. Each format's precision-change boundaries are labelled on the x-axis (coloured per-format rows); hover any octave to read its actual representable values. Data enumerated from all 256 codes → exact, including the top-octave dips (E4M3 7/oct at 2⁸ = NaN code; HiF8 1/oct at 2¹⁵ = Inf code). Conveys "same 8-bit budget, spent differently": HiF8 tapered 8→1, E4M3 flat-dense-narrow, E5M2 flat-coarse-wide
- Established `assets/` as the vault's folder for non-markdown attachments (none existed; Obsidian had no attachment folder configured → defaulted to root)
- Linked from [[Ascend HiFloat8 Format for Deep Learning]] (new Visualization section) and [[Model quantization]] (Figures entry under route 1, representation design)
- Origin: generated this session while reading the HiF8 paper (arXiv:2409.16626) via the now-working native PDF Read; exercised the value-density discussion (per-octave density as the readable alternative to a representable-value ruler)

## [2026-06-23] maintenance | HiF8 arXiv PDF backfill (small + important)
- Backfilled `01 Raw/2026-04-13 - Luo et al. - Ascend HiFloat8 Format for Deep Learning.pdf` (arXiv:2409.16626 **v2**, 0.72 MB) — the HiF8 raw note had been URL-only (Tier 1). Kept per the `01 Raw/` rule ("preserve a local copy when small and important"): HiF8 anchors the [[Model quantization]] cluster, and committing it freezes the exact version the source note + deepened analysis + value-density viz are based on. Mirrors the earlier MemPO PDF backfill; consistent with the ReKep PDF already kept
- Added local-PDF wikilinks to the raw note and the [[Ascend HiFloat8 Format for Deep Learning]] source note

## [2026-06-25] asset | Two-axis functional-evolution trend figure → Embodied Brain Models
- Created `03 Wiki/Concepts/assets/fig-two-axis-evolution.svg` — self-contained SVG (same `<style>`+light-bg pattern as the co-evolution figures): cross-company functional-evolution map on **two technology axes × 3 stages each** — ① 统一模型轴 U1→U2→U3 (base VLA → in-model reasoning → world-model/memory/self-improvement) and ② 大小脑分层轴 L1→L2→L3 (dual-system thin head → cerebellum-FM → multi-expert skill-library + brain orchestration), plus the Galaxea G0→G0.5 cross-traffic ("跳轨") arrow and an interaction-deepens annotation
- Embedded into [[Embodied Brain Models]] as a new section "功能演进趋势:统一模型轴 vs 大小脑分层轴(跨公司)" (after 玩家分布表, before 接口维度); complements the existing 解耦程度光谱 (research↔deployment) with a time-evolution view
- Reliability graded per the vault norm: `~` = vendor/news-reported (Helix, Atlas, AgiBot BFM-2/GCFM); others paper- or code-verified. L3 backed by third-party real instances (Being-0 arXiv:2503.12533, MetaWorld-X arXiv:2603.08572), not just our proposal. MoE flagged as a cross-cutting "multi-expert ≠ layered" technique, not a stage
- Origin: discussed this session — converged a defensible two-axis framing (after rejecting an unbalanced three-axis version), did light cross-company verification (found Being-0 / MetaWorld-X / Atlas fill L1–L3 with real instances), then rendered + archived

## [2026-06-25] ingest | Humanoid-GPT / AstraBrain-WBC 0.5 (Galbot 银河通用) — whole-body-control cerebellum FM, PDF+code-verified
- Added source note [[Qi et al. - Humanoid-GPT (AstraBrain-WBC) Scaling Data and Structure for Zero-Shot Motion Tracking]] — GPT-style causal Transformer for whole-body real-time control, distilled from hundreds of RL experts (DAgger BC) → per-joint PD targets; demonstrates a **scaling law for motion control** (tracking SR 76.89%→83.26%→92.58% as data 2M→2B frames & params 0.25M→5.7M→80.4M; MLP/TCN saturate, even regress). arXiv:2606.03985, **CVPR 2026**; latency 0.39ms (optimized C++/TensorRT/cache) / <1.5ms on RTX 4090; target Unitree G1. Pure cerebellum/motion-tracker — **not a VLA, no vision-language, no world model**
- Backfilled `01 Raw/2026-06-02 - Qi et al. - Humanoid-GPT ....pdf` (arXiv v1, 8.84 MB); facts extracted via pdftotext and read directly (not via web summarizer — per AGENTS.md source-reading rule)
- **Naming/attribution verified per Ethan's caution**: product name **AstraBrain-WBC 0.5** (Galbot press, 2026-06-19) vs paper/code name **Humanoid-GPT**. Judged the same work at very-high confidence — paper affiliation #2 = Galbot Inc., GitHub org = GalaxyGeneralRobotics, He Wang (Galbot founder) corresponding author, specs match exactly — but **the paper never says "AstraBrain" and no single doc equates the two names**, so logged as a strong inference, not literal cross-citation
- **Code status (code-verified)**: github.com/GalaxyGeneralRobotics/Humanoid-GPT, Apache-2.0; **inference+deploy code + ONNX checkpoint released now, but training code + 2B-frame data still TODO** — press claims of "fully open-sourced" are an overstatement (corrected in the note)
- Created entity [[Galbot 银河通用]] (王鹤 / PKU EPIC) with explicit **≠ [[Galaxea 星海图]]** disambiguation (reciprocated in the Galaxea entity's naming-caution callout); added Galbot to [[Embodied AI - VLAs, world models, and cerebellum]] Entities
- Placed as a hard **L2 (cerebellum = general motion-control FM)** instance: added to the two-axis figure `fig-two-axis-evolution.svg` (L2, alongside NeuroVLA; 智元 BFM-2/GCFM moved to the vendor-reported sub-line) and the [[Embodied Brain Models]] two-axis section; recorded in [[Embodied Cerebellum Models]] as an early instance of the predicted "independently-designed edge motion-control architecture" (a new cerebellum form beyond the original four)
- Updated `90 System/index.md` (Sources + Entities)

## [2026-06-25] deepen + fix | Humanoid-GPT — WBC-tracker clarification, eval-protocol detail, oversized PDF removed per Raw rule
- Source note: added section **"关键区分:它是 WBC tracker,不是子任务执行器"** (it takes a fully-specified reference motion → reproduces it stably; NOT "take a subtask → figure out the motion"; a different functional layer from the skill/subtask cerebellum we'd been discussing; occupies the **WBC rung** of the frequency ladder) and **"评测协议与通用性边界"** (test sets = AMASS-test held-out split tracking in MuJoCo + 4 unseen dances on real G1 + online teleop — **a motion-tracking eval, NOT a task-success leaderboard**; generality = motion-space zero-shot only, **not task-level, not cross-embodiment, tracking-not-autonomy**; param family 0.25M→5.7M→~22M→80.4M, headline L=80.4M≈GPT-1 scale)
- [[Embodied Cerebellum Models]]: annotated the frequency ladder — the **WBC (全身/关节空间控制) rung's "learnable? = 边界"** is now effectively ✅ (Humanoid-GPT learns whole-body control as a GPT), classical floor reduced to the kHz FOC spinal layer
- **Fix (self-caught rule violation)**: committing the 8.84 MB PDF in the previous commit **violated the existing AGENTS.md `01 Raw` rule** (PDFs more than a few MB → URL-only, do not commit). `git rm`'d the PDF; source note's Raw line changed to URL-only (facts were already pdftotext-extracted). Note: the blob remains in git history (no history rewrite); a filter-repo + force-push could reclaim ~9 MB if ever wanted
- Trigger: Ethan's question — this "cerebellum" reproduces mocap motions (tracking), which is a different layer from "cerebellum executes a subtask"; clarified to prevent future conflation

## [2026-06-25] maintenance | git history purge — reclaim oversized Raw PDFs (Humanoid-GPT 8.8MB + ReKep 13.8MB)
- Rewrote history with `git filter-repo --invert-paths` to excise two PDFs that violated the `01 Raw` "PDFs > a few MB → URL-only" rule: `01 Raw/2026-06-02 - Qi et al. - Humanoid-GPT …pdf` (8.84 MB, added then removed earlier today) and `01 Raw/2026-04-21 - Huang et al. - ReKep …pdf` (13.8 MB, a previously-kept live file — Ethan opted to reclaim it too)
- ReKep converted to **URL-only**: removed the live PDF; raw note's "Local PDF" line now points to arXiv 2409.01652 (source note already had the arXiv link)
- Reclaimed ~22 MB from history; **force-pushed** rewritten master (commit SHAs from the first PDF-introducing commit onward changed). A full-history backup bundle was created at a repo-external temp before the rewrite
- Remaining `01 Raw` PDFs (HiF8 0.75 MB, MemPO 0.54 MB) comply with the rule and were kept

## [2026-06-25] maintenance | AGENTS.md — concrete Raw-binary commit rule (>2 MB → URL-only + pre-commit size check)
- Replaced the fuzzy "PDFs more than a few MB" with a **concrete 2 MB threshold** across all three places that state the rule (`01 Raw/` section, ingest-workflow step 1, Reading-source section): binaries > 2 MB → URL-only by default; committed copy only when ≤ 2 MB and important, or hard to re-access; arXiv stable → arXiv PDFs default URL-only
- Added an explicit **pre-commit size-check hook**: check size before `git add` of any `01 Raw/` binary; if > 2 MB, don't add → URL-only. This is the enforcement step whose absence let the Humanoid-GPT (8.8 MB) and ReKep (13.8 MB) PDFs slip into history (both since purged via filter-repo)

## [2026-06-25] ingest | BFM-2 (AgiBot 智元) — generative whole-body-control 运动小脑 (vendor PR-only)
- Added source note [[AgiBot - BFM-2 Motion-Between Whole-Body Motion Foundation Model]] — generative WBC motion foundation model (two-stage "Motion-Between" + DOF Feather Motion Generator; models the full-body dynamics state-space distribution → generates a trajectory from any state to any target → disturbance rejection / balance recovery / get-up). Announced 2026-05-25
- **Reliability: vendor PR-only** — official site + multiple tech-media + a dedicated paper/code search found **NO arXiv paper, NO technical report, NO GitHub code** (AgiBot open-sources Link-U-OS / AimRT / AgiBot-World, but not BFM-2). Flagged as the least-verifiable L2 cerebellum FM (vs Humanoid-GPT's arXiv+CVPR+Apache-2.0); params / data / generative mechanism (diffusion/flow/transformer) all undisclosed
- Linked under [[AgiBot 智元]] (added the GO brain-line ↔ BFM motion-cerebellum-line structure; BFM-3 pre-announced); wikilinked in the two-axis L2 ([[Embodied Brain Models]]); added to [[Embodied Cerebellum Models]] as the 2nd "通用运控基座" instance
- Added a new **4-level feedback-loop taxonomy** to [[Embodied Cerebellum Models]] (L1 control/disturbance · L2 forward-model · L3 failure-detect-recovery · L4 self-improvement), prompted by Ethan's "can a cerebellum self-close the loop?" question. Verdict recorded: BFM-2's "动态任务闭环" = L1 control loop + autonomous motion recovery (feedback = full-body dynamics + contact + command → generative re-planning, not fixed clips); no forward-model / task-verification / self-improvement
- MOC + index updated. No PDF (PR-only → URL-only, complies with the just-tightened >2 MB Raw rule)

## [2026-06-25] verify | GCFM (AgiBot) confirmed real — generative control FM; corrected BFM-2 note's "unverified" placeholder
- Verified **GCFM = Generative Control Foundation Model (生成式运控模型)**, AgiBot, announced at its **2026-04 partner conference** ("一体三智" full-stack, 1 of 8 foundation models): **text / audio / video → real-time natural motion** (文生动作、音频配肢体语言), real-time improvisation. Still **PR-only** (no paper/code found). So GCFM was NOT fabricated — it had been carried unverified in the two-axis figure; now substantiated
- Clarified **GCFM ≠ BFM-2 in function**: GCFM = prompt→motion generation; BFM-2 = robust whole-body control / recovery. Both AgiBot motion-side, both PR-only
- Updated [[AgiBot - BFM-2 Motion-Between Whole-Body Motion Foundation Model|BFM-2]] note (replaced the "GCFM 未核实" placeholder with verified facts; clarified BFM ≈ Behavior Foundation Model, BFM(1) ~1.2M→42M params / 100M frames / 700h mocap) and the [[AgiBot 智元]] entity ("一体三智" line: GO brain + BFM/BFM-2/GCFM motion). Two-axis figure's "GCFM~" kept (still vendor-reported, now justified)
