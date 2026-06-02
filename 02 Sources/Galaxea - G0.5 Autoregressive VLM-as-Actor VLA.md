# Galaxea - G0.5: a Pretrained Autoregressive VLA (VLM-as-Actor)

- **Type**: Technical Report（Galaxea Team）
- **Org**: [[Galaxea 星海图]]（Galaxea AI / Xinghaitu）
- **URL**: https://opengalaxea.github.io/G05/ · PDF: https://opengalaxea.github.io/G05/Galaxea_G0_5.pdf
- **Year**: 2026（技术报告；提取文本中未见精确日期）
- **Open-source**: ✅ 释放预训练 backbone
- **Accessed**: 2026-05-30
- **Raw**: [[2026 - Galaxea - G0.5.pdf]]（本地 PDF 已存 `01 Raw/`）

> **定位（重要）**：G0.5 是一次**架构大转向**——从 G0 的双系统（VLM-as-encoder + flow-matching 执行器）转向**统一自回归 VLM-as-actor**：单 transformer decoder、单套权重、单一目标，在一个 token 流里同时生成推理与动作。它**直接挑战了知识库的"范式 A/B"分类**（见下方"对框架的影响"）。

## Model Paper Checklist

| # | 维度 | 信息 |
|---|------|------|
| 1 | 模型架构 | **统一自回归 VLA（VLM-as-actor）**：单 transformer decoder（Qwen3.5 2B 初始化）在一个 AR token 流里生成 reasoning + action token，单一 next-token 目标；**可选 flow-matching head 仅作推理加速器** |
| 2 | 模型规模 | backbone **Qwen3.5 2B** |
| 3 | 训练数据 | 大量机器人数据集 + VQA samples 联合预训练；跨 embodiment |
| 4 | 训练方法 | 自回归 next-token 预测（CE loss 覆盖生成段每个 token）；三组件：跨本体 VQ ActionCodec + native in-stream CoT + visual memory |
| 5 | 推理性能 | AR 生成，action 按 chunk 发出、闭环 re-plan；低延迟/连续噪声探索场景可挂可选 FM head |
| 6 | 开源状态 | ✅ 释放预训练 backbone |
| 7 | Benchmark | LIBERO **98.9** / RoboTwin 2.0 **93.3** / SimplerEnv-Bridge **87.3** / DROID zero-shot **82.5** / R1-Lite·R1-Pro 真机 **76.7**（vs π0.5 53.3、GR00T-N1.7 24.4）/ BEHAVIOR-1K Challenge **31.4**（vs π0.5 26.3、赛事冠军 26.1）；1 个 post-train epoch 超过 π0.5 四个 epoch |
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
- 三个推理原语共享一套 token vocab：**物体 bounding box + 原子子任务文本 + 2D 末端轨迹（TraceVLA 启发）**，外加 ActionHint
- coarse-to-fine 顺序：subtask → bbox → trace → action hint → action
- **prompt 条件模板**：CoT 模式推理时可切换、无需重训（每步从含 no-CoT 的 8 种组合采样）
- 对比 ECoT（同享 AR decoder，但 G0.5 多了 3 原语 + prompt 可切换）；对比"bolt-on CoT"（HAMSTER / Fast-in-Slow System2→System1，推理只是模块间接口）

### ③ Visual Memory
- 多秒历史帧经 vision encoder 注入，利于长程控制与闭环 re-plan（类 MEM）

## 对知识库框架的影响（需讨论）

G0.5 表明我们的**"范式 A vs B"其实是更上层"VLM-as-encoder"内部的子区分**。更根本的轴应是：

```
VLM-as-actor（统一 AR，VLM 自己产动作）
   └─ RT-2 → OpenVLA → π0-FAST → G0.5
VLM-as-encoder（VLM 编码 + 独立专家产动作）
   ├─ 范式 A：joint MoE（π 系列）
   └─ 范式 B：cross-attention（GR00T、PhysVLA）
```

建议把 [[Embodied Brain Models]] 的耦合讨论重构为"actor vs encoder"为顶层轴、A/B 为 encoder 子型，并把统一 AR 列为第三大类。

**云-端含义**：统一 AR 单模型更难按"脑/小脑"切分（无独立专家边界），但 **VQ action token 提供了一个天然的离散接口**；可选 FM head 又给低延迟部署留了口子。

## Why It Matters

- **行业掉头信号**：Galaxea 从 G0（encoder/双系统）转向 G0.5（actor/统一 AR），是 "actor vs encoder 之争未定" 的强证据
- **重新确立 AR 为 VLA 基础**：配合 VLA-0、π0-FAST，AR 路线在 reasoning/指令跟随/prompt 操控上的结构性优势被重新重视
- **prompt 操控动作**：因推理与动作同权重，prompt 措辞可不重训就改变动作粒度/horizon/OOD 处理（初步定性证据）

## Related

- [[Galaxea - G0 Dual-System VLA Model]] — **前代**，双系统 VLM-as-encoder；G0.5 是对它的架构反转
- [[Galaxea 星海图]] — 出品方（注意 G0→G0.5 的架构掉头）
- [[Embodied Brain Models]] — actor vs encoder 顶层轴；范式 A/B 重定位
- [[Physical Intelligence - pi0 a Vision-Language-Action Flow Model for General Robot Control]] — VLM-as-encoder 范式 A 对照（被 G0.5 批评对象）
- [[NVIDIA - GR00T N1 An Open Foundation Model for Generalist Humanoid Robots]] — 范式 B 对照（被批评对象）
- [[Home robot architecture - a hierarchical embodied agent]] — 统一 AR 对"脑/小脑"拆分的挑战

## tags

#vla #g05 #galaxea #autoregressive #vlm-as-actor #action-tokenizer #in-stream-cot #embodied-ai #china #open-source
