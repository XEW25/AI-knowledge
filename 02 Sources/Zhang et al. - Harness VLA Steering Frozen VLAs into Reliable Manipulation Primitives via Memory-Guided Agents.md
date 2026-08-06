# Harness VLA: Steering Frozen VLAs into Reliable Manipulation Primitives via Memory-Guided Agents

- **Raw note**: [[2026-08-06 - Zhang et al. - Harness VLA Steering Frozen VLAs into Reliable Manipulation Primitives via Memory-Guided Agents]]

## Metadata
- **Type**: source note
- **Format**: arXiv preprint (cs.RO), **v1 2026-07-09**;CC BY 4.0;项目页 https://harnessvla.github.io/
- **Authors**: Yixian Zhang\*, Huanming Zhang\*, Feng Gao, Xiao Li, Zhihao Liu, Chunyang Zhu, Jiaxing Qiu, Yuchen Yan, Jiyuan Liu, Wenhao Tang, Zhengru Fang, Yi Nie, Changxu Wei, Yu Wang, Wenbo Ding, **Chao Yu**†(通讯) — \*equal
- **Organization**: **清华大学** + Striding AI + Purdue + 中科院自动化所 + **无问芯穹** + 中关村学院 + 港科大
- **arXiv**: [2607.08448](https://arxiv.org/abs/2607.08448)
- **Open source**: 项目页已上线;**代码/权重未见明确发布**(截至 2026-08-06)
- **Raw tier**: URL-only(未下载 PDF)
- **Verification status**: 机制 / τ 语义 / 记忆结构 / 结果 / 局限 **全文自读核实**(arXiv HTML v1)于 2026-08-06
- **Related**: [[Harness design]], [[Embodied failure detection]], [[VLA - Vision-Language-Action Models]], [[Task Decomposition as OOD Mitigation]], [[Physical Intelligence - pi0.5 a VLA with Open-World Generalization]], [[Huang et al. - ChemBot Long-Term Memory for VLA-based Agents]], [[Future embodied Agent framework - integrated view]]
- **Tags**: #agentic #harness #vla #frozen-policy #memory #failure-detection #retry #primitive-library #embodied #tsinghua

## Summary

把一个**冻结的 VLA 降级成一个 primitive**（`vla_act`），与一小组**固定的**解析式原语（`move_to` / `move_pose` / `rotate_wrist` / `rotate_pitch` / `set_gripper` / `release`，RoboCasa 另加 `navigate_to` / `move_base`）一起，交给一个 agentic planner 用 **JSON 调用**编排。planner 从不直接发力矩、关节目标或 action chunk。

**责任重新分配**是全篇的骨架：语义接地、目标重绑定、自由空间运输、姿态调整、导航、失败后重摆位、长程组合 → 全部上提到 planner；**只有接触丰富的局部** → 留给冻结 VLA。这把 VLA 从"单体轨迹策略"变成**可复用的接触专家**，从而**在不微调、不扩库的前提下**把它带出原训练轨迹分布。

核心主张明确反对扩库：*"keep the primitive library fixed and small, and let the agent learn how to orchestrate it"*——因为扩库要求 agent 判断"新写的技能是否有效/可复用/在变化场景下是否安全"，而具身场景**无法便宜地验证这件事**。

被包的冻结 VLA 三选一：**π0.5-SFT**（LIBERO/LIBERO-Pro）、**RLDX-1**（RoboCasa365）、**LingBot-VLA**（RoboTwin C2R）。

## 关键机制

### τ：planner 下发的"终止判据"
`vla_act` 调用时，planner 同时给**任务条件化 prompt** 和一个 **early-return predicate τ**；VLA 持续吐 action chunk **直到 τ 满足或 chunk 预算耗尽**。τ 可取四种形式：**lift-and-grasp condition / contact-state condition / benchmark predicate / chunk budget**。

> **含义（本库判断）**：同一个冻结策略靠一个参数就能被**特化成多个局部专家**（抓取阶段 τ=lift-and-grasp，插入阶段 τ=contact-state），完全不动权重。也意味着**计划级接口的载荷是 (目标, 终止判据) 二元组**，而非只有目标——见 [[Future embodied Agent framework - integrated view]]。

### 两层判定（不要混为一谈）
| 层 | 谁判 | 判什么 | 频率 |
|---|---|---|---|
| 执行中 | **环境**（用 planner 预设的 τ） | **何时停手** | 每步，planner 不参与 |
| 返回后 | **planner** | **停了之后成没成** | 每个 primitive 一次 |

primitive 终止后引擎回传 `o_{t+1}` + robot state + **execution / diagnostic record**（accepted command、primitive status、step counts），planner 据此分类为 **progress / recoverable failure / unrecoverable failure**。论文自己划界：post-condition *"only determine when an individual primitive returns control to the planner; they are **not** used as substitutes for the final task success predicate."*（τ 是**停止**条件，不是**成功**条件——τ 可以是"预算耗尽"。）

### re-staging：重选交棒点，不是回退世界
失败后 *"reframes the invocation by changing the **approach pose, viewpoint, or local staging** before trying again."* 三个旋钮全是在调**交棒时刻的初始观测 `o₀`**。

> **正确理解**：冻结 VLA 是策略 `π(a|o)`，成功率是初始观测的函数 `p(success|o₀)`；planner 实际在做的是**在 `o₀` 上搜索**——把机器人送进 VLA 的**能力域**（论文语：learn the *operating range*；move the robot between *VLA-compatible local regions*），失败就换一个进入点再送一次。**不是 undo**（真机也做不到），是重新布置。"staging" 是戏剧术语：把演员摆到台上正确位置再开演。

### 两个记忆
- **Task Specific Memory**：程序性 JSONL trace（primitive 调用顺序）+ 语义 JSON 摘要（为何有效 / 要避免什么）。关键：trace 是**任务级解法骨架，不是开环轨迹**；**空间参数被当作 reference-scene binding，部署时必须重新接地**。
- **Global Memory**：任务无关的 **success rules + failure models**。例：*"夹爪闭合但物体没跟着末端动 → 判为空抓 → 重新定位并重新摆位再试"*、*"不要仅凭视觉接近就判定完成"*（原文称 **false visual success**）。
- **迭代式构建**：记忆在交互中写入而非事后；**refine 而非累积**（更短/更可靠的 trace 替换旧的，失败观测保留为约束）。

## Results
| Benchmark | 结果 |
|---|---|
| **LIBERO-Pro**（扰动版） | **+38.6pp** vs 最强相关基线 |
| **RoboCasa365**（厨房、移动底盘、铰接） | **+25.4pp** vs RLDX-1 |
| **RoboTwin C2R**（clean→randomized 双臂） | **58.4%** |
| 标准 LIBERO | 保持竞争力（不退化） |

**零训练成本**（不动 VLA 权重）。原语使用统计：RoboCasa365 中 `navigate_to`+`move_base` 占 19.4% 调用、`vla_act` 占 35.3%。完成归因：LIBERO-Pro 系任务**多由解析式原语触发最终完成谓词**（VLA 建立接触后由 transport/release/repositioning 收尾）。

## ⚠️ 仿真专属：真机部署时无法直接实现的技术点

**全部实验在仿真**（MuJoCo via Robosuite）。全文 "real robot / real-world" 仅 3 处命中，**全在引用他人工作**——**无自有真机实验**。以下逐条列出真机化时会失效或需要替换的机制：

| # | 论文里的机制 | 为何仿真专属 | 真机需要换成什么 |
|---|---|---|---|
| 1 | **benchmark completion predicate 作为成功判据** | 仿真器直接宣布成败；且 Global Memory 明写 *"Check the benchmark success signal"* ⇒ **oracle 进入了决策回路**，不只用于打分 | **学出来的成功/失败判别器**（VLM 成功判别 / 二值奖励分类器 / value function）— 见 [[Embodied failure detection]] 机制⑤ |
| 2 | **τ 可以取 "a benchmark predicate"** | **连 primitive 的终止条件都能挂在仿真 oracle 上** | τ 只能用**本体可测量**：夹爪宽度、力/力矩、位姿误差、跟随性、步数 |
| 3 | **重试近乎免费** | 重新摆位 + 重新调用在仿真里只花毫秒 | 真机有**时间（任务节拍）、磨损、反复接触损坏物体**的成本 ⇒ 重试次数本身成为要优化的量 |
| 4 | **回合自动复位** | benchmark 自带 reset | 需人工/脚本复位；**复位成本是与能力覆盖正交的第二维**（见 [[Real-robot evaluation]]） |
| 5 | **不可恢复失败只被标注** | 仿真里 unrecoverable = 本回合结束，无后果 | 真机上必须**前置预防**（安全脊髓 / 前置守卫），而非事后分类 |
| 6 | **无噪声的本体与深度观测** | 仿真 proprioception/RGB-D 干净 | 真机有传感器噪声、标定漂移、深度空洞 → 直接影响 grounding 与 τ 判定的可靠性 |

> **注意公平之处**：作者在**空间 oracle 上是克制的**——明确不给物体坐标（*"prevent any reliance on oracle-level environment access during decision making"*），强制从 RGB-D 自行定位。所以问题不在感知作弊，**恰恰在"谁告诉你成功了"**。

**结论（本库判断）**：这套编排逻辑（责任划分、re-staging、记忆）**在真机上大体可迁移**——它要求的是"机器人能退回来换个角度再试"（真机可以），不是"世界能 undo"（真机不行）。真正的真机化难点**不在 planner，而在把那个成功判据换掉**。

## Why it matters（对本库）

1. **Harness 概念的第一个量化证据.** 本库的 [[Harness design]] 此前完全建立在**两篇 Anthropic 工程博客**上（非同行评审、无对照实验）。这是库内**第一篇学术论文用 harness 这个词并给出可量化对照**（冻结权重 +38.6pp），把该概念从"厂商工程叙事"抬到有实证支撑。
2. **[[Alex Zhang - The Mismanaged Geniuses Hypothesis|MGH]] 在具身领域的强验证.** MGH 主张"前沿模型能力已够，是脆弱脚手架浪费了它"。这里用**完全冻结**的 π0.5 拿到 +38.6pp ⇒ 这些能力**本就在权重里**，之前只因把语义接地、长程组合、底层控制压给同一个策略而发挥不出来。本库的 Agentic 论点（泛化载体：模型 → 组合）此前主要靠推理，现在有了**同权重、纯软件、可量化的对照实验**。
3. **L3 任务环的一个具体实现**，且给"**能力画像**"提供了实证形态：不是数值向量，而是**成功规则 + 失败模型 + 任务解法骨架**。
4. **"计划级接口"的具体形态**：JSON 化 primitive 调用 + 空间参数部署时重新接地 + **(目标, 终止判据) 二元组**。
5. **扩库 vs 冻结库的张力及其化解.** 本库[[Cloud-edge co-evolving embodied agent - a continuous-evolution framework|技能工厂]]主张"能力缺口 → 催生新专家"（库要长大）；本文主张库小而固定。**化解**：它反对的是**部署时**扩库（原文 *without deployment-time primitive expansion*，因为部署时无验证能力），而技能工厂的扩库发生在**离线云端、过云④验证门**。⇒ 一条更强的规则：**扩库必须发生在有验证门的一侧；部署时只许"学会用现有的"。**

## What feels strong
- **问题定位准**：明说两个范式各自"把责任分配错了"——单体 VLA 要在一个策略里吸收语义接地+长程组合+底层控制；coding agent 要用手写 API 实现物理上精细的交互。
- **τ 这一招被低估**：一个参数把通用专家特化成多个局部专家，零权重改动。
- **记忆设计有真东西**：区分"结构可迁移 / 空间绑定不可迁移"，是具身记忆特有的问题（LLM 侧文本记忆通常整体可复用）。
- 刻意维持**部分可观测**（不给物体坐标），比多数仿真工作诚实。
- 三个 benchmark、三个不同的冻结 VLA backend——泛化性论证比单一 backend 强。

## What feels limited
- **无真机**（最大的一条，见上表）。
- **成功判据依赖仿真 oracle**，且它进入了决策回路而非仅用于打分。
- **不可恢复失败只分类不处理**。
- **前置条件缺席**：何时该调 `vla_act` 靠 Global Memory 的自然语言经验规则（软知识），不是可判定守卫。⚠️ 这是**设计选择而非遗漏**——按 [[Harness design]] 的 load-bearing 原则，若 planner 判断足够可靠，显式契约就不该加。
- **planner 是 LLM ⇒ 秒级**，全靠稀疏调用避开实时约束；节拍更紧的任务未验证。
- 代码/权重未见发布。

## Open questions（接本库）
- 把成功判据换成学出来的判别器后，**+38.6pp 还剩多少**？（判别器误差会直接吃掉重试收益）
- τ 只能用本体量之后，**语义级终止条件谁来判**？——这正是 [[Embodied failure detection]] 里"L2 端侧判别器填多速率栈频率鸿沟"的位置。
- Global Memory 的失败模型能否**跨机器人/跨场景共享**（→ 车队共智）？
- 重试次数的物理成本进入目标函数后，最优 re-staging 策略是否会变（从"多试几次"转向"一次投中"）？

## Related
- [[Harness design]] — 概念母页（本文是其在具身侧的首个量化实例）
- [[Embodied failure detection]] — 本文的失败检测机制在其设计空间中的位置
- [[Alex Zhang - The Mismanaged Geniuses Hypothesis]] — 被本文在具身侧验证的假设
- [[Physical Intelligence - pi0.5 a VLA with Open-World Generalization]] — 被包的冻结 VLA
- [[Huang et al. - ChemBot Long-Term Memory for VLA-based Agents]] — agent-as-planner + skill 库的先例
- [[Task Decomposition as OOD Mitigation]] · [[Task decomposition]] — 拆解内核
- [[Cloud-edge co-evolving embodied agent - a continuous-evolution framework]] — 能力画像 / 扩库与验证门
- [[Real-robot evaluation]] — 复位成本、成功判据可信度
- [[Future embodied Agent framework - integrated view]] — 整合入口
