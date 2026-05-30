# Physical Intelligence - π₀: a Vision-Language-Action Flow Model for General Robot Control

- **Type**: arXiv paper (cs.RO, cs.LG)
- **Authors**: Physical Intelligence (Kevin Black, Noah Brown, Danny Driess, Chelsea Finn, Karol Hausman, Brian Ichter, Sergey Levine, Karl Pertsch, et al.)
- **arXiv**: [2410.24164](https://arxiv.org/abs/2410.24164)
- **Blog**: https://www.pi.website/blog/pi0
- **Year**: 2024-10
- **Open-source**: ✅ [openpi](https://github.com/Physical-Intelligence/openpi)（权重 + finetune 代码，JAX + PyTorch）
- **Accessed**: 2026-05-30

> **注**：本笔记是 π 系列的基础笔记。π₀ 的架构（范式 A：joint-attention MoE）经**代码级核实**，是整个 π 系列耦合方式的源头。后续 π₀.5 / π*₀.6 / π₀.7 / RL Tokens 全部继承此耦合。

## Model Paper Checklist

| # | 维度 | 信息 |
|---|------|------|
| 1 | 模型架构 | PaliGemma 3B VLM backbone + 300M action expert (flow matching)；Transfusion 风格双专家，block-causal joint attention（**代码级核实**，详见下） |
| 2 | 模型规模 | 总 **3.3B**（PaliGemma 3B + action expert 300M）；基线 π₀-small **470M**（无 VLM 初始化） |
| 3 | 训练数据 | OXE 开源数据 + PI 自有大规模跨 embodiment 演示数据集（多机器人平台）；具体小时数/任务数见论文 |
| 4 | 训练方法 | Transfusion 风格多目标：连续动作 flow matching loss + 离散 token cross-entropy；pre-train + task post-train |
| 5 | 推理性能 | 50Hz 控制，action chunk 最多 50 步，flow matching 迭代去噪；VLM KV cache 可在去噪步间复用（block-causal 的结果） |
| 6 | 开源状态 | ✅ openpi（权重 + 代码 + finetune，JAX 原版 + PyTorch 移植） |
| 7 | Benchmark | 多任务通用操控（叠衣物、清理餐桌、装盒、组装等）；显著超越当时基线（含 OpenVLA、RT-2-X 等） |
| 8 | 与已有工作关系 | PI 第一个 VLA；**范式 A（joint-attention MoE）的源头**；后续全系列继承 |
| 9 | 记忆机制 | 无 |

## Summary

π₀ 是 Physical Intelligence 的第一个 VLA 模型，提出"在预训练 VLM (PaliGemma) 之上加 flow matching action expert"的范式。核心架构贡献是 Transfusion 启发的**双专家结构**：VLM 和机器人专用 token 用各自独立的权重，但在同一 Transformer stack 内通过 joint attention 交互。

## 架构精度：范式 A（Joint Attention / MoE-style）—— 代码级核实

经官方 openpi (`src/openpi/models_pytorch/pi0_pytorch.py`)、lucidrains/pi-zero-pytorch、allenzren/open-pi-zero 三处代码核实：

### 双专家，独立权重

- **VLM expert（PaliGemma 3B）** 与 **action expert（300M）** 是**两套完全独立的权重**：各自的 Q/K/V 投影 + FFN
- 两个 expert 的梯度检查点分别设置，确认参数集分离
- **不是真正的 MoE**：无 router / gating；PI 论文用 "mixture of experts with two mixture elements" 是**借喻**；lucidrains 实现注释明确 "This is not an MoE architecture"
- 原文："a mixture of experts with two mixture elements, where the first element is used for image and text inputs, and the second is used for robotics-specific inputs and outputs"

### Joint Attention 机制（KV 拼接）

```
mq, mk, mv = to_qkv(vlm_tokens)        # VLM 用自己权重
aq, ak, av = to_actions_qkv(actions)   # action 用自己权重
k, v = cat((mk, ak)), cat((mv, av))    # 两组 KV 拼接（VLM 在前）
q = cat([mq, aq])
attn = softmax(q @ k.T) @ v            # 合并序列上算一次 attention
```

### Block-Causal Mask

| Query \ Key | VLM (image+text) | Proprio (state) | Action |
|------------|------|---------|--------|
| VLM | ✅ | ❌ | ❌ |
| Proprio | ✅ | ✅ | ❌ |
| Action | ✅ | ✅ | ✅ |

- Block 内双向，block 间单向：VLM → Proprio → Action
- **VLM 不 attend 到 action**（关键）；proprio 与 action 共享同一 expert 权重
- open-pi-zero 原文："Block-wise causal masking is used such that VLM block attends to itself, proprioception (sharing weights with action) attends to itself and VLM, and action attends to all; each block is fully bidirectional within."

### 逐层 lockstep

PaliGemma 第 i 层与 action expert 第 i 层在同一 attention 内交互，两者层数相同、同步推进。

### 工程含义（云-端）

block-causal 使 **VLM KV cache 可在 flow matching 多步去噪间复用**——VLM 不依赖 action，一次编码后整个去噪过程不重算。但若要云-端拆分，需逐层传 VLM KV cache（接口较重，对比范式 B 的单一 embedding 接口）。详见 [[Embodied Brain Models]] 的"VLA 内部的两种耦合范式"。

## Why It Matters

- 确立了"预训练 VLM + flow matching action expert"这一后来成为行业共识的模板
- 范式 A 的源头：所有后续 π 模型继承此耦合
- 开源（openpi）使其成为学界研究和复现的重要基础

## Related Concepts

- [[Embodied Brain Models]] — 范式 A/B 耦合对比（本模型是范式 A 源头）
- [[World-Action Models]] — WAM vs VLA 路线对比
- [[Task decomposition]] — VLA 端到端 vs 任务拆解
- [[VLA - Vision-Language-Action Models]] — VLA 模型家族

## Related Sources（π 系列，全部继承范式 A）

- [[Physical Intelligence - pi0.5 a VLA with Open-World Generalization]] — co-training + open-world 泛化
- [[Physical Intelligence - pi0.6 a VLA That Learns From Experience]] — Recap RL + 独立值函数
- [[Physical Intelligence - pi0.7 a Steerable Generalist Robotic Foundation Model]] — BAGEL 世界模型 + MEM
- [[Physical Intelligence - RL Tokens Precise Manipulation with Efficient Online RL]] — 冻结 backbone + RL adapter

## Related Entities

- [[Physical Intelligence (π)]] — 作者团队
- [[Sergey Levine]] — Co-founder/Chief Scientist
- [[Chelsea Finn]] — Co-founder/Research Lead
