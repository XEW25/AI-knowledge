# Galanti et al. - Pigey: Addressing the Orchestration Gap in Generalist Robots via Physical Agency

## Metadata
- **Type**: source note
- **Format**: arXiv preprint (cs.RO), **v1 2026-07-23**；CC BY 4.0；项目页 https://lianegalanti.github.io/Pigey/
- **Authors**: Liane Galanti, Dhruv Shah, Tri Dao
- **Organization**: **Princeton University** + **Together AI**
- **arXiv**: [2607.21725](https://arxiv.org/abs/2607.21725)
- **Code**（2026-09-03 核实）: **已开源** [lianegalanti/Pigey](https://github.com/lianegalanti/Pigey)（68 stars，最后推送 2026-08-02，**无 LICENSE 文件**）。真机端 `real/agent.ts`（**1017 行 TypeScript**，Bun 运行）+ `real/agent-system.md`（**301 行系统提示词**）；仿真端 `sim/agent_sim.py`（3427 行）+ `sim/spatial_tools.py`（484 行）。后端服务（TiPToP / DROID / openpi π0.5）全部指向上游仓库，本仓只是编排层。
- **Raw tier**: URL-only（arXiv HTML 全文自读；PDF 未下载）
- **Verification status**: 机制 / 工具集 / 三张结果表 / 失败归因 / 推理器扫描 / 成本 **arXiv HTML 自读核实**；**`real/agent.ts` 守卫逻辑代码级核实**（2026-09-03）；`sim/agent_sim.py` 的 `vla_rollout` / Gemini-ER 感知 / 抓取判定 / phase 0 / 系统提示词段**代码级核实**（2026-09-10 确认轮），其余未逐行审计；上游 TiPToP 仓库的 `perception/gemini.py` 与提示词文件已读
- **Related**: [[Zhang et al. - Harness VLA Steering Frozen VLAs into Reliable Manipulation Primitives via Memory-Guided Agents]], [[Embodied failure detection]], [[Harness granularity]], [[Harness design]], [[Harness development base - JiuwenSymbiosis selection and build plan]], [[Physical Intelligence - pi0.5 a VLA with Open-World Generalization]], [[Alex Zhang - The Mismanaged Geniuses Hypothesis]], [[Being-0 - a Humanoid Robotic Agent with VLMs and Modular Skills]], [[Real-robot evaluation]]
- **Revision**: **v2**（2026-09-10，Ethan 逐项确认后补全：模型清单、Gemini-ER 输入输出、`is_grasped` 判定条件、仿真 phase 0 与 A/B/C 三支路由、VLARollout 无事中停止；修正“oracle 不进回路”为“oracle 仅做早停/终止”；同日二次补：LLM 调用节奏与验证器隔离设计、验证器 fail-open、上下文无状态重发与旧图剪裁、回合内记忆机制）
- **Tags**: #agentic #harness #vla #frozen-policy #orchestration #failure-detection #verification #retry #tamp #real-robot #princeton

## Summary

一个**前沿 VLM 当闭环编排器**，每步读观测与历史、发**一个**工具调用、验证结果、失败则恢复，直到自己宣布完成或耗尽预算。**它从不发运动指令**，全部委托给两个**冻结、非为本文训练**的后端：**TiPToP 的 TAMP 抓取规划器**（刚体 pick-and-place，几何精度 + 可验证的抓取信号）和 **π0.5-DROID**（可变形、接触密集、杂乱、以及 TAMP 规划不出来时的恢复路径）。后端只收到短的可执行子目标（"把红杯子放到盘子上"），**从不收到原始抽象指令**。

作者命名的 **orchestration gap**：同一套冻结运动技能，直接提示（direct prompting）与放进 agentic 回路（agentic condition）之间的成功率差。全文实验设计只动这一个变量——机器人、相机、场景、演示、策略权重全部固定，**零新数据、零后训练**。

> **本库定位一句话**：这是 [[Zhang et al. - Harness VLA Steering Frozen VLAs into Reliable Manipulation Primitives via Memory-Guided Agents|Harness VLA]] 的**真机对照组**——那篇有仿真、有跨回合记忆、oracle 进决策回路；这篇有真机（Franka FR3，150 次试验）、零跨回合记忆、成功判据用夹爪传感器 + 腕部图像。两篇合起来才是"冻结 VLA + 编排层"这条路线的完整论证。

## 系统：工具集与两个冻结后端

**真机工具**（论文正文列 5 个，代码 `agent.ts` 实际 8 个）：

| 工具 | 后端 | 返回 |
|---|---|---|
| `Perceive` | 开放词汇检测器（Gemini Robotics-ER） | 腕部图像 + 末端位姿 + 夹爪开度 + `is_grasped` + **检测到的物体标签集** |
| `Pick` | TiPToP TAMP（检测→分割→深度→M2T2 抓取→cuRobo 规划→执行→闭合） | `{success, is_grasped, gripper_width_m, fail_reason, …}` + 前后腕部图像；**自动感知全场并缓存所有物体位置供 DropAbove** |
| `DropAbove` | TiPToP | 放到缓存的目标位置上方 |
| `VLARollout` | π0.5-DROID（15 步 action chunk，默认 300 控制步） | 末帧观测 + 标志位 |
| `Release` / `LookAway` / `LookBack` | 解析式 | `LookAway` 把腕部转离桌面 180°，`LookBack(verify_only)` 只暴露第三视角——**专为长程记忆任务的"致盲期"设计**，保证 agent 不能偷看场景改动 |
| `Done` | — | 终止；仅在验证任务谓词后调用 |

**标签即词汇表**：每个 `Pick`/`DropAbove` 参数**必须**是最近一次 `Perceive` 返回的精确标签。这强迫 agent 把指令里的语义类别（"不安全的"、"素食的"、"最小的"）**接地到具体检测物**，而不是自造名字。标签每次 `Perceive` 重新生成，提示词专门有一节讲"标签会在两次调用间漂移"。

**后端返回带类型的失败**：无抓取点、运动规划失败、不可达、步数耗尽。编排器知道**为什么**失败，不只是失败了。附录 10 明说这些注解**不是学出来的**，是从控制器状态和 rollout 日志算出的确定性谓词——"减少从像素推断每个底层失败的需要"。

**仿真工具**（LIBERO-PRO，π0.5-LIBERO）：`Perceive` / `Grasp` / `Place` / `VLARollout` / `VerifyCandidate` / `GoHome` / `Release`，**只有 `VLARollout` 调学习策略**，其余是解析控制器。感知用 Gemini Robotics-ER 的编号 bbox + 标定相机深度射线反投影世界坐标；LLM **只看到 `#N` 编号不看物体名**；物体真值位姿与接触状态**不暴露**。**仿真没有 `Done` 工具**：代码注释说 Gemini Pro 曾在一次试验里调了 53 次 Done 刷掉 LLM 步数预算，于是移除，完成改由环境 `task_done` 自动判定——但提示词的 FALLBACK FLOW 里仍写着 “call `Done`”，是**提示词与代码不同步**的一处。另一处真机/仿真不对称：仿真 LLM 只拿到 `#N` 编号 + 世界坐标 xyz，**没有 `objects_detail` 那样的三轴尺寸**，真机提示词“尺寸比较只信 `objects_detail`、不许目测”的规则在仿真里没有对应物，最大/最小类任务只能看图。

## 模型清单：每一步至少两个云端 VLM

| 角色 | 模型 | 可换？ | 备注 |
|---|---|---|---|
| **编排器** | 真机默认 **Claude Opus 4.7**（`CLAUDE_MODEL` 可覆盖）；仿真经 LiteLLM 模型无关 | ✅ | 论文扫 7 模型 9 配置（表见 Results）；仿真 README 另称验证过 Claude Fable 5、GPT-5-mini |
| **感知** | **Gemini Robotics-ER 1.6 preview**（`gemini-robotics-er-1.6-preview`） | ❌ 写死 | 真机走 TiPToP 的 `perception/gemini.py`，仿真走 Pigey 自己的 LiteLLM 调用；`HARNESS_PERCEPTION` 取其他值直接抛错 |
| **动作后独立验证器** | 另一次 LLM 调用（`runVerifier`） | — | 真机代码有、论文正文无 |
| **VLA 后端** | **π0.5**，openpi websocket 服务；真机 `pi05_droid`，仿真 `pi05_libero` | 冻结 | 两个 checkpoint 语言鲁棒性天差地别，见“仿真的编排结构”一节 |
| **TAMP 后端（真机）** | TiPToP 流水线：Gemini-ER 检测 → SAM 2 分割 → FoundationStereo 双目深度 → M2T2 抓取生成 → cuRobo/cuTAMP 规划 | 冻结 | “两个冻结后端”里 TAMP 这一侧其实是五个模型的流水线，只是没有策略网络 |
| **几何原语（仿真）** | 解析控制器 + SAM（掩码）+ PCA | — | 只有 `VLARollout` 调学习策略 |

Gemini Robotics-ER 是闭源 API 模型，**参数量未公开**（Google 从未公布任何 Gemini 系列的参数量），产品定位对标 Flash 档。对部署评估而言大小不是关键变量：它没有本地权重，多大都只能走云端。

## 感知：Gemini Robotics-ER 1.6 的输入与输出

它在这套系统里是一个**“看一张图、吐 JSON”的开放词汇 2D 检测器**，所有三维量都在它外面算。

**输入**：一张 RGB 图（真机第三视角 ZED 2i 一帧；仿真 agentview 渲染图）+ 一段文本提示词。不传深度、不传历史、不传机器人状态。`thinking_budget=0`，当纯感知模型用。

**输出**（严格 JSON，两端略有差别）：

| | 真机（TiPToP `detect_and_translate.txt`） | 仿真（Pigey 自写提示词） |
|---|---|---|
| 检测 | `bboxes: [{box_2d: [ymin,xmin,ymax,xmax], label}]`，坐标归一化 0–1000 整数，≤25 物体，排除机器人/夹爪/桌面/远处无关物；同类物体必须用颜色/大小/位置起唯一名 | `[{label, bbox}]`，**标签只许纯视觉描述**（颜色+形状+大小，snake_case），**禁止猜语义身份**——原话：不许写 `tomato_sauce`/`ketchup`，“that is the agent's job”；相似物体加 `_a`/`_b` |
| 任务翻译 | `predicates: [{name: on\|holding, args}]`——把指令翻成 `on(movable, surface)` / `holding(movable)` 的合取，提示词里有“扔垃圾只扔空包装、不扔满瓶”的常识示例 | 无 |

**从 2D 框到三维量的路径，都不经过它**：

| | 真机 | 仿真 |
|---|---|---|
| 深度来源 | FoundationStereo 从 ZED 双目估计 | MuJoCo 渲染真值深度，经 robosuite `get_real_depth_map` 转米制 |
| 分割 | SAM 2 | SAM |
| 定位 | 掩码点云 → 质心 + 三轴尺寸（`objects_detail`） | 掩码内深度取**第 10 百分位**（偏向最近表面；注释：直接取中位数会取到地板）→ 最大连通域质心**单点射线反投影** |
| 点云 | 有，M2T2 在其上生成抓取 | **仅 PCA 抓取分支**建掩码点云算主轴与顶面高度（z 第 90 百分位），不输出尺寸 |

⇒ Gemini-ER 对系统的贡献只有两件：**场景切成哪几个物体**、**每个叫什么**。标签即编排 LLM 的词汇表，且**每次调用重新生成、不稳定**（`large_blue_bowl` 下一轮可能变 `blue_bowl`），这就是“标签漂移”的来源，也是代码里“Pick 失败后强制先 Perceive”的直接原因。

**提示词对它的信任分级**：物体身份 → 权威（Pick/DropAbove 只接受它的精确标签）；尺寸 → `objects_detail` 权威，明令不许用腕部图像目测推翻；任务选择（`gemini_atoms`）→ 仅“强烈建议”，LLM 可否决但须说明理由。

**`gemini_atoms` 没有任何代码消费者**。`agent.ts` 里它唯一出现的位置是把 Perceive 返回原样透传给 LLM；Done 前谓词校验用的是 `objects_detail` 足迹计数，不用它。它是 TiPToP 的遗产：原系统里这组谓词是 TAMP 规划器的**搜索目标**，Pigey 把 TiPToP 拆成只认标签的 Pick/DropAbove 后，目标由编排 LLM 掌握，谓词被架空成参考。⇒ 换掉 Gemini-ER 时丢掉这个字段不影响任何机制。

> ⚠️ **一处未能核实的矛盾**：Pigey 提示词明说 Perceive **不接收用户任务指令**（标签才无偏），但 TiPToP 的 `detect_and_translate()` 签名要求 `task_instruction`，且 Perceive 确实返回 `gemini_atoms`。两者同时成立只能是作者私有的 TAMP 服务器传了固定/替代指令串，该服务器（代码注释称 “bamboo shim”）未公开。

> **与 SAM 3 的对照（2026-09-10 讨论）**：两者都是开放词汇可提示感知，但方向相反——SAM 3 是“给名词、返回所有实例掩码”；Gemini-ER 在此是“不给目标名、枚举全场并**自己起名**”。Pigey 依赖后者生成离散词汇表来约束接地（Pick 参数必须在标签集内，接地失败变成可检测的“标签不在列表”）；换 SAM 3 则词汇表得由规划 LLM 看图自提，接地失败会变成“返回空/错实例”这种更隐蔽的形态，但换来开放权重本地可跑、少一个云依赖（符合团队“断网可活”判据），且三维量不受影响。最接近的对应是 SAM 3 论文里的 “SAM 3 Agent”（MLLM 出名词短语 + SAM 3 定位）。

## 验证：论文写的两层，代码里是四层

**论文正文**（§3.4）：两个互补信号，**保守合并**——
1. **确定性**：`Pick` 只有夹爪宽度传感器 `is_grasped` 为真才算成功；可达/规划失败以显式标志浮出。
2. **视觉**：动作后的腕部图像回传 VLM，确认目标在夹爪里且已离开桌面。
3. 合并规则：**后端自报成功但传感器读到空夹爪 ⇒ 改判失败**——"乐观的后端不能误导 agent"。只有验证过的结果推进计划；`DropAbove` 只在前一次抓取验证后才发出，**永不运送并释放一个没抓到的物体**。

**`real/agent.ts` 核实**（论文没写的部分，注释标 "PATCH 2026-06-01"）：

| 层 | 代码位置 | 做什么 | 性质 |
|---|---|---|---|
| **抓取传感器覆盖** | `if (name==='Pick' && out.success===true && out.is_grasped===false) out.success=false` | 注释原话：*"tiptop may report success=true even when the gripper closed on air. Trust the … width sensor over the parsed log"* | **代码，确定性** |
| **动作后独立验证器** | 每次 `DropAbove` / `VLARollout` / `Release` 成功后：自动 `Perceive` 刷新场景 → **另起一次 LLM 调用 `runVerifier(TASK, actions, objects_detail, side_image)`** → 不通过则把该动作**降级为失败**并附理由 | **代码触发的独立 LLM 裁决**——不是让规划 LLM 自己说"我觉得成了" |
| **Done 前双层守卫** | 第一层：Done 前**强制**新鲜 `Perceive`；第二层：若任务含可检谓词（"empty"、"alone in"），用最新检测的**足迹框内物体计数**校验，违反则**拒绝 Done** | **代码，几何计数** |
| **规划 LLM 自己的视觉核对** | 提示词 §"Visual verification — be specific about what you're checking" | 嘱咐 | **提示词** |

> **本库判断**：这四层正是 [[Embodied failure detection]] 里"**裁决段**"该长的样子——**传感器谓词 > 独立裁判 LLM > 几何计数 > 规划者自省**，越靠前越确定、越便宜、越有覆盖权。尤其第二层把"**做检查的**"与"**写病历的**"分成两次调用，直接对应该页"Diagnosis ≠ Detection"的告诫。团队 JiuwenSymbiosis 选型时发现的"裁决段是空的、全是自报信号"，这里有一份**真机跑过的**参考实现。

### 调用节奏：每个工具后必有一次规划调用，改变世界的动作后再加一次验证调用

主循环每个 turn 调一次编排 LLM（输入 = 完整历史 + 最新工具结果，输出工具调用），所以**每个工具执行完，下一轮规划调用天然承担“看结果 + 定下一步”两件事**。`Pick` 的验证走这条路：传感器 `is_grasped` 已在代码里改过判，前后腕部图随结果进上下文，规划 LLM 下一轮看图确认。⚠️ 论文说 agent 每步“发一个工具调用”，代码是取出本轮所有 `tool_use` 块**顺序执行**，允许一轮多个。

`DropAbove` / `VLARollout` / `Release` 成功返回后，代码额外自动做两件事：先 Perceive 刷新场景（一次 Gemini-ER 调用），再 `runVerifier`（**独立的一次 LLM 调用**，同一模型，`max_tokens` 200）。`Pick` 与 `Perceive` 之后不触发——注释理由：Pick 已有传感器 + 视觉验证，Perceive 不改变状态。

| 工具 | Gemini-ER | 编排 LLM | 验证 LLM |
|---|---|---|---|
| Perceive | 1 | 下一轮 1 | 0 |
| Pick | 1（TiPToP 内部自动感知） | 下一轮 1 | 0 |
| DropAbove / VLARollout / Release | 1（自动刷新） | 下一轮 1 | **1** |

论文报的每次试验 3–15 次推理器调用应只数了规划调用，验证调用是否计入未说明。

**验证器的隔离设计**（注释原话：*“no agent history, no system prompt — so it can't be co-opted by the agent's reasoning”*）：只给任务原文、最近 12 条动作的结构化记录、当前 `objects_detail`、一张第三视角图；系统提示词要求“字面且严格”——empty = 足迹框内无其他物体，in = 质心落在目标足迹内，on = 质心在目标顶面之上，最大/最小按测得尺寸，多步任务只看已完成子集是否与进展一致，**不许因 agent 的意图或“刚才是空的”这类过去断言放宽当前状态谓词**；输出一行 JSON `{ok, reason≤15 词}`，不通过则动作降级为失败、理由注入下一轮。

> ⚠️ **验证器是 fail-open 的**：API 报错或超时直接返回 `ok: true`，注释写 “letting through”。这与 [[Embodied failure detection]] 把 fail-closed 当宪法的立场相反——裁决层自己不可用时 Pigey 选择放行，代价是 2/150 之外可能还有未被记录的漏检。搬入团队 DetectionRail 时须翻转。

### `is_grasped` 的判定条件：真机未公开，仿真 5 mm

“确定性信号”要收窄理解：**确定在于它是硬件读数派生的布尔、不经 LLM**；**判定逻辑本身论文与公开代码都没有**。

| 路径 | 判定 | 来源 |
|---|---|---|
| **真机 Pick** | `is_grasped` 由私有 TAMP 服务器（“bamboo shim”）计算后回传，逻辑**未公开**。公开的 TiPToP 仓库只有 UR5 的 Robotiq 驱动（含 `ObjectStatus.STOPPED_INNER_OBJECT` 即“闭合中遇物停止”枚举），FR3 路径缺失 ⇒ 最可能是 Robotiq 物体检测状态寄存器或“闭合后宽度 > 最小值”之一，**属推测** | `agent.ts` 类型定义 + TiPToP 仓库 |
| 真机提示词的“已验证抓取” | 图像里夹爪中有物体 **AND** `gripper_width_m < 0.085` **AND** `is_grasped` 为真。⚠️ 0.085 m 就是 Robotiq 2F-85 的**最大开度**，该阈值只能说明“不是全开”，几乎不携带信息，真正起作用的是 `is_grasped` 那个黑盒布尔 | `agent-system.md` 规则 3 |
| **仿真 Grasp** | 闭合 25 步后读 `robot0_gripper_qpos`，`finger_gap = \|q₀ − q₁\| > 0.005` m 即 `held`。未夹住则**不抬升**，只松开并上抬 5 cm 退开——注释：为不扰动场景、给 VLA 回退留完整现场；夹住才抬 10–12 cm | `agent_sim.py` |
| **VLARollout**（两端） | **完全没有 `is_grasped`**。返回 `success: null`，注释原话：ok 只表示 300 步跑完“NOT that the task succeeded”，强制 LLM 下一步 Perceive 目视核对 | `agent.ts` |

**局限**：宽度类判据分不出“夹到了错的东西”（这一格靠提示词“抓错先放回桌面”兜底）；对很薄的物体可能漏判为空抓；真机 2/150 的误判只统计了视觉验证器那一层，**传感器层误判论文没有单独数字**。

## 恢复阶梯：代码守卫 + 提示词路由

**代码里的硬守卫**（工具调用前拦截，返回 `rule_violated` 字段给 LLM，不真执行）：
- **Pick 失败 1 次** ⇒ 阻断下一次 Pick，**强制先 `Perceive`**（理由：Gemini 标签会漂移，必须用当前标签重接地）
- **Pick 失败 ≥2 次（同链）** ⇒ 阻断 Pick，**强制升级到 `VLARollout`**（注释：*"Tiptop can't grasp this object reliably (geometry or shape issue)"*）；链在任何成功动作或 VLARollout 后重置
- **目标在容器内**（被之前的 DropAbove 放进去的） ⇒ 阻断 Pick，强制 VLARollout（TiPToP 对带沿/容器内物体抓取失败）
- 全局：`MAX_STEPS` 默认 15，`CONSECUTIVE_FAIL_LIMIT` 默认 5 连败即中止

**提示词里的路由规则**（附录 11，`agent-system.md` §"Decision order"）：抽象/多物体指令先 `Perceive` 再映射语义 → 刚体走 TAMP 并验证 → 重试一次再升级 → 可变形（线缆/布/绳）直接走 VLA → 放置用缓存位置 → **双向回退**（VLA 无进展则回到 TAMP 在新感知的场景上 Pick，反之亦然）→ 只在验证任务谓词后 `Done`。

**语义级恢复**（提示词专节）：抓错物体 ⇒ **放回桌面（永不放到目的地）**再重试；目标不可见 ⇒ 把可见物体当遮挡物移开、重感知直到出现；目的地里有不属于目标状态的东西 ⇒ 先清空。

**每次抓取前重感知**是对"世界会变"的鲁棒性来源：目标被上一动作或接近动作推动了 ⇒ 对当前位姿重规划（Fig. 4），而非抓它原来所在的位置；开环计划算完就瞎，这两类是"必败变成功"的具体案例。

## 上下文与记忆：无状态重发、只留最近一张图

编排 LLM **没有服务端会话**——Anthropic Messages API 无状态，Pigey 维护一个 `messages` 数组，每轮追加上一轮 assistant 输出与本轮 `tool_result`，然后把**整个数组 + 系统提示词 + 工具定义一起重发**。“继承上下文”就是这个数组。

但不是原样重发，有一道剪裁 `pruneOldImages`：每轮追加后，**只保留最近一条带图的 `tool_result` 里的图像**，之前所有轮次的图像替换为一行文本 `[older wrist image pruned]`；文本部分（工具 JSON、失败理由、`rule_violated` 消息）全部保留。注释理由：*“Scene memory carries the state information that the LLM actually needs for prior turns.”* 这里的场景记忆有两层——提示词要求 LLM 在回复里自维护的“持有什么 / 放了什么 / 剩什么”，以及代码里的 `memory.actions_taken` 等结构（守卫拦截时作为文本注入）。预算 15 轮 × 每轮一张图，上下文不会长到需要压缩，代码里也没有截断历史文本的逻辑。

验证器调用是另一个极端：**不继承任何东西**，只拿任务、最近 12 条动作、当前 `objects_detail`、一张第三视角图（见上节）。

⇒ 对本库两点含义：①Pigey 的“记忆”= 对话历史 + 自维护的文字状态，无检索、无跨回合持久化——四特性记分“记忆 ◐ 仅回合内”的机制细节；②“只留最近一张图”意味着规划 LLM **无法回看早先场景**，长程记忆那两个任务里“还原初始布局”靠的是提示词要它在致盲前把物体位置**写成文字**记下来，而不是回看 PRE 图——这与 Harness VLA 把空间参数当 reference-scene binding、部署时重新接地的思路同源，但更粗（纯自然语言、无结构）。

## 仿真的编排结构：phase 0、A/B/C 三支、无事中停止

这一节全部来自 `sim/agent_sim.py` 代码与内嵌系统提示词，**论文正文只写了“agent 可调七个工具”**。它改变了对 LIBERO-PRO 53.3% 的读法。

### phase 0：LLM 被调用之前先静默跑一遍裸 π0.5

1. 先拍 agentview + 腕部快照，标记 “PRE-VLA”，代表未扰动的初始场景。
2. 把任务字符串原样喂 π0.5，跑一个步数预算（默认 = 单次 VLARollout 上限）。
3. 环境 `task_done` 为真 ⇒ 试验直接记成功，日志写 **“No LLM needed”**，编排器全程未被调用。为假 ⇒ 把**被扰动后的场景** + PRE-VLA 参考图交给 LLM，从这里才开始编排。

跳过条件：`CORTEX_NO_PHASE0=1`，或一个**语言学门控**（`_vla_hostile`，注释称通用、不含 LIBERO 专属物体名）判定任务串对 VLA 有害——对应下文 A 支那几类，命中则不跑，免得白白搅乱场景。提示词明告 LLM：“若 phase 0 已跑且失败，**不要再调 VLARollout**——同模型同任务 = 同样失败 + 再扰一次”。

⇒ **53.3% = “裸 π0.5 一次成功” ∪ “LLM 用几何工具修复”**，前者上限即直调基线 12.8%。**仿真里编排器的角色是裸 VLA 失败后的修理工**，接手的是已被扰乱的场景；真机上编排器从干净场景开始、TAMP 是主路径。**两边编排结构是反的**：真机 TAMP 主 VLA 辅，仿真 VLA 先试、几何后补。

### A/B/C 三支：VLARollout 只在两支里出现

提示词先列 **π0.5-LIBERO 的四类已知失败**（“known limitations — read first”），并强调调它不只是失败而是**主动扰乱场景**（抓错、举高、半空丢、打散布局）：①**负向表述**（“NOT between/next to/on/in”，会丢掉 not 抓被否定的实例）；②**桌面以上放置**（cabinet 顶、rack、drawer 顶，够不到）；③**推**（“push X to Y”，历史成功率 ≈ 0.5%）；④**靠空间关系区分同类物体**（“the bowl ON THE cookie box / NEXT TO the ramekin / BETWEEN X and Y”，接地不到正确实例，且失败时把用于区分的空间信息一并打乱）。

| 支 | 判定 | VLARollout |
|---|---|---|
| **A** π0.5-incompatible | 命中上述任一 | **永不调**——不做主路径、不做回退、不做恢复；只走几何流水线 Perceive → (VerifyCandidate) → Grasp（顶抓，失败 PCA 偏航重试）→ Place |
| **B** 铰接动词 | open/close/turn on-off/lift the lid | 几何原语建不了铰接运动 ⇒ 若 phase 0 未解决，调**一次**，失败则认为任务可能无解 |
| **C** 干净 pick/put/place | 未触发任何限制 | 主路径仍是几何流水线；Grasp 对同一目标**失败两次后**、且 **phase 0 未跑过**，才允许 VLARollout 一次作最后手段 |
| 便捷工具 `RightObject` | 上一次 VLA 撞倒了瓶子 | 包了一层 `VLARollout("stand the X upright")` |

⇒ **在抓取上 VLARollout 只是 Grasp 的备胎**；四类失败模式是作者从 π0.5 在 LIBERO-PRO 上的实际失败归纳出来（“≈0.5%” 这种数字来自跑出的日志），是**手写进提示词的工具适用范围**——恰是 [[Zhang et al. - Harness VLA Steering Frozen VLAs into Reliable Manipulation Primitives via Memory-Guided Agents|Harness VLA]] 让 Global Memory “学”的那件事。

### 字符串保真：不是逆向翻译，是“禁止加词”

提示词规定传给 π0.5 的子目标必须 **verbatim**：要么是拿到的任务串原文，要么其严格截短；禁止加视觉词（dark label / black cap）、位置词（in the center）、状态词（unopened）。原因：π0.5-LIBERO 在 LIBERO 那几十条固定句上微调，语言嵌入近乎查表，多一个形容词就出分布。

⚠️ **LLM 并不知道训练集里有哪些原句**——它拿到的唯一任务串是 `{TASK}`，即当前 LIBERO-PRO 任务 BDDL 文件的 `:language` 字段，提示词没附训练句列表、代码没有映射表。所以这条规则防的是**LLM 自己往子目标里塞描述词**，不是要求它把改写句翻回原句。由此：

- **swap 套件**（指令不改、换物体/位置）：`{TASK}` 就是训练原句，照抄有机会成功 ⇒ π0.5 直调也有 17/20/38。
- **task 套件**（同场景、指令改写成另一目标）：`{TASK}` 已是改写句，照抄进 π0.5 照样出分布 ⇒ 直调 1/1/0，phase 0 大概率失败，**成功只能来自 A 支几何流水线，与 π0.5 无关**。

**真机规则正相反**：`pi05_droid` 在 DROID 大规模多样数据上训，语言泛化好，真机提示词的 “π0.5 language conventions” 教的是**怎么把子目标说清楚**（具体名词、说明目的地），而非照抄固定句。同一模型两个 checkpoint，语言鲁棒性完全不同。

### VLARollout 无事中停止

两端都是**启动后跑到预算耗尽**。仿真 `vla_rollout` 循环唯一退出条件是环境 `done_flag`（LIBERO 任务谓词），为真则 `success=True` 且整个 harness 循环结束；没有无进展检测、夹爪/力判停、chunk 级一致性检查。真机 `callVLA` 固定 `max_steps=300`，agent 端无中途干预通道；真机也没有 `task_done`，连 oracle 早停都没有。论文的 “if a VLA rollout makes no progress, fall back to TAMP” 是 **rollout 结束后 LLM 看末帧的事后裁决**，不是事中打断。

⇒ 对照本库：Harness VLA 的 τ 让 VLA 满足判据即交还控制，Pigey 没有这一层；[[Harness granularity]] 说的“rail 对执行单元内部循环整段失明”，VLARollout 的 300 步就是典型。**oracle 使用程度的精确说法**：仿真 oracle **进了回路，但只做 VLA 早停与试验终止，不参与 LLM 的任何成败判断**（README 亦如此声明）；Harness VLA 则把 benchmark 成功信号写进 Global Memory 让 planner 去查，是更深一层的使用。

## 机制 vs 嘱咐：哪些在代码、哪些在提示词

这是团队选基座时的核心判据（见 [[Harness development base - JiuwenSymbiosis selection and build plan]]）。Pigey 的分布**比 RPent 靠代码得多**，但仍是混合：

| 行为 | 住哪 |
|---|---|
| 抓取传感器覆盖后端自报 | **代码** |
| 动作后独立验证器调用 + 降级 | **代码** |
| Done 前强制感知 + 谓词计数守卫 | **代码** |
| 重试→强制感知→升级 VLA 的阶梯 | **代码**（守卫返回 `rule_violated`） |
| 容器内物体路由到 VLA | **代码** |
| 步数/连败预算 | **代码** |
| 刚体 vs 可变形的一般路由 | 提示词 |
| 双向回退、遮挡搜索、清空目的地、放回桌面 | 提示词 |
| 全称/存在量词解读、最值选择、致盲期还原、观看演示后复现 | 提示词 |
| 场景记忆（持有什么、放了什么、剩什么） | 提示词要求 LLM 自维护 + 代码 `memory.actions_taken` 等 |

⇒ **可确定判定的（传感器、计数、次数）全在代码；需要语义判断的在提示词或独立 LLM 调用。** 这个切分本身值得当设计参考：不是"全进代码"也不是"全靠 prompt"，而是**按可判定性分层**。

## Results

### LIBERO-PRO（仿真，π0.5-LIBERO 冻结，每任务每推理器 10 次）

| 方法 | Obj swap | Obj task | Sp swap | Sp task | Goal swap | Goal task | **Mean** |
|---|---|---|---|---|---|---|---|
| π0-LIBERO | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| π0.5-LIBERO 直调 | 17 | 1 | 20 | 1 | 38 | 0 | **12.8** |
| CaP-Agent0（code-as-policy agent） | 22 | 18 | 12 | 14 | 26 | 17 | 18.2 |
| **Pigey（Claude Opus 4.7）** | 54 | 54 | 66 | 80 | 44 | 22 | **53.3** |

作者自评：*"LIBERO-PRO requires minimal reasoning"*，增益主要来自**错误恢复 + 工具**，不是推理。**严格零样本协议**：无任务专属记忆、无参考种子探索、无微调。⚠️ 但含 **phase 0**（见“仿真的编排结构”）：每次试验先静默跑裸 π0.5，成功则不调 LLM ⇒ 53.3% 是“裸 VLA 一次成功 ∪ LLM 几何修复”的并集；swap 套件的增益部分来自 VLA 照抄原句，task 套件（直调 1/1/0）的增益几乎全部来自不调 VLA 的几何流水线。

**推理器扫描**（同一冻结策略，只换编排 VLM）：GPT-5.5 low/med/high **44.3 / 46.3 / 49.0**，Gemini Robotics-ER 1.6 **48.0**，Gemini 3.5 Flash **48.0**，Gemini 3.1 Pro **48.7**，Claude Haiku 4.5 **47.7**，Sonnet 4.6 **51.7**，Opus 4.7 **53.3**。**全部远超两个基线**；差距最大的是需要**重分解**而非重定位的套件（obj-task / sp-task）。作者的表述：*"The reasoner sets the magnitude of the gain, not its sign."* ⚠️ 正文一处说 "seven different reasoners"、另一处说 "nine frontier VLMs"——是 7 个模型 9 个配置（GPT-5.5 三档 effort），引用时注意。

### 真机（Franka FR3 + π0.5-DROID，30 任务 × 5 次 = 150 次/方法）

| 能力探针 | 任务数 | π0.5 直调 | TiPToP 开环 | **Pigey** |
|---|---|---|---|---|
| 简单 pick-place（对照） | 4 | 95 | 80 | **100** |
| 世界知识（"能做 ratatouille 的东西"） | 4 | 0 | 90 | **100** |
| 条件逻辑（最小/最大/异类/红或蓝） | 4 | 0 | 95 | **100** |
| 多步推理（"正好放 2 个进杯子"、"堆叠所有容器"） | 4 | 0 | 25 | **100** |
| 空间推理（"放进它还塞得进的最小容器"） | 4 | 20 | 75 | **100** |
| 遮挡/安全推理（目标在容器下、清除危险品） | 4 | 0 | 0 | **90** |
| 错误恢复 | 4 | 10 | 0 | **90** |
| 长程记忆（致盲后还原场景、看人演示后复现） | 2 | 0 | 0 | **100** |
| **总体** | 30 | **16.7** | **48.7** | **97.3** |

推理受限类：直调 **4.6%** → Pigey **96.9%**（同一 VLA 权重）。对照类 95→100，**没有因加编排而退化**。

**TiPToP 对照的意义**（§5.3）：它与 Pigey 用**同一套**接地与运动规划，差别只在开环 pick-and-place 一次算完、执行期全盲。在最简单的对照任务上它只有 80%（低于裸 VLA），因为微小控制错误无处补救；Pigey 拆成两个工具、中间验证，检测到空夹爪就重试 ⇒ 100%。多步 / 遮挡 / 恢复三类 TiPToP 是 25 / 0 / 0，差距正是"闭环 vs 开环"。

### 首次失败归因（150 次/方法，回路里捞回来的瞬时错误不计）

| 首次失败模式 | π0.5 直调 | TiPToP | **Pigey** |
|---|---|---|---|
| 接地（抓错/随机目标） | 86 | 5 | **0** |
| 推理/规划 | 38 | 65 | **0** |
| 抓取执行 | 1 | 7 | 2 |
| **验证器误判成功** | 0 | 0 | **2** |
| 总失败 | 125 | 77 | **4** |

> 这张表是全文最有信息量的一张：它说**裸 VLA 的失败几乎全是接地和推理（124/125），运动只占 1**；而 Pigey 的 4 次失败里**有 2 次是验证器被遮挡骗过**——正是 [[Zhang et al. - Harness VLA Steering Frozen VLAs into Reliable Manipulation Primitives via Memory-Guided Agents|Harness VLA]] 笔记里预测的"真机化难点在'谁告诉你成功了'"，这里给出了首个真机测得的**误判率量级：2/150**。

### 成本

每次真机试验 **3–15 次推理器调用**，API 费 **$0.02–0.50**（随模型档），**墙钟 2–6 分钟**。硬件：Franka Research 3 + Robotiq 2F-85；ZED 2i（第三视角）+ ZED-Mini（腕部）；控制 NUC 跑 polymetis（PREEMPT_RT）；工作站 RTX 5090 32GB 同时驻留 π0.5-DROID 与 FoundationStereo；TiPToP 栈 = Gemini Robotics-ER 检测 + SAM 2 + FoundationStereo + M2T2 抓取 + cuRobo/cuTAMP。**评分**：真机由人工按任务规格与末态判定；仿真用 LIBERO 谓词；超时未 `Done` 算失败，**成功前就 `Done` 也算失败**。

## 与 Harness VLA 对照（⚠️ 两个 LIBERO-PRO 数字不可直接比）

| | **Harness VLA**（清华等，2026-07-09） | **Pigey**（Princeton/Together，2026-07-23） |
|---|---|---|
| 真机 | **无** | **Franka FR3，30 任务 150 次** |
| LIBERO-PRO | 82.4%（Claude Code planner） | 53.3%（Opus 4.7） |
| 协议 | 有**跨回合**任务记忆 + 全局成功规则/失败模型；Global Memory 明写 *"Check the benchmark success signal"* ⇒ **oracle 进决策回路** | **严格零样本**：无任务记忆、无参考种子、无微调；成功判据用**传感器 + 视觉**，仿真 `task_done` 仅做早停 |
| 冻结后端 | π0.5 + 一组解析原语（`move_to`/`rotate_wrist`/…） | π0.5 + **完整 TAMP 抓取规划器**（异构双后端，按物体类型路由 + 双向升级） |
| planner | Codex / Claude Code（编码 agent 产品，文件 REPL） | 普通 VLM API 调用（LiteLLM 模型无关；真机默认 `claude-opus-4-7`） |
| harness 行为住哪 | markdown guides + prompt（Python 中 staging/postcondition 命中 0） | **可判定的在代码守卫，语义的在提示词**（见上节） |
| 记忆 | 两层持久记忆（TSM + GM） | 仅回合内上下文 |
| 主张 | 冻结 VLA 降级为 primitive，planner **学**工具适用范围 | 冻结技能不变，编排器**补齐**任务级栈；提出"**先测编排能补多少，再花机器人数据教策略推理**"的排序规则 |

⇒ 29 个百分点的差距里，**协议差异（记忆 + oracle）至少占一部分**，不能读成"Pigey 编排更差"。反过来，Harness VLA 消掉 TSM 后 Goal 套件 31.0/79.0 的零样本数字，才是与 Pigey 可比的量级。

## 对 Harness VLA "真机无法实现六条"的逐条回答

| # | Harness VLA 的仿真专属机制 | Pigey 的真机做法 |
|---|---|---|
| 1 | benchmark 谓词当成功判据，oracle 进回路 | 回路内：夹爪传感器 + 腕部图像 + 独立验证器 LLM + Done 前几何计数；打分：人工 |
| 2 | τ 可挂 benchmark 谓词 | `Pick` 的终止 = TAMP 执行完 + `is_grasped`；`VLARollout` 的终止 = 固定 300 步预算，**没有 τ 那样的语义早停**（仿真唯一早停是 LIBERO `done_flag`，oracle 只做终止不做判断）；“无进展则换后端”是 rollout 结束后 LLM 事后裁决——这是 Pigey 比 Harness VLA 粗的地方 |
| 3 | 重试近乎免费 | 重试被计入 3–15 次调用、$0.02–0.50、2–6 分钟；连败 5 次中止 |
| 4 | 回合自动复位 | 人工复位，每任务 5 次（样本小的直接原因） |
| 5 | 不可恢复失败只标注 | 有一个前置守卫（Done 前谓词校验）；**无安全脊髓层**，不可逆动作（把东西放错地方）靠"抓错先放回桌面"的提示词纪律 |
| 6 | 无噪声本体与深度 | 真机深度 FoundationStereo；标签漂移被显式当作一等问题处理（强制重感知） |

**结论**：Harness VLA 笔记的判断"编排逻辑可迁移、难点在成功判据"**被证实**——Pigey 迁移过去了，且成功判据的替代方案（传感器优先 + 独立裁判）真机跑通，代价是 2/150 的误判和分钟级节拍。

## 在本库框架中的位置

### 四段分工映射（[[Embodied failure detection]]）

| 段 | Pigey 的实现 |
|---|---|
| 拦截 | 代码守卫（容器内物体禁 Pick、连败禁 Pick、Done 前谓词违反禁 Done） |
| **裁决** | 传感器覆盖 → 独立验证器 LLM → 几何计数（**三层，全在代码**） |
| 善后 | 重试→重感知→升级另一后端→双向回退；抓错放回桌面；移开遮挡 |
| 转述 | 带类型失败 + `rule_violated` 消息注入下一轮 |

### 四特性记分（团队口径）

| 特性 | Pigey | 备注 |
|---|---|---|
| 失败检测 | ✅ | 三层裁决，真机 2/150 误判 |
| 失败后重试 | ✅ | 阶梯式：同参重试 → 重接地 → 换后端 → 双向回退；比 JiuwenSymbiosis RecoveryRail 的"第一格"完整 |
| 记忆 | ◐ | 仅回合内：对话历史（旧图剪掉、文本保留）+ LLM 自维护的文字场景状态；跨回合记忆与检索**无**（见“上下文与记忆”） |
| 持续学习 | ❌ | future work 提到用验证过的 trace 蒸馏小编排器，未做 |

### 分类学（[[Being-0 - a Humanoid Robotic Agent with VLMs and Modular Skills|Being-0]] 的三格）

**纯 harness**（模型全冻结）格里的**第一个真机实例**；Harness VLA 是同格的仿真实例。

### Harness granularity 的一个反向实例

[[Harness granularity]] 说"挂载粒度必须等于执行器决策粒度"，解法是"复合算子内藏监控"。Pigey 走的是**另一条路**：**把复合算子拆开**——TiPToP 的开环 pick-and-place 被切成 `Pick` 和 `DropAbove` 两个工具，让工具边界正好落在抓取这个可验证点上，边界 rail 就看得见了。两条路的适用条件不同：能拆的拆（抓取有天然的传感器信号），拆不了的（VLA chunk 循环内部）才内藏监控。

## Why it matters（对本库）

1. **具身 harness 的首个真机量化证据。** [[Harness design]] → Harness VLA 给了仿真 +38.6pp；Pigey 给了真机 16.7→97.3（构造性任务集）和 LIBERO-PRO 12.8→53.3（零样本），且**九个配置的推理器全部为正**——增益是回路的性质而非某个模型的。[[Alex Zhang - The Mismanaged Geniuses Hypothesis|MGH]] 在具身侧的第二次、且是真机的验证。
2. **裁决段的参考实现。** 团队基座 JiuwenSymbiosis 的最大洞是"裁决为空"；Pigey 的四层（传感器 > 独立裁判 > 几何计数 > 自省）给了一个**按可判定性分层**的模板，而且"传感器覆盖后端自报"就是一行 `if`。
3. **失败归因表改变了问题的重心。** 裸 VLA 在这 30 个任务上 125 次失败里 124 次是接地和推理，运动只有 1 次 ⇒ 至少在桌面 pick-and-place 域，"再收 10 万条演示"解决不了这些失败。作者由此提出**排序规则**：花机器人数据之前，先量编排能补多少。
4. **异构后端 + 路由 + 双向升级**是新的一格：Harness VLA 是"VLA + 薄解析原语"，Pigey 是"VLA + 完整几何规划器"，两者互为回退。TAMP 给可验证的抓取信号，VLA 给几何规划失效时的闭环鲁棒性——这比"VLA 加几个 move_to"更接近工业上"经典规划 + 学习策略"共存的形态。
5. **验证器误判 2/150 是本库第一个真机测得的"false success"数字**，可直接进 [[Embodied failure detection]] 的量化证据。

## What feels strong
- **实验设计干净**：单变量（只换推理时过程），三个对照（直调 VLA / 开环 TAMP / CaP-Agent0）各隔离一个贡献。
- **失败归因到模式而非只报成功率**，且回路捞回的瞬时错误单独不计——这比多数 harness 论文诚实。
- **验证是保守合并**，且代码里"传感器优先于日志"的立场明确。
- **推理器扫描**把"是回路还是模型"这个常见质疑直接答掉。
- 代码公开、真机栏目齐全（硬件型号、端口、内核、VRAM 占用），可复现性高于 Harness VLA/RPent。
- **提出了 orchestration gap 这个可测量的量**，命名了此前本库用 MGH 描述的现象。

## What feels limited
- **真机任务是作者自设的能力探针**，专挑裸 VLA 结构上做不到的类型（世界知识、否定、条件），97.3 vs 16.7 有相当部分由构造保证；**每任务仅 5 次**，人工评分。
- **LIBERO-PRO 53.3% 绝对值不高**，且低于 Harness VLA 的 82.4%（协议不同，见上）；每任务每推理器仅 10 次。
- **推理时依赖云 API**：真机版硬编码 Anthropic API；感知依赖 Gemini Robotics-ER 云调用；**断网即停**。这是团队选基座时否掉 RPent 的同一条（但程度轻：普通 API 而非编码 agent SDK）。
- **节拍分钟级、成本美元级**，作者自陈不适合低延迟/高速场景。
- **无跨回合记忆、无学习**——Harness VLA 有、HELM 有、它没有；trace 蒸馏只是 future work。
- **感知栈重**：五个模型（Gemini-ER、SAM 2、FoundationStereo、M2T2、cuRobo）+ RTX 5090，TiPToP 本身就是一篇论文。
- 仅桌面单臂刚体 + 少量可变形；可变形全交 VLA 无验证信号。
- `VLARollout` 无语义早停（固定预算），比 Harness VLA 的 τ 粗。
- 无 LICENSE 文件；README 写的是 "Franka Research 3"，论文写 "Franka FR3"（同一型号的两种叫法）。
- 正文“五个工具”与代码“八个工具”、“七个推理器”与“九个 VLM”两处口径不一致；仿真提示词残留 “call `Done`” 而代码已移除该工具。
- **phase 0 未在正文描述**，仿真 53.3% 的构成（裸 VLA 成功 ∪ LLM 修复）需读代码才知道；仿真里编排器实为“VLA 失败后的修理工”，与真机“TAMP 主控”结构相反，两边数字不宜放进同一叙事。
- **`is_grasped` 判定逻辑未公开**（真机侧在私有服务器），提示词里 `< 0.085 m` 的阈值等于夹爪最大开度、近乎无信息。
- 仿真 LLM 拿不到物体尺寸（无 `objects_detail`），真机的尺寸规则无仿真对应物。
- 感知模型写死为闭源 API（Gemini Robotics-ER 1.6），参数量未公开、无本地权重。
- **独立验证器 fail-open**：API 出错即放行，裁决层不可用时不阻塞；且每次改变世界的动作多一次 LLM 调用，论文的 3–15 次调用计数可能未含。
- 规划 LLM 只能看到最近一张图，早先场景仅以文字形式留存；一轮可发多个工具调用与论文“每步一个”的描述不一致。

## Open questions（接本库）
- **独立验证器 LLM 那一层贡献了多少？** 代码有、论文没消融。若去掉它只留传感器覆盖，2/150 误判会变成多少？
- 把 Pigey 的四层裁决搬到 JiuwenSymbiosis 的 `DetectionRail`，哪几层能进 fast 路径（无 LLM）？直觉：传感器覆盖 + 几何计数可以，独立裁判不行。
- Harness VLA 的跨回合记忆加到 Pigey 上，LIBERO-PRO 能从 53.3 涨到多少？这是**隔离"记忆贡献"的最干净实验**（同一零样本地板）。
- 团队的 2×2 配对实验（harness 价值是否依赖执行器范式）：Pigey 给了半个答案——同一回路套在 TAMP 上（80→100 对照类、0→90+ 推理类）和套在 VLA 上都为正，但两个后端**在同一回路里互为回退**，没有分开跑。
- **phase 0 单独贡献多少？** 关掉 `CORTEX_NO_PHASE0` 对照跑一遍，就能把 53.3% 拆成“裸 VLA”与“LLM 修复”两份——作者没做。
- 真机 `is_grasped` 若换成公开可查的判定（Robotiq 物体检测寄存器 / 闭合宽度阈值），2/150 的误判会不会上升？传感器层误判目前无数字。
- 用 **SAM 3** 替掉 Gemini-ER + SAM 2 是否可行：规划 LLM 接过“枚举场景”这一步、丢掉 `gemini_atoms`，换来本地可跑；接地失败形态从“标签不在列表”变成“返回空/错实例”，要重新设计裁决。
- 失败归因“运动只占 1/125”在**接触密集**任务（插拔、拧、拆解）上还成立吗？PHR-VLA 的拆解任务里裸 SmolVLA 63.3% 的失败大概率不是接地问题。

## Related
- [[Zhang et al. - Harness VLA Steering Frozen VLAs into Reliable Manipulation Primitives via Memory-Guided Agents]] — 仿真对照组；协议差异见对照表
- [[Embodied failure detection]] — 四段分工的真机实现；false-success 2/150
- [[Harness granularity]] — "拆开复合算子"这条反向路径
- [[Harness development base - JiuwenSymbiosis selection and build plan]] — 裁决段参考实现；四特性记分
- [[Harness design]] — 概念母页
- [[Alex Zhang - The Mismanaged Geniuses Hypothesis]] — 被真机验证的假设
- [[Physical Intelligence - pi0.5 a VLA with Open-World Generalization]] — 被包的冻结 VLA（DROID / LIBERO 两个 checkpoint）
- [[Being-0 - a Humanoid Robotic Agent with VLMs and Modular Skills]] — 分类学三格
- [[Zeng et al. - HELM Harness-Enhanced Long-horizon Memory for VLA Manipulation]] — 有记忆、有训练粘合层的对照
- [[RLinf - RPent Recursive Physical Agent Framework]] — "harness 住哪"的对照（markdown vs 代码守卫）
- [[Real-robot evaluation]] — 每任务 5 次、人工评分、复位成本
- [[Future embodied Agent framework - integrated view]] — 整合入口

## tags
#agentic #harness #vla #frozen-policy #orchestration #orchestration-gap #failure-detection #verification #retry #tamp #tiptop #pi05 #real-robot #franka #libero-pro #princeton #together-ai
