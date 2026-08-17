# RLinf — RPent: Recursive Physical Agent Framework

## Metadata
- **Type**: source note（**代码仓库审计**，非论文）——与 [[Zhang et al. - Harness VLA Steering Frozen VLAs into Reliable Manipulation Primitives via Memory-Guided Agents|Harness VLA 论文笔记]]构成"论文 vs 实现"对位
- **主体**: RLinf 组织（母项目 RLinf/RLinf：RL 基础设施，4527 stars，Apache-2.0）
- **URL**: https://github.com/RLinf/RPent
- **License**: **⚠️ 无 LICENSE 文件**（pyproject 声明 `license = {file = "LICENSE"}` 但文件不存在；按现状未授予任何许可，二次开发有法律风险。疑为疏漏——值得开 issue）
- **规模**: 源码 12.6k 行（59 .py）；279 stars；创建 2026-07-07；自标 **Pre-Alpha**；**无 tests 目录**
- **Raw tier**: [[2026-08-17 - RLinf - RPent GitHub repository|clone 审计]]
- **Verification status**: 与论文的关系 / 结构 / 记忆设计 / 关键词证据分布 **代码级核实**（2026-08）；未实际运行
- **Related**: [[Zhang et al. - Harness VLA Steering Frozen VLAs into Reliable Manipulation Primitives via Memory-Guided Agents]], [[openJiuwen - JiuwenSymbiosis Physical AI Assistant Framework]], [[Harness development base - JiuwenSymbiosis selection and build plan]], [[Memory in Embodied AI]]
- **Tags**: #embodied #agent-framework #harness #code-audit #harness-vla #coding-agent #libero

## Summary

**RPent 就是 Harness VLA 的代码仓**——这是本次审计最重要的发现。项目页 harnessvla.github.io 的 Code 按钮虽标 "coming soon"，但页面唯一 GitHub 链接指向 RLinf/RPent，README 明写 *"Our first RPent publication, [Harness VLA]…"*，引用条目 `zhang2026harnessvla`。**RPent 是框架，Harness VLA 是它的第一篇论文。**

自我定位（README）：*"an open framework for building embodied agents that continuously evolve through recursive interaction with the physical world… harnesses heterogeneous intelligence — perception, reasoning, memory, execution, and self-evolution."* 三原则：service-oriented / standardized / composable。

## 结构性发现一：harness 行为在 markdown，不在代码

关键词证据分布（Python 源码 vs 文档/prompt）：

| 关键词 | Python | guides/docs |
|---|---|---|
| `staging` / `precondition` / `postcondition` / `verif` | **全部 0** | staging 3 |
| `recover` | **1** | **25** |
| `retry` | 2 | 10 |
| `memory` | 17（多为管道） | **52** |
| `evolv` / `reflect` / `train` | **0** | 5 / 7（仅宣传文案） |

真正的 harness 策略在 `robots/libero/guides/strict_hybrid_guide.md`（603 行）+ `pro_hybrid_guide.md`（504 行）+ `prompts/system.py`（501 行），由 planner（编码 agent）读取解释执行。Python 侧是管道：planner 驱动（`planner/claude_code.py`、`codex.py`、`http_mcp_server.py`）、env RPC、VLA/SAM3 服务、dashboard。

⇒ **行为由自然语言承载、LLM 解释执行**。对论文目的（展示 frontier coding agent + 一小筐原语能自己发现多少策略）是优点——零代码迭代；对做系统是致命的——无法保证执行、无法单测、无法干净消融（改 prompt 无法保证只动一个变量）。这是"机制 vs 嘱咐"分界的嘱咐侧样本（见[[Harness development base - JiuwenSymbiosis selection and build plan|选型页]]）。

## 结构性发现二：planner = 编码 agent 产品，锁定两家 SaaS

依赖里明写 `claude-agent-sdk>=0.1.60`、`openai-codex>=0.1.0b3`、`pydantic-ai-slim[anthropic,openai]`。planner 每轮要读 600 行 guide、grep 记忆目录、访问文件系统、联网。**环境仅 LIBERO，零真机**（`hardware`/`real robot` 命中 0）——一个自称 "Agentic Infrastructure for the Physical World" 的框架只跑仿真，正是"编码 agent 在运行时环里"这一结构约束的体现（延迟/成本/断网即死）。

## 值得搬走的三样（好设计）

**1. 记忆两层 + "存过程不存坐标"（全仓最好的想法）**
- **任务内参考**：成功探索后 planner 写 audit JSON（`strategy_notes`、定性目标区域），runner 导出 `recipe_*.jsonl`（**只含原语命令序列**，不含文件读取/感知调用；`write_recipe_from_states`）
- **跨任务经验**：`resources/<env>/memory/` 下 markdown 笔记，**MEMORY.md 索引**（操作技巧、参数范围、常见失败模式）
- 铁律：*"The planner follows the step order and strategy from these references but **must re-perceive and recompute coordinates from the current scene — never replay historical xyz values**."* ⇒ 记忆能跨 seed/扰动复用的根本原因
- 托管：HF 数据集 `RLinf/RPent-memory`，每次运行增量同步，`HF_HUB_OFFLINE=1` 可离线。**⚠️ 写入 maintainer 人审、无自助上传**——第三个把知识写入路径卡在人审上的独立案例（ENPIRE 全自动 / 华为 trace 人审 / RLinf memory 人审）
- ⚠️ 记忆实现预设编码 agent（文件系统 grep）——**设计可搬，实现搬不了**

**2. VLA 的 HTTP 服务边界**：`vla_server.py`(201行)/`vla_client.py`——π0 作为服务，`pi0_pick`/`pi0_doubled` 原语内部跑 chunk 循环（`_vlm_chunk` + env `chunk_step`）。

**3. `segment` 工具把叠加图返回给 planner**：SAM3 分割后 `_mask_to_world(mask, world_map)` 出 `world_xyz`（数字），**同时**把 mask 叠画在原图存成 `segment_overlay_XX.png` 并以 `_image_bytes` 直接返回——多模态 planner **能目视核对 mask 压在哪个物体上**。⇒ 廉价的语义失败检测：高置信度锁错目标在数字里不可见，看一眼叠加图就能发现（L2 级判断，成本只是一次已有 VLM 的 look）。

## 其余核实点

- 原语库 `robots/libero/tools.py`（1740 行）：`view_env_state`/`view_camera_meta`/`segment`/`move_to`/`move_pose`/`rotate_wrist`/`rotate_pitch`/`pi0_pick`/`pi0_doubled`/`release`/`set_gripper`。任务特定沉积与通用运动逻辑混在一处
- episode 协议（guide 硬性规定）：**禁止重启 episode**、只许 episode 内恢复；同一步失败重试 2 次后"stop tuning numerics"；不可恢复则写 forensics + `finish`（NO reset, NO second attempt）；"wrong-target first grab is unrecoverable" ⇒ 要求前置消歧而非事后恢复。**这个协议本身否定了"仿真里可以随便重来"**
- README 的 "self-evolution" 在代码里是零——实际机制就是"记忆积累 + 人审发布"

## Why it matters（对本库）

1. **给 Harness VLA 论文笔记补上实现侧真相**：论文说的 memory-guided agents，实现是"markdown playbook + 编码 agent + 人审记忆库"；τ/staging 等机制无代码形态。**引用论文机制时应知道它们是 prompt 承载的。**
2. **"存过程不存坐标"应升格为记忆设计规律**（与 [[Memory in Embodied AI]] 互见）。
3. **人审门禁三点连线的第三点**（→ [[Cloud-edge co-evolving embodied agent - a continuous-evolution framework|co-evolution 框架]]的"检测信号质量决定演进通道能否去人"）。
4. 选型对照的嘱咐侧极点（→ 选型页）。

## What feels strong
- 记忆设计（上述）；服务化边界干净（VLA/SAM3/env 各自独立进程 + RPC）
- 叠加图回传 planner 的验证 affordance
- guide 里的失败模式知识密度高（复盘产物,不是拍脑袋）

## What feels limited
- **无 LICENSE、无测试、Pre-Alpha、仅 LIBERO 零真机**
- harness 不可消融、不可度量（行为在 prompt）
- planner 锁定 Claude Code/Codex SaaS——顶撞"断网必须能活"
- "self-evolution" 宣传与代码现实（0 命中）落差大——**"架构吻合 ≠ 已验证"纪律又一次适用**

## Related
- [[Zhang et al. - Harness VLA Steering Frozen VLAs into Reliable Manipulation Primitives via Memory-Guided Agents]] — 它承载的论文
- [[openJiuwen - JiuwenSymbiosis Physical AI Assistant Framework]] — 机制侧对照仓
- [[Harness development base - JiuwenSymbiosis selection and build plan]] — 两仓对照的选型结论
- [[Harness granularity]] — pi0_pick 的"原语内藏 chunk 循环"是该原则的又一实例
