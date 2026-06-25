# Embodied AI - VLAs, world models, and cerebellum

## Purpose
This map collects the vault's embodied-AI cluster: vision-language-action (VLA) models, world models, the brain/cerebellum deployment framework, edge-deployment efficiency (quantization/distillation), and how they assemble into a home robot. It is the embodied counterpart to [[Agent systems, decomposition, and memory]].

**Organizing idea**: a **deployment-driven** split — cloud = **brain** (planning/memory/learning), edge = **cerebellum** (reaction/execution/safety). See [[Embodied Brain Models]] and [[Embodied Cerebellum Models]].

## Entry points

### Concepts (start here)
- [[Embodied Brain Models]] — the central page: deployment-driven brain/cerebellum definition, 三流派 taxonomy, VLM-as-actor vs encoder axis, Paradigm A/B, two-level coupling framework, forward predictions
- [[Embodied Cerebellum Models]] — the edge half: the multi-rate control stack, four cerebellum forms, edge-deployment tech, dependability/"脊髓" layer
- [[World-Action Models]] — video-backbone + action paradigm; 4-generation architecture evolution
- [[VLA quantization]] — low-bit edge deployment sub-cluster (why VLA quant ≠ LLM quant)
- [[Memory in Embodied AI]] — implicit (procedural) vs explicit (episodic) memory across the two layers

### Topics
- [[Spatial Intelligence for Embodied AI]] — 3D representation, spatial modality, predictive spatial models
- [[Model quantization]] — parent of the VLA-quant sub-cluster

### Syntheses
- [[Home robot architecture - a hierarchical embodied agent]] — where the brain/cerebellum/spinal layering lands on a real home robot; capability-vs-dependability
- [[Cloud-edge co-evolving embodied agent - a continuous-evolution framework]] — the edge/cloud continuous co-evolution framework: two core problems, edge 3 + cloud 4 categories + symmetric bridge, four key technologies (2+2), verified evidence, open problems
- [[Cloud-edge co-evolving embodied agent - figures and evidence]] — its figures + verified-data table (7 reconstructable SVG: contention / siloed-vs-collaborative / cost-scaling / CLS / Simplex / modular-federation / capability-registry-&-contract)

### Sources — VLA models
- π series (范式 A source): [[Physical Intelligence - pi0 a Vision-Language-Action Flow Model for General Robot Control|π₀]] · [[Physical Intelligence - pi0.5 a VLA with Open-World Generalization|π₀.5]] · [[Physical Intelligence - pi0.6 a VLA That Learns From Experience|π*₀.6]] · [[Physical Intelligence - pi0.7 a Steerable Generalist Robotic Foundation Model|π₀.7]] · [[Physical Intelligence - RL Tokens Precise Manipulation with Efficient Online RL|RL Tokens]]
- [[NVIDIA - GR00T N1 An Open Foundation Model for Generalist Humanoid Robots|GR00T N1]] — 范式 B (cross-attention), code-verified
- [[Figure AI - Helix a VLA for Generalist Humanoid Control|Helix]] — dual-system, single latent-vector interface, fully on-board
- [[AgiBot - GO-1 ViLLA Generalist Embodied Foundation Model|GO-1]] — latent-action-token interface
- [[Galaxea - G0 Dual-System VLA Model|G0]] · [[Galaxea - G0.5 Autoregressive VLM-as-Actor VLA|G0.5]] — encoder→actor reversal
- [[DeepCybo - PhysBrain Human Egocentric Data as a Bridge from VLMs to Physical Intelligence|PhysBrain]] · [[DeepCybo - TwinBrainVLA Asymmetric Mixture-of-Transformers for Anti-Forgetting VLA|TwinBrainVLA]]
- [[Huang et al. - ChemBot Long-Term Memory for VLA-based Agents|ChemBot]] · [[Huang et al. - ReKep Spatiotemporal Reasoning Keypoint Constraints for Robotic Manipulation|ReKep]]
- [[Guo et al. - NeuroVLA Brain-inspired Neuromorphic Cortex-Cerebellum-Spinal VLA|NeuroVLA]] — neuromorphic/SNN three-layer (cortex/cerebellum/spinal), <20ms on-board reflex, 0.4W
- [[Qi et al. - Humanoid-GPT (AstraBrain-WBC) Scaling Data and Structure for Zero-Shot Motion Tracking|Humanoid-GPT / AstraBrain-WBC]] — Galbot whole-body-control cerebellum FM (GPT-style, distilled from RL experts, 2B frames, CVPR 2026, Apache-2.0); **not a VLA** (pure motion tracker)

### Sources — world models
- [[Bi et al. - Motus A Unified Latent Action World Model|Motus]] — unified MoT, mode-switchable
- [[ACE Robotics - Kairos 3.0 a Real-Time Generative Video World Model|Kairos 3.0]] — edge video world model
- [[GigaWorld Team - GigaWorld-Policy An Efficient Action-Centered World-Action Model|GigaWorld-Policy]] — 训繁推简

### Sources — VLA quantization
- [[DyQ-VLA: Temporal-Dynamic-Aware Quantization for Embodied Vision-Language-Action Models|DyQ-VLA]] · [[QuantVLA: Scale-Calibrated Post-Training Quantization for Vision-Language-Action Models|QuantVLA]] · [[Ω-QVLA: Robust Quantization for Vision-Language-Action Models via Composite Rotation and Per-step Scaling|Ω-QVLA]] · [[DuQuant: Distributing Outliers via Dual Transformation Makes Stronger Quantized LLMs|DuQuant]]

### Entities
- [[Physical Intelligence (π)]] · [[NVIDIA]] · [[Figure AI]] · [[AgiBot 智元]] · [[Galaxea 星海图]] · [[Galbot 银河通用]] · [[DeepCybo]] · [[LimX Dynamics]] · [[ACE Robotics]]

## Narrative spine
A useful path through the cluster:

1. [[Embodied Brain Models]] sets the frame: a robot's intelligence splits by **where it runs** (cloud brain vs edge cerebellum), sidestepping "is a VLA a brain?" ontology debates.
2. Inside that frame, three brain schools compete: LLM/VLM-as-brain, Predictive Spatial Models, and the (transitional) VLA paradigm.
3. The VLA paradigm itself splits on one axis — **VLM-as-actor vs VLM-as-encoder** (and within encoder, **Paradigm A joint-attention vs Paradigm B cross-attention**), all code-verified against π / GR00T / G0.5.
4. [[World-Action Models]] add the prediction dimension: video-generation backbones grafted to action — from bidirectional to mode-switchable ([[Bi et al. - Motus A Unified Latent Action World Model|Motus]]) and pure edge world models ([[ACE Robotics - Kairos 3.0 a Real-Time Generative Video World Model|Kairos]]).
5. [[Embodied Cerebellum Models]] takes the edge half seriously: not "a small brain" but a real-time multi-rate stack with a non-negotiable classical "spinal" floor.
6. [[VLA quantization]] is the concrete technology making the cerebellum fit on-device.
7. [[Home robot architecture - a hierarchical embodied agent]] assembles all of it into one system and confronts the capability-vs-dependability gap.

## Main themes
### 1. Deployment decides function
The brain/cerebellum split is engineering (where it runs), not neuroscience analogy — a falsifiable property that organizes the whole cluster.

### 2. Architecture is verified, not assumed
The cluster's taxonomies (Paradigm A/B, actor/encoder, WAM generations) are grounded in code-level reading of open implementations — and corrected when PR ≠ code (e.g., Kairos has no action head; Motus is mode-switchable not 1st-gen).

### 3. The edge is a stack, not a model
Cerebellum = a frequency/intelligence/determinism gradient (50Hz VLA → 1kHz control → 40kHz servo); learning keeps descending but stops above the PD/servo floor.

### 4. Capability vs dependability
The open frontier is not raw capability but reliability — monitoring, safety reflexes, disconnection tolerance — concentrated on the edge side.

## Suggested next additions
- person entity pages (Sergey Levine, Chelsea Finn — currently dangling links)
- academic-baseline source notes (OpenVLA, RT-1/2/X, V-JEPA, Cosmos, Genie)
- a latent-action synthesis (GO-1 VQ + Motus optical-flow + PhysBrain egocentric + LAPA + Genie)
- a "world-model-at-inference" synthesis (the 4-tier → runtime-knob spectrum)

## Related maps
- [[Home]]
- [[Agent systems, decomposition, and memory]] — the cognition/memory counterpart cluster
