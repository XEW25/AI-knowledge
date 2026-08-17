# openJiuwen — JiuwenSymbiosis: Physical AI Assistant Framework

## Metadata
- **Type**: source note（**代码仓库审计**，非论文）
- **主体**: openJiuwen 开源生态（**华为主导**：全部源文件版权头为 Huawei Technologies；生态旗舰 jiuwenswarm 2812 stars，本仓是其具身/Physical AI 成员）
- **URL**: https://github.com/openJiuwen-ai/jiuwensymbiosis
- **License**: **Apache-2.0**
- **规模**: 源码 24.8k 行 + **测试 19.2k 行（比 0.78，124 个文件）**；141 commits，创建 2026-06-12，持续活跃
- **Raw tier**: [[2026-08-17 - openJiuwen - JiuwenSymbiosis GitHub repository|clone 审计]]（逐文件阅读 + 关键词证据分布）
- **Verification status**: 架构 / rails 实现 / fast 路径 / 感知服务 / 模型接入面 / 上游 openjiuwen 规模 **代码级核实**（2026-08）；**未实际运行**，上游子系统质量未验证
- **Related**: [[Harness development base - JiuwenSymbiosis selection and build plan]], [[RLinf - RPent Recursive Physical Agent Framework]], [[Embodied failure detection]], [[Harness granularity]], [[Harness design]], [[Being-0 - a Humanoid Robotic Agent with VLMs and Modular Skills]]
- **Tags**: #embodied #agent-framework #harness #huawei #code-audit #rails #vendor

## Summary

**华为 openJiuwen 生态的具身 Agent 框架**：把一套"安全、可审计的 Agent 工作流"适配到不同机器人本体。自我定位很克制——README 尾注明写 *"This product serves solely as a workflow orchestration tool and does not embed any AI model capabilities."*

七层架构 **Agent → Rails → Tools → API → Env → Hardware**，运行时闭环 Perceive→Plan→Execute→Observe→Feedback。**无 VLA、无世界模型、无任何训练**：执行器是 LLM/VLM planner + 经典 IK 原语（`goto_xyzr`/`move_joint`/`open_gripper`），与 [[Being-0 - a Humanoid Robotic Agent with VLMs and Modular Skills|Being-0]] 同支，但底层原语是运动学控制而非技能库。

## 核心一：Rail 体系（行为放代码里的横切层）

Rail = 挂在 agent 生命周期 **13 个事件**上的拦截器类（上游 `openjiuwen.core.single_agent.rail.base`，934 行）：invoke×2、task/react-iteration×3、user-message/steering×2、model-call×3、**tool-call×3**（before/after/exception）。通信靠 `ctx`（强类型 inputs + 共享 `ctx.extra` dict）；改流向靠合法动词 `ctx.request_retry()` / `ctx.request_force_finish()`；priority 同时决定 init 与回调顺序。

| Rail | 默认 | 干什么（已读代码） |
|---|---|---|
| **SafetyRail** (326行) | ✅开 | `before_tool_call` 查 Z 地板/XY 边界/关节软限位，**抛 ValueError 否决**→转成 LLM 可见的 tool-exception 自纠。自述"防 LLM 幻觉的第二道廉价防线，不替代硬件急停" |
| **RecoveryRail** (283行) | ✅开 | `on_tool_exception` → best-effort 释放+回 home。**持物感知**（确认持物则不开爪，注释"绝不因 settle 超差丢件"；接触假阴风险下默认仍松爪）；`skip_recovery` 逃生口（预派发拒绝时盲目回 home 反而不安全）；home 失败不重试 home |
| **VisualFeedbackRail** (303行) | ✅开 | motion/grasp 工具后抓一帧注回上下文（**两阶段暂存**，避免非法消息序）。语义失败检测全靠它 + 一句 prompt |
| **SkillUseRail** | 关 | 来自上游 `openjiuwen.harness.rails`；启用 SKILL.md 工作流 + `RobotControlTool` |
| **TraceRail** | 关 | 结构化轨迹（工具/观测/Rail 事件/日志/帧）→ JSON → 自包含 HTML 回放 |
| **DiagnosisRail** (332行) | 关（需 tracing） | 失败后把「工具+错误+参数 / Recovery 结果+位姿 / ≤3 步因果链」注入下一轮；**`_is_failed` 三通道全是自报信号**（exception > success=False > entry.error），**自己不做任何新判断**；priority=5 最后跑 |

**⚠️ 默认配置下失败诊断回路是关的**（Trace 关 ⇒ Diagnosis 关）。

## 核心二：exec_mode 把"大脑/小脑"写成了开关

- **`agent`（默认）**：每步 LLM 规划 + 调工具。
- **`fast`**：`plan_skills` **一次** OpenAI 兼容调用把任务+技能清单编译成动作序列 → `run_sequence` 无 LLM 执行。runner **任务无关**（"pick/place 的含义全在 SKILL.md 里，加任务=加 SKILL.md"）。

fast 路径的三层闭环（LLM 只被移出最外层）：
1. **tick 级**：`ServoController`（读位姿→取最新目标→slew 限幅→非阻塞下发；终止原因 `reached`/`timeout`/`target_lost`/`stopped`；**timeout 是"连续无进展"而非总时长**——现成的停滞检测器）+ `StreamingFrameSource`（守护线程只留最新帧，控制环不等相机）。
2. **步骤级**：`bind` + **白名单 AST** 符号参数（`"obj.z + 30"`，只许数字/四则/取字段）；`track_detect`/`track_grasp` 复合算子内藏伺服环；**夹爪闭合有硬编码后置条件**——`is_grasp_confirmed`（适配器实现，**判据异常按失败算 = fail closed**）→ 不确认则 `open→home→重新 track→重抓`（`max_grasp_retries` 上限）。
3. **序列级**：❌ 无重规划——失败即 `_safe_retreat`（复现 RecoveryRail 持物逻辑）+ 中止上报。

**SKILL.md 的编译期改写规则**（`visual_pick`）：有 `track_grasp` → 检测+接近+下降合并为一个伺服步骤；只有 `track_detect` → 替换检测步；都没有 → 纯原子 7 步。⇒ **能力档案不只约束工具集合，还决定执行计划的控制结构**（同一任务在不同本体上闭环粒度不同）。

## 核心三：能力档案的实例级收窄

Capability 词表：`motion.cartesian/joint/servo`、`grasp.parallel/suction`、`vision.camera/depth/detection/eye_to_hand`、`sorting.command`、`speech.tts`。区分**类级**与**实例级**：SO-101 从 `camera_serial` 推导实例能力；**Driver 连上后报告无相机可再收窄**；配置了相机但启动失败则 **fail closed**（连接失败）。⇒ 能力档案必须能在运行时被下修，且只能收窄——[[Future embodied Agent framework - integrated view|框架页]]此前未写到的工程细节。

适配器契约是 `typing.Protocol`（结构化类型，7 个 driver 协议：Robot/Joint/Servo/Camera/Suction/Gripper/Vision），只实现声明的部分。真机适配器：**AgileX Piper**（6-DoF CAN，eye-in-hand RealSense）、**LeRobot SO-101**（5-DoF，eye-to-hand D405）+ MockArm。

## 其余组件（已核实）

- **感知**：GroundingDINO+SAM2 sidecar（`POST /segment {image_base64, text_prompt}` → masks+box+score）。选型理由明写 **license-clean**（两者均 Apache-2.0，对照 SAM3 的 Meta 自定义许可）+ 走 HF transformers 绕开自定义 CUDA 算子编译。**刻意不进程内**（与 vLLM/torch 冲突）；端口被占则附着外部实例。下游 `detect_and_centroid`（mask 质心+中值深度）→ 手眼投影 → `grasp_z`；**planner 只收数字，mask 不进上下文**。
- **模型接入**：`ModelSpec` 后端无关；上游 12 个 model client（含 **anthropic、deepseek、dashscope、siliconflow、openrouter、ascend_affinity 昇腾亲和**）；默认本地 vLLM + Qwen3-VL-32B。fast 路径为手写 OpenAI 兼容 HTTP。需 VLM 才能用视觉反馈。
- **Trace Feedback Loop**（`design/trace-feedback-loop.md`）：**在线**（DiagnosisRail，任务内自纠）/**离线**（`analyze_traces.py`：加载→提取→**签名归一化**（数字→`<num>`、运动参数按符号+数量级分桶、长文本 SHA-256）→聚类→`SkillPatchProposal`）**不共享执行路径**。产物刻意弱：确定性模板零 LLM、`target_skill` 恒为 `<unresolved>`、confidence 纯按次数（≥5/≥3）。**人审门禁是设计而非未完成**：*"Trace 只能说明'发生了什么'，无法证明某条工作流规则在所有机器人和场景下都安全，因此模块不自动写技能文件。"*
- **上游 openjiuwen agent-core**（另行 clone 审计）：**491k 行源码 + 397k 行测试**，Apache-2.0。`harness` 96k（**DeepAgent 就是 `openjiuwen.harness`**——本仓 import `create_deep_agent`/`SubAgentConfig`/`SkillUseRail`；subagents 含 code/browser/plan/research/**verification**）、`agent_evolving` 42k（agent_rl online+offline、trainer、experience）、`rsi` 41k（递归自改进）、`agent_teams` 71k。**独立仓库 `agent-memory`（48 stars，Apache-2.0）存在但本仓未引用**。⚠️ 规模已量、质量未验。

## 四特性核实结论（本库口径）

| 特性 | 结论 | 证据 |
|---|---|---|
| 失败检测 | **◐ 仅 L0** | 判据只有自报两通道；语义失败靠 VLM prompt；停滞/不可逆为空（`stall` 命中全在硬件层）。fast 路径的 grasp 确认是唯一硬编码后置条件 |
| 失败重试 | **✅ 完整但只占恢复四格第一格**（物理位姿） | RecoveryRail + `_retry_unconfirmed_grasp`；其余三格（世界/目标/策略）超出"LLM+IK"架构能力边界 |
| 记忆 | **❌ 零**（生态有 `agent-memory` 未接） | `memory` 7 处命中全为 in-memory/CUDA-OOM；向量库/embedding/持久化 0 |
| 持续学习 | **❌ 无训练**；有人审门禁的离线回路 | `continual`/`fine-tune`/`learn`/`checkpoint`/`reward` 全 0 |

## Why it matters（对本库）

1. **恢复能力上限由执行器范式决定**——四格恢复空间它只能做第一格，不是偷懒：另三格分别需要世界模型/visual-foresight VLA/在线学习，全超出"LLM+IK 原语"边界。补进 [[Embodied failure detection]] 四格表的一层含义。
2. **与 ENPIRE（arXiv:2606.19980）构成演进通道自动化的正反极点**：同一个 trace→分析→改进回路，ENPIRE 全自动（因为花一整个阶段合成+离线验证 reward、双相机防假阳），华为留人审（因为失败信号只有工具返回码）。⇒ **检测信号质量决定演进通道能否去人**（详见 [[Cloud-edge co-evolving embodied agent - a continuous-evolution framework|co-evolution 框架]]）。
3. **"机制 vs 嘱咐"分界的机制侧样本**：行为放代码（rails）而非 prompt——与 [[RLinf - RPent Recursive Physical Agent Framework|RPent]] 的对照是选型综合页的根本论据。
4. 诚实文档的范本：feature matrix 用 ✅/◐/◇ 区分"有实现/有条件/只有词表"，并声明 *"Support means that a code path and interface exist; it does not certify every robot"*；Mock 模式自曝只验管线不模拟成功。**符合本库"架构吻合 ≠ 已验证"纪律**。

## What feels strong
- 测试/源码比 0.78；rails 的消息序、fail-closed、持物三态等工程细节反复考究
- Rail 逐个可开关 + `extra_rails` 注入 ⇒ **基线是配置不是代码**（消融实验的理想形状）
- 部署自由度：模型无关（含本地/昇腾）、断网可活（fast 模式规划后无 LLM）

## What feels limited
- **全仓库没有任何 benchmark 与成功率数字** ⇒ 能力清单可信、性能未知；接评测环境应先于一切特性开发
- 默认关着诊断回路；fast 路径无 ModelContext ⇒ rail 注入类机制在小脑侧全部失效（结构性，见 [[Harness granularity]]）
- 上游 490k 行是未验证的依赖面；深度绑定 = 押华为路线图

## Related
- [[Harness development base - JiuwenSymbiosis selection and build plan]] — 基于本审计的选型决策与开发路线
- [[RLinf - RPent Recursive Physical Agent Framework]] — 对照仓（行为放 prompt 的那一侧）
- [[Harness granularity]] — 从它的 servo/track_grasp 模式提炼的通用原则
- [[Embodied failure detection]] — 四段管线分工的工业实例
- [[Memory in Embodied AI]] — `agent-memory` 未接线是"生态级记忆模块复用到具身"的待观察线索
