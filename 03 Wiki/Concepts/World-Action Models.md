# World-Action Models (WAM)

World-Action Models（WAM）是一类从预训练视频生成 backbone 初始化的机器人策略学习范式。核心思想：将世界模型（视频生成能力）和动作预测统一在一个模型中，利用视频生成提供密集监督信号。

> **边界澄清**：**纯视频世界模型 ≠ WAM**。WAM 的定义要求"视频 backbone **+ 动作预测**"二者合一。像 Cosmos、[[ACE Robotics - Kairos 3.0 a Real-Time Generative Video World Model|Kairos 3.0]] 这类**只有视频生成、没有动作头**的模型，只是 WAM 的"世界模型"那一半（充当神经模拟器 / 数据引擎 / 规划 substrate，动作另外处理）。WAM = 在这种 backbone 上**嫁接动作头**。

## 核心挑战

1. **推理效率**：联合推理未来视觉动态 + 动作，推理开销大
2. **视觉-动作耦合**：动作预测精度依赖视频预测质量，误差会传播
3. **监督稀疏性**：传统 VLA 只有 sparse action label，缺乏密集监督

## 架构演进

> 这条演进线索的核心问题始终是同一个：**推理时要不要先生成视频**——生成则慢（密集监督的代价），不生成则丢掉世界模型的预测红利。四代是对这个 trade-off 的不同回答。

### 第一代：Bidirectional Attention
- 动作 token 和视频 token 双向注意力
- 推理时必须先生成视频 → 高延迟
- 代表：Cosmos Policy（早期联合生成路线）

### 第二代：Two-Stage
- 先生成视频，再用 Inverse Dynamics Model 提取动作
- 仍依赖视频生成
- 代表：部分 2025 年工作（UniPi 族、HiP 等）

### 第三代：Action-Centered（GigaWorld-Policy）
- Causal mask **硬隔离**动作 token 和视频 token
- 训练时双 loss 联合优化，推理时**永久丢弃**视频分支（"训繁推简"，固定）
- 10× 推理加速，0.36s/inference
- 证明端到端路线内部仍有大量优化空间
- 代表：[[GigaWorld Team - GigaWorld-Policy An Efficient Action-Centered World-Action Model|GigaWorld-Policy]]

### 第四代：Mode-Switchable（统一时间步调度）
- 不固定"生不生成视频"，而是用 **UniDiffuser 式逐模态时间步分配**，把它做成**推理时可切换的模式**
- 双向**联合注意力**保留（≠ 第三代的因果掩码硬隔离），但靠时间步配置切档：VLA 模式仅去噪动作（不生成视频）、World Model 模式去噪观测、Joint 模式同步生成
- 与第三代的对照：**"运行时切档" vs "训练期固定丢弃"**——同权重在快/慢环路换挡，但 VLA 模式是否真省单步算力存疑（视频专家是否仍参与前向，论文未披露）
- 代表：[[Bi et al. - Motus A Unified Latent Action World Model|Motus]]（清华 TSAIL × 地平线）

> ⚠️ **修正记录**：此页早先把 Motus 列为"第一代 Bidirectional"。核实 [2512.13030](https://arxiv.org/abs/2512.13030) 后确认 Motus 是模式可切换的第四代设计，VLA 模式推理时不生成视频，已据实改归。

## 与其他路线对比

| 路线 | 泛化来源 | 数据需求 | 代表工作 |
|------|---------|---------|---------|
| WAM | 数据覆盖 | 大规模视频+动作数据 | [[GigaWorld Team - GigaWorld-Policy An Efficient Action-Centered World-Action Model\|GigaWorld-Policy]], [[Bi et al. - Motus A Unified Latent Action World Model\|Motus]] |
| VLA | 数据覆盖 | 大规模动作数据 | π0.5, RT-2 |
| 任务拆解 | 结构化推理 | Zero-shot | ReKep, Code as Policies |

## Open Questions

1. 视频生成质量对动作预测的影响边界在哪里？GigaWorld-Policy 证明推理时可以不要，但训练时仍是关键
2. 端到端路线的数据天花板在哪？能靠更多数据持续提升吗？
3. WAM 和 VLA 最终会收敛到同一个架构吗？

## Related

- [[Task decomposition]] — 另一条路线
- [[Spatial Intelligence for Embodied AI]] — 更广的具身智能主题
- [[GigaWorld Team - GigaWorld-Policy An Efficient Action-Centered World-Action Model]] — 第三代（causal mask 硬隔离 + 推理丢分支）
- [[Bi et al. - Motus A Unified Latent Action World Model]] — 第四代（时间步调度，模式可切换）；同属 latent-action 谱系
- [[Embodied Brain Models]] — WAM 作为 Predictive Spatial × VLA 嫁接；范式 A 的 MoT 扩展
- [[Huang et al. - ReKep Spatiotemporal Reasoning Keypoint Constraints for Robotic Manipulation]]
