# Being-0: A Humanoid Robotic Agent with Vision-Language Models and Modular Skills

## Metadata
- **Type**: source note
- **Format**: arXiv，**2025-03**（v1 2503.12533）；项目页 beingbeyond.github.io/Being-0
- **Authors**: BeingBeyond / 北大等（作者行未逐字核对）
- **arXiv**: [2503.12533](https://arxiv.org/abs/2503.12533)
- **Raw tier**: URL-only（HTML 正文自读）
- **Verification status**: 组件归属 / Connector 训练方式 / 部署边界 / 主要结果与消融 **自读 HTML 核实**（2026-08-06）
- **⚠️ 时效标注**：**团队后续已转向端到端基座模型**（Being-H0 → H0.5 → H0.7），**该 agent 框架未见延续**；见下"范式迁移"节
- **Related**: [[Harness design]], [[Zhang et al. - Harness VLA Steering Frozen VLAs into Reliable Manipulation Primitives via Memory-Guided Agents]], [[BeingBeyond - Being-H0.7 a Latent World-Action Model from Egocentric Videos]], [[Future embodied Agent framework - integrated view]], [[Embodied model function evolution - generalization as the master line]]
- **Tags**: #embodied-agent #humanoid #agent-framework #hierarchical #harness #connector #cloud-edge

## Summary

**分层具身 agent 框架**，跑在全尺寸人形（灵巧手 + **主动视觉**）上，长程任务**平均完成率 84.4%**。

它的血统是 **LLM agent** 而非机器人学：**框架改编自 Cradle**（一个做开放世界游戏与软件操作的 GPT-4o agent 框架）——原话 *"we **adapt the Cradle framework** to build a generalist agent for humanoid robots"*。

**各层归属（这是判断它属于哪一类的关键）**：

| 层 | 是什么 | 来源 |
|---|---|---|
| **FM** | **GPT-4o**：指令理解 / 任务规划 / 推理 | 现成，**云端** |
| **Agent 框架** | 改编自 Cradle | 现成 |
| **Connector** | **VideoLLaMA2** 微调的轻量 VLM | **自训 = 核心贡献** |
| **技能库** | locomotion（joystick 指令）+ manipulation | **遥操 + 模仿学习**获得（ALOHA 系方法） |

## 为什么必须训一个中间层（本文的核心论证）

直接把 FM 接到技能库上不行，原因有二：
1. **延迟**——人形双足**本身不稳定，需要频繁调整运动指令做误差修正**，开环指令序列行不通；而 GPT-4o 走云服务延迟高
2. **具身场景理解差**——GPT-4o *"struggle with accurate 3D scene understanding, often failing to estimate the direction and depth of navigation targets"*，直接导致错误的技能规划

**Connector** 用**室内导航第一视角图像 + 语言指令 + 物体标签 + bbox 标注**训练，把具身知识蒸进轻量 VLM。功能：grounded skill planning、闭环控制、物体检测。**板载推理约 1 秒**，显著优于 GPT-4o 云服务延迟。

### pose adjustment：与 re-staging 的独立收敛
导航可能停在**对后续操作不利的位姿**。Connector 不只预测物体 bbox，还预测**机器人相对物体的最佳对齐方向**；偏了就触发复合调整动作。抓取任务上带来 **>0.4 的成功率增益**。

> **值得记的收敛**：这与 [[Zhang et al. - Harness VLA Steering Frozen VLAs into Reliable Manipulation Primitives via Memory-Guided Agents|Harness VLA]] 的 **re-staging**（改 approach pose/viewpoint 把机器人送进 VLA 能力域）是**同一机制**。Being-0 是 **2025-03**、Harness VLA 是 **2026-07**，不同团队、不同路线，**独立收敛到"交棒前先把机器人摆到对下游技能有利的位姿"**。这比任一单篇更能说明该机制是必需的。

### 部署边界：极简云端
*"With all components, **except the FM**, deployable on low-cost onboard computation devices."* ⇒ **只有 FM 在云，其余全在端**——比本库 [[Future embodied Agent framework - integrated view|整合视图]]的划分更激进（后者云端还有世界模型与记忆），且是**真机验证过的**。

## Results（核实）
- **长程任务平均完成率 84.4%**（全尺寸人形 + 灵巧手 + 主动相机，大型室内环境）
- **无 Connector 消融**：移动速度差 **4.2×**，远距离导航**持续失败**（GPT-4o 单独频繁把运动方向规划错）
- **主动相机 vs 固定相机**：**没有任何固定俯仰角能同时在导航与操作上都好**；主动相机在所有任务上取得完美成功率
- 导航稳健性：同房间目标 **1.0**；未见布局带障碍**下降 0.2**；跨房间 **0.8**

## 分类学位置：harness 与模型方案之间

| 类型 | 贡献是什么 | 模型是否全冻结 | 例子 |
|---|---|---|---|
| **纯 harness** | 脚手架本身 | ✅ | Harness VLA |
| **harness + 训练的粘合层** | 框架 + 一个专训中间件 | ❌ 中间层要训 | **Being-0**（Connector）、HELM（SV） |
| **模型方案** | 架构即模型 | ❌ 端到端训 | π0.5 / GR00T / G0.5 |

> **这一格的存在说明:纯 harness 有天花板。** 当基座模型在**某个具体能力**上不行（此处 = 3D 场景理解 + 延迟），**prompt / 记忆 / 检索补不上，必须训个东西**。
>
> 按 [[Harness design]] 的 **load-bearing** 原则：Connector 编码的假设是"GPT-4o 的具身场景理解与延迟都不可靠"，而它**用训练而非 prompt 来承重**。
>
> **对本库的启示**：整合视图里的"**计划级接口**"可能不能只是一个协议——**可能得是一个训练出来的翻译器**，因为"语义计划 → 可执行技能指令"这个翻译需要 3D 场景理解，而那恰是云端 FM 最弱的一环。

## ⚠️ 范式迁移：同一团队一年内换了边

| 时间 | 工作 | 范式 |
|---|---|---|
| 2025-03 | **Being-0** | 分层 **agent 框架**（GPT-4o + 训练的 Connector + 模块技能库） |
| 2025-07 | Being-H0（ICML 2026） | **VLA**，大规模人类视频预训练（UniHand） |
| 2026-01 | Being-H0.5 | 跨本体旗舰 **VLA** |
| 2026-04 | [[BeingBeyond - Being-H0.7 a Latent World-Action Model from Egocentric Videos\|Being-H0.7]] | **latent WAM** |

**Being-H0.7 全文 0 次提及 Being-0 / agent framework / Connector / skill library / GPT-4o**（已核实）。

**同一现象，两种归因**：
- **Being-0**：长程做不好 ← **FM 与技能之间有鸿沟**（系统结构问题）⇒ 加训练的中间层
- **Being-H0.7**：长程/动态做不好 ← **稀疏动作监督诱导 shortcut mapping**，缺 dynamics/contact/task-progress 表征（表征学习问题）⇒ 在单个策略内部加 latent 世界建模

> **判断（本库综合）**：这是"**系统派 vs 模型派**"的钟摆，与 [[Galaxea - G0.5 Autoregressive VLM-as-Actor VLA|Galaxea G0→G0.5 反转]]同类，是**一个严肃团队用行动给出的瓶颈判断**——他们认为当前瓶颈在模型层。
>
> **但要公平**：Being-0 的论证（误差累积 + 模块延迟不一）**没有被驳倒，只是被绕开**（单体策略无多模块延迟问题）。而且 Being-H 修的恰是 Being-0 里**用现成方法凑出来的技能库**（H0 卖点即"需要少得多的遥操演示"）⇒ 也可读作"**先搭系统，再回头把最弱的一层做扎实**"，而非否定系统层。对本库的 Agentic 主线（泛化载体：模型→组合），这是一个**反方向的证据点**，应如实记录。

## Related
- [[BeingBeyond - Being-H0.7 a Latent World-Action Model from Egocentric Videos]] — 同团队的后续范式
- [[Zhang et al. - Harness VLA Steering Frozen VLAs into Reliable Manipulation Primitives via Memory-Guided Agents]] — re-staging 与 pose adjustment 的独立收敛
- [[Zeng et al. - HELM Harness-Enhanced Long-horizon Memory for VLA Manipulation]] — 同属"harness + 训练粘合层"
- [[Harness design]] — load-bearing 原则
- [[Future embodied Agent framework - integrated view]] — 计划级接口 / 云端边界
- [[Embodied model function evolution - generalization as the master line]] — Agentic 主线（此页为反向证据点）
