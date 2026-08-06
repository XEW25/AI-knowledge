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
| 3 | 策略自身的分歧信号 | 执行+语义（弱） | 零额外模型 | 端 |
| 4 | 预期-实测核对（assertion） | 语义失败 | VLM 推理 | 端/云 |
| 5 | 学出来的成功/失败判别器 | 语义+执行 | **需采失败样本** | 端推理/云训练 |
| 6 | 不确定 → 求助 | 全类（前移） | 需校准 | 端触发/人 |
| 7 | 世界模型行动前验证 + 安全脊髓 | **不可逆** | 最贵 | 云慢环 / 端脊髓 |

**1｜前/后置条件契约.** 每个 primitive 声明 postcondition，且**只用本体可直接测量的量**表达：空抓 = 夹爪闭合宽度 vs 预期物宽 ＋ **末端移动时物体是否跟随**；接触建立 = 力/力矩阈值；"抽屉开了" = 关节位移 > 0.3m（即 [[Task decomposition|PDDL 谓词]]那套）。确定性、可解释、断网可用。局限：测不了语义状态。Harness VLA 已实现一半（primitive-level post-conditions 决定何时把控制权交回 planner）。

**2｜停滞检测.** 动作在发、状态不变 = 卡住。**性价比最高的一个**：几乎不要钱，却吃掉长程任务里最大的静默失败源。建议**每个 primitive 都带 no-progress 超时**。

**3｜策略自身的信号（免费且被低估）.** 不动权重就能拿到：**多采样 action chunk 看分歧**（π 系是 flow matching，天然可多采；分歧大 = 策略在此不确定）；连续两次推理的 chunk 抖动 = 状态模糊。即 **FAIL-Detect**（2503.08558）与 **Sentinel**（2410.04640）那条运行时监控线。零标注、与策略同源、可端侧。

**4｜预期-实测核对.** planner 调用前**显式声明预期后置状态**，调用后用 VLM 核对——本质是给具身动作加 **assertion**，把隐式判断变成可检查断言。

**5｜学出来的判别器（替代仿真 oracle 的正解）.** 真机化必须补的一环，本库已有三个可参照形态：**VLM 成功判别器**（AutoEval 微调 PaliGemma，与人工 **Pearson 0.942**）、**二值奖励分类器**（HIL-SERL，遥操采正负样本）、**value function**（[[Physical Intelligence - pi0.6 a VLA That Learns From Experience|π*₀.6 Recap]] 打 advantage）。三者都是"**训一次判别器、之后 per-sample 只花推理**"的**买断制**（[[Robot data engine]] 的 C 类），这是工业上唯一跑得起的形态。真实门槛 = **要采失败样本**。

**6｜不确定 → 求助.** **KnowNo**（conformal prediction，2307.01928）给出有统计保证的"我不确定"，触发人工介入。价值在于把"检测失败"**前移**为"失败前求助"；并直接接上 [[Robot data engine]] 的结论——**人类注意力才是稀缺资源，优化目标是每次求助的信息量，不是数据量**。

**7｜行动前验证 + 安全脊髓.** **World Action Verifier**（2604.01985）/ **Ctrl-World**（2510.10125）在动之前预测后果；实时兜底是端侧 **CBF/SHIELD**（2505.11494）。贵且慢 ⇒ **只对高风险/不可逆动作开**。

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

## Related
- [[Harness design]] — load-bearing 原则的来源；本页是它在具身侧的展开
- [[Home robot architecture - a hierarchical embodied agent]] — dependability 脚手架（各研究线的原始出处）
- [[Robot data engine]] — 质量信号 / 买断制判别器 / 人类注意力稀缺
- [[Embodied Cerebellum Models]] — 端侧监控与"脊髓"层
- [[Cloud-edge co-evolving embodied agent - a continuous-evolution framework]] — 演进通道、云④验证门
- [[Real-robot evaluation]] — 成功判据与测量可信度
- [[Physical Intelligence - pi0.6 a VLA That Learns From Experience]] — value function 作为质量信号
- [[Future embodied Agent framework - integrated view]] — 整合入口

## tags
#concept #embodied-ai #failure-detection #dependability #harness #runtime-monitoring #safety #agentic
