# Being-H0.7: A Latent World-Action Model from Egocentric Videos

## Metadata
- **Type**: source note
- **Format**: arXiv (cs.RO)，**v1 2026-04-30**（文内标注 Apr 14, 2026）
- **Authors**: **BeingBeyond Team**（团队署名）
- **arXiv**: [2605.00078](https://arxiv.org/abs/2605.00078) · 项目页 research.beingbeyond.com/being-h07
- **Raw tier**: URL-only（未下载 PDF；HTML 正文自读）
- **Verification status**: 问题诊断 / 双分支机制 / 骨干 / 主要结果 **自读 HTML 核实**（2026-08-06）；完整结果表与消融未逐项核对
- **Related**: [[World-Action Models]], [[Chen et al. - LaWAM Latent World Action Models for Efficient Dynamics-Aware Robot Policies]], [[JEPA]], [[VLA - Vision-Language-Action Models]], [[Being-0 - a Humanoid Robotic Agent with VLMs and Modular Skills]], [[DeepCybo - PhysBrain Human Egocentric Data as a Bridge from VLMs to Physical Intelligence]]
- **Tags**: #wam #latent-world-model #vla #egocentric #privileged-distillation #humanoid #embodied

## Summary

**第五代 WAM（跳出像素空间）的第二个独立实例**——与 [[Chen et al. - LaWAM Latent World Action Models for Efficient Dynamics-Aware Robot Policies|LaWAM]] 殊途同归：都主张**不生成未来帧**，把"世界"从像素移到 latent。

**双重问题诊断**（这是全篇最有价值的部分）：
1. **对 VLA**：*"observations are dense and semantically rich, while **action supervision is sparse and highly correlated with demonstrations**. This imbalance **encourages shortcut mappings** from visual cues to actions, rather than learning intermediate representations of dynamics, contact, and task progress."*
2. **对像素 WAM**：*"pixel-space prediction is a **costly and indirect substrate for control**, as it may model visual details irrelevant to action generation and introduces substantial training or inference overhead."*

⇒ 目标：**把 future-aware reasoning 带进 VLA 式策略，但不生成未来帧**。

## 机制：latent queries + 未来知情的双分支

在**多模态上下文与带噪动作之间**插入一小组**可学习 latent query**，作为**紧凑的推理接口**。然后用一个**未来知情的双分支**训练它：

| 分支 | 输入 | 用途 |
|---|---|---|
| **Prior（可部署）** | 指令 + 观测上下文 + 状态 + **latent queries** | **主分支**，部署时只用它 |
| **Posterior（仅训练）** | 把 latent queries 换成**未来观测 `õ_{0:T}` 的 K 个嵌入** | 揭示"未来信息里哪部分对决策真有用" |

- 未来观测先经**冻结的预训练 ViT** 编码，再由 **Perceiver resampler** 聚合成 K 个嵌入（K 与 prior 的 latent query 数一致，保证两支在 latent 推理位置**结构对齐**）
- 两支**共享同一 context、backbone 与动作生成通路** ⇒ **单次 backbone 前向**即可完成双分支
- **Joint alignment**：在对齐层的 latent 推理位置上对两支隐状态施加**逐点对齐损失**
- 配**轻量正则防 latent collapse**
- **推理时丢弃 posterior 分支，不做任何视觉 rollout**

> **本质是 privileged distillation**：posterior 拿到"未来"这个特权信息，prior 必须只凭当前观测把它对齐出来。这与 [[JEPA]] 那条"隐空间预测 + 防塌缩"谱系同源——**它也必须处理 latent collapse**。

**骨干**：建在 **Being-H0.5** 之上，**InternVL3.5 当理解专家 + Qwen3 当动作专家**；在**人类 + 机器人混合操作数据**上预训练，遵循 **UniHand 2.0** 的统一序列格式。

## Results（核实）
- **六个仿真 benchmark**（LIBERO / CALVIN / RoboTwin / RoboCasa 等），**总体 SOTA，平均排名最高**（Table 1）
- **LIBERO-plus 微调后 84.8%** —— 对**视角偏移、新纹理、传感器噪声**的稳健性
- **灵巧人形操作平均成功率 49.2%**
- 真机跨本体（**ARX** 为主，另有 Franka / Unitree）；论文小标题点出优势分布：**动态与运动为主的任务上预测优势最明显**；物理与长程套件是第二个强项；泛化提升跨本体保持

## Why it matters（对本库）
1. **给 [[World-Action Models]] 第五代补第二个独立实例**——此前只有 LaWAM 一例，单例支撑不住一个代际划分。两者独立收敛到"**不生成未来帧、把世界搬进 latent**"，代际划分因此成立。
2. **但两者的 latent 用法不同**，值得对照：LaWAM 复用 latent-action-model 的 decoder 产出**隐视觉子目标**再喂动作专家；Being-H0.7 用 **prior/posterior 对齐**把未来信息**蒸进一组 latent query**，没有显式子目标。⇒ 第五代内部还有分支。
3. **与 [[JEPA]] 谱系的接口**：都是隐空间预测 + 必须防塌缩。Being-H0.7 是这条思路在**动作监督下**的一个实例。
4. **对 VLA 失败的表征学习式归因**（sparse action supervision → shortcut mapping）是本库此前没有的一种解释——与"长程 p^N 崩塌"（结构性归因）互为补充。
5. **团队范式迁移的终点**：与同组的 [[Being-0 - a Humanoid Robotic Agent with VLMs and Modular Skills|Being-0]] 对照，见该页"范式迁移"一节。

## What feels limited
- **未与自家 Being-0 做任何对照**（全文 0 次提及）——所以"模型层是否真的盖过了系统层"没有同队内的直接证据。
- 团队署名、无个人作者列表；**代码/权重发布情况未核实**。
- 49.2% 的灵巧人形成功率**绝对值不高**，说明这类任务仍远未解决。
- prior/posterior 对齐引入的超参（K、对齐层选择、防塌缩正则强度）稳健性未逐项核对。

## Related
- [[Chen et al. - LaWAM Latent World Action Models for Efficient Dynamics-Aware Robot Policies]] — 第五代的另一实例（隐视觉子目标路线）
- [[World-Action Models]] — 代际归属
- [[JEPA]] — 隐空间预测 + 防塌缩谱系
- [[Being-0 - a Humanoid Robotic Agent with VLMs and Modular Skills]] — 同团队的前一范式
- [[DeepCybo - PhysBrain Human Egocentric Data as a Bridge from VLMs to Physical Intelligence]] — 同为第一视角人类视频预训练路线
