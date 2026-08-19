# 面向具身计算系统优化的仿真评测套件

> **定位**：团队做具身计算系统，研究方向包括：具身模型推理优化（量化、token 压缩、flow/扩散降步、算子与编译）、具身 Agent 框架、具身仿真与真机 RL 框架、物理引擎加速（主要基于 MuJoCo）、渲染引擎加速（软件光追、3DGS）。精度评估体系分**真机、仿真、引擎**三层，本页只覆盖**仿真层**：替换或优化某个系统组件后，如何用仿真基准判断具身任务精度有没有退化，并进一步定位退化来源。真机层见 [[Real-robot evaluation]] 与 [[Real-robot eval bench - task suite design and setup checklist]]；引擎层的组件级 microbenchmark（求解器数值精度、渲染像素误差等）不在本页。
>
> 公开仿真基准由**开发团队自评**；**评估团队**另行维护私有评测集 **ESAS（Embodied System Acceptance Suite，具身系统验收套件）**，承担质量管控与最终评审。
>
> 制定于 2026-08-06；**2026-08-18 重构为 v0.7**：按"共同任务池 → 私有集构建 → 判定标准 → 方向映射"重排，细节运行参数收进附录。任务清单、扰动范围与非劣性门槛仍需按团队算力预算与冻结的 reference 校准。

## 1. 核心问题与评估分工

统一问题：

> **保持任务、模型与随机输入不变，只替换被优化组件，观察端到端任务精度是否退化。**

这里的"精度"不能只等同于平均成功率，还包括分阶段完成度、完成时间、轨迹质量、碰撞与异常退出（判定标准见第 4 节）。

| 角色 | 使用的数据 | 职责 |
|---|---|---|
| 开发团队 | 公开 benchmark 全量 | 日常回归、问题定位、对外可比 |
| 评估团队 | ESAS 私有派生集 | 验收门槛、防调参过拟合、最终评审 |

为什么两边都需要：

- **只用公开集不够**：实例、组合和反馈长期暴露后，开发团队可能有意或无意针对公开集调参，公开成绩不再等于真实质量。
- **只做隐藏也不够**：π0.5 在原始 LIBERO 上已接近 97%，天花板附近没有区分度。私有集必须把 reference 成功率校准到有区分度的区间（经验上约 **20%–80%**），接近 0% 或 100% 的项只能作能力压力项。

## 2. 共同任务池与标准运行参数

以 π0.5 为共同参考模型。每个 benchmark 只回答三件事：**测什么、关键运行参数、当前 π0.5 参考成绩与使用边界**。关键参数指工作负载单位与实例数、rollouts、action chunk 预测/执行步数；其余细节（相机、图像预处理、normalization、seed、初始等待等）冻结后基本不变，收进附录 A。

总表（细节见各小节）：

| Benchmark | 工作负载单位与规模 | rollouts | π0.5 chunk 预测/执行 | flow steps | π0.5 参考成绩 |
|---|---|---|---|---|---|
| LIBERO 原始四套件 | 40 tasks | 50 / task | **10 / 5** | 10 | 98.8 / 98.2 / 98.0 / 92.4，均值 96.85（官方） |
| LIBERO-Plus | **10,030 个固定扰动实例** | **1 / instance** | 10 / 5（团队规定） | 10 | 官方榜无 π0.5 |
| LIBERO-PRO | 40 tasks × 5 profile | 50 / task / profile | 10 / 5（团队规定） | 10 | 总体约 0.53（作者 README 榜） |
| RoboTwin 2.0 | 50 tasks × clean/randomized | 100 / task / 档 | **50 / 50**（整 chunk 开环） | 10 | 官方 cotrain 70.7 / 46.0 |
| RoboCasa365 Public-50 | 50 tasks（18/16/16 三组） | 50 / task | **50 / 5** | 10 | 39.6 / 7.1 / 1.2，总体 16.9 |
| BEHAVIOR 2026 | 100 tasks × 10 公开实例 | 1 / instance | 官方管线 horizon 32 / 执行步未披露 | 10 | 无公开分数；2025 届冠军（π0.5 基座）Q≈0.26 |

### 2.1 LIBERO 原始四套件：可复现共同基线

- **测什么**：Spatial（空间几何）/ Object（物体辨识）/ Goal（目标与语言条件）/ LIBERO-10（多阶段长程），四套件共 40 任务；robosuite/MuJoCo 栈。
- **关键参数**：50 rollouts/task；π0.5 每次预测 10 actions、执行前 5 步后重新观测推理（**10/5**）；flow-matching 10 步；checkpoint `pi05_libero @ 30k`。
- **π0.5 参考成绩**：官方 98.8 / 98.2 / 98.0 / 92.4，均值 96.85（[OpenPI LIBERO README](https://github.com/Physical-Intelligence/openpi/blob/main/examples/libero/README.md)）。
- **使用边界**：公开、可运行、官方 checkpoint 齐全，适合所有 π0.5 优化的共同必跑回归；但整体接近饱和，接触、双臂与 Agent 级长程覆盖不足——能证明"没有破坏 π0.5-LIBERO 能力"，不能独自承担最终验收。

### 2.2 LIBERO-Plus：观测分布偏移与条件鲁棒性

- **测什么**：在任务结构基本不变前提下的 7 个扰动维度、21 个子维度：Objects Layout、Camera Viewpoints、Robot Initial States、Language Instructions、Light Conditions、Background Textures、Sensor Noise（[arXiv 2510.13626](https://arxiv.org/abs/2510.13626)，CVPR 2026 版标题为 "A Progressive Robustness Benchmark…"，与 arXiv 版 "In-depth Robustness Analysis…" 为同一论文的两个版本；[官方代码库](https://github.com/sylvestf/LIBERO-plus)）。
- **关键参数**：论文从 40 个原始任务生成 14,000 个候选、过滤为 **10,030 个 test-only 固定实例**；工作负载单位是**一个固定 perturbed instance，每实例只 rollout 一次**（官方 README 明确把 `num_trials_per_task` 从 50 改为 1）。需要扩样时增加独立扰动实例，不是把同一实例重复 50 次。
- **π0.5 参考成绩**：官方榜覆盖 π0、π0-Fast、OpenVLA 系列等十个模型，**没有 π0.5**；论文也未披露任何 π 模型的 flow steps / horizon / chunk 执行步数。团队跑 π0.5-Plus 时按附录 A 的 Policy Contract（10/10/5）执行——这是 **ESAS 规定**，不是 Plus 官方配置。
- **使用边界**：最适合渲染/3DGS、视觉编码、相机链路与观测质量测试。注意 L1–L5 难度是按 OpenVLA-OFT/π0/π0-Fast/UniVLA 四个模型的成败**事后**分层的经验标签，不由物理扰动幅度决定，ESAS 不直接把它当验收等级。区分 zero-shot robustness 与 Plus-finetuned robustness——训练中见过 Plus 数据的成绩不再是对原始模型的 OOD 验收。

### 2.3 LIBERO-PRO：grounding、任务泛化与反记忆

- **测什么**：模型是否根据当前观测和指令在线决策，而不是重放记住的场景—轨迹映射。论文概括为四类高层变化（各类过拟合观察见论文 §2，统一框架见 §4.1）；代码库实际提供五个配置轴：Object（`use_object`）、Position（`use_swap`）、Semantic（`use_language`）、Task（`use_task`）、Environment（`use_environment`），官方规定 **`use_task` 不得与其它轴组合**（README 与论文 Fig. 6 caption；[arXiv 2510.03827](https://arxiv.org/abs/2510.03827)、[官方代码库](https://github.com/Zxy-MLlab/LIBERO-PRO)）。
- **关键参数**：每个 task × 启用 profile 跑 **50 episodes**（论文 §5.1）；max steps 沿用 LIBERO 各套件 220/280/300/520（出处是 README 的 OpenVLA 适配片段，论文未写）。论文和仓库均未披露 π0.5 推理参数，团队复现统一按附录 A，差异写入结果元数据。
- **π0.5 参考成绩**（出自**仓库 README leaderboard**，论文正文只有图无数字表）：总体约 **0.53**；Object 0.92–0.98、Semantic 0.93–0.97、Position 0.08–0.38、Task 0.00–0.01、Environment 0.46–0.73（四个 suite 分别报告）。非 Physical Intelligence 官方成绩。
- **使用边界**：Object、Semantic 与校准后的 Environment/Position 可用于 grounding 回归；接近地板的 Task 与困难 Position 只能作能力压力，不适合判断 1–3pp 的量化或算子回退。对 Agent、重规划与失败恢复系统，PRO 比纯视觉扰动更有价值。
- **与 Plus 的区别**（轴名有重叠但问题不同）：Plus 问**鲁棒性**——任务和成功判定不变，只改输入条件（相机/光照/噪声/干扰物/措辞），同一件事还做不做得对；PRO 问**反记忆/任务理解**——物体外观、位置、目标乃至任务逻辑真正变化后，模型是否在线重新 grounding。逐轴看：Plus 的 Layout 是加干扰物和小幅位移，PRO 的 Position 是移到未见的新可行位置；Plus 的 Background 是换纹理，PRO 的 Environment 是换整个场景；PRO 的 Task 轴连 predicate 都改（新任务分布），Plus 完全没有；只有 Semantic/Language 改写是两者真正重叠的轴。π0.5 成绩的分裂（Object/Semantic 0.92+ vs Position/Task 0.38 以下）正说明两类问题不是一回事。ESAS 映射：Plus → Observation-Robustness（Language → Grounding）；PRO → Grounding（Object/Semantic）+ Task-Generalization（Position/Task/Environment）。

![[libero-plus-pro-same-task-comparison.png]]

*同一底座任务（LIBERO-Goal "put the bowl on the plate"）在三个 benchmark 下的真实渲染帧：Plus 只改输入条件（绿），PRO 改任务要素（橙）。帧取自 LIBERO-Plus（arXiv:2510.13626）与 LIBERO-PRO（arXiv:2510.03827）论文图。注意：两篇论文的帧呈左右镜像——LIBERO 的 OpenGL 原始渲染是倒置的，垂直翻转（`img[::-1]`）与 180° 旋转（`img[::-1,::-1]`，OpenPI 训练预处理用后者）恰好相差一个水平镜像，属可视化约定差异而非场景扰动（PRO 未扰动的 Original Task 帧即已镜像）；图中已将 PRO 帧翻转对齐。这也说明图像方向属于 checkpoint 输入契约，喂错翻转约定会使左右空间语义反转（见附录 A）。*

### 2.4 RoboTwin 2.0：双臂、接触与跨引擎参照

- **测什么**：50 个双臂任务、五类本体，SAPIEN 栈；覆盖精密对位、接触、铰接、工具使用与双臂闭链（[论文](https://arxiv.org/abs/2506.18088)、[任务页](https://robotwin-platform.github.io/doc/tasks/)）。
- **关键参数**：每任务 50 条 clean 演示训练，clean（Easy）与 randomized（Hard）各评 **100 rollouts**；官方随机化字段共八个（背景、桌面杂乱、头部相机距离、桌高、光照等），**纯视觉/几何，没有质量、摩擦、阻尼、接触刚度或控制延迟等物理/控制字段**（[配置文档](https://robotwin-platform.github.io/doc/usage/configurations.html)）。π0.5 chunk 为 **10/50/50——预测 50 步、chunk 内零重规划，执行完整段才再推理**（`Pi0Config(pi05=True)` 默认 horizon 50 未覆写；`deploy_policy.yml` 的 `pi0_step: 50` 切整段执行；细节：`take_action` 在中途成功或步数耗尽后短路空转，成功锁存不受剩余动作影响——推理频率严格每 50 步一次，物理执行可不满额。[官方 π0.5 文档](https://robotwin-platform.github.io/doc/usage/Pi05.html)、[stable_2.0 部署代码](https://github.com/RoboTwin-Platform/RoboTwin/blob/stable_2.0/policy/pi05/deploy_policy.py)、[评测主循环](https://github.com/RoboTwin-Platform/RoboTwin/blob/stable_2.0/script/eval_policy.py)）。三家对比：LIBERO 10/5、RoboCasa 50/5、RoboTwin 50/50——RoboTwin 开环程度最高，对推理延迟最宽容、对 chunk 内扰动最脆弱；官方 cotrain 成绩即此协议，reference 复现必须沿用，改执行步数属 §2.7 的 scheduling 独立实验。另注意 RoboTwin 的单个 action 经 mplib TOPP 子轨迹执行（1/250s 仿真步长），无固定控制频率概念——Control 轴注入"延迟 N 步"的语义与 LIBERO 不同，需按时间而非步数定义。
- **π0.5 参考成绩**：官方 leaderboard 于 **2026-08-10** 上线 RoboTwin 团队的 π0.5 cotrain 条目：**Easy 70.7 / Hard 46.0**（含 50 任务逐项；条目为 JS 渲染，普通抓取会漏）。榜单术语：**Co-train = 单一 policy 在全部 50 任务的 demo_clean 上联合训练**（训练数据不含 randomized），Single = 每任务单独 SFT 一个 checkpoint；本体固定 Aloha-AgileX。对照 Motus 作者同为联合训练的 π0.5 42.98 / 43.84（40k finetune，[Motus Table 14](https://arxiv.org/html/2512.13030)）——同类协议下不同训练 recipe 差近 30 个点，**任何借用的数字都不能当团队验收基线，必须用团队冻结的 recipe 重建 reference**。
- **使用边界**：物理方向的**跨引擎参照**（SAPIEN，非 MuJoCo，见 §5）；双臂与接触覆盖是 LIBERO/RoboCasa 没有的。早期挑的 System-10 子集（click_bell、lift_pot 等十任务，按 Motus 表推算均值 33.8/34.2，存在明显地板/天花板项）只保留为快速诊断或能力压力候选。

### 2.5 RoboCasa365：MuJoCo 主任务集

- **测什么**：365 个厨房任务、2,500 个厨房场景，RoboCasa/robosuite/MuJoCo 栈；公开 leaderboard 用 50 个目标任务：**Atomic-Seen 18 / Composite-Seen 16 / Composite-Unseen 16**，Human300（300 任务）训练、`pretrain` split 评测（[leaderboard](https://robocasa.ai/leaderboard.html)、[benchmarking 文档](https://robocasa.ai/docs/build/html/benchmarking/benchmarking_overview.html)）。
- **关键参数**：50 trials/task；π0.5 每次预测 50 actions、执行前 5 步（**50/5**，horizon 50 是 `Pi0Config` 默认值未被覆写）；flow 10 步；checkpoint `pi05_pretrain_human300 @ 75k`（RoboCasa 团队复现，batch 64，OpenPI fork commit `ca4c671`）。**注意 horizon**：该提交的 runner 代码本身就是 `get_task_horizon(env_name) * 1.5`，即公开成绩已在 1.5× horizon 下评出；RoboCasa 1.0.1 又把 1.5× 烧进了任务定义——迁移到 1.0.1 时若 runner 再乘 1.5 会变成 2.25×，**必须核对避免双重乘法**。
- **π0.5 参考成绩**：Atomic-Seen **39.6%** / Composite-Seen **7.1%** / Composite-Unseen **1.2%**，总体 16.9%（[提交记录](https://github.com/robocasa-benchmark/leaderboard/blob/main/submissions_md/pi05_2026-04-02.md)）。冻结门槛前仍须在统一 1.0.1 协议下重跑 reference。
- **使用边界**：物理引擎（MuJoCo）优化的**主承载**；Atomic-Seen 成功率处于有翻转空间的区间，是精度回归候选池；Composite 两组接近地板，只作能力压力（开发自报，不入 ESAS，见 §3.4）。`target` split（10 个不相交厨房 + 不相交对象）单独作场景/对象 OOD。

### 2.6 BEHAVIOR 2026：Agent 级长程任务

- **测什么**：100 个 BEHAVIOR-1K 全长家庭任务，导航 + 移动操作 + 多阶段目标；观测限 RGB + depth + proprioception，测试时禁用分割、物体状态、目标位姿等仿真真值（[评测规则](https://behavior.stanford.edu/challenge/evaluation.html)）。
- **关键参数**：主指标为最终满足的 BDDL goal predicates 比例（部分完成分，Q-score）；timeout 默认为人类演示平均长度的 1.5 倍；公开评测协议为 100 任务 × 前 10 个公开实例 × 1 rollout = 1,000 episodes；兼容 OpenPI 的 websocket 接口（[2026 Challenge](https://behavior.stanford.edu/challenge/index.html)、[评测规则](https://behavior.stanford.edu/challenge/evaluation.html)）。
- **π0.5 参考成绩（截至 2026-08-18）**：2026 届**无公开 baseline 分数**——官方 π0.5 / GR00T N1.7 是"参考训练+评测管线"而非有成绩的条目，[leaderboard](https://huggingface.co/spaces/behavior-1k/2026-challenge-leaderboard) 为 0 提交（截稿 10/16、公布 11/04）。最近锚点是 2025 届（50 任务）：冠军（π0.5 基座）Q-score **0.2599**、完整任务成功率 **12.4%**（[方案](https://github.com/IliaLarchenko/behavior-1k-solution)）；NVIDIA Comet（π0.5 基座）0.2514，赛后改进版在公开实例 0.345（[arXiv:2512.10071](https://arxiv.org/abs/2512.10071)）。π0.5 级系统在此量级任务上处于深地板区间。
- **权重与训练**：官方只放出 1/100 任务（`turning_on_radio`）的微调 checkpoint；其余需按官方管线自训——`pi05_base` + [openpi behavior 分支](https://github.com/wensi-ai/openpi)，R1Pro 本体，**action horizon 32**（又一个 checkpoint 级 horizon，区别于 LIBERO 10 / RoboCasa 50），逐任务微调。训练数据全开放：20,000 条 JoyLo 遥操演示，3.27 TB，MIT（[dataset](https://huggingface.co/datasets/behavior-1k/2026-challenge-demos)）。
- **本地运行约束**：需 RT-core GPU（Isaac Sim 5.1 **不支持 A100/H100 渲染**），官方参考机为单张 RTX 4090 + 128 GB RAM + Ubuntu 22.04；挑战规格观测（720×720 RGB-D）下仿真 **~13.5 FPS**，1,000 episodes 单机约 2–3 周（2025 冠军实测 500 episodes 单机 ~10 天，20×4090 并行 <2 天）；资产包（31.5 GB 加密）为 **non-commercial academic EULA**；官方明确声明**仿真器非确定**——无法做 ESAS 式逐 episode 严格配对，只能多 rollout 平均。
- **使用边界**：因成本、非确定性与深地板效应，定位为**发布级 Agent 能力压力评测**，不承担日常回归与非劣性验收；日常长程回归由 RoboCasa365 Composite 承担（有公开 π0.5/GR00T 分数、MuJoCo 便宜、可配对）。内部 `BEHAVIOR-Core-20` 按演示长度、predicate 数、是否导航/搜索/可恢复失败分层抽样（Core-20 × 10 实例 = 200 episodes ≈ 单机 4–5 天，可行）；Full-100 仅重大发布跑。Agent"大脑"层（目标解释、子目标分解、动作排序）可另用 [EAI](https://embodied-agent-interface.github.io/)（Embodied Agent Interface）做符号层诊断——它复用 BEHAVIOR 任务定义，可与执行层结果两级归因，成本极低。

### 2.7 跨 benchmark 的 π0.5 运行契约要点

- **各 benchmark 用各自适配/微调的 checkpoint**（LIBERO: `pi05_libero@30k`；RoboCasa: `pi05_pretrain_human300@75k`）；不能拿 `pi05_libero` 零样本跑其他本体后把低分归因于系统优化。
- 所有结果必须分别报告 `flow_steps / predicted_action_horizon / executed_actions_per_chunk`，不许只写含糊的 "chunk size"。LIBERO 系为 **10/10/5**，RoboCasa 为 **10/50/5**，RoboTwin 为 **10/50/50**（整 chunk 开环）——三家三种组合，口头说 "chunk 50" 无法区分后两者。
- **随机性控制**：官方 runner 只固定 NumPy/环境 seed（seed 7）；OpenPI policy server 端 flow 初始噪声默认 `jax.random.key(0)`——同一新起进程内是确定的，但依赖推理调用顺序。配对评测要么显式注入 per-episode noise，要么固定 server RNG、对齐调用顺序并记录重启。
- **单一声明变量**：量化/算子/编译只改声明的计算实现；flow-step reduction 允许少于 10 步，但必须与 10-step BF16 reference 配对并把步数写进结果名（如 `INT8-flow6-h10-e5`）；改 horizon 或执行步数的 scheduling 优化改变了闭环协议，不进标准精度榜，单独报告。
- 完整参数表与代码依据见附录 A。

## 3. 评估团队私有评测集（ESAS）

### 3.1 治理原则

仅隐藏数据不够——若开发团队可以无限提交并拿到逐 episode 反馈，仍会通过反馈拟合内部集。评估治理至少包括：

- 不公开具体 seed、初始状态、资产组合、扰动样本与 episode manifest；但评测代码、成功判定与参数范围透明，避免不可解释的"秘密规则"。
- 开发阶段只反馈 profile / 任务族级聚合结果；逐 episode 视频按诊断需要抽样开放。
- 限制正式验收提交频率；完整记录提交、配置与结果。
- 定期轮换 Private Validation 的一部分实例；Final Holdout 平时不运行、不反馈，只用于正式发布验收。
- 冻结并哈希 suite、代码、任务、资产、配置、容器、仿真器与成功判定版本。

### 3.2 ESAS-LIBERO

```text
ESAS-LIBERO
├── Canonical-Heldout        # 任务/指令/谓词/配置全部不变，仅换隐藏初始状态与 seed
├── Observation-Robustness   # 复用 Plus 扰动定义，私有重生成
├── Grounding                # 复用 Plus Language + PRO Object/Semantic
├── Task-Generalization      # 复用 PRO Position/Task/Environment
└── Compound                 # 仅终检组合，不用于首轮归因
```

**Canonical-Heldout**：task/BDDL、instruction、success predicate、simulator 配置全部与 Public Canonical 相同；只有初始状态、环境 seed、policy noise 是评估团队持有的隐藏新样本，且 reference 与 candidate 逐 episode 配对共用。承担纯计算路径（量化、算子、后端迁移）的主要非劣性验收。不得混入任何视觉、语言、任务或物理 hardening。

**Observation-Robustness**：不改官方 Plus 文件，复用其扰动定义私有重生成固定实例。六个必选轴（Plus 七维去掉 Language）：

| 轴 | v1 扰动 | 不得改变 |
|---|---|---|
| `Layout` | 加干扰物；目标物合法位移 | 目标身份、instruction、成功谓词 |
| `Camera` | 距离 1.01–2.00×；球面视角 15°–75°；姿态 2°–10° | 相机 slot、内外参接口、wrist 相机 |
| `Robot` | 初始 qpos 扰动 0.1–0.5 | 本体、控制器、动作接口；须过可达/碰撞检查 |
| `Light` | 颜色/方向/specular/阴影 | 几何、物理参数、成功谓词 |
| `Background` | 场景/桌面纹理 | 目标外观、几何、任务关系 |
| `Noise` | motion/Gaussian/zoom blur、fog、glass blur | 仿真状态；噪声只作用于送入模型的图像，paired run 共享 noise seed |

参数范围以 Plus Appendix A 为上限参考。运行分三层：`OR-Single-Gate`（40 task × 6 轴 × mild/medium × ≥3 独立 seed，逐实例配对，作非劣性验收）、`OR-Subdimension-Diagnostic`（展开子轴加 hard 档，定位链路，不设总门槛）、`OR-Compound-Stress`（多轴组合只作压力；Plus Appendix F 显示扰动交互显著，不能用单轴相乘外推）。冻结前用 reference 逐任务成功率把 mild/medium 校准到有区分度区间。

**Grounding**：验证 instruction—对象—动作在线绑定，非泛化"语言总分"。四轴：`Language-Semantic`（官方名 Distraction / Common Sense / Reasoning Chain 三类改写，语义保持才进 Gate）、`Object-Attribute`（同语义类换外观，predicate 不变）、`Referent-Binding`（加视觉相似 decoy 指向原目标；目标替换/移除只作诊断并标记 `predicate_mode=remapped/unsatisfiable`）、`Instruction-Task`（改目标逻辑，归入 Task-Generalization，不进 Grounding Gate）。诊断项单独报告 `correct_target_contact_rate`、`wrong_object_contact_rate`、`empty_grasp_rate`、`instruction_sensitivity`，不伪装成任务成功率。LLM 生成的改写必须经结构化解析或人工复核才进 sealed set。

**Task-Generalization**：任务生成三轴——`Position`（多物体重排，制造未见布局，predicate 可不变，与 OR-Layout 用不同 profile 与强度，不合成一个"视觉分"）、`Task`（T1 目标重映射 / T2 目标状态变化 / T3 子任务重组，均改 predicate，是新任务分布；T3 只作能力压力）、`Environment`（换场景模板，纹理光照留给 OR）。沿用官方约束：Task 轴不与其它轴交叉。所有生成任务必须过 BDDL 解析、无碰撞、可达性检查，并由 scripted/oracle controller 验证可解；生成器版本化，生成后不再运行时改写。结果同时报 `task_success`、`predicate_progress`、`subgoal_completion`、`wrong_target_rate`、`oracle_feasibility`。

ESAS-LIBERO 不设独立 Control/Physics 轴：推理时延与 chunk scheduling 由开发团队验证，评估团队只冻结统一运行协议；复杂物理由 ESAS-RoboCasa 与 ESAS-RoboTwin 承载。

### 3.3 ESAS-RoboTwin

```text
ESAS-RoboTwin
├── Canonical   # 正常难度，隐藏 seed/初始状态/资产组合
├── Visual      # 改观测不改动力学
├── Physics     # 改动力学不改视觉语义
├── Control     # 接口注入时序扰动
└── Compound    # 仅终检
```

- `Visual` 大部分复用官方随机化字段（关闭会改几何的 `random_table_height`）；更细的遮挡、内参、传感器噪声或 3DGS 退化需扩展 renderer 配置。
- `Physics` 官方 YAML 没有物理随机化接口，需在 task reset / asset load 阶段把自定义参数写入 SAPIEN actor/articulation/material（质量、摩擦、关节阻尼、restitution、质心偏移），且**按任务绑定**：`open_microwave` 改铰链阻尼、`lift_pot` 改质量与质心、`stack_bowls_three` 改摩擦接触——不能对所有资产乘同一系数。
- `Control` 测的是 policy–environment 接口的**时序行为**（非控制器/控制算法）。动机：标准协议是同步评测——推理时仿真暂停等待，**延迟在协议里是免费的**，量化/异步调度的时序收益与风险完全不可见，而真机上世界不等模型。Control 用官方部署接口（可定制 `eval()`、`update_obs()`、`get_action()`，[文档](https://robotwin-platform.github.io/doc/usage/deploy-your-policy.html)）在 wrapper 注入受控时序扰动：observation/action delay（感知/执行侧延迟，可分别归因）、observation drop（丢帧顶旧观测）、action repeat（推理跟不上控制频率的等效降频）、proprio–camera skew（打破多模态同步采样假设）。注入值对 reference/candidate 完全相同（与各自真实推理速度无关），仍是配对实验；使用逻辑两步——先扫延迟—精度敏感度曲线，再把各后端实测延迟映射到曲线定工作点，§2.7 的 scheduling 独立实验由此验收。注意 Control 测的是系统不是模型能力（ESAS 每个轴皆然：Visual 之于渲染、Physics 之于求解器）；且"时延过大"的阈值不是链路属性，而是 policy×任务×延迟交互的属性——链路延迟预算的 spec 只能由这条敏感度曲线定义，同时它也是真机失败时区分"数值坏了"与"时序坏了"的归因依据。放在 RoboTwin 是信号密度选址：时序扰动只在动态与双臂协调任务（`shake_bottle`、`handover_block`、`lift_pot`）上有强信号，LIBERO/RoboCasa 的准静态任务对延迟天然宽容（这正是 chunking 能工作的原因）。
- 三者先做**单因素实验**，Compound 只作最终压力，不用于归因。

`ESAS-RoboTwin` 是内部派生套件，结果不得上报官方 leaderboard。

### 3.4 ESAS-RoboCasa

```text
ESAS-RoboCasa
├── Precision-Core        # 全库 atomic 任务校准后选；任务名单与实例双层隐藏
├── Physics-Core          # 固定 trace / oracle / π0.5 三种执行方式
└── Scene-Object-Heldout  # 官方 target split；审计职能：查训练污染、统一 harness
```

RoboCasa Composite（Seen/Unseen）不入 ESAS：地板区、不设门槛、任务公开，由开发团队在公开集自报，ESAS 仅在发布节点抽查复跑。Agent 框架将 composite 成功率抬入 20–80% 判别区间后，从全库 300 个 composite 任务中校准实例化 Agent 方向的验收 profile（任务+实例双层隐藏，框架版本升级适用同一套非劣性验收逻辑；触发条件见 §6）。

- `Precision-Core`：候选池不限于公开的 Atomic-Seen 18——扩到 Human300 训练分布覆盖的全部 atomic 任务（全库 65 个 atomic，公开榜只用 18 个；可用数量待核对 Human300 构成），跑 reference 校准后保留成功率约 20%–80%、重复稳定、任务族不重复的任务。**任务选择本身也是隐藏项**：评估团队不公开选了哪些任务，与 episode 级隐藏叠加，无需扰动生成即获得真正私有性。
- `Physics-Core`：物理引擎优化不能只用闭环 π0.5，同一批任务固定三种执行方式——①**固定 action trace 重放**（隔离引擎，比状态轨迹/接触/穿透/约束误差）、②**scripted/oracle controller**（排除视觉与推理干扰）、③**π0.5 闭环**（最终系统影响）。trace 重放放在 RoboCasa 而非 LIBERO 的理由：重放不跑模型，LIBERO 的官方 π0.5 基线优势用不上，其价值只取决于任务物理内容——两家同为 MuJoCo 栈，LIBERO 接触稀疏（分歧信号是 RoboCasa fixture/堆叠/铰接任务的真子集），在信号密度低处重复布点只浪费算力。
- "同一引擎名"不等于"同一物理栈"：必须同时冻结 RoboCasa/robosuite/MuJoCo/资产版本与 integrator、timestep、solver、contact、controller。
- **设计逻辑**：除 Physics-Core 外三个 profile 均为 π0.5 闭环的模型在环评测；Precision-Core 因 atomic 任务处于 ~40% 非饱和区间，成败翻转空间远大于 ~97% 的 LIBERO Canonical，是 MuJoCo 栈上检测小回退的主力（不一致率 ψ 高 → 同样本量功效高，见 §4）。ESAS-RoboCasa **不做扰动生成**——任务定义全部来自官方，私有性在任务选择层（Precision-Core 不公开任务名单）+ episode 实例层（隐藏初始状态/seed/manifest + 配对 + 聚合反馈）：扰动归因已由 ESAS-LIBERO 复用 Plus/PRO 成熟生成器承载，而 RoboCasa 的独特价值（非饱和难度、2,500 厨房与不相交 split 的原生 OOD、composite 长程、MuJoCo 物理）全部原生自带、无需生成。
- **两个 profile 的 ESAS 正当性并不同级**（能力信号本身开发团队跑公开集就能获得，ESAS 的存在理由是验收完整性，不是测量）：**Precision-Core 必须在 ESAS**——公开协议 seed 固定为 7、episode 集完全公开，反复迭代等于对同一批实例做适应性过拟合（公共榜效应），隐藏任务+实例是唯一解药，且正式非劣门槛不得建立在被验收方自报数字上（职责分离）；**Scene-Object-Heldout 实为审计职能**——split 公开、episode 隐藏保护有限，ESAS 复跑的价值是查训练污染与统一 harness（horizon、翻转约定等自报差异的现实教训见 §2.5/§2.3），不应称作私有验收集。

### 3.5 评估挡位与数据分层

挡位是必要的——不同扰动强度回答不同问题，混在一起会让地板项污染非劣性判定：

| 挡位 | 内容 | 用途 |
|---|---|---|
| **Gate** | Canonical-Heldout + 校准过的 mild/medium 扰动 | 非劣性验收，判 1–3pp 回退 |
| **Diagnostic** | 子轴展开 + hard 档 | 定位退化来源，不设总门槛 |
| **Stress** | 地板项、多轴组合、Task 轴（RoboCasa Composite 由开发自报，不入 ESAS） | 能力压力与未来模型跟踪，单独报告 |

数据流转：

```text
Public Dev（官方全量，开发自评）
      ↓
Private Validation（ESAS；有限次数、聚合反馈；部分实例定期轮换）
      ↓
Sealed Final Holdout（平时不运行不反馈；只用于正式发布验收）
```

公开结果与 ESAS、Gate 与 Stress 不得混成一个不透明总分；原始 LIBERO、Plus zero-shot、Plus finetuned、PRO 与 ESAS-LIBERO 分开报告。

### 3.6 私有 manifest 与版本冻结

评估团队至少维护四份文件（字段参考见附录 B）；开发团队只见 profile 名与版本号：

1. `base_task_manifest` — 原始任务的 BDDL/instruction/predicate hash，不可变基线。
2. `perturbation_manifest` — 一行一个固定实例：轴/子轴/强度/生成器版本/全部扰动参数/派生文件 hash。
3. `private_asset_manifest` — 干扰物、纹理、场景的真实文件映射；至少要有开发团队不可见的 held-out 资产。
4. `runtime_pair_manifest` — simulator 版本、environment seed、policy noise seed、timeout 与 reference/candidate 的逐 episode 对齐关系。

关键区分："任务定义不变"与"场景文件可派生"——派生 BDDL 可以加不参与谓词的干扰物，但必须保留 `base_task_id`、原 instruction 与 success predicate 并记录 hash 映射；一旦改了目标、谓词或控制接口，就该移入 Grounding 或 Task-Generalization。渲染器/3DGS 配对实验中，reference 与 candidate 必须读同一 manifest、同一物理状态、同一 environment/noise seed，差异才可归因于 renderer。

## 4. 配对评测与精度判定

ESAS 的核心判断不是 candidate 是否超过某个孤立的绝对成功率，而是：**在同一隐藏 episode 上，candidate 相对未优化 reference 是否发生超过允许范围的退化**。

Reference 与 candidate 必须使用完全相同的：

```text
(task_id, initial_state_id, environment_seed, policy_noise_seed,
 instruction, timeout, asset_version, simulator_version, profile_version)
```

π0.5 的 flow-matching 推理从随机噪声开始，只固定环境 seed 不够，环境随机性与模型噪声要分别固定并逐 episode 配对（见 §2.7 随机性控制）。

**结果聚合**至少报告：每任务成功率与每 suite macro average；paired success delta 与 `success→failure` / `failure→success` 翻转计数；各 profile 分开报告、长程任务单列；最差 10% 任务的平均退化；分阶段 progress / predicate completion；time-to-success、timeout rate；成功轨迹的长度与抖动；碰撞、保护触发与 simulator error。连续诊断量用于筛选和归因，不自动替代任务验收（沿用 [[Real-robot evaluation]]）。

其中"分阶段 progress"并非处处可得（2026-08 已核对三家代码）：**BEHAVIOR 原生**（BDDL partial credit 即主指标）；**LIBERO 官方只报二元**，但任务为 BDDL 定义、goal 是 1–3 个谓词的合取，`parsed_problem["goal_state"]` 可用任务无关的通用 hook 对每个 conjunct 单独调 `_eval_predicate` 插桩——仅对 libero_10/90 多谓词任务有意义，ESAS-LIBERO 的 `predicate_progress` 由此实现；**RoboCasa365 严格二元**（`info["success"]`），291 个 composite 任务各自硬编码 `_check_success` 且部分依赖历史 latch 标志，无法通用插桩——该处分阶段诊断用连续量与失败模式分类替代，不设 predicate 级指标。

事件类指标（碰撞、保护触发、simulator error）的意义分三层：碰撞看**策略行为质量**——动作精度退化最早表现为擦碰增多，先于成败翻转报警，且是接触求解回归的近因观察量与真机风险代理；保护触发（关节/力矩饱和、速度超限）看**执行器边界**——量化/加速造成的动作分布尾部变胖和时序扰动下的补偿性大动作都在此显形；simulator error 看**评测有效性**——发散 episode 的处理规则不预先冻结，配对统计会被幸存者偏差破坏，且发散率本身是物理引擎优化的被测输出。三者都是"成功率不动时仍能区分两个版本"的维度。它们同样不是 LIBERO/RoboCasa 的官方输出，可得性如下：**碰撞**——两家同为 robosuite/MuJoCo 栈，`check_contact` / `sim.data.contact`（接触对与接触力）是任务无关的统一接口，ESAS runner 可通用插桩；但必须先冻结"非预期接触"的定义（机器人非末端 body × 环境、或接触力超阈值——抓取放置本身就是接触，不定义白名单该指标无意义）。**保护触发**——仿真无原生等价物（真机概念），只能用约束违规代理：关节/力矩饱和、速度或接触力超阈值，阈值由 ESAS 自定义；真机语义的保护触发归 [[Real-robot evaluation]]。**simulator error**——两家 eval 路径均无数值异常捕获（无 NaN / mjWARN 检查），episode 级异常记录、qacc/qpos NaN 与 MuJoCo warning 计数由 ESAS 统一 runner 自建，对应附录 A 的"异常记录并计入、不得静默重跑"规则。

**守门用配对非劣性检验**：Macro、各 profile、任务族与关键任务分层设界并报告置信区间。示例起点：Canonical Macro ≥ reference −1pp、压力 profile ≥ −2pp、任务族 ≥ −5pp——具体数值必须按 reference 重复运行方差与业务风险校准，不能直接冻结。**评估团队的第一个执行动作就是测这个方差**：在冻结 manifest 上以不同 policy noise seed 集重复运行 reference π0.5（每 benchmark ≥5 次），报告任务级成功率方差与自翻转率——它同时是 δ 校准、功效计算和"残余非确定性"三件事的基线，此前一切门槛都是占位符。

**配对统计检验**（把上面的原则落成可执行的检验栈）：

- **Gate 主检验不用 vanilla McNemar**：McNemar 的 H0 是"无差异"（优效框架），不显著 ≠ 非劣——样本越少越容易"过门"，方向反了。主检验用配对比例差的 **Nam–Tango score 检验/置信区间**（Nam 1997; Tango 1998），对 Δ = p_cand − p_ref 的单侧 95% 下界 > −δ 才判非劣，举证责任在 candidate。
- **McNemar 保留在 Diagnostic 层**：对 n₁₀/n₀₁ 翻转不对称做快速报警（不一致对少时用 exact / mid-p 版本），不作验收结论。
- **Episodes 按任务聚类，不是 i.i.d.**：Macro/profile 层检验用按任务分层（CMH 型）或 task 级 cluster bootstrap，直接池化 episodes 会让 CI 假窄。
- **连续指标**（progress、time-to-success、轨迹量）用 paired Wilcoxon signed-rank 或 permutation test。
- **稀疏不一致对**（Canonical 高分区）用 exact 方法或 Bayesian beta-binomial，报后验 P(Δ > −δ)。
- **顺序扩样 = interim analysis**：100→300→500 若每档都判定会膨胀 I 类错误；用 O'Brien–Fleming 型 alpha-spending（早期档只允许"明确失败即停"），正式非劣判定只在最终档做。
- **多层门槛用 gatekeeping**：固定顺序（Macro → profile → 任务族）控制族错误率。
- **功效由不一致率 ψ = p₁₀+p₀₁ 决定**：n ≳ (z_α+z_β)²·ψ/δ²。ψ≈6% 时 δ=2pp 需 ~900 对、δ=1pp 需 ~3,700 对——Macro 的 −1pp 门槛只有池化全任务后才有功效，单任务 500 对最多支撑 −5pp；"Macro 严、任务族宽"的分层界限由此而来。
- **无法配对的基准**（BEHAVIOR，仿真非确定）退化为非配对两比例比较 + 任务聚类与多 rollout 平均，检测灵敏度显著下降，故只承担压力测试不承担非劣验收（见 §2.6）。

**顺序扩样控制算力**：先 100 rollouts/task（或全量固定实例 ×1），明确通过或失败即停；仅临界项扩到 300、再到 500。若 50 任务 × 4 profile × 500 次全跑，单模型 10 万 episodes、成对 20 万——仿真便宜不等于可以忽略统计设计。日常节奏：PR smoke（LIBERO 每套件 2 任务 × 10）→ 开发日常回归（公开全量 × 10–100）→ 评估预检（ESAS 各 profile × 100 配对）→ 正式发布（公开全量 + Private Validation + Sealed Holdout）。

## 5. 各研究方向的评测映射

| 研究方向 | 开发团队公开自评 | 评估团队私有验收 | 主要观察量 |
|---|---|---|---|
| 模型推理优化（量化/token 压缩/flow 降步/算子编译） | 原始 LIBERO 40 + RoboCasa Public-50（涉双臂再加 RoboTwin 全量） | ESAS-LIBERO Canonical-Heldout + ESAS-RoboCasa Precision-Core（+ ESAS-RoboTwin Canonical/Control） | paired delta、成败翻转、长程退化、轨迹漂移 |
| 具身 Agent 框架 | LIBERO-10 + LIBERO-PRO + RoboCasa365 Composite（日常自报）；BEHAVIOR-Core-20（发布级） | ESAS-LIBERO Grounding / Task-Generalization；composite 验收集待 Agent 抬出地板区后实例化（§3.4） | predicate progress、端到端成功、恢复次数、规划开销 |
| 仿真与真机 RL 框架 | 固定 policy 的 LIBERO / RoboCasa Canonical 配对回归（框架改动前后） | ESAS Canonical profiles 复测 | 环境语义等价性（同 seed 轨迹/成功率一致）、确定性、吞吐 |
| 物理引擎加速（MuJoCo） | RoboCasa Atomic-Seen + LIBERO 40（同 MuJoCo 栈）+ trace/oracle/闭环三层 | ESAS-RoboCasa Physics-Core + Precision-Core | 接触事件、状态轨迹误差、数值稳定性、任务成功 |
| 渲染引擎加速（软件光追 / 3DGS） | LIBERO-Plus 全量 + RoboTwin randomized | ESAS-LIBERO Observation-Robustness + ESAS-RoboTwin Visual（固定场景 paired renderer） | 任务成功 + 感知导致的动作分歧；不能只报 PSNR |

方向级说明：

- **物理引擎（MuJoCo）**：主承载是同栈的 RoboCasa 与 LIBERO；RoboTwin/ManiSkill 是 SAPIEN/PhysX，**测不到 MuJoCo 的改动**，只作跨引擎行为参照（防止只对单一引擎生态过拟合）。组件级物理探针（摩擦滑移、堆叠、插入、铰接、闭链）建议直接在 MuJoCo 上构造或复用 RoboCasa atomic 任务 + trace 重放。
- **仿真与真机 RL 框架**：框架（并行化、数据管线、reset 逻辑）改动不应改变任务语义，验收方式是固定同一 policy、同一 seed 做改动前后配对回归，验证轨迹与成功率等价；训练侧收敛性验证与真机侧见 [[Real-robot evaluation]]，不在本页。
- **渲染 / 3DGS**：要区分两种配对——"同一新场景比较两个模型后端"和"同一物理状态经 reference/candidate renderer 输出"；后者才能把差异归因于 renderer。
- **Agent 框架**：LIBERO-PRO 的价值在反记忆与任务泛化；BEHAVIOR 承担导航、记忆与部分完成度。

### 端到端验收流水线（一个提交的完整旅程）

通用规则，五个方向共用：

- **漏斗结构**：靠前的站零/低成本、高频、打回制；靠后的站贵、低频、验收制。任一站失败回上一站修复后重进，**不得跳站**。
- **判据类型逐站演进**：筛查（打回制）→ 自报回归（附附录 A.3 配置指纹）→ 配对非劣（评估团队，gatekeeping，§4）→ 大效应否决（真机 R1）。
- 开发自报必须附配置指纹，评估团队验收时复核指纹与提交一致；验收提交频率受 §3.1 治理限制。

以最长的**推理优化**流水线为完整示例：

```text
[开发·每次提交]   R0 动作分歧筛查（logged 真实观测配对推理，异常打回）
       ↓          PR smoke：LIBERO 每套件 2 任务 × 10（崩溃/严重退化打回）
[开发·合入前]     公开回归自报：LIBERO 40×50 + RoboCasa-50×50（涉双臂加 RoboTwin 全量）
       ↓          判据：对本地 backend reference 的 paired delta；附配置指纹
[评估·申请验收]   ESAS 预检：Canonical-Heldout + Precision-Core（+RoboTwin Canonical/Control）× 100 配对
       ↓          判据：Nam–Tango 非劣 + gatekeeping；临界项扩样 300→500
[评估·正式发布]   Sealed Final Holdout（全 Gate 非劣）
       ↓          真机 R1：首跑安全门 → 交错 A/B（抽屉大 n 探针 + 叠碗 + 双臂交接）
       ↓          判据：大效应检验不触发 + CI 披露；CDF / win-ratio 无显著劣化
发布报告：全层结果 + 配置指纹 + 精度 × 加速 Pareto
```

五个方向的站位对照（站位相同，内容不同）：

| 方向 | ① 开发自检（每提交，打回制） | ② 公开回归（合入前，自报+指纹） | ③ ESAS 验收（评估团队，非劣） | ④ 发布级 / 里程碑 |
|---|---|---|---|---|
| 推理优化 | R0 动作分歧 + PR smoke | LIBERO 40 + RoboCasa-50（+RoboTwin 全量） | Canonical-Heldout + Precision-Core（+RoboTwin Canonical/Control）→ Sealed Holdout | 真机 R1 交错 A/B |
| Agent 框架 | 框架单测 + LIBERO-10 smoke | LIBERO-10 + LIBERO-PRO + RoboCasa Composite 自报 | ESAS-LIBERO Grounding / Task-Generalization 配对 | BEHAVIOR-Core-20（统计比较，不可配对）+ 真机 R1 长程串联 + 扰动恢复 |
| RL 框架 | R0 数据管道回归 + 固定 policy 冒烟 | 固定 policy × 新旧框架 × 公开 Canonical，统计等价（双向非劣） | ESAS Canonical 复测（等价性） | 真机框架等价性 + 安全清单；真机 RL 上线后执行 R2 环路 |
| 物理引擎 | MuJoCo 组件探针（待建，见 §6）+ R0 real-log 重放 | RoboCasa Atomic + LIBERO 40 的 trace / oracle / 闭环三层 | ESAS-RoboCasa Physics-Core + Precision-Core | 无常驻真机；秩相关校准 +（条件触发）sim2real A/B |
| 渲染 / 3DGS | 图像层指标 + R0 动作分歧（真实图像 vs 重渲染） | LIBERO-Plus 全量 × 1 + RoboTwin randomized | ESAS-LIBERO Observation-Robustness（双配对）+ ESAS-RoboTwin Visual | 无常驻真机；R2 3DGS real2sim 三臂环路 |

真机侧各站的协议细节（R0 数据集冻结、首跑安全门、交错 A/B、统计）见 [[Real-robot eval bench - task suite design and setup checklist]]。

## 6. 尚未冻结的关键问题

1. π0.5 在 RoboTwin 与 BEHAVIOR 上的团队 checkpoint 与训练 recipe 如何固定（官方 cotrain 70.7/46.0 与 Motus 42.98/43.84 的差距说明 recipe 决定基线）？RoboTwin 官方 cotrain recipe 已可查（XPolicyLab：`pi05_base` 初始化、60k steps、batch 256、seed 0/1/2 三席），可直接采用；BEHAVIOR 仍需自训。
2. 每日、周度、发布评测的 GPU-hour 预算？
3. ESAS 各 profile 的任务纳入规则、扰动范围与基线可解性门槛如何冻结？
4. RoboCasa 18 个 Atomic-Seen 在 1.0.1 + π0.5 reference 下的逐任务成功率、方差与失败模式（决定 Precision/Physics-Core 名单）？
5. `BEHAVIOR-Core-20` 的分层抽样规则与最终清单？
6. 非劣性界限按 Macro / profile / 任务族 / 关键任务如何分层校准？
7. 物理 trace 重放的数据格式、状态对齐方式与容差定义？
8. 是否把吞吐、实时因子、显存、能耗与精度做成统一 Pareto 报告？
9. MuJoCo 组件级物理探针任务集的具体构成？
10. Agent 框架把 RoboCasa Composite 抬出地板区后，composite 验收集的实例化触发条件（成功率区间、稳定性要求）与规模如何冻结？

## 7. 摘要

```text
共同任务池（开发自评 + 评估复用）
  LIBERO 40 (10/5) ·  LIBERO-Plus 10,030×1 · LIBERO-PRO 40×5×50
  RoboTwin 50×100×2 · RoboCasa365 Public-50×50 (50/5) · BEHAVIOR 100

ESAS（评估团队私有）
  ESAS-LIBERO   Canonical-Heldout / Observation-Robustness / Grounding
                / Task-Generalization / Compound
  ESAS-RoboTwin Canonical / Visual / Physics / Control / Compound
  ESAS-RoboCasa Precision-Core / Physics-Core / Scene-Object-Heldout（审计）
                （Composite 能力压力由开发自报，Agent 抬出地板区后再实例化验收集）
  挡位：Gate / Diagnostic / Stress；Private Validation → Sealed Holdout

判定：逐 episode 配对 + 分层非劣性 + 顺序扩样（100→300→500）

方向映射：
  推理优化   → LIBERO + RoboCasa ⇒ Canonical-Heldout + Precision-Core
  Agent      → LIBERO-PRO + BEHAVIOR ⇒ Grounding / Task-Gen + Core-20
  RL 框架    → 固定 policy 配对回归 ⇒ Canonical 复测
  物理(MuJoCo)→ RoboCasa + LIBERO + trace/oracle/闭环 ⇒ Physics-Core
  渲染/3DGS  → LIBERO-Plus + RoboTwin randomized ⇒ OR + Visual paired renderer

验收流水线：自检（打回制）→ 公开自报（附指纹）→ ESAS 非劣（gatekeeping）
            → 真机 R1（大效应否决）；任一站失败回上一站，不得跳站
```

## 附录 A：π0.5 详细运行协议与代码依据

除声明的被测变量外，reference 与 candidate 不得改变下列任何字段。

### A.1 LIBERO 系（原始 / Plus / PRO / ESAS-LIBERO 共同 Policy Contract）

| 配置项 | Reference 值 |
|---|---|
| checkpoint | `gs://openpi-assets/checkpoints/pi05_libero`（30k finetuned，记录 hash） |
| 模型配置 | `Pi0Config(pi05=True, action_horizon=10, discrete_state_input=False)`；数据配置 `extra_delta_transform=False` |
| 计算精度 / 结构 | BF16；PaliGemma `gemma_2b` + `gemma_300m` action expert；max token 200；内部 action 32 维取前 7 维 |
| flow steps / chunk | **10 / 预测 10 / 执行 5**；执行 5 步后丢弃剩余重新观测推理；smoothing/ensemble 关闭；同步交互 |
| 观测 | 仿真渲染 256×256 → resize-with-pad 224×224 uint8；agent + wrist 双相机均旋转 180°；right-wrist 槽位零图并 mask；proprio 8 维（EEF pos + quat→axis-angle + gripper qpos） |
| 采样 | 50 rollouts/task；env seed 7；初始等待 10 步；max steps 220/280/300/520；normalization 用 checkpoint 自带 norm stats |
| 异常 | 记录并按预定义规则计入，不得静默重跑或事后筛除 |

代码依据：[OpenPI config](https://github.com/Physical-Intelligence/openpi/blob/main/src/openpi/training/config.py)、[模型配置](https://github.com/Physical-Intelligence/openpi/blob/main/src/openpi/models/pi0_config.py)（`sample_actions` 默认 10 步）、[评测脚本](https://github.com/Physical-Intelligence/openpi/blob/main/examples/libero/main.py)（`replan_steps=5`、seed 7、等待 10 步、按 suite 固定 max steps）、[policy adapter](https://github.com/Physical-Intelligence/openpi/blob/main/src/openpi/policies/libero_policy.py)。

Benchmark 差异：Plus 用固定实例自带配置 ×1 rollout；PRO 用 50/task/profile 且官方未冻结 env seed，团队复现写入 manifest；Plus/PRO 论文均未披露 π0.5 推理参数，本契约是 ESAS 规定。

### A.2 RoboCasa 系

| 配置项 | Reference 值 |
|---|---|
| checkpoint | [RoboCasa π0.5 Human300 @ 75k](https://huggingface.co/robocasa/robocasa365_checkpoints/tree/main/pi05_pretrain_human300/multitask_learning/75000)；OpenPI fork commit `ca4c671` |
| 模型配置 | `Pi0Config(pi05=True, max_token_len=200)`；action_horizon 未覆写继承默认 **50**；discrete state 随 `pi05` 继承为 True；BF16；32 维 action 取前 12 维经官方 `convert_action()` |
| flow steps / chunk | **10 / 预测 50 / 执行 5** |
| 观测 | 三路相机均 224×224：left agentview → image、eye-in-hand → wrist_image、right agentview → right_image（π0.5 下不可省略）；proprio 16 维（EEF 相对位姿 + base 位姿 + gripper）pad 到 32 |
| 采样 | 50 trials/task；seed 7；split `pretrain`；**max steps = `get_task_horizon × 1.5`（1.0.0 提交的 runner 已含此乘法；1.0.1 已把 1.5× 烧进任务定义，迁移时严防 2.25× 双重乘法）**；success = `info["success"]` |

代码依据：[提交记录](https://github.com/robocasa-benchmark/leaderboard/blob/main/submissions_md/pi05_2026-04-02.md)、[训练配置](https://github.com/robocasa-benchmark/openpi/blob/ca4c6d710db75e276bc7c866a57bd7e4aee5b6e8/src/openpi/training/config.py)、[评测脚本](https://github.com/robocasa-benchmark/openpi/blob/ca4c6d710db75e276bc7c866a57bd7e4aee5b6e8/examples/robocasa/main.py)、[policy adapter](https://github.com/robocasa-benchmark/openpi/blob/ca4c6d710db75e276bc7c866a57bd7e4aee5b6e8/src/openpi/policies/robocasa_policy.py)。

### A.3 结果配置指纹（每个结果必附）

```text
model/checkpoint hash + norm_stats hash
openpi / benchmark / simulator commits or versions
backend/framework + dtype/quantization
flow_steps / predicted_horizon / executed_actions_per_chunk
cameras + preprocessing + observation-state schema
episode manifest hash + environment/policy seeds
integrator/timestep/solver/contact（物理方向）
task-horizon table hash + success-predicate version
```

## 附录 B：私有 manifest 字段参考

`perturbation_manifest`（OR / Grounding / Task-Generalization 通用骨架，按 profile 增删）：

```text
episode_id / parent_episode_id
base_task_id / suite / base_bddl_hash / derived_bddl_hash
instruction_hash / success_predicate_hash / predicate_mode   # same / remapped / unsatisfiable
axis / subaxis / severity
扰动参数（object pose/distractor、camera、qpos、light、texture、noise type+params+seed）
grounding 专用：instruction_variant_id / semantic_equivalence / decoy_object_ids / target_exists
task-gen 专用：task_recipe_id / goal_graph / feasibility_status（parseable/collision_free/reachable/oracle_solved）
generator_version / asset_manifest_hash
environment_seed / policy_noise_seed
simulator_config_hash / manifest_version
```

## Related

- [[Real-robot evaluation]] — 真机评测的任务、条件、统计与指标分层
- [[Real-robot eval bench - task suite design and setup checklist]] — 团队真机任务集草案
- [[VLA quantization]] — π0.5 等 VLA 推理优化的误差来源
- [[Physical Intelligence - pi0.5 a VLA with Open-World Generalization]] — π0.5 模型与代码级配置
- [[3D Gaussian Splatting]] — 3DGS 与物理引擎的边界
- [[Embodied failure detection]] — Agent 系统的失败检测与恢复
- [[Robot data engine]] — 评估在数据闭环中的位置

#embodied-ai #simulation #benchmark #evaluation #systems #vla #pi05 #rendering #physics-engine #3dgs
