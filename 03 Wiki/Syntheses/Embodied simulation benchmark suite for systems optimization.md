# 面向具身计算系统优化的仿真评测套件

> **定位**：为具身 Agent 架构、VLA 推理加速、渲染引擎、物理引擎与 3DGS 等系统优化建立统一的**端到端精度回归工作负载**。本页讨论的不是“如何评价一个仿真器是否逼真”，而是：替换或优化某个系统组件后，如何判断具身任务精度有没有退化，并能进一步定位退化来源。
>
> 制定于 **2026-08-06**。当前为 **v0.1 讨论稿**，后续需要根据团队算力预算、实际引擎、本体和 Agent 接口冻结具体 manifest。

## 1. 核心问题

团队可能同时优化：

- 具身 Agent 系统设计：规划、记忆、任务分解、失败恢复、VLA primitive 编排
- VLA 推理系统：量化、剪枝、蒸馏、算子融合、编译、KV cache、异步执行、action scheduling
- 渲染引擎：光栅化、光追、传感器生成、分辨率与采样策略
- 物理引擎：碰撞、接触求解、约束、积分器、并行化、时间步长与求解迭代数
- 3DGS：场景表示、可微或实时渲染、与物理引擎组合

统一问题是：

> **保持任务、模型与随机输入不变，只替换被优化组件，观察端到端任务精度是否退化。**

这里的“精度”不能只等同于平均成功率，还包括分阶段完成度、完成时间、轨迹质量、碰撞与异常退出等。

## 2. 为什么不能只选一个 benchmark

不同优化点会被不同任务放大：

| 优化点 | 最敏感的任务性质 | 单靠 LIBERO 是否足够 |
|---|---|---|
| VLA 推理加速 | 长程误差累积、精密对位、action chunk 重规划 | 否；适合共同回归，但物理与双臂覆盖不足 |
| Agent 架构 | 多阶段规划、导航、记忆、失败恢复、部分完成 | 否；LIBERO-Long 仍偏低层连续控制 |
| 渲染 / 3DGS | 物体辨识、空间定位、遮挡、相机和光照变化 | 部分；需增加 randomized 与家庭场景 |
| 物理引擎 | 接触、摩擦、滑移、堆叠、插入、铰接、双臂闭链 | 否；必须增加接触丰富任务和物理探针 |

因此采用：

> **共同核心回归集 + 优化点专项集**

而不是给所有系统优化只配一张总榜。

## 3. 建议的三套固定工作负载

### 3.1 `Embodied-Core`：LIBERO 四套件

所有涉及 π0.5 的系统优化共同必跑：

- `LIBERO-Spatial`：空间定位与视觉几何
- `LIBERO-Object`：物体与外观辨识
- `LIBERO-Goal`：目标和语言条件变化
- `LIBERO-10`：多阶段任务、长程执行与误差累积

四套件共 40 个任务。

**选择理由**：π0.5 已有官方 checkpoint、配置、评测代码和可复现结果，适合作为共同基线。OpenPI 官方报告 π0.5 @ 30k 在 Spatial / Object / Goal / 10 上分别为 **98.8 / 98.2 / 98.0 / 92.4**，平均 **96.85**（[OpenPI LIBERO README](https://github.com/Physical-Intelligence/openpi/blob/main/examples/libero/README.md)）。

**证据边界**：

- 优点：公开、可运行、π0.5 原生支持，适合持续回归和对外可比。
- 缺点：整体接近饱和；接触、复杂动力学、双臂和真正 Agent 级长程能力不足。
- 结论：可以证明“优化没有破坏 π0.5-LIBERO 能力”，不能单独证明物理引擎、双臂或 Agent 系统没有退化。

### 3.2 `Embodied-Manipulation-Stress`：RoboTwin-System-10

建议从 RoboTwin 2.0 冻结一个团队内部固定子集：

| 任务 | 主要敏感点 |
|---|---|
| `click_bell` | 小幅精密控制、接触触发 |
| `turn_switch` | 接触与关节约束 |
| `hanging_mug` | 精密对位与悬挂接触 |
| `stack_bowls_three` | 长程误差累积、堆叠稳定性 |
| `stack_blocks_three` | 对位、误差累积、接触稳定性 |
| `open_microwave` | 铰接物体与约束流形 |
| `beat_block_hammer` | 工具使用、碰撞和接触 |
| `shake_bottle` | 连续动态动作 |
| `handover_block` | 双臂顺序协作 |
| `lift_pot` | 双臂同步与闭链耦合 |

这十个任务是**本库提出的内部回归集**，不是 RoboTwin 官方命名的独立套件。后续应冻结任务版本、修复补丁、资产 hash 和 task config。

#### 官方档位与内部扩展的边界

RoboTwin 2.0 官方完整平台包含 50 个双臂任务、五类本体；官方 benchmark / leaderboard 实际提供两档（[官方任务页](https://robotwin-platform.github.io/doc/tasks/)）：

- `demo_clean`：Clean / Easy
- `demo_randomized`：Domain-randomized / Hard

论文标准是每任务用 50 条 clean demonstrations 训练，Easy 与 Hard 各评测 100 次（[论文](https://arxiv.org/abs/2506.18088)）。官方公开的 domain-randomization 字段包括：

- `random_background`
- `cluttered_table`
- `clean_background_rate`
- `random_head_camera_dis`
- `random_table_height`
- `random_light`
- `crazy_random_light_rate`
- `random_embodiment`（实验性，尚未完全支持）

因此官方 `demo_randomized` 主要是**视觉外观 + 相机 + 场景杂乱度 + 桌面几何**的综合随机化；公开通用配置里没有质量、摩擦、关节阻尼、接触刚度、控制延迟或丢帧等标准字段（[官方配置文档](https://robotwin-platform.github.io/doc/usage/configurations.html)）。它不应被解释成完整的“视觉 + 物理 + 控制”随机化。

为兼顾官方可比性与内部归因，`RoboTwin-System-10` 应保留五个明确命名的 profile：

```text
RoboTwin-System-10
├── official_clean
├── official_randomized
├── internal_visual_hard
├── internal_physics_hard
└── internal_control_hard
```

- 前两档原样复现官方协议，用于对外可比。
- 后三档是**本库提出的团队内部扩展**，不是 RoboTwin 官方现成档位，也不能作为官方 leaderboard 分数上报。

#### `internal_visual_hard`：主要新增 YAML

大部分可以复用官方字段，不必修改底层引擎。为隔离视觉因素，应关闭会改变任务几何的 `random_table_height`：

```yaml
domain_randomization:
  random_background: true
  cluttered_table: true
  random_head_camera_dis: 0.03
  random_table_height: 0
  random_light: true
  random_embodiment: false
```

若要加入更细的遮挡、相机内参、传感器噪声或 3DGS 特有退化，仍需扩展 renderer / sensor 配置。

#### `internal_physics_hard`：需要扩展环境代码

官方通用 YAML 没有完整物理随机化接口，需要在 task reset / asset load 阶段把自定义参数写入 SAPIEN actor、articulation 和 material，例如：

```yaml
physics_randomization:
  object_mass_scale: [0.7, 1.3]
  friction_scale: [0.6, 1.4]
  joint_damping_scale: [0.8, 1.2]
  restitution_range: [0.0, 0.1]
  center_of_mass_offset_m: 0.01
```

参数必须按任务绑定：`open_microwave` 重点改铰链阻尼，`lift_pot` 改质量与质心，`stack_bowls_three` 改摩擦与接触参数，`shake_bottle` 改质量与惯量。不能对所有资产无差别乘同一个随机系数。

#### `internal_control_hard`：需要扩展评测 wrapper

场景与物理保持不变，在 policy–environment 接口注入时序扰动：

```yaml
control_stress:
  observation_delay_steps: 2
  action_delay_steps: 1
  observation_drop_rate: 0.02
  action_repeat: 2
  proprio_camera_skew_steps: 1
```

RoboTwin 的 policy deployment 接口允许定制 `eval()`、`update_obs()`、`get_action()`，可在 wrapper 中实现延迟队列、丢帧和不同步，而不污染任务本身（[官方部署接口](https://robotwin-platform.github.io/doc/usage/deploy-your-policy.html)）。

三个内部 hard 应首先采用**单因素实验**；只有最终系统压力测试才增加 `mixed-hard = visual + physics + control`。`mixed-hard` 可以检验综合鲁棒性，但不能用于退化归因。

### 3.3 `Embodied-Agent`：BEHAVIOR-Core-20 / Full-100

用于 Agent 系统设计、长程任务、导航、记忆、任务分解和失败恢复：

- 日常或周度：固定 `BEHAVIOR-Core-20`
- 版本发布：`BEHAVIOR-Full-100`

BEHAVIOR 2026 官方赛道使用 RGB + depth + proprioception，测试时禁止 ground-truth segmentation、物体状态、目标位姿、全场景点云与机器人全局位姿等仿真器内部真值。主要指标是 100 个任务上最终满足的 BDDL goal predicates 比例，并提供部分完成分；timeout 默认是相应任务人类演示平均长度的 1.5 倍（[官方评测规则](https://behavior.stanford.edu/challenge/evaluation.html)）。官方挑战已经提供 π0.5 baseline 与兼容 OpenPI 的 websocket 接口（[2026 Challenge](https://behavior.stanford.edu/challenge/index.html)）。

`Core-20` 不应按“π0.5 当前会不会做”挑选，而应按以下变量分层抽样：

- 人类演示长度 / 任务 horizon
- goal predicate 数量
- 是否需要导航
- 是否需要双臂或移动操作
- 是否涉及搜索、遮挡和记忆
- 是否存在可恢复失败与不可逆失败

## 4. 各类优化应该跑什么

| 优化方向 | 必跑 | 专项追加 | 主要精度观察量 |
|---|---|---|---|
| π0.5 量化 / 推理加速 | LIBERO 40 | RoboTwin-System-10，重点 Long / 堆叠 / 精密 / 双臂 | paired success delta、长程退化、轨迹漂移、timeout |
| Agent 架构 | LIBERO-10 | BEHAVIOR-Core-20 / Full-100 | predicate progress、端到端成功、恢复次数、规划开销 |
| 渲染引擎 | LIBERO Spatial + Object | RoboTwin `visual-hard`、BEHAVIOR 视觉搜索任务 | 成功率、感知导致的动作分歧、视觉压力曲线 |
| 3DGS | LIBERO Spatial + Object | 固定场景 paired renderer、遮挡/视角/新背景 | 任务精度 + 图像/特征差异；不能只报 PSNR |
| 物理引擎 | LIBERO sanity check | RoboTwin contact set + ManiSkill 物理探针 | 接触事件、状态轨迹误差、任务成功、数值稳定性 |

## 5. 物理引擎专项不能只用闭环 π0.5

物理引擎优化至少需要三种执行方式：

1. **固定 action trace 重放**：隔离物理引擎变化，比较状态轨迹、接触、穿透和约束误差。
2. **scripted / oracle controller**：测试任务是否仍可稳定完成，排除视觉和 VLA 推理干扰。
3. **π0.5 闭环 policy**：测最终系统影响。

建议的 ManiSkill 物理探针类别：

- push / slide：摩擦与滑移边界
- StackCube：接触稳定与堆叠
- PegInsertionSide：碰撞、插入和小容差
- drawer / cabinet：关节、阻尼与摩擦约束
- pick-and-place：抓取接触
- 双臂搬运：闭链约束

ManiSkill 的 Task Card 会明确机器人、随机化、成功/失败条件和观测，并提供 GPU 并行刚体任务，适合作为组件级探针（[ManiSkill Tasks](https://maniskill.readthedocs.io/en/latest/tasks/)）。

## 6. 任务配置标准

### 6.1 两类配置

#### Canonical

严格复现官方协议，用于对外可比：

- 官方代码、任务和资产版本
- 官方本体、相机、控制频率和 timeout
- 官方初始状态与语言指令
- 官方 success predicate
- 不私自增加 domain randomization

#### Stress（内部扩展）

用于内部发现退化：

- `internal_visual_hard`
- `internal_physics_hard`
- `internal_control_hard`

RoboTwin 的 Canonical 还应区分 `official_clean` 与 `official_randomized`。Canonical 与 Stress 必须分开报告，不能把内部随机化后的结果当作官方 benchmark 分数。

### 6.2 配对评测

Reference 与优化版本必须使用完全相同的：

```text
(task_id,
 initial_state_id,
 environment_seed,
 policy_noise_seed,
 instruction,
 timeout)
```

π0.5 的 flow-matching 推理从随机噪声开始，因此只固定环境 seed 不够。需要同时固定环境随机性与模型噪声，并做逐 episode 配对比较。

### 6.3 结果聚合

不能只报所有 rollout 的单个平均成功率。至少报告：

- 每任务 success rate
- 每 suite macro average，避免任务 rollout 数不同造成加权污染
- reference → candidate 的 paired success delta
- LIBERO-10 / 长程任务单列
- 最差 10% 任务的平均退化
- 分阶段 progress 或 predicate completion
- time-to-success / timeout rate
- 成功 rollout 上的轨迹长度、jerk 或动作抖动
- 碰撞、保护触发、异常退出和 simulator error

连续诊断指标与成功率的关系沿用 [[Real-robot evaluation]]：连续量主要用于筛选和归因，不能自动替代任务验收。

## 7. π0.5-LIBERO reference 配置

以下来自当前 OpenPI 官方代码和评测脚本，应作为第一版冻结基线：

| 配置项 | Reference |
|---|---|
| checkpoint | `gs://openpi-assets/checkpoints/pi05_libero` |
| checkpoint 阶段 | 30k finetuned |
| 计算精度 | BF16 |
| VLM | PaliGemma `gemma_2b` |
| action expert | `gemma_300m` |
| flow-matching steps | 10 |
| action horizon | 10 |
| replan interval | 执行 5 步后重新推理 |
| 图像输入 | 224 × 224 |
| 相机 | agent view + wrist view |
| `discrete_state_input` | `False` |
| norm stats | 随官方 checkpoint / config 固定 |
| benchmark seed | 7 |
| 初始稳定等待 | 10 simulator steps |
| 正式 rollout | 50 / task |
| max steps | Spatial 220 / Object 280 / Goal 300 / LIBERO-10 520 |

代码依据：

- `pi05_libero` 使用 `Pi0Config(pi05=True, action_horizon=10, discrete_state_input=False)`，训练 30k steps（[OpenPI config](https://github.com/Physical-Intelligence/openpi/blob/main/src/openpi/training/config.py)）。
- π0.5 默认 BF16，PaliGemma `gemma_2b` + `gemma_300m` action expert；`sample_actions` 默认 10 个 flow steps（[模型配置](https://github.com/Physical-Intelligence/openpi/blob/main/src/openpi/models/pi0_config.py)、[模型实现](https://github.com/Physical-Intelligence/openpi/blob/main/src/openpi/models/pi0.py)）。
- 官方 LIBERO runner 使用 224 输入、`replan_steps=5`、每任务 50 次、seed 7，并按 suite 设置不同 timeout（[评测脚本](https://github.com/Physical-Intelligence/openpi/blob/main/examples/libero/main.py)）。

### 两个 reference，而不是一个

系统优化最好保留两个参照：

1. **Official reference**：官方 JAX / BF16 / 官方 checkpoint，用于验证能否复现公开结果。
2. **Local backend reference**：团队实际后端在“未优化”状态的 BF16/FP16 实现，用于与量化、编译或算子优化做公平配对。

若直接拿官方 JAX 与本地 PyTorch + 自定义 kernel 比，差异会同时包含框架、预处理、checkpoint 转换和系统优化，难以归因。

## 8. 不同频率的运行规模

| 级别 | 建议规模 | 目的 |
|---|---|---|
| PR smoke | LIBERO 每套件 2 个任务 × 10 rollouts | 排除崩溃与严重精度问题 |
| 日常回归 | LIBERO 40 × 10 | 发现明显退化；不用于小差异结论 |
| 周度回归 | LIBERO 40 × 50 + RoboTwin-System-10 × 50 | 系统级比较与回归定位 |
| 版本发布 | LIBERO 40 × 50 + RoboTwin 10 × 100 × 多档 + BEHAVIOR Full-100 | 对外结论和跨层验证 |

具体数字后续应根据算力预算和希望检测的最小退化幅度做功效分析。仿真 rollout 便宜不等于可以忽略统计设计。

## 9. 尚未冻结的关键问题

1. 团队实际使用哪些仿真器和引擎：MuJoCo / SAPIEN / Isaac / OmniGibson / 自研？
2. π0.5 在 RoboTwin 与 BEHAVIOR 上使用官方、社区还是团队自训 checkpoint？训练 recipe 如何固定？
3. 每日、周度、发布评测的 GPU-hour 预算分别是多少？
4. `RoboTwin-System-10` 是否需要替换故障或不稳定任务，并建立任务资产 hash？
5. `BEHAVIOR-Core-20` 的分层抽样规则和最终任务清单是什么？
6. 精度守门采用固定绝对阈值，还是相对 reference 的非劣性界限？
7. 渲染与物理优化的固定 trace 数据格式、状态对齐方式与容差如何定义？
8. 是否需要将吞吐、实时因子、显存、能耗与精度做成统一 Pareto 报告？

## 10. 当前建议摘要

```text
Embodied-Core
  LIBERO-Spatial / Object / Goal / 10

Embodied-Manipulation-Stress
  RoboTwin-System-10
  official_clean / official_randomized
  internal_visual_hard / internal_physics_hard / internal_control_hard

Embodied-Agent
  BEHAVIOR-Core-20
  BEHAVIOR-Full-100
```

- LIBERO：所有优化共同必跑，承担 π0.5 可复现基础回归。
- RoboTwin：承担接触、精密、双臂、动态和随机化压力测试。
- BEHAVIOR：承担 Agent、长程、导航、记忆与部分完成评估。
- ManiSkill：作为物理引擎的组件级任务探针，不强求全部由 π0.5 驱动。
- 不同 benchmark 必须使用各自适配或微调的 π0.5 checkpoint；不能用 `pi05_libero` 零样本运行其他本体后，把低分归因于系统优化。

## Related

- [[Real-robot evaluation]] — 真机评测的任务、条件、统计与指标分层
- [[Real-robot eval bench - task suite design and setup checklist]] — 团队真机任务集草案
- [[VLA quantization]] — π0.5 等 VLA 推理优化的误差来源
- [[Physical Intelligence - pi0.5 a VLA with Open-World Generalization]] — π0.5 模型与代码级配置
- [[3D Gaussian Splatting]] — 3DGS 与物理引擎的边界
- [[Embodied failure detection]] — Agent 系统的失败检测与恢复
- [[Robot data engine]] — 评估在数据闭环中的位置

#embodied-ai #simulation #benchmark #evaluation #systems #vla #pi05 #rendering #physics-engine #3dgs
