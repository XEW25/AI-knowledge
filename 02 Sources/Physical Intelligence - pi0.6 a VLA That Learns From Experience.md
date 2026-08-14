# Physical Intelligence - π*₀.6: a VLA That Learns From Experience

- **Type**: arXiv paper (cs.RO, cs.LG)
- **Authors**: Physical Intelligence (Ali Amin, Kevin Black, Chelsea Finn, Sergey Levine, Karol Hausman, Brian Ichter, et al.)
- **arXiv**: [2511.14759](https://arxiv.org/abs/2511.14759)
- **Blog**: https://pi.website/blog/pistar06
- **Year**: 2025
- **Open-source**: ❌ 未开源
- **Accessed**: 2026-04-28
- **Raw note**: [[2026-04-28 - Physical Intelligence - pi0.6 a VLA That Learns From Experience]]
- **Verification status**: 架构耦合 2026-05-30 核实；**Recap 方法机制 2026-08-14 深度核实**（自读 arXiv HTML 全文 + 附录 A-C：§IV-A/IV-B、Eq. 1–3、ε_ℓ 取值、KI 继承、每轮重训策略、ELBO 代理）。评测数字仍以图表呈现，未逐项复核。

## Model Paper Checklist

| # | 维度 | 信息 |
|---|------|------|
| 1 | 模型架构 | π₀.6 VLA + advantage conditioning；Transformer backbone (Gemma 3 4B) + action expert (860M, flow matching) + 值函数 backbone (670M)；子任务预测 + 动作生成两层推理 |
| 2 | 模型规模 | VLM backbone: Gemma 3 **4B**，action expert: **860M**，值函数 VLM: **670M**；总策略参数 ~**4.86B**，值函数 ~**670M** |
| 3 | 训练数据 | Pre-training: **数万小时**多任务多机器人演示；下游：演示 + 自主收集 + 人类干预（具体小时数未披露） |
| 4 | 训练方法 | Recap: offline RL pre-training → SFT finetune → iterative self-improvement（**分布值函数**（原文用语）+ advantage conditioning + CFG 式条件生成）。**基座训练沿用 KI（Knowledge Insulation）配方**——防遗忘是继承来的，非本文新增 |
| 5 | 推理性能 | 50Hz 控制，action chunk 50 步，5 步去噪；**推理延迟未披露，硬件未披露** |
| 6 | 开源状态 | ❌ 未开源（权重、代码均未公开） |
| 7 | Benchmark | 折衣物(2h+ 连续)、组装箱子(工厂)、浓缩咖啡(13h 连续)；throughput >2x，failure rate ~50% 降低；**具体成功率以图表呈现** |
| 8 | 与已有工作关系 | π₀.6 > π₀.5（更大 backbone Gemma 3 4B + 更多数据）；π*₀.6 = π₀.6 + advantage conditioning；vs RL Tokens（全模型 RL vs 轻量插件） |
| 9 | 记忆机制 | **隐式记忆**：部署经验通过 RL 融入权重（procedural memory），无显式经验检索 |

## 架构耦合核实（2026-05-30）

- **VLM↔action 耦合 = 范式 A（延续 π₀，已核实）**：论文 "The model is otherwise the same as described in Section V-A"；action expert "can attend to the activations in the rest of the model" → 确认 joint-attention MoE（非真 MoE）
- **值函数是独立网络**：670M VLM backbone（Gemma 3 初始化），与策略同架构设计但更小；**仅训练时用**（给数据打 advantage 标签），**推理时丢弃**
- 推理时架构 = π₀.6 + 一个 advantage 文本 token（"Advantage: positive"），无其他架构改动
- canonical 耦合机制见 [[Physical Intelligence - pi0 a Vision-Language-Action Flow Model for General Robot Control]]；范式 A/B 对比见 [[Embodied Brain Models]]

## Summary

π*₀.6 提出了 Recap（RL with Experience and Corrections via Advantage-conditioned Policies），一个让 VLA 模型通过真实世界部署自主改进的通用框架。核心思想：用 advantage conditioning 替代 policy gradient，让整个 flow matching VLA 端到端地融入 demonstrations、自主经验和专家干预等异构数据。

## Method: Recap（详细）

### 先厘清：Recap 训的不是 π₀.₆

> *"π\*₀.₆ **is based on** the π₀.₆ VLA, which is an evolution of the π₀.₅ VLA with a few improvements that we detail in the accompanying **model card**."*

- **π₀.₆** = 基座 VLA（π₀.₅ 的演进版），**其训练不在本文范围**，另见模型卡
- **π\*₀.₆** = π₀.₆ 架构 **+ 一条吃二值优势指示位 `I_t` 的条件通路**
- Phase 1 产出的是 **π\*₀.₆**，且**不是"先训好 π₀.₆ 再加条件微调"——条件通路从预训练第一步就在**

> ⚠️ Phase 1 的数据是 **`D_demo`（人类演示 + 网络图文，配方沿用 π₀.₅）**，**不含自主经验**。此处 "offline RL" 指*用离线 RL 的目标函数训演示数据*，**不是**"离线地对部署经验做 RL"。自主经验要到 Phase 3 才进来。

### 三阶段（Algorithm 1）

```
Phase 1  预训练（数据 = D_demo）
  1. 在 D_demo 上训分布值函数 V_pre                          (Eq. 1)
  2. 估每任务阈值 ε_ℓ = 该任务值函数预测值的 30% 分位数
  3. 训 π*0.6 时 on-the-fly 跑值函数算 A → 得 I_t 喂进策略     (Eq. 3)
     （值函数仅 670M，"incurs minimal additional cost"）

Phase 2  目标任务 SFT
  用 D_ℓ 的演示 finetune π*0.6，此阶段 I_t 固定为 True
  ⇒ 退化成普通监督微调，产出初始策略 π_ℓ⁰

Phase 3  迭代改进（k = 1…K）
  ① π_ℓ^{k-1} 采数（部分全自主，部分由专家遥操作介入纠正）→ 并入 D_ℓ
  ② 在 D_ℓ 全部数据上 finetune 值函数
  ③ 用更新后的 I_t finetune 策略
  ⚠️ ②③ 均从**预训练 checkpoint** 重训，不从上一轮接着训
```

### IV-A 分布值函数

**"分布"是原文用语**（§IV-A 标题即 *Distributional value function training*），指值函数输出的是**分布而非点估计**：

- `p_φ(V | o_t, ℓ) ∈ Δ_B` —— 映射到 **B = 201 个离散 value bin** 上的分布
- 训练：把经验回报 `R_t(τ) = Σ_{t'=t}^{T} r_{t'}` 离散化成 201 bin，**最小化交叉熵**（Eq. 1）
- 取连续值：`V(o_t,ℓ) = Σ_b p_φ(V=b|o_t)·v(b)`
- 架构与策略同构，**670M VLM backbone（Gemma 3 初始化）**；额外**混一小份网络多模态数据 co-train 以防过拟合**
- **奖励设计**：预测**到成功还差多少步**（取负），按任务最大集长归一化到 **(−1, 0)**，0 = 成功完成；失败集给大负值

> **它是 Monte Carlo 估计**——原文明说 *"This is a Monte Carlo estimator for the value function of the policy represented by the dataset 𝒟"*。
> ⇒ **这是 Recap 必须离线的机械根源**：`R_t(τ)` 要从 t 一路加到 T，**没有终止就没有标签**。对照 [[FAR - Failure-Aware Retry for Test-Time Recovery and Continual Policy Improvement|FAR]] 用的是*同一条轨迹内部的时序价值差*，不需要回报——**两者的时间尺度差异是各自值函数定义方式的必然结果，不是工程选择**。

> **作者主动承认次优**：*"While this **on-policy estimator is less optimal** than a more classic off-policy Q-function estimator, we found it to be **simple and highly reliable**."* —— 又一次"选可靠不选最优"。

**值函数的可解释性**（Fig. 4）：可视化显示它能正确识别集内的**失误**，以及**推进速度**的快慢。

### IV-B Advantage Conditioning：推导链

**① 贝叶斯改写**——令 `I` = "这个动作算改进"：
```
p(I | A^π_ref(o,a)) = π_ref(a | I, o) / π_ref(a | o)
```
⇒ **"这个动作有多好"被改写成两个分布的比值。**

**② 改进后策略的闭式解（Eq. 2）**，正是 CFG 的形状：
```
π̂(a|o,ℓ) ∝ π_ref(a|o,ℓ) · [ π_ref(a|I,o,ℓ) / π_ref(a|o,ℓ) ]^β
```

**③ 枢纽 = β=1 的特例**：
> *"For the special case β = 1, π̂(a|o,ℓ) = π_ref(a|I,o,ℓ)."*

**改进后的策略，就等于「以"好"为条件的参考策略」本身。** 不需要再做任何优化——模型只要学会了条件分布，把条件设成"好"，采出来的就是改进后的策略。

**④ 于是只需一个模型同时表示两个分布**（Eq. 3）：
```
min_θ  E_D [ −log π_θ(a_t | o_t, ℓ)  −  α·log π_θ(a_t | I_t, o_t, ℓ) ]
其中   I_t = 1( A^π_ref(o_t, a_t, ℓ) > ε_ℓ )
```

| 项 | 训的是什么 | 为什么要 |
|---|---|---|
| `−log π(a\|o,ℓ)` | **无条件分支**（= 普通模仿学习） | Eq. 2 的一般形式需要**比值**；只训条件项会把 β 锁死在 1。留着它，测试时才能调 β>1 进一步锐化（附录 A-E） |
| `−α·log π(a\|I,o,ℓ)` | **条件分支**：给定"好/坏"标签时动作分布长什么样 | 推理时设 `I=True` 直接落到"好"那一支 |

`α` = 权衡两项的超参。

> **关键理解：第二项的目标不是"学好动作"，而是"把好和坏两支分开"。**
> `I_t` 在坏样本上取 **False**，所以该项在坏数据上学的是 `π(a | I=False, o, ℓ)` —— **坏数据没有被丢弃，它在塑造 I=False 那一支**。
>
> 这正是相对 AWR 类方法的核心差别（原文）：加权回归 *"**discard or significantly downweight a significant portion of the data**, effectively implementing a kind of filtered imitation technique"*；而 advantage conditioning *"the policy is trained on **all** of the data with supervised learning, but with an additional input indicating how optimal the action is"*。
>
> ⇒ 对应它列的**第三条设计准则**："必须能同时用好数据和坏数据"——**自主经验里绝大部分本来就是次优的**，按 AWR 过滤掉，从部署经验学习这件事本身就不成立。**坏数据在这里提供对比，不提供模仿目标。**

**人类干预强制 `I_t = True`** —— 原文标明这是一个**假设**：*"This choice is reasonable if we assume that human experts always provide good corrective actions."*

> **但作者对纠正数据的清醒判断**（值得记）：*"intervening during autonomous execution is a **disruptive event**, and even expert human operators cannot guarantee a consistent quality of interventions nor improve subtle aspects of the behavior, such as **overall speed**."* ⇒ 纠正主要用于**修大错误、解决探索难题**，**不构成最优监督**。

### 为什么用阈值 ε_ℓ 而不是测试时调 β（脚注 2）

CFGRL 的做法是统一取 ε=0、测试时调 β。π\*₀.₆ 不这么做，两条理由：

1. 高 CFG 权重会把动作分布**推到 support 的角落** → aggressive behavior
2. **"would not affect the autoregressive part of the model"**

> **第 2 条是架构约束逼出来的**：π\*₀.₆ 同时产**离散输出**（子任务文本 `ℓ̂` + 离散化动作）和**连续动作**（flow matching）。**CFG 权重只作用在扩散那部分，管不到自回归部分。** 而 ε_ℓ 在**数据标注阶段**就决定了 `I_t`，对整个模型都生效。

### Eq. 3 里的 "log π"，连续部分不是真的似然（附录 A-C）

**张力**：原文说 policy gradient 用不了，正因为 flow matching *"do not readily provide a tractable log-likelihood"*——可 Eq. 3 里又写着 log π。

**解法**：把整体似然分解成三项 —— flow matching 的连续动作项 × 离散化动作的 AR 似然 × 子任务文本的 AR 似然。后两项用常规交叉熵；第一项**无闭式似然**，于是把一步扩散过程当成高斯，推 ELBO，最终落成**带噪声权重 `w(η)=e^{−η/2}` 的加权 L2 回归**。

⇒ **连续部分用的是 ELBO 代理，不是似然。这正是它绕开 policy gradient 那道坎的地方。**

### 与 PPO 等 Policy Gradient 的区别

| | Recap | PPO |
|---|---|---|
| 训练方式 | 离线，标记数据后条件生成 | 在线采样+梯度更新 |
| 大 VLA 稳定性 | 稳定 | 不稳定 |
| 推理时需求 | 只需设 I=1 | 需要值函数或旧策略 |
| 训练推理解耦 | 是 | 否 |

### 两个防退化机制（**是两回事，别合并**）

| 机制 | 防什么 | 怎么做 |
|---|---|---|
| **KI 配方**（继承自 π₀.₅） | **灾难性遗忘**——别把预训练知识训没了 | 预训练多源 next-token prediction + flow-matching action expert **stop gradient**（Fig. 3 图注） |
| **每轮退回预训练 checkpoint** | **迭代漂移**——别让第 k 轮建在第 k−1 轮的偏差上 | *"Both the value function and policy are finetuned from the **pre-trained checkpoint, rather than the policy and value function from the last iteration**. We found this to be useful for **avoiding drift over multiple iterations**."* |

> **⇒ 第三层（全权重演进）挂着两个代价，不是一个。** 见 [[Cloud-edge co-evolving embodied agent - a continuous-evolution framework]]。
> 防漂移这条同时是"慢"的第三个来源：**不能增量，每轮都要从预训练点重新 finetune。**

### 一句话精髓

不要直接用 RL 优化策略，用值函数给数据打标签（好/坏），训练策略推理时"选择好的"。RL 问题 → conditional generation 问题。

### 与其他 RL-for-VLA 方法的区别

| 方法 | 训练方式 | 范围 |
|------|---------|------|
| **π*₀.6 (Recap)** | Advantage conditioning + offline RL | 端到端整个 VLA |
| PPO 直接 finetune | Policy gradient | 端到端，但不稳定 |
| Residual RL | 只训残差策略 | 小网络 addon |
| **RL Tokens** | 冻结 VLA + 小网络 RL | 轻量级插件 |
| DPPO | Diffusion policy RL | 扩散策略专用 |

## Results

- **折叠衣物**：真实家庭，连续 2h+ 不中断，泛化到未见过的衣物
- **组装箱子**：工厂实际包装，扁平箱体粘合+弯折等复杂操作
- **浓缩咖啡**：连续运行 13 小时，倒液体等精细操作
- 最难任务 throughput >2x，failure rate ~50% 降低
- Advantage conditioning 显著优于 PPO

### 迭代的粒度（"慢"到底慢在哪，2026-08-14 补）

- **轮数其实很少**：*"even **one iteration** often leads to significantly improved results."*
- **但单轮很重**：VI-C4 的 laundry 消融是**每轮采 600 条轨迹**，两轮做到 97%
- ⇒ **Recap 的慢不在轮数，在单轮粒度**：一批部署数据（600 条量级）+ 值函数重训 + 策略从预训练点**从头** finetune。
  对照 [[FAR - Failure-Aware Retry for Test-Time Recovery and Continual Policy Improvement|FAR]]：一轮 = 一次失败 + 一次偏好更新。**这才是那个数量级差距的准确来源。**

⚠️ **"车队级"是本库的外推，不是 Recap 的既有能力。** 预训练数据确实来自多机器人多任务，但**迭代改进实验用的是单一静态双臂平台**（两条 6-DoF 臂 + 三相机，50Hz 关节位置控制）；**是否跑过车队聚合协议，原文无述**。引用时勿当成它已验证的能力。

## Why It Matters

### VLA 自我改进的里程碑

π*₀.6 是第一个证明**通用 RL 配方**可以在大 VLA 上实现部署后持续改进的工作。之前的 RL-for-robotics 工作要么只在小模型上验证，要么需要特殊训练流程。Recap 提供了一个统一的框架：demonstrations + 自主经验 + 专家干预都能融入同一训练管线。

### Physical Intelligence 的两条 RL 路线

PI 同时探索了两条互补路线：
- **π*₀.6 (Recap)**：全模型 RL，端到端改进，适合通用能力提升
- **RL Tokens**：轻量级 RL 插件，冻结 backbone，适合精密操作特化

这呼应了 Ethan 的"能力层级拆解"论点：不同粒度的改进可能需要不同策略。

### 它是"第三层持续学习"目前唯一的 VLA 尺度实证（2026-08-14）

具身持续学习按**改什么**分三层：**① 上下文 → ② 小模块 → ③ 全权重**。第三层触发防遗忘需求（并进而约束训练算法与架构）。

π\*₀.₆ 是第三层在 **4.86B 尺度**上唯一被证明可行的配方，而且它的可行性建立在三个明确取舍上：

1. **主动避开 policy gradient** —— 不是做不到，是 flow matching 无可解似然 + 大 VLA 上 PPO 不稳定。**用离线标注换稳定性。**
2. **值函数选可靠不选最优** —— on-policy Monte Carlo，作者自认次优。
3. **防遗忘靠继承（KI）、防漂移靠重训** —— 两个代价都付了。

> **⇒ 对本库框架云①（大规模持续学习）可直接引用的判断：在 VLA 尺度上，目前唯一被证明可行的持续学习配方是离线的。**
> 而**训练推理解耦**是它被低估的性质——所有复杂度（值函数、优势标注、重训）留在离线，**部署端负担为零**（机器人上跑的还是 π₀.₆，只多喂一个文本 token，值函数推理时丢弃）。这使它**天然属于纯云侧演进通道**；对照 FAR 要求机器人在现场做梯度更新，而端侧训练正卡在"实时算力争用"上。

### 与 Agent Memory 的关联

π*₀.6 的"从经验中学习"本质上是一种记忆——把部署经验融入策略。但它是**隐式的**（权重更新），不是显式记忆（如 ChemBot 的 Episodic Memory）。结合两者的可能性：
- 显式记忆（ChemBot）：快速检索相似经验指导规划
- 隐式记忆（π*₀.6）：通过 RL 把操作经验融入底层执行

这正好对应我们之前讨论的"理想情况下两层都应有记忆"。

## Related Concepts

- [[Physical Intelligence - RL Tokens Precise Manipulation with Efficient Online RL]] — 同团队，轻量级 RL 路线（持续学习**第二层**）
- [[FAR - Failure-Aware Retry for Test-Time Recovery and Continual Policy Improvement]] — **同思想的快时间尺度版本**；两者值函数定义方式不同（MC 回报 vs 集内时序价值差），这是时间尺度差异的机械根源
- [[Cloud-edge co-evolving embodied agent - a continuous-evolution framework]] — 云① 持续学习引擎；演进通道 vs 运行时通道
- [[Physical Intelligence - pi0.5 a VLA with Open-World Generalization]] — **KI（Knowledge Insulation）来源**，π\*₀.₆ 的防遗忘是继承的
- [[VLA - Vision-Language-Action Models]] — 基础模型家族
- [[Agent memory]] — 从经验学习 = 隐式记忆
- [[Task decomposition]] — Recap 的分层训练管线
- [[World-Action Models]] — WAM vs VLA 路线对比

## Related Entities

- [[Physical Intelligence (π)]] — 作者团队
- [[Chelsea Finn]] — 共同作者 (Stanford)
- [[Sergey Levine]] — 共同作者 (UC Berkeley)
