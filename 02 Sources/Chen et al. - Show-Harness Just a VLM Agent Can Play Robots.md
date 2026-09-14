# Chen et al. - Show-Harness: Just a VLM Agent Can Play Robots

## Metadata
- **Type**: source note
- **Format**: arXiv preprint (cs.RO), **v1 2026-09-09**；项目页 https://showlab.github.io/Show-Harness/；HF Daily Paper 147 upvotes（2026-09-14 查）
- **Authors**: Yanzhe Chen\*, Zechen Bai\*, Zhijun Cao\*, Wenzheng Zeng\*, Kevin Qinghong Lin, Yiqi Lin, Guoqiang Liang, Kevin Yuchen Ma, Qiming Huang, **Mike Zheng Shou**†（\*四人共一）
- **Organization**: **Show Lab @ National University of Singapore**
- **arXiv**: [2609.10522](https://arxiv.org/abs/2609.10522)
- **Code**（2026-09-14 核实）: **已开源** [showlab/Show-Harness](https://github.com/showlab/Show-Harness)，**Apache-2.0**，312 stars，仓库 2026-09-07 建、09-10 最后推送。174 个 Python 文件约 1.8 MB：`core/`（runner / VLM client / 角色提示）、`plugins/`（九个插件各一目录）、`interpreters/`（Franka 阻抗 / Piper 关节流 / ManiSkill / Isaac Lab）、`gumi/`（浏览器采集器）、`train/`（LlamaFactory LoRA 管线）。**这一簇里开源完整度最高**（对照 Pigey 无 LICENSE、RPent 无测试）
- **Weights / data**: HF [showlab/Show-Harness-VLMs](https://huggingface.co/showlab/Show-Harness-VLMs) 六个 LoRA adapter（Qwen3.5 0.8B/2B/4B/9B、Gemma4-e4b 各一个真机 `ft` split，+ 一个 `qwen3_5_2b_sim`）；HF [showlab/Show-Harness-Data](https://huggingface.co/datasets/showlab/Show-Harness-Data) Apache-2.0，真机 164 条 + 仿真 230 条
- **Raw tier**: URL-only（PDF 9.5 MB 临时自读后清理；arXiv HTML 正文亦读）
- **Verification status**: 机制 / 三张结果表 / 能力分析 / 插件消融 / 动作表示消融 **PDF + HTML 自读核实**；`configs/primitives_*.yaml`、`prompts/v4/*`、`plugins/{action_chunk,variable_step,rotation}/plugin.py`、`plugins/README.md`、`docs/finetuned.md` **代码级核实**（2026-09-14 确认轮）；`core/` 主循环未逐行审计
- **Related**: [[Zhang et al. - Harness VLA Steering Frozen VLAs into Reliable Manipulation Primitives via Memory-Guided Agents]], [[Galanti et al. - Pigey Addressing the Orchestration Gap in Generalist Robots via Physical Agency]], [[Embodied Brain Models]], [[Harness design]], [[Harness granularity]], [[Harness development base - JiuwenSymbiosis selection and build plan]], [[Being-0 - a Humanoid Robotic Agent with VLMs and Modular Skills]], [[Embodied Cerebellum Models]], [[Real-robot evaluation]]
- **Tags**: #agentic #harness #vlm-as-brain #semantic-action #atomic-action #discrete-action-space #zero-shot #lora #small-vlm #gui-teleop #real-robot #nus #showlab

## Summary

**核心主张：VLM 直接控制机器人缺的不是能力，是接口。** Show-Harness 把动作空间压成一组**离散、零参数的语义单元**（六个方向各走一步、绕竖轴转一档、开合夹爪、完成），VLM 每步只选一个 token，一个**本体专属的确定性解释器**把它变成一小段有界末端运动（默认 2 cm）。VLM **直接对每一步物理决策负责**，下面**没有任何学习策略**——这是它与本库其他 harness 工作最根本的区别。

同一接口撑起两种模式：**ZS**（前沿 VLM 零样本当控制器，默认 Gemini 3.1 Pro）与 **FT**（Qwen3.5-2B LoRA，2 小时单卡，用 VLM 原生词表预测动作 token、无动作头）。再加一个 **GUMI**：因为动作空间离散且人能直接操作，做成浏览器界面，人用键盘、计算机使用 agent 用 GUI、VLM 直接预测，三者在同一动作空间产生演示，不需要遥操硬件。

> **本库定位一句话**：[[Zhang et al. - Harness VLA Steering Frozen VLAs into Reliable Manipulation Primitives via Memory-Guided Agents|Harness VLA]] 的"责任重新分配"框架里**最极端的一端**——连接触密集的局部也不留给 VLA，VLM 一步一步自己走；也是 [[Embodied Brain Models]] 里那条被判"不会成为主流"的"直接 LLM 操控机械臂"路线**带着真机数字回来了**，但"时效差"那半句并未被推翻。

## 原子动作集：论文 11 个词，代码 9 个 token

| 类别 | 单元 | 论文 | 代码实际 |
|---|---|---|---|
| 平移 | `MV_FWD` / `MV_BACK` / `MV_LEFT` / `MV_RIGHT` / `MV_UP` / `MV_DOWN` | 6，每个 = 一步 `step_m`（默认 2 cm） | 6 |
| 旋转 | `ROTATE_CW` / `ROTATE_CCW`，论文称"各配一个轴参数 x/y/z" | 2 词，展开 6 | **只有竖轴偏航**：两份 `primitives_*.yaml` 只定义 `yaw_step_rad`（0.15 rad ≈ 8.6°）；Piper 配置注释明说"旋转工具在 Piper 上禁用，ROTATE 从不提供给 VLM"。**无轴参数** |
| 夹爪 | `GRASP` / `RELEASE` | 2 | 2 |
| 终止 | `DONE` | 1 | 1；双臂版另加 `STILL`（一臂原地等另一臂） |

**FT 模式提示词枚举的就是 9 个**：6 平移 + GRASP + RELEASE + DONE，**没有旋转** ⇒ 论文的"90° 旋转外推"实验只能是 ZS 跑的。

**每个单元零参数。** ZS 的输出契约是 `{"decision": "ONE_ACTION", "reasoning": "一句话"}`，`decision` 只能是词表中一个 token，没有距离 / 速度 / 力 / 角度任何数值字段；FT 直接输出裸 token。VLM 影响幅度只有三条**间接**通道，全由插件承担：

| 通道 | VLM 提供什么 | 谁定物理量 |
|---|---|---|
| **Adaptive Step**（`variable_step`） | 二值标记 `WRIST: YES/NO`（目标是否在腕视野） | 插件按规则选步长：目标不在腕视野 / 正在 `MV_UP` / 末端离桌 > 10 cm ⇒ 5 cm 粗步，否则 2 cm 细步。**VLM 不能说"走 3 cm"** |
| **Action Chunking**（`action_chunk`） | 目标远时可写一行 `PLAN: MV_FWD, MV_FWD, MV_DOWN`，≤3 个 MV 单元 | 序列由 VLM 定但每个仍零参数，开环顺序执行；目标进腕视野后退回一步一调用 |
| **Rotation**（`rotation` 插件） | `ROTATE_CW` 或 `ROTATE_CCW` 二选一 | 角度 = 配置常量，轴 = 竖直；插件在**代码里**用累计偏航角补偿腕视野的旋转，VLM 不需知道 |

⇒ 论文说"VLM 直接负责细粒度物理决策"，准确含义是 **VLM 定方向与时机，幅度全由确定性规则定**。想多走一点只能再输出一次同样 token；想更精细只能改 `step_m`——这就是"改 1 cm 不重训、堆叠 60→82"实验的实质。对照 Harness VLA 的 `move_to(pose)` / `vla_act(prompt, τ)` 与 Pigey 的 `Pick(label)`：**那两篇的原子动作带参数、VLM 供语义或几何参数**；Show-Harness 把参数全拿掉，**用重复调用换表达力**，代价是每 episode 30–50 步、每步一次 VLM 调用。

**正负号逐台标定**：Franka 配置注释写左右方向"与原仿真假设相反"、旋转方向"从真机 rollout 核出来，原来反了"；Piper 的左右标 UNVERIFIED；`docs/finetuned.md` 警告过一个 FWD/BACK 被换过的语料版本。"本体无关"成立的前提是每台机器人工把十几个符号的物理含义对齐一遍。

## 系统：三段九插件

每个插件挂在感知 / 推理 / 动作三段之一，**一个布尔开关，关掉后主循环字节级不变**（`plugins/README.md` 契约：所有 hook 返回空 / 恒等），单插件消融因此干净。

| 段 | 插件（论文名 → 代码名） | 做什么 |
|---|---|---|
| 感知 | Multi-View Guidance → 提示词脚手架 + `wrist_marker` | 告诉 VLM 全局视角管定位、腕视角管细对齐；产出共享的 `WRIST: YES/NO` 信号 |
| 感知 | Proprioception → `proprioception` | 把夹爪高度、一步位移、"还高着先下降"的阶段提示、接触、夹爪状态**写成文字** |
| 推理 | Subtask Planning → `subgoal` | 先让 VLM 当规划器分解出带**可视检验完成判据**的子任务序列；执行中每步由 VLM 自己对照图像判完成并推进 |
| 推理 | Situated Planning → `deepplan` | 把不确定分支**留空**，等证据可见时再解析、更新剩余计划（条件任务用） |
| 推理 | Action Chunking → `action_chunk` | 见上表 |
| 推理 | Adaptive Step → `variable_step` | 见上表 |
| 推理 | Visual Prompt → `affordance` | 另起一次模型调用把模糊的语言目标画成图上接触点标记，后续推理接地到标记（语言难指明交互区域时启用） |
| 动作 | Action History → `mem_text` | 最近 5 步动作 + "别在相反方向间震荡"规则，充当轻量时序记忆 |
| 动作 | Failure Recovery → `recovery`（FT 模式另加 `auto_release`） | 检出空抓 ⇒ 重开夹爪、回滚到抓取子任务 |

代码里还有论文表里没有的：`rotation`、`smooth`（min-jerk 设定点斜坡）、`dagger`（人实时接管）、`video_ref`（视频演示 in-context）、`ego` / `wrist_frame`（方向系适配）、`action_ablation`（动作表示消融专用）。

**两个角色、一个模型**（ZS）：同一 VLM 先当 planner 分解任务，再当 controller 每步选 token；controller 提示词 = 任务 / 当前阶段 / 目标 / 接触点 / 完成判据 / 夹爪状态 / 动作历史 / 本体文字 + 一段"方向判定规则"（目标在夹爪左 ⇒ `MV_LEFT` 等）+ 输出契约。

## 两种模式

| | **ZS 零样本** | **FT 微调** |
|---|---|---|
| 模型 | Gemini 3.1 Pro（默认，中等 thinking）；也扫了 GPT-5.6-sol / GPT-5.6-luna / Claude Opus 5 / Gemini 3.6 Flash | **Qwen3.5-2B** + LoRA（只训语言层线性层，≈1% 参数；视觉编码器与投影冻结） |
| 输出 | JSON `{decision, reasoning}` | 裸 token，用 VLM **原生词表**，无动作头、无特殊 token |
| 上下文 | 全插件 | **刻意最小**：任务 + 双视图 + 最近几步动作，无规划器 |
| 训练 | 无 | 7.9K 单臂样本、40 epoch、lr 1e-4 cosine、bf16、256² 视图、batch 32；**单 H200 < 2 小时**，24 GB 卡可跑 |
| 部署 | 云 API，每步一次调用 | 本地 vLLM，单 RTX 5090 |

## GUMI：一条演示训两种策略

动作空间离散 ⇒ 每个单元对应一个按键 / 按钮。GUMI 每步记 (观测, 语义单元) 对，**同时**保留解释器执行出的底层指令与轨迹 ⇒ **同一条演示既能训语义 token 策略，也能训连续控制 VLA**——这是下文"同数据对照"成立的前提。支持逐步 / 队列 / 单双臂 / 人机混采（人可中途接管纠正 agent）；远程可采。

**语料**（表 3）：

| 平台 | 任务 | 条 | 步 |
|---|---|---|---|
| Franka 7-DoF | 9 | 101 | 4969 |
| AgileX Piper 6-DoF | 10 | 63 | 2805 |
| **真机合计** | 19 | **164** | 7774 |
| ManiSkill | 1 | 100 | 5840 |
| RoboLab | 12 | 130 | 7683 |
| **仿真合计** | 13 | **230** | 13523 |

另有 19 条 Franka **专门录的抓取恢复片段**（594 步）：夹爪从偏位开始、空抓后抬起重逼近，只保留纠正段。

> **仿真只做数据源、不做评测场**：论文**没有任何仿真 benchmark 数字**，全部成功率来自真机。ManiSkill / Isaac Lab 解释器与 GUMI `--sim` 在代码里存在，但只用于采集与开发。

## Results（全部真机）

### 表 2：三级泛化（10 任务 × 10 次；FT 的 teddy / chess 为训练未见物体）

| | π0.5 | GR00T | Harness VLA | Goal-VLA | CaP-X | RATS | **ZS** | **FT** |
|---|---|---|---|---|---|---|---|---|
| 跨任务均值 % | 39 | 35 | 50 | 13 | 44 | 57 | **89** | **86** |
| 跨环境均值 %（背景 / 光照 / 视角 / 干扰物） | 40 | 34 | 63.8 | 15 | 52.5 | 65 | **100** | **88** |
| Sim-to-real（仅用 230 条仿真演示训，真机评 20 次） | 0/20 | 0/20 | — | — | — | — | — | **13/20** |
| 跨本体均值 %（Franka + AgileX 各 50 次） | 41 | 36 | 49 | 11 | 43 | 52 | **93** | **87** |

- π0.5 / GR00T 用**同一批 164 条 GUMI 演示**转成连续末端轨迹微调（受控对照）。
- ⚠️ **FT 列混了两个 checkpoint**：主体是真机语料训的 `ft` split；Sim-to-real 那一行换成仿真语料训的 `sim` split（一个 adapter 覆盖两个仿真器）。**不是"仿真预训练再真机微调"的两阶段**，正文未明写，来自 `docs/finetuned.md` 的 split 命名。
- FT 最弱的一格：**视角变化 13/20**——离散方向定义在参考视图上，视角一变方向语义就漂。

### 能力分析（§5.3）

| 实验 | ZS | FT | π0.5（同数据） | 说明 |
|---|---|---|---|---|
| 堆叠 / 插孔，步长 2→1 cm **不重训** | 60→**82** | 40→**65** | 18，加训细粒度数据后才 62 | 精度是解释器参数，不是策略要学的 |
| 只在 0° / 45° 演示上训，测未见 90° | 稳 | **70** | 20 | 重复旋转单元组合出未见角度 |
| 工作空间从中心 25% 扩到边缘 90% | 缓降 | 缓降 | 陡降 | 视觉接地的离散决策对位置分布更鲁棒 |
| 两正交平移合成斜向一步 | 步数大减、成功率不掉 | | | 新组合在解释器层加，不重训 |
| 双臂（tidy table / pass banana，各 20 次） | 联合预测两臂 token 显著优于两个独立单臂 agent，且零碰撞 | | | |
| 推理任务（三杯找方块 / 摆字母 SHOW） | **85**（开 Situated Planning） | 10 → **70**（喂 Gemini 生成的子任务指令） | 0 → 5 | **接口把推理与控制切干净**：小模型控制 + 前沿模型规划的混合部署顺理成章 |
| 看人 / 机器人视频演示后按序收拾 | 无演示 20%；有演示 **20/20** | 95%（给规划器抽的任务大纲） | | 视觉 in-context learning |

### 插件消融（§5.4.3，真机 Franka，ZS Gemini 3.1 Pro，五个 Plate 任务 leave-one-out）

- **去本体感受文字反馈掉得最多**（视觉线索模糊的物体上）；**去子任务规划 → 60%**，模型拖着物体走不抬起；**去动作历史**在相反方向间震荡、超时增多；**去失败恢复 → 72%**，主因空抓未检出。
- **动作分块**：关掉保持 96% 但调用次数增；全程强开 → 74%。**自适应步长**：细步唯一精确但超时，粗步唯一快但过冲；按腕视野切换 96% / 平均 30 步。⇒ 两者是效率项，**全开反而掉成功率**。
- **Visual Prompt** 常规任务无效（支持默认关），handle-aware 抓取 40→85；**Situated Planning** 常规任务无效，三杯找方块 35→85。

### 动作空间表示消融（§5.4.4）——本篇最值得记的设计知识

只换六个平移单元的表示，其余不动，Gemini 3.1 Pro，20 次：

| 变体 | 结果 |
|---|---|
| (A) 语义名 + 文字约定（默认） | 基准 |
| (B) 只有语义名 | 能用但低效 |
| (C) **任意符号 + 文字约定** | **几乎与默认相同** |
| (D) 任意符号、无约定，模型自己探测前后图推映射 | **1/20 成功，映射只对 23.3%** |

⇒ **约定提供绝大部分接地，语义名只是有用的先验**。⚠️ 这个结论**建立在零参数动作上**——VLM 学的是"符号 → 物理效果"的离散映射；一旦原子动作带上距离 / 角度参数，"约定即接地"未必成立。

### 推理器与骨干扫描

- ZS 成绩随前沿模型能力单调，**加大 thinking 主要减冗余步数、几乎不涨成功率**且拉长墙钟（GPT-5.6-sol 尤甚）；所有模型 >98% 输出合法 token。棋子任务拆解显示**规划不是瓶颈，错误集中在细粒度抓放**；给目标 bbox 坐标进一步提升。
- FT 骨干：**2B 已强**，1B 级在目标附近反复微调而超时，更大只在堆叠 / 插孔有用；网球任务上小模型反赢大模型（"及时纠正比精度重要"）——暴露离散步的时序瓶颈。

## 在本库框架中的位置

### 对 [[Embodied Brain Models]]：复活一条被判死的路线，但只复活一半

那页"已退出主流的子分支"写着 **~~直接 LLM 操控机械臂~~：过分依赖 LLM 自身能力，时效差，不会成为主流**。Show-Harness 就是这条路线，真机比 Harness VLA 高 39 个点。两句话都要写进去：**接口设计到位后这条路线活了**（离散零参数 + 文字约定 + 确定性解释器 + 本体文字反馈）；**"时效差"没被推翻**——全部任务是 2 cm 一步的桌面抓放，50 步上限，每步一次云端调用，论文只报步数不报墙钟。

同页硬伤表"推理延迟 → 蒸馏小 VLM 是出路，**未成熟**"：FT 模式是对这条出路的一次验证——2B、本地单卡、2 小时训、同数据下压过 VLA。该判断需更新为"有初步真机证据"。

### 对 [[Zhang et al. - Harness VLA Steering Frozen VLAs into Reliable Manipulation Primitives via Memory-Guided Agents|Harness VLA]] / [[Galanti et al. - Pigey Addressing the Orchestration Gap in Generalist Robots via Physical Agency|Pigey]]：接口粒度轴的最底端

| | Harness VLA | Pigey | **Show-Harness** |
|---|---|---|---|
| 原子动作 | `move_to(pose)` 等解析原语 + `vla_act(prompt, τ)` | `Pick(label)` / `DropAbove(label)` / `VLARollout(subgoal)` | `MV_*` / `ROTATE_*` / `GRASP` / `RELEASE` / `DONE` |
| 带参数？ | 是（位姿、prompt、终止判据） | 是（标签、子目标串） | **否** |
| 下层有学习策略？ | 有（冻结 π0.5 管接触） | 有（π0.5 + TAMP） | **无** |
| VLM 管到哪一层 | 什么 + 何时 + 交棒点 | 什么 + 何时 + 哪个后端 | **每一步怎么动** |
| 每 episode VLM 调用 | 数次 | 3–15 | **30–50** |
| 真机 | 无 | 有 | 有 |
| 跨回合记忆 | 有 | 无 | 无 |

Harness VLA 反对扩库、主张"库小而固定、让 agent 学编排"；Show-Harness 把库缩到 9 个零参数符号，是这一主张的极限形式。**代价对称**：库越小、参数越少，VLM 每步的认知负担越轻、接地越可验证，但**步数、延迟、对连续轨迹任务的表达力**同时恶化（倒水、擦拭、跟踪运动物体做不了）。

### 对 [[Harness granularity]]

本页两条路径（复合算子内藏监控 / 拆开复合算子）都假设执行单元内部有一段 rail 看不见的循环。Show-Harness 把这个问题**消解**了：执行单元就是 2 cm 一步，rail 天然站在每一步边界上，`recovery` 插件在每步之后检查空抓。代价是把"during"的成本全部换成了 VLM 调用次数。

### 对团队（[[Harness development base - JiuwenSymbiosis selection and build plan]]）

- **插件即 rail 的参照实现**：一个布尔、关掉字节级不变、各自带提示词与测试——正是选基座时看重的"基线是配置不是代码"，且比 JiuwenSymbiosis 多了"disabled 恒等"这条可验证契约。
- **FT 模式是"蒸馏小模型"路线的现成配方**：LlamaFactory LoRA、原生词表、无动作头；2B 本地可跑 ⇒ 小脑侧候选（见 [[Embodied Cerebellum Models]]）。
- **同数据对照的方法学可搬**：GUMI 一条演示同时产语义 token 与连续轨迹，让"接口 vs 模型"能被隔离——团队 2×2 配对实验的数据侧前提。
- **不搬的**：ZS 全程云 API；2 cm 离散步天花板；视角泛化弱。

### 分类学（[[Being-0 - a Humanoid Robotic Agent with VLMs and Modular Skills|Being-0]] 三格）

ZS 模式落**纯 harness**格（模型全冻结），与 Pigey 同格但**下面没有任何学习策略**；FT 模式落**模型方案**格（端到端训一个策略），但训的是 VLM 原生词表上的 token 分类器而非动作头——三格里没有现成位置，是"用 harness 的接口定义训练目标"的新形态。

## Why it matters（对本库）

1. **给 harness 簇补上"接口粒度"这根轴**。此前两篇都是"VLM 定什么 + 冻结策略定怎么"，本篇把"怎么"也交给 VLM，并给出了这么做的收益（跨本体只换解释器、步长改配置即涨精度、旋转可外推）与代价（步数、延迟、连续任务做不了）。
2. **动作空间表示消融是干净的设计知识**：约定 > 名字 >> 自探索。对任何要给 VLM 暴露原子动作的团队都是直接可用的结论，附带一个前提（零参数）。
3. **"接口而非容量"的受控证据**：同 164 条演示，2B 语义 token 策略 86% vs π0.5 39%。⚠️ 但见 limitations 第一条。
4. **推理与控制的可分离性**：FT 单独 10%、喂规划器子任务后 70%，是"前沿模型规划 + 小模型控制"混合部署最直接的证据。
5. **Embodied Brain Models 两处判断需更新**（见上）。
6. **开源完整度**：代码 + 6 个 adapter + 语料 + 训练管线全在，Apache-2.0，是这一簇里团队最可能直接跑起来的参照物。

## What feels strong
- 问题定位清楚：VLA "以语义换控制"、层级系统"以控制换语义"，本篇要两者兼得，且给了可操作的接口定义。
- 插件契约（disabled 恒等）让 leave-one-out 消融真正只动一个变量。
- 动作表示消融设计巧妙，尤其 (C) 任意符号 + 约定这一格。
- 同数据对照 + GUMI 双记录，方法学上比多数 harness 论文严格。
- 双模式 + 双本体 + 双仿真器采集 + 完整开源。

## What feels limited
- **164 条演示对 VLA 微调太少**。π0.5 / GR00T 通常用数百到数千条微调，39% / 35% 很可能低估；对照"同数据"公平，"数据量"只对语义 token 方法友好。
- **任务简单**：十个任务全是单物体进单容器，最难是棋子；堆叠 / 插孔各一组；无铰接、无工具使用；双臂仅两任务。
- **Harness VLA 真机基线复现存疑**：原文只有仿真、代码是 RPent，作者在真机跑出 50% 怎么搬的未说明。
- **速度**：每步一次 VLM 调用、平均 30 步，Gemini 3.1 Pro 每次数秒 ⇒ 一次抓放分钟级；**论文只报步数不报墙钟**。
- **步长即分辨率**：2 cm 离散步做不了连续轨迹任务；网球任务小模型赢大模型暴露时序瓶颈。
- **旋转口径不一致**：论文"配轴参数"，代码只有竖轴偏航且 Piper 禁用；FT 无旋转。
- **FT 列混两个 checkpoint**（`ft` / `sim`）未在正文说明。
- 每任务 10 次、无置信区间；视角变化 FT 13/20。
- 正负号逐台手工标定，"本体无关"有隐藏人工成本。
- 骨干扫描只覆盖 Qwen3.5 一族 + Gemma / InternVL 少数点。

## Open questions（接本库）
- 把 π0.5 / GR00T 的微调数据加到几百条，86 vs 39 的差距还剩多少？这是"接口 vs 容量"结论的真正检验。
- **"约定即接地"在带参数的原子动作上成立吗？** 把 `MV_FWD` 换成 `MV_FWD(d)`、让 VLM 出 d，(C) 格还能追平 (A) 吗？——直接决定团队原语库该不该带参数。
- FT 控制 + 前沿规划的混合部署，端到端墙钟是多少？论文数据已暗示可行但没跑。
- 2B token 策略能进 fast 路径（无 LLM 规划器）当小脑吗？它的每步延迟（本地 vLLM）与 [[Harness granularity]] 的多速率栈如何对齐？
- 视角变化 13/20 能否靠 `ego` / `wrist_frame` 插件（代码有、论文未评）补上？
- GUMI 的"人机混采"产出的数据，在 [[Robot data engine]] 的代理层级里算哪一级金标准？

## Related
- [[Zhang et al. - Harness VLA Steering Frozen VLAs into Reliable Manipulation Primitives via Memory-Guided Agents]] — 责任分配框架；本篇是其极端一端；被本篇拿去当真机基线（复现存疑）
- [[Galanti et al. - Pigey Addressing the Orchestration Gap in Generalist Robots via Physical Agency]] — 同为真机纯 harness，但下层有学习策略；接口粒度对照
- [[Embodied Brain Models]] — "直接 LLM 操控机械臂"子分支与"蒸馏小 VLM"硬伤两处需更新
- [[Harness granularity]] — 粒度轴最底端：执行单元 = 一步，during 被消解
- [[Harness design]] — 概念母页；插件 = load-bearing 部件的可开关实现
- [[Harness development base - JiuwenSymbiosis selection and build plan]] — 插件契约、FT 配方、同数据对照方法学
- [[Being-0 - a Humanoid Robotic Agent with VLMs and Modular Skills]] — 分类学三格
- [[Embodied Cerebellum Models]] — 2B 本地 token 策略作小脑候选
- [[Physical Intelligence - pi0.5 a VLA with Open-World Generalization]] — 被当基线（同数据微调）
- [[Real-robot evaluation]] — 每任务 10 次、无 CI、自设任务
- [[Robot data engine]] — GUMI 人机混采

## tags
#agentic #harness #vlm-as-brain #semantic-action #atomic-action #discrete-action-space #zero-shot #lora #small-vlm #qwen3-5 #gemini #gui-teleop #gumi #real-robot #franka #agilex #nus #showlab
