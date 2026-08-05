# Task decomposition

Task decomposition is the process of breaking a larger problem into smaller subproblems that can be solved more reliably, more efficiently, or with better generalization than the original task considered as a single monolithic problem.

## Why it matters
In language-model systems, decomposition is often the bridge between strong local competence and weak long-horizon performance. A model may be capable on many short, in-distribution subtasks while still failing to solve an extended problem end-to-end. Decomposition can turn an apparently out-of-distribution task into a composition of in-distribution steps.

## In agent systems
Task decomposition appears in many forms:
- planner-executor pipelines
- orchestrator-subagent systems
- tree search over candidate steps
- recursive tool use
- code-generated workflows
- multi-stage memory retrieval and synthesis

## In embodied manipulation
任务拆解在具身操控中同样是一条重要路径。将复杂操控任务分解为子任务和约束，可以消解 OOD 问题——每个子任务/约束在分布内可解，整体组合覆盖复杂行为。

代表工作：
- **ReKep** (Huang et al., 2024) — 将操控任务表示为关键点约束序列（Python 函数），LLM 生成约束，优化器求解动作。与端到端 VLA 不同，ReKep 将「理解任务」和「执行动作」解耦，泛化性强、无需 task-specific 训练数据。

### ReKep 范式 vs VLA/WAM
- **ReKep 路线**：任务拆解 → 约束推理 → 优化求解，模块化、可解释、泛化强、zero-shot
- **VLA 路线**：端到端感知→动作，数据饥渴但上限可能更高
- **WAM 路线**（如 GigaWorld-Policy）：端到端世界模型，视频生成提供密集监督，靠数据覆盖泛化
- **能力层级拆解**（如 RL Tokens）：VLA frozen + 小网络 RL 专家，把精密操作变成小网络的 in-distribution 问题
- 目前无法定论哪条路线更有前景，但任务拆解路线在数据效率和泛化性上有明显优势
- 端到端路线内部（如 GigaWorld-Policy vs Motus）仍有大量效率优化空间

### 拆解维度的光谱
任务拆解不只有一种形式：
- **ReKep**：任务步骤拆解（高层 LLM → 底层优化器），接口 = 约束函数
- **RL Tokens**：能力层级拆解（通用 VLA → 精密 RL 专家），接口 = RL token
- **ChemBot**：Agent-as-Planner + VLA-as-Skill（高层 agent → 底层 Skill-VLA），接口 = 子任务指令
- **传统 hierarchical RL**：时间尺度拆解（macro-action → micro-action）
内核一致：把 OOD 问题分解为 in-distribution 的子问题

接口形式的光谱：约束函数（ReKep）←→ 紧凑 token（RL Tokens）←→ 自然语言子任务指令（ChemBot）

### 训练时拆解（课程生成）——另一条轴
上面全是**推理时**拆解（运行时把任务分给不同模块执行）。同一内核还有另一种用法：**在训练时**把任务拆开，用来构造**课程**，让 RL 学得动。

- **[[Heravi et al. - LEACL LLM-Enhanced Automatic Curriculum Learning for RL in Long-Horizon Manipulation|LEACL]]**（Heravi et al., UT Austin/Peter Stone, 2026）：LLM 把长程任务拆成 **PDDL 子任务规格**，再为每个子任务生成 **参数化任务空间 + 难度排序**，交给现成 ACL 算法**只用稀疏奖励**训练。接口 = **PDDL 规格 + 参数化难度**。
- 相邻：**CurricuLLM**（ICRA 2025）— LLM 出子任务序列后**生成 reward code**（LEACL 正是要绕开这一步）。
- **关键边界条件（LEACL 实测）**：**拆解 + 稀疏奖励 ≈ 0% 成功率**——拆解把长程变短程，但不自动让子任务**可学**；接触丰富的子任务即便 horizon 很短，稀疏奖励下仍学不动。即**拆解解决长度/信用分配，不解决探索**；段内还需课程。详见 [[Task Decomposition as OOD Mitigation]]。

#### 背景一：为什么训练时拆解要落到「符号规格」上
这条路线的拆解产物不是自然语言子任务，而是 **PDDL 规格**（Planning Domain Definition Language，1998 年经典 AI 规划语言）。它是**声明式的任务定义**，不是策略代码：

`τ = ⟨M, F, R, P, I, G⟩` —— `M` 可移动物体 / `F` 固定物 / `R` 区域 / `P` **谓词**（返回真假的布尔函数，如 `Open(drawer, 0.3)` = 抽屉拉开超过 0.3m）/ `I` 初始 literal / `G` 目标 literal 的**合取**。

**关键连接**：`I` 定义 RL 环境的 **reset 分布**，`G` 定义**成功判据** → 一份 PDDL 规格实质上就是**在定义一个 RL 环境**。

> **为什么非要符号层**（最容易忽略、但决定性的原因）：**稀疏奖励需要一个机器可判定的成功条件**。"抽屉开了"这句自然语言仿真器无法求值；`Open(drawer, 0.3)` 可以（查关节位移）。没有这层，就无法自动发奖励，整套稀疏奖励 RL 跑不起来。所以让 LLM 输出形式语言是**工程必需**，不是形式主义。代价：LLM 写形式语言易出语法错 → 需 reflection（语法校验 + 迭代修正）。

**"参数化任务空间 = 规格子集" 就是难度旋钮**：
1. **谓词参数化**（LIBERO+ 对原版 LIBERO 的改动）：`open(object)` → `open(object, ?o)`，多一个连续参数。
2. **LLM 写生成函数**：识别控制向量 `c`（如〔柜子初始 x, y, 目标开启距离〕），生成 Python 模板把 `c` 映射成具体规格。其**值域** `𝒯ᵢ ⊂ 𝒯` 就是**同一子任务的所有难度变体**——柜子紧贴夹爪 + 开 0.05m（易）↔ 柜子远 + 全关 + 开 0.4m（难）。ACL 就在这个子集里按水平从易往难采样。（"合法"= 排除工作空间外、超出行程等无效组合。）

#### 背景二：sparse / dense reward / ACL 的三方关系
- **稀疏奖励**：`R=1` 仅当状态进入目标集 `S_G`，否则 `0`，成功即终止。**与真实目标完全一致（无偏）**，但**探索会死**——长程高维下随机探索几乎不可能偶然成功 → 梯度恒为 0（LEACL 里纯稀疏基线 5 任务全 **0.0%**）。
- **dense reward（奖励塑形）**：人工设计的中间信号（如 `-‖夹爪−把手‖` + 接触 + 抬升高度）。每步有梯度，但**是人对"什么算进步"的猜测** → 三个坑：① 极敏感于设计细节（抬升奖励按**夹爪**高度还是**物体**高度，行为明显不同；对碗有效的对番茄酱瓶可能有害）② 权重难平衡（dense 过重 → 刷中间分、忽略真成功）③ **诱导 "sloppy" 行为**——持续取得增量进展，但精度不足以满足目标谓词的**合取**。实证：专家手工 dense reward 的 LEAGUE 在某任务 **0.0%**、方差 **±50.6**。

> **三方关系（理解这条路线的钥匙）**：稀疏奖励的问题是"没信号"；**dense reward 的解法 = 改造奖励函数来制造梯度（代价：引入偏置）**；**ACL 的解法 = 不动奖励，改造任务难度来制造成功（奖励保持无偏）**。学习信号来自**难度调度**而非**奖励塑形**，于是同时拿到 dense 的可学性 + sparse 的无偏性——这解释了 LEACL 一个反直觉的结果：**不但更省人力，成功率还更高**（胜专家 dense reward 4/5）。

## Design questions
Important design questions include:
- What decomposition language is available to the model?
- Can the model express loops, recursion, branching, and reusable abstractions?
- How are subtasks passed state and constraints?
- How is progress tracked across a task tree?
- How is credit assigned when the final outcome depends on many intermediate choices?

## Research significance
The Mismanaged Geniuses Hypothesis argues that progress may depend less on scaling a single model and more on improving and training decomposition itself. On this view, decomposition is not merely an engineering convenience; it is a first-class capability target.

## Related
- [[Agent orchestration]]
- [[Recursive Language Models]]
- [[AI coding agents]]
- [[Alex Zhang - The Mismanaged Geniuses Hypothesis]]
- [[Self-managing memory as an in-distribution control problem]]
- [[Meta-skills for memory orchestration]]
- [[Open questions in agent memory and decomposition]]
- [[Huang et al. - ReKep Spatiotemporal Reasoning Keypoint Constraints for Robotic Manipulation]]
- [[Spatial Intelligence for Embodied AI]]
- [[Physical Intelligence - RL Tokens Precise Manipulation with Efficient Online RL]]
- [[Huang et al. - ChemBot Long-Term Memory for VLA-based Agents]]
- [[Physical Intelligence - pi0.5 a VLA with Open-World Generalization]]
- [[Physical Intelligence - pi0.7 a Steerable Generalist Robotic Foundation Model]]
- [[Memory in Embodied AI]]
