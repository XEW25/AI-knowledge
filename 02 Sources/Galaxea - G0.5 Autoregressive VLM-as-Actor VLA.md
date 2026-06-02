# Galaxea - G0.5: a Pretrained Autoregressive VLA (VLM-as-Actor)

- **Type**: Technical Report（Galaxea Team）
- **Org**: [[Galaxea 星海图]]（Galaxea AI / Xinghaitu）
- **URL**: https://opengalaxea.github.io/G05/ · PDF: https://opengalaxea.github.io/G05/Galaxea_G0_5.pdf
- **Year**: 2026（技术报告；提取文本中未见精确日期）
- **Open-source**: ⚠️ 论文声称释放预训练 backbone，但**未找到公开代码/权重仓库**（GitHub `OpenGalaxea/G05` 仅项目页 TypeScript/Vite；HF 仅第三方微调）；实际开源状态待确认，**无模型/训练代码可参考**
- **Accessed**: 2026-05-30
- **Raw**: URL-only（Tier 1）——原文见上方 PDF 链接；未保留本地副本（文件 ~27MB，体积过大，按 vault 实践对大文件采用 URL-only）

> **定位（重要）**：G0.5 是一次**架构大转向**——从 G0 的双系统（VLM-as-encoder + flow-matching 执行器）转向**统一自回归 VLM-as-actor**：单 transformer decoder、单套权重、单一目标，在一个 token 流里同时生成推理与动作。它**直接挑战了知识库的"范式 A/B"分类**（见下方"对框架的影响"）。

## Model Paper Checklist

| # | 维度 | 信息 |
|---|------|------|
| 1 | 模型架构 | **统一自回归 VLA（VLM-as-actor）**：单 transformer decoder（Qwen3.5 2B 初始化）在一个 AR token 流里生成 reasoning + action token，单一 next-token 目标；**可选 flow-matching head 仅作推理加速器** |
| 2 | 模型规模 | backbone **Qwen3.5 2B** |
| 3 | 训练数据 | 机器人数据集 + ~100M 视觉-语言混合（50M web VQA + 50M 具身 VQA + 5M 自标注），VQA:action=1:4；bbox/trace/subtask/hint 由 autolabeling pipeline（Gemini 3 / Doubao + SAM3 + 正运动学投影）自动补齐 |
| 4 | 训练方法 | 自回归 next-token 预测（CE loss 覆盖生成段每个 token）；三组件：跨本体 VQ ActionCodec + native in-stream CoT + visual memory |
| 5 | 推理性能 | AR 生成，action 按 chunk 发出、闭环 re-plan；低延迟/连续噪声探索场景可挂可选 FM head |
| 6 | 开源状态 | ⚠️ 论文称释放预训练 backbone，但**未找到公开代码/权重**（GitHub `OpenGalaxea/G05` 仅项目页；HF 仅第三方微调）；无可参考的模型/训练代码 |
| 7 | Benchmark | 共 7 个 regime：LIBERO **98.9** / RoboTwin 2.0 **93.3** / SimplerEnv-Bridge **87.3** / DROID zero-shot **82.5** / R1-Lite·R1-Pro 真机 **76.7**（vs π0.5 53.3、GR00T-N1.7 24.4）/ BEHAVIOR-1K Challenge **31.4**（vs π0.5 26.3、赛事冠军 26.1）/ **Pick-and-Place (PP Bench)** 语言跟随基准（分别报 language-following rate 与 task success，跨 in/out-of-distribution 物体类别，大幅超 VLM-as-encoder 基线，无单一 headline 数）；1 个 post-train epoch 超过 π0.5 四个 epoch |
| 8 | 与已有工作关系 | 否定 VLM-as-encoder（π0/π0.5/GR00T-N1.x/SmolVLA），回归 VLM-as-actor（RT-2/OpenVLA/π0-FAST 谱系）；in-stream CoT 扩展 ECoT |
| 9 | 记忆机制 | **visual memory**：多秒历史经 vision encoder 注入 |

## 核心论点：VLM-as-actor vs VLM-as-encoder

论文给出 VLA 的**根本架构轴**：

> "Vision-language-action models split along one architectural axis: whether the VLM produces actions or only conditions a separate module that does."

- **VLM-as-encoder（主流）**：VLM 供 hidden states / KV cache 给**单独训练的 flow-matching/diffusion 专家**产连续动作。VLM 被降为"条件编码器"，其 CoT 推理、in-context learning、prompt 操控只能**穿过压缩的条件瓶颈**间接生效。代表：π0（范式 A）、GR00T-N1.x（范式 B）、SmolVLA
- **VLM-as-actor（G0.5 回归）**：VLM 自己以 AR 方式产动作，推理与动作**共享 decoder、上下文、目标**。代表：RT-2、OpenVLA、π0-FAST、**G0.5**

**反将 KI 一军**：KI（[[Physical Intelligence - pi0.5 a VLA with Open-World Generalization|π0.5]] 的 Knowledge Insulation）阻断专家梯度回流、并"重新引入 AR 动作预测作为辅助表征目标"——**等于承认 AR 动作监督才是保护 VLM 能力的信号**。VLA-0 进一步证明：未改 VLM 纯 AR 训 actions-as-text，在 LIBERO 上超过 π0.5-KI/OpenVLA-OFT/SmolVLA。

## 三个关键组件

### ① 跨本体 VQ ActionCodec（解决 AR 的低效根源）
- 早期 AR VLA（RT-2/OpenVLA）按维度按时间步 binning，高频灵巧数据下浪费容量
- G0.5 用**可学习 VQ codec**把动作 chunk 压成紧凑离散码；**单一 frozen codec** 消费 5 部位固定布局 → 统一 27 维 action token 流
- **active-DoF 预测**：只发出运动部位的 token group，闲置手臂的 token 组**整组丢弃、不 padding**（Fig.1：step01 双臂，step02 只剩左臂+夹爪）
- **加新本体无需新参数**；左右对称由构造保证。对比 FAST（固定 DCT、按本体分别）——G0.5 是端到端、跨本体学习
- action span = R 个 residual round × {active DoF groups} × 每组 8 codes

### ② Native in-stream CoT（推理与动作同流）
**四个自描述推理原语**（标签字面写在序列里），coarse-to-fine 固定顺序：
1. `Subtask:` 原子子任务文本 —— 如 "pick up the towel"
2. `BBox:` 关键物体定位 —— 如 `towel <loc0418><loc0312><loc0680><loc0556>; plate <loc...>`
3. `Trace:` 2D 末端落点轨迹（TraceVLA 启发）—— 如 `Left <loc0543><loc0436>; Right None`
4. **`ActionHint:` 帧级、自然语言的即时动作提示** —— 如 "close the left gripper while moving forward"

之后才是 `Action: <EOV> <action_codes>`。`<EOV>` 标记"推理→动作"边界。

- **prompt 条件模板**：CoT 模式推理时可切换、无需重训
- 对比 ECoT（同享 AR decoder，但 G0.5 多了 3 原语 + prompt 可切换）；对比"bolt-on CoT"（HAMSTER / Fast-in-Slow System2→System1，推理只是模块间接口）

### 词表如何统一（三种子语言共享一条 AR 流）

一切序列化进**同一条自回归 token 流**，词表里并存三种"子语言"，由同一 decoder、同一 CE 损失产生（"all just tokens to the decoder"）：

| 内容 | token 形式 |
|------|-----------|
| 文本（subtask、action hint）| Qwen 原生语言 token |
| 空间坐标（bbox、2D trace）| 量化定位 token `<loc####>`（框=4 个、轨迹点=2 个）|
| 动作 | RVQ 码 `<action####>` + DoF 组标记 `<left_control_r>` 等 + noop token |

控制 token：`<bos> <EOC>（条件段结束） <EOV>（动作开始） <eos>`。

### ③ Visual Memory
- 多秒历史帧经 vision encoder 注入，利于长程控制与闭环 re-plan（类 MEM）

## 训练与数据

### 训练目标（极简）
- **单一 next-token 交叉熵，只在生成段计算**（条件段 user 侧不算 loss）；**无辅助回归、无专家蒸馏**
- 协同训练：~100M 视觉-语言混合（50M 通用 web VQA + 50M 具身 VQA + 5M 自标注 VQA），**VQA:action = 1:4**，同一 CE
- AdamW，峰值 LR 1e-5；pretrain → post-train

### "何时推理 vs 何时动作"——三重机制（非模型自由裁量）
1. **自描述标签 + 固定顺序**：发完标签填值，`<EOV>` 划界
2. **prompt 指令选发哪些**：条件段含"声明接下来预测哪些目标"的简短指令（如 "predict bbox, subtask and action"）
3. **训练见过所有模式**：每条机器人样本随机指派**恰好一种** CoT 格式（8 候选加权采样：no-CoT / atomic / high-level / subtask / subtask+action-hint / 2D trace / bbox 等；subtask 权重更高）；评测用固定 no-CoT

### Autolabeling pipeline（数据侧的关键巧思）
原始机器人数据只有动作轨迹，bbox/trace/subtask/action-hint 由自动流水线补齐：

| 标注 | 来源 |
|------|------|
| 语言（subtask / action hint / 指令）| 规则化时间分段 → 调 **Gemini 3 / Doubao Seed 2.0 Pro** API 生成 |
| 视觉 grounding（bbox + mask）| 多模态基础模型 + **SAM3 tracking** 逐帧 |
| 2D 末端轨迹 | 关节位姿正运动学算 3D 轨迹 → 投影到头相机像面 |

**含义**：action hint 等自然语言标注由大模型 API 生成 → G0.5 的"推理能力"部分是**数据层蒸馏**（从 Gemini/Doubao 的标注，而非模型层蒸馏）。这条流水线是"从已有机器人数据廉价造 CoT 监督"的关键。

## CoT × 解码接口 ablation（AR vs FM，§5.6）

单一预训练 checkpoint，仅在推理时切换 (i) 解码接口（AR token vs 额外 FM head）和 (ii) CoT（开/关），不微调任何参数。任务：PP Bench（单阶段）+ Air Fryer / Cook Bacon（各 5 阶段长程、zero-shot、household 未见于预训练）。**关键控制**：CoT 开时两 head 都从 **post-CoT hidden state** 出发，所以隔离的是"解码接口"而非"条件输入"。

**Finding 1 — CoT 只在多阶段长程任务上明显有用**：
- 单阶段 PP Bench：CoT 对两 head 几乎无变化（AR 65.6→67.2、FM 59.4→60.9，≤1.6pp）——单次 grounding，无 per-stage 推理发挥空间
- 五阶段：AR progress 2.4→3.8（Air Fryer）、1.5→3.4（Bacon）——有 per-stage 子目标时 CoT 才显著帮 grounding+执行

**Finding 2 — AR 比 FM 更"跟得上"CoT**（匹配 CoT 下）：
- Air Fryer：AR 2.4→3.8 vs FM 2.1→2.7；language-following **72(AR) vs 48(FM)**
- Bacon：AR 1.5→3.4 vs FM 1.2→2.0；**64(AR) vs 44(FM)**
- 论文 hypothesis：差距源自**解码接口而非推理内容**——AR 动作 token 与 CoT 同序列、**可直接 attend**；**FM head 只 condition on 隐藏态的 pooled summary**

**CoT 质量两 head 相同**：手工评分 subtask/bbox 正确率 ~90%/85%/80%，无系统性 AR–FM 差异 → 支持"差在接口、不在推理质量"。

### 关键澄清与局限（核实后）
- **FM head 条件化 = pooled summary（池化摘要）**：**不是**完整逐 token embedding 序列，**也不是** cross-attention（范式 B）——**池化比 B 更压缩**。具体池化机制（mean/attention/几个 summary token、取哪层）论文**未说明**，且**无开源代码可查**，属 underspecification
- **对 encoder 派不完全公平**：G0.5 的 FM 基线用了池化条件化（较弱）；一个 cross-attention 的 FM head 未必丢这么多 CoT 细节——"AR > FM" 部分可能是**基线选择**所致，不纯是 AR 范式优越
- **证据偏弱**：长程任务 **n=5 rollouts/cell**（小样本）；作者明说机制"**未直接验证，留待 future work**"
- 主结果评测用**固定 no-CoT**

## 对知识库框架的影响（需讨论）

G0.5 表明我们的**"范式 A vs B"其实是 VLA 内部更上层"VLM-as-encoder"的子区分**。**VLA 流派内部**的上层轴（非跨流派顶层、非"最根本"）应是：

```
VLA 流派内部（World Model / Predictive Spatial 相对正交）：
  VLM-as-actor（统一 AR，VLM 自己产动作）
     └─ RT-2 → OpenVLA → π0-FAST → G0.5
  VLM-as-encoder（VLM 编码 + 独立专家产动作）
     ├─ 范式 A：joint MoE（π 系列）
     └─ 范式 B：cross-attention（GR00T、PhysVLA）
```

已据此重构 [[Embodied Brain Models]] 的 VLA 节：actor vs encoder 为 VLA 内部上层轴，A/B 归为 encoder 子型，统一 AR 为 actor 分支。

**云-端含义**：统一 AR 单模型更难按"脑/小脑"切分（无独立专家边界），但 **VQ action token 提供了一个天然的离散接口**；可选 FM head 又给低延迟部署留了口子。

## Why It Matters

- **行业掉头信号**：Galaxea 从 G0（encoder/双系统）转向 G0.5（actor/统一 AR），是 "actor vs encoder 之争未定" 的强证据
- **重新确立 AR 为 VLA 基础**：配合 VLA-0、π0-FAST，AR 路线在 reasoning/指令跟随/prompt 操控上的结构性优势被重新重视
- **prompt 操控动作**：因推理与动作同权重，prompt 措辞可不重训就改变动作粒度/horizon/OOD 处理（初步定性证据）

## Related

- [[Galaxea - G0 Dual-System VLA Model]] — **前代**，双系统 VLM-as-encoder；G0.5 是对它的架构反转
- [[Galaxea 星海图]] — 出品方（注意 G0→G0.5 的架构掉头）
- [[Embodied Brain Models]] — actor vs encoder（VLA 流派内部上层轴）；范式 A/B 重定位为 encoder 子型
- [[Physical Intelligence - pi0 a Vision-Language-Action Flow Model for General Robot Control]] — VLM-as-encoder 范式 A 对照（被 G0.5 批评对象）
- [[NVIDIA - GR00T N1 An Open Foundation Model for Generalist Humanoid Robots]] — 范式 B 对照（被批评对象）
- [[Home robot architecture - a hierarchical embodied agent]] — 统一 AR 对"脑/小脑"拆分的挑战

## tags

#vla #g05 #galaxea #autoregressive #vlm-as-actor #action-tokenizer #in-stream-cot #embodied-ai #china #open-source
