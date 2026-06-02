# NVIDIA

- **Type**: Company（半导体 / AI 全栈）
- **Embodied 相关部门**: GEAR Lab（Generalist Embodied Agent Research，Jim Fan & Yuke Zhu 领衔）
- **Focus（具身视角）**: 开源机器人基础模型 + 世界模型 + 仿真 + 端侧推理硬件的**全栈**

## 在具身领域的多线站位

NVIDIA **不是单纯的 VLA 玩家，而是横跨多流派的全栈玩家**（见 [[Embodied Brain Models]] 的"主体 vs 模型 vs 流派"三层区分）：

| 产品 | 流派归属 | 角色 |
|------|---------|------|
| **GR00T** (N1 → N1.5 → N1.6 → N1.7) | VLA 流派 / **范式 B** | 开源人形 VLA 基础模型 |
| **Cosmos**（Cosmos-Predict / Reason） | **Predictive Spatial 流派** | 世界模型 / 物理 AI 推理 |
| **Isaac Sim / Lab** | 工具链 | 仿真平台 |
| **DreamGen** | 流派融合方法 | 用 Cosmos 给 GR00T 生成合成训练数据 |
| **Jetson Thor**（~2000 TOPS） | 硬件 | 端侧推理芯片，决定"小脑"上限 |

**关键观察**：NVIDIA 通过 DreamGen 让世界模型（Cosmos）与 VLA（GR00T）**互相增强**——世界模型不是 VLA 的竞争者，而是其数据基础设施。N1.7 更把 backbone 换成自家 **Cosmos-Reason2-2B**，把"会推理/预测的世界模型"直接当 VLA 大脑，是流派融合的工业实例。

**战略**：开源（代码 Apache 2.0 + 权重 NVIDIA Open Model License）+ 卖 Jetson Thor 硬件 + 提供 Isaac 仿真全栈——典型的"卖铲子 + 开源生态"打法，与其 GPU 主业协同。

## 与知识库主题的关联

- [[NVIDIA - GR00T N1 An Open Foundation Model for Generalist Humanoid Robots]] — 范式 B（cross-attention）工业代表，代码级核实
- [[Embodied Brain Models]] — 全栈玩家、范式 B、Predictive Spatial 流派
- [[Home robot architecture - a hierarchical embodied agent]] — Jetson Thor 等端侧硬件决定小脑可行性
- [[Huang et al. - ChemBot Long-Term Memory for VLA-based Agents]] — ChemBot 的 Skill-VLA 基于 GR00T

## Related

- [[Physical Intelligence (π)]] — 范式 A 的主要推动者，VLA 竞争对手
- [[Galaxea 星海图]] / [[AgiBot 智元]] — 用 NVIDIA 硬件/模型的中国具身公司

## tags

#entity #nvidia #vla #world-model #gr00t #cosmos #embodied-ai #full-stack
