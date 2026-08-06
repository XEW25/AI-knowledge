# FAIL-Detect: Can We Detect Failures Without Failure Data? Uncertainty-Aware Runtime Failure Detection for Imitation Learning Policies

- **Raw note**: [[2026-08-06 - Xu et al. - FAIL-Detect Uncertainty-Aware Runtime Failure Detection for Imitation Learning Policies]]

## Metadata
- **Type**: source note
- **Format**: arXiv (cs.RO), v3
- **Authors**: Chen Xu, Tony Khuong Nguyen, Emma Dixon, Christopher Rodriguez, Patrick Miller, Robert Lee, Paarth Shah, Rares Ambrus, Haruki Nishimura, Masha Itkina
- **Organization**: **Toyota Research Institute (TRI)** + Woven by Toyota
- **arXiv**: [2503.08558](https://arxiv.org/abs/2503.08558)
- **Raw tier**: URL-only（未下载 PDF）
- **Verification status**: 机制 / 四类打分器 / logpZO 构造 / CP band / 实验设置与主要结论 **自读 HTML 全文核实**（2026-08-06）；部分附录表格数值未逐项核对
- **Related**: [[Embodied failure detection]], [[Agia et al. - Sentinel Runtime Monitoring of Consistency and Progress for Generative Policies]], [[Home robot architecture - a hierarchical embodied agent]], [[Robot data engine]], [[Real-robot evaluation]]
- **Tags**: #failure-detection #runtime-monitoring #conformal-prediction #ood-detection #normalizing-flow #diffusion-policy #flow-matching #dependability #tri

## Summary

标题即主张：**能不能在没有失败数据的前提下检测失败？** 答案是能——把问题重构为**序贯 OOD 检测**，全部打分器**只用成功数据训练**。

**两阶段框架**：
1. **Stage I（打分）**：`D_M(A_t, O_t; θ) → 标量`。输入 = **最近 `T_O=2` 步的观测**（机器人状态 + 视觉特征）+ **策略生成的未来动作**。**刻意不喂增长的历史轨迹**，避免在历史上过拟合。
2. **Stage II（判定）**：用 **conformal prediction** 构造**时变阈值**，对误报率给出统计保证。

框架**可插拔**（新的打分器/阈值设计都能接进来），因此它同时也是一次**系统性 benchmark**：把 8 种打分候选放进同一框架比。

## 四类打分器

| 类 | 方法 | 思路 |
|---|---|---|
| **(a) 学出的数据密度** | logpO、**logpZO** ⭐ | 连续归一化流（CNF）拟合成功轨迹的观测分布 |
| **(b) 二阶分布** | NatPN、DER | 学"分布的分布"，**分离 aleatoric / epistemic 不确定性** |
| **(c) 单类** | CFM、**RND** | 只见过正常数据，判新样本是否属于该类 |
| **(d) Post-hoc（不学习）** | **SPARC**（动作平滑度，针对 OOD 常见的抖动失败）、PCA-kmeans、**STAC** | 解析计算 |

### logpZO：本文最好的打分器
- **logpO（已有）**：直接算 `log p(O_t)`，低似然 = OOD。**问题**：算 log p 要**沿 ODE 轨迹积分 `f_θ` 的散度**，高维下难以估计。
- **logpZO（新）**：用同一个 CNF，改为评估**噪声估计的似然**——从 `O_t` 出发跑**前向 ODE** 在 [0,1] 上积分 → 得 `Z_{O_t}`。**观测分布内时 `Z_{O_t}` 近似标准高斯** ⇒ `p(Z) = C·exp(−0.5‖Z‖²)` ⇒ **分数本质就是 `‖Z_{O_t}‖²`**。

> 一句话：**不去算真正的密度（要散度积分，高维不可行），而是把观测推进噪声空间，量它离原点多远。** 实测开销 **0.04 s / 0.033 s 每时间步**（Square / Transport）。

## CP 怎么用（比标准 CP 更进一步）
**标准 split conformal**：留一个校准集 → 算分数经验分布 → 取 **1−α 分位数**当阈值 → 保证新的同分布样本越界概率 **≤ α**。性质：**分布无关、有限样本、只需可交换性**。**α 就是你选定的误报率。**

**本文的构造**：**单侧 + 时变**的 CP band `C_α`
- **单侧** —— 只关心分数偏高
- **时变** —— 各时刻"正常分数水平"不同，故从**成功 rollout 校准集**算每时刻 `μ_t` 与带宽 `h_t`；带宽取"**最大偏差**"的分位数（`max` 是为让 band 覆盖整条轨迹）
- **两种标定**：setting-dependent（各环境各自的成功轨迹）vs **ID-only**。仿真中 **ID-only 即可同时用于 ID 与 OOD 测试**，且**实践上更可取**（不需要去采 OOD 数据）
- **对比 STAC**：STAC 用**单一常数阈值**；本文的改进之一就是**用时变 band 取代常数阈值**

## Results（核实）
- **learned > post-hoc** 是总体结论。**logpZO 最一致**：combined accuracy **top-1 于 10/16** 情形（RND 5/16）；硬件小样本下 **8/12 top-1、11/12 top-3**
- **learned 方法检测时间也最快**（除一例外，最佳检测时间总由 learned 取得）—— 即"更准"和"更快"没有取舍
- post-hoc 阵营：**STAC top-1 仅 3/16**，PCA-kmeans **从未最佳**；SPARC 最快（4/6）但**从未 top-1**
- 可视化：learned 方法 **CP band 更紧、成功/失败分离更好**；post-hoc 因分离差**把大多数轨迹判成成功**
- 定性：Square 任务中**分数陡增恰好对应夹爪脱手的瞬间**
- 观察：post-hoc 在 **OOD 情形反而好于 ID**（猜测：成功 ID 轨迹与失败轨迹的区分更明显）

**实验设置**：仿真 = Robomimic 的 **Square / Transport / Can / ToolHang**（略去 Lift，两种策略均 100%），OOD 由 **t=50 模拟相机碰撞**制造；真机 = **双臂 Franka Panda** 的 **FoldRedTowel**、**CleanUpSpill**（OOD：皱毛巾 + 蓝铲干扰物 / 换绿毛巾；另有人为拉扯扰动）。**策略 backbone 两种：FM（flow matching）与 DP（diffusion policy）**。rollout：仿真 2000、硬件仅 50。

## ⚠️ 与 Sentinel 的一处直接张力（对部署判断有影响）
> "Note we do not present STAC here as it was **slow to run on hardware in real-time**."

原因：**STAC 每个时间步需生成 256 条动作预测**；论文指出可以少采，但**会损害其统计性质**。

⇒ [[Agia et al. - Sentinel Runtime Monitoring of Consistency and Progress for Generative Policies|Sentinel]] 自称 STAC "negligible computational cost"（**相对 VLM** 成立），但 FAIL-Detect 在真机实时约束下**干脆没能跑它**。两说法不直接矛盾，但**"STAC 可放端侧实时跑"这个判断需要加限定**。

## Why it matters（对本库）

1. **"必须采失败样本"这个门槛的正式出处**。全篇论证 *detect failures **without failure data***，全部打分器只用成功数据。⇒ [[Embodied failure detection]] 机制⑤的门槛说法据此修正。
2. **CP 的第三个落点，且给出了最完整的用法**：KnowNo（语义/规划层，本文 related work 亦如此归类）、STAC（动作一致性层，常数阈值）、FAIL-Detect（执行监控层，**时变 band**）。**CP 是这条线的共同连接组织**，其 **α 就是"漏报/误报权衡"的可调旋钮**。
3. **修正"机制③是免费的"这一框架**：真正好用的信号是 **learned**（要离线训一个小的流模型），post-hoc 的免费信号（SPARC / 采样方差 / PCA-kmeans）在**本文与 Sentinel 中都被系统性击败**。正确表述是 **"离线训一次（只用成功数据）+ 在线推理很便宜"** —— 又一次落进 [[Robot data engine]] 的**买断制**结构。
4. **真机成熟度**：双臂 Franka 上两个长程可形变物任务（叠毛巾、擦洒漏），OOD 由**换物体颜色/加干扰物/人为拉扯**制造 —— 是本库里少见的、贴近家庭场景的真机失败检测证据。
5. **ID-only 校准可用**是一条重要的工程结论：**不需要预先采 OOD 数据**就能建阈值，这让冷启动更现实。

## What feels strong
- **问题重构干净**：把"检测失败"变成"序贯 OOD 检测"，从而合法地只用成功数据。
- **logpZO 的技巧实用**：绕开高维散度积分，代价降到 ~0.03–0.04 s/步，且是全篇最稳的分数。
- **可插拔框架 + 8 个候选同台比**，比"再提一个更好的分数"更有基础设施价值；且**准确与速度不取舍**（learned 两头都赢）。
- 真机任务**可形变物 + 长程**，OOD 制造方式贴近现实（换颜色、加干扰、人为扰动）。
- 诚实报告 post-hoc 在 OOD 反而更好这类**不利于自己叙事**的观察。

## What feels limited
- **OOD 下误报仍存在**（作者自述），因为轨迹整体性能退化；建议的"推理时自适应 α"尚未实现。
- **硬件只有 2 个任务、50 rollouts** ⇒ 真机结论统计功效有限（参见 [[Real-robot evaluation]]）。
- **只检测、不恢复**，也不区分失败类型（对比 Sentinel 的 erratic / task-progression 二分）。
- 打分器**只看最近 2 步观测 + 当前动作** ⇒ 结构上难以捕捉**长时程的"不推进"**（这正是 Sentinel 要用 VLM 的那一类）。
- 需要**每任务采成功 rollout 校准**，换本体/换任务要重做。

## Open questions（接本库）
- logpZO 与 Sentinel 的 **VLM 监控组合**会怎样？（前者强在 erratic/OOD，后者强在 task-progression，**二者互补性未被任何一篇测过**）
- α 如何按"漏报传播代价 vs 误报物理代价"来定？两篇都提供了旋钮，**都没讨论怎么拧**。
- 端侧可行性：logpZO ~0.03 s/步是否满足更高频的控制环？能否蒸馏得更小？
- 只看 2 步观测的结构限制，能否用**轻量时序编码**缓解而不退回全历史？

## Related
- [[Embodied failure detection]] — 本文是机制③⑤⑥的实证来源与门槛修正来源
- [[Agia et al. - Sentinel Runtime Monitoring of Consistency and Progress for Generative Policies]] — 姊妹工作：**互为 baseline、结论互补、且对 STAC 的成本判断存在张力**
- [[Home robot architecture - a hierarchical embodied agent]] — dependability 脚手架
- [[Robot data engine]] — 买断制判别器 / 质量信号
- [[Real-robot evaluation]] — 真机统计功效
