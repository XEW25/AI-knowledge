# VLA - Vision-Language-Action Models

## Definition
A **Vision-Language-Action (VLA)** model is a robot policy that maps **vision + language instruction → actions**, typically built on a pretrained **VLM backbone** so that internet-scale semantic priors transfer into physical control. VLA is the vault's **largest cluster** and the dominant paradigm for generalist manipulation / humanoid control in 2024–2026.

This is the **hub / base concept page**. The code-verified architectural taxonomy lives in [[Embodied Brain Models]]; this page defines the family, draws its boundaries, and indexes the vault's VLA instances and sub-topics.

## Boundary clarification (what is / isn't a VLA)
- **VLA vs [[World-Action Models]] (WAM).** A VLA maps observation → action directly; a WAM grafts an action head onto a **video-generation backbone** (prediction as dense supervision). Overlap exists (e.g. [[Bi et al. - Motus A Unified Latent Action World Model|Motus]] is mode-switchable between the two).
- **VLA vs pure motion controller.** A whole-body-control "cerebellum" foundation model such as [[Qi et al. - Humanoid-GPT (AstraBrain-WBC) Scaling Data and Structure for Zero-Shot Motion Tracking|Humanoid-GPT]] is **not a VLA** — it tracks motion targets with no vision-language semantics driving it.
- **VLA's "transitional" positioning.** In the deployment-driven [[Embodied Brain Models]] framework, VLA is deliberately **not** treated as a parallel "brain school" — it spans brain + cerebellum and is being fragmented into a cloud reasoner + edge executor (see [[Embodied Cerebellum Models]]).

## Architecture axes (deep treatment: [[Embodied Brain Models]])
The vault's taxonomy, all grounded in code-level reading of open implementations:
- **Top axis — VLM-as-actor vs VLM-as-encoder.**
  - *VLM-as-actor* (unified autoregressive, one decoder emits action tokens): RT-2 → OpenVLA → π0-FAST → [[Galaxea - G0.5 Autoregressive VLM-as-Actor VLA|G0.5]].
  - *VLM-as-encoder* (VLM conditions a separate flow/diffusion action expert), split into:
    - **Paradigm A** — joint-attention MoE, block-causal (the [[Physical Intelligence (π)|π series]] source).
    - **Paradigm B** — cross-attention encoder-decoder ([[NVIDIA - GR00T N1 An Open Foundation Model for Generalist Humanoid Robots|GR00T]], PhysVLA).
- **System-level interface (brain → executor):** single latent vector ([[Figure AI - Helix a VLA for Generalist Humanoid Control|Helix]]) / discrete latent-action tokens ([[AgiBot - GO-1 ViLLA Generalist Embodied Foundation Model|GO-1]]) / natural-language subtasks ([[Galaxea - G0 Dual-System VLA Model|G0]], [[Huang et al. - ChemBot Long-Term Memory for VLA-based Agents|ChemBot]]) / subgoal images (π₀.7) / action tokens.
- **Action-head type:** autoregressive tokens vs **diffusion (DiT)** vs **flow-matching** — this choice drives the [[VLA quantization]] difficulty profile.

## The vault's VLA instances
| Model | Lab | Position on the axes |
|---|---|---|
| [[Physical Intelligence - pi0 a Vision-Language-Action Flow Model for General Robot Control\|π₀]] → π₀.5/π*₀.6/π₀.7 | [[Physical Intelligence (π)]] | encoder / **Paradigm A**; flow-matching head |
| [[NVIDIA - GR00T N1 An Open Foundation Model for Generalist Humanoid Robots\|GR00T N1]] | [[NVIDIA]] | encoder / **Paradigm B**; diffusion DiT |
| [[Figure AI - Helix a VLA for Generalist Humanoid Control\|Helix]] | [[Figure AI]] | dual-system; single-latent-vector interface |
| [[AgiBot - GO-1 ViLLA Generalist Embodied Foundation Model\|GO-1]] | [[AgiBot 智元]] | latent-action-token interface (ViLLA) |
| [[Galaxea - G0 Dual-System VLA Model\|G0]] → [[Galaxea - G0.5 Autoregressive VLM-as-Actor VLA\|G0.5]] | [[Galaxea 星海图]] | encoder → **actor** reversal |
| [[DeepCybo - PhysBrain Human Egocentric Data as a Bridge from VLMs to Physical Intelligence\|PhysBrain]] / [[DeepCybo - TwinBrainVLA Asymmetric Mixture-of-Transformers for Anti-Forgetting VLA\|TwinBrainVLA]] | [[DeepCybo]] | encoder / Paradigm B / anti-forgetting MoT |
| [[Guo et al. - NeuroVLA Brain-inspired Neuromorphic Cortex-Cerebellum-Spinal VLA\|NeuroVLA]] | [[AI2 Robotics]] | neuromorphic cortex/cerebellum/spinal, on-board |
| [[Huang et al. - ChemBot Long-Term Memory for VLA-based Agents\|ChemBot]] | [[LimX Dynamics]] | VLA-as-skill under an agent planner |
| [[Huang et al. - ReKep Spatiotemporal Reasoning Keypoint Constraints for Robotic Manipulation\|ReKep]] | Stanford ([[Li Fei-Fei]]) | constraint-based; VLM plans, no monolithic action policy |

## Sub-topics (spokes)
- [[VLA quantization]] — low-bit edge deployment; why VLA quant ≠ LLM quant (closed-loop error compounding, action-head sensitivity)
- [[World-Action Models]] — the video-backbone-plus-action variant
- [[Memory in Embodied AI]] — implicit (edge, procedural) vs explicit (cloud, episodic) memory across VLA works
- [[Embodied model function evolution - generalization as the master line]] — where the VLA paradigm is heading (端到端 → 大小脑 → 端云 → Agentic)

## Open questions
- **Actor vs encoder is unsettled** — Galaxea pivoted encoder→actor (G0→G0.5); the field has not converged.
- **Generalization from data coverage vs from structure** — the recurring tension across the cluster (see the function-evolution synthesis).
- **Long-horizon reliability** — per-step success `p^N` collapse and the missing verification layer keep monolithic VLAs from long tasks.

## Related
- [[Embodied Brain Models]] — the code-verified architectural framework (this page's deep counterpart)
- [[Embodied Cerebellum Models]] — the edge-execution half
- [[Task decomposition]] — the alternative to monolithic VLA (constraints / subtasks / skills)
- [[Spatial Intelligence for Embodied AI]] — the representation dimension VLAs increasingly need

## tags
#concept #vla #embodied #robotics
