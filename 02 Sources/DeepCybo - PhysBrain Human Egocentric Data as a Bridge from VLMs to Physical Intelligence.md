# DeepCybo - PhysBrain: Human Egocentric Data as a Bridge from Vision Language Models to Physical Intelligence

- **Type**: arXiv paper (cs.RO, cs.CV)
- **Authors**: Xiaopeng Lin, Shijie Lian, Bin Yu, Ruoqi Yang, Zhaolong Shen, Changti Wu, Yuzhuo Miao, Yurun Jin, Yukun Shi, Jiyan He, Cong Huang, Bojun Cheng, Kai Chen（13 人）
- **Organizations**: DeepCybo（深度机智 / 机智赛博）+ 中关村学院 / 中关村人工智能研究院；合作：港科大（广州）、哈工大、华中科大
- **arXiv**: [2512.16793](https://arxiv.org/abs/2512.16793)（v1 2025-12-18；v2 2026-02-04）
- **Project**: https://zgc-embodyai.github.io/PhysBrain/
- **Company**: https://deepcybo.site/
- **Launch**: 中关村论坛正式发布 2026-03-27
- **Open-source**: ❌ **无代码/权重**（详见下）
- **Accessed**: 2026-05-30
- **Raw**: URL-only（Tier 1，无本地 PDF 捕获）

> **定位**：PhysBrain 属于 **LLM/VLM-as-brain 流派**——它本身是一个 egocentric-aware 的 VLM "大脑"，下游接 action expert 得到 PhysVLA（范式 B：cross-attention）。最激进的差异化：**零真机轨迹预训练**，全靠人类第一视角视频。

## Model Paper Checklist

| # | 维度 | 信息 |
|---|------|------|
| 1 | 模型架构 | **PhysBrain** = 微调后的 Qwen3-VL（VLM 大脑）；**PhysVLA** = PhysBrain + Flow-Matching DiT action expert，**范式 B：cross-attention**（"VLM features are keys/values, action tokens are queries"，v2 核实） |
| 2 | 模型规模 | v2：**PhysBrain-4B / PhysBrain-8B**（Qwen3-VL 4B/8B，LoRA 微调）；⚠️ v1 用 **Qwen2.5-VL-7B**（版本差异） |
| 3 | 训练数据 | **E2E-3M**：约 300 万 VQA 实例，全部从**人类第一视角视频**（Ego4D 家庭 + EgoDex 实验室 + BuildAI 工业）经 **Egocentric2Embodiment Translation Pipeline** 生成；7 种标注模式（temporal / spatial / attribute / mechanics / reasoning / summary / trajectory）；与 FineVision 通用 VL 数据约半半混训 |
| 4 | 训练方法 | LoRA 微调 Qwen3-VL → PhysBrain（提供 egocentric-aware 初始化）→ 下游加 FM DiT action expert + 真机数据微调 → PhysVLA；**核心卖点：零真机轨迹预训练**；配套 **ICDC** wearable 数据采集系统 |
| 5 | 推理性能 | 未明确披露 |
| 6 | 开源状态 | ❌ **无代码/权重**：`ZGC-EmbodyAI/PhysBrain` GitHub 仓库仅含项目主页（index.html/styles.css/imgs/videos，language: HTML）；项目页 "Code" 按钮指向页面自身。论文 + 项目页公开 |
| 7 | Benchmark | EgoThink avg **64.3**（Planning 64.5，超 GPT-4 35.5）；SimplerEnv **53.9%**（v1，vs RoboBrain2.0-7B 37.8%）；项目页另称 PhysVLA-8B SimplerEnv **67.4%**、EgoPlan 47.4/46.9、RoboCasa Tabletop 55.25%。⚠️ 部分数字来自项目页/媒体，abstract 未含，v1/v2 有出入 |
| 8 | 与已有工作关系 | **VLM-as-brain 流派**；为 VLA 提供 egocentric-aware 初始化提升样本效率；范式 B；对标 BAAI RoboBrain 2.0/2.5 |
| 9 | 记忆机制 | 无 |

## Summary

PhysBrain 押注一个激进路线：**用海量免费的人类第一视角视频替代昂贵的真机轨迹数据**。通过 Egocentric2Embodiment pipeline 把第一人称视频转成 300 万条 schema 化、带证据 grounding 和时间一致性的 VQA（E2E-3M），微调 Qwen3-VL 得到 egocentric-aware 的 VLM 大脑 PhysBrain；再接 flow matching DiT action expert（GR00T 风格）得到 PhysVLA。核心论点：**人类视频是从 VLM 通向 physical intelligence 的桥梁**。

## 架构精度：范式 B（已核实 v2）

- VLM backbone = **Qwen3-VL（4B/8B，LoRA 微调）**
- action expert = Flow-Matching DiT
- 连接 = **cross-attention**：原文 v2 "cross-attending to Z_t (VLM features are keys/values, action tokens are queries)" → 范式 B（GR00T 同款 encoder-decoder）
- PhysBrain 可独立做 VLM 任务（egocentric 理解/规划），也可作为 PhysVLA 的感知/大脑组件
- 范式 A/B 对比见 [[Embodied Brain Models]]；范式 B 工业代表对照见 [[NVIDIA - GR00T N1 An Open Foundation Model for Generalist Humanoid Robots]]

## 数据稀缺路线定位

PhysBrain 是 VLA "数据稀缺四路线"里 **④ 人类视频路线**押得最重的一个：
- ① 真机遥操作堆量（AgiBot World 1M+）
- ② 大规模 sim（GraspVLA）
- ③ 世界模型生成合成（NVIDIA DreamGen/Cosmos）
- ④ **人类视频**（PhysBrain ← 这里）

不管成败，它都是这条路线最激进的实验——**完全不用真机轨迹做预训练**。

## 核实踩坑记录（避免二手资料误传）

- ⚠️ backbone 是 **Qwen3-VL**（v2），非二手资料常说的 Qwen2.5-VL（那是 v1 的 7B 版本）
- ⚠️ **"PhysGR00T / PhysPI / TwinBrainVLA / LangForce"** 等命名**不在论文中**——是产品页/媒体营销词。其中 TwinBrainVLA、LangForce 是 ZGC-EmbodyAI GitHub org 下的**独立 repo**（与 BayesianVLA、IntentVLA、FrameSkip 等并列），不是本论文内容
- ⚠️ 部分高 benchmark 数字（SimplerEnv 67.4% 等）来自项目页/产品发布，与 arXiv v1（53.9%）有出入；引用时以 arXiv 为基础事实，营销数字单独标注
- ⚠️ **无开源代码/权重**——符合中国具身公司"PR 充分但难复现"的常见模式（类比 Figure Helix、BAAI RoboBrain）

## Why It Matters

- **VLM-as-brain 流派的具体实践**：把"大脑"做成可独立训练、可迁移的 VLM，下游再接 action expert——和我们"云脑/端脑分工"的框架高度一致
- **数据成本的潜在颠覆**：若人类视频路线兑现，VLA 预训练可绕开真机数据瓶颈
- **新玩家信号**：DeepCybo 是 2025-2026 涌现的中国具身新公司，短期内多轮融资

## Related Concepts

- [[Embodied Brain Models]] — VLM-as-brain 流派；范式 B；数据稀缺四路线
- [[NVIDIA - GR00T N1 An Open Foundation Model for Generalist Humanoid Robots]] — 范式 B 工业对照（PhysVLA 自称 GR00T 风格）
- [[Physical Intelligence - pi0 a Vision-Language-Action Flow Model for General Robot Control]] — 范式 A 对照
- [[World-Action Models]] — 数据合成路线对比

## Related Entities

- [[DeepCybo]] — 出品方（待建实体页）

## tags

#vla #physbrain #deepcybo #vlm-as-brain #paradigm-b #egocentric-video #embodied-ai #china #not-open-source
