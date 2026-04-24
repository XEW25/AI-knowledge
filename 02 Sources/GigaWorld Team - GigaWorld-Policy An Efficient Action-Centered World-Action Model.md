# GigaWorld Team - GigaWorld-Policy: An Efficient Action-Centered World–Action Model

- **Type**: arXiv paper (cs.RO)
- **Authors**: GigaWorld Team (Angen Ye, Chaojun Ni, Guan Huang, Zheng Zhu, et al.)
- **Affiliation**: GigaAI
- **arXiv**: [2603.17240](https://arxiv.org/abs/2603.17240)
- **Project**: https://gigaai-research.github.io/GigaWorld-Policy/
- **Year**: 2026
- **Accessed**: 2026-04-22
- **Raw note**: [[2026-04-22 - GigaWorld Team - GigaWorld-Policy An Efficient Action-Centered World-Action Model]]

## Summary

GigaWorld-Policy 是一个以动作为中心的世界-动作模型（WAM），通过"训繁推简"的 causal mask 架构解决了 WAM 的推理瓶颈和视觉-动作耦合问题。训练时利用视频生成提供密集监督，推理时丢弃视频分支只输出动作，实现 10× 推理加速。

## Key Method: "训繁推简"（Train Complex, Infer Simple）

### Causal Mask 架构
- Action tokens 和 future-visual tokens 共享同一 Transformer backbone，统一嵌入空间
- Causal mask 控制：action tokens **不能** attend to future-visual tokens（单向信息流）
- 信息流：`当前观测 → action tokens → 动作预测 → (可选) future-visual tokens → 视频生成`

### 训练阶段（训繁）
1. Action tokens 基于当前观测预测未来动作序列（action prediction loss）
2. Future-visual tokens 基于当前观测 + 已预测动作生成未来视频（video generation loss）
3. 双 loss 联合优化，视频生成提供密集监督，帮助动作预测学到物理合理轨迹

### 推理阶段（推简）
- Causal mask 保证动作预测不依赖视频 token → 直接丢弃视频生成分支
- 只运行 action prediction：当前观测 → action tokens → 动作输出
- 0.36s/inference，10× 快于 Motus

### 三阶段训练 Pipeline
1. 通用世界模型预训练：海量互联网视频 → 学通用物理规律
2. 具身场景适配：千小时级多源操作视频（第一人称 + 真机 + 仿真）
3. 动作策略对齐：少量真机 action-labeled 数据

## Key Claims

1. **模型规模**：基于 **Wan 2.2 5B** diffusion Transformer，5B 参数
2. **推理效率**：10× 快于 Motus / Cosmos Policy，**0.36s/inference on A100**，~2.8 Hz（action-only 模式）
3. **任务成功率**：真机平均 ~85%，比 Cosmos Policy（~55%）高 30 个百分点
4. **仿真表现**：比 π0.5 在 RoboTwin 2.0 上高 95%
5. **监督密度**：视频生成 loss 提供远超 sparse action label 的训练信号（λ_action = 5, λ_video = 1）
6. **Action chunk**：长度 48 步，future-observation stride Δ = 12

## Experiments / Results

| 指标 | GigaWorld-Policy | Motus | Cosmos Policy | π0.5 |
|------|-----------------|-------|---------------|------|
| 真机成功率 | ~85% | ~50% | ~55% | — |
| RoboTwin 2.0 | baseline+95% | — | — | baseline |
| 推理速度 | 0.36s (A100) | ~3.6s | ~3.6s | ~0.36s |
| 控制频率 | ~2.8 Hz | ~0.3 Hz | ~0.3 Hz | ~2.8 Hz |
| 模型参数 | 5B (Wan 2.2) | 未公开 | 未公开 | 未公开 |
| 任务类型 | 抓取、装配、整理等 4 类 | — | — | — |

## 泛化性分析

GigaWorld-Policy 的泛化性来自**预训练数据的覆盖广度**，而非结构化推理的 zero-shot 能力：
- 三阶段递进训练（互联网视频 → 具身视频 → 少量真机数据）
- 泛化范围受训练数据分布限制
- 不具备 ReKep 那样的任意语言指令 zero-shot 适配能力

## Why It Matters in This Vault

### 定位：端到端路线内部的效率优化

GigaWorld-Policy 不改变端到端 WAM 范式的基本假设，而是在其内部解决了一个关键的工程瓶颈（推理速度）。它的贡献在于证明：

> **端到端路线内部仍有大量优化空间**，不一定要牺牲效率。

### 两条路线对比

| | ReKep（任务拆解路线） | GigaWorld-Policy（端到端路线） |
|---|---|---|
| 泛化来源 | 结构化推理（LLM 生成约束） | 数据覆盖（大规模预训练） |
| 数据需求 | Zero-shot | 大规模 robot dataset |
| 推理方式 | 优化器求解 | 模型前向推理 |
| 灵活性 | 极高（任意语言指令） | 受训练数据覆盖范围限制 |
| 效率 | 实时（优化器求解） | 实时（0.36s/inference） |

### Ethan 的观点

> 任务拆解路线（如 ReKep）在泛化性和数据效率上有优势，与"拆解复杂任务为子任务消解 OOD"的思路一致。端到端路线（如 GigaWorld-Policy）靠数据覆盖泛化，但在效率上已有很大进步。目前两条路线无法定论哪条更有前景。

## Limitations

- 泛化受训练数据分布限制，无法处理训练数据未覆盖的场景
- 端到端路线固有的数据饥渴问题（虽然三阶段 pipeline 缓解了）
- 论文未展示 deformable object 或需要精细推理的任务表现
- 依赖视频生成 backbone 的质量

## Related Concepts

- [[Task decomposition]] — 另一条路线的对比参照
- [[Spatial Intelligence for Embodied AI]] — 3D 空间表征在具身操控中的应用
- [[World-Action Models]] (to be created) — WAM 范式
- [[VLA - Vision-Language-Action Models]] — 端到端操控的另一分支

## Related Entities

- [[GigaAI]] — 研究机构
- [[Motus]] — 对比基线
- [[π0.5 (Physical Intelligence)]] — 对比基线
