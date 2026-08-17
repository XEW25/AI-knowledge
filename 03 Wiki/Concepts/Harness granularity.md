# Harness granularity（harness 挂载粒度）

## Purpose

一条从两个独立实例中提炼的设计规律：**harness 的挂载粒度必须等于执行器的决策粒度。** 粒度错配时，harness 不是弱一点，而是整段失明。2026-08 从 [[openJiuwen - JiuwenSymbiosis Physical AI Assistant Framework|JiuwenSymbiosis]] 代码审计 + π0.5 纯 VLA harness 设计讨论中收口。

## 命题

拦截式 harness（rail/hook/middleware）站在**执行单元的边界**上：单元开始前、结束后、异常时。这对"每步都回到决策者"的执行器是完备的；但**执行器内部若藏着一个不回边界的循环，边界拦截对循环内部整段失明**。

| 执行器 | 决策粒度 | 边界拦截够吗 |
|---|---|---|
| LLM planner + 原子动作 | 每步（秒级） | ✅ 工具边界 = 决策边界 |
| 伺服跟踪（`track_grasp`） | 每 tick（几十~百 Hz） | ❌ 整个伺服环是一个"步骤" |
| VLA 主执行（π0.5 类） | 每 chunk（~1s，chunk 内开环） | ❌ 整个 episode 若包成一个工具，rail 只在首尾各醒一次 |

## 解法：复合算子内藏监控（两个实例，一个待建）

**粒度细于边界的监控，住进执行单元内部**——"复合算子内藏循环 + 看门狗"模式：

1. **伺服环**（JiuwenSymbiosis 已实现）：`ServoController` 每 tick 闭环，内置四种终止原因 `reached` / `timeout`（**连续无进展**，刻意不是总时长）/ `target_lost` / `stopped`。rail 看不见 tick，但算子返回结构化的 `ServoResult.reason`。
2. **VLA chunk 循环**（[[RLinf - RPent Recursive Physical Agent Framework|RPent]] 的 `pi0_pick` 已有雏形；完整设计见[[Harness development base - JiuwenSymbiosis selection and build plan|选型页]]的 `vla_until`）：chunk 级监控器（时序一致性 STAC 类、进展预算、逐 chunk 安全边界）住在算子内。

## 内外两层的分工（不可互相替代）

| | 算子内监控（during） | 边界 rail（before/after） |
|---|---|---|
| 时机 | 执行中，每 tick/chunk | 算子返回后 |
| 证据基础 | **策略侧信号**：时序自一致性、动作熵、进展曲线 | **世界侧证据**：后置条件谓词、末帧核对 |
| 权限 | **可中止，无权定罪**（策略慌 ≠ 任务败，发散尖峰可能是可恢复的多模态切换） | **正式裁决**（世界到没到位是成败的定义），触发恢复/诊断管线 |
| 不可替代性 | ①止损（不烧完预算）②不可逆失败只能在 during 拦截（事后裁决定义上迟到）③**真机上是终止信号唯一来源**（仿真给 `term`，真机没有任何东西说"完成了"——Sentinel/FAIL-Detect 的立论前提） | 及时性为零但定义权威 |
| 接口 | —— | **算子的结构化返回值**（`ServoResult.reason` 先例：termination_reason + 监控统计） |

这恰好把 [[Embodied failure detection]] 的"机制 × 时机"矩阵填满：**before/after 归 rail，during 归算子内监控**；策略侧信号（FAIL-Detect/Sentinel/STAC 族）天然住内层，世界侧后置条件契约天然住边界。

## 两条纪律

1. **算子内监控只做"检测 + 带原因中止"，不做恢复。** 恢复策略（重试阶梯/重新 staging/叫醒 LLM）需要记忆与诊断上下文，是 episode 级决策——让算子保持笨，把烂摊子和证据一起交给 rail 栈。（`track_grasp` 先例：看门狗中止，善后在外面 runner 的 `_safe_retreat`。）
2. **粒度错配的另一个方向同样致命**：把编码 agent 这种重决策者放进 tick/chunk 级的环里（RPent 把 Claude Code 放进运行时循环 ⇒ 出不了仿真）。决策者的重量必须匹配它所在层的频率。

## 推论

- **同一特性在两层要有两种实现**：JiuwenSymbiosis 的 fast 路径无 ModelContext ⇒ rail 注入类机制（诊断、记忆注入）在小脑侧结构性失效——不是缺陷，是这条规律的体现。失败检测在慢路径是 DetectionRail，在快路径是算子内看门狗 + 后置条件确认。
- **能力档案参与决定执行计划的控制结构**：`visual_pick/SKILL.md` 按本体是否声明 servo 能力，把同一任务编译成不同闭环粒度的序列（有 `track_grasp` → 感知关键段并成伺服步骤；没有 → 纯原子 7 步）。粒度不是框架定死的，是编译期按能力档案选的。

## Related

- [[Embodied failure detection]] — 本页填其"机制 × 时机"矩阵的 during 列；四段管线分工（拦截/裁决/善后/转述）见该页
- [[Harness design]] — load-bearing 原则的粒度维度
- [[openJiuwen - JiuwenSymbiosis Physical AI Assistant Framework]] — 伺服环实例 + fast/agent 双路径
- [[RLinf - RPent Recursive Physical Agent Framework]] — `pi0_pick` 雏形 + 粒度错配反例（编码 agent 在运行时环）
- [[Harness development base - JiuwenSymbiosis selection and build plan]] — `vla_until` 完整设计与 2×2 实验
- [[Embodied Cerebellum Models]] — 多速率控制栈是本规律的硬件侧背景

## tags
#concept #harness #granularity #embodied-ai #failure-detection #runtime-monitoring #vla #servo
