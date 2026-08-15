# FIPER: Failure Prediction at Runtime for Generative Robot Policies

- **Raw note**: [[2026-08-15 - Romer et al. - FIPER Failure Prediction at Runtime for Generative Robot Policies]]

## Metadata
- **Type**: source note
- **Format**: arXiv (**cs.RO**), v2 · **NeurIPS 2025**
- **Authors**: Ralf **Römer**, Adrian Kobras, Luca Worbis, Angela P. Schoellig（前三人 equal contribution）
- **Organization**: **TUM**（Learning Systems and Robotics Lab / **MIRMI**）+ **Robotics Institute Germany** + Munich Center for Machine Learning
- **arXiv**: [2510.09459](https://arxiv.org/abs/2510.09459) · [项目页](https://tum-lsy.github.io/fiper_website)
- **Raw tier**: URL-only（未下载 PDF）
- **Verification status**: 机制 / RND-OE 与 ACE 构造 / AND 组合与 Proposition 1 / CP 时变阈值构造 / 五环境设置 / **主结果表逐格核实** / 附录 D 局限 **自读 HTML 全文核实**（2026-08-15）
- **Related**: [[Embodied failure detection]], [[Seligmann et al. - VLA-FAIL Efficient Task Failure Detection for Finetuned Vision-Language-Action Models]], [[Agia et al. - Sentinel Runtime Monitoring of Consistency and Progress for Generative Policies]], [[Xu et al. - FAIL-Detect Uncertainty-Aware Runtime Failure Detection for Imitation Learning Policies]], [[Real-robot evaluation]], [[Robot data engine]]
- **Tags**: #failure-detection #failure-prediction #runtime-monitoring #conformal-prediction #ood-detection #diffusion-policy #flow-matching #dependability #neurips

## Summary

标题里的关键词是 **prediction 而非 detection**——它想在失败**发生之前**报警。为此它对现有两派各打一棍：

> "**Pure OOD detectors trigger on any novel situation, even if the policy can generalize to it.** At the same time, **VLM-based methods only raise alarms after errors manifest, providing no foresight** about impending failure."

并直接点名 [[Xu et al. - FAIL-Detect Uncertainty-Aware Runtime Failure Detection for Imitation Learning Policies|FAIL-Detect]]：
> "as future behavior is determined by the actions of the policy, **observation-only methods can miss early warning signs present in the action distribution**."

⇒ 全篇的赌注是：**观测侧和动作侧都要看，而且要用合取而非析取，才能把"真失败"从"只是没见过"里分出来**。

## 两个检测器

### RND-OE：在策略自己的嵌入空间里做新颖性检测
RND 本身是老方法（冻结的随机 target 网络 + 训练去拟合它的 predictor，拟合残差 = 新颖度）。**本文的设计点在于两个网络都复用并冻结策略自己的观测编码器 `h(·)`**，好处有二：

1. 异常检测**直接发生在策略的嵌入空间**里——比原始像素的 OOD 更能指示"这会不会让策略出错"
2. 借用预训练特征提取器 ⇒ **小数据集也能训 RND**（真机只用了 10 条成功 rollout）

**滑窗求和聚合**，理由明确：策略通常**扛得住短暂轻微的 OOD**，但**连续多帧 OOD** 会引发无法恢复的复合误差。

### ACE：为什么该用熵而不是方差
这是本文最有解释力的一段论证：

- 演示数据有动作多模态，**且模态数量依观测而定、事先未知** ⇒ 同一观测下，成功 rollout 也可能生成 L2 意义上差异极大的动作 ⇒ **方差几乎不含信息**
- 但 **IL 里的多模态通常是离散性质的**——先拿 A 还是 B 还是 C、从侧面还是上方抓、从左还是右绕障 ⇒ 每个生成动作都应清晰落在某一个模态里
- ⇒ 该测的是**分布的锐度**，也就是熵

工程上：真实似然未知 ⇒ 采 `B` 个动作块近似；但 `A^H` 维度随 chunk 长度指数增长 ⇒ **把各预测步拆开分别估熵再求和**，用**逐维度分箱**实现（作者称比 KDE 类方法更高效稳健易调）。在**末端笛卡尔空间**上算，以获得任务相关且可解释的量。

⚠️ 对 STAC 的针对性批评：**STAC 会把"策略正在决定采用哪个行为模态"的时刻误判为高不确定性**。

## 核心设计：逻辑 AND

> "Not all OOD observations lead to failure, and there may be temporary high (aleatoric) uncertainty in the generated actions even in successful rollouts... we flag a rollout as Fail **if and only if both** failure predictors raise a warning."

**Proposition 1**：两个阈值各按 `δ` 校准后，尽管 `η_O` 与 `η_A` **不独立**，合取预测器仍**满足同一个误报上界** `δ`。（合取只会更保守，所以界自动保持——干净。）

阈值用**函数型数据的 conformal prediction**（Diquigiovanni et al.）构造**时变**上阈，把校准集**分成两个不相交部分**分别估 `μ_t` 与带宽 `b_t`。

## 结果（核实，五环境平均）

| 方法 | TWA ↑ | Acc ↑ | DT ↓ |
|---|---|---|---|
| PCA-kmeans | 0.57 | 0.61 | (0.09) |
| **logpZO**（FAIL-Detect） | 0.60 | 0.69 | 0.35 |
| RND-A | 0.56 | 0.62 | 0.34 |
| **STAC**（Sentinel） | 0.57 | 0.68 | 0.42 |
| **RND-OE**（单用） | 0.59 | 0.67 | **0.18** |
| **ACE**（单用） | 0.63 | 0.74 | 0.25 |
| **FIPER**（AND） | **0.65** | **0.78** | 0.30 |

- FIPER 总体 **TPR = 0.92**
- **ACE 显著优于 STAC**，尤其在 Sorting / Stacking / Pretzel 这些**多模态强**的环境——与它的理论论证一致
- **PCA-kmeans 的 TNR 仅 0.24**，几乎无法区分 OOD 与失败 ⇒ 作者据此指出**"成功/失败平均分数差大" ≠ "预测性能好"**（一条值得记住的方法论提醒）
- 四象限分析（Success ID / Success OOD / Fail ID / Fail OOD）：关键是 **Success OOD 与 Fail ID 之间的间隔**；RND-OE 与 ACE 在这条间隔上明显优于各自阵营的基线
- 观察：**动作侧的 Fail–Success 间隔普遍小于观测侧** ⇒ "failures are harder to detect from the policy outputs than from the inputs"

**新指标 TWA**：真阳性记 `1 − DT` 而非 1。动机与 VLA-FAIL 的 AUCPDT 完全一致——**一直等到最后一步"预测"能拿高准确率，第一步全报警能拿完美延迟，单看任一个都可被套利。**

## Why it matters（对本库）

**1. "benign OOD"这个区分，是 [[Embodied failure detection]] 此前缺的一格。**
该页把机制③⑤⑥的门槛记为"**只用成功数据即可**"（FAIL-Detect 的贡献），并注明代价是**问题被弱化为"是否偏离训练分布"（OOD ≠ 一定失败）**。FIPER 正面处理了这个被记为代价的东西：**它的四象限设计（Success OOD vs Fail ID）就是把这条缝量化出来**，并证明 PCA-kmeans 这类纯 OOD 检测器确实掉在这条缝里（TNR 0.24）。⇒ **该页那句"代价"现在有了对应的解法方向，可以从"限制"改写为"已被专门攻击的子问题"。**

**2. AND vs OR：本库现在有了一对可直接对照的组合逻辑，而且代价被量化了。**
FIPER 用 **AND**（少误报），[[Seligmann et al. - VLA-FAIL Efficient Task Failure Detection for Finetuned Vision-Language-Action Models|VLA-FAIL]] 用 **OR**（早报警）。而 FIPER 自己的表格**把 AND 的代价直接算出来了**：

> DT：RND-OE 单用 **0.18** < ACE 单用 **0.25** < FIPER(AND) **0.30**，但 TWA/Acc 反过来。

⇒ **合取更准但更慢，析取更早但更吵**。这不是风格差异，是可测量的取舍。按本页原则②（误报与漏报的代价不对称且方向会翻转），**选 AND 还是 OR 应当由"漏报传播代价 vs 误报物理代价"来定**——这两篇正好各站一端，让那条原则第一次有了两个可比的落点。

**3. 阈值类型之争，被 FIPER 自己的局限章节化解了（这是本次 ingest 最干净的一处收获）。**
表面上三篇冲突：FAIL-Detect 与 FIPER 用**时变阈值**，VLA-FAIL 明确用**恒定阈值**。但 FIPER 附录 D 自陈了时变阈值的两个失效条件：

> "if the training data contains **multiple temporally distinct ways of completing the task**, **a constant threshold may be more suitable**"
> 时变阈值只能在校准集里出现足够多次的时刻上计算 ⇒ **rollout 长度不一时会出问题**

而 VLA-FAIL 拒绝时变的理由正是**"episodes that vary significantly in length, such as our real-world Drawer task"**。⇒ **两篇其实完全同意底层判据，只是任务集把它们推到了取舍的两端。** 可提炼成一条部署规则：**回合时序稳定 → 时变阈值更紧；回合长度/路径多变 → 恒定阈值更稳。**

**4. RND-OE 不需要策略的训练数据**，只要少量成功 rollout（真机 M=10）。这比 VLA-FAIL 的 LLMD（需访问微调数据）**在"用别人的 checkpoint"这个主流场景下更可部署**。两者在成本与可得性上各有一头。

**5. 0.78 的准确率是一个诚实且重要的现实读数。**
作者自己点破：这对**装配线那种"必须早、必须准、误报很贵"**的场景仍然不够。⇒ 本库谈"失败检测让长程 `p^N` 不崩"时，应当带上这个量级——**当前技术水平是"有用的粗筛"，不是"可信的守门员"**。

## What feels strong
- **"熵而非方差"的论证是本篇最有价值的部分**，而且它同时解释了 STAC 为何在多模态任务上误报——一个论证同时立己破人。
- **AND 组合附带了形式保证**（Proposition 1），而不是纯经验组合。
- **四象限评估设计**（Success/Fail × ID/OOD）比单纯报 AUROC 有解释力得多，值得被后续工作抄。
- **诚实**：把"AND 更慢"写在自己主表里，把时变阈值的失效条件写进附录，把 78% 的不足写在最前面。
- 真机任务（折绳成椒盐卷、推椅子）**含可形变物与移动操作**，不是清一色桌面抓取。

## What feels limited
- **只在单任务、视觉 IL 策略上验证**（Diffusion Policy / ACT 量级）。**适配到大规模 VLA 是作者自陈的 future work** —— 这一格随后被 VLA-FAIL 填上了。
- **RND-OE 需要单独训练**一个与策略分离的模型（虽然很小）。
- **历史只通过滑窗聚合分数利用，未进入分数计算本身** —— 与 FAIL-Detect "只看最近 2 步观测"是同一个结构性短板：**都难以捕捉真正长时程的"不推进"**。
- **aleatoric 不确定性会抬高 ACE 阈值进而压低 TPR**；演示数据越杂，ACE 越钝。作者把 aleatoric/epistemic 解耦列为开放问题。
- 只测过**图像观测嵌入**；语言、触觉、音频未验证。
- 部分基线的 DT 因 TPR/TNR < 0.4 被打标记（数字无意义），**可比较的格子实际少于表面上那么多**。

## Open questions（接本库）
- AND 与 OR 在**同一套任务**上的直接对比——两篇任务集零重叠，这个对照目前不存在。
- 能否**动态切换组合逻辑**？（高风险/不可逆动作用 OR 抢时间，常规动作用 AND 抑噪）—— 直接对应本页"误报/漏报代价方向会翻转"的原则。
- ACE 需要采 `B` 个动作块，成本介于 STAC（256）与 ACC（1）之间；**`B` 能压到多低仍保住熵估计**？这决定它能否上端侧。
- 把 RND-OE（不需训练数据）与 LLMD（需训练数据但更早）**并联**会怎样？两者都是表征/观测侧，可能高度冗余，也可能互补。

## Related
- [[Embodied failure detection]] — 本文补的是"benign OOD vs 真失败"这一格，以及组合逻辑与阈值类型两处设计维度
- [[Seligmann et al. - VLA-FAIL Efficient Task Failure Detection for Finetuned Vision-Language-Action Models]] — **对位工作**：同为双检测器、同属 Robotics Institute Germany，但 AND vs OR、时变 vs 恒定阈值、小策略 vs 大 VLA 三处相反
- [[Agia et al. - Sentinel Runtime Monitoring of Consistency and Progress for Generative Policies]] — STAC 是其主要动作侧基线，且被指出在模态选择时误报
- [[Xu et al. - FAIL-Detect Uncertainty-Aware Runtime Failure Detection for Imitation Learning Policies]] — logpZO 是其主要观测侧基线；本文对"观测侧不够"的批评直指该文
- [[Real-robot evaluation]] — TWA 与 AUCPDT 同属指标设计层
- [[Robot data engine]] — 判别器的买断制结构
