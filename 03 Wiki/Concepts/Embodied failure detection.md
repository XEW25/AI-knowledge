# Embodied failure detection（具身失败检测）

## Purpose
概念页：**具身 Agent 的失败检测，harness 侧具体能做什么**。此前这条线散在三处——[[Home robot architecture - a hierarchical embodied agent|dependability 脚手架]]（列了研究线但未组织成设计空间）、[[Robot data engine]]（质量信号的视角）、以及 harness 侧实践（[[Harness design]]）——本页是它们的收口。

> **核心命题**：LLM agent 的失败信号是**免费**的（exception / traceback / 编译错误 / 测试红绿，离散且可靠）；**具身环境不报错**。所以具身 harness 的一项本职工作就是——**给自己造 exception**。本页 = 造 exception 的办法清单 + 组织它们的两个维度。

**为什么这是 harness 侧问题而非模型侧问题**：以下机制绝大多数**不动策略权重**，套在冻结策略外面即可，因而是[[Embodied model function evolution - generalization as the master line|三种提升途径]]里最便宜的一条（不要数据、不要训练、不要新硬件）。

## 维度一：在检测哪一类失败
现有工作**绝大多数只覆盖第一类**，这是这张表最有用的地方。

| 类型 | 例子 | 可测性 | 现状 |
|---|---|---|---|
| **执行失败** | 空抓、滑脱、没插进去 | 本体传感器可直接测 | 覆盖最好 |
| **语义失败** | 抓对了动作但抓了**错的物体**、放错位置；**假成功** | 需语义判断 | 扰动场景的主要失败源，最难 |
| **进展停滞** | 既没成功也没明确失败，原地磨 | 便宜（状态不变） | 长程任务最常见，**最容易漏** |
| **不可逆事件** | 打碎、洒出、掉进缝隙、碰到人 | —— | **检测到就已经晚了 ⇒ 必须前置预防** |

> **Harness VLA**（[2607.08448](https://arxiv.org/abs/2607.08448)，*尚未 ingest*）的 Global Memory 恰好各覆盖一条：*"夹爪闭合但物体没跟着末端动 → 判为空抓"*（执行失败）与 *"不要仅凭视觉接近就判定完成"*（它称 **false visual success**，属语义失败）。第三、四类基本没碰。

### ⚠️ 为什么必须有多个检测器：分层依据是三维，不只是成本
[[Agia et al. - Sentinel Runtime Monitoring of Consistency and Progress for Generative Policies|Sentinel]] 的实测把这件事讲全了（它两个检测器**并行**跑，检出 >97% 未知失败，比单用任一个 **+18%**）：

| 维度 | erratic failures（行为紊乱） | task progression failures（不推进） |
|---|---|---|
| **检测成本** | STAC 可忽略 | VLM 贵 |
| **干预紧迫性** | **需立即干预** | 不需要（每 episode 查 2 次即可） |
| **信号模态**（最本质） | 在**动作空间**明显、**视觉上细微**（VLM 仅 77% TPR） | 在**视觉上明显**（停滞/偏离）、**动作空间上自洽**（STAC 仅 44% TPR） |

> **第三维才是"不能只用一个检测器"的根本原因**：两类失败**在不同的表征空间里才可见**。成本与紧迫性只决定"放在哪个频率层"，**模态互补决定"必须有两个"**。

## 维度二：什么时候检测（决定放云还是放端）

| 时机 | 作用 | 延迟预算 | 部署位置 |
|---|---|---|---|
| **事前** | **唯一能挡住不可逆失败** | 可慢 | 云/慢环（世界模型验证）+ 端侧安全层（CBF/shield，实时） |
| **事中** | 及时中止、局部重试 | 实时 | **必须端侧、断网可用** |
| **事后** | 回合级裁决 → 喂学习与记忆 | 可离线 | 云 |

## 七种机制（按成本从低到高）

| # | 机制 | 覆盖 | 成本 | 位置 |
|---|---|---|---|---|
| 1 | Primitive 前/后置条件契约 | 执行失败 | 零学习 | 端 |
| 2 | 停滞 / no-progress 超时 | 进展停滞 | 极低 | 端 |
| 3 | 策略自身的信号（观测 / 表征 / 动作 **三个位置**） | 执行 + 停滞（表征侧）+ 语义（弱） | **近零～买断制** | 端 |
| 4 | 预期-实测核对（assertion） | 语义失败 | VLM 推理 | 端/云 |
| 5 | 学出来的成功/失败判别器 | 语义+执行 | **需采失败样本** | 端推理/云训练 |
| 6 | 不确定 → 求助 | 全类（前移） | 需校准 | 端触发/人 |
| 7 | 世界模型行动前验证 + 安全脊髓 | **不可逆** | 最贵 | 云慢环 / 端脊髓 |

**1｜前/后置条件契约.** 每个 primitive 声明 postcondition，且**只用本体可直接测量的量**表达：空抓 = 夹爪闭合宽度 vs 预期物宽 ＋ **末端移动时物体是否跟随**；接触建立 = 力/力矩阈值；"抽屉开了" = 关节位移 > 0.3m（即 [[Task decomposition|PDDL 谓词]]那套）。确定性、可解释、断网可用。局限：测不了语义状态。

> **Harness VLA 的做法与取舍**（[[Zhang et al. - Harness VLA Steering Frozen VLAs into Reliable Manipulation Primitives via Memory-Guided Agents|源笔记]]）：它有 **post-condition**（`τ`，由 planner 在调用时下发），但**没有显式前置条件**——"何时该调 `vla_act`"交给 planner 依 Global Memory 的自然语言经验规则判断。⚠️ 这是**设计选择而非遗漏**：按 [[Harness design]] 的 **load-bearing 原则**，显式前置契约编码的假设是"planner 判断不可靠"；planner 够强时该部件就不承重、不该加。
>
> 但**前置守卫在一处有独立价值**：它是**最便宜的事前拦截**，位于"什么都不做"和"世界模型验证（机制⑦，最贵）"之间。很多不可逆事故的前置条件是可直接判定的廉价量——物体离桌沿太近、夹爪里已有东西、目标离人太近、力矩已接近上限。**用它挡掉一部分不可逆失败，比事后重试划算得多。**

**2｜停滞检测.** 动作在发、状态不变 = 卡住。**性价比最高的一个**：几乎不要钱，却吃掉长程任务里最大的静默失败源。建议**每个 primitive 都带 no-progress 超时**。

**3｜策略自身的信号（免费且被低估）.** 不动权重就能拿到，零标注、与策略同源、可端侧。

### 三个取信号的位置（2026-08 补全）
信号可以从策略的三个不同位置取，**它们不是同一件事的变体，各自擅长的失败类别不同**：

| 位置 | 读什么 | 代表方法 | 擅长抓 |
|---|---|---|---|
| **① 观测侧** | 进来的东西训练时见过吗 | **logpZO**（FAIL-Detect）、**RND-OE**（FIPER）、PCA-kmeans | 环境变了 |
| **② 表征侧** | 策略即将据以行动的那层特征正常吗 | **LLMD**（VLA-FAIL） | **空转**：死循环重试、与环境无关的"默认动作" |
| **③ 动作侧** | 策略对自己要做的事有把握吗 | **STAC**（Sentinel）、**ACC**（VLA-FAIL）、**ACE**（FIPER） | **行为紊乱**：抖动、自相矛盾 |

**观测侧**：[[Xu et al. - FAIL-Detect Uncertainty-Aware Runtime Failure Detection for Imitation Learning Policies|FAIL-Detect]]（TRI）把**最近 2 步观测 + 生成的未来动作**蒸馏成标量，按**序贯 OOD 检测**处理。最佳打分器 **logpZO**：用连续归一化流把观测**推进噪声空间**，分数 = **‖Z‖²**；**绕开了直接算密度所需的高维散度积分**，开销仅 **~0.03–0.04 s/步**。
[[Romer et al. - FIPER Failure Prediction at Runtime for Generative Robot Policies|FIPER]] 的 **RND-OE** 是同一位置的另一种做法：随机网络蒸馏的残差当新颖度，**关键设计是两个网络都复用并冻结策略自己的观测编码器** ⇒ 异常检测发生在**策略的嵌入空间**里，且**小数据也能训**（真机只用 10 条成功 rollout，且**不需要策略的训练数据**）。

**表征侧（本库此前缺的一格）**：[[Seligmann et al. - VLA-FAIL Efficient Task Failure Detection for Finetuned Vision-Language-Action Models|VLA-FAIL]] 的 **LLMD** 在**最后一层特征**上算逐 token 马氏距离。难点是 flow matching 的该层特征同时依赖噪声动作 `a_t`；解法是**固定先验噪声**——`t=0` 处 `p₀(a|o)=N(0,I)` **与 `o` 无关**，故可采单个固定 `a₀*`（`t>0` 固定会引入人为协变量偏移）。**一次前向即可，且可与动作采样并行；若不需多模态，开销为零。**
> **它的价值在于抓到了动作侧看不见的东西**：LLMD 擅长**策略反复重试成死循环**或**退化为默认动作**——正是本页维度一里**最容易漏的"进展停滞"类**。此前该类只有停滞超时（机制②，很粗）和 VLM（机制④，很贵）两档，**现在有了近零成本的中间档**。

**动作侧**：**STAC（时序动作自一致性）** — [[Agia et al. - Sentinel Runtime Monitoring of Consistency and Progress for Generative Policies|Sentinel]] 的核心。生成式策略每 `k` 步重规划但预测 `h` 步（`k<h`）⇒ **t 与 t+k 两次预测在时间上重叠**；比较两个分布在重叠窗口上的**统计距离**。原理：策略相当于内含一个世界模型，**分布内它会同意自己刚才的预测，OOD 时会自我矛盾**。检出 **99% 的 erratic 失败**、**策略无关**。
后续两个改进都在动作侧，且**都指出了 STAC 的同一个毛病**（见下）。

> ⚠️ **两个必须记住的更正**（否则会走弯路）：
> 1. **不是"看单时刻采样方差"**。朴素的 **Diffusion Output Variance**（对 B 条采样算方差）在 Sentinel 里是**被 STAC 击败的 baseline**，且原文指出它"does not quantify epistemic model uncertainty"。**关键在跨时刻的自一致性，不在单时刻的离散度。**
> 2. **必须用分布距离，不能比均值**。生成式策略是多模态的（同任务多种合法解法）；消融显示**用非统计距离（如 min. distance）比 baseline 还差**，正因为它抹掉了多模态性。实现用 **MMD + RBF 核**。
>
> **结构性约束（仍然成立）**：STAC/ACC 一族**依赖 chunk 重叠**，对 horizon 敏感（k=2→TPR 61%，k=4→78%，**k=8/h=16→95%**）；**单步策略、`k=h`、或完全开环整块执行时全部不适用**。

### ⚠️ 成本前沿已经下移（2026-08 重要修正）
本页此前记的是"**STAC 未必能放端侧实时跑**"——它每步要生成 **256 条动作预测**，[[Xu et al. - FAIL-Detect Uncertainty-Aware Runtime Failure Detection for Imitation Learning Policies|FAIL-Detect]] 的硬件实验**干脆没跑它**（"*slow to run on hardware in real-time*"）。**这个限制被解决了，而且是被一个更简单的东西解决的。**

[[Seligmann et al. - VLA-FAIL Efficient Task Failure Detection for Finetuned Vision-Language-Action Models|VLA-FAIL]] 的 **ACC 本质上是 STAC 的速度归一化单样本估计**，却**在几乎所有真机任务上胜过 STAC**。三处简化：**每步只采 1 个动作样本**（vs 256）、**只用 D=3 的末端位置**、**速度归一化 + 强指数平滑 α=0.9**（成功执行中本来也会重规划，**只有持续不一致才是失败信号**）。

**按额外算力排的当前成本前沿：**

| 档 | 方法 | 额外成本 |
|---|---|---|
| **≈0** | **ACC**、**LLMD**（可与采样并行；不要多模态时为零）、**DVAC 的去噪方差** | 复用已算出的东西 |
| 低 | **RND-OE**（一次小 MLP 前向） | 需离线训一个小模型 |
| 中 | **logpZO**（CNF，~0.03–0.04 s/步）、**ACE**（采 B 个动作块） | 买断制 |
| 高 | **STAC**（256 次采样） | 真机实时下曾跑不动 |
| 很高 | **VLM 语义监控** | 只能低频 |

⇒ **"策略自身信号 = 免费"这句话，在用对估计量的前提下重新成立了。** 此前的收紧（"必须 learned 才好用，post-hoc 都被击败"）是对 2025 年那批 post-hoc 信号（采样方差 / SPARC / PCA-kmeans）成立的；**ACC 与 LLMD 是新一代的近零成本信号，且不是靠更聪明的后处理，而是靠选对了读信号的位置和归一化方式。**

> ⚠️ 但**买断制结构没有消失**，只是位置变了：LLMD 需要**对微调数据做一次无梯度预处理**，RND-OE 需要**离线训一个小网络**。仍是 [[Robot data engine]] 的**买断制**（训一次，之后每次只花推理）。

### ⚠️ STAC 的一个毛病被两个组独立诊断出来
[[Seligmann et al. - VLA-FAIL Efficient Task Failure Detection for Finetuned Vision-Language-Action Models|VLA-FAIL]] 与 [[Romer et al. - FIPER Failure Prediction at Runtime for Generative Robot Policies|FIPER]] 各自独立指出：**STAC 会把"策略正在决定采用哪个行为模态"的时刻误判为高不确定性**（先拿 A 还是 B、从侧面还是上方抓、从左还是右绕障）。

- **VLA-FAIL 的解释**：ACC **只与已执行的动作块比较，不与反事实轨迹比较** ⇒ 模态选择时更少误报
- **FIPER 的解释**：多模态下**该测分布的锐度（熵）而非离散度（方差/距离）**——因为 IL 的多模态**通常是离散的**，每个采样都应清晰落在某一模态里

> **这条与本页原有的更正②不冲突，而是把它推进了一层**：原来的教训是"**必须用分布距离，不能比均值**"（否则抹掉多模态性）；新的教训是"**用了分布距离仍然不够——分布距离在模态切换处本身就会大**"。⇒ **多模态是这条线上反复出现的头号麻烦，且每一代方法都在它上面栽一次。**

**3′｜⚠️ 机制③ 与机制⑥ 是一条流水线，不是两个并列项.** 正确结构是：

```
信号提取（STAC / 学出的密度估计 / 本体量）
      ↓
conformal prediction 校准
      ↓
有保证的决策（报警 → 重试；或 → 求助人类）
```
**CP 是把原始分数变成"有统计保证的决策"的连接组织**，KnowNo（语义/规划层）、FAIL-Detect（执行监控层）、STAC（动作一致性层）用的是**同一套机器、施加在不同层次**。⇒ **CP 的 α 就是本页"漏报/误报权衡"那个原则的可调旋钮**：你选定容许误报率，它给统计保证。（如何按"漏报传播代价 vs 误报物理代价"来定 α，是开放问题。）

**3″｜双检测器 + CP 已经是这条线的事实标准配方（2026-08）.**
四篇独立工作收敛到了同一个骨架：**一路读"环境陌生吗"，一路读"策略犹豫吗"，只用成功数据，用 conformal prediction 定阈值。**

| 工作 | 环境侧 | 策略侧 | 组合 | 阈值 |
|---|---|---|---|---|
| Sentinel | —（改用 VLM 管语义进展） | STAC | 并行 | 常数 |
| FAIL-Detect | logpZO | — | 单路 | **时变** |
| **FIPER** | **RND-OE** | **ACE** | **AND** | **时变** |
| **VLA-FAIL** | **LLMD**（表征侧） | **ACC** | **OR** | **常数** |

### ⚠️ 组合逻辑：AND 与 OR 是可测量的取舍，不是风格
- **FIPER 用 AND**——理由是"**并非所有 OOD 都导致失败**，且成功 rollout 里也会有暂时的高 aleatoric 不确定性"。它还证明了 **Proposition 1**：两路各按 `δ` 校准后，即使两个分数**不独立**，合取预测器**仍满足同一个误报上界**（合取只会更保守，界自动保持）。
- **VLA-FAIL 用 OR**——评测时对两个分数各做秩变换后**取最小值**。

**代价被 FIPER 自己的主表量化了**：

> 检测时间 DT：**RND-OE 单用 0.18 < ACE 单用 0.25 < FIPER(AND) 0.30**，而 TWA/准确率的顺序正好反过来（0.59 / 0.63 / **0.65**）。

⇒ **合取更准但更慢，析取更早但更吵。** 按本页原则②（误报与漏报的代价不对称**且方向会翻转**），这条原则第一次有了两个可比的落点：**高风险/不可逆动作该用 OR 抢时间，常规动作该用 AND 抑噪**。**动态切换组合逻辑目前没有工作做过。**

### ⚠️ 阈值类型之争：其实两边同意，只是被任务集推到了两端
表面冲突：FAIL-Detect 与 FIPER 用**时变**阈值，VLA-FAIL 明确拒绝时变、用**常数**。但 FIPER 附录 D 自陈了时变阈值的两个失效条件，**恰好就是 VLA-FAIL 的理由**：

> "if the training data contains **multiple temporally distinct ways of completing the task**, **a constant threshold may be more suitable**"
> 时变阈值只能在校准集里出现足够多次的时刻上计算 ⇒ **rollout 长度不一时会出问题**

VLA-FAIL 拒绝时变的原话则是：*"not applicable to episodes that vary significantly in length, such as in our real-world Drawer task"*。

⇒ **可提炼成一条部署规则**：**回合时序稳定（同一任务总是差不多的节奏）→ 时变阈值更紧；回合长度或完成路径多变（长程、多阶段、允许重试）→ 常数阈值更稳。** 长程家务任务显然属后者。

### ⚠️ "benign OOD" 是这条线真正的难点所在
本页原先把"只用成功数据"的代价记为**问题被弱化成"是否偏离训练分布"（OOD ≠ 一定失败）**。FIPER 正面攻击了这道缝：把 rollout 分成 **Success ID / Success OOD / Fail ID / Fail OOD** 四象限，**关键指标是 Success OOD 与 Fail ID 之间的间隔**——即"看着陌生但策略能扛" vs "看着正常但已经在失败"。

实测教训两条：
- **纯 OOD 检测器确实掉在这条缝里**：PCA-kmeans 的 **TNR 仅 0.24**
- ⚠️ **"成功/失败平均分数差大" ≠ "预测性能好"**（作者据 PCA-kmeans 的反例明确指出）—— 挑检测器时别只看分数分离图

⇒ 该段的"代价"可以从**限制**改写为**已被专门攻击的子问题**，但**远未解决**：FIPER 的总体准确率**只有 0.78**，作者自陈对"必须早、必须准、误报很贵"的场景（如装配线）仍不够。**本库谈"失败检测让长程 `p^N` 不崩"时应带上这个量级——当前技术水平是"有用的粗筛"，不是"可信的守门员"。**

### 指标：检测时间终于进了指标本身
VLA-FAIL 的 **AUCPDT** 与 FIPER 的 **TWA** 是两个组**独立提出**的同一类修正：此前普遍报准确率 + 单独一个检测时间，**而单看任一个都可被套利**——一直等到回合结束再"预测"能拿高准确率，第一步全报警能拿完美延迟。两者都把"早"折进主指标（TWA 给真阳性记 `1−DT`；AUCPDT 取 precision–PDT 的 Pareto 前沿面积）。⇒ **同一个评测缺陷被同时发现两次，说明这是该子领域当前的真实痛点**（对位 [[Real-robot evaluation]] 的指标设计讨论）。

**3‴｜同一族信号的第二种用法：不报警，调粒度（本页此前漏掉的一整列）.**
以上全部是"**测出不确定 → 停下 / 求助 / 重试**"。[[Feng et al. - DVAC Denoising-Variance Adaptive Chunking for Flow-Based Robot Policies|DVAC]] 展示了另一种消费方式："**测出不确定 → 把执行粒度调细，多想几次**"。

它读的是 flow matching **整条去噪轨迹上干净动作估计的尾部方差**（这个量本来就算出来了，此前所有部署都只取最后一步、把轨迹丢掉）。观察是：**方差在自由移动阶段低，在接触密集/精度敏感阶段陡升**（40 个 LIBERO 任务上逐步标注 MOVING/OPERATING，得到稳定负相关 `r < −0.27, p < 0.05`）。做法是**把低方差前缀执行掉，在高方差动作被提交之前重规划**。π₀.₅ 上 LIBERO **0.948 → 0.980，同时重规划次数 −43%**。

> **同一个信号，一个当刹车，一个当变速箱。**
>
> 关键差别：**变速箱这一档没有误报代价**——把执行粒度调细，最坏只是多花几次推理；不像误报会触发不必要的物理重试。按本页原则②（误报的物理代价），**这是一条严格更安全的不确定性消费方式，应当优先于报警型机制被采用。**

⚠️ **但它不是检测器**，作者自陈：*"uses denoising variance as an **empirical proxy** for action stability rather than a **calibrated uncertainty or safety estimate**"*（三篇检测工作都有 CP 层，它没有）。作者自己指的 future work 正是**把去噪方差与视觉反馈、接触线索、任务进展指标结合起来构建更可靠的失败检测器**。

⚠️ **一个具体且尚无人处理的兼容性问题**：ACC/STAC 都依赖**固定的 chunk 重叠结构**，而 DVAC 让 `N_exec` 逐步变化 ⇒ **重叠长度随之变化，检测器的统计前提被动摇**。想同时用这两样东西的话，这是必须先解决的。

**4｜预期-实测核对.** planner 调用前**显式声明预期后置状态**，调用后用 VLM 核对——本质是给具身动作加 **assertion**，把隐式判断变成可检查断言。

**5｜学出来的判别器（替代仿真器成功判据的正解）.** 真机化必须补的一环，本库已有三个可参照形态：**VLM 成功判别器**（AutoEval 微调 PaliGemma，与人工 **Pearson 0.942**）、**二值奖励分类器**（HIL-SERL，遥操采正负样本）、**value function**（[[Physical Intelligence - pi0.6 a VLA That Learns From Experience|π*₀.6 Recap]] 打 advantage）。三者都是"**训一次判别器、之后 per-sample 只花推理**"的**买断制**（[[Robot data engine]] 的 C 类），这是工业上唯一跑得起的形态。

> ⚠️ **"必须采失败样本"这个门槛被证伪了（2026-08 修正）**：[[Xu et al. - FAIL-Detect Uncertainty-Aware Runtime Failure Detection for Imitation Learning Policies|FAIL-Detect]] 整篇就在论证 *"detect failures **without failure data**"*——只用成功数据训练（且 **ID-only 校准即可覆盖 OOD 测试**，冷启动无需预先采 OOD 数据）；[[Agia et al. - Sentinel Runtime Monitoring of Consistency and Progress for Generative Policies|Sentinel]] 的 STAC 校准集同样**只需少量成功 rollout**。代价是问题被弱化为**"是否偏离训练分布"**（OOD ≠ 一定失败），但对**冷启动**极有价值：一条失败样本都没有时也能先跑起来。⇒ 上面三个"需正负样本"的形态是**更强但更贵**的一档，不是唯一入口。

**6｜不确定 → 求助.** **KnowNo**（conformal prediction，2307.01928）给出有统计保证的"我不确定"，触发人工介入。价值在于把"检测失败"**前移**为"失败前求助"；并直接接上 [[Robot data engine]] 的结论——**人类注意力才是稀缺资源，优化目标是每次求助的信息量，不是数据量**。

**7｜行动前验证 + 安全脊髓.** **World Action Verifier**（2604.01985）/ **Ctrl-World**（2510.10125）在动之前预测后果；实时兜底是端侧 **CBF/SHIELD**（2505.11494）。贵且慢 ⇒ **只对高风险/不可逆动作开**。

## 谁来判、判什么：三层分工（真机部署的关键结构）

仿真里可以"一层搞定"（成功判据由仿真器直接给）；**真机上这件事必须分层**，因为判定的语义层次与可用频率强相关。

| 层 | 判什么 | 谁判 | 频率 | 形式 |
|---|---|---|---|---|
| **L1 本体谓词** | 物理事件：抓住 / 接触 / 到位 / 抬起 / 释放 / 卡住 / 超限 / 超时 | primitive wrapper 里的**固定小谓词库** | 控制环频率 | 确定性规则，**参数化** |
| **L2 学出的判别器** | 语义 / 任务级：成功了吗、放对了吗 | 端侧小模型（VLM / 分类器） | ~10Hz | 学出来（机制⑤） |
| **L3 planner** | 要不要重试、换什么策略 | LLM planner | 秒级 | 推理 |

**⚠️ 一个常见误解**：τ 这类执行期判定**不是动作模型的职责**——VLA 只吐 action chunk，判定在**包着它的 wrapper 代码**里。所以"现在的 VLA 没被训练做判别"不构成障碍。

### 真机上 τ 能取什么（决定 L1 的表达上限）
Harness VLA 列的 τ 四种形式，逐个看真机可行性：

| τ 形式 | 真机 | 靠什么 |
|---|---|---|
| chunk budget | ✅ 平凡 | 计数器 |
| contact-state | ✅ **真机上甚至更自然** | 力/力矩传感器（仿真反倒要建模接触） |
| lift-and-grasp | ✅ 大体可以 | 末端高度 + 夹爪宽度 + 负载/跟随性 |
| **benchmark predicate** | ❌ **仿真专属** | —— |

⇒ **真机上"执行中判定"完全可行且必须存在**（否则 primitive 不知何时停手），但**只能基于本体自身可测的量**；任务语义层面的"成功了"跑不到控制环频率上。

> **由此推出 L2 存在的结构性理由**：真机上 τ 只能"很笨"，判定压力上移，但 planner 是秒级的接不住 ⇒ 中间那道**频率鸿沟**（比本体条件聪明、比 planner 快）必须由端侧学出来的判别器填。**这才是机制⑤的根本理由**——不只是"替代仿真成功判据"（功能性理由），而是**它填的是多速率栈里的一个空档**（见 [[Embodied Cerebellum Models]]）。

### 规则会不会爆炸？——不会，如果按"固定谓词 × 任务参数"组织
**任务是无穷的，但物理事件类型是有限的**（上表 L1 那八类差不多就够）。任务的多样性体现在"**用哪几个谓词、什么顺序、参数取多少**"，而不是"需要新的谓词种类"。这与 [[Task decomposition|PDDL]]／LEACL 的设计哲学同构（谓词词表固定且小，多样性靠组合 + 连续参数如 `Open(drawer, 0.3)`），也与 Harness VLA "keep the primitive library fixed and small" 同构。

分工：**谓词的实现**（怎么测"抓住了"）= 工程一次性写好、跨任务复用；**谓词的选择与参数**（这次用哪个、阈值多少）= planner 调用时绑定。**爆炸只发生在按任务写规则的时候；按物理事件写就不会。**

剩下的真实成本是**阈值标定**（"力矩超过多少算接触"）——但它**按本体一次性标定，不随任务数增长**（同 [[Real-robot evaluation]] 里"阈值来自本体规格书，不来自评测设计"）。

## 检测管线的四段分工与挂载粒度（2026-08，来自工业代码核实）

审计 [[openJiuwen - JiuwenSymbiosis Physical AI Assistant Framework|JiuwenSymbiosis]]（华为，rails 架构）后，本页的机制在一条真实管线上落位，并暴露出两条此前没写的结构：

**① 失败管线是四段，各司一职、不可互相顶替：**

| 段 | 职责 | 工业对应 | 现状 |
|---|---|---|---|
| **拦截** | 事前否决非法指令（运动学层） | SafetyRail（Z/XY/关节限位，抛异常让 LLM 自纠） | ✅ 已有 |
| **裁决** | 事后判定真实结果（"发了、执行了，**但成了吗**"） | **DetectionRail——待建**；现只有夹爪闭合处一个硬编码后置条件（`is_grasp_confirmed`，fail-closed） | ❌ 最大的洞 |
| **善后** | 对失败做物理恢复 | RecoveryRail（持物三态、回 home） | ✅ 已有（仅四格第一格） |
| **转述** | 把失败讲给 LLM 重规划 | DiagnosisRail（因果链+"别用原参数重试"注入下一轮） | ✅ 已有 |

**关键发现：现有工业管线的"裁决"段是空的**——DiagnosisRail 的 `_is_failed` 三条通道（exception > `success=False` > entry.error）**全是自报信号，自己零判断**。⇒ 工具说成功但世界没到位的失败（semantic），整条管线是瞎的，防线只剩 VLM prompt。**Diagnosis（写病历）≠ Detection（做检查）**——先有报告员、没有检查科，是收口本页机制①⑤时最该防的实现走样。补 DetectionRail 时的接线技巧：裁决后直接翻 `success=False`，下游善后与转述一行不改（它们本来就监听这两条通道）。⚠️ 已知接缝：RecoveryRail 只挂 `on_tool_exception`，听不到 after_tool_call 里的翻案。

**② 挂载粒度决定 during 那一列住哪**：rail 站在工具边界上，对执行单元**内部的循环**（伺服环、VLA chunk 循环）整段失明 ⇒ **本页三个时机里的"事中"必须住进复合算子内部**（伺服看门狗 / chunk 级监控器），且内外证据基础不同——**算子内消费策略侧信号（可中止、无权定罪），边界 rail 消费世界侧证据（正式裁决）**。展开见 [[Harness granularity]]。

另一条廉价 L2 机制（来自 [[RLinf - RPent Recursive Physical Agent Framework|RPent]]）：**把分割叠加图（而非原始帧）回传给 VLM planner**——"检测器高置信度锁错物体"在坐标数字里不可见，看一眼 mask 压在哪就能发现；成本只是一次已有 VLM 的 look，机制上只需改视觉反馈的注入内容。

## 检测之后：恢复的四格设计空间

本页主体讲**检测**；检测到之后**怎么恢复**是另一个设计空间。同一个目标（把策略拉回它的能力域），已有四种改法——**改的东西不同，代价与风险差别很大**：

| 工作 | 改什么 | 机制 | 策略 | 代价 |
|---|---|---|---|---|
| [[Zhang et al. - Harness VLA Steering Frozen VLAs into Reliable Manipulation Primitives via Memory-Guided Agents\|Harness VLA]] | **机器人的物理位形** | re-staging：改 approach pose / viewpoint / 局部摆位，把机器人送进 VLA 能力域 | 冻结 | 要真移动：时间、磨损 |
| [[Zeng et al. - HELM Harness-Enhanced Long-horizon Memory for VLA Manipulation\|HELM]] | **世界状态** | 取 EMM 里的历史关键帧当视觉目标，prompt "return to the state shown" 让 VLA **把世界开回去** | 冻结 | 要真开回去；"回得去吗"存疑 |
| [[Shin et al. - B2FF Failure Recovery for VLA Policies via Pre-Imagined Milestone Selection\|B2FF]] | **喂给策略的目标** | 从**执行前预想**的 milestone bank 选一个，**钉死为 future-image 条件**，只对动作去噪 | 冻结 | **零物理代价** |
| [[FAR - Failure-Aware Retry for Test-Time Recovery and Continual Policy Improvement\|FAR]] | **策略本身** | IQL 价值差定位失败动作 → **偏好适配（FCPA）** + 轻量动作扰动扩 support | **测试时更新** | 在线训练与稳定性风险 |

> **前三格在"绕过"策略的不足，第四格在"修正"它。** 取舍很清楚：**冻结 = 零训练成本、行为可预测；更新 = 能真正学会，但引入在线训练与稳定性风险**（灾难性遗忘、被单次失败带偏）。
>
> **FAR 还闭合了一个此前空缺的环**：恢复尝试**本身产出训练信号**——失败 → 定位失败动作 → 适配 + 探索 → **恢复成功的轨迹进 replay buffer** → 持续改进（**价值估计也一并变好**）。这是本库第一个把**运行时通道（恢复）**与**演进通道（经验↑）**接起来的工作，且**全程自主**（用学出的价值函数替掉了"人来标哪一步错了"）。详见 [[Robot data engine]] 的质量信号讨论。

> **由此得出的一条判断**：**动作头的"能力域"不只由当前状态定义，还由你给它的目标定义** —— `p(success | o₀, goal)` 是**两个变量**的函数。⇒ **恢复分布内性有两条路：移动机器人，或者换个目标。** 后者在真机上更便宜，这补上了本页"真机重试有物理成本"讨论里缺的一半。
>
> **B2FF 的适用边界正好复述了本页的四类失败**（作者自陈）：只处理**可恢复的偏离**（任务仍物理可行、物体仍可观测可达、技能已具备）；**不处理语义失败**（任务理解错、物体 grounding 错）与**不可逆失败**（离开工作空间、不可逆的环境改变）。⇒ 外部工作对本页分类学的一次独立印证。
>
> **⚠️ 检测与恢复是可分离的**：B2FF 明确把恢复触发估计当作"**可替换的入口**"（主结果在**受控触发时机**下取得）。⇒ 本页的检测机制与上表的恢复机制**是天然互补的组合，而目前没有工作把两者接起来**。

## 主动探测（active probing）：harness 特有的一招

前六种机制都是**被动观察**。harness 还能做一件模型做不到的事——**主动改变观测来消除歧义**：

> 不确定抓住没有？别光看——**轻轻抬 2cm 再看**。物体跟着走 = 抓住了；没跟着 = 空抓。

用一个廉价、可逆的**试探动作**，把模糊的被动观测变成明确的二值答案。**与 LLM agent 的"跑一下测试"完全同构**：不确定代码对不对就执行它；具身侧的对应物就是**做个小实验**。

两点价值：
- **绕开阈值精度问题** —— 与其把"抓住"的阈值调准，不如设计一个让答案自己显现的动作。
- **天然受"失败可逆"约束** —— 探测动作本身必须廉价且可逆（抬 2cm 可以，直接开始搬运不行）。

⇒ 一条设计规则：**每个高风险 primitive 都应配一个廉价的探测后缀**。目前无工作系统化地这么做。

## 落地优先级（分析判断）
**先做 1 + 2 + 3**：零标注、零训练、可端侧、断网可用，即可吃掉**执行失败 + 进展停滞**两大类——而这两类正是长程 `p^N` 崩塌的主要贡献者。**5** 有标注成本，第二步。**7** 只对不可逆动作开。

## 两个设计原则

**① 检测器本身就是 harness 组件，同样适用 load-bearing 原则.**
每个检测器都编码了"策略在这里不可靠"的假设。策略变强后，某些检测器会从"救命"退化为"添乱"（无谓重试）。⇒ 检测器应**可度量贡献、可退役**。这是 [[Harness design]] 核心洞见在此处的直接应用；**目前没有任何工作这么做**（研究机会）。

**② 误报与漏报的代价不对称，且方向会翻转.**
- 长程任务中**漏报**（该停没停）代价远大于误报——错误沿链条传播，正是 `p^N` 崩塌的机制 ⇒ 检测器应偏保守。
- 但真机上**重试有物理成本**（时间、磨损、反复接触可能损坏物体）⇒ 又不能太保守。

这个 trade-off **在仿真里根本不存在**（重试免费），所以现有工作都没处理。它给检测器一个真实的目标函数：不是最大化检测精度，而是**最小化（漏报的传播代价 + 误报的物理代价）**。

## 与本库的关系
- **端侧 1–4** → 反应小脑的监控部分，喂 **L3 任务环**做局部重试（[[Embodied Cerebellum Models]]）
- **5–6** → **演进通道**入口：失败样本 ↑云、判别器 ↓端（[[Cloud-edge co-evolving embodied agent - a continuous-evolution framework]]）
- **7** → **安全脊髓**，防不可逆；与 L3 是**两个不同层**，不可混同（详见 [[Task Decomposition as OOD Mitigation]] 里"拆解不解决探索"的同类分层教训）
- **成功判据的可信度问题** → [[Real-robot evaluation]]（真机评测作为测量学）

> **一个闭环（本页最有价值的推论）**：机制 5 训出来的判别器，**同时就是数据引擎的质量信号**。⇒ **做失败检测和做数据飞轮是同一件事的两面**——能判断"这次做成了吗"的东西，正好也能判断"这条轨迹值不值得学"。这可能是 harness 侧投入回报最高的一点。

## Open questions
- **检测器的退役判据**：如何度量一个检测器是否还 load-bearing？
- **漏报/误报的成本函数**如何在真机上标定（需要物理代价的量化）。
- **语义失败**（抓错物体/假成功）目前只能靠 VLM 核对，可靠性未知——这是四类里最欠缺的一格。
- 失败样本的采集：判别器需要负样本，但**部署中主动制造失败**与安全相冲突。
- 检测知识能否**跨机器人共享**（Harness VLA 的 Global Memory 形态 → 车队共智）？
- **AND 与 OR 缺一次同任务集的直接对比** —— FIPER 与 VLA-FAIL 的任务集零重叠，现有比较全是间接的。
- **能否按动作风险动态切换组合逻辑**（不可逆动作 OR、常规动作 AND）？无人做过。
- **三个动作侧信号（ACC / ACE / DVAC 去噪方差）冗余度多高？** 都在读"策略对动作的把握"。若高度冗余，按 [[Harness design]] 的 load-bearing 原则应只留最便宜的那个。
- **自适应执行时域与依赖 chunk 重叠的检测器不兼容** —— DVAC 让重叠长度逐步变化，ACC/STAC 需重新校准。
- **LLMD 的训练数据依赖能否去掉**？（用少量成功 rollout 估 `μ_s`、`Σ_s` 而非全量微调数据）—— 这决定它能否用在别人发布的 checkpoint 上，而那是 VLA 时代最常见的用法。
- **LLMD 抓"死循环重试"与机制②的停滞超时覆盖重叠多少**？若重叠很大，该退役哪一个？

## Related
- [[Harness design]] — load-bearing 原则的来源；本页是它在具身侧的展开
- [[Home robot architecture - a hierarchical embodied agent]] — dependability 脚手架（各研究线的原始出处）
- [[Robot data engine]] — 质量信号 / 买断制判别器 / 人类注意力稀缺
- [[Embodied Cerebellum Models]] — 端侧监控与"脊髓"层
- [[Cloud-edge co-evolving embodied agent - a continuous-evolution framework]] — 演进通道、云④验证门
- [[Real-robot evaluation]] — 成功判据与测量可信度
- [[Physical Intelligence - pi0.6 a VLA That Learns From Experience]] — value function 作为质量信号
- [[Future embodied Agent framework - integrated view]] — 整合入口

**本页机制③的四个主要源笔记（按信号位置）**
- [[Agia et al. - Sentinel Runtime Monitoring of Consistency and Progress for Generative Policies]] — 动作侧 STAC + VLM 语义；两类失败的模态互补论证出处
- [[Xu et al. - FAIL-Detect Uncertainty-Aware Runtime Failure Detection for Imitation Learning Policies]] — 观测侧 logpZO；"无需失败数据"的正式出处
- [[Romer et al. - FIPER Failure Prediction at Runtime for Generative Robot Policies]] — RND-OE + ACE，**AND 组合**、benign-OOD 四象限、TWA
- [[Seligmann et al. - VLA-FAIL Efficient Task Failure Detection for Finetuned Vision-Language-Action Models]] — LLMD（**表征侧**）+ ACC，**OR 组合**、成本前沿、AUCPDT、**首次在大 VLA 上验证**
- [[Feng et al. - DVAC Denoising-Variance Adaptive Chunking for Flow-Based Robot Policies]] — **同族信号的非报警用法**（调执行粒度）

## tags
#concept #embodied-ai #failure-detection #dependability #harness #runtime-monitoring #safety #agentic
