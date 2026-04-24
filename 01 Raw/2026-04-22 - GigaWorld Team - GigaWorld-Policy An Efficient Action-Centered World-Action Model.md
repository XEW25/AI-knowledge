# GigaWorld-Policy: An Efficient Action-Centered World–Action Model

- Canonical URL: https://arxiv.org/abs/2603.17240
- PDF URL: https://arxiv.org/pdf/2603.17240
- Source type: arXiv (URL-only)
- Accessed at: 2026-04-22T19:52:00+08:00
- arXiv ID: 2603.17240
- Authors: GigaWorld Team (Angen Ye, Boyuan Wang, Chaojun Ni, Guan Huang, Guosheng Zhao, Hao Li, et al.)
- Affiliation: GigaAI
- Project: https://gigaai-research.github.io/GigaWorld-Policy/
- Tier: 1

## Raw capture

### Abstract

World–Action Models (WAM) initialized from pre-trained video generation backbones have demonstrated remarkable potential for robot policy learning. However, existing approaches face two critical bottlenecks: (1) jointly reasoning over future visual dynamics and actions incurs substantial inference overhead; (2) joint modeling entangles visual and motion representations, making action prediction depend on video forecast quality.

GigaWorld-Policy introduces an **action-centered WAM** that:
- Predicts future action sequences conditioned on current observation
- Simultaneously generates future videos conditioned on predicted actions (optional at inference)
- Uses causal design: future-video tokens cannot influence action tokens → video generation is optional during deployment
- Curated a diverse large-scale robot dataset for pre-training

### Key Ideas
- Action-centered rather than video-centered: action prediction doesn't depend on generating future video
- Video generation serves as auxiliary supervision during training, not a hard dependency at inference
- Decouples "understanding dynamics" from "rendering dynamics"

### 详细架构设计："训繁推简"范式

#### 核心机制：Causal Mask（因果掩码）

模型是一个 causal sequence model，将 **action tokens** 和 **future-visual tokens** 放在同一个 Transformer backbone 下，但通过 causal mask 控制 token 之间的注意力方向：

- **Action tokens** 可以 attend to 当前观测（视觉 + 机器人状态），但 **不能** attend to future-visual tokens
- **Future-visual tokens** 可以 attend to 当前观测 + 已生成的 action tokens

这意味着信息流是单向的：
```
当前观测 → action tokens → 动作预测
当前观测 + 已预测动作 → future-visual tokens → 视频生成
```

#### 训练阶段（训繁）
1. Action tokens 基于当前观测预测未来动作序列（action prediction loss）
2. Future-visual tokens 基于当前观测 + 预测动作生成未来视频（video generation loss）
3. 两个 loss 联合优化，视频生成提供密集监督信号，帮助动作预测学到物理合理的轨迹
4. 统一嵌入空间：视觉观测、机器人状态、动作序列映射到同一 embedding space

#### 推理阶段（推简）
- 由于 causal mask 阻止了 future-visual tokens 对 action tokens 的影响，直接 **丢弃整个视频生成分支**
- 只运行 action prediction 部分：当前观测 → action tokens → 动作输出
- 不需要迭代采样生成视频帧，所以推理极快（0.36s/inference，10× 加速）

#### 与其他 WAM 架构的对比
- **Bidirectional attention WAM**（如 Motus）：动作和视频 token 双向注意力，推理时必须先生成视频 → 慢
- **Two-stage WAM**：先生成视频再用 Inverse Dynamics Model 提取动作 → 还是依赖视频生成
- **GigaWorld-Policy**：动作预测和视频生成共享 backbone 但因果隔离 → 推理时可完全跳过视频

#### 训练 Pipeline（三阶段）
1. Stage 1-2：海量视频数据训练世界模型 GigaWorld-0.5（轻量级视频生成模型）
2. Stage 3：在 GigaWorld-0.5 基础上加入具身动作数据训练 GigaWorld-Policy

### Key Results
- **10× faster** than Motus / Cosmos Policy（0.36s/inference on A100）
- **35% higher** task success rates vs baselines（real-world robot）
- **95% improvement** over π0.5 on RoboTwin 2.0
- 推理频率 ~2.8 Hz（action-only 模式）
- Action chunk length = 48 步，future-observation stride Δ = 12
- Loss weights: λ_action = 5, λ_video = 1

### Model Size
- Backbone: **Wan 2.2 5B**（diffusion Transformer，阿里通义万相视频生成模型）
- 初始化自大规模 web-video foundation model，非从零训练
- 5B 参数量在 VLA/WAM 领域属于中等偏大（对比 π0.5 未公开、Motus 未公开）
