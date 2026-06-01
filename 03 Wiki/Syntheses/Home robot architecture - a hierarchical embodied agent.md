# Home Robot Architecture: A Hierarchical Embodied Agent

> **状态**：synthesis。源自 Ethan + Ada 多轮讨论的原创架构判断，锚定在已核实的模型架构（π 系列、GR00T、GO-1、Helix 等）和当前研究线上。前瞻性内容全程标注置信度。

## 核心论点

家庭通用机器人**不是"一个更大的 VLA"，而是一个分层具身 agent**：云端审议脑（推理脑 + 世界模型 + 记忆）驾驭端侧反应小脑（动作专家 + 安全/监控 + 程序性技能），两者用**低频的结构化计划接口**连接。这是知识库**两条主线的汇合点**——具身控制（小脑/专家/技能）与持久 agent 认知（云脑/记忆/推理/世界模型）。

## 为什么家庭是最难的场景（上下文）

具身落地的先后由四个轴的乘积决定：**环境结构化 × 任务重复性 × 失败容忍度 × 单位经济性**。家庭在四个轴上全是最差：环境不结构化、任务长尾无限、失败容忍最低（脆弱人群）、数据飞轮断裂。

- 到 ~2029：通用家庭机器人置信度**低**；结构化场景（仓储/工厂）先规模化
- **决定家庭时间表的单一最重要变量**：从无标注视频学习这条线能否突破（[[AgiBot - GO-1 ViLLA Generalist Embodied Foundation Model|GO-1 latent action]]、[[DeepCybo - PhysBrain Human Egocentric Data as a Bridge from VLMs to Physical Intelligence|PhysBrain egocentric]]）

## 地基：Capability vs Dependability

**关键区分**：堆规模（更大模型 + 更多真机数据 + 更长 RL）买的是 **capability**（平均能做多少）；部署的闸门是 **dependability**（知不知道自己会错、错了能否恢复、会不会闯祸、换场景成本）。两者近乎正交，scaling 对后者帮助间接、递减。

业界佐证：
- **Sergey Levine（PI）**：部署需"very high robustness"，且 scaling 必须"identify the right axes"；部署门槛是"competently enough to actually do it for real, for real people"
- **Russ Tedrake（TRI LBM）**：从测量学角度——"many robotics papers may be measuring statistical noise"（50 rollouts 置信区间宽达 20-30%）；连可靠性都还没法严谨测量
- **Eric Jang（1X）**：物理世界的级联失败；NEO 家用"there will be mistakes"

**Dependability 脚手架**（每项都有活跃研究线，但彼此孤立、未整合）：

| 能力 | 代表工作 |
|------|---------|
| 自知之明/不确定求助 | KnowNo（conformal prediction，arXiv:2307.01928）|
| 失败检测/运行时监控 | Sentinel（2410.04640）、FAIL-Detect（2503.08558）|
| 可验证安全层 | CBF/SHIELD（2505.11494）、CBF-RL |
| 世界模型行动前验证 | World Action Verifier（2604.01985）、Ctrl-World（2510.10125）|
| 样本高效适配 | TRI LBM（3-5× less data）、1X data engine |

> **关键 meta 判断**：工厂全面铺开需要的不是再发明某个监控器/安全过滤器，而是**把它们整合成围绕生产级 VLA 的统一脚手架**——这是 [[Harness design]] 思想在具身领域的对应。整合本身就是研究机会。

## 能力 → 架构组件映射

| 家庭能力 | 映射到的架构要求 | 落在哪层 |
|---------|----------------|---------|
| 终身学习不遗忘 | 模块化/参数隔离可塑性（adapter/技能模块）+ replay；非单体冻结 blob | 端侧为主 |
| 持久个人记忆 | 显式可检索外部记忆（episodic+semantic+3D scene graph）+ 检索条件化 | 脑 + 端 |
| 廉价监督学新技能 | 预训练共享动作表征（latent action）+ 人→机对应 + few-shot 适配 | 预训练脑 + 端适配 |
| 常识推理/意图 | 会推理的大脑（test-time compute）+ 不确定性头 + 澄清对话 | 云/慢脑 |
| 人本安全 | 独立可验证安全过滤器（CBF/shield）+ 对人/接触的预测 | 端侧（实时）|
| 开放任务管理/中断 | agentic 执行/编排层 + 持久任务状态 | 脑 |
| 应对不可训练长尾 | 预测/前向模型（推理后果）| 多层次 |

研究佐证：终身学习（Interactive Continual Learning 2403.03462、LOTUS 2311.02058）、持久记忆（PersONAL 2509.19843、KARMA 2409.14908）、单演示/视频学技能（YOTO 2501.14208、MimicFunc 2508.13534）。

## 架构（核心）

```
云端（慢脑，低频，可断）
  ├─ 推理脑（VLM/LLM）：常识、意图、歧义消解、目标分解   ← 提案者
  ├─ 世界模型：结果预测、空间推理、行动前验证          ← 验证者
  └─ 记忆：通用语义/知识（私人记忆加密或留端）
        ↑ 观测+指令(低频)         ↓ 结构化计划/子目标(低频)
端侧（快小脑，高频，必须可离线）
  ├─ 专家模型：计划+实时观测 → 执行器指令（闭环反应+局部纠错）
  ├─ 安全层（CBF/shield）+ 失败监控        ← 实时、断网也工作
  ├─ 程序性技能库：高频稳定流程固化（≈生物小脑）
  └─ 蒸馏小脑+轻推理：断网时保留退化-通用能力
```

### 组件要点

- **推理脑 ≠ 世界模型**：常被合并，但应分开——推理脑（提案者，VLM/LLM）负责"该干什么"，世界模型（验证者）负责"这么干会怎样"，二者是 **propose-then-verify** 关系，可独立升级（π₀.7 把 BAGEL 世界模型做成独立异步模块，正是此理）
- **接口是计划级，不是动作级**：云端下发**结构化计划/子目标**（latent action token / subgoal image / 目标状态），端侧专家把"计划 + 实时观测"变成执行器指令——否则与"专家生成动作"冗余
- **端侧专家有局部自主**：因云端 RTT 只能低频，专家必须在每个子目标内自己做闭环反应控制 + 局部纠错，不是被动"依次解码"
- **安全必须在端侧**：实时 + 断网也工作（人本安全不能依赖云端 RTT）

### 双记忆映射（一个优雅的对应）

- **云端 episodic/semantic = 显式记忆**（"做什么"，记得具体发生过什么）
- **端侧固化技能 = 隐式/程序性记忆**（"怎么做"，说不清但身体会）

这正是 [[Memory in Embodied AI]] 里"理想双记忆"的实现，并回答了当时的开放问题"底层执行模型要不要自己的记忆"——**要，且是程序性、可离线的**。**生物学同构**：生物小脑的核心功能就是把反复练习的动作固化为自动化运动程序——端侧技能固化字面上就是小脑在做的事。

## 世界模型：多层次的必要性

家庭**几乎确定需要某种预测能力**——但不一定是"在控制频率上做生成式 MPC 的单一世界模型"。

**最根本的理由——不可训练的长尾**：工厂任务有界，能用数据覆盖分布 → 纯反应式策略够用；家庭开放无界，永远覆盖不全 → 遇到没训过的情况只能靠"如果我做 X 会怎样"推理出路。**预测是泛化到分布外的机制，而家庭的本质就是永远在分布外。**

但"世界模型"应拆开理解（三组正交选择，胜负未决）：
- **显式 vs 隐式**（独立 forward 模块 vs 预测折进策略）
- **像素 vs 潜在 vs 结构化**（Cosmos/Genie vs Dreamer/JEPA vs 物体/物理）
- **决策时 vs 训练时**（rollout 选动作 vs 表征学习/合成数据，如 GR00T FLARE/DreamGen）

**校准判断**：家庭大概率需要**多层次预测**——慢脑放较重的世界模型（审议 + 行动前验证 + 长程规划，低频算得起）；快环放轻量/隐式潜在动力学（real-time 兼容）；训练时用世界模型生成数据/对齐表征（几乎确定有用）。详见 [[Embodied Brain Models]] 的 Predictive Spatial 流派。

## 关键张力 / 开放问题

1. **智能在云 → 断网脆弱**：把智能完全押云端，使机器人智能 contingent on 连接。工厂网络稳定可行；家庭网络不稳 + 隐私，要命。技能缓存只覆盖高频稳定流程；建议端侧放蒸馏小脑+轻推理，保留"退化但通用"能力
2. **隐私 vs 云记忆**："云记忆存一切"与家庭隐私冲突 → 可能需记忆分裂（私人记忆加密/留端，通用知识在云）或联邦学习
3. **云-端延迟 → 端侧需局部自主**：每拍 round-trip 回云不可能
4. **内部开放选择**：世界模型显式/隐式/像素/潜在、记忆怎么分裂、端侧该放多少智能——均无定论

## 置信度

- **已确证**（有论据/佐证）：capability≠dependability 是部署闸门；dependability 脚手架各项是真实研究线；预测对家庭长尾几乎必要；重世界模型必须在慢脑/低频；训练时世界模型用法已被验证（GR00T DreamGen）
- **前瞻判断**（Ethan + Ada 的分析，非已证）：这张分层架构的具体形态；"多层次预测"的分配；"家庭=具身 agent=两条主线汇合"；隐私/断网张力的解法

> **最深的判断**：未来家庭机器人架构的设计空间，基本由四个约束的妥协方式定义——**智能在云、身体在端、安全必须在端、断网必须能活**。

## Related

- [[Embodied Brain Models]] — 大脑模型流派、两层耦合框架、Predictive Spatial 流派
- [[Memory in Embodied AI]] — 双记忆（显式云端 + 隐式端侧）的理想形态
- [[Harness design]] — dependability 脚手架 = harness 思想在具身的对应
- [[Spatial Intelligence for Embodied AI]] — 持久 3D 场景记忆 / 空间推理
- [[Agent memory]] — 持久 agent 认知这条线
- [[Task decomposition]] — 云端推理脑作为任务分解器
- [[AgiBot - GO-1 ViLLA Generalist Embodied Foundation Model]] — latent action（从视频学）
- [[DeepCybo - PhysBrain Human Egocentric Data as a Bridge from VLMs to Physical Intelligence]] — egocentric 视频路线
- [[Figure AI - Helix a VLA for Generalist Humanoid Control]] — 端侧双系统实例

## tags

#embodied-ai #home-robot #hierarchical-agent #world-model #dependability #cloud-edge #synthesis #brain-cerebellum #memory #open-question
