# 五个研究方向的三档仿真评测矩阵

> **定位**：主页 [[Embodied simulation benchmark suite for systems optimization]] 按"共同任务池 → ESAS → 判定标准 → 方向映射"组织，回答"每个 benchmark 是什么、怎么跑"；本页是它的**方向优先重排**，回答"做某个方向的人要测什么"。每个方向分三档：**一档保基础功能不破坏，二档在敏感（有判别力的）数据集上测小回退，三档在挑战数据集上做能力压力**。条目含开源 benchmark 与私有 ESAS 集，分别标注。运行参数、统计方法、治理规则一律以主页为准，本页不重复。
>
> 制定于 2026-09-01（v0.1），同日多轮评审后为 **v0.2**：移除开发常识条目、Plus-Sensitive 升推理优化二档、Atomic-Seen harness 配对入 Agent 二档、trace 重放双配置栈常驻、§9.1 R0 校准协议、评审修正（chunk 三元组、ψ 表述、R0 数据属性标签）。条目与主页 v0.7 对齐。扰动强度、门槛与部分任务名单尚未冻结（见 §9 与主页 §6）。

## 1. 分档原则

三档回答三个不同的问题，判据类型随之不同：

| 档 | 回答的问题 | 数据集特征 | 判据 | 频率 |
|---|---|---|---|---|
| **一档 · 基础保全** | 有没有明显破坏？ | 无模型在环的隔离筛查（R0 / trace 重放 / 探针）+ 饱和区基准（reference ≳90%） | **打回制**：崩溃、离线分歧 / 物理量超容差、成功率大幅下滑 | 每提交（离线筛查）～ 合入前（饱和全量） |
| **二档 · 敏感判别** | 有没有 1–3pp 级小回退？ | 判别区基准（reference ≈20%–80%）+ mild/medium 扰动，逐 episode 配对 | **Nam–Tango 配对非劣** + gatekeeping；顺序扩样 100→300→500 | 合入前自报（开源部分）+ 申请验收（ESAS 部分） |
| **三档 · 挑战压力** | 能力边界有没有崩塌，或被推进？ | 地板区（<20%）、hard 扰动、多轴组合、非确定长程 | 不设非劣门槛；单独报告趋势与崩塌检查 | 发布级 / 里程碑 |

四条补充：

- **一档只收录需要专门设计或校准的筛查**——R0 配对分歧（阈值要校准，§9.1）、组件探针（要构建）、trace 重放（要定容差）、确定性检查（要定容差级别）、饱和区全量基准（要冻结协议）。开发时自然而然会做的小冒烟（PR smoke、框架单测、随手跑几个任务）**不入档**：文档记录的是约定，不是开发常识。
- **成绩区间是启发式，功能优先**。ESAS-LIBERO Canonical-Heldout 处于高分区（LIBERO 任务 ~97%），但它是纯计算路径的配对验收主集，归二档——稀疏不一致对用 exact / Bayesian 检验兜底（主页 §4），判别功效缺口由处于 ~40% 区间的 Precision-Core 补足。
- **档位与流水线站位正交**。档位说"测什么"（数据集的难度与敏感度），站位（主页 §5 端到端流水线）说"何时跑、谁跑、判多严"。Sealed Final Holdout 的内容就是二档 Gate 集，只是以发布级频率运行。**反向同理**：开发团队日常高频跑二/三档内容的小样本作趋势观察完全合理（如 Agent 方向盯 PRO Position、RoboCasa Composite 的能力进展），但这不使它们升入一档——一档准入只看"能否统计可靠地回答有没有明显破坏"：饱和区上崩塌信号大、小 n 即可见；地板区上（Position 0.08–0.38、Composite 7.1/1.2）退化与噪声在小样本下不可分，打回判据无从成立。地板集的正路是升档迁移：抬进判别区后按既定触发条件转入二档（如 Composite → ESAS 验收集实例化，主页 §3.4）。
- **一档不依赖 ESAS 隐藏集**（开源基准 + 团队自有 logged 数据 + 自建探针，对开发团队完全透明）——私有集不做冒烟，高频接触 ESAS 违反治理（提交频率限制、防反馈拟合）；**二档开源与私有并行**，开源自报供开发迭代，私有 ESAS 是验收权威；**三档以开源为主**，ESAS Compound 只作终检。

## 2. 总览矩阵

| 方向 | 一档 · 基础保全 | 二档 · 敏感判别 | 三档 · 挑战压力 |
|---|---|---|---|
| 推理优化 | R0 动作分歧 + LIBERO-40 | RoboCasa Atomic-Seen、Plus-Sensitive（校准后）、RoboTwin 全量（涉双臂时）；**ESAS**: Canonical-Heldout + Precision-Core（+ RoboTwin Canonical/Control） | RoboCasa Composite、Plus 地板子维；**ESAS**: Compound |
| Agent 框架 | LIBERO-10 + EAI 符号诊断 + PRO Object/Semantic | PRO Environment / 校准 Position、Atomic-Seen（harness-on/off）；**ESAS**: Grounding + Task-Generalization | PRO Task、RoboCasa Composite、BEHAVIOR Core-20 / Full-100；**ESAS**: composite 验收集（待实例化） |
| RL 框架 | R0 数据管道回归 + 确定性检查 | 固定 policy × 新旧框架 × 公开 Canonical 双向等价；**ESAS**: Canonical profiles 复测 | 高并行 / 长程等价抽查（Composite、RoboTwin randomized、BEHAVIOR 统计等价） |
| 物理引擎（MuJoCo） | MuJoCo 组件探针（待建）+ trace 重放筛查（双配置栈）+ LIBERO-40 | RoboCasa Atomic 三层（trace/oracle/闭环）；**ESAS**: Physics-Core + Precision-Core | Composite 长程闭环、数值稳定性压力、RoboTwin 跨引擎参照 |
| 渲染 / 3DGS | 图像层指标 + R0 真实 vs 重渲染分歧 + LIBERO-40 | LIBERO-Plus 全量 ×1；**ESAS**: OR-Single-Gate + RoboTwin Visual | OR hard / OR-Compound（私有）、RoboTwin randomized Hard、R2 real2sim 环路（真机层） |

## 3. 方向一：模型推理优化（量化 / token 压缩 / flow 降步 / 算子编译）

被测变量：只改声明的计算实现，任务、模型与闭环协议不变（主页 §2.7 单一声明变量；改 horizon / 执行步数属 scheduling 独立实验，走 ESAS-RoboTwin Control 的敏感度曲线验收）。

**一档 · 基础保全（打回制）**

- 【自有数据 · 离线】**R0 动作分歧筛查**（真机文档 R0/R1/R2 三层中的离线层）：团队自录 logged 真实观测上 reference vs candidate 后端配对推理，分歧超容差即打回；不进仿真，成本最低（协议见 [[Real-robot eval bench - task suite design and setup checklist]]）。
- 【开源】**LIBERO 原始四套件 40×50**（10/10/5）：饱和区（官方 π0.5 均值 96.85），证明"没有破坏 π0.5-LIBERO 能力"，有官方基线可对表。

**二档 · 敏感判别（配对非劣）**

- 【开源】**RoboCasa Public-50 Atomic-Seen 18×50**（10/50/5）：39.6% 判别区，合入前自报。
- 【开源 · 条件必跑】**RoboTwin 2.0 全量 clean + randomized**：涉双臂 / 接触的优化必跑；70.7 / 46.0 均在判别区（官方 cotrain 数字；不同训练 recipe 差近 30 点，团队 recipe 重建 reference 后须复核仍在判别区，主页 §2.4）。注意 10/50/50 整 chunk 开环协议——对推理延迟最宽容、对 chunk 内数值误差最敏感。
- 【开源 · 校准后】**LIBERO-Plus 判别子集（Plus-Sensitive）**：从 10,030 实例中按团队 reference 逐子维成功率选出 20%–80% 判别区的子维度（官方榜无 π0.5，名单须待 reference 跑分后冻结；与渲染方向共用同一份跑分）。入档理由：量化误差与输入分布相关——PTQ 的敏感度分析与 rotation 校准都在校准集分布上离线完成（见 [[VLA quantization]]），观测偏移把 activation 推到校准集外，clean Canonical 测不到这个失效面；且固定实例 ×1 天然逐实例配对，判别子维池化后功效可支撑 2pp 级判定，池化规模 ≳3.7k 对时达 1pp（主页 §4 公式）。
- 【私有】**ESAS-LIBERO Canonical-Heldout**：任务 / 指令 / 谓词 / 配置全部不变，仅隐藏初始状态与 seed，逐 episode 配对；纯计算路径主验收。
- 【私有】**ESAS-RoboCasa Precision-Core**：全库 65 个 atomic（均有演示、均在 Human300 内，已代码核实）校准后选 20%–80% 任务，任务名单 + 实例双层隐藏；检测 1–3pp 回退的主力（非饱和区里同等系统损伤表现为更多成败翻转即更大效应量，故更易检出——不是因为不一致率 ψ 高：配对方差 ≈ ψ/n，ψ 高反而增大所需 n）。
- 【私有】**ESAS-RoboTwin Canonical + Control**：Control 先扫延迟—精度敏感度曲线，再把各后端实测延迟映射到曲线定工作点——同步协议下延迟免费，量化 / 异步调度的时序收益与风险只有这里能看见。

主要观察量：paired delta、`success→failure` 翻转计数、长程任务退化、轨迹漂移、碰撞率。

**三档 · 挑战压力（单独报告）**

- 【开源】**RoboCasa Composite Seen / Unseen**：7.1 / 1.2 地板区，只查崩塌，不设门槛。
- 【开源】**LIBERO-Plus 地板子维**：reference 成功率 <20% 的子维（预计大偏角相机、重档 sensor noise），只查崩塌。与二档 Plus-Sensitive 共用同一份 reference 逐子维跑分，按判别区边界切分归档。注意 **Plus 官方无 "Hard" 子集**——10,030 实例是 7 维 21 子维的平铺结构；唯一难度概念 L1–L5 是按四个旧模型（不含 π0.5）成败事后分层的经验标签，不由扰动幅度决定，至多作粗筛候选。
- 【私有】**ESAS Compound**（LIBERO / RoboTwin）：仅终检组合，不用于归因。

## 4. 方向二：具身 Agent 框架

被测变量：规划、重规划、失败恢复、记忆等 harness 层；底层 policy 固定或作为声明变量。

**一档 · 基础保全（打回制）**

- 【开源】**LIBERO-10 全量**（92.4，饱和偏高）：多阶段长程能力保全。
- 【开源】**LIBERO-PRO Object / Semantic 轴**（π0.5 0.92–0.98，近饱和）："grounding 没被破坏"的保全项。
- 【开源】**EAI 符号层诊断**（Embodied Agent Interface）：复用 BEHAVIOR 任务定义，纯符号层（BDDL 谓词进出、程序化校验，不跑仿真）测大脑四模块——目标解释 / 子目标分解 / 动作排序 / 状态转移建模；成本极低，可每日跑。与 BEHAVIOR 闭环两级归因：符号层错 → 大脑问题，符号层对而闭环败 → 执行层问题。注意它假设感知与执行完美，分数高不代表闭环能成，只用于打回与归因。

**二档 · 敏感判别（配对非劣）**

- 【开源】**LIBERO-PRO Environment**（0.46–0.73）+ **校准后的 Position 子集**（0.08–0.38，需先筛掉地板项）：反记忆与在线 grounding 的判别区。
- 【开源】**RoboCasa Atomic-Seen 18×50（harness-on/off 配对）**：对每次调用都包 staging / 后置校验 / 失败重试与记忆的 harness（[[Harness granularity]]：挂载粒度 = 执行器决策粒度），一个 atomic 任务恰是一个完整 harness 周期（stage → invoke → verify → recover），且无长程复合干扰——单周期 harness 质量的最干净信号；39.6% 判别区，抬升与回退空间都够。配对方式：同实例三态——rails-off 裸 VLA（基线是配置不是代码，见 [[Harness development base - JiuwenSymbiosis selection and build plan]]）/ harness 旧版 / harness 新版。观察量：端到端成功、重试次数、**每成功一次的调用数与时间开销**（防止用重试买成功率不计成本）、恢复成功率。协议注意：①horizon 冻结在官方 1.5×，staging 与重试消耗的步数属被测成本；②失败记忆若跨 episode 持久，破坏 episode 独立性——须声明并冻结重放顺序，默认评测态为 per-episode 记忆复位，跨 episode 记忆另设声明 suite。
- 【私有】**ESAS-LIBERO Grounding**：Language-Semantic / Object-Attribute / Referent-Binding 三轴 + 诊断量（`correct_target_contact_rate`、`wrong_object_contact_rate`、`empty_grasp_rate`、`instruction_sensitivity`）。
- 【私有】**ESAS-LIBERO Task-Generalization**：Position / Environment 校准档 + Task T1（目标重映射）/ T2（目标状态变化）。

主要观察量：predicate progress（仅 LIBERO 侧可插桩，RoboCasa 严格二元，见主页 §4）、端到端成功、恢复次数、规划开销、`wrong_target_rate`。

**三档 · 挑战压力（单独报告）**

- 【开源】**LIBERO-PRO Task 轴**（0.00–0.01）与 T3 子任务重组：能力压力。
- 【开源】**RoboCasa365 Composite Seen / Unseen**：地板区——该方向的核心产出目标就是把它抬进判别区；抬出后触发 ESAS composite 验收集实例化（主页 §3.4）。
- 【开源】**BEHAVIOR-Core-20**（发布级，Core-20 × 10 实例 = 200 episodes ≈ 单机 4–5 天）；**Full-100** 仅重大发布。仿真非确定、不可配对，退化为统计比较。
- 【私有 · 待实例化】**ESAS composite 验收 profile**：从全库 300 个 composite 任务校准选取（252 个有演示数据、48 个仅环境无演示——后者对开发团队零训练暴露，优先作 held-out 候选），任务 + 实例双层隐藏。

## 5. 方向三：仿真与真机 RL 框架

判据与其他方向不同：框架改动不应改变任务语义，验收是**双向统计等价**（equivalence，两侧非劣），不是单向非劣。

**一档 · 基础保全（打回制）**

- 【自有数据】**R0 数据管道回归**：logged 数据重处理一致性（框架改动前后同一批数据产出相同训练样本）。
- 【开源】**确定性检查**：同 seed 同轨迹（bit 级或声明容差级）、吞吐不回退。

**二档 · 敏感判别（等价性）**

- 【开源】**固定同一 policy × 新旧框架 × LIBERO-40 + RoboCasa Atomic Canonical** 配对回归：轨迹与成功率统计等价。
- 【私有】**ESAS Canonical profiles 复测**：Canonical-Heldout / RoboTwin Canonical / Precision-Core，同一隐藏实例上验证框架改动前后等价。

主要观察量：同 seed 轨迹一致性、成功率等价 CI、确定性、吞吐。

**三档 · 挑战压力（单独报告）**

- 【开源】高并行 / 长程边界抽查：RoboCasa Composite、RoboTwin randomized（大规模并行 reset 与数据管线边界）、BEHAVIOR 多 rollout 统计等价（发布级，非确定环境；仅当框架接入 OmniGibson / Isaac 栈时适用，否则不列）。

注：训练侧收敛性验证与真机侧不在仿真层范围（主页 §5，真机见 [[Real-robot evaluation]]）。

## 6. 方向四：物理引擎加速（MuJoCo）

主承载必须与被改引擎同栈（RoboCasa / LIBERO 均为 robosuite/MuJoCo）；SAPIEN 系测不到 MuJoCo 改动。

**一档 · 基础保全（打回制）**

- 【自建 · 待建】**MuJoCo 组件物理探针**：摩擦滑移 / 堆叠 / 插入 / 铰接 / 闭链（主页 §6 问题 9），打回制。
- 【开源】**trace 重放筛查（RoboCasa + LIBERO 双配置栈）**：少量固定 action trace 开环重放，状态 / 接触误差超出自重放校准的容差即打回。RoboCasa trace 管机制覆盖（fixture / 堆叠 / 铰接），LIBERO trace 管第二套 solver / integrator / timestep / controller 配置指纹（"同一引擎名 ≠ 同一物理栈"）——重放不跑模型、纯仿真步进，双栈常驻的边际成本可忽略，换来"只在某一配置路径出问题"在提交时即被发现。LIBERO trace 按接触 / 铰接密度选任务（抽屉、灶台旋钮、微波炉门类；自由空间轨迹对引擎差异不敏感，不选），同一批 trace 兼任 LIBERO-40 闭环回退时的归因工具。
- 【开源】**LIBERO-40 闭环**：同 MuJoCo 栈的饱和保全。

**二档 · 敏感判别（配对非劣）**

- 【开源】**RoboCasa Atomic-Seen 三层**：①固定 action trace 重放（隔离引擎）②scripted/oracle controller（排除视觉与推理）③π0.5 闭环（最终系统影响）。
- 【私有】**ESAS-RoboCasa Physics-Core**：同一批隐藏任务上固定三种执行方式。
- 【私有】**ESAS-RoboCasa Precision-Core**：闭环小回退检测。

主要观察量：状态轨迹 / 接触 / 穿透 / 约束误差、非预期接触率（需先冻结白名单定义）、发散率（qpos/qacc NaN、mjWARN 计数）、任务成功 paired delta。

**三档 · 挑战压力（单独报告）**

- 【开源】**RoboCasa Composite 闭环**：长程误差累积，地板区只查崩塌。
- 【自建】**数值稳定性压力**：极端 timestep / solver / contact 配置下的发散率（ESAS 统一 runner 统计，发散 episode 处理规则预先冻结）。
- 【开源 · 参照】**RoboTwin**：SAPIEN 栈，只作跨引擎行为参照、防单引擎生态过拟合，不进验收。

## 7. 方向五：渲染引擎加速（软件光追 / 3DGS）

关键区分两种配对（主页 §5）："同一新场景比较两个模型后端" vs "同一物理状态经 reference/candidate renderer 输出"——只有后者能把差异归因于 renderer。

**一档 · 基础保全（打回制）**

- 【自建 · 引擎层】**图像层 microbenchmark**（像素误差 / PSNR 等）：只作打回筛查，**不能作为精度结论**。
- 【自有数据 · 离线】**R0 动作分歧**：真实图像 vs 重渲染图像的配对推理分歧。
- 【开源】**LIBERO-40 闭环**：渲染路径端到端连通 + 饱和保全。

**二档 · 敏感判别（配对非劣）**

- 【开源】**LIBERO-Plus 全量 10,030 实例 × 1**：观测轴敏感集（Camera / Light / Background / Noise / Layout 五轴归因渲染；Robot / Language 两轴同跑但不归因渲染，仅作对照），合入前自报。
- 【私有】**ESAS-LIBERO Observation-Robustness OR-Single-Gate**：6 轴 × mild/medium × ≥3 seed，**renderer 双配对**——同一 manifest、同一物理状态、同一 environment/noise seed 经两个 renderer。
- 【私有】**ESAS-RoboTwin Visual**：固定场景 paired renderer。

主要观察量：任务成功 paired delta + 感知导致的动作分歧；不能只报 PSNR。

**三档 · 挑战压力（单独报告）**

- 【私有】**OR-Subdimension hard 档 + OR-Compound-Stress**：多轴组合的扰动交互显著（Plus Appendix F），不能用单轴相乘外推。
- 【开源】**RoboTwin randomized Hard**。
- 【真机层 · 发布级】**R2 3DGS real2sim 三臂环路**：见 [[Real-robot eval bench - task suite design and setup checklist]]。

## 8. 与主页挡位的对应

主页的 Gate / Diagnostic / Stress 是 ESAS 内部挡位；本页三档覆盖开源 + 私有全景，对应关系：

- **一档** ≈ 流水线站①（开发自检，打回制）+ 饱和区公开基准（主页归"公开回归"站②，本页按判别功能归入一档）。
- **二档** ≈ Gate + mild/medium 强度的 Diagnostic。
- **三档** ≈ Stress + hard 档 Diagnostic + Compound。

规则不变、以主页为准：逐 episode 配对协议与随机性控制（§2.7、§4）、配置指纹（附录 A.3）、`flow_steps / predicted / executed` 三元组必须写全、ESAS 治理（提交频率、聚合反馈、实例轮换、Sealed Holdout）。

## 9. 待冻结项（继承主页 §6）

1. 二档判别区的强度校准：Plus/OR 的 mild–medium 范围、Plus-Sensitive 子维名单（推理优化二档，与渲染共用 π0.5-Plus reference 跑分）、PRO Position 子集筛选、Precision-Core 任务名单——全部依赖 reference 重跑（评估团队第一动作：冻结 manifest 上测方差与自翻转率，此前门槛均为占位符）。
2. 一档打回阈值：**R0 分歧容差的校准协议已定（见 §9.1），待执行出数**；trace 重放容差待定（按 RoboCasa / LIBERO 两套配置栈分别做自重放校准，方法同 §9.1 的噪声地板 / 良性带）；确定性检查容差待定。
3. MuJoCo 组件探针集的具体构成——硬需求之一：覆盖 LIBERO 与 RoboCasa 两套 solver / integrator / timestep / controller 配置指纹，系统性回答"引擎改动是否只在某一配置路径出问题"（端到端 suite 不再为此加常驻布点）。
4. Agent 方向 composite 验收集的实例化触发条件（成功率区间、稳定性要求）。

### 9.1 R0 打回阈值的校准协议（三条参照带 + 安全门绝对阈值，2026-09-01 定稿、待执行）

结论先行：**打回阈值不是拍出来的绝对数，而是用三条参照带夹出来的相对数**。文献没有公认阈值可借——QVLA / DyQ-VLA / QuantVLA / Ω-QVLA 四篇 VLA 量化工作全部只报任务成功率，Action-MSE 仅作通道敏感度的排序信号（见 [[VLA quantization]]）；且分歧→成功率的映射受闭环误差复合（`Δx_t ≈ J_T Δx_{t-1} + J_T(J_π·e)`）与任务相位（自由空间宽容、接触相位放大）调制，本质非线性，绝对数在换模型、换任务分布、换 logged 数据批次后即失效。

三条参照带（全部离线 GPU 作业，可与主页 §4 的 reference 方差测量并入同一校准 sprint）：

| 参照带 | 怎么获得 | 含义 |
|---|---|---|
| **噪声地板** | reference vs 自身：同输入、固定权重、不同 flow noise seed；外加 GPU 非确定性 | 低于此的分歧无意义；固定 seed 后 BF16 对自身应接近 bit 级一致（兼作 R0 管线正确性检验） |
| **良性差异带** | 已被闭环验证等价的实现变体互比：FP32↔BF16、不同卡型、编译后端/kernel fusion 开关 | 定义"可接受的实现差异"的量级 |
| **坏版本带** | 故意做坏的版本：无校准 naive W4A4、flow steps 砍到 2、喂错图像翻转约定（主页 §2.3 实际踩过的坑） | 定义"肯定坏"的量级，并检验 R0 的判别力 |

规则：

- **阈值落点**：良性差异带上界（逐维归一化后的 P95/max）的若干倍，落在良性带与坏版本带之间；具体倍数在两条带实测拉开后再定。
- **判别力检验内建**：若某个坏版本的 R0 分歧与良性带重叠，说明 R0 对该类故障不敏感——这本身是必须记录的结论，该故障类型的拦截职责后移到闭环层。
- **统计形态看尾部**：量化使动作分布尾变胖（主页 §4 事件指标的观察），打回准则同时挂逐维归一化 MSE 的 P95 / P99 / max，不得只看均值；动作各维（EEF 位移 / 轴角 / gripper）量纲不同，必须在 norm stats 归一化空间逐维比较。
- **安全门绝对阈值是唯一例外，不需要校准、可立即冻结**：R0 兼任真机首跑安全门的部分用有物理依据的绝对数——动作超出本体关节速度 / 加速度 / 力矩限值，或超出训练数据动作分布 P99.9（分别从本体规格书与 checkpoint norm stats 直接读出）即打回。
- **语义边界不变**：阈值只用于打回（分歧异常大 = 肯定坏）；"分歧小 = 没问题"不成立——单步小误差可被闭环重规划纠正、也可能逐步复合，通过性验收仍在闭环层（ESAS / R1）。

## Related

- [[Embodied simulation benchmark suite for systems optimization]] — 主页：任务池细节、ESAS 构建、统计栈与治理
- [[Real-robot eval bench - task suite design and setup checklist]] — 真机侧 R0/R1/R2 协议
- [[Real-robot evaluation]] — 真机评测概念层判据
- [[VLA quantization]] — 推理优化方向的误差来源
- [[Embodied failure detection]] — Agent 方向的失败检测与恢复

#embodied-ai #simulation #benchmark #evaluation #systems
