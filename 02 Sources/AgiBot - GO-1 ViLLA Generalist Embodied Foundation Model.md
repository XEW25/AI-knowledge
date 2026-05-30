# AgiBot - GO-1: ViLLA Generalist Embodied Foundation Model (AgiBot World Colosseo)

- **Type**: arXiv paper (cs.RO)
- **Authors**: AgiBot（智元）/ OpenDriveLab et al.
- **arXiv**: [2503.06669](https://arxiv.org/abs/2503.06669)（AgiBot World Colosseo）
- **Project**: https://agibot-world.com · GitHub: https://github.com/OpenDriveLab/AgiBot-World
- **Year**: 2025-03（论文）；GO-1 开源 2025-09
- **Open-source**: ✅ GitHub + HuggingFace（数据集 + 模型）
- **Accessed**: 2026-05-30
- **Raw**: URL-only（Tier 1，无本地捕获）

> **定位**：GO-1 提出 **ViLLA（Vision-Language-Latent-Action）** 框架——三段式 hierarchy。系统级接口是**离散 latent action token（VQ-VAE）**；VLM↔Latent Planner 是**范式 A 式 joint attention（逐层条件化）**。核心创新：latent action token 让模型能从无标注 web 视频学习动作表征。

## Model Paper Checklist

| # | 维度 | 信息 |
|---|------|------|
| 1 | 模型架构 | 三段式 ViLLA：**VLM**（InternVL2.5-2B + InternViT）→ **Latent Planner**（24 层，逐层条件化 VLM，预测离散 latent action token）→ **Action Expert**（diffusion，条件化于 latent token）|
| 2 | 模型规模 | VLM backbone InternVL2.5-**2B**；latent planner 24 层；action expert 未明确单独规模 |
| 3 | 训练数据 | **AgiBot World：100 万+ 轨迹，217 任务，5 大场景**；LAM 从 web 视频学 latent action |
| 4 | 训练方法 | 三阶段：① LAM（VQ-VAE 学 latent action）② latent planner（cross-entropy 预测 latent token）③ action expert（diffusion）|
| 5 | 推理性能 | VLM + latent planner + action expert 协同；具体频率/延迟未明确 |
| 6 | 开源状态 | ✅ 数据集 + 模型开源 |
| 7 | Benchmark | 在 AgiBot World 任务上验证；具体数字见论文 |
| 8 | 与已有工作关系 | VLA → **ViLLA** 的演进；latent action token 借鉴 LAPA/Genie 思路（从视频学动作）|
| 9 | 记忆机制 | 无 |

## 架构精度：三段式 + Latent Action Token 接口（已核实论文）

数据流：**VLM → Latent Planner → Action Expert**

### Latent Action Model (LAM)
- 从连续帧对提取 latent action，**VQ-VAE 量化成离散 token**（k=4 token/动作）
- inverse dynamics encoder + forward dynamics decoder
- **关键**：能从**无标注 web 视频**学动作表征（无需机器人动作标签）

### Latent Planner（范式 A 式耦合）
- 24 层 transformer
- 原文："layer-by-layer conditioning from the VLM backbone with full bidirectional attention"
- 二手补充（press release）："shares the same Transformer architecture as the VLM backbone but utilizes two independent sets of FFN and Q/K/V/O projection matrices" → **范式 A（joint MoE 式：独立权重、逐层 joint attention）**
- cross-entropy loss 预测 latent action token

### Action Expert
- 原文："shares the same architectural framework as the latent planner"
- diffusion objective 建模连续动作
- 条件化于 latent action token（hierarchical conditioning）

**两层耦合定位**：
- **系统级接口** = latent action token（离散，VQ-VAE）——介于"单 latent 向量"（Helix）和"语言子任务"（G0）之间
- **VLM↔Latent Planner 内部耦合** = 范式 A（joint，逐层）

详见 [[Embodied Brain Models]] 两层耦合框架。

## Why It Matters

- **latent action token 是从视频学习的关键**：用 VQ-VAE 学"动作词汇表"，绕开真机动作标签稀缺问题
- **AgiBot World 数据集**：100 万+ 轨迹开源，是中国具身数据规模派的代表
- **部署导向路线 2 的代表**：显式多段式 + 压缩 token 接口

## Related Concepts

- [[Embodied Brain Models]] — latent action token 系统接口；范式 A 内部耦合
- [[World-Action Models]] — 从视频学动作表征（latent action ~ LAPA/Genie）
- [[Physical Intelligence - pi0 a Vision-Language-Action Flow Model for General Robot Control]] — 范式 A 对照
- [[Task decomposition]] — latent planner 作为高层规划

## Related Entities

- [[AgiBot 智元]] — 出品方（待建实体页）

## tags

#vla #villa #agibot #latent-action #vq-vae #paradigm-a #embodied-ai #china #open-source
