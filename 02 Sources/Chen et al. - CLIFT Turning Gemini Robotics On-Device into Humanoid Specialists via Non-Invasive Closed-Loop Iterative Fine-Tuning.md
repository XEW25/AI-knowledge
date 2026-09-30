# Chen et al. - CLIFT Turning Gemini Robotics On-Device into Humanoid Specialists via Non-Invasive Closed-Loop Iterative Fine-Tuning

## Metadata

- **Type**: source note
- **Authors**: Yuxin Chen, Hari Srikanth, Nathan Jew, Menglin Wu, Pengcheng Wang, Junli Ren, Masayoshi Tomizuka, Peng Xu, Jinyu Xie, Ran “Thomas” Tian
- **Organizations**: UC Berkeley、Google DeepMind、NVIDIA Research
- **Version**: arXiv:2607.29172v1，2026-07-31
- **Source**: [arXiv](https://arxiv.org/abs/2607.29172) · [v1 HTML](https://arxiv.org/html/2607.29172v1) · [v1 PDF](https://arxiv.org/pdf/2607.29172v1) · [官方项目页](https://thomaschen98.github.io/clift/)
- **License**: 论文 CC BY 4.0；本笔记为整理与分析
- **Raw tier**: URL-only；不下载或 Git 跟踪 PDF
- **Verification status**: HTML 正文与附录 7–10 自读，公式按 HTML 数学表示核对；主结果另与官方网页表格对照。数值为作者自报，未复现，图像和视频未独立核验
- **Code status（2026-09-30）**: 论文标注 code coming_soon；尚未核实可用模型训练实现。托管服务访问资格、费用与部署交付细节未独立核实
- **Ingested**: 2026-09-30，经 Ethan 讨论确认

## Summary

**CLIFT 让仅开放托管 SFT 的机器人基座，也能从真机部署经验迭代改进。** 它沿用 [[Physical Intelligence - pi0.6 a VLA That Learns From Experience|Recap]] 的二值优势条件化，以偏好校准奖励与相似状态检索估计标签，再把标签写成普通文本交给微调服务。本库定位为 [[Robot data engine]] 的受限接口实现案例；贡献不在首次提出优势标签，而在标签估计、API 适配与人形真机验证。

## 权重闭源时怎样微调

用户提交观测、指令与动作数据，模型提供方持有权重并执行 SFT，交付可使用的定制策略。**非侵入式是用户不改内部架构或损失，不是策略权重不更新。** 仅有推理 API 不足以运行此流程，还需要托管微调和部署能力。

每一轮从原始基座重新微调，使用演示加累计重标注的部署数据；不从上一轮策略权重继续训练。这是数据迭代闭环，不是运行过程中实时改权重。[§2–3](https://arxiv.org/html/2607.29172v1#S3)

## 数据飞轮

1. **演示初始化**：人类遥操数据经 SFT 得到初始策略。
2. **真机采数**：在同一机器人和全身控制器上收集自主 rollout，包括失败和部分成功。
3. **奖励评分**：100 对人类轨迹偏好用于选择与偏好一致的 VLM 候选逐步评分，再蒸馏到共享 Qwen3-VL 奖励模型；奖励模型训练一次，各轮固定。
4. **检索相对比较**：以冻结 DINOv3 图像特征匹配其他轨迹的相近起始状态，每条供体轨迹至多贡献一个匹配片段；对约 1.8 秒后续奖励计算折扣回报，在比较集合前 30% 的动作块标正，其余标负。
5. **带标签 SFT**：正负动作块都进入训练，人类演示统一标正；部署时请求正向条件，再采数进入下一轮。

奖励模型希望评价进展、执行质量和可见安全行为；这些是学习评分，不构成安全保证。局部表现良好而整条失败的轨迹仍可贡献正标签，整条成功也不保证每块都标正。[§3、附录 7–8](https://arxiv.org/html/2607.29172v1)

## 标签怎样写进指令

官方页明确称优势写入 instruction 的 plain text，并在部署时设为 True。**完整字符串模板未公开，不能把示意字符串当作实现事实。**

示意样本：`图像/状态 + “交接盘子。Advantage: True” → 实际高质量动作块`；负样本用 False，监督目标仍是其实际动作。正常 SFT 学习两个条件分布，负标签不使损失变负，也不对动作直接取反。推理固定正条件，选择高质量那一支。

“文本”与“token”不是两种互斥注入方式：文本经 tokenizer 进入模型。Recap 明确使用 `Advantage: positive/negative`，安排在子任务后、动作前；CLIFT 的字符串、序列位置及 tokenizer 细节仍待实现核实。[项目页](https://thomaschen98.github.io/clift/) · [Recap §V-B](https://arxiv.org/html/2511.14759#S5.SS2)

## 与 Recap 的区别

| 维度 | Recap 的论文实例 | CLIFT |
|---|---|---|
| 共同学习机制 | 二值优势条件化，正负数据都训练，部署选正条件 | 明确沿用该机制 |
| 奖励目标 | 成功/失败及到成功的时间 | 人类偏好校准的密集进展与执行质量评分 |
| 评价网络 | 值函数预测未来累计回报，每轮更新 | 奖励模型预测逐步分数，训练一次后固定 |
| 优势基准 | 学习值函数，估计优势并阈值化 | 对已执行片段累计奖励，在相似起始状态的片段间排名 |
| 策略训练权限 | 可控制内部训练配方与目标 | 受限托管 SFT，改进信号编码进提交数据 |
| 每轮策略初始化 | 从预训练 checkpoint 重训 | 同样从基座重训 |

**奖励模型 R 与值函数 V 不能混称。** R 判断当前一步的质量；V 预测从当前状态继续的累计回报。CLIFT 仍需训练评价网络，它省去的是 Recap 每轮拟合值函数的过程，以实际轨迹回报的检索比较承担状态基准估计。

**优势判断（本库分析）**：更丰富的奖励可区分同样完成任务但接触/动作质量不同的执行；检索减少每轮值函数拟合，适合可反复采集相近状态的任务。状态难度校准不是 CLIFT 独有，Recap 的状态值函数也承担这项职责。奖励改进与检索替换是两个不同变量，原则上 Recap 也能学习偏好奖励。

**尚未证明整体更优**：缺少同一基座、同一奖励和同一数据下“检索 vs 值函数”的直接对照。检索需要足够相近经验，视觉相似不保证接触、速度等隐藏状态相同；值函数则可能泛化到缺少邻居的状态，但有拟合误差。不能将完整管线结果归因为检索优势估计更准确。

## 真机结果与评测范围

Unitree G1 双臂灵巧手，上身目标与下身运动命令由 RL 全身控制器追踪。动作块跨约 1.6 秒，执行后重规划。每任务初始人类演示约 2 小时，两轮飞轮，每轮每任务 100 次 rollout。

| 任务 | GROD 演示 SFT | GROD 两轮 CLIFT | π₀.₅ 演示 SFT → 两轮 CLIFT |
|---|---:|---:|---:|
| Box Packing，物体装箱 | 93% | 100% | 59% → 76% |
| Cup Insertion，一手稳定承载物、另一手将瓶子插入 | 70% | 98% | 50% → 56% |
| Bimanual Plate Handover，双手交接并放置盘子 | 53% | 96% | 5% → 30% |

以上为正文主结果与[官方表格](https://thomaschen98.github.io/clift/)一致的两轮终点，未独立读图。**原文数值一致性问题**：后面的基座对比段落还出现 GROD 84/88%、π₀.₅ 46% 等数字，未明确其与主结果的阶段/变体对应；不能把这些数字混入同一终点表，也不能擅自修正作者原文。

**评测也提供下一轮训练数据**：装箱/插入/交接分别固定 6/10/5 个初始配置，所有模型与轮次复用；它控制了起始条件差异，但测的是固定套件上的任务熟练化，不是独立留出配置或新技能泛化。[§4、附录 9–10](https://arxiv.org/html/2607.29172v1)

GROD 与 π₀.₅ 的预训练、架构等因素未独立控制，且仅有一个开放基座与有限侵入式基线；不能得出闭源普遍优于开源，或差距必然由预训练规模单独造成的结论。奖励的安全评分、示例恢复行为也不能替代部署验收。

## Related

- [[Robot data engine]] — 部署经验重标注，经托管接口反馈到策略
- [[Physical Intelligence - pi0.6 a VLA That Learns From Experience]] — 优势条件化的直接继承关系与替换环节
- [[Cloud-edge co-evolving embodied agent - a continuous-evolution framework]] — 闭源模型可通过数据接口接演进通道；微调和下发仍依赖提供方
- [[Real-robot evaluation]] — 固定套件与数据飞轮重用的结论边界
- [[Embodied AI - VLAs, world models, and cerebellum]] — 导航入口

## tags

#vla #data-flywheel #advantage-conditioning #managed-sft #humanoid #reward-model #retrieval
