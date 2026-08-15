# VLA-FAIL: Efficient Task Failure Detection for Finetuned Vision-Language-Action Models

- **Raw note**: [[2026-08-15 - Seligmann et al. - VLA-FAIL Efficient Task Failure Detection for Finetuned Vision-Language-Action Models]]

## Metadata
- **Type**: source note
- **Format**: arXiv (**cs.LG**), v1, 2026-06-19
- **Authors**: Florian Seligmann, Emiliyan Gospodinov, Enes Ulas Dincer, Gerhard Neumann
- **Organization**: **FZI Forschungszentrum Informatik, Karlsruhe** + **Autonomous Learning Robots Lab, KIT**（ERC SMARTI³ / **Robotics Institute Germany**）
- **arXiv**: [2606.21386](https://arxiv.org/abs/2606.21386)
- **Raw tier**: URL-only（未下载 PDF）
- **Verification status**: 机制 / 两个检测器构造 / 固定先验噪声推导 / OR 组合 / AUCPDT 定义 / 实验设置 / 消融数值 / 定性结论 **自读 HTML 全文核实**（2026-08-15）；⚠️ **主结果大表（Table 1/2）为 LaTeX 转文本，逐格数值未采信**，本note只引用正文明述的数字；⚠️ **延迟对比（Figure 1b）是柱状图，未逐值读取**
- **Related**: [[Embodied failure detection]], [[Romer et al. - FIPER Failure Prediction at Runtime for Generative Robot Policies]], [[Agia et al. - Sentinel Runtime Monitoring of Consistency and Progress for Generative Policies]], [[Xu et al. - FAIL-Detect Uncertainty-Aware Runtime Failure Detection for Imitation Learning Policies]], [[Feng et al. - DVAC Denoising-Variance Adaptive Chunking for Flow-Based Robot Policies]], [[Physical Intelligence - pi0.5 a VLA with Open-World Generalization]], [[Real-robot evaluation]]
- **Tags**: #failure-detection #runtime-monitoring #ood-detection #conformal-prediction #vla #flow-matching #dependability #efficiency

## Summary

**把已有的失败检测想法做到"几乎不要钱"，并且第一次在真正的大 VLA 上做。**

它对既有工作的三条批评就是它的设计约束（原文）：
> "existing task failure detectors require **computationally expensive action sampling**, are based on **architectural assumptions** that limit their applicability to VLAs, or need access to **failure rollouts**."

还有一条更狠的动机——**检测器自己会把系统推向 OOD**：
> "real-time VLA inference is already expensive, and **additional latency can itself perturb closed-loop execution and induce out-of-distribution states**."

⇒ 这不是"再提一个更准的分数"，而是**把成本这一维当成一等约束来重做**。

## 两个检测器

### LLMD：最后一层 token 级马氏距离
读**策略内部表征**——不是输入，也不是输出，而是**策略即将据以行动的那层特征**。

**核心技巧是"固定先验噪声"。** flow matching 的最后一层特征同时依赖观测 `o`、流时间 `t` 和噪声动作 `a_t`，后者引入了与观测无关的噪声。作者的解法很干净：

> 在 `t = 0` 处 `p₀(a|o) = N(0, I)` **与 `o` 无关**，所以可以采一个固定噪声 `a₀*` 并定义 `f*(o) := f(o, t=0, a₀*)`。

**`t > 0` 固定就不行**——那会引入人为的协变量偏移。这个推导是把 Mahalanobis OOD（原本是分类模型上的方法）搬到连续动作 flow matching 上的关键一步。

成本：`f*(o)` **只需一次前向且可与动作采样并行**；若不需要多模态行为，**直接从 `a₀*` 起采样动作，开销归零**。训练侧只需微调后对数据集做**一次无梯度预处理**求每 token 的 `μ_s`、`Σ_s`。

**逐 token 是必要的**（消融：全局单一统计量使 X-VLA@Drawer 的 AUCPDT 从 **0.19 劣化到 0.24**）。作者的解释有道理：预测越远的未来越难，模型内部行为本就不同。

### ACC：动作块一致性
receding-horizon 天然让相邻两个 chunk 重叠，比较重叠段即可。相对 STAC 的三处简化：

- **只要每步一个动作样本**（STAC 要 256 条）
- **只用 D=3 的末端绝对位置**（任何控制方式都拿得到）
- **速度归一化**：同样的绝对偏差，在慢速精细动作里比在快速移动里严重得多。消融证明这是关键（Libero-Plus Spatial 的 AUCPDT **0.38 → 0.28**）
- **强指数平滑 α=0.9**：成功执行中本来也会重规划，**只有持续不一致才是失败信号**

## 组合与指标
- **逻辑 OR**：`(s_ACC ≥ τ_ACC) ∨ (s_LLMD ≥ τ_LLMD)`
- 阈值用 **conformal prediction band**，但**刻意用时间恒定阈值而非时变**——理由是"*not applicable to episodes that vary significantly in length, such as in our real-world Drawer task*"
- **AUCPDT**（新指标）：AUCPR 不区分早晚，而"永远在 t=0 报警"零延迟但精度不可用。PDT 把**未检出记为 1**（假设回合结束时总能自动判定），于是它度量的是**相对"等到回合结束"这个自动基线的延迟缩减**；只保留 Pareto 最优阈值后取面积

## 实验设置
- **两个真 VLA**：**π₀.₅**（3.6B，PaliGemma，逐层 cross-attention）与 **X-VLA**（0.9B，Florence-2-Large，仅末层条件化）—— 覆盖了两种融合方式
- **六个真机任务**：Blocks、Stack T（高精度）、Cups（多模态演示）、Kitchen、Drawer（长程多阶段）、Mixer（语言条件）；**约 80 rollouts/任务 × 3 seeds**
- **仿真**：LIBERO-Plus（LIBERO + 扰动）
- **基线**：ACE（= FIPER 的动作块熵）、STAC、Diff（扩散损失），**均用 32 样本**，**因不具实时能力而在 rollout 回放上评测**

## 结果（核实，只取正文明述）
- **FAIL 是唯一在几乎所有真机与仿真任务上都进前三的方法**，且只有边际开销
- **两个检测器抓的是不同东西，只有组合才跨任务稳健**：
  - **ACC 检得更准**，擅长 OOD 下的**快速抖动**
  - **LLMD 检得更早**（不依赖行为紊乱、不需时间平滑），擅长**反复重试成死循环**与**退化为与环境无关的"默认动作"**
- **ACC vs STAC**：ACC 可视为 **STAC 的速度归一化单样本估计**，却**在几乎所有真机任务上胜过 STAC**；Libero-Plus 上 STAC 的 AUCPR 更好但 **ACC 检得显著更早**
  - 作者假设：**ACC 只与已执行的动作块比较，不与反事实轨迹比较**，因此在策略**于多个动作模态间做选择**时更少误报

## Why it matters（对本库）

**1. [[Embodied failure detection]] 机制③"便宜"那条限定要改写。**
该页此前的正确表述是"**离线训一次 + 在线推理便宜**"，且记了 STAC 因每步 256 条采样而**在真机上跑不起来**。VLA-FAIL 把这条推进了一大步：**ACC 是 STAC 的单样本估计，成本近零，而且在真机上更准更早**。⇒ "**策略自身信号 = 免费**"这个原本被收紧的说法，**在用对估计量的前提下重新成立了**。这不是理论争论——它是"能不能真放上机器人"的分界线。

**2. 它给机制③补了第三个信号位置：策略的内部表征。**
本库此前只有两处取信号：**观测侧**（FAIL-Detect 的 logpZO）与**动作侧**（STAC / ACC）。LLMD 取的是**最后一层特征**——策略即将据以行动的那层。这个位置的独特价值在实验里很清楚：**它能抓到"动作看起来很平稳但其实已经在空转"的失败**（死循环重试、默认动作）。

⇒ 这正好命中本页维度一里**最容易漏的"进展停滞"类**。此前该类只能靠停滞超时（机制②，很粗）或 VLM（机制④，很贵）；**现在有了一个近零成本的中间档**。

**3. 第一次在大 VLA 上验证，补上了一个真实的证据缺口。**
本库这条线的证据此前全部来自 Diffusion Policy / ACT 时代的**单任务策略**（Sentinel、FAIL-Detect、FIPER 皆如此——[[Romer et al. - FIPER Failure Prediction at Runtime for Generative Robot Policies|FIPER]] 自己就把"适配到 OpenVLA / π₀ / GR00T"列为 future work）。VLA-FAIL 在 **π₀.₅（3.6B）与 X-VLA** 上做，且**两者融合方式不同**（逐层 cross-attention vs 仅末层），方法仍然通用。⇒ **这条线到 VLA 时代是否还成立，第一次有了答案。**

**4. AUCPDT：检测时间终于进了指标本身。**
本库 [[Real-robot evaluation]] 一直强调指标定义会塑造研究方向。此前失败检测普遍报 AUROC/准确率 + 单独一个检测时间，**而单看任一个都可被套利**（一直等到最后 → 高准确率；第一步全报警 → 完美延迟）。AUCPDT 与 FIPER 的 **TWA** 是两个独立提出的、把两者绑在一起的指标。⇒ **同一个评测缺陷被两个组同时发现并各自补上**，说明这是该子领域当前的真实痛点。

**5. 它是"OR"的那一半，与 FIPER 的"AND"构成一对可直接对比的设计选择。** 见 [[Embodied failure detection]] 新增的组合逻辑一节。

## What feels strong
- **把成本当一等约束**，而不是做完再报个延迟数字；"检测器自身的延迟会诱发 OOD"这个论证尤其对。
- **固定先验噪声 `t=0` 的推导干净且必要**——不是工程 trick，是把 Mahalanobis OOD 搬到 flow matching 上绕不开的一步。
- **ACC 与 STAC 的关系被讲清楚了**（单样本速度归一化估计），并给出了**为什么更简单反而更好**的可检验假设（不与反事实轨迹比较 ⇒ 模态选择时更少误报）。
- 消融扎实：token-wise 与速度归一化**各自给出了具体数值**。
- 局限自陈诚实，尤其"会漏掉自信地停下 / 忽略语言指令"这一条。

## What feels limited
- ⚠️ **LLMD 需要访问微调数据**做预处理。这是个真实的部署门槛：**用别人发布的 checkpoint 时通常拿不到训练数据**，而这恰恰是 VLA 时代最常见的用法。（对比：FIPER 的 RND-OE 只需少量成功 rollout，不需要策略训练数据。）
- **ACC 依赖 receding-horizon 且要有足够重叠**，**完全开环整块执行时失效** —— 与 STAC 继承了同一个结构性约束。
- **会漏掉"特征与动作都自洽"的失败**：自信地停下、忽略语言指令 ⇒ 语义层仍需 VLM。作者自己指向了与 [[Agia et al. - Sentinel Runtime Monitoring of Consistency and Progress for Generative Policies|Sentinel]] 那类方法的组合。
- **基线是在回放上评的**（因其不实时）。这对 VLA-FAIL 的论点无害（反而是论点本身），但**意味着基线没有承受"检测延迟反过来扰动闭环"的代价**，比较对基线略宽容。
- 恒定阈值的选择**是被任务集逼出来的**（Drawer 长度差异大），并非普适更优——见 FIPER 对同一取舍的相反结论。

## Open questions（接本库）
- LLMD 的**训练数据依赖能否去掉**？（用少量成功 rollout 估 `μ_s`、`Σ_s` 而非全量微调数据，够不够？）
- LLMD 抓"死循环重试"的能力，与机制②的**停滞超时**在覆盖上重叠多少？如果重叠很大，按 [[Harness design]] 的 load-bearing 原则，**该退役哪一个**？
- ACC（OR）与 FIPER（AND）在**同一套任务**上的直接对比尚不存在 —— 两篇的任务集完全不重叠。
- π₀.₅ 与 X-VLA 上的表现差异，是否可归因于**融合方式**（逐层 cross-attention vs 仅末层）？若是，LLMD 的适用性就与 [[VLA - Vision-Language-Action Models|范式 A/B]] 之分挂钩了。

## Related
- [[Embodied failure detection]] — 本文是机制③的成本前沿更新 + 第三个信号位置（内部表征）的来源
- [[Romer et al. - FIPER Failure Prediction at Runtime for Generative Robot Policies]] — **对位工作**：同为"OOD + 动作不确定"双检测器、同属 Robotics Institute Germany，但**组合逻辑与阈值类型都相反**
- [[Agia et al. - Sentinel Runtime Monitoring of Consistency and Progress for Generative Policies]] — ACC 即 STAC 的单样本估计；本文在真机上胜过它
- [[Xu et al. - FAIL-Detect Uncertainty-Aware Runtime Failure Detection for Imitation Learning Policies]] — 观测侧信号的代表；本文补的是表征侧
- [[Feng et al. - DVAC Denoising-Variance Adaptive Chunking for Flow-Based Robot Policies]] — 同族信号的**另一种用法**（调执行粒度而非报警）
- [[Physical Intelligence - pi0.5 a VLA with Open-World Generalization]] — 被检测的策略之一
- [[Real-robot evaluation]] — AUCPDT 属指标设计层的贡献
