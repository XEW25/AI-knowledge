# NVIDIA

- **Type**: Company（半导体 / AI 全栈）
- **Embodied 相关部门**: GEAR Lab（Generalist Embodied Agent Research，Jim Fan & Yuke Zhu 领衔）
- **Focus（具身视角）**: 开源机器人基础模型 + 世界模型 + 仿真 + 端侧推理硬件的**全栈**

## 在具身领域的多线站位

NVIDIA **不是单纯的 VLA 玩家，而是横跨多流派的全栈玩家**（见 [[Embodied Brain Models]] 的"主体 vs 模型 vs 流派"三层区分）：

| 产品 | 流派归属 | 角色 |
|------|---------|------|
| **GR00T** (N1 → N1.5 → N1.6 → N1.7) | VLA 流派 / **范式 B** | 开源人形 VLA 基础模型 |
| **Cosmos**（Cosmos-Predict / Reason） | **Predictive Spatial 流派** | 世界模型 / 物理 AI 推理 |
| **Isaac Sim / Lab** | 工具链 | 仿真平台 |
| **DreamGen** | 流派融合方法 | 用 Cosmos 给 GR00T 生成合成训练数据 |
| **Jetson Thor**（~2000 TOPS） | 硬件 | 端侧推理芯片，决定"小脑"上限 |
| **OSMO** | 开发基建 | **开发/训练期**工作流编排（见下，**非运行时**） |
| **Isaac Lab-Arena** | 开发基建 | **大规模仿真策略评测**框架 |

**关键观察**：NVIDIA 通过 DreamGen 让世界模型（Cosmos）与 VLA（GR00T）**互相增强**——世界模型不是 VLA 的竞争者，而是其数据基础设施。N1.7 更把 backbone 换成自家 **Cosmos-Reason2-2B**，把"会推理/预测的世界模型"直接当 VLA 大脑，是流派融合的工业实例。

**战略**：开源（代码 Apache 2.0 + 权重 NVIDIA Open Model License）+ 卖 Jetson Thor 硬件 + 提供 Isaac 仿真全栈——典型的"卖铲子 + 开源生态"打法，与其 GPU 主业协同。

## 在具身 Agent 层的站位：拆进模型与开发基建，**不做运行时框架**（2026-08 核实）

问"NVIDIA 对具身 **Agent** 做了什么技术部署"，核实后的答案是**分成两处，且都不是运行时**：

| 归属 | 具体 |
|---|---|
| **吸收进模型** | GR00T 的 **System 2**（N1.7 换用自家 **Cosmos-Reason2-2B** backbone），官方称 "Open Reasoning VLA"，带 **enhanced task decomposition**。⇒ **规划/推理/任务拆解做进权重，不外挂 harness** |
| **落在开发基建** | **OSMO**（工作流编排）+ **Isaac Lab-Arena**（评测）——**开发期**，不是运行时机器人任务编排 |
| **运行时 agent harness** | **没有**。无 [[Zhang et al. - Harness VLA Steering Frozen VLAs into Reliable Manipulation Primitives via Memory-Guided Agents\|Harness VLA]] / [[Zeng et al. - HELM Harness-Enhanced Long-horizon Memory for VLA Manipulation\|HELM]] / [[Being-0 - a Humanoid Robotic Agent with VLMs and Modular Skills\|Being-0]] 那类东西 |

> **与 [[AgiBot 智元]] 的对照（产业结构判断）**：AgiBot 的 AIMA "1+3+X" 把 **"X = 具身智能体框架"明确列为栈里的一个生态位**——**要占这个位**；NVIDIA 则把 agent 能力拆进模型与开发基建、**运行时框架留白**——**不占，卖底座**。
> ⇒ **"具身 Agent 框架"这一层目前没有被平台方标准化**：学术侧各做各的，产业侧一个想占位、一个刻意留白。这对本库 [[Cloud-edge co-evolving embodied agent - a continuous-evolution framework|co-evolution 框架]]的"接口契约共版本化"是个现实提醒——**该契约目前没有事实标准的制定者**。

### OSMO：边界要划清
- **是什么**：面向 **physical AI 的领域专用**工作流编排（官方对标并区别于 **SLURM**，非通用调度器）。统一**训练集群 + 仿真环境 + 边缘硬件**于单一控制面；覆盖 数据生成 → RL → 训练 → 仿真验证 → **SIL/HIL 评估**；数据集版本化、依赖解析、异构 GPU 调度
- **接口**：**YAML** 工作流（"Write workflows in YAML…not Python scripts"、"no Kubernetes expertise needed"）+ CLI + VSCode/Jupyter/SSH 远程开发。**受众是缺基础设施专长的人类开发者**
- **⚠️ 边界（官方原话）**：*"OSMO prepares trained policies, datasets, and artifacts, but **deployment into production systems is outside its scope**."* ⇒ **与具身 Agent 系统无直接关系**；在本库框架里只落在**演进通道的云侧**
- **⚠️ 术语陷阱**：官方称 "open-source **agentic** orchestrator"——此处 agent 指**能被编码 agent 操作**（仓库带 `AGENTS.md`/`CLAUDE.md`/`.claude/agents/`，支持 prompt-driven 开发），**不是"编排具身 agent"**

### Isaac Lab-Arena：评测算力成为预算项的商业佐证
→ **源笔记**：[[NVIDIA - Isaac Lab-Arena Scalable Robot Policy Evaluation in Simulation]]（**与 Lightwheel 共同开发**；**pre-alpha**）
开源（商业许可）。解决"大规模策略评测搭建又繁又手工"。**乐高式模块化**：Objects / **Affordances**（`Openable`、`Pressable`，用于任务泛化）/ Scenes / Embodiments（GR1 人形、Franka）/ Tasks（封装目标与成功判据）→ **按需即时组装环境**；**GPU 并行，40× 于串行**（复杂任务 **0.76h vs 34.9h**）。扩展自 Isaac Lab，GEAR Lab 用它基准 GR00T N 系，**以 OSMO 为 CI/CD 部署环境**。

> **意义**：本库 [[Robot data engine]] 断言"**评估算力第一次与训练算力并列成为预算项**"——**一个算力供应商专门为评测吞吐做开源产品、并以加速比为卖点**，是该判断最强的一类证据（不是论文说的，是卖算力的人用产品投票）。

## 与知识库主题的关联

- [[NVIDIA - GR00T N1 An Open Foundation Model for Generalist Humanoid Robots]] — 范式 B（cross-attention）工业代表，代码级核实
- [[Visual token budget - pruning vs compression]] — NVIDIA 自家的 **EVS**（Efficient Video Sampling，arXiv:2510.14624）视频 token 剪枝法，先落 Nemotron Nano V2 VL，再用于 **Cosmos 3 Reasoner** 的 NIM 推理加速。⚠️ **已核实：Cosmos 3 技术报告全文 0 次提及 EVS** —— 它是部署层可开关旋钮，不是模型固有属性
- [[Embodied Brain Models]] — 全栈玩家、范式 B、Predictive Spatial 流派
- [[Robot data engine]] / [[Real-robot data collection - teleop vs UMI-class, and the model-in-the-loop quality problem|三层数据金字塔综述]] — OSMO 与 Isaac Lab-Arena 在评估栈/供给侧优化中的位置
- [[Real-robot evaluation]] — Arena 是其**仿真侧对位**（真机评测作为测量学 vs 仿真评测吞吐）
- [[Home robot architecture - a hierarchical embodied agent]] — Jetson Thor 等端侧硬件决定小脑可行性
- [[Huang et al. - ChemBot Long-Term Memory for VLA-based Agents]] — ChemBot 的 Skill-VLA 基于 GR00T

## Related

- [[Physical Intelligence (π)]] — 范式 A 的主要推动者，VLA 竞争对手
- [[Galaxea 星海图]] / [[AgiBot 智元]] — 用 NVIDIA 硬件/模型的中国具身公司

## tags

#entity #nvidia #vla #world-model #gr00t #cosmos #embodied-ai #full-stack
