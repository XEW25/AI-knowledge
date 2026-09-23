# World-Action Models (WAM)

World-Action Models（WAM）是一类从预训练视频生成 backbone 初始化的机器人策略学习范式。核心思想：将世界模型（视频生成能力）和动作预测统一在一个模型中，利用视频生成提供密集监督信号。

> **边界澄清**：**纯视频世界模型 ≠ WAM**。WAM 的定义要求"视频 backbone **+ 动作预测**"二者合一。像 Cosmos、[[ACE Robotics - Kairos 3.0 a Real-Time Generative Video World Model|Kairos 3.0]] 这类**只有视频生成、没有动作头**的模型，只是 WAM 的"世界模型"那一半（充当神经模拟器 / 数据引擎 / 规划 substrate，动作另外处理）。WAM = 在这种 backbone 上**嫁接动作头**。

## 核心挑战

1. **推理效率**：联合推理未来视觉动态 + 动作，推理开销大
2. **视觉-动作耦合**：动作预测精度依赖视频预测质量，误差会传播
3. **监督稀疏性**：传统 VLA 只有 sparse action label，缺乏密集监督

## 架构演进

> 这条演进线索的核心问题始终是同一个：**推理时要不要先生成视频**——生成则慢（密集监督的代价），不生成则丢掉世界模型的预测红利。四代是对这个 trade-off 的不同回答。**第五代(LaWAM)更激进:连视频生成 backbone 都不要**,改在 latent 空间单次预测特征子目标。

### 第一代：Bidirectional Attention
- 动作 token 和视频 token 双向注意力
- 推理时必须先生成视频 → 高延迟
- 代表：Cosmos Policy（早期联合生成路线）

### 第二代：Two-Stage
- 先生成视频，再用 Inverse Dynamics Model 提取动作
- 仍依赖视频生成
- 代表：部分 2025 年工作（UniPi 族、HiP 等）

#### 第二代改良：Two-Stage 的回归与修复（2026-09 加）
- **坚持"先生成再 IDM"，但把两个老毛病各修一个**：①**慢** → 单步 MeanFlow 一次前向出完整未来 + 64× 压缩到 24 token/帧（不再是迭代去噪）；②**生成的未来与记录动作错配**（此前无人命名）→ 提出 **validity gap**（同一观测多种正确做法，演示只记一种，生成器可能采出另一种 ⇒ IDM 吃错配监督、动作多模态被平均掉）+ **KASO**（每步采 8 个候选未来，用当前 IDM 在高噪声点按动作差异选 1 个回放梯度，同时保留两侧预训练损失）。
- **单步的深层价值**：动作梯度能穿过完整生成未来 ⇒ IDM **可单独预训练**，于是能吃无指令、无成功标注的失败轨迹与部署 rollout——这是第三代 / 第五代都做不到的数据通道。
- **谱系里第一条 scaling 曲线**：所有生成与动作部件从零在操控数据上训，300 → 30,000 h 真机零样本 OOD 17.1 → 44.1%（G1-OP），无饱和迹象；技能覆盖 ↔ 成功率 Pearson 0.80。
- 代表：[[AgiBot - GE-Act 2.0 Pretraining and Scaling a World-Action Model for Robotic Manipulation|GE-Act 2.0]]（AgiBot，2026-09；⚠️ 代码权重未发布）。
- **对"要不要生成视频"这个主轴的第三种回答**：第三代说"训时生成、推时丢掉"，第五代说"根本不进像素空间"，GE-Act 2.0 说"**生成，但生成得极快极小、且可解码回像素**"——保住了可视化与可解释，代价是仍要一个 2.51B 生成器在推理回路里（延迟未报）。

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

### 第五代:Latent-Subgoal(跳出像素空间)
- **连视频生成 backbone 都不要了**:前四代都保留一个视频生成模型(只争论推理时跑不跑);LaWAM 改用**冻结视觉 encoder(DINOv3)+ latent-action-model 的 decoder**,在 latent 空间**单次前向**解出"未来观测特征 = 隐视觉子目标",喂 Alternate-DiT 动作专家。
- 即把"world"从"视频"重定义为"latent 特征":世界建模参数从 5B 级降到 **230M**、延迟降 ~**24×**(187ms),而 LIBERO/RoboTwin **标准榜**不输 3.5–5.5B 大模型。
- 代表:[[Chen et al. - LaWAM Latent World Action Models for Efficient Dynamics-Aware Robot Policies|LaWAM]](2026)、**[[BeingBeyond - Being-H0.7 a Latent World-Action Model from Egocentric Videos|Being-H0.7]]**(2026-04,BeingBeyond)。对照:π0.7(像素子目标、由单独迭代模型产)、LDA-1B(DINO latent 但联合扩散去噪、迭代)。
- **⚠️ 两个独立实例 ⇒ 代际划分成立**(此前仅 LaWAM 一例,单例撑不住一个代)。Being-H0.7 的诊断与本代论点逐字吻合:*"pixel-space prediction is a **costly and indirect substrate for control**, as it may model visual details irrelevant to action generation"*。
- **但第五代内部已分两支**(latent 的用法不同):
  - **隐子目标支**(LaWAM):复用 latent-action-model 的 decoder,**显式产出"未来观测特征"**当子目标,喂给动作专家。
  - **隐推理支**(Being-H0.7):在多模态上下文与带噪动作之间插一组 **learnable latent query** 当推理接口;训练时用**未来知情的 posterior 分支**(未来观测经冻结 ViT + Perceiver resampler 压成 K 个嵌入替换 query)与 prior 分支做**隐状态逐点对齐**;**推理时丢弃 posterior、无任何视觉 rollout**。**无显式子目标**,本质是 **privileged distillation**(posterior 看未来、prior 只凭当下把它对齐出来),因而也须**防 latent collapse**——与 [[JEPA]] 谱系同源。
- **谱系最低成本端点:纯辅助损失,无世界模型**(PHR-VLA,[arXiv:2608.27609](https://arxiv.org/abs/2608.27609),Texas A&M × Purdue,2026-08-27;**未建源笔记,仅记于此**):在 **SmolVLA 0.45B** 的 action-token 表征上挂一个轻量 future head,训练时用 **MSE** 回归"未来 H 帧视觉 latent 相对当前帧的变化量"(冻结 SigLIP / V-JEPA 2 编码演示里的未来帧),λ=0.02;**推理时整头丢弃,与原 SmolVLA 逐字节相同、零额外延迟**。问题诊断与 Being-H0.7 的"稀疏动作监督 → shortcut mapping"同源,但机制退化到最简:没有 posterior 分支、没有 latent query、没有子目标。LIBERO 84.1→**88.4%**(Long +8.4)、Meta-World 56.7→57.8%(噪声级)、真机 Franka 四拆解任务 63.3→**82.5%**。
  - **值得记的是五组受控消融("target 结构决定收益,而非有无未来预测目标")**:①**腕部相机 > 双相机 > 第三视角**(88.4 / 88.1 / 86.8——接触区短程变化才是任务相关动力学,第三视角把容量花在背景上);②**patch 级 > 全局池化**(每个视角都成立);③**预测 Δlatent > 预测绝对 latent**(88.4 vs 86.7——不必重建当前帧已有的静态内容);④**专为动力学预测训练的 V-JEPA 2 并不优于 SigLIP**(LIBERO、真机皆输,仅 Meta-World 赢)——编码器选择无定论;⑤λ 0.005→0.02 单调改善。
  - **⚠️ 打折项**:单基座(0.45B)验证,对 π0.5 量级是否成立无证据;真机增益大头来自单个任务(Task IV 6/30→23/30,而换 JEPA 编码器同任务仅 9/30,同方法两变体差 14 次 ⇒ 真机方差大);"Reasoning" 为命名夸大(无推理步骤,一个回归头);带星号基线抄自他文;作者自陈不做推理时纠错、只塑造表征。
  - 对本页定位的含义:第三代"训繁推简"到此退化为**"训练时多一个损失项"**——GigaWorld(5B 视频分支)→ Being-H0.7(双分支蒸馏)→ PHR-VLA(单 MSE 头),"训繁"的繁可以很轻。可直接迁作**自家 VLA 微调时加辅助监督的默认配置**:腕部 / patch / Δlatent / SigLIP。
> 注:LaWAM 突破了本页"WAM = 视频 backbone + 动作"的原定义(见开头"边界澄清")——它是**隐空间 WAM**,把 world 从像素移到 latent。

## 与其他路线对比

| 路线 | 泛化来源 | 数据需求 | 代表工作 |
|------|---------|---------|---------|
| WAM | 数据覆盖 | 大规模视频+动作数据 | [[GigaWorld Team - GigaWorld-Policy An Efficient Action-Centered World-Action Model\|GigaWorld-Policy]], [[Bi et al. - Motus A Unified Latent Action World Model\|Motus]], [[AgiBot - GE-Act 2.0 Pretraining and Scaling a World-Action Model for Robotic Manipulation|GE-Act 2.0]]（首条 scaling 曲线） |
| VLA | 数据覆盖 | 大规模动作数据 | π0.5, RT-2 |
| 任务拆解 | 结构化推理 | Zero-shot | ReKep, Code as Policies |

## Open Questions

1. 视频生成质量对动作预测的影响边界在哪里？GigaWorld-Policy 证明推理时可以不要，但训练时仍是关键；PHR-VLA 进一步显示训练时也不必生成——对未来 latent 变化量做一次回归即有收益（+4.3 LIBERO），但这只在 0.45B 单基座上验证过
2. 端到端路线的数据天花板在哪？能靠更多数据持续提升吗？——[[AgiBot - GE-Act 2.0 Pretraining and Scaling a World-Action Model for Robotic Manipulation|GE-Act 2.0]] 给了第一条真机零样本曲线：300 → 30,000 h 无饱和，但 30,000 h 后仍有 24/100 任务零成功，且不是等算力对照
4. **validity gap 在隐空间 WAM 里是否同样存在？** LaWAM 单次前向出的隐子目标也是“独立采样的未来”，理论上有同样的模态错配，但第五代工作都没讨论；GE-Act 2.0 的 KASO 只在像素可解码 latent 上验证过
3. WAM 和 VLA 最终会收敛到同一个架构吗？

## Related

- [[Task decomposition]] — 另一条路线
- [[Spatial Intelligence for Embodied AI]] — 更广的具身智能主题
- [[GigaWorld Team - GigaWorld-Policy An Efficient Action-Centered World-Action Model]] — 第三代（causal mask 硬隔离 + 推理丢分支）
- [[Bi et al. - Motus A Unified Latent Action World Model]] — 第四代（时间步调度，模式可切换）；同属 latent-action 谱系
- [[Chen et al. - LaWAM Latent World Action Models for Efficient Dynamics-Aware Robot Policies]] — 第五代（隐空间子目标，单次非迭代；冻结 DINOv3 + LAM-decoder 当世界模型，230M，比像素 WAM 快 ~24×）
- [[AgiBot - GE-Act 2.0 Pretraining and Scaling a World-Action Model for Robotic Manipulation]] — **第二代改良**（坚持先生成再 IDM；单步 MeanFlow + 64× 压缩 CoAE 修“慢”，validity gap + KASO 修“生成-动作错配”；IDM 可单独预训练吃失败 / rollout 数据；首条 300 → 30,000 h 真机零样本 scaling 曲线；⚠️ 代码权重未发布）
- [[Visual token budget - pruning vs compression]] — 本页三/四/五代的"推理时要不要生成视频"演进，是具身侧在**视觉 token 预算轴**上的压缩派答案（对照视频理解侧的 EVS 剪枝派）
- [[Embodied Brain Models]] — WAM 作为 Predictive Spatial × VLA 嫁接；范式 A 的 MoT 扩展
- [[Huang et al. - ReKep Spatiotemporal Reasoning Keypoint Constraints for Robotic Manipulation]]
