# World-Action Models (WAM)

World-Action Models（WAM）是一类从预训练视频生成 backbone 初始化的机器人策略学习范式。核心思想：将世界模型（视频生成能力）和动作预测统一在一个模型中，利用视频生成提供密集监督信号。

## 核心挑战

1. **推理效率**：联合推理未来视觉动态 + 动作，推理开销大
2. **视觉-动作耦合**：动作预测精度依赖视频预测质量，误差会传播
3. **监督稀疏性**：传统 VLA 只有 sparse action label，缺乏密集监督

## 架构演进

### 第一代：Bidirectional Attention
- 动作 token 和视频 token 双向注意力
- 推理时必须先生成视频 → 高延迟
- 代表：Motus, Cosmos Policy

### 第二代：Two-Stage
- 先生成视频，再用 Inverse Dynamics Model 提取动作
- 仍依赖视频生成
- 代表：部分 2025 年工作

### 第三代：Action-Centered（GigaWorld-Policy）
- Causal mask 隔离动作 token 和视频 token
- 训练时双 loss 联合优化，推理时丢弃视频分支
- 10× 推理加速，0.36s/inference
- 证明端到端路线内部仍有大量优化空间

## 与其他路线对比

| 路线 | 泛化来源 | 数据需求 | 代表工作 |
|------|---------|---------|---------|
| WAM | 数据覆盖 | 大规模视频+动作数据 | GigaWorld-Policy, Motus |
| VLA | 数据覆盖 | 大规模动作数据 | π0.5, RT-2 |
| 任务拆解 | 结构化推理 | Zero-shot | ReKep, Code as Policies |

## Open Questions

1. 视频生成质量对动作预测的影响边界在哪里？GigaWorld-Policy 证明推理时可以不要，但训练时仍是关键
2. 端到端路线的数据天花板在哪？能靠更多数据持续提升吗？
3. WAM 和 VLA 最终会收敛到同一个架构吗？

## Related

- [[Task decomposition]] — 另一条路线
- [[Spatial Intelligence for Embodied AI]] — 更广的具身智能主题
- [[GigaWorld Team - GigaWorld-Policy An Efficient Action-Centered World-Action Model]]
- [[Huang et al. - ReKep Spatiotemporal Reasoning Keypoint Constraints for Robotic Manipulation]]
