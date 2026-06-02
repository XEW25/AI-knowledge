# Embodied Brain Models

> **状态**：骨架页（survey-skeleton）。结构与核心判断已固化，每个流派的深度展开和代表工作分析待后续填充。

## 定义

在具身 AI 系统中，"大脑模型"指负责**高层规划、决策、推理**的模型。本知识库采用 **部署驱动** 的定义：

- **大脑 (Brain)** ≡ 部署于云侧 / 计算中心 / 远程服务器的模型
- **小脑 (Cerebellum)** ≡ 部署于机器人本体 / 端侧 / 边缘设备的模型

这是工程框架而非神经科学类比。通过"在哪里跑"这个可证伪的工程属性，绕开了"VLA 是大脑还是小脑"这种本体论争论。

### 部署位置推导出的功能差异

| 维度 | 大脑（云） | 小脑（端） |
|------|------------|------------|
| 延迟预算 | 100ms ~ 数秒 | <20-50ms |
| 推理频率 | 事件驱动、低频 | 连续高频（50-1000Hz） |
| 模型规模 | 大（10B-100B+） | 小（<1B 常见） |
| 更新频率 | 持续在线 fine-tuning | OTA periodic update |
| 网络依赖 | 强 | 必须容忍断网 |
| 主要任务 | 规划、推理、记忆、学习 | 反应控制、安全兜底、感知 |
| 数据流向 | ← 状态、观测、奖励 | → 规划、目标、约束、新权重 |

详细的小脑讨论见 [[Embodied Cerebellum Models]]（待建）。

---

## 三个主流流派

### ① LLM/VLM-as-brain 流派

**核心押注**：语义和世界知识已存在于预训练 LLM/VLM 中，大脑的工作是把它们组装成机器人可执行的指令。

**与云-端框架的契合度**：✅ 天然契合——大语言模型本就部署在云，输出语义化指令低带宽。

**接口子分支**：

| 子分支 | 接口形式 | 代表 | 优势 | 劣势 |
|--------|---------|------|------|------|
| **Talker** | 自然语言子任务 | SayCan, [[Huang et al. - ChemBot Long-Term Memory for VLA-based Agents]], Inner Monologue | 可读、自然 | 粒度难标准化 |
| **Coder** | Python 代码 / API call | Code-as-Policies, ProgPrompt | 表达力强、可组合、可调试 | 需要强代码能力 LLM |
| **Constraint** | 约束函数 / 关键点 | [[Huang et al. - ReKep Spatiotemporal Reasoning Keypoint Constraints for Robotic Manipulation]], VoxPoser | 物理直觉强 | 约束设计空间需 LLM 内化 |
| **Affordance** | 3D affordance / value map | VoxPoser, MOKA | 空间推理可微 | 表征空间限制泛化 |

**已退出主流的子分支**：
- ~~MCP-Toolkit / 直接 LLM 操控机械臂~~：过分依赖 LLM 自身能力，时效差，作为当前过渡方案存在，但不会成为主流

**当前硬伤**（详见 Open Questions 节）：物理可行性盲区、闭环反馈缺失、推理延迟、接口可学习性、失败可调试性。

### ② Predictive Spatial Models 流派（预测空间模型）

**核心押注**：决策的根基是预测；要预测未来空间状态，必须有好的空间表征。**预测能力与表征能力是同一问题的两面**。

**理论循环**：

```
好的表征 → 让预测变可能
   ↑           ↓
预测目标 ← 监督表征学习
   ↑           ↓
好的预测 → 暴露表征不足之处
```

**子分支（按表征粒度）**：

| 子分支 | 描述 | 代表 | 云-端定位 |
|--------|------|------|----------|
| **像素级世界模型** | 直接预测视频帧 | BAGEL, Cosmos, Genie 2/3 | 云脑 imagination，不适合下端 |
| **潜在世界模型** | 预测 latent state | V-JEPA, Dreamer V3 | "内部模拟器"，可能云-端协同 |
| **结构化世界模型** | 预测物体/关系/物理 | PIN-WM, 物理引擎嫁接 | 可解释，sim-to-real 友好 |

**与现有页面的关系**：本流派把"表征 + 预测"作为统一框架。
- [[3D Spatial Representation]] — 表征侧的理想特征
- [[Spatial Intelligence for Embodied AI]] — 更广的具身空间智能讨论
- [[3D Gaussian Splatting]] / [[Object-Centric Representation]] — 表征的具体实现
- [[World-Action Models]] — WAM 路线（视频生成 backbone + 动作）可看作此流派与 VLA 的嫁接

### ③ VLA 流派（特殊定位：被肢解的过渡范式）

VLA **不能简单作为"云脑流派"列出**，因为它本质上是一体化的（VLM backbone + action expert）。在云-端部署框架下，VLA 正在分化：

```
今天的一体化 VLA（π₀.7, OpenVLA, RT-2 等）
       │
       │ 云-端部署压力 + 跨本体需求 + 实时控制需求
       ↓
未来 2-5 年裂解为：
   ┌──────────────────┐         ┌──────────────────┐
   │ 云脑：VLM/MLLM   │  ←──→   │ 端脑：action     │
   │ backbone 部分    │ 接口    │ expert 蒸馏      │
   │ → LLM-as-brain   │         │ → 小脑核心架构    │
   │   流派           │         │                  │
   └──────────────────┘         └──────────────────┘
```

**双重定位**：
- **作为云脑（本页讨论）**：VLA 的 VLM backbone 部分会演化为 LLM/VLM-as-brain 流派的一员。π₀.5 的"两层推理 一个模型"是这种裂解的雏形。
- **作为小脑**：VLA 的 action expert 会演化为小脑核心架构（详见 [[Embodied Cerebellum Models]]）。

**当前代表**：[[Physical Intelligence - pi0.5 a VLA with Open-World Generalization]], [[Physical Intelligence - pi0.6 a VLA That Learns From Experience]], [[Physical Intelligence - pi0.7 a Steerable Generalist Robotic Foundation Model]], OpenVLA, RT-2

**核心判断**：VLA **范式**不会死，但一体化 VLA **模型**不会是云脑的最终形态。

### VLA 流派内部：VLM-as-actor vs VLM-as-encoder

> **范围注意**：这是 **VLA 流派内部**的架构分歧，**不是跨流派的顶层轴**；World Model / Predictive Spatial 流派与此相对正交（它关心"要不要预测未来"，不关心"谁产动作"）。

VLA 在一条架构轴上分裂——**VLM 自己产动作（actor），还是只编码、由独立专家产动作（encoder）**。这是一个重要的、**当前未定的**架构分歧（不必拔高为"最根本"，它是 VLA 内部的一条主要分界）。

#### VLM-as-encoder：VLM 编码 + 独立专家产动作

主流路线：VLM 供 hidden states / KV cache 给**单独训练的 flow-matching / diffusion 专家**产连续动作。其内部又按"专家怎么连"分两种范式（均经代码核实）：

**范式 A：Joint Attention / MoE-style**（π 系列）
- VLM expert 与 action expert **两套独立权重**（各自 Q/K/V + FFN），**不是真 MoE**（无 router，PI 论文 "mixture of experts" 是借喻）
- 机制：每个 expert 用自己权重算 Q/K/V → 两组 K/V **拼接** → 合并序列上算一次 attention
- **逐层 lockstep**：VLM 第 i 层与 action expert 第 i 层在同一 attention 内交互，层数相同同步推进
- block-causal mask：VLM 块双向，action 只 attend VLM+自身，VLM 不 attend action
- 代码核实：openpi `pi0_pytorch.py`、lucidrains/pi-zero-pytorch、allenzren/open-pi-zero

**范式 B：Cross-Attention / Encoder-Decoder**（[[NVIDIA - GR00T N1 An Open Foundation Model for Generalist Humanoid Robots|GR00T]]、[[DeepCybo - PhysBrain Human Egocentric Data as a Bridge from VLMs to Physical Intelligence|PhysVLA]]）
- VLM（冻结）**完整跑完所有层 → 产出最终 embedding（算一次）**
- 该 embedding 作 `encoder_hidden_states` 传给 DiT 的**每个 cross-attn 层**，由各层 to_k/to_v **重新投影成 K/V**
- DiT 层**交替**：偶数层 cross-attend VLM，奇数层 self-attend action
- 代码核实：NVIDIA Isaac-GR00T `dit.py`（N1.5 Eagle / N1.7 Qwen3，cross-attn 设计一致）；PhysVLA 同款（"VLM features as keys/values, action tokens as queries"）

**两范式对比（关键在云-端接口数据量）**：

| | 范式 A（π 系列） | 范式 B（GR00T / PhysVLA） |
|---|---|---|
| VLM↔action 结构 | 逐层 lockstep 并行 | VLM 先跑完 → DiT 再跑（两独立 stack） |
| 连接机制 | 每层 KV 拼接（joint attention） | DiT 每层重投影固定 VLM embedding |
| VLM 冻结 | 否（联合训练） | 是 |
| **云-端接口数据量** | **重**：所有层 VLM KV cache | **轻**：一份最终 embedding (S×D) |
| 取向 | 端到端梯度，追能力上限 | 模块分离，产品化部署友好 |

**核心含义**：范式 B 的 encoder-decoder 在**单模型内部**提供了更干净的拆分断点（一份 embedding vs 逐层 KV cache）。但注意——**"部署导向→范式 B" 这个简单结论已被后续核实证伪**（G0、GO-1 内部都是范式 A 却高度部署导向）。真实图景需要下面的两层框架。

**详细代码级核实记录见** [[Physical Intelligence - pi0.5 a VLA with Open-World Generalization]]、[[NVIDIA - GR00T N1 An Open Foundation Model for Generalist Humanoid Robots]]。

#### VLM-as-actor：统一自回归（VLM 自己产动作）

VLM 自己以自回归方式产动作，推理与动作**共享 decoder、上下文、目标**（单套权重、单一 next-token 目标，无独立 action expert）。谱系：RT-2 → OpenVLA → π0-FAST → **[[Galaxea - G0.5 Autoregressive VLM-as-Actor VLA|G0.5]]**。

- **代表 G0.5**：单 transformer decoder（Qwen3.5 2B 初始化）在一个 token 流里出 reasoning + action；靠可学习**跨本体 VQ ActionCodec** 解决早期 AR 的 token 低效（active-DoF、不 padding）；flow-matching head 降为**可选推理加速器**
- **actor 派论据**：VLM 保持"actor"使其 CoT 推理 / in-context learning / prompt 操控能**原生**作用于动作，而非穿过 encoder 的压缩条件瓶颈；VLA-0、π0-FAST 提供实证；连 π0.5 的 KI 也靠 AR 动作监督保护 VLM 能力
- **encoder 派论据**：flow matching 适合高频连续控制，AR 高频解码慢/贵——所以分歧**未定**
- **信号**：Galaxea 从 [[Galaxea - G0 Dual-System VLA Model|G0]]（encoder / 双系统）掉头到 G0.5（actor / 统一 AR），说明同一团队也在重新权衡

**对云-端的含义**：统一 AR 单模型无独立专家边界，更难按"脑/小脑"切；但 VQ action token 提供了天然离散接口，可选 FM head 又留了低延迟部署口子。

### 两层耦合框架（系统级接口 vs VLA 内部耦合）

核实 Helix / GO-1 / G0 后发现：**"耦合"其实有两个正交的层次**。之前的范式 A/B 只描述了第二层。

**层次 1 — 系统级接口**：高层"大脑"与低层"执行器"之间传什么。

| 系统接口 | 压缩度 | 代表 |
|---------|-------|------|
| 单个连续 latent 向量 | 最高 | [[Figure AI - Helix a VLA for Generalist Humanoid Control\|Helix]]（S2→S1）|
| 离散 latent action token (VQ-VAE) | 高 | [[AgiBot - GO-1 ViLLA Generalist Embodied Foundation Model\|GO-1]] |
| 自然语言子任务 | 高 | [[Galaxea - G0 Dual-System VLA Model\|Galaxea G0]]、[[Huang et al. - ChemBot Long-Term Memory for VLA-based Agents\|ChemBot]] |
| subgoal image | 中 | π₀.7（BAGEL）|
| （单模型内部 embedding）| — | π₀.5 |

**层次 2 — VLA 内部 VLM↔action 耦合**：执行器模型内部如何连接（即范式 A/B）。

| 内部耦合 | 代表 |
|---------|------|
| 范式 A（joint MoE）| π 全系列、**G0-VLA（PaliGemma）**、**GO-1 latent planner** |
| 范式 B（cross-attention）| GR00T、PhysVLA、**Helix S1**（enc-dec）|

**两层正交**：G0 系统级用语言子任务解耦，但 G0-VLA 内部仍是范式 A——所以"系统级解耦"和"内部耦合"是独立选择。

### 解耦程度光谱 + 修正后的部署假说

```
π 单模型 joint-MoE   →   GR00T/PhysVLA      →   Helix / GO-1        →   G0 / ChemBot
(范式A, 最紧耦合)         (单模型, 范式B,         (多模块, latent          (完全分离,
                          干净内部断点)           向量/token 接口)         语言子任务接口)
研究导向 ───────────────────────────────────────────────────────────→ 部署导向
```

**修正后的假说**（替代过简的"部署→范式 B"）：

> 部署导向玩家都追求**系统级解耦 + 压缩接口**，但有**两条路线**：
> - **路线 1：单模型 + 干净内部断点（范式 B）** —— GR00T、PhysVLA
> - **路线 2：显式多系统 + 压缩接口（latent 向量/token/语言）** —— Helix、GO-1、G0、ChemBot
>
> 共同点：**都避开"紧耦合单模型 joint-MoE"（π 的范式 A）**——那是最难拆分的。
> VLA 内部耦合（A/B）与系统级解耦**正交**。

**微妙之处**：即使最研究导向的 PI 也在向系统级解耦移动——π₀.7 外挂 BAGEL，用 subgoal image 作系统接口，但核心 VLA 仍保持范式 A 紧耦合。这是介于两条路线之间的混合。

### 玩家分布表（已核实）

| 玩家/模型 | 主体取向 | 系统架构 | 系统接口 | VLA 内部耦合 | 部署位置 |
|----------|---------|---------|---------|------------|---------|
| π 系列 | 研究（PI）| 单模型 | （内部 embedding/subgoal）| 范式 A | — |
| GR00T | 硬件（NVIDIA）| 单模型 | — | 范式 B | 云→端框架 |
| PhysVLA | 部署（DeepCybo）| brain+expert | — | 范式 B | — |
| Helix | 部署（Figure）| 双系统 S2+S1 | 单 latent 向量 | S1 范式 B | **全端侧** |
| GO-1 | 部署（AgiBot）| 三段式 | latent action token | 范式 A（planner）| — |
| Galaxea G0 | 部署（Galaxea）| 双系统 | 语言子任务 | 范式 A（G0-VLA）| 异步 |
| ChemBot | 研究/部署（LimX）| 双系统 | 语言子任务（MCP）| GR00T 基 | 上层云/下层端 |

---

## 接口维度（与流派正交）

不同流派可以与不同接口组合。接口选择本质上是带宽约束驱动的工程决策：

| 接口形式 | 单次大小估算 | 频率 | 上行带宽 | 适合连接 |
|---------|------------|------|---------|----------|
| 自然语言子任务 | ~100 B | 子任务级 | <1 kbps | 任何 |
| Python 代码/约束 | ~1-10 KB | 任务级 | 突发 | 任何 |
| Subgoal image | ~100 KB | 几秒一次 | 100s kbps | 4G+ |
| Latent embedding | ~10 KB | 高频 | Mbps | 5G/Wi-Fi |
| Affordance / value map | ~10-100 KB | 任务级 | 中等 | 4G+ |
| Action token / chunk | <1 KB | 50Hz | ~100 kbps | 4G+ |

**关键观察**：带宽 × 延迟约束限制了哪些流派 × 接口组合在云-端部署里可行。低带宽接口（自然语言、代码）天然适合 LLM-as-brain；中带宽（subgoal image）天然适合 Predictive Spatial；高带宽（action）只能在端侧或同址部署。

---

## 方法学维度（与流派正交）

与流派和接口都正交的"怎么训"的选择，可叠加在任何流派上：

- **Scaling laws** — 数据 × 计算 × 模型规模
- **Sim2Real** — 合成数据 + 现实迁移
- **Self-improvement** — RL refinement（[[Physical Intelligence - pi0.6 a VLA That Learns From Experience]] Recap, [[Physical Intelligence - RL Tokens Precise Manipulation with Efficient Online RL]]）
- **Distillation** — 大模型蒸馏到小模型
- **Co-training** — 异构数据混训（π₀.5）
- **Multi-embodiment** — 跨本体训练

---

## 现有工作的流派 × 接口矩阵

| 工作 | 主流派 | 接口形式 | 借用流派 | 方法学加成 |
|------|--------|---------|---------|----------|
| π₀.5 | VLA | Embedding（半共享） | — | Scaling + Co-training + Multi-embodiment |
| π*₀.6 | VLA | Action token | — | Scaling + Self-improvement (Recap) |
| π₀.7 | VLA | Subgoal image + metadata | Predictive Spatial (BAGEL) | Scaling + Distillation + Co-training |
| ChemBot | LLM-as-brain (Talker) | 自然语言子任务 | + VLA (Skill-VLA) | — |
| ReKep | LLM-as-brain (Constraint) | 约束函数 | — | — |
| RL Tokens | VLA | Action token | — | Self-improvement |
| GigaWorld-Policy | VLA | Action token | Predictive Spatial (嫁接) | "训繁推简" |

**观察**：所有当前前沿工作都是"主流派 + 借用 1-2 个次流派 + 方法学加成"——**没有纯粹的单流派系统**。

---

## Open Questions

### LLM/VLM-as-brain 的硬伤

| 硬伤 | 描述 | 当前状态 |
|------|------|---------|
| **物理可行性盲区** | LLM/VLM 训练数据里没有 affordance、力学、关节限制 | SayCan 的 affordance grounding 是开端，但很弱 |
| **闭环反馈缺失** | 小脑失败如何回流到大脑？大脑重规划代价多大？ | 几乎没有工作严肃研究 |
| **推理延迟** | 一次推理 1-3 秒，长程任务里 latency 加起来很大 | 蒸馏小 VLM / 缓存机制是出路，未成熟 |
| **接口可学习性** | 自然语言/约束接口是人设计的，能否端到端学接口？ | 完全开放 |
| **失败模式可调试性** | VLM 输出的子任务模糊，定位失败原因困难 | 工程问题，缺乏方法学 |

### Predictive Spatial Models 的开放问题

- 像素级 vs 潜在 vs 结构化三条子路线胜负未决
- 预测精度 vs 计算成本的 trade-off
- 想象-行动闭环的训练目标设计
- 预测错误的传播控制（hallucination 在 imagination 里的影响）

### 跨流派开放问题

- 多流派融合（如 π₀.7 = VLA + Predictive Spatial）会成为主流吗？
- 流派的"输出端"分类是表面，"输入端如何理解世界"才是深层分野
- 闭环反馈机制如何在云-端之间设计？
- 安全与可验证性的责任在哪一层？

---

## 前瞻预判

每个流派的演化按确定性分层。**注意**：这些是分析性预测而非事实陈述。

### LLM/VLM-as-brain 流派

**2-3 年内（高确定性）**：
- 蒸馏出 1-3B 的"VLM 大脑"，推理延迟降到 100-300ms
- 闭环反馈机制（小脑→大脑）成为标配研究方向
- 多本体共用一个 VLM 大脑成为产品形态

**5 年外（押注性预测）**：
- 接口语言可能从"人类设计"转向"端到端学习"
- VLM 大脑会整合长期记忆和持续学习能力
- 小脑状态会作为 VLM context 的一部分

**反向假设**（如果押错）：
- 小型 VLM 推理质量始终不够 → 退回 LLM 巨型云脑路线
- 端侧硬件爆发（Thor 之后再上一档）→ 整个云-端分工框架被颠覆

### Predictive Spatial Models 流派

**2-3 年内（高确定性）**：
- 潜在世界模型（V-JEPA 风格）获得更多关注（计算/带宽优势）
- World model + VLA 嫁接架构（类似 π₀.7 + BAGEL）成为常见模式
- 物理约束嵌入（PIN-WM 风格）受工业重视

**5 年外（押注性预测）**：
- World model 可能取代部分"动作数据"作为预训练源
- 3D 表征（3DGS-like）成为标准感知 substrate
- "想象式规划"成为通用机器人的标配能力

**反向假设**：
- 世界模型预测质量始终不够 → 退回纯反应式系统
- 不需要长程预测 → 表征流派单独存活，预测部分萎缩

### VLA 流派

**2-3 年内（高确定性）**：
- VLA 整体规模继续扩大（仅作为研究 benchmark）
- 工业部署强迫产生 VLA 拆分架构（云 VLM + 端 action expert）
- Action expert 单独存活并下端

**5 年外（押注性预测）**：
- 一体化 VLA 退出工业前沿，仅作为预训练阶段范式
- VLA backbone 与 VLM 流派融合
- Action expert 演化为标准的小脑模块

**反向假设**：
- 端侧硬件突破，整个 VLA 直接下端 → VLA 不需要肢解

---

## 深层判断

`★`  **当前 3 个流派的真正分野不是"输出什么"，而是"输入端如何理解世界"**：

- **LLM/VLM 流派**：世界理解外包给 web 预训练
- **VLA 流派**：从动作数据反推世界理解
- **Predictive Spatial 流派**：把世界理解作为可预测性的副产物

3 个流派**最终可能融合于"如何获得好的世界理解"**这个根本问题。这意味着今天的流派分野是"过渡状态"，未来 5-10 年可能重新洗牌。

`★`  **学界-工业差距是一个独立的元观察**：

学术 VLA 论文大多假设单机推理，回避云-端部署。工业部署必然云-端分布，但架构细节不公开。本框架正好踩在这个空白上。

---

## Related

- [[Memory in Embodied AI]] — 大脑/小脑记忆分配
- [[World-Action Models]] — WAM 范式与 VLA 路线对比
- [[Spatial Intelligence for Embodied AI]] — 空间智能的更广讨论
- [[Task decomposition]] — 大脑作为"任务拆解器"的视角
- [[Harness design]] — 来自 LLM agent 领域的相关抽象
- [[3D Spatial Representation]] — 表征层讨论
- [[Physical Intelligence (π)]] — VLA 流派主要推动者
- [[Embodied Cerebellum Models]] — 小脑模型流派（待建）
- [[Home robot architecture - a hierarchical embodied agent]] — synthesis：把流派/耦合/部署框架落到家庭机器人的具体分层架构

## 待补充材料清单

### 已有 source notes
- ✅ π 系列全部（范式 A）：[[Physical Intelligence - pi0 a Vision-Language-Action Flow Model for General Robot Control|π₀]] / π₀.5 / π*₀.6 / π₀.7 / RL Tokens
- ✅ [[NVIDIA - GR00T N1 An Open Foundation Model for Generalist Humanoid Robots]] — 范式 B 工业代表，代码核实
- ✅ [[DeepCybo - PhysBrain Human Egocentric Data as a Bridge from VLMs to Physical Intelligence]] — VLM-as-brain + 范式 B，人类视频路线
- ✅ [[Figure AI - Helix a VLA for Generalist Humanoid Control]] — 双系统，单 latent 向量接口，全端侧
- ✅ [[AgiBot - GO-1 ViLLA Generalist Embodied Foundation Model]] — 三段式，latent action token 接口，planner 范式 A
- ✅ [[Galaxea - G0 Dual-System VLA Model]] — 双系统，语言子任务接口，G0-VLA 范式 A

### 学术侧（待补充）
- **LLM/VLM-as-brain**：SayCan, Inner Monologue, Code-as-Policies, VoxPoser, MOKA, RoboGPT
- **Predictive Spatial**：V-JEPA, Dreamer V3, Cosmos, Genie 2/3, PIN-WM 详细笔记
- **VLA 端**：OpenVLA, Octo, DeepMind RT-1/RT-2/RT-X, Gemini Robotics, DM0
- **工业**：Optimus、宇树 UnifoLM、字节 GR-3、BAAI RoboBrain

### Synthesis 候选
- **「从无标注视频学动作/语义，绕开真机数据瓶颈」** ——一条正在成形的趋势线：GO-1 latent action（VQ-VAE 逆动力学）、PhysBrain egocentric 视频、LAPA（Latent Action Pretraining，学术源头）、Genie（latent action 做世界模型）。可提炼成独立 synthesis，连接 [[World-Action Models]] 与数据稀缺四路线。

### 工业侧（间接信号）
- Figure / Optimus / 智元 / 宇树 等公司架构发言
- Tesla FSD V14/V15 云-端架构（非具身先驱）
- 招聘 JD、播客、blog 等暴露的技术栈

## tags

#brain-model #embodied-ai #cloud-edge #survey-skeleton #open-question #taxonomy
