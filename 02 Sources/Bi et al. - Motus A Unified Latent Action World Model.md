# Bi et al. - Motus: A Unified Latent Action World Model

- **Type**: arXiv paper (cs.RO, cs.CV / cs.LG)
- **Authors**: Hongzhe Bi, Hengkai Tan, Shenghao Xie, Zeyuan Wang, Shuhe Huang, Haitian Liu, Ruowen Zhao, Yao Feng, Chendong Xiang, Yinze Rong, Hongyan Zhao, Hanyu Liu, Zhizhong Su, **Lei Ma, Hang Su, Jun Zhu**（16 人）
- **Organizations**: 清华大学（**TSAIL / 朱军、苏航组**；Dept. of CS、Institute for AI、BNRist、THBI Lab、Tsinghua-Bosch Joint ML Center）+ 北京大学 + **地平线 Horizon Robotics**（Zhizhong Su）
- **arXiv**: [2512.13030](https://arxiv.org/abs/2512.13030)（v1 2025-12-15；v2 2025-12-25）
- **Project**: https://motus-robotics.github.io/motus
- **Open-source**: ❓ **仅项目页，未见公开代码/权重**（截至 2026-06；符合"GitHub 项目页≠代码"的常见模式，引用时按未开源对待）
- **Accessed**: 2026-06-13
- **Raw**: URL-only（Tier 1，无本地 PDF 捕获）

> **定位**：Motus 是一个 **统一的"潜动作世界模型"**——把**理解、视频生成、动作**三个专家用 **Mixture-of-Transformer（范式 A 联合注意力家族）** 装进一套权重，再用 **UniDiffuser 式的逐模态时间步调度**，让同一个模型在推理时**切换成 5 种角色**（VLA / 世界模型 / IDM / 纯视频生成 / 视频-动作联合预测）。它最重要的概念贡献不是"用不用世界模型"，而是把"用到什么程度"变成了**推理时的运行旋钮**。

## Model Paper Checklist

| # | 维度 | 信息 |
|---|------|------|
| 1 | 模型架构 | **三专家 MoT**：理解专家 = **Qwen3-VL-2B**；视频生成专家 = **Wan 2.2 5B**（视频扩散 backbone）；动作专家 = Transformer + **AdaLN** 时间步注入（flow-matching）。三者经 **"Tri-model Joint Attention"**（共享多头自注意力）做跨模态融合 → **范式 A（joint attention / MoE-style）家族** |
| 2 | 模型规模 | 视频专家 5B（Wan 2.2）+ 理解专家 2B（Qwen3-VL）+ 动作专家（小，未单列）；总量级 ~7B+ |
| 3 | 训练数据 | **六层数据金字塔**（自底向上 量↓质↑）：L1 Web 数据 → L2 人类第一视角视频 → L3 合成数据 → L4 task-agnostic → L5 多机器人轨迹 → L6 目标机器人轨迹 |
| 4 | 训练方法 | **三阶段**：① 仅训视频专家 VGM（L1-3,5）；② 统一训练 + **潜动作**（全三专家，L2-5）；③ SFT 特化（全三专家 + 真动作，L6 目标机器人）。潜动作来自**光流**，提取 pixel-level **"delta action"** 做大规模动作预训练 |
| 5 | 推理性能 | flow-matching **10 步**；⚠️ **无 wall-clock / 延迟 / 吞吐数字**（部署成本未披露——见下"核实踩坑"） |
| 6 | 开源状态 | ❓ 仅 project page（motus-robotics.github.io/motus）；未见 code/weights |
| 7 | Benchmark | **RoboTwin 2.0（sim）88.66%**（vs π₀.₅ ~42.98%，**+45%**；vs X-VLA 72.80%，**+15%**）；**LIBERO-Long 97.6**（= X-VLA SOTA）；VLABench 0.48 ID / 0.25 跨类；**真机**：AC-One 均 **63.22%**（vs π₀.₅ 14.79%）、Agilex-Aloha-2 均 **59.30%**（vs π₀.₅ 48.60%），跨任务 **+11~48%** |
| 8 | 与已有工作关系 | **WAM 谱系**（视频生成 backbone + 动作）；**latent-action 谱系**（光流 delta action，承 GO-1/LAPA/Genie）；MoT 联合注意力承 π 系列 / [[DeepCybo - TwinBrainVLA Asymmetric Mixture-of-Transformers for Anti-Forgetting VLA\|TwinBrainVLA]]；UniDiffuser 调度承朱军组同门 |
| 9 | 记忆机制 | 无显式长期记忆；世界模型模式可视为"预测未来"的隐式 rollout |

## Summary

Motus 想消除具身领域的"模型碎片化"——VLA、世界模型、逆动力学模型（IDM）、视频生成模型（VGM）各做各的。它的办法是把三个专家（理解 / 视频生成 / 动作）用 MoT 联合注意力装进一套权重，再借 **UniDiffuser 式的时间步调度**：给不同模态分配不同的扩散/流时间步，就能在推理时把**同一套权重**当成不同的"基础模型"用。配套一条"光流→潜动作（delta action）"的预训练通道和六层数据金字塔，让动作预训练能吃到 web/人类视频这些无真机标注的数据。

## 五种推理模式（核心贡献：把"档位"做成运行旋钮）

时间步分配决定哪个模态被去噪、哪个保持 clean/noisy：

| 模式 | 时间步配置 | 行为 | 部署节拍归属 |
|------|-----------|------|------------|
| **VLA** | 观测/视频 token 保持 noisy，仅去噪 action | 当前图+语言 → 动作，**推理时不生成视频** | 端侧快环路（**唯一可部署模式**）|
| **World Model** | action 保持 clean，去噪观测 | 给定动作预测未来观测 | 慢环路 / 想象 |
| **IDM** | 输入完整观测序列 t:t+k | 从前后帧反解动作 | 离线 / 标注 |
| **VGM** | 纯视频去噪 | 文本/图 → 未来视频 | 慢环路 / 数据引擎 |
| **Joint Prediction** | 视频与动作同步从噪声去噪 | 双向联合生成（互为条件）| 慢环路 |

## 架构精度：范式 A 的 MoT 扩展（已核实 v2）

- **联合注意力**：三专家各有权重，经共享 MHSA 联合 attend → 与 π 系列同属**范式 A**（非范式 B 的 encoder-decoder cross-attention）。⚠️ 与 GigaWorld 的"因果掩码隔离"不同——Motus 是**双向联合注意力 + 时间步切档**，GigaWorld 是 **causal mask 硬隔离 + 推理丢分支**（见对比）。
- **动作专家** = AdaLN flow-matching（10 步），不是自回归——所以 Motus 是 **VLM-as-encoder 取向**（理解专家编码，动作专家产动作），不是 G0.5 那种 VLM-as-actor。
- 范式 A/B、actor/encoder 轴定义见 [[Embodied Brain Models]]。

## 定位：在库里的多条线上落子

**① 「推理时世界模型」四档框架 → Motus 把档位变成旋钮。**
我们此前把"推理时世界模型产出什么"分四档（整段视频 / 子目标帧 / 潜空间特征 / 训繁推简）。Motus 不固定在任何一档：**Joint 模式 ≈ 第二档（联合生成）**，**VLA 模式 ≈ 第四档行为（推理跳过视频）**。它是"训练期资产（DreamGen/FLARE）"和"潜空间压缩（VPP/DreamVLA）"之外的**第三条路：运行时模式切换**。映射到云-端框架——慢环路切 World Model/Joint 规划，快环路切 VLA 执行，**同权重换档**。

**② 与 [[GigaWorld Team - GigaWorld-Policy An Efficient Action-Centered World-Action Model\|GigaWorld-Policy]]：同样"推理丢视频"，机制相反。**
两者都想"训练用视频、推理求快"。GigaWorld 用 **causal mask 把视频/动作 token 硬隔离**，推理时**永久丢弃**视频分支（训繁推简，固定）；Motus 用**时间步分配**把不生成视频做成**可切换的一个模式**（结构上视频专家仍在）。代价是：Motus 的 VLA 模式是否真省算力存疑（见下）。

**③ 与 [[DeepCybo - TwinBrainVLA Asymmetric Mixture-of-Transformers for Anti-Forgetting VLA\|TwinBrainVLA]]：结构押韵。**
两者都是"三 transformer 的 MoT 联合注意力"，区别只在第三个槽装什么——**TwinBrain 装第二个 VLM（抗遗忘），Motus 装视频生成器（世界模型）**。范式 A 的 MoE 槽位正在变成一个**可插拔扩展位**——这是概念页范式 A/B 对比时没预料到的演化方向。

**④ 与 [[Galaxea - G0.5 Autoregressive VLM-as-Actor VLA\|G0.5]]：世界模型轴上的正反样本。**
G0.5 **明确反世界模型**（刻意不堆模块）；Motus **把世界模型做成内生模式**。但二者**都用 latent/VQ 式动作 token**（Motus 光流 delta action；G0.5 VQ ActionCodec）、**都用 Qwen3-VL-2B 级理解 backbone**——分歧只在"要不要预测未来"。G0.5 笔记正是把 Motus 当"world action model 基线家族"引用的。

**⑤ latent-action 谱系再添一员。**
光流 delta action 与 GO-1（VQ 逆动力学）、LAPA、Genie 同属"从无标注视频学动作"——这正好喂给 [[Embodied Brain Models]] 待补充的 latent-action synthesis 候选。

## 核实踩坑记录

- ⚠️ **WAM 概念页旧记录需纠正**：[[World-Action Models]] 曾把 Motus 列为"第一代 Bidirectional Attention（推理必先生成视频→高延迟）"。这是**未核实的 name-drop**——实际 Motus 的 VLA 模式推理时不去噪视频，是**模式可切换**的，不能简单归入第一代。本次 ingest 已据实修正该页。
- ❗ **部署开放问题（决定能否下端）**：VLA 模式只是"不去噪"视频 token，但这些 token 是否仍参与每一步联合注意力的前向？若 5B 视频专家在 VLA 模式下仍跑前向，省的只是去噪步数而非单步算力——这与端侧实用性直接相关。**论文无延迟数据、无开源代码，暂无法证实**。
- ⚠️ 多数对比数字（RoboTwin +45%、真机 AC-One 63% vs π₀.₅ 14.79%）来自论文自报；π₀.₅ 在 AC-One 上 14.79% 偏低，可能与复现/适配设置有关，引用时标注为"论文自报"。
- ℹ️ **命名**：本 Motus（2512.13030，清华 TSAIL × 地平线）是 latent-action world model；勿与其它同名项目混淆。

## Why It Matters

- **"统一模型 + 模式切换"是世界模型进入部署的第三条路**：不退成训练资产、不压成潜特征，而是把档位留给推理时选——若 VLA 模式确实轻量，这正契合"同一模型在云脑/端小脑之间换挡"的设想。
- **范式 A 的 MoT 正在变成可插拔扩展位**：π（小 action expert）→ TwinBrain（第二 VLM）→ Motus（视频生成器），同一注意力骨架插不同专家解决不同问题。
- **学界×工业信号**：清华 TSAIL（UniDiffuser/扩散基础）+ 地平线（车规芯片→机器人）的组合，是"扩散统一框架"思路向具身迁移的代表。

## Related Concepts

- [[World-Action Models]] — WAM 谱系主页（本次已据实修正 Motus 的代次归类）
- [[Embodied Brain Models]] — 范式 A / actor-vs-encoder / 推理时世界模型 / latent-action 谱系
- [[Galaxea - G0.5 Autoregressive VLM-as-Actor VLA]] — 世界模型轴上的反样本（明确不用）
- [[DeepCybo - TwinBrainVLA Asymmetric Mixture-of-Transformers for Anti-Forgetting VLA]] — MoT 结构押韵（第三槽装第二 VLM）
- [[GigaWorld Team - GigaWorld-Policy An Efficient Action-Centered World-Action Model]] — "推理丢视频"的相反机制（causal mask vs 时间步切档）
- [[AgiBot - GO-1 ViLLA Generalist Embodied Foundation Model]] — latent-action 谱系对照（VQ 逆动力学）
- [[Physical Intelligence - pi0 a Vision-Language-Action Flow Model for General Robot Control]] — 范式 A 源头

## Related Entities

- [[Physical Intelligence (π)]] — 范式 A / flow-matching 对照源头
- Horizon Robotics 地平线 — 工业合作方（待建实体页：车规芯片 + 具身）
- 清华 TSAIL（朱军 / 苏航）— UniDiffuser 等扩散统一框架的来源（待建）

## tags

#vla #motus #world-action-models #latent-action #paradigm-a #mixture-of-transformer #world-model #unified-model #tsinghua #horizon-robotics #embodied-ai #china #not-open-source
