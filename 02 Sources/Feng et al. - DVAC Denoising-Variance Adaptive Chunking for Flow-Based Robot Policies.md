# Denoising Tells When to Replan: Denoising-Variance Adaptive Chunking for Flow-Based Robot Policies (DVAC)

- **Raw note**: [[2026-08-15 - Feng et al. - DVAC Denoising-Variance Adaptive Chunking for Flow-Based Robot Policies]]

## Metadata
- **Type**: source note
- **Format**: arXiv (**cs.RO**), v1, 2026-06-02
- **Authors**: Xiangdong Feng, Yuxuan Cheng, Chen Shi, Boyao Han, Yuxuan Yan, Yitong Hong, Zhuotao Tian, Li Jiang
- **Organization**: **深圳河套（Shenzhen Loop Area Institute）** + **香港中文大学（深圳）**；另涉湖南大学、西安交大、人大、哈工大（深圳）、北理工
- **arXiv**: [2606.03847](https://arxiv.org/abs/2606.03847)
- **Raw tier**: URL-only（未下载 PDF）
- **Verification status**: 机制 / 公式 / 算法 / 尺度自适应阈值 / 全部主表数值 / 消融与阶段相关性 / 局限 **自读 HTML 全文核实**（2026-08-15）；附录的误差界证明只读了结论陈述，**未验算**
- **Related**: [[Embodied Cerebellum Models]], [[Embodied failure detection]], [[Physical Intelligence - pi0.5 a VLA with Open-World Generalization]], [[VLA - Vision-Language-Action Models]], [[Seligmann et al. - VLA-FAIL Efficient Task Failure Detection for Finetuned Vision-Language-Action Models]], [[Romer et al. - FIPER Failure Prediction at Runtime for Generative Robot Policies]]
- **Tags**: #action-chunking #replanning #inference-time #flow-matching #vla #edge-deployment #efficiency

> ⚠️ **归类提示：这不是失败检测工作。** 全文 `failure detection` **0 次命中**，`conformal` **0 次命中**。它与失败检测共用**同一族信号**（策略自身的不确定性），但**用途完全不同**：不是报警，而是**决定这次执行多少步再重规划**。作者自己也划清了这条线（见局限）。

## Summary

它问的问题很朴素但确实没人正面答过：

> "**how long should a predicted future be trusted before replanning?**"

现有 chunked policy 大多**固定执行步数**，隐含假设"可信任的时域跨任务、跨状态、跨阶段恒定"。已有的自适应方案要么要额外候选块、要么要额外启发式、要么要任务专属训练。作者于是问：**能不能让策略自己的推理过程告诉我们何时停？**

## 核心观察：去噪方差就是一个免费的阶段检测器

flow matching 推理时每一步都会产生一个中间的**干净动作估计** `x̂₀`。这些估计**跨去噪步的波动**，反映了每个未来动作有多稳定。作者在 LIBERO 上验证：

> **去噪方差在回合内高度非均匀，且与任务阶段吻合——手臂自由移动时低，接触密集/精度敏感的操作阶段陡升。** 四个 LIBERO suite 上 operating 阶段的平均去噪方差一致高于 moving 阶段。

**这个信号本来就在那里，只是所有部署都只取最后一步的结果，把整条去噪轨迹丢掉了。**

## 方法（training-free，纯推理期）

1. **尾部方差分数**：取最后 `L` 个去噪步的干净估计，对每个未来索引 `k` 算各动作维度方差之和 `V_s(k)`
2. **执行前缀**：`N_exec` = **第一个高方差未来索引之前**（保底 `N_min`，封顶 `N_max`）
   ⇒ **把稳定的前缀执行掉，在不稳定的动作被提交之前就重规划**
3. **尺度自适应阈值**：不同 rollout 的方差绝对尺度差别很大 ⇒ 用滚动缓冲收集近期方差，令 `τ_s = μ_s + α·σ_s`。`α` 是**相对本 rollout 局部分布**的容忍度，**不必匹配具体任务的原始方差尺度**

**理论支撑**（附录，未验算）：局部 Lipschitz 假设下，索引 `k` 处的端点误差被一个**正比于 `√V_s(k)`** 的量所界 ⇒ 尾部方差大 ⟺ 去噪积分误差上界大。

## 结果（核实）

**LIBERO（π₀.₅ 基座）**：**0.948 → 0.980**，同时**平均重规划 32.6 → 18.6（−42.9%）**。对比其他自适应 chunking 方法：AAC 0.950、AutoHorizon 0.961。

**跨 backbone（plug-and-play）**：Qwen2.5-VL-π 0.950 → 0.958（重规划 −29.9%）；Qwen3-VL-GR00T 0.933 → 0.938（−20.1%）。
⚠️ **增益明显依赖各 backbone 去噪轨迹的信息量**——π₀.₅ 涨 3.2pt，另两个只涨 0.8/0.5pt。

**RoboTwin**（16 任务均值）：0.359 → **0.416**。

**CALVIN-5**：基线 AvgSub 3.905 → DVAC **4.040**；⚠️ 而**固定阈值三档全部劣于基线**（3.716 / 3.576 / 3.588）⇒ **尺度自适应不是锦上添花，是必需的**。

**真机三任务**（放方块入碗 / 按序叠三块 / 试管移盘）：

| 方法 | 放方块 | 叠方块 | 移试管 |
|---|---|---|---|
| Fix15 | 0.800 | 0.700 | 0.433 |
| Fix40 | 0.533 | 0.433 | 0.233 |
| **DVAC** | **0.867** | **0.767** | **0.533** |

DVAC 同时在**成功率、任务耗时、重规划次数**三项上优于 Fix15。**Fix40 则证明"盲目拉长执行时域"会大幅牺牲成功率**——这条对照很有说服力。

**阶段相关性验证**：40 个 LIBERO 任务各取一条 rollout，逐推理步标 MOVING / OPERATING；**所有测试的 α 下都得到稳定负相关 r < −0.27（p < 0.05）** ⇒ DVAC 确实在操作敏感阶段缩短执行块。固定阈值的行为则随绝对阈值大幅波动。

## Why it matters（对本库）

**1. 它给"同一族信号"打开了第二种用法，这是本次三篇里最有结构性的一点。**
[[Embodied failure detection]] 里机制③收集的全部是"**测出不确定 → 停下 / 求助 / 重试**"。DVAC 是"**测出不确定 → 把执行粒度调细，多想几次**"。

> 同一个信号，一个当**刹车**，一个当**变速箱**。

⇒ 这提示本库的机制表漏了一整列：**不确定性的输出不止"报警"一种**。而且变速箱这一档**没有误报代价**——调细执行粒度最坏只是多花几次推理，不像误报会触发不必要的物理重试。按本页原则②（误报的物理代价），**这是一条严格更安全的消费方式**。

**2. 它把 [[Embodied Cerebellum Models]] 的"action chunking + 实时拼接"补成了一个完整的设计维度。**
该页此前只记了 **chunk 边界不连续**由 PI 的 RTC 处理。但那是**"块与块之间怎么接"**；DVAC 处理的是**"块该多长"**——同一层的另一半问题，此前是空的。而且它给出的答案与该页的多速率结构自洽：**执行时域本就不该是常数，它应随任务阶段变化**。

**3. "去噪方差 ≈ 精度瓶颈定位器"与 ENPIRE 撞上了。**
NVIDIA GEAR 的 **ENPIRE** 让 coding agent **通过搜索**才找到"该把自动复位点放在插针前那一刻"（把学习算力集中在精度瓶颈）。DVAC 说这个位置**策略自己一直知道**，只是没人读——`r < −0.27` 的阶段相关性就是证据。⇒ **一个免费的、在线的"关键阶段"定位器**，对自动复位点选择、数据采集加密、评测切片都可能有用。

**4. 它顺带给出了一个被低估的事实：执行时域本身是个可观的性能旋钮。**
π₀.₅ 在 LIBERO 上 **0.948 → 0.980，且推理次数减少 43%**——**准确率和成本同时改善**，而且**不训练、不改权重**。按 [[Embodied model function evolution - generalization as the master line|三种提升途径]]的分类，这是最便宜的一档里性价比很高的一个。真机上 Fix15 vs Fix40 的对照更说明：**很多部署可能正把这个旋钮拧错**。

## What feels strong
- **信号是白捡的**：整条去噪轨迹本来就算出来了，此前被丢弃。这类"重用已有计算"的工作通常最容易落地。
- **尺度自适应被证明是必需的，不是调参美化**——CALVIN 上固定阈值三档全部劣于基线，这个负结果报得很坦率。
- **阶段相关性做了显式统计检验**（40 任务、标注 MOVING/OPERATING、r 与 p 值），而不是只放一张漂亮曲线。
- **Fix40 这个对照选得好**：直接堵死"那你把执行时域调长不就省推理了"的质疑。
- **跨三个 backbone 验证 plug-and-play**，且**诚实报告增益不均等**。

## What feels limited
- ⚠️ **作者自陈这不是校准过的不确定性**："uses denoising variance as an **empirical proxy** for action stability rather than a **calibrated uncertainty or safety estimate**." ⇒ **不能当失败检测器用**（对比三篇检测工作全都有 conformal prediction 层）。
- **只适用于流/扩散式策略**（需要访问中间去噪轨迹）——自回归 VLA 完全不适用。
- **真机评测在任务多样性与本体规模上有限**（三个任务、单一本体）。
- 跨 backbone 增益差异大（3.2pt vs 0.5pt）⇒ **该信号的信息量是模型相关的**，换基座需重新验证。
- 仍有 `α`、`L`、`N_min`、`N_max`、滚动窗口容量 `m` 五个超参；虽然 `α` 是相对量、敏感性尚可，但**"training-free"不等于"零调参"**。

## Open questions（接本库）
- **作者自己指的方向就是本库最想要的**：把去噪方差与**视觉反馈、接触线索、任务进展指标**结合，构建更可靠的失败检测器。⇒ 这正是 [[Embodied failure detection]] 里"多信号组合"那条线，且 DVAC 提供的是一个**零成本的第四路信号**。
- 去噪方差与 **ACC**（[[Seligmann et al. - VLA-FAIL Efficient Task Failure Detection for Finetuned Vision-Language-Action Models|VLA-FAIL]]）、**ACE**（[[Romer et al. - FIPER Failure Prediction at Runtime for Generative Robot Policies|FIPER]]）的相关性有多高？三者都读"策略对动作的把握"，**可能高度冗余**——若冗余，按 [[Harness design]] 的 load-bearing 原则该只留最便宜的那个。
- **自适应执行时域会不会改变失败检测器的统计前提**？ACC/STAC 都依赖固定的 chunk 重叠结构；DVAC 让 `N_exec` 逐步变化，**重叠长度也随之变化** ⇒ 两者叠加时检测器需要重新校准。**这是个具体且尚无人处理的兼容性问题。**
- 高方差区段能否直接用作**自动复位点 / 数据采集加密点 / 评测切片点**（接 ENPIRE 的做法）？

## Related
- [[Embodied Cerebellum Models]] — 执行时域属该页"chunk 消费层"；补上了"块该多长"这一半
- [[Embodied failure detection]] — **同族信号的另一种消费方式**（变速箱 vs 刹车）；作者自陈可作为检测器的输入之一
- [[Physical Intelligence - pi0.5 a VLA with Open-World Generalization]] — 主要实验基座
- [[Seligmann et al. - VLA-FAIL Efficient Task Failure Detection for Finetuned Vision-Language-Action Models]] / [[Romer et al. - FIPER Failure Prediction at Runtime for Generative Robot Policies]] — 同族信号，用途不同；与本文存在待验证的冗余与兼容性问题
- [[VLA - Vision-Language-Action Models]] — 仅适用于 flow/diffusion 动作头
