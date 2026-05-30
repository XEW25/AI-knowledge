# Figure AI - Helix: a Vision-Language-Action Model for Generalist Humanoid Control

- **Type**: 公司 blog / 技术发布（非 arXiv 论文）
- **Org**: Figure AI（US）
- **URL**: https://www.figure.ai/news/helix · Helix 02: https://www.figure.ai/news/helix-02
- **Year**: 2025-02（Helix）；Helix 02 2026
- **Open-source**: ❌ 闭源
- **Accessed**: 2026-05-30
- **Raw**: URL-only（Tier 1，无本地捕获）

> **定位**：Figure 的人形机器人 VLA，**显式双系统（S2+S1）**。系统级接口是**单个连续 latent 向量**——目前已知最极致压缩的高层→低层接口。两个系统**都跑在端侧 onboard**（不做云-端拆分）。S1 内部是 cross-attention encoder-decoder。

## Model Checklist

| # | 维度 | 信息 |
|---|------|------|
| 1 | 模型架构 | 双系统：**S2** = 7B 开源 VLM（互联网预训练）；**S1** = 80M cross-attention encoder-decoder transformer（视觉运动控制）|
| 2 | 模型规模 | S2 **7B**，S1 **80M** |
| 3 | 训练数据 | Figure 02 机器人队列遥操作数据（具体规模未在 blog 明确，二手称 ~500h，**未确认**）|
| 4 | 训练方法 | S1+S2 端到端联合训练；S2 输出 latent 向量监督 S1 |
| 5 | 推理性能 | S2 **7-9Hz**（异步后台），S1 **200Hz**（实时）；**各跑独立 GPU**，**全部端侧 embedded 低功耗 GPU** |
| 6 | 开源状态 | ❌ 闭源 |
| 7 | Benchmark | 抓取未见过物体、双机器人协作（定性展示，无标准 benchmark 数字）|
| 8 | 与已有工作关系 | 首个控制**全上身（35 DOF）**人形的 VLA；S1/S2 双系统是认知科学借喻 |
| 9 | 记忆机制 | 无 |

## 架构精度：单 Latent 向量接口（已核实 blog）

系统级接口（S2 → S1）是**单个连续 latent 向量**：

- 原文："S2 distills all semantic task-relevant information into a single continuous latent vector, passed to S1 to condition its low-level actions"
- 整合方式："The latent vector from S2 is projected into S1's token space and concatenated with visual features from S1's vision backbone"
- 两系统分离异步："S2 operates as an asynchronous background process ... S1 executes as a separate real-time process"，"each running on dedicated GPUs"
- 部署："runs entirely onboard embedded low-power-consumption GPUs"

**接口定位**：这是**最极致压缩的系统级接口**——单个向量，远轻于 GR00T 的 embedding 序列或 π 的逐层 KV。理论上云-端拆分极其便宜（传一个向量），但 Figure 选择**两系统都放端侧**。

**与范式 A/B 的关系**：S2→S1 接口（单 latent 向量）属于**系统级解耦**层次；S1 内部是 cross-attention encoder-decoder（范式 B 式）。详见 [[Embodied Brain Models]] 的两层耦合框架。

## Helix 02（2026）

全身自主控制；物流场景；8 小时连续自主作业。架构延续双系统。

## Why It Matters

- **系统级解耦的极致案例**：单 latent 向量接口证明高层→低层可以用极小带宽连接
- **端侧双系统**：S1+S2 都 onboard，说明"解耦"不等于"云-端拆分"——可以同址异步解耦
- **部署导向路线 2 的代表**：显式多系统 + 压缩接口（对比 GR00T 的单模型范式 B 路线）

## Related Concepts

- [[Embodied Brain Models]] — 系统级接口（单 latent 向量）+ 解耦程度光谱
- [[Physical Intelligence - pi0 a Vision-Language-Action Flow Model for General Robot Control]] — 范式 A 单模型对照
- [[NVIDIA - GR00T N1 An Open Foundation Model for Generalist Humanoid Robots]] — 范式 B 单模型对照

## Related Entities

- [[Figure AI]] — 出品方（待建实体页）

## tags

#vla #helix #figure #dual-system #latent-vector #embodied-ai #onboard #not-open-source
