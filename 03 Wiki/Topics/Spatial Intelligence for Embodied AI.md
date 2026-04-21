# Spatial Intelligence for Embodied AI

## 定义

Spatial Intelligence 指具身智能体**感知、记忆、想象和操控 3D 空间**的能力——包括几何理解、空间关系推理、物理直觉和空间规划。这是具身 AI 区别于纯视觉/语言 AI 的核心能力维度。

## 核心问题

> 具身控制面对的是 3D 物理世界，但主流输入（图像/视频）是 2D 投影。这种 modality 不匹配限制了具身系统的空间理解和泛化能力。

是否需要一种专门的 **3D spatial modality**？目前没有定论，但越来越多的工作指向这个方向。

## 研究方向

### 1. 3D Spatial-Aware 表征学习

强调在表征学习中注入 3D 空间感知，从多视角信息中学习具有空间一致性的表示。

- **SPA** (ICLR 2025) — 在 268 个任务、8 个仿真器上验证 3D spatial awareness 的有效性 [arXiv:2410.08208]
- **UniSplat** (2026) — 从无姿态多视角图像学习 spatial intelligence 表征 [arXiv:2604.10573]

### 2. Object-Centric 3D 表示

将场景表示为物体的组合，每个物体有自己的 3D 表示，支持组合泛化。

- **GROOT** (CoRL 2023) — 物体中心点云表示用于可泛化 manipulation
- **Object-Centric 3DGS** (2026) — 3DGS + 物体中心的结构化解析 [arXiv:2604.09045]
- **GSL** (IEEE T-RO) — 通过物体中心表示学习层次化技能

### 3. 物理信息的世界模型

将物理规律嵌入世界模型，使表征具有物理一致性和预测能力。

- **PIN-WM** (RSS 2025) — Physics-INformed World Models，结合 2D Gaussian Splats

### 4. 3DGS 用于具身感知

3DGS 作为底层感知表示，用于场景理解、manipulation 规划、sim-to-real。

- **GNFactor** — 3DGS 用于机器人 manipulation
- **SplatSim** — 3DGS + 物理引擎的 sim-to-real 框架
- **LangSplat** — 开放词汇语义 3DGS

### 5. Embodied Spatial Intelligence Survey

- **Embodied Spatial Intelligence: From 3D Perception to 3D Reasoning** (2025) [arXiv:2509.00465]

## Open Questions

1. **Spatial token 是什么？** — 3DGS 是空间版的"像素"，空间版"token"的形态还不清楚
2. **结构化 vs 连续** — 理想的表示是纯符号化的场景图，还是连续场 + 结构化抽象的混合？
3. **解析的鲁棒性** — 自动解析场景为物体/关系仍有误差，错误的结构可能比没有结构更危险
4. **粒度** — 应该解析到 object 级别还是 part 级别？
5. **因果关系** — 物理因果应该内建在表示中，还是作为模型从数据中学到的能力？（倾向于后者）

## Community

- **CVPR 2025 Workshop: Causal and Object-Centric Representations for Robotics** — 专门讨论因果 + 物体中心表示在机器人中的应用
- **Awesome Representation for Robotics** — GitHub curated list: dtc111111/awesome-representation-for-robotics
- **Awesome World Models** — GitHub: leofan90/Awesome-World-Models

## Related

- [[3D Spatial Representation]] — 理想空间表征的特征和设计原则
- [[3D Gaussian Splatting]] — 目前最接近的感知层实现
- [[Object-Centric Representation]] — 以物体为中心的表示方法
- [[Agent memory]] — 空间记忆（3D scene memory）是空间智能的子问题

## tags

#spatial-intelligence #embodied-ai #3d-representation #world-model #open-question
