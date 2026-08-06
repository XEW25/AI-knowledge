# Sentinel: Unpacking Failure Modes of Generative Policies — Runtime Monitoring of Consistency and Progress

- **Raw note**: [[2026-08-06 - Agia et al. - Sentinel Unpacking Failure Modes of Generative Policies Runtime Monitoring of Consistency and Progress]]

## Metadata
- **Type**: source note
- **Format**: arXiv (cs.RO)，35 页含附录；有项目页
- **Authors**: Christopher Agia, Rohan Sinha, Jingyun Yang, Zi-ang Cao, Rika Antonova, **Marco Pavone**, **Jeannette Bohg**（Stanford 系；机构行未逐字核对）
- **arXiv**: [2410.04640](https://arxiv.org/abs/2410.04640)
- **Raw tier**: URL-only（未下载 PDF）
- **Verification status**: 机制 / STAC 定义 / VLM 实现与 prompt / 主要结果与消融 **自读 HTML 全文核实**（2026-08-06）；机构行、部分附录表格未逐项核对
- **Related**: [[Embodied failure detection]], [[Home robot architecture - a hierarchical embodied agent]], [[Robot data engine]], [[Zhang et al. - Harness VLA Steering Frozen VLAs into Reliable Manipulation Primitives via Memory-Guided Agents]], [[Embodied Cerebellum Models]]
- **Tags**: #failure-detection #runtime-monitoring #dependability #diffusion-policy #conformal-prediction #vlm-as-monitor #ood-detection #embodied

## Summary

**具身失败检测这条线上最完整的一篇实证工作**：把失败**分成两类、各配一个专门检测器**，并论证"为什么必须分开"。

| 失败类 | 检测器 | 特征 |
|---|---|---|
| **Erratic failures**（行为紊乱） | **STAC** —— 时序动作一致性的统计量 | **时间敏感，但视觉上细微** |
| **Task progression failures**（不推进） | **VLM 运行时监控**（零样本） | **视觉上明显（停滞/偏离），但时间上自洽** |

两者**并行运行**，检出 **>97%** 的未知失败（跨仿真 + 真机），比单用任一个**多 18%**。

## STAC：策略是否在自我矛盾

生成式策略每次输出 **action chunk**（预测 horizon `h`），每 `k` 步重规划（`k < h`）⇒ **t 时刻与 t+k 时刻预测的 chunk 在时间上重叠**。STAC 就是这两个分布在重叠窗口上的**统计距离** `D(π̄_t, π̃_{t+k})`。

**假设（原文）**：预测型策略相当于 *"possessing an internal world model"*。分布内 → 内部模型准确 → 它在 t 时刻隐含预测的 `s_{t+k}` 与 t+k 实际观测吻合 → 早先承诺的动作分布现在看依然合理 → **距离小**；OOD → 内部模型失准 → **距离大**。

> ⚠️ 所以它测的是**"策略与自己过去的预测相矛盾"**，**不是**"策略不确定"，也**不是**单个时刻的采样方差。

**为什么必须用分布距离**：生成式策略**多模态**——同一任务有多种合法解法，比较均值会把"两个都合法的不同模态"误判为不一致。消融坐实了这点：**用非统计距离（如 min. distance）比 baseline 还差，因为它忽略了动作多模态性**。

**实现**：**MMD + RBF 核**的经验距离（解析计算不可行——要 marginalize 掉非重叠动作与 diffusion 中间去噪步）；高多模态域采 **B=256** 条序列。**校准只需少量成功 rollout**，附录给出 **conformal 保证与证明**。**策略无关**（对比 DDPM-loss baseline 只适用于 diffusion）。

## VLM 监控：零样本，输入是抽帧视频

- **不微调** —— 零样本 prompt 现成闭源模型：**GPT-4o / Claude 3.5 Sonnet / Gemini 1.5 Pro**，跨模型用**同一套 prompt**
- **输入** = 抽帧**视频** `I_{0:t}`（约 **1Hz**，ν∈{1,2} 即足够辨认运动）+ 任务描述 + **时间限制** + **已用时间**
- **prompt 三段式强制推理**：`Questions`（先自生成任务相关问题）→ `Answers`（细粒度视觉细节）→ `Analysis`（判断；**显式要求对比"已用 x 秒 / 共 N 秒"**，并被告诫"除非不太可能在限定时间内完成，否则不要判失败"——明显的**防误报** prompt 工程）
- 变体：Video QA / **+Success Video** / **+Goal Images** / Image QA（消融"视频 vs 单图"）
- **每 episode 仅查 2 次**，理由三条：不推进失败发生在更长时标（查密了无意义变化）；闭源 VLM **贵**（STAC 成本可忽略）；**不推进失败不需要立即干预**
- **非阻塞 API 调用** ⇒ 不卡控制环

## Results（核实）

| 项 | 数值 |
|---|---|
| STAC 检出 **erratic** 失败 | **99%** |
| Sentinel 检出未知失败（sim+real） | **>97%**；组合 vs 单用 **+18%** |
| **task progression**：STAC 单独 | TPR 仅 **44%** |
| **task progression**：组合 | **93% TPR**，FPR 仅 +7% |
| **erratic**：VLM 单独 | TPR **77%**，且**显著更慢** |
| **真机 Push Chair** | Sentinel 总准确率 **95%**；VLM **90% TPR / 100% TNR**（真机优于仿真，视觉域差距更小） |

**关键消融**：PushT（多模态域）中 **STAC 是唯一 balanced accuracy >90% 的方法**；给 baseline 加时序一致性**至多边际提升**（起作用的是"时序 × 统计"的组合）；**horizon 敏感**：k=2→TPR 61%，k=4→78%，**k=8（h=16）→95%**。

> ⚠️ baseline 里包含 **Diffusion Output Variance**（对 B 条采样算方差）——**即"看采样方差"这一朴素直觉，被 STAC 明确胜过**；原文另指出它"does not quantify epistemic model uncertainty"。

**实验设置**：PushT（测多模态）／Close Box、Cover Object（双移动机械臂，**14-DoF**）／**Push Chair 真机**（7-DoF 单臂移动操作，非抓取式）。Diffusion policy，演示 200/50/50/**15（真机）**；仿真用 PointNet++ 版 DP，真机用 **EquiBot**（SIM(3)-等变）。OOD 由随机化物体尺度/位姿制造。

## Why it matters（对本库）

1. **[[Embodied failure detection]] 里"机制③ 策略自身信号"的真实机制来源**。此前该条描述是推断（"多采样看方差"），本文给出真机制（**时序自一致性 + 分布距离**），并**证伪了朴素方差做法**（它是被击败的 baseline）。
2. **它独立验证了本库推导的分层结构**，且给出了**更完整的分层依据**——见下。
3. **conformal prediction 的第三个落点**：KnowNo（语义/规划层）、FAIL-Detect（执行监控层）、STAC（动作一致性层）都用 CP 把原始分数变成**有保证的决策**。⇒ CP 是这条线的**共同连接组织**，也是"漏报/误报权衡"可调的那个旋钮。
4. **"只需成功数据"再获一例**：STAC 的校准集是**成功 rollout**，与 FAIL-Detect *"detect failures without failure data"* 同向 ⇒ 本库此前给"学出的判别器"标注的门槛（**必须采失败样本**）**过强，需修正**。
5. **真机已验证**（95% 准确率）——与 [[Zhang et al. - Harness VLA Steering Frozen VLAs into Reliable Manipulation Primitives via Memory-Guided Agents|Harness VLA]] 的全仿真形成对照：**失败检测这条线的真机成熟度高于 harness 编排那条线**。

### 分层的真正依据是三维，不只是成本
本文让"哪个检测器放快环、哪个放慢环"的判据完整了：

| 维度 | erratic failures | task progression failures |
|---|---|---|
| **检测成本** | STAC 可忽略 | VLM 贵 |
| **干预紧迫性** | **需立即干预** | 不需要 |
| **信号模态**（最本质） | 在**动作空间**明显、**视觉上细微**（VLM 仅 77%） | 在**视觉上明显**、**动作空间上自洽**（STAC 仅 44%） |

> **第三维才是不能只用一个检测器的根本原因**：两类失败**在不同的表征空间里才可见**。成本和紧迫性只决定"放在哪个频率层"，模态互补决定"必须有两个"。

## What feels strong
- **失败分类学先于方法**：先问"生成式策略会怎么坏"，再给每类配检测器——比"再提一个更好的 OOD 分数"更有结构。
- **STAC 的假设优雅且可检验**：把策略当隐含世界模型，用它"和过去的自己吵架"当信号；且**策略无关**、成本可忽略。
- **消融直击要害**：非统计距离更差 ⇒ 证明多模态性是核心难点；朴素方差 baseline 被击败 ⇒ 反直觉但有说服力。
- **真机 + 仿真双验证**，且诚实报告 VLM 在真机反而更好的原因猜测。
- prompt 设计（自问自答 + 显式时间预算 + 保守指令 + 非阻塞）**可直接复用**。

## What feels limited
- **需要重规划重叠**：STAC 依赖 `k < h` 的 chunk 重叠结构；对**单步策略或 k=h** 的架构不适用（k=2 时 TPR 已掉到 61%，说明对 horizon 配置敏感）。
- **VLM 靠闭源 API**：成本、延迟、可用性、版本漂移都是部署风险；且**跨域表现不稳**（GPT-4o 与 Claude 在不同域各胜一场）。
- **只检测、不恢复**：给出告警，但不提供重试/恢复策略（与 Harness VLA 互补而非重叠）。
- 阈值需**按域校准**（收集成功 rollout 校准集），换本体/换任务要重做。
- 域数量有限（4 个），真机仅 1 个任务、10 成功 + 10 失败 rollout ⇒ 真机结论的统计功效有限（参见 [[Real-robot evaluation]] 的统计功效讨论）。

## Open questions（接本库）
- STAC 能否迁移到 **flow-matching / 自回归 action-token** 策略？（论文称策略无关，但只在 diffusion 上验证）
- 与 [[Zhang et al. - Harness VLA Steering Frozen VLAs into Reliable Manipulation Primitives via Memory-Guided Agents|Harness VLA]] 组合：STAC 能否直接充当 `τ`（终止判据）里"该放弃了"的那一半？
- CP 的 α 如何按"漏报传播代价 vs 误报物理代价"来定？——这是 [[Embodied failure detection]] 提出的目标函数，本文提供了旋钮但未讨论如何选。
- VLM 监控能否用**端侧小模型**替代闭源 API（对应本库"L2 端侧判别器"的位置）？

## Related
- [[Embodied failure detection]] — 本文是其机制②③⑤的实证来源
- [[Home robot architecture - a hierarchical embodied agent]] — dependability 脚手架（本文即其中"失败检测/运行时监控"一格）
- [[Zhang et al. - Harness VLA Steering Frozen VLAs into Reliable Manipulation Primitives via Memory-Guided Agents]] — 检测 vs 恢复，互补
- [[Robot data engine]] — 质量信号 / 判别器的买断制
- [[Embodied Cerebellum Models]] — 多速率栈（本文的成本×紧迫性分层落在此）
- [[Real-robot evaluation]] — 真机统计功效
