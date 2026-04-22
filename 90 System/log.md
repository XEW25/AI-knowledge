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
