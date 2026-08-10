# 面向具身计算系统优化的仿真评测套件

> **定位**：为具身 Agent 架构、VLA 推理加速、渲染引擎、物理引擎与 3DGS 等系统优化建立统一的**端到端精度回归工作负载**。本页讨论的不是“如何评价一个仿真器是否逼真”，而是：替换或优化某个系统组件后，如何判断具身任务精度有没有退化，并能进一步定位退化来源。
>
> 制定于 **2026-08-06**。当前为 **v0.6 讨论稿**，后续需要根据团队算力预算、实际引擎、本体和 Agent 接口冻结具体 manifest。

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

## 3. 建议的分层固定工作负载

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

#### LIBERO 的三层使用方式

原始 LIBERO 同样不应独自承担开发回归、鲁棒性诊断与最终质量验收。建议拆成：

1. **Public Compatibility**：原始 LIBERO 40，复现官方 π0.5 配置和公开结果。
2. **Public Robustness / Generalization**：开发团队运行公开的 LIBERO-Plus 与 LIBERO-PRO，发现视觉、条件和任务泛化问题。
3. **Private Acceptance**：评估团队维护 `ESAS-LIBERO`，复用 Plus/PRO 的扰动设计，但使用隐藏的 seed、资产、指令、位置、任务组合与 Final Holdout。

公开 Plus/PRO 不能替代私有验收：只要实例、组合和反馈长期暴露，开发团队仍可能直接训练或反复调参。另一方面，单纯隐藏原始 LIBERO seed 也不能解决 π0.5 接近 97% 的天花板效应；ESAS-LIBERO 还需把 reference 成功率校准到有区分度的区间。

#### LIBERO-Plus：条件鲁棒性与 covariate shift

LIBERO-Plus 在原任务结构基本不变的前提下，构造 **10,030** 个评测实例，覆盖 7 个扰动维度、21 个子维度，并按经验难度分成 Level 1–5（[论文](https://openaccess.thecvf.com/content/CVPR2026/papers/Fei_LIBERO-Plus_A_Progressive_Robustness_Benchmark_for_Visual-Language-Action_Models_CVPR_2026_paper.pdf)、[官方代码库](https://github.com/sylvestf/LIBERO-plus)）：

| 维度 | 变化 | 对系统优化的价值 |
|---|---|---|
| Object Layout | 干扰物、目标物位移 | 空间与目标定位、视觉 shortcut |
| Camera | 位姿、朝向、FOV | 渲染、3DGS、视角鲁棒性 |
| Robot Initial State | 机械臂初始姿态 | 固定动作模板依赖、控制闭环 |
| Language | 指令改写 | 语言表述鲁棒性 |
| Light | 强度、方向、颜色、阴影 | 光照与 renderer 鲁棒性 |
| Background | 场景和表面纹理 | 外观 shortcut |
| Sensor Noise | 模糊、抖动、光度退化 | 视觉编码器、压缩和传感器链路 |

它最适合渲染/3DGS、图像压缩、视觉编码器量化、相机变化和观测质量测试。论文先从 40 个原始任务、四个 suite 和七个维度生成 14,000 个候选实例，再过滤为 10,030 个 test-only 实例；这些实例已经把具体扰动展开成独立任务。因此全量 published protocol 的工作负载单位是 **一个固定 perturbed instance**，不是“一个原始 task 再抽 50 个 episodes”（[论文 Appendix C](https://arxiv.org/html/2510.13626)）。正式比较应让 reference 与 candidate 各运行同一批 10,030 个实例一次；需要扩样时应增加独立扰动实例，而不是把同一实例机械重复 50 次。

当前官方公开榜包含 π0、π0-Fast、OpenVLA 系列等结果，但不能把其他论文经额外 SFT 得到的 π0.5 数字称作 Physical Intelligence 官方 π0.5-LIBERO-Plus 基线。必须区分：

- **Zero-shot robustness**：只用原始 LIBERO 训练，直接在 Plus 上测试。
- **Plus-finetuned robustness**：训练中已见 Plus 数据；它回答的是增强训练后的性能，不再是对原始模型的 OOD 验收。

LIBERO-Plus 论文没有报告 π0.5，也没有替 π0.5 冻结 flow steps、action horizon 或每 chunk 执行步数。团队运行 π0.5-Plus 时，必须把本页第 7.1–7.2 节作为内部统一 Policy Contract；这是一项 **ESAS 规定**，不能反称为 Plus 官方模型配置。

#### LIBERO-PRO：grounding、任务泛化与反记忆

LIBERO-PRO 针对原始 LIBERO 训练任务与评测任务过度相似的问题，检查模型是否根据当前观测和指令在线决策，而不是重放记住的场景—轨迹映射（[论文](https://arxiv.org/abs/2510.03827)、[官方代码库](https://github.com/Zxy-MLlab/LIBERO-PRO)）。论文把它概括为四类高层变化；当前代码库实际提供五个配置轴：

| 维度 | 变化 | 主要判断 |
|---|---|---|
| Object | 外观、颜色、尺度或对象变化 | 是否正确绑定视觉对象 |
| Position | 对象移动到新的可行位置 | 是否依赖固定抓取点和轨迹 |
| Semantic | 等价指令改写 | 是否理解语言而非记模板 |
| Task | 改变目标对象、目标状态或任务逻辑 | 是否能组合和执行新任务 |
| Environment | 替换工作环境 | 是否能跨场景迁移 |

Plus 与 PRO 有对象、位置、语言和环境上的重叠，但问题不同：**Plus 主要问同一个任务在输入条件变化后是否稳健；PRO 进一步问对象、位置、目标或任务逻辑变化后，模型是否真正理解当前任务。** `Task` 因而不是普通视觉 hard，而是 task/goal shift。

LIBERO-PRO 作者当前报告 π0.5 总体约 **0.53**；Object 与 Semantic 多在 0.92–0.98，Position 为 0.08–0.38，Task 几乎为 0–0.01，Environment 为 0.46–0.73（四个原始 suite 分别报告）。这不是 Physical Intelligence 官方成绩，但足以说明使用边界：

- Object、Semantic 和经过校准的 Environment/Position 可用于 regression 或 grounding 验收。
- 接近地板的 Task 与困难 Position 只能作为 `Capability-Stress`，不适合判断 1–3pp 的量化或算子回退。
- 对 Agent、重规划、失败恢复和 memory/harness 系统，PRO 比单纯视觉扰动更有价值。

LIBERO-PRO 明确规定每个 task 运行 **50 episodes**，并沿用 Spatial 220 / Object 280 / Goal 300 / LIBERO-10 520 的 horizon；但论文和仓库没有完整披露其 π0.5 的 flow steps、predicted horizon、executed actions、policy noise seed 与初始等待。因此其公开 π0.5 分数不能直接宣称与本页第 7.2 节的 10/10/5 协议完全同构。团队复现时仍统一采用第 7.1–7.2 节，并把差异写入结果元数据（[论文 §5.1](https://arxiv.org/html/2510.03827)、[官方配置与代码](https://github.com/Zxy-MLlab/LIBERO-PRO)）。

#### `ESAS-LIBERO` 建议结构

```text
ESAS-LIBERO
├── Canonical-Heldout
├── Covariate-Robustness
├── Grounding
├── Task-Generalization
└── Compound
```

- `Canonical-Heldout`：保持原始任务和正常分布，隐藏初始状态、环境/模型 seed、指令模板和合法对象位置；承担纯计算路径的主要非劣性验收。
- `Covariate-Robustness`：主要复用 Plus 的 Camera、Robot、Layout、Light、Background、Noise。Level 1–3 或 reference 位于约 30%–80% 的实例用于精度回归；更困难实例进入压力集。
- `Grounding`：结合 Plus Language 与 PRO Object/Semantic，检查指令—对象—动作绑定、干扰物和目标存在性。
- `Task-Generalization`：主要复用 PRO Position/Task/Environment；中等难度项可守门，地板项只作能力压力和未来模型突破跟踪。
- `Compound`：只在最终验收中组合轻量 Covariate、Grounding 与 Task-Generalization 变化，不用于首轮归因。

ESAS-LIBERO 不设置独立 Control 或 Physics 数据轴：推理时延、chunk scheduling 等由开发团队验证；评估团队负责冻结统一运行协议，确保所有提交使用相同 action horizon、实际执行步数和控制接口。复杂物理与接触仍由 ESAS-RoboTwin 和 ManiSkill 主承载。

### 3.2 RoboTwin 2.0：公开开发回归与 ESAS 私有验收

RoboTwin 2.0 在本体系中分成两个用途，不能再让一个固定十任务子集同时承担开发回归、精度验收和能力压力测试：

1. **公开开发回归**：开发团队运行 RoboTwin 2.0 全部 50 个任务的 `official_clean` 与 `official_randomized`，用于日常回归、公开可比和问题定位。
2. **评估团队验收**：评估团队维护 **ESAS（Embodied System Acceptance Suite，具身系统验收套件）**，其中 RoboTwin 派生部分命名为 `ESAS-RoboTwin`。它使用隐藏、配对、版本冻结的任务实例，作为量化、推理加速、算子替换、渲染、物理和控制优化的最终质量守门。

`ESAS-RoboTwin` 是团队内部派生套件，不是 RoboTwin 官方 benchmark，结果不能作为官方 leaderboard 分数上报。

#### 原 `RoboTwin-System-10` 的重新定位

早期建议的十任务如下：

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

这十个任务是按接触、精密、双臂、工具和动态能力覆盖挑选的**早期能力压力候选集**，不是 RoboTwin 官方套件，也没有经过 π0.5 逐任务成功率分布校准。Motus 作者自行联合训练的 π0.5 在其中存在明显地板和天花板任务，例如 `lift_pot` 为 0/0、`hanging_mug` 为 3/3、`shake_bottle` 为 91/100（clean/randomized）；十任务均值为 33.8/34.2，低于其全 50 任务均值 42.98/43.84（[Motus Table 14](https://arxiv.org/html/2512.13030)）。

因此：

- 它可以保留为日常快速诊断或 `Capability-Stress` 候选，不能直接作为检测 1–3 个百分点小回退的最终精度集。
- RoboTwin 官方当前提供 π0.5 接入与训练说明，但官方 leaderboard 未发布 π0.5 全任务成功率；Motus 数字是作者自己的多任务训练复现，不能称为官方 π0.5 基线（[官方 π0.5 文档](https://robotwin-platform.github.io/doc/usage/Pi05.html)、[官方 leaderboard](https://robotwin-platform.github.io/leaderboard)）。
- ESAS 的任务和扰动范围应根据团队冻结的 reference π0.5 重复运行结果重新校准，避免大量 0% 或 100% 项。

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

#### `ESAS-RoboTwin` 的五个 profile

```text
ESAS-RoboTwin
├── Canonical
├── Visual
├── Physics
├── Control
└── Compound
```

- `Canonical`：保持官方任务语义和正常难度，只隐藏 seed、初始状态、语言模板、资产变体和场景组合；用于检测纯计算路径造成的回退。
- `Visual`：改变观测，不改变任务动力学；用于渲染、3DGS、视觉前处理及模型视觉鲁棒性验收。
- `Physics`：改变动力学，不改变视觉语义；用于物理引擎、求解器和接触参数验收。
- `Control`：场景和动力学不变，在 policy–environment 接口注入时序扰动；用于推理延迟、action scheduling 和控制链路验收。
- `Compound`：组合轻量 Visual、Physics、Control 扰动，只用于最终系统压力测试，不用于首轮退化归因。

开发团队应知道各 profile 的定义、参数边界、指标和验收原则，但不获得具体 episode manifest、随机种子、资产组合和扰动序列。

#### `Visual`：主要新增 YAML / renderer 配置

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

#### `Physics`：需要扩展环境代码

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

#### `Control`：需要扩展评测 wrapper

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

Visual、Physics、Control 应首先采用**单因素实验**；只有最终系统压力测试才运行 Compound。Compound 可以检验综合鲁棒性，但不能用于退化归因。

#### 私有数据分层与防过拟合

```text
Public Dev
  官方 RoboTwin 2.0 全 50 任务 × clean/randomized
        ↓
Private Validation
  ESAS-RoboTwin；有限次数返回 profile / 任务族聚合结果
        ↓
Sealed Final Holdout
  平时不运行、不反馈；只用于正式发布验收
```

仅隐藏数据不够：如果开发团队可以无限提交并获得逐 episode 反馈，仍会通过反馈逐渐拟合内部集。评估治理至少包括：

- 不公开具体 seed、初始状态、资产组合、扰动样本和 episode manifest。
- 评测代码、成功判定和参数范围透明；具体实例私有，避免不可解释的“秘密规则”。
- 开发阶段只反馈到 profile 或任务族的聚合结果；逐 episode 视频仅按诊断需要抽样开放。
- 限制正式验收提交频率，完整记录提交、配置和结果。
- 定期轮换 Private Validation 的一部分实例；Final Holdout 保持密封。
- 冻结并哈希 suite、代码、任务、资产、配置、容器、仿真器和成功判定版本。

### 3.3 RoboCasa365：MuJoCo 统一物理栈与精度回归候选

RoboCasa365 适合作为本体系中的 **MuJoCo 主任务集**。它基于 RoboCasa / robosuite / MuJoCo，覆盖 365 个厨房任务与 2,500 个厨房场景；当前公开 leaderboard 使用其中 50 个目标任务，分成 **Atomic-Seen 18、Composite-Seen 16、Composite-Unseen 16**。模型使用 Human300 的 300 个预训练任务训练，并在 `pretrain` 场景/对象 split 上评测这 50 个目标任务（[官方 leaderboard](https://robocasa.ai/leaderboard.html)、[benchmarking 文档](https://robocasa.ai/docs/build/html/benchmarking/benchmarking_overview.html)）。

当前公开 π0.5 结果为：

| 分组 | 任务数 | π0.5 success rate | 在本体系中的用途 |
|---|---:|---:|---|
| Atomic-Seen | 18 | 39.6% | 精度回归候选池；有足够成败翻转空间 |
| Composite-Seen | 16 | 7.1% | 能力压力与长程诊断；存在明显地板效应 |
| Composite-Unseen | 16 | 1.2% | 零样本组合泛化压力；不作为小幅精度退化门槛 |
| Overall | 50 | 16.9% | 公开兼容性总览；不能掩盖三组难度差异 |

这组 π0.5 成绩由 **RoboCasa 团队复现**，不是 Physical Intelligence 发布的 RoboCasa 官方 checkpoint。提交使用 RoboCasa 1.0.0、Human300、多任务训练 75,000 steps、batch size 64，以及 OpenPI fork commit `ca4c6d710db75e276bc7c866a57bd7e4aee5b6e8`（[提交记录](https://github.com/robocasa-benchmark/leaderboard/blob/main/submissions_md/pi05_2026-04-02.md)）。RoboCasa 1.0.1 已把全部任务 horizon 统一增加到原来的 1.5 倍，而 leaderboard 只明确说明 GR00T N1.5 已按新 horizon 重跑。因此 **39.6/7.1/1.2 只能作为候选难度证据，不能直接作为 ESAS-RoboCasa v1 验收基线**；冻结门槛前必须在统一的 RoboCasa 1.0.1 协议下重跑 π0.5 reference。

#### RoboCasa 的三层使用方式

```text
RoboCasa365 Public-50
  Atomic-Seen 18 / Composite-Seen 16 / Composite-Unseen 16

ESAS-RoboCasa
  Precision-Core        # 从 Atomic-Seen 18 中校准后选择；当前任务名单待定
  Physics-Core          # 固定 trace / oracle / π0.5 三种执行方式
  Scene-Object-Heldout  # target split；场景与对象均和 pretrain split 不重叠
  Capability-Stress     # Composite-Seen / Composite-Unseen
```

- **Public-50**：开发团队按公开协议运行全 50 任务，复现公开兼容性结果。
- **Precision-Core**：评估团队先在全部 18 个 Atomic-Seen 任务上跑 reference 校准，再按逐任务成功率、方差、接触类型和失败模式选择。优先保留成功率约 **20%–80%**、重复运行稳定、对目标优化敏感且任务族不重复的任务；具体名单待本轮实测后补充。
- **Physics-Core**：优先从 fixture 交互、抓取放置、开合、接触与滑移相关 atomic 任务中产生，但不能只依赖闭环 π0.5；同一任务同时运行固定 action trace、scripted/oracle controller 与 π0.5 闭环。
- **Scene-Object-Heldout**：官方 `target` split 使用 10 个不相交厨房和不相交对象，适合检查场景/对象 OOD；如果 reference 出现地板效应，则仅作为鲁棒性压力层。
- **Capability-Stress**：Composite-Seen / Unseen 单独报告，不与 Precision-Core 合成一个验收总分。

RoboCasa 让物理评测统一到 MuJoCo 家族，但“同一引擎名”不等于“同一物理栈”。必须同时冻结 RoboCasa、robosuite、MuJoCo、机器人与资产版本，以及 integrator、timestep/substeps、solver、contact、friction、controller 和 action conversion。RoboTwin 仍保留为 SAPIEN、双臂和跨引擎外部验证，避免只对 MuJoCo 生态过拟合。

### 3.4 `Embodied-Agent`：BEHAVIOR-Core-20 / Full-100

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
| π0.5 量化 / 推理加速 | 原始 LIBERO 40 + RoboTwin 2.0 全 50 × clean/randomized + RoboCasa365 Public-50 | ESAS-LIBERO Canonical-Heldout + ESAS-RoboTwin Canonical/Control + ESAS-RoboCasa Precision-Core | paired success delta、成败翻转、长程退化、轨迹漂移、timeout |
| Agent 架构 | LIBERO-10 + LIBERO-PRO | ESAS-LIBERO Grounding/Task-Generalization + BEHAVIOR-Core-20 / Full-100 | predicate progress、端到端成功、恢复次数、规划开销 |
| 渲染引擎 | LIBERO-Plus + RoboTwin 2.0 全 50 × clean/randomized | ESAS-LIBERO Covariate + ESAS-RoboTwin Visual | 成功率、感知导致的动作分歧、视觉压力曲线 |
| 3DGS | LIBERO-Plus + RoboTwin 2.0 全 50 × clean/randomized | ESAS-LIBERO Covariate 与 ESAS-RoboTwin Visual 中的固定场景 paired renderer | 任务精度 + 图像/特征差异；不能只报 PSNR |
| 物理引擎 | RoboCasa365 Atomic-Seen + RoboTwin 2.0 全量 sanity / regression | ESAS-RoboCasa Physics-Core + ManiSkill 物理探针；ESAS-RoboTwin Physics 作跨引擎验证 | 接触事件、状态轨迹误差、任务成功、数值稳定性 |

## 5. 物理引擎专项不能只用闭环 π0.5

物理引擎优化至少需要三种执行方式，优先在 RoboCasa 的同一批 Atomic 任务上形成一一对应的结果：

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

### 6.1 三类配置

#### Public Canonical

严格复现官方协议，用于对外可比：

- 官方代码、任务和资产版本
- 官方本体、相机、控制频率和 timeout
- 官方初始状态与语言指令
- 官方 success predicate
- 不私自增加 domain randomization

#### Private Canonical-Heldout

保持任务语义、成功判定和正常难度分布，但由评估团队隐藏并冻结初始状态、合法对象位置、指令模板、资产实例与随机种子。它用于防止开发团队针对公开实例调参，并承担纯量化、算子替换和后端迁移的主要精度非劣性验收；它不是官方 benchmark 分数。

#### Stress（内部扩展）

用于内部发现退化：

- `ESAS-LIBERO/Covariate-Robustness`
- `ESAS-LIBERO/Grounding`
- `ESAS-LIBERO/Task-Generalization`
- `ESAS-LIBERO/Compound`
- `ESAS-RoboTwin/Visual`
- `ESAS-RoboTwin/Physics`
- `ESAS-RoboTwin/Control`
- `ESAS-RoboTwin/Compound`
- `ESAS-RoboCasa/Scene-Object-Heldout`
- `ESAS-RoboCasa/Physics-Core`
- `ESAS-RoboCasa/Capability-Stress`

公开开发回归的 RoboTwin Canonical 应区分 `official_clean` 与 `official_randomized`；ESAS 的 Canonical 则使用保持正常任务分布的隐藏实例。原始 LIBERO、LIBERO-Plus zero-shot、LIBERO-Plus finetuned、LIBERO-PRO 与 ESAS-LIBERO 也必须分开报告。公开结果与 ESAS、Canonical 与 Stress 不得混成一个不透明总分。

### 6.2 配对评测

Reference 与优化版本必须使用完全相同的：

```text
(task_id,
 initial_state_id,
 environment_seed,
 policy_noise_seed,
 instruction,
 timeout,
 asset_version,
 simulator_version,
 profile_version)
```

π0.5 的 flow-matching 推理从随机噪声开始，因此只固定环境 seed 不够。需要同时固定环境随机性与模型噪声，并做逐 episode 配对比较。

ESAS 的核心判断不是 candidate 是否超过一个孤立的绝对成功率，而是：在同一隐藏 episode 上，candidate 相对于未优化 reference 是否发生超过允许范围的退化。ESAS-LIBERO 的 Canonical-Heldout、Covariate、Grounding、Task-Generalization，ESAS-RoboTwin 的 Canonical、Visual、Physics、Control，以及 ESAS-RoboCasa 的 Precision/Physics，分别使用各自相同的隐藏 manifest；渲染引擎替换还要区分“同一新场景下比较两个模型后端”和“同一状态经 reference/candidate renderer 输出”的两种配对实验。

### 6.3 结果聚合

不能只报所有 rollout 的单个平均成功率。至少报告：

- 每任务 success rate
- 每 suite macro average，避免任务 rollout 数不同造成加权污染
- reference → candidate 的 paired success delta
- `success → failure` 与 `failure → success` 的成败翻转计数
- clean、randomized 以及 ESAS 各 profile 分开报告
- LIBERO-10 / 长程任务单列
- 最差 10% 任务的平均退化
- 分阶段 progress 或 predicate completion
- time-to-success / timeout rate
- 成功 rollout 上的轨迹长度、jerk 或动作抖动
- 碰撞、保护触发、异常退出和 simulator error

最终守门采用**配对非劣性检验**：全量 Macro、各 profile / 任务族和关键任务分别设界限，并报告置信区间。示例起点可以是 Canonical Macro 不低于 reference `-1pp`、各压力 profile 不低于 `-2pp`、任务族不低于 `-5pp`，但这些数字必须根据 reference π0.5 的重复运行方差与业务风险校准，不能直接作为冻结标准。全量平均值不能掩盖少数任务的严重退化；同时也不宜对所有单任务设置不现实的 `-1pp` 门槛。

连续诊断指标与成功率的关系沿用 [[Real-robot evaluation]]：连续量主要用于筛选和归因，不能自动替代任务验收。

## 7. π0.5-LIBERO Policy Contract 与 benchmark-specific 运行协议

评估团队不另设 Control 扰动集，而是冻结一套所有提交都必须遵守的运行协议。配置分为三类：**模型固有配置、闭环执行配置、benchmark-specific 评测采样配置**。第 7.1–7.2 节是团队运行 π0.5 在原始 LIBERO、LIBERO-Plus、LIBERO-PRO 与 ESAS-LIBERO 上共同遵守的 **Policy Contract**；它不表示 Plus/PRO 论文已经披露或采用了全部这些参数。除非某字段正是被评估的优化变量或 benchmark 定义的扰动变量，否则 reference 与 candidate 不得改变。

### 7.1 模型与 checkpoint 标准

| 配置项 | ESAS-LIBERO v1 Reference |
|---|---|
| model | π0.5 flow-matching head |
| checkpoint | `gs://openpi-assets/checkpoints/pi05_libero` |
| checkpoint 阶段 | 30k finetuned；记录 checkpoint hash |
| reference 计算精度 | BF16 |
| VLM | PaliGemma `gemma_2b` |
| action expert | `gemma_300m` |
| `pi05` | `True` |
| `discrete_state_input` | `False` |
| max token length | 200（π0.5 默认） |
| flow-matching integration steps | **10** |
| predicted action horizon | **10 actions** |
| internal action dimension | 32；LIBERO 有效输出取前 7 维 |
| action representation | LIBERO 原生 7D delta action；`extra_delta_transform=False` |
| normalization | 使用 checkpoint 自带 norm stats；不得重新计算或替换 |

这里的 flow-matching steps 常被口头称为“降噪/降采样步数”，标准 reference 固定为 **10**。`action_horizon=10` 表示模型每次预测 10 个 actions，不等于环境会把 10 个全部执行。

### 7.2 观测与闭环执行标准

| 配置项 | ESAS-LIBERO v1 Reference |
|---|---|
| simulator render resolution | 256 × 256 |
| 模型图像输入 | resize-with-pad 到 224 × 224，uint8 |
| 图像方向 | agent/wrist 图像均旋转 180°，与训练预处理一致 |
| 有效相机 | `agentview_image` + `robot0_eye_in_hand_image` |
| 第三相机槽位 | right-wrist 使用零图并 mask，不得替换成其他视角 |
| proprioception | EEF position + quaternion→axis-angle + gripper qpos，共 8 维后按模型规则 padding |
| instruction | 使用 episode manifest 提供的原文；Canonical 为原任务 `task.language`，Plus Language / PRO Semantic/Task 使用其官方改写，不得额外二次改写 |
| 每次模型预测 | 10 actions |
| 每次实际执行 | **前 5 actions** |
| replanning | 执行 5 步后丢弃剩余 5 步，重新观测并推理 |
| action smoothing / ensemble | 关闭 |
| action repeat / hold | 1 simulator step / action |
| policy–environment 交互 | 同步；拿到新 chunk 后才继续执行 |

因此标准闭环是：

```text
observe → predict 10 actions → execute actions[0:5]
        → discard actions[5:10] → observe again
```

所有团队必须报告 `predicted_action_horizon` 与 `executed_actions_per_chunk`，不能只写一个含糊的 “chunk size”。对团队的 π0.5-LIBERO Policy Contract，二者固定为 **10/5**。

Plus/PRO 的扰动可以改变观测内容，却不改变模型接口：Plus Camera 改变相机位姿/FOV但保留相机槽位，Robot Initial State 改变初始机器人状态但保留 8D schema，Light/Background/Noise 改变像素内容但保留图像预处理；PRO 的 Object/Position/Environment 改变环境内容，Semantic/Task 改变 manifest instruction，Task 还可能改变 success predicate。除此之外，图像尺寸与方向、state/action schema、normalization、flow steps 和 10/5 闭环均保持不变。

### 7.3 Benchmark-specific 评测采样标准

| 配置项 | Public LIBERO | LIBERO-PRO | LIBERO-Plus | ESAS-LIBERO |
|---|---|---|---|---|
| workload unit | 原始 task 的一个 rollout | 原始 task × PRO profile 的一个 rollout | 已展开的一个 fixed perturbed instance | 隐藏 manifest 中的一个 paired episode |
| 标准规模 | 40 tasks | 40 base tasks；每个启用 profile 分开报告 | 全量 10,030 test-only instances | 按 ESAS profile 与冻结任务集 |
| environment seed | OpenPI 复现固定 7 | 官方未完整冻结；团队复现写入 manifest | 每个固定实例自带配置；额外随机量写入 manifest | 由隐藏 episode manifest 指定 |
| policy noise seed | 固定并记录 | 团队统一确定性派生 | 团队统一确定性派生 | 按 episode/inference index 确定性派生 |
| 初始稳定等待 | 10 simulator steps | 官方未完整披露；团队统一固定 10 | 团队统一固定 10，除非实例定义另有要求 | 10 simulator steps |
| rollouts / workload unit | 50 / task | **50 / task / profile** | **1 / fixed perturbed instance** | 先 100 / task/profile，临界项扩到 300–500 |
| max action steps | Spatial 220 / Object 280 / Goal 300 / LIBERO-10 520 | 同左 | 按来源 suite：220 / 280 / 300 / 520 | 与来源 suite 相同 |
| instruction | 原始 `task.language` | Semantic/Task 使用 PRO manifest，其余保持来源任务语义 | Language 实例使用 Plus instruction，其余按实例 manifest | 使用隐藏 manifest |
| success | 原始 environment `done` / predicate | 保持 PRO 对应 predicate；Task profile 允许官方定义的目标变化 | 使用该 fixed instance 的 predicate | 与来源 profile 相同，不得 candidate 特判 |
| 异常处理 | 记录并按预定义规则计入，不得静默重跑 | 同左 | 同左；不得以“实例生成失败”为由事后筛除 | 同左，并单独报告 simulator error |

因此不能把“50 episodes/task”作为所有 LIBERO 派生 benchmark 的共同规则。PRO 的50次用于对每个 task/profile 的随机初态分布估计成功率；Plus 的10,030个条目本身已经是经过生成、筛选和难度分层的不同实例，全量一次运行即产生10,030个二元结果。若在 Plus 上额外重复，同一实例的重复结果必须单列为 `repeatability`，不能伪装成新的测试实例或与 published full-set score 混合。

OpenPI 官方 runner 只显式固定 NumPy/环境 seed；ESAS、PRO 和 Plus 的 reference–candidate 成对比较还应控制 flow 初始噪声。若当前后端不能从接口注入每次推理的 noise tensor，至少必须固定 policy server RNG，并记录 server restart 与 seed；不能让 reference 和 candidate 使用不可追踪的独立随机流。

代码依据：

- `pi05_libero` 当前使用 `Pi0Config(pi05=True, action_horizon=10, discrete_state_input=False)`、`extra_delta_transform=False`，训练 30k steps（[OpenPI config](https://github.com/Physical-Intelligence/openpi/blob/main/src/openpi/training/config.py)）。
- π0.5 默认 BF16、PaliGemma `gemma_2b` + `gemma_300m` action expert，`sample_actions` 默认 10 个 flow integration steps（[模型配置](https://github.com/Physical-Intelligence/openpi/blob/main/src/openpi/models/pi0_config.py)、[模型实现](https://github.com/Physical-Intelligence/openpi/blob/main/src/openpi/models/pi0.py)）。
- 当前官方 runner 使用 `replan_steps=5`、224 输入、seed 7、初始等待 10 步、每任务 50 次，并按 suite 固定 max steps；每次只把预测 chunk 的前 5 步送入环境（[评测脚本](https://github.com/Physical-Intelligence/openpi/blob/main/examples/libero/main.py)）。
- LIBERO policy adapter 输入 agent+wrist 两路图像，将不存在的 right-wrist 置零并 mask，输出只取 action 的前 7 维（[policy adapter](https://github.com/Physical-Intelligence/openpi/blob/main/src/openpi/policies/libero_policy.py)）。

### 7.4 允许改变什么

标准验收采用“**单一声明变量**”原则：

- 量化、算子、编译器、框架迁移：保持 flow steps=10、horizon=10、execute=5，只改变声明的计算实现或数值精度。
- flow-step reduction：允许 candidate 使用少于 10 步，但必须与 10-step BF16 reference 配对，并把步数写入结果名称，例如 `INT8-flow6-h10-e5`。
- action-horizon 或 chunk-execution 优化：不进入标准 LIBERO 精度榜；作为独立 scheduling 实验报告，因为它改变了闭环控制协议。
- 渲染或输入降质：模型与闭环参数保持 10/10/5，只改变声明的 renderer、分辨率、压缩或传感器变量。

每个结果必须附带配置指纹：

```text
model/checkpoint hash
openpi commit + LIBERO commit
backend/framework + dtype/quantization
flow_steps / predicted_horizon / executed_actions
image preprocessing + cameras
norm_stats hash
episode manifest hash + environment/policy seeds
simulator/dependency versions
```

### 7.5 两个 reference，而不是一个

系统优化最好保留两个参照：

1. **Official reference**：官方 JAX / BF16 / 官方 checkpoint，用于验证能否复现公开结果。
2. **Local backend reference**：团队实际后端在“未优化”状态的 BF16/FP16 实现，用于与量化、编译或算子优化做公平配对。

若直接拿官方 JAX 与本地 PyTorch + 自定义 kernel 比，差异会同时包含框架、预处理、checkpoint 转换和系统优化，难以归因。

## 8. π0.5-RoboCasa 标准 baseline 与运行协议

RoboCasa 与 LIBERO 虽然都通过 OpenPI 部署 π0.5，但模型 horizon、有效 action 维度、相机和 proprioception 均不同，不能复用 LIBERO 的 10/5 配置。ESAS-RoboCasa v1 应先以公开 checkpoint 和其提交 commit 为复现起点，再统一迁移到 RoboCasa 1.0.1 重建 reference。

### 8.1 模型与 checkpoint 标准

| 配置项 | ESAS-RoboCasa v1 Reference |
|---|---|
| model | π0.5 flow-matching head |
| checkpoint | [RoboCasa π0.5 Human300 @ 75k](https://huggingface.co/robocasa/robocasa365_checkpoints/tree/main/pi05_pretrain_human300/multitask_learning/75000) |
| checkpoint 来源 | RoboCasa 团队复现；Human300，多任务训练 75k steps，batch size 64 |
| OpenPI | RoboCasa fork commit `ca4c6d710db75e276bc7c866a57bd7e4aee5b6e8` |
| reference 计算精度 | BF16 |
| VLM / action expert | PaliGemma `gemma_2b` / `gemma_300m` |
| `pi05` / discrete state | `True` / `True` |
| max token length | 200 |
| flow-matching integration steps | **10** |
| predicted action horizon | **50 actions** |
| executed actions per chunk | **5 actions** |
| internal / effective action dimension | 32 / RoboCasa 输出前 12 维 |
| normalization | checkpoint 自带 norm stats；记录并校验 hash |

`pi05_pretrain_human300` 没有覆写 `action_horizon`，因此继承 `Pi0Config` 的默认值 **50**；`sample_actions` 默认执行 **10** 个 flow integration steps。官方 RoboCasa runner 的 `replan_steps=5`，所以标准闭环是：

```text
observe → predict 50 actions → execute actions[0:5]
        → discard actions[5:50] → observe again
```

所有结果都必须分别记录 `flow_steps / predicted_action_horizon / executed_actions_per_chunk`，RoboCasa v1 reference 固定为 **10/50/5**。量化、算子替换、编译器和后端迁移不得顺手改变后两项；flow-step reduction 作为被测变量时，仍与 10-step BF16 reference 配对。

### 8.2 观测、action 与闭环标准

| 配置项 | ESAS-RoboCasa v1 Reference |
|---|---|
| 模型图像输入 | 三路图像均 resize-with-pad 到 224 × 224，转 `uint8` |
| 左外部相机 | `video.robot0_agentview_left` → `observation/image` |
| 腕部相机 | `video.robot0_eye_in_hand` → `observation/wrist_image` |
| 右外部相机 | `video.robot0_agentview_right` → `observation/right_image`；π0.5 下不可省略 |
| proprioception | EEF relative position + relative rotation + base position + base rotation + gripper qpos，共 16 维，再 pad 到 32 |
| instruction | `annotation.human.task_description` 原文 |
| action | 模型输出前 12 维，随后使用官方 `convert_action()` 再送入环境 |
| action smoothing / ensemble | 关闭 |
| policy–environment 交互 | 同步；拿到新 chunk 后执行 5 步再请求下一次推理 |
| success | `info["success"]` |

相机顺序、图像方向、resize/padding、状态拼接次序、action 维度与 `convert_action()` 都属于 checkpoint 接口的一部分。渲染降质实验只能改变声明的 renderer/传感器变量，不能同时静默改变这些适配逻辑。

### 8.3 评测采样与版本标准

| 配置项 | Public RoboCasa365-50 | ESAS-RoboCasa |
|---|---:|---:|
| RoboCasa | 先复现提交的 1.0.0；正式 reference 统一冻结到 1.0.1 | 与正式 reference 完全相同 |
| evaluation split | `pretrain` | Precision/Physics 使用隐藏的同分布 manifest；OOD 单独使用 `target` |
| environment seed | 官方 runner 默认 7 | 由隐藏 episode manifest 指定 |
| policy noise | 固定并记录 policy server RNG | 按 episode/inference index 确定性派生 |
| episodes / task | 官方协议 50 | 先 100；临界任务顺序扩到 300，再到 500 |
| max action steps | `get_task_horizon(task)`；1.0.1 使用统一增加 1.5× 后的任务 horizon | 与 reference 版本逐任务一致 |
| task success | binary `info["success"]` | 同一 success predicate；另报连续诊断量 |
| 异常处理 | 记录并按预定义规则计入，不得静默重跑 | 同左，另报 simulator error |

迁移到 RoboCasa 1.0.1 时，必须先完整重跑 reference 并重新校准各任务成功率与方差，不能把 1.0.0 的公开分数当成验收常数。公开 `pretrain` 和 OOD `target` split 必须分开报告：后者同时更换厨房与对象，测的是场景/对象泛化，不是纯物理精度。

代码依据：

- π0.5 提交给出 checkpoint、训练步数、batch size、RoboCasa 版本和 OpenPI commit（[submission](https://github.com/robocasa-benchmark/leaderboard/blob/main/submissions_md/pi05_2026-04-02.md)）。
- `pi05_pretrain_human300` 使用 `Pi0Config(pi05=True, max_token_len=200)`；`Pi0Config` 默认 BF16、32D action、50-step horizon、`gemma_2b` + `gemma_300m`（[训练配置](https://github.com/robocasa-benchmark/openpi/blob/ca4c6d710db75e276bc7c866a57bd7e4aee5b6e8/src/openpi/training/config.py)、[模型配置](https://github.com/robocasa-benchmark/openpi/blob/ca4c6d710db75e276bc7c866a57bd7e4aee5b6e8/src/openpi/models/pi0_config.py)）。
- runner 固定 224 输入、`replan_steps=5`、`split=pretrain`、50 trials、seed 7，并使用三路相机、16D state、任务原始指令、`convert_action()` 与 `info["success"]`（[评测脚本](https://github.com/robocasa-benchmark/openpi/blob/ca4c6d710db75e276bc7c866a57bd7e4aee5b6e8/examples/robocasa/main.py)）。
- policy adapter 在 π0.5 下要求三路相机，将 state/action pad 到 32，输出截取前 12 维（[policy adapter](https://github.com/robocasa-benchmark/openpi/blob/ca4c6d710db75e276bc7c866a57bd7e4aee5b6e8/src/openpi/policies/robocasa_policy.py)）。

### 8.4 结果配置指纹

每个 RoboCasa 结果至少附带：

```text
checkpoint hash + norm_stats hash
openpi / RoboCasa / robosuite / MuJoCo commits or versions
robot / assets / controller / action-conversion version
integrator / timestep / substeps / solver / contact / friction
dtype / quantization / backend / flow_steps
predicted_horizon / executed_actions_per_chunk
cameras / preprocessing / observation-state schema
task set / split / episode-manifest hash / environment and policy seeds
task-horizon table hash / success-predicate version
```

## 9. 不同频率的运行规模

| 级别 | 建议规模 | 目的 |
|---|---|---|
| PR smoke | LIBERO 每套件 2 个任务 × 10 rollouts | 排除崩溃与严重精度问题 |
| 开发日常回归 | 原始 LIBERO 40 + RoboTwin 全 50 × clean/randomized × 10–100；RoboCasa365 Public-50 × 50 | 开发团队发现明显退化与任务级问题 |
| 开发专项回归 | LIBERO-Plus 全量 10,030 fixed instances × 1；LIBERO-PRO 各启用 profile × 40 tasks × 50 episodes | 公开鲁棒性、grounding 与泛化诊断；两者不得套用同一重复次数 |
| 评估预检 | ESAS-LIBERO / ESAS-RoboTwin 各 profile + ESAS-RoboCasa Precision/Physics × 100 个配对 episodes / task | 评估团队筛出明确通过、失败与临界项 |
| 临界项扩样 | 可疑 task/profile 扩展到 300，再到 500 | 降低波动干扰，支持小差异判断 |
| 正式发布 | 公开全量回归 + ESAS Private Validation + Sealed Final Holdout；必要时 BEHAVIOR Full-100 | 最终非劣性验收与跨层验证 |

若 50 个任务、4 个主要 profile、每任务固定 500 次，则单模型需要 100,000 episodes；reference 与 candidate 成对运行约 200,000 次。因此优先采用顺序扩样：先跑 100，明确通过或失败即停止，只把临界项扩到 300–500。具体数字仍应根据算力预算、最小关注退化幅度和成败翻转率做功效分析。仿真 rollout 便宜不等于可以忽略统计设计。

## 10. 尚未冻结的关键问题

1. 团队实际使用哪些仿真器和引擎：MuJoCo / SAPIEN / Isaac / OmniGibson / 自研？
2. π0.5 在 RoboTwin 与 BEHAVIOR 上使用官方、社区还是团队自训 checkpoint？训练 recipe 如何固定？
3. 每日、周度、发布评测的 GPU-hour 预算分别是多少？
4. ESAS-RoboTwin 各 profile 的任务纳入规则、扰动范围和基线可解性门槛如何冻结？
5. ESAS-LIBERO 从 Plus/PRO 采用哪些生成器、难度层和资产，如何建立不泄漏的私有实例池？
6. `BEHAVIOR-Core-20` 的分层抽样规则和最终任务清单是什么？
7. 相对 reference 的非劣性界限如何按 Macro、profile、任务族和关键任务分层校准？
8. 渲染与物理优化的固定 trace 数据格式、状态对齐方式与容差如何定义？
9. 是否需要将吞吐、实时因子、显存、能耗与精度做成统一 Pareto 报告？
10. RoboCasa 18 个 Atomic-Seen 任务在 1.0.1 + π0.5 reference 下的逐任务成功率、重复方差和失败模式是什么？据此哪些任务进入 Precision-Core / Physics-Core？

## 11. 当前建议摘要

```text
Embodied-Core
  LIBERO-Spatial / Object / Goal / 10

LIBERO Public Robustness / Generalization
  LIBERO-Plus
  LIBERO-PRO

RoboTwin Public Dev
  50 tasks × official_clean / official_randomized

RoboCasa365 Public-50
  Atomic-Seen 18 / Composite-Seen 16 / Composite-Unseen 16

ESAS (Embodied System Acceptance Suite)
  ESAS-LIBERO
    Canonical-Heldout / Covariate-Robustness / Grounding
    Task-Generalization / Compound
    Private Validation / Sealed Final Holdout
  ESAS-RoboTwin
    Canonical / Visual / Physics / Control / Compound
    Private Validation / Sealed Final Holdout
  ESAS-RoboCasa
    Precision-Core (task list TBD after calibration) / Physics-Core
    Scene-Object-Heldout / Capability-Stress

Embodied-Agent
  BEHAVIOR-Core-20
  BEHAVIOR-Full-100
```

- 原始 LIBERO：所有 π0.5 优化共同必跑，承担可复现基础回归，但不独自承担最终验收。
- LIBERO-Plus：公开的条件鲁棒性和视觉/传感器压力层，尤其适合渲染、3DGS、视觉编码和相机链路。
- LIBERO-PRO：公开的 grounding、任务泛化和反记忆层；地板任务作为能力压力，不作为小精度回退门槛。
- ESAS-LIBERO：复用 Plus/PRO 设计但隐藏具体实例，承担 LIBERO 体系的最终私有验收。
- RoboTwin 官方全量：由开发团队承担公开、可复现的日常回归与任务级定位。
- ESAS-RoboTwin：由评估团队维护隐藏、配对、分轴、版本冻结的最终系统验收集；原 System-10 只保留为能力压力或快速诊断候选。
- RoboCasa365 Public-50：统一到 MuJoCo 任务栈的公开兼容性回归；π0.5 的 Atomic-Seen 具备精度候选价值，Composite 两组当前主要作为能力压力。
- ESAS-RoboCasa：承担 MuJoCo 物理优化的 Precision/Physics 验收；具体 Atomic-Seen 任务待 1.0.1 reference 实测后冻结，当前不预选名单。
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
