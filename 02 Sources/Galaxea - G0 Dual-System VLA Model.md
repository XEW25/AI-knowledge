# Galaxea - G0: Dual-System VLA Model (Galaxea Open-World Dataset)

- **Type**: arXiv paper (cs.RO)
- **Authors**: Galaxea Team（**星海图** / Galaxea AI / Xinghaitu；⚠️ 非"跨维智能"，那是另一家公司 Dexmal）
- **arXiv**: [2509.00576](https://arxiv.org/abs/2509.00576)
- **Project**: https://opengalaxea.github.io/G0/ · GitHub: https://github.com/OpenGalaxea/G0
- **Year**: 2025-09（G0）；G0Plus 2026-01
- **Open-source**: ✅ GitHub（OpenGalaxea/G0）
- **Accessed**: 2026-05-30
- **Raw**: URL-only（Tier 1，无本地捕获）

> **定位**：Galaxea 的双系统 VLA。系统级接口是**自然语言子任务指令**（类 ChemBot）；G0-VLA 执行器内部是**范式 A（PaliGemma + flow matching，joint attention）**。两系统异步运行。

## Model Paper Checklist

| # | 维度 | 信息 |
|---|------|------|
| 1 | 模型架构 | 双系统：**G0-VLM**（Qwen2.5-VL 规划器）+ **G0-VLA**（PaliGemma 执行器，范式 A + flow matching）|
| 2 | 模型规模 | G0-VLM 测试 Qwen2.5-VL **7B/32B/72B**；G0-VLA 基于 PaliGemma（~3B，未明确）|
| 3 | 训练数据 | **Galaxea Open-World Dataset**：500+ 小时移动操作数据 |
| 4 | 训练方法 | 三阶段课程：① 跨 embodiment 预训练 ② 单 embodiment 预训练 ③ 任务特定后训练 |
| 5 | 推理性能 | 两系统**异步、不同频率**运行；具体数字未明确 |
| 6 | 开源状态 | ✅ GitHub 开源 |
| 7 | Benchmark | LIBERO 等；具体见论文 |
| 8 | 与已有工作关系 | 双系统 VLA；G0Plus（2026-01）后续；与 ChemBot 同属"语言子任务接口"族 |
| 9 | 记忆机制 | 无 |

## 架构精度：语言子任务接口 + 内部范式 A（已核实论文）

### 系统级接口（G0-VLM → G0-VLA）= 自然语言子任务
- 原文："the System 2 planner ... decomposes it into a sequence of simpler sub-tasks, which are then passed to the System 1 executor"
- G0-VLM 是"deliberative brain"，理解开放指令并分解成子任务
- 两系统异步、不同频率运行
- **与 ChemBot 同族**：语言级接口、完全分离的两个模型

### G0-VLA 内部耦合 = 范式 A（已核实）
- VLM backbone = **PaliGemma**（与 π 系列同源！）
- 原文："vision encoder and projector ... transform the three input images into a one-dimensional sequence of embeddings, which then attend to the tokenized language instruction, proprioceptive state, and previously predicted action tokens via attention within the Transformer"
- → **单一 stack 内 joint attention**（范式 A，π 式）
- action expert：flow matching loss 生成连续动作

**两层耦合定位**：
- **系统级接口** = 自然语言子任务（最松解耦，类 ChemBot/SayCan）
- **G0-VLA 内部耦合** = 范式 A（PaliGemma joint attention + flow matching）

详见 [[Embodied Brain Models]] 两层耦合框架。

## Why It Matters

- **"语言子任务"系统接口的 VLA 代表**：高层用大 VLM 规划、低层用 π 式 VLA 执行，接口是人可读的子任务
- **解耦程度光谱最松的一端**：两个完全独立的模型，对比 Helix（单 latent 向量）和 π（单模型紧耦合）
- **G0-VLA 内部仍是范式 A**：佐证"系统级解耦"与"VLA 内部耦合"两层正交——部署导向不必然选范式 B

## Related Concepts

- [[Embodied Brain Models]] — 语言子任务接口；解耦程度光谱
- [[Huang et al. - ChemBot Long-Term Memory for VLA-based Agents]] — 同属语言子任务接口族（完全分离）
- [[Physical Intelligence - pi0 a Vision-Language-Action Flow Model for General Robot Control]] — G0-VLA 内部同为范式 A（均 PaliGemma）
- [[Task decomposition]] — G0-VLM 作为任务分解器

## Related Entities

- [[Galaxea 星海图]] — 出品方

## tags

#vla #galaxea #dual-system #language-subtask #paradigm-a #embodied-ai #china #open-source
