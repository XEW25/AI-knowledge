# NVIDIA - GR00T N1: An Open Foundation Model for Generalist Humanoid Robots

- **Type**: arXiv paper + open-source model series (cs.RO, cs.LG)
- **Authors**: NVIDIA (GEAR Lab et al.)
- **arXiv**: [2503.14734](https://arxiv.org/abs/2503.14734)（N1）
- **Project**: https://research.nvidia.com/labs/gear/gr00t-n1_5/ （N1.5）
- **GitHub**: https://github.com/NVIDIA/Isaac-GR00T
- **Year**: N1 2025-03；N1.5 2025-06；N1.6 / N1.7 后续迭代
- **Open-source**: ✅ 代码 Apache 2.0；权重 NVIDIA Open Model License（HuggingFace: `nvidia/GR00T-N1.7-3B` 等）
- **Accessed**: 2026-05-30
- **Raw**: URL-only（Tier 1，无本地 PDF 捕获）

> **定位**：GR00T 是 NVIDIA 的开源人形机器人 VLA 基础模型系列，**范式 B（cross-attention / encoder-decoder）的工业代表**。与 π 系列（范式 A）形成核心对照。耦合方式经代码核实（`gr00t/model/modules/dit.py`）。

## Model Paper Checklist

| # | 维度 | 信息 |
|---|------|------|
| 1 | 模型架构 | VLM backbone（冻结）+ diffusion/flow-matching DiT action head；**范式 B：DiT 交替 self-attention（proprio+action）与 cross-attention（到 VLM embedding），代码核实** |
| 2 | 模型规模 | N1 **2B**；N1.5/N1.6/N1.7 **3B**（VLM backbone ~2.1B + DiT action head） |
| 3 | 训练数据 | 内部 GR-1 + OpenX-Embodiment + 仿真 GR-1 (DexMG) + **DreamGen 神经轨迹（合成）** + AgiBot-Beta；N1.5 训练 250K steps on 1K H100，global batch 16384 |
| 4 | 训练方法 | flow matching action；**VLM 冻结（N1.5 关键改动）**；简化 adapter MLP + LayerNorm；**FLARE（Future LAtent Representation Alignment）loss（coeff 0.2）**；DreamGen 合成数据增强 |
| 5 | 推理性能 | 控制频率/延迟未在公开材料明确 |
| 6 | 开源状态 | ✅ 代码 Apache 2.0；权重 NVIDIA Open Model License；HF checkpoints（base + LIBERO/DROID/SimplerEnv 微调版） |
| 7 | Benchmark | DreamGen 12 任务 13.1%→38.3%（N1→N1.5）；Language Table 52.8%→93.2%；Sim GR-1 36.4%→54.4%；Real GR-1 跟随率 46.6%→93.3%；新物体 0-shot 0%→15%；RefCOCOg-val grounding 89.6% |
| 8 | 与已有工作关系 | 首个开源人形 VLA 基础模型；**范式 B 代表**；**N1.7 backbone 换 Cosmos-Reason2-2B（Qwen3-VL 架构），打通 World Model 与 VLA 两流派** |
| 9 | 记忆机制 | 无（基础模型） |

## Summary

GR00T N1 是 NVIDIA 推出的开源人形机器人 VLA 基础模型，采用**双系统设计**：VLM（视觉-语言理解）+ DiT（diffusion/flow-matching action head）。后续 N1.5 通过**冻结 VLM**、简化 adapter、引入 FLARE loss 和 DreamGen 合成数据大幅提升性能。核心架构是**范式 B（encoder-decoder / cross-attention）**。

## 架构精度：范式 B（Cross-Attention / Encoder-Decoder）—— 代码级核实

经 `gr00t/model/modules/dit.py` 代码核实：

- **VLM（冻结）完整跑完所有层 → 产出最终 embedding（算一次）**
- 该 embedding 作为 `encoder_hidden_states` 传给 DiT 的**每个 cross-attn 层**
- **每个 cross-attn 层用自己的 to_k/to_v 重新投影同一份 VLM embedding**（per-layer K/V projection on a fixed source）
- DiT 层**交替**：偶数层 cross-attend VLM，奇数层 self-attend（proprio+action）；由 `interleave_self_attention` 控制
- `AlternateVLDiT` 变体进一步把图像 token 与文本 token 分开，每隔 n 层轮流 cross-attend
- action head 是 diffusion transformer，对连续动作做去噪

**与范式 A（π 系列）的关键区别**：VLM 是独立编码器（先跑完），DiT 是独立解码器（cross-attend 固定 embedding）；不是 π 系列那样逐层 lockstep 的 joint attention。**云-端接口数据量轻**（一份 embedding），适合部署拆分。详见 [[Embodied Brain Models]]。

## backbone 演进（值得追踪）

| 版本 | VLM backbone | 备注 |
|------|-------------|------|
| N1 | Eagle | 2B 总参 |
| N1.5 | Eagle 2.5（冻结） | 3B；FLARE + DreamGen |
| N1.6 | Eagle | 迭代 |
| **N1.7** | **Cosmos-Reason2-2B（Qwen3-VL 架构）** | 换用 NVIDIA 自家 Cosmos-Reason，**World Model 与 VLA 流派融合** |

## Why It Matters

- **范式 B 的工业标杆**：encoder-decoder 设计天然适合云-端拆分，与 NVIDIA 卖 Jetson Thor 端侧硬件的战略一致
- **开源 + 全栈**：Apache 2.0 代码 + 权重 + Isaac Sim 仿真 + DreamGen 数据合成，是学界复现和工业落地的重要基础
- **预测思想渗入 VLA**：FLARE（未来潜在表征对齐）+ DreamGen（世界模型生成合成轨迹）体现 [[Embodied Brain Models]] 里 Predictive Spatial 流派与 VLA 的融合
- **N1.7 换 Cosmos-Reason backbone**：把"会预测/推理的世界模型"直接当 VLA 大脑

## Related Concepts

- [[Embodied Brain Models]] — **范式 B 代表**；范式 A/B 跨工作对比
- [[Physical Intelligence - pi0 a Vision-Language-Action Flow Model for General Robot Control]] — **范式 A 对照**（joint-attention MoE）
- [[World-Action Models]] — DreamGen / Cosmos 世界模型生成数据
- [[Huang et al. - ChemBot Long-Term Memory for VLA-based Agents]] — ChemBot 的 Skill-VLA 基于 GR00T

## Related Entities

- [[NVIDIA]] — 出品方（待建实体页）
- [[Physical Intelligence (π)]] — 范式 A 的主要推动者，竞争对手

## tags

#vla #gr00t #nvidia #paradigm-b #cross-attention #embodied-ai #open-source #world-model
