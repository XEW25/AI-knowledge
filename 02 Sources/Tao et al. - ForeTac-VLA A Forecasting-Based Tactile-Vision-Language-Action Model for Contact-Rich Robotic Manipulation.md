# Tao et al. - ForeTac-VLA: A Forecasting-Based Tactile-Vision-Language-Action Model for Contact-Rich Robotic Manipulation

## Metadata

- **Type**: source note
- **Authors / organization**: Zhengyu Tao, Xin Li, Xin Wang；Texas A&M University
- **Version**: arXiv:2609.20980v1，2026-09-17
- **Source**: [arXiv](https://arxiv.org/abs/2609.20980) · [v1 HTML](https://arxiv.org/html/2609.20980v1) · [v1 PDF](https://arxiv.org/pdf/2609.20980v1) · [官方项目页](https://foretac-vla.github.io/)
- **Raw tier**: URL-only；不下载或 Git 跟踪 PDF
- **Verification status**: 已读 HTML 方法公式、训练设置与表 I/II；实验为作者自报，未复现。未独立核验视频或预测图，不以图中细节补充证据
- **Code status（2026-09-30）**: 官方页明确标注 Code / Dataset Coming soon；GitHub 检索仅找到[展示网站仓库](https://github.com/ForeTac-VLA/ForeTac-VLA.github.io)。模型实现未发布，未做代码核实。官方页仍有匿名及 Paper Coming soon 占位，但论文已在 arXiv 发布
- **Ingested**: 2026-09-30，经 Ethan 讨论确认

## Summary

**接触操作需要感知图像难以区分的物理状态。** ForeTac-VLA 在 π₀.₅ 上加入触觉编码、双向融合和未来触觉预测，用预测结果条件化动作生成。本库收录为触觉辅助控制案例，补充 [[Embodied Cerebellum Models]] 的感知维度；证据限于小规模真机任务，不能据此建立通用触觉控制或成熟触觉世界模型的结论。

## 任务与证据

UR7e 机械臂配平行夹爪与双指压力传感器。四任务分别是插销入孔、易碎薄片夹取（Chip Handling）、拧盖、擦板；核心难点依次为接触对齐、避免夹碎、避免滑动及持续表面接触。每任务 70 条演示、20 次评测。表 I 完整方法成功次数为 20、19、19、18，总计 76/80；这是任务适配后的表现，不是零样本新技能测试。[§IV](https://arxiv.org/html/2609.20980v1#S4)

| 表 II 配置 | 平均成功率 |
|---|---:|
| 无触觉 | 58.75% |
| 直接拼接触觉 | 68.75% |
| 交叉注意力，无预测 | 80% |
| 单向交叉注意力＋预测 | 81.25% |
| 双向交叉注意力＋预测 | 95% |

**归因限制（分析）**：单向融合上加入预测只增加 1/80 次成功；显著增益出现在完整组合，不能把全部提升归于预测。作者称无预测时双向与单向融合在其实现中等价，因而未单列双向无预测；这也提示应按实际信息路径理解消融。单一本体/传感器、每任务小样本，以及暗光/杂乱背景的视觉分布变化，均不足以证明跨技能、跨传感器泛化。

## 触觉怎样接入 π₀.₅

原版 π₀.₅ 不具备本文的触觉接口。这里是**增设模块并适配模型**，不是给原版 API 多传一个字段。[§III](https://arxiv.org/html/2609.20980v1#S3)

1. 每指 7×4 压力阵列的最近 10 帧及变化量，经新增 MLP 变成连续触觉 token。
2. 视觉语言/状态特征与触觉特征互作 Q 与 K/V，进行双向交叉注意力，得到融合后的两组特征。
3. 新增 Transformer 预测器读取两组融合特征，预测未来压力变化，再加上当前压力，恢复未来触觉状态；预测跨度约 83、167、250、333 ms。
4. 未来触觉重新编码为 token，与融合后的视觉语言特征拼接为条件前缀，由 flow-matching 动作专家生成动作块。

**预测器是额外网络，但“小模型”规模未获证实**：原文不足以确定层数或参数量。公式未显式输入候选未来动作，因此应称接触趋势预测，不应描述为可比较不同候选动作后果的动力学模拟器。

训练联合优化新增模块与 VLA 的 LoRA 参数，其余预训练参数冻结。动作条件在前 75% 训练步使用真实未来触觉，后 25% 改用预测触觉，使策略适应预测误差；部署无未来真值。数据轨迹的后续传感器记录提供未来触觉监督，但论文没有充分披露预测损失与权重等实现细节。

## 条件前缀与 KV Cache 的边界

[[Physical Intelligence - pi0.5 a VLA with Open-World Generalization|π₀.₅]] 的 [openpi 推理实现](https://github.com/Physical-Intelligence/openpi/blob/main/src/openpi/models/pi0.py)先计算 prefix 的逐层 K/V，再由动作专家在多步去噪中复用。**前缀 token 是条件表示，KV Cache 是逐层计算后缓存的形式**；两者不是相互排斥的接口。

**据架构推断，尚非 ForeTac-VLA 代码事实**：若沿用标准缓存路径，新的前缀既会改变原位置的 K/V（视觉语言特征已经融合当前触觉），又会为未来触觉 token 增加 K/V 位置。应理解为“含触觉的新前缀生成缓存”，不能断言作者保留旧缓存不动，只把一组触觉 K/V 追加到末尾。插入层、投影、掩码与缓存更新实现均待代码核实。

## 与库内工作的联系

- [[Ji et al. - Catch Me If You Can Real-Time Feedback Denoising for Responsive VLAs|VLA-Feedback]] — 响应速度与条件信息是不同维度：前者利用最新视觉完成块内修正，本文让动作条件包含接触历史及预期变化。两者组合未验证
- [[Embodied Cerebellum Models]] — 控制效果不仅取决于推理多快，也取决于能否感知接触状态；本文未验证端侧高频部署
- [[Real-robot evaluation]] — 保留试验次数、消融归因与分布变化范围，避免把平均成功率泛化为通用能力
- [[World-Action Models]] — 预测辅助行动的概念联系；本库 WAM 谱系不应仅因出现“未来预测”就把本文归入其中

## Open questions

- 预测器结构、损失配置、逐层前缀接口、动作块执行时域和实测延迟仍需实现证据
- 训练是否共享一个覆盖全部任务的 checkpoint，论文表述不足以确定；不能由每任务数据预算推断独立训练
- 需区分触觉预测准确性、信息融合和额外参数容量对控制收益的贡献

## tags

#vla #tactile #contact-rich-manipulation #forecasting #multimodal-fusion #pi05
