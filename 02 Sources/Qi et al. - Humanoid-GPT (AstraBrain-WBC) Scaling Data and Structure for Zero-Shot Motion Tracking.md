# Qi et al. - Humanoid-GPT (AstraBrain-WBC) Scaling Data and Structure for Zero-Shot Motion Tracking

- **Type**: Source note (paper + open-source code, **PDF + code-verified**)
- **Date ingested**: 2026-06-25
- **Paper**: *Humanoid-GPT: Scaling Data and Structure for Zero-Shot Motion Tracking* — [arXiv:2606.03985](https://arxiv.org/abs/2606.03985)(submitted 2026-06-02;**Accepted at CVPR 2026**)
- **Product name**: 银河通用(Galbot)对外发布的 **AstraBrain-WBC 0.5**(2026-06-19)
- **Code**: [github.com/GalaxyGeneralRobotics/Humanoid-GPT](https://github.com/GalaxyGeneralRobotics/Humanoid-GPT)(Apache-2.0)· [项目页](https://qizekun.github.io/Humanoid-GPT/) · [HF](https://huggingface.co/papers/2606.03985) · [CVPR poster](https://cvpr.thecvf.com/virtual/2026/poster/39399)
- **Raw**: [[2026-06-02 - Qi et al. - Humanoid-GPT Scaling Data and Structure for Zero-Shot Motion Tracking.pdf]](本地 PDF,8.84 MB,arXiv v1)
- **Authors**: Zekun Qi¹², Xuchuan Chen, Dairu Liu, Chenghuai Lin, Yunrui Lian, Sikai Liang, Zhikai Zhang, Yu Guan, Jilong Wang, Wenyao Zhang²³, Xinqiang Yu, **He Wang²⁴(王鹤,通讯,Galbot 创始人)**, **Li Yi¹⁵(易力,通讯)** — ¹Tsinghua ²**Galbot Inc.** ³SJTU ⁴PKU ⁵Shanghai Qi Zhi

---

## TL;DR

人形机器人**全身实时运控(WBC)小脑基座模型**:把全身动作当成"动作语言",用 **GPT-style 因果 Transformer** 自回归预测**逐关节 PD 目标**;靠 **2B 帧动捕 + 蒸馏数百个 RL 运控专家**,首次在运控上验证了"数据/结构 scaling → 零样本泛化到没见过的动作"。**纯小脑/追踪器**——吃上游给的参考动作,负责把它在真机上**追踪执行**;不含视觉语言、非 VLA、非世界模型。

## 命名与归属核实(应 Ethan 之问:这篇是不是就是 AstraBrain-WBC?)

**结论:极高确信为同一工作**,但需注意命名分裂。

| | 论文/代码名 | 产品/对外名 |
|---|---|---|
| 名称 | **Humanoid-GPT** | **AstraBrain-WBC 0.5** |
| 出处 | arXiv:2606.03985 / GitHub / CVPR 2026 | 银河通用 2026-06-19 发布会、各媒体报道 |

**判为同一工作的依据**:
1. **同一公司**:论文作者单位 #2 = **Galbot Inc.**(= 银河通用);GitHub org = **`GalaxyGeneralRobotics`**(银河通用官方英文名)。即银河通用**亲自**发布了 Humanoid-GPT 的论文与代码。
2. **王鹤(He Wang)是论文通讯作者** = 银河通用创始人。
3. **规格逐项吻合**:GPT-style 因果 Transformer、2B 帧、80.4M 参数、零样本追踪 92.58%、延迟 0.39ms、超 SONIC / ~5× 快于 TWIST、目标 Unitree G1 —— 与发布会 PR 完全一致。
4. **时间线吻合**:论文 06-02 提交,产品 06-19 发布。

**诚实标注**:**论文全文(我已 pdftotext 通读)不出现 "AstraBrain" 字样**;也没有任何**单一文档**把 "AstraBrain-WBC 0.5" 与 "Humanoid-GPT / arXiv:2606.03985" 并列互引。故"二者等同"是**基于上述证据的强推断**(置信度≈实锤),而非字面互证。媒体摘要曾直接断言二者相等,但那是二手概括,不作首要依据。

## 它是什么(以及不是什么)

- **是**:一个**全身运控小脑(cerebellum / WBC controller)**——输入"参考动作 + 机器人本体感知",输出**逐关节 PD 目标**,真机上以高频追踪该参考动作;对**训练中没见过的参考动作**零样本泛化(motion tracking 的 zero-shot)。
- **不是**:不是大脑(无规划/语言/感知输入)、不是 VLA(无视觉-语言)、不是世界模型(不预测未来帧)。参考动作由**上游**(动作生成器 / 大脑 / 遥操)给;它只负责"忠实地把动作做出来"。
- **在分层体系里**:典型的**执行端小脑**——正是本库"大脑出意图、小脑出连续控制"里小脑那一侧。

## 架构与方法(PDF 核实)

- **Backbone**:可缩放的 **causal Transformer + GPT-style 自回归**(+ RoPE,代码核实)。论文论点:控制本质**因果**(测试时拿不到未来),所以因果 Transformer 比 MLP / 非因果变体更契合、且**随数据与模型同步缩放**而不早早饱和。
- **输入表征**:**Harmonic Motion Embedding**(§3.2)——把参考动作与状态编码进 Transformer 的时间因果序列。
- **训练范式(关键)**:**"蒸馏数百个 RL 专家 → 一个 GPT"**。先用 RL 训大量单技能/单簇运控**专家**,再用 **DAgger 行为克隆**把它们的能力**蒸馏**进单一 Humanoid-GPT(通才)。配 **diversity-aware、分布均衡采样**处理大规模噪声动捕。
- **输出**:**per-joint PD targets**(逐关节 PD 设定点)→ 下游 PD 环执行。契合本库"小脑出 target、kHz PD/FOC 经典环兜底"的频率阶梯。
- **GPT 三要素迁移**(论文自述):海量且均衡的数据 + 因果 Transformer 自回归 + 从众多"专家"蒸馏出的通用表征。

## 结果(均 **论文实证**,非仅 PR)

**缩放表(Table 2,SR=tracking success rate ↑,误差 ↓)**:

| Backbone | #Train tok | #Params | SR | MPJPE |
|---|---|---|---|---|
| MLP (3-layer) | 2M | 0.25M | 76.89% | 0.1191 |
| Humanoid-GPT-S | 2M | 5.7M | 83.26% | 0.0853 |
| **Humanoid-GPT-L** | **2B** | **80.4M** | **92.58%** | **0.0735** |

→ 数据 2M→2B、参数 0.25M→80.4M,SR 单调爬升(scaling 成立);MLP/TCN 早饱和(甚至 TCN-L 79.85% < TCN-S 81.48%,大模型反而更差),凸显**结构(因果 Transformer)是 scaling 的前提**。

**延迟(Fig.5)**:逐级优化 CPU 7.48ms → GPU 5.29ms → TensorRT 0.92ms → +Cache 0.58ms → **C++/COMM 均值 0.39ms**;在线遥操在**单张 RTX 4090 上 <1.5ms**,**约 5× 快于 TWIST(3.32ms)**。

**基线**:GMT(MoE tracker)、**TWIST**(遥操全身模仿蒸馏)、**SONIC**(NVIDIA,MLP,缩到 100M 帧/100M 参数)、BeyondMimic、ASAP、UniTracker 等。论文报告在近乎所有指标上领先。

> ⚠️ **"全球首个 / GPT-1 时刻 / 超越 SONIC"** 属公司框架与论文自报结果(SONIC 对比是其自测),陈述时归为"论文/厂商主张",不背书"全球首个"。

## 开源状态(code-verified,2026-06-25)

| 项 | 状态 |
|---|---|
| 许可证 | **Apache-2.0** |
| 推理 + 部署代码 | ✅ 已开(`tracking/ deploy/ scripts/ projects/ utils/`)|
| 预训练权重 | ✅ 已开(`storage/ckpts/pns_wo_priv216.onnx`,ONNX)+ 示例轨迹 |
| 目标硬件 | Unitree G1(29 DoF 全身)|
| **训练代码** | ❌ **README 标 TODO,未发** |
| **训练数据(2B 帧语料)** | ❌ **未发** |

> 媒体"论文、代码已**全面开源**"**不准确**:目前是**推理+权重**已开、**训练侧待发**。但**比 Kairos 强**——放出的就是能在 G1 上跑的真 WBC 控制器(有权重、有部署码),不是空壳。

## 在本库的定位

- **两轴演进图 L2(小脑=通用运控基座)的硬实例**:见 [[Embodied Brain Models#功能演进趋势:统一模型轴 vs 大小脑分层轴(跨公司)]]。与 智元 BFM-2(厂商自报)、[[Guo et al. - NeuroVLA Brain-inspired Neuromorphic Cortex-Cerebellum-Spinal VLA|NeuroVLA]] 并列,但**可靠性更高**(arXiv + CVPR + 可跑权重)。
- **是 [[Embodied Cerebellum Models]] "前瞻预判·5 年外"那条的提前兑现**:"小脑核心从'蒸馏的 action expert'演化为**独立设计的端侧运控架构**"——Humanoid-GPT 正是这种**不从 VLA 裂解、而是蒸馏 RL 专家自成一体**的通用运控基座。
- **公司归属**:见 [[Galbot 银河通用]](注意 **≠ [[Galaxea 星海图]]**,两家不同公司)。

`★ Insight ─────────────────────────────────────`
- **"运控也有 scaling law"是这篇的真贡献**,而非那些 PR 数字。此前小脑/WBC 普遍是 MLP,加数据/加参数很快饱和;这篇证明**只有换成因果 Transformer,数据 2M→2B 才换得来 SR 76.89%→92.58%**。这恰好补上了我们之前"scaling 对低层控制收益递减"判断的**边界条件**:对**单技能 MLP** 递减,但对**结构对路(因果 Transformer)+ 海量动捕**的**运控通才**,scaling 仍有效——递减的是"堆 LLM 参数",不是"堆运控数据+对的结构"。
- **它是"蒸馏众专家成一个通才"的小脑版**,方向与你们框架的 L3(多专家库)**相反**:L3 保留专家库 + 大脑编排;Humanoid-GPT 把专家**压成一个统一 GPT**。两者是 L2(统一运控基座)与 L3(专家库+编排)的**真实对照**,正好印证两轴图里"小脑独立 → 多专家"那条演进线上的张力。
`─────────────────────────────────────────────────`

## Related

- [[Embodied Cerebellum Models]] — 小脑模型对位页(本工作=通用运控基座形态)
- [[Embodied Brain Models]] — 两轴演进图 L2 实例
- [[Galbot 银河通用]] — 公司实体(≠ [[Galaxea 星海图]])
- [[Guo et al. - NeuroVLA Brain-inspired Neuromorphic Cortex-Cerebellum-Spinal VLA]] — 另一小脑路线(神经形态),对照
- [[Figure AI - Helix a VLA for Generalist Humanoid Control]] — 双系统快头 S1,另一种小脑来源
- [[Home robot architecture - a hierarchical embodied agent]] — capability-vs-dependability;小脑执行层定位

## tags

#source #embodied-ai #cerebellum-model #whole-body-control #humanoid #scaling-laws #galbot #cvpr2026 #code-verified
