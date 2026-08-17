# Harness development base — JiuwenSymbiosis selection and build plan

> **⚠️ 团队专属决策记录**（2026-08-17，与 Ethan 多轮讨论收口）。问题：开发四个具身 Agent 特性（**失败检测 / 失败后重试 / 记忆机制 / 持续学习**），选哪个开源仓当基座？候选：[[openJiuwen - JiuwenSymbiosis Physical AI Assistant Framework|JiuwenSymbiosis]]（华为）vs [[RLinf - RPent Recursive Physical Agent Framework|RPent]]（= Harness VLA 的代码仓）。两仓均已 clone 逐文件审计。

## 结论

**选 JiuwenSymbiosis。** 但推进次序要倒过来：**先接评测环境和成功信号，再写四个特性**；从 RPent 只搬三样设计，planner/guides/harness 策略一样不搬。

## 两仓对照（全部代码级核实）

| | **JiuwenSymbiosis** | **RPent** |
|---|---|---|
| 源码 / 测试 | 24.8k / **19.2k（124 文件）** | 12.6k / **0** |
| 许可 | **Apache-2.0** | **⚠️ 无 LICENSE 文件**（声明了但不存在；母项目 Apache-2.0，疑疏漏，值得开 issue） |
| 执行器 | LLM/VLM planner + IK 原语，无 VLA | **π0 VLA + 解析原语混合** |
| 硬件 | **Piper + SO-101 真机适配器** | 仅 LIBERO 仿真，零真机 |
| 评测 | **无 benchmark、无成功率数字** | LIBERO/RoboCasa365 + 已发表基线 |
| harness 行为住哪 | **代码**（六个 Rail 类） | **markdown + prompt**（Python 中 staging/postcondition/verif 命中 0） |
| planner | openjiuwen DeepAgent（96k 行自研 harness，12 个 model client 含昇腾，可本地） | **Claude Code / Codex SDK**（锁定两家 SaaS，断网即死） |
| 上游弹药 | `agent-memory` / `agent_evolving` / `rsi` 现成未接（规模已量、质量未验） | 无 |

## 根本原因（不是"接口现成所以方便"）

**① 机制 vs 嘱咐。** 四个特性必须是"机制"（确定执行、可单测、可量准确率、可开关消融），而 RPent 的 harness 行为由自然语言承载、LLM 解释执行——同样的"重试策略"在一边是 283 行 `RecoveryRail`，在另一边是 guide 里一句 *"After 2 failed retries…stop tuning numerics"*。**prompt 承载的特性连"这次有没有被执行"都不可观测**，无法进入 ESAS 的 paired evaluation。接口现成只是"行为放代码里"这一取向的外在征兆。（注意分界在框架内部也存在：JiuwenSymbiosis 的 SKILL.md『失败处理』章节也是嘱咐——设计功力在于**哪些行为值得从嘱咐晋升为机制**；四特性开发本质就是一场系统性晋升。）

**② 部署终局。** 就算在 RPent 上重写出 rails，它的底盘到不了目标：编码 agent SaaS 在运行时环（出不了仿真的结构原因）、无硬件层、无边缘路径。JiuwenSymbiosis 反向三样全有：真机适配器、模型无关（含本地 vLLM/昇腾）、fast 模式断网可活。

**③ 基线是配置，不是代码。** rails 逐个可开关（`enable_*` + `extra_rails`）⇒ **rails 全关 = 分层模型基线，逐个打开 = 消融**。RPent 消融要改 603 行 playbook，无法保证只动一个变量。曾考虑"把 Harness VLA 的分层模型搬进来当基线"——**不必**：按本库 [[Embodied simulation benchmark suite for systems optimization|ESAS]] 纪律，搬来的基线在自家 Policy Contract 下重跑本来就只是 paired reference、不可引用，所以该选最省力的参考配置，而 rails-off 就是。

## 迁移面备忘（若接 LIBERO）

阻抗差：JiuwenSymbiosis Driver = **绝对位姿+阻塞**、布尔夹爪、主动拉帧；LIBERO = **delta action 定频 step**、连续夹爪、step 返回 obs、原生 `chunk_step`。四个成本项：
1. **LIBERO Driver**（中等，主要是搬）：RPent `move_to`（1740 行 tools.py 内）已解决绝对位姿→OSC delta 收敛环；标定取自 `env_calibration.md`；两种手眼安装框架都已支持。
2. **成功信号**（代码最小、概念新增，**最优先**）：Env 协议里没有"任务成功"概念；LIBERO 白送 `term`/`rew` → 串进 Trace → 成为特性①的真值和特性④的 gate 指标。
3. **VLA 服务**（小）：照抄自家 detector sidecar 模式（spawn-or-attach、生命周期跟随 Session），连 RPent 都不用搬。
4. **planner 范式**（岔路口，已定）：**运行时不引第二个编码 agent**（重复 RPent 出不了仿真的错误）；演进通道用编码 agent（离线、可插拔——设计文档明写在线/离线"不共享执行路径"），先 Claude Code 跑通对标 ENPIRE，再评估换上游 `rsi`/`agent_evolving`。

## 推进次序（依赖关系决定，不可乱）

| # | 做什么 | 理由 |
|---|---|---|
| 1 | 最小 LIBERO Driver（只声明 cartesian+camera+parallel） | 先能跑 |
| 2 | **Env 级成功信号 + 串进 Trace** | ①的真值、④的 gate |
| 3 | VLA sidecar + `vla_act` 工具（朴素阻塞版起步） | 补最大能力缺口 |
| 4 | **冻结 baseline profile（rails 全关）跑数字** | 此后才有 paired reference |
| 5 | 特性① `DetectionRail` + `@robot_tool(postcondition=)` 契约 | 必须早于④ |
| 6 | 特性② RecoveryRail 升级阶梯（`ctx.request_retry()`） | 依赖①的裁决通道 |
| 7 | 特性③ `MemoryRail` + 接 `agent-memory` | 独立可并行 |
| 8 | 特性④ 撤人审门禁（target_skill 解析+自动应用+回滚+A/B） | **硬依赖①深度**（检测信号质量是闸门） |

从 RPent 只搬三样：**记忆两层设计 + "存过程不存坐标"铁律**（实现搬不了——预设编码 agent 文件系统）、`move_to` 的位姿控制逻辑、（可选）叠加图回传 planner 的验证 affordance。

## 四特性 → 落点

| 特性 | 动作 | 关键点 |
|---|---|---|
| ① 失败检测 | **加** `DetectionRail` | 与已有 DiagnosisRail 是**裁判 vs 解说员**：Diagnosis 的 `_is_failed` 三通道全是自报信号、自己零判断；DetectionRail 裁决"没自报的失败"（semantic/stalling/irreversible）。**接线技巧：裁决后直接翻 `success=False`，下游 Recovery/Diagnosis 一行不改**。fail-closed 是宪法（`is_grasp_confirmed` 先例：谓词异常按失败算）。后置条件属于适配器（只有它知道传感器能测什么） |
| ② 重试 | **改** `RecoveryRail` | 现只占恢复四格第一格；加阶梯：同参重试→换参→重 staging→上报。⚠️ 已知接缝：Recovery 只挂 `on_tool_exception`，听不到 after_tool_call 里的翻案——要么 Detection 裁决后抛，要么 Recovery 加监听 |
| ③ 记忆 | **加** `MemoryRail` | 读挂 `before_model_call`（照抄 Diagnosis 两阶段暂存），写挂 `after_invoke` 导出 recipe |
| ④ 持续学习 | **改** `trace_feedback/` | 签名归一化/聚类已完成 80%；缺 target_skill 解析、自动应用+回滚、gate 指标——全部等① |

fast 路径（小脑侧）另算：rail 体系在那边失效（无 ModelContext），检测靠算子内看门狗 + 后置条件确认——见 [[Harness granularity]]。

## π0.5 纯 VLA 架构实验（第二条执行器路线）

在同一基座上跑"π0.5 单模型 + harness"完全可行，且 π0.5 直接吃语言指令、可关掉 planner。唯一真问题是粒度（详见 [[Harness granularity]]）：episode 包成一个工具则 rail 对执行中失明 ⇒ 建 **`vla_until` 复合算子**（照 `track_grasp` 模式：内藏 chunk 循环 + chunk 级监控器 STAC/进展预算/安全边界，结构化返回 termination_reason + 监控统计），episode 级 harness（后置裁决/恢复/记忆/trace）原样走 rails。要新写的：`vla_until` 本体 + chunk 监控器（大几百行）；要认真设计的只有真机上的关节动作流 Driver 协议（仿真走 `chunk_step` 现成）。ESAS 的 π0.5 Policy Contract（flow steps / horizon / 每 chunk 执行步数）恰好就是 `vla_until` 的参数表——评测契约与执行代码第一次同源。

**回报：四特性变成执行器无关**，可跑 2×2 paired comparison——

| | 无 harness | 有 harness（同一套 rails） |
|---|---|---|
| planner + 原语 | 基线 A | A+rails |
| 纯 π0.5 | 基线 B | B+rails |

"harness 的价值是否依赖执行器范式"目前无任何已发表工作能答（Harness VLA 只有范式 A、[[Zeng et al. - HELM Harness-Enhanced Long-horizon Memory for VLA Manipulation|HELM]] 只有范式 B，协议互不相通）——这张表本身是一篇论文的骨架。这也是在自家屋檐下检验 HELM/[[Shin et al. - B2FF Failure Recovery for VLA Policies via Pre-Imagined Milestone Selection|B2FF]] 路线（B2FF 的 milestone 锚点恰落在 `vla_until` 失败后的恢复选项里）。

## 诚实标注

- 两仓均**未实际运行**；上游 openjiuwen 490k 行**规模已量、质量未验**——落地第一步应写最小样例验证 `create_deep_agent` + `agent-memory` 是否真能"接线而非造轮子"
- RPent 许可问题按用户指示忽略，但记录在案；若其补 LICENSE + 测试，对照结论中"工程质量"一栏需重估
- 深度绑定 openjiuwen = 押华为路线图（Claude Code SDK 合约窄得多）——已知代价，换部署自由度

## Related
- [[openJiuwen - JiuwenSymbiosis Physical AI Assistant Framework]] / [[RLinf - RPent Recursive Physical Agent Framework]] — 两份审计底稿
- [[Harness granularity]] — 本页 `vla_until` 设计背后的通用规律
- [[Embodied failure detection]] — DetectionRail 的概念基础；四段管线
- [[Cloud-edge co-evolving embodied agent - a continuous-evolution framework]] — 特性④的闸门条件（检测信号质量决定演进通道能否去人）
- [[Zhang et al. - Harness VLA Steering Frozen VLAs into Reliable Manipulation Primitives via Memory-Guided Agents]] — RPent 承载的论文
- [[Embodied simulation benchmark suite for systems optimization]] — baseline 不可引用性与 Policy Contract 的出处
- [[Future embodied Agent framework - integrated view]] — 四特性所属的框架蓝图

## tags
#synthesis #decision-record #embodied-ai #harness #agent-framework #jiuwensymbiosis #rpent #vla #build-plan
