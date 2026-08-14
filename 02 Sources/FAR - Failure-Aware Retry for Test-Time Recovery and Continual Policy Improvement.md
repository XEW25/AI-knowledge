# FAR: Failure-Aware Retry for Test-Time Recovery and Continual Policy Improvement

- **Raw note**: [[2026-08-06 - FAR Failure-Aware Retry for Test-Time Recovery and Continual Policy Improvement]]

## Metadata
- **Type**: source note
- **Format**: arXiv；Keywords: Robot Manipulation / Failure Recovery / **Test-time Adaptation**
- **arXiv**: [2607.01111](https://arxiv.org/abs/2607.01111)
- **Raw tier**: URL-only（HTML 正文自读）
- **Verification status**: 四部件机制 / IQL 价值估计 / 评测设置与结果 **自读核实**（2026-08-06）；**作者与机构未定位**；代码发布未查
- **Related**: [[Embodied failure detection]], [[Shin et al. - B2FF Failure Recovery for VLA Policies via Pre-Imagined Milestone Selection]], [[Robot data engine]], [[Physical Intelligence - pi0.6 a VLA That Learns From Experience]], [[Cloud-edge co-evolving embodied agent - a continuous-evolution framework]]
- **Tags**: #failure-recovery #test-time-adaptation #online-learning #continual-improvement #preference-learning #iql #data-flywheel #embodied

## Summary

**恢复设计空间里唯一一个"改策略本身"的格子**，也是本库**第一个把 harness 侧的恢复与演进通道接起来**的工作——**恢复尝试本身产出训练信号**。

问题设定很准：失败状态**很少被离线演示覆盖、对预训练策略是 OOD**，所以**朴素重试只会重复同样的错误**；而现有恢复方法**多依赖人工介入**。FAR 定位于**自主**。

### 四个部件

**① 价值估计（IQL）** —— 用 **IQL 的价值学习目标**同时训 **Q-function `Q_φ`** 与 **value function `V_ψ`**，再用**时序价值差**定位**失败诱因动作**。
> ⇒ 这一步替代了"人来告诉你哪里错了"。

**② FCPA（Failure-Contrastive Preference Adaptation）** —— 用失败经验**构造偏好学习数据**：失败诱因动作作负例 + **替代正例**，在**测试时**更新策略，使其**避开先前不成功的行为**。

**③ 轻量动作扰动** —— FCPA **受限于离线策略的 support**（它只能在策略已有的分布内挑）。所以重试时向执行动作**注入轻量扰动**做局部探索、**扩展 support**。仿真中**简单高斯扰动通常已足够**。

**④ 持续策略改进** —— **成功的恢复轨迹进 replay buffer** → 训练循环：
> *"successful recovery trajectories provide supervision on **hard states where the initial policy fails**, improving both policy robustness **and value estimation** over time."*

## Results
| | |
|---|---|
| 仿真（3 benchmark / 9 任务，50 ep/任务，**最多 5 次尝试**，3 seeds） | **+17.6%** vs 标准 diffusion policy |
| 真机（**7-DoF xArm**，3 任务，20 ep，**最多 3 次尝试**） | **+11.7%** |
| 复位 | **"enables recovery without environment resets"** |
| 持续改进 | **reset budget 与 timestep budget 两种预算下数据效率均显著提升**；减少人工介入需求 |

⚠️ 未用 LIBERO / CALVIN / RoboCasa，为自选/自建仿真环境。

## Why it matters（对本库）

**1. 补齐恢复设计空间的第四格——而且是唯一改策略的那一格。**

| 工作 | 改什么 | 策略是否冻结 |
|---|---|---|
| [[Zhang et al. - Harness VLA Steering Frozen VLAs into Reliable Manipulation Primitives via Memory-Guided Agents\|Harness VLA]] | 机器人**物理位形** | ✅ 冻结 |
| [[Zeng et al. - HELM Harness-Enhanced Long-horizon Memory for VLA Manipulation\|HELM]] | **世界状态** | ✅ 冻结（VLA） |
| [[Shin et al. - B2FF Failure Recovery for VLA Policies via Pre-Imagined Milestone Selection\|B2FF]] | 喂给策略的**目标** | ✅ 冻结 |
| **FAR** | **策略本身**（测试时更新） | ❌ **要更新** |

⇒ 前三格都在"**绕过**策略的不足"，FAR 在"**修正**它"。这条线上的取舍由此完整：**冻结 = 零训练成本、可预测；更新 = 能真正学会，但引入在线训练与稳定性风险**。

**2. 本库第一个闭合"恢复 → 数据 → 改进"的环。** 你的框架有**运行时通道**（恢复）与**演进通道**（经验↑/技能↓），但此前**没有任何工作把两者接起来**。FAR 的环是：
> 失败 → 价值差定位失败动作 → 偏好适配 + 扰动探索 → **恢复成功** → 该轨迹进 replay buffer → 持续改进（且**价值估计本身也一起变好**）

**3. 它给"质量信号提取"一个具体解法。** [[Robot data engine]] 指出自演进型引擎的本质是把"数据获取"转化为"**质量信号提取**"，且**双组分杠杆**里"人类信号"是支点。**FAR 用一个 IQL 学出的价值函数替掉了这个支点**——不需要人来标"哪一步错了"。⇒ 双组分杠杆存在一个**可自主化的子类**。

**4. 它自动生成的恰是价值密度最高的数据。** 数据引擎页指出人工干预之所以价值密度最高，是因为它**恰落在策略失败分布上**。FAR 的"成功恢复轨迹"**按定义就落在这个分布上**，且是**自主**产生的。⇒ 对"人类注意力是真正稀缺资源"这条结论是一个**正面缓解**（不是推翻：它仍需可靠的价值函数）。

**5. 与 [[Physical Intelligence - pi0.6 a VLA That Learns From Experience|π*₀.6 Recap]] 的对照**：都用价值函数把部署经验转成训练信号，但**时间尺度不同** —— Recap 是**离线、事后**；FAR 是**在线、单机、就在这一集里**。⇒ 同一思想的两个时间尺度，正好对应你框架的**演进通道（慢）**与**运行时通道（快）**。

> **时间尺度差异的机械根源（2026-08-14 核实 Recap 原文后补）**：不是工程选择，是**两者值函数定义方式的必然结果**。
> - **Recap**：分布值函数用 **Monte Carlo 回报** `R_t(τ)=Σ_{t'=t}^{T} r_{t'}` 监督（原文自称 *"a Monte Carlo estimator"*），目标是"到成功还差多少步"。**没有集终止就没有标签** ⇒ 必须事后、必须成批。
> - **FAR**：用**同一条轨迹内部的时序价值差**定位失败诱因动作，**不需要回报** ⇒ 可在重试预算内当场更新。
>
> ⚠️ 顺带修正："车队级"是本库对 Recap 的**外推**，非其既有能力——它的迭代改进实验用的是单一静态双臂平台。

## What feels strong
- **问题诊断准**：把"重试为什么无效"归到两条具体原因（重复同样错误 + 动作分布来自离线演示、OOD 状态无从探索），并**分别**用 FCPA 和扰动去打。
- **无需环境复位**——这在真机上是硬约束（复位成本是与能力覆盖正交的一维，见 [[Real-robot evaluation]]）。
- **同时报 reset budget 与 timestep budget 下的数据效率**，说明作者清楚真机的稀缺资源是什么。
- 真机（xArm）+ 3 seeds + 明确的 attempts 上限，评测协议比多数同类扎实。

## What feels limited
- **测试时更新策略**引入的稳定性风险（灾难性遗忘、被单次失败带偏）**未见系统讨论**；`R_max`=5/3 的上限也意味着单集内更新次数有限。
- **依赖价值函数的质量**：整条链的第一步就是"用价值差定位失败动作"，价值函数不准则全盘皆错；而它恰恰是在**失败状态（OOD）**上被调用的。
- **未用公开 benchmark**（无 LIBERO/CALVIN/RoboCasa），横向可比性弱。
- 基座是**标准 diffusion policy**，对 VLA/大模型尺度是否成立未验证。
- 与本库其它恢复工作一样，**何时判定"失败了、该重试"没有展开**——检测仍是外置的。

## Open questions（接本库）
- **在线更新 vs 冻结**的取舍如何量化？FAR 的 +17.6% 里，多少来自 FCPA、多少来自扰动探索（即"改策略"是否必要，还是"扰动"就够）？
- 价值函数在 OOD 失败状态上的可靠性，能否用 [[Xu et al. - FAIL-Detect Uncertainty-Aware Runtime Failure Detection for Imitation Learning Policies|FAIL-Detect]] 那类 OOD 分数来加护栏？
- 测试时更新的**权重如何回流云端**？——这正是你框架**演进通道**要回答的（FAR 只做了单机闭环，没做车队聚合）。
- 与 B2FF 组合：**先换目标（零物理代价），不行再改策略**——是否构成一个自然的恢复升级阶梯？

## Related
- [[Shin et al. - B2FF Failure Recovery for VLA Policies via Pre-Imagined Milestone Selection]] · [[Zeng et al. - HELM Harness-Enhanced Long-horizon Memory for VLA Manipulation]] · [[Zhang et al. - Harness VLA Steering Frozen VLAs into Reliable Manipulation Primitives via Memory-Guided Agents]] — 恢复四格的其余三格
- [[Embodied failure detection]] — 检测（FAR 外置了这一步）
- [[Robot data engine]] — 质量信号提取 / 双组分杠杆
- [[Physical Intelligence - pi0.6 a VLA That Learns From Experience]] — 同思想的慢时间尺度版本
- [[Cloud-edge co-evolving embodied agent - a continuous-evolution framework]] — 演进通道
