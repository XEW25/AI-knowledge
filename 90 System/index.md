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
- [[GigaWorld Team - GigaWorld-Policy An Efficient Action-Centered World-Action Model]] — source note on action-centered WAM with causal mask architecture, "训繁推简" paradigm

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

### Entities
- [[Alex Zhang]] — author associated with the Mismanaged Geniuses Hypothesis
- [[Andrej Karpathy]] — researcher associated with the LLM Wiki framing
- [[Anthropic]] — organization associated with Claude, harness design, and agent engineering work
- [[Prithvi Rajasekaran]] — author associated with long-running application harness design
- [[Claude Code]] — coding-agent style orchestrator-subagent system
- [[OpenClaw]] — agent orchestration environment and referenced scaffold
- [[Hermes Agent]] — agent scaffold referenced in discussion of longer-horizon decomposition

### Topics
- [[Agent memory]] — topic page for memory as policy, decomposition, and self-managed memory in agent systems
- [[Harnesses and managed agent systems]] — topic page for harness design, managed-agent architecture, and long-running orchestration systems
- [[Model quantization]] — topic page for quantization, low-bit training, FP8-like formats, and numeric representation design
- [[Open questions in agent memory and decomposition]] — unresolved questions and research directions around decomposition, memory control, and meta-skills
- [[Spatial Intelligence for Embodied AI]] — 3D 空间表征、object-centric 表示、spatial modality 的研究方向汇总

### Syntheses
- [[Self-managing memory as an in-distribution control problem]] — synthesis on reframing memory management as decomposed control over write, retrieve, consolidate, and discard operations, with emphasis on decomposition policy
- [[Meta-skills for memory orchestration]] — synthesis on reusable higher-order skills for controlling memory operations and composing trainable memory subskills

## Maps
- [[Home]] — top-level navigation page for the vault
- [[Agent systems, decomposition, and memory]] — navigation page for the cluster around agent architecture, decomposition, and memory control

## System
- [[90 System/AGENTS]]
- [[90 System/log]]
