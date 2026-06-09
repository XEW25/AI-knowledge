# DeepCybo - TwinBrainVLA: Asymmetric Mixture-of-Transformers for Anti-Forgetting VLA

- **Type**: arXiv paper (cs.RO)
- **Full title**: TwinBrainVLA: Unleashing the Potential of Generalist VLMs for Embodied Tasks via Asymmetric Mixture-of-Transformers
- **Authors**: Bin Yu, Shijie Lian, Xiaopeng Lin, Yuliang Wei, Zhaolong Shen, Changti Wu, Yuzhuo Miao, Xinming Wang, Bailing Wang, Cong Huang, Kai Chen（与 PhysBrain 大量重叠）
- **Org**: [[DeepCybo]] / ZGC-EmbodyAI（Zhongguancun Academy）；合作 HIT、HUST、HKUST(GZ)、BUAA、ECNU、CASIA
- **arXiv**: [2601.14133](https://arxiv.org/abs/2601.14133)（v2 2026-01-30，work in progress）
- **GitHub**: https://github.com/ZGC-EmbodyAI/TwinBrainVLA
- **Open-source**: ⚠️ repo 仅 README + assets（无代码）→ URL-only；权重/代码未释出
- **Accessed**: 2026-06-09
- **Raw**: URL-only（Tier 1，PDF ~6.8MB，按 raw-tier 规则未入库）

> **定位**：DeepCybo 的工作（PhysBrain 同团队）。针对 **VLA 微调的灾难性遗忘**——提出**非对称双 VLM**：冻结"左脑"（通才，保住预训练知识）+ 可训"右脑"（专才，做控制），右脑用 **AsyMoT** 查询左脑的冻结 KV，再接 flow-matching action expert。是"灾难性遗忘"的**第三种结构性解法**。

## Model Paper Checklist

| # | 维度 | 信息 |
|---|------|------|
| 1 | 模型架构 | **非对称双 VLM**：冻结 Left Brain（通才）+ 可训 Right Brain（专才），均 Qwen3-VL-4B/Qwen2.5-VL-3B 初始化；**AsyMoT** 逐层 joint attention（右脑查左脑冻结 KV）；+ flow-matching action expert。**VLM-as-encoder，范式 A（joint MoT）** |
| 2 | 模型规模 | 两条 VLM 通路（Qwen3-VL-4B 或 Qwen2.5-VL-3B 各一份，左脑冻结）+ State Encoder + FM action expert——backbone 参数约 2× |
| 3 | 训练数据 | SimplerEnv / RoboCasa（GR00T-X-Embodiment-Sim 子集）；**强调无大规模机器人动作预训练**；real-robot 300 条 Franka 遥操作演示 |
| 4 | 训练方法 | 非对称双流联合训练：左脑全程冻结、右脑可训；AsyMoT 中对左脑 K/V 做 **stop-gradient**；动作用 flow matching |
| 5 | 推理性能 | FM action expert 去噪生成连续动作；具体延迟未强调 |
| 6 | 开源状态 | ⚠️ GitHub repo 仅项目页（README+assets，无代码）；未释出权重/代码 |
| 7 | Benchmark | SimplerEnv（WidowX, OOD, 480 trials）**64.5%**（Qwen3-VL-4B）/ 58.4%（2.5-3B），超 GR00T-N1.6 57.1% **+7.4%**；RoboCasa GR1（24 任务）**54.6%**，超 GR00T-N1.6 47.6% +7.0%；LIBERO **97.6%**（单模型跨 4 suite，无大预训练）；real-robot ≈ π0.5（更少预训练）；ablation：左脑改可训 **-7%** |
| 8 | 与已有工作关系 | DeepCybo（PhysBrain 同团队）；**灾难性遗忘第三解法**（vs KI/π0.5、unified-AR/G0.5）；VLM-as-encoder 范式 A；显式区分 AsyMoT vs cross-attention |
| 9 | 记忆机制 | 无（聚焦遗忘，非情景记忆）|

## 核心问题：VLA 微调的灾难性遗忘（且量化了）

标准 VLA 在机器人数据上微调 VLM backbone，会**破坏预训练特征空间**，毁掉 VLA 范式本想利用的通用能力——"把通才大脑献祭成了专用控制器"。

**量化证据**（preliminary study）：在机器人轨迹上做标准 VLA 训练后，**Qwen3-VL 的 POPE 从 88.87% 崩到 0.04%**（通用视觉理解几乎完全丧失）；**1:1 混 QA 的 co-training 也救不回来**。

## 解法：非对称双 VLM + AsyMoT

灵感来自**大脑半球分工**（"think with generalist brain, act with specialist body"）：

- **Left Brain（ML，冻结通才）**：与右脑同样的预训练权重（Qwen3-VL 系），**全程冻结**——作为"语义锚 / 通用知识储备"，免疫遗忘。只处理图像+指令，自注意力独立。
- **Right Brain（MR，可训专才）**：处理 proprioceptive state（经 State Encoder 投影进 VLM 嵌入空间）+ 生成动作。**主动 query 左脑的能力**来辅助决策。
- **AsyMoT（Asymmetric Mixture-of-Transformers）**：基于 MoT（Liang et al. 2025，两个独立 Transformer 逐层 joint attention 连接）。**非对称**在于：
  - 右脑：`Q_R` attend 到 `K_joint=[sg(K_L); K_R]`、`V_joint=[sg(V_L); V_R]`（左脑 KV 做 stop-gradient，与右脑 KV 拼接）→ **右脑同时 attend 左脑+自身**
  - 左脑：只 attend 自身（冻结，独立自注意力）
  - → **单向信息桥**：控制策略查询冻结的通用知识，但不污染它
- 右脑的融合表示 **condition 一个 flow-matching action expert** 去噪出连续动作。

**AsyMoT vs Cross-Attention（论文显式区分）**：AsyMoT = 右脑 attend 左脑**和自身**（拼接 KV 的 joint self-attention）；cross-attention = 一个模态的 Q attend 另一模态 KV、但**不 attend 自身**。所以 **AsyMoT 属 joint attention（范式 A 家族），不是范式 B 的 cross-attention**。

## 在知识库框架中的定位

### 灾难性遗忘的三种解法（mini-taxonomy）

| 解法 | 代表 | 怎么做 |
|------|------|--------|
| Knowledge Insulation | [[Physical Intelligence - pi0.5 a VLA with Open-World Generalization\|π0.5]] | 停 action expert 梯度回流 + AR 动作预测作辅助目标，单 VLM |
| 统一自回归（VLM-as-actor） | [[Galaxea - G0.5 Autoregressive VLM-as-Actor VLA\|G0.5]] | 不要独立专家，VLM 自己 AR 产动作 |
| **双 VLM（AsyMoT）** | **TwinBrainVLA** | 冻结通才 + 可训专才，右脑查左脑冻结 KV |

### 耦合定位
- **VLM-as-encoder**：动作由独立的 flow-matching action expert 产出
- **范式 A（joint attention）**：AsyMoT 是逐层 joint attention（区别于 GR00T 的 cross-attention 范式 B）
- 独特点：把范式 A 的"双专家"从"VLM + 小 action expert"扩成"**两个完整 VLM（冻结通才 + 可训专才）**"，再外接 action expert

### ⚠️ 命名陷阱
TwinBrainVLA 的"左脑/右脑" = **冻结通才 vs 可训专才（两者都是语义 VLM）**，**不是**：
- 我们的"云大脑 / 端小脑"（部署轴）
- "规划脑 / 控制脑"（功能轴）

真正的"控制器/身体"是另挂的 flow-matching action expert。所以 TwinBrain 的"双脑"是**语义层内部的通才-专才分工**，与 [[Embodied Brain Models]] 的大脑/小脑是不同的轴。

### 与 PhysBrain 的互补（同为 DeepCybo）
- [[DeepCybo - PhysBrain Human Egocentric Data as a Bridge from VLMs to Physical Intelligence|PhysBrain]]：用**数据**（egocentric 视频预训练）保住/增强 VLM 的具身理解
- TwinBrainVLA：用**架构**（冻结通才 + 可训专才）保住 VLM 的通用能力
- 同一目标（让 VLA 真正用上 VLM 的通用能力）的两个角度：数据侧 vs 架构侧

## Why It Matters

- **把"灾难性遗忘"从定性变定量**（POPE 88.87%→0.04%），并指出 co-training 救不回来——为"结构性解法"立论
- **范式 A 的一个新变体**：双完整 VLM + 非对称冻结，是"如何在用 VLM 通用能力的同时学控制"的一种干净结构解
- DeepCybo 的第二条线（与 PhysBrain 互补），显示该团队在"保住 VLM 通用能力"这个问题上同时押数据和架构两条路

## Related

- [[DeepCybo]] — 出品方（PhysBrain 同团队）
- [[DeepCybo - PhysBrain Human Egocentric Data as a Bridge from VLMs to Physical Intelligence]] — 同团队，数据侧解法（互补）
- [[Embodied Brain Models]] — VLM-as-encoder / 范式 A；灾难性遗忘解法谱系
- [[Galaxea - G0.5 Autoregressive VLM-as-Actor VLA]] — 遗忘问题的 unified-AR 解法（对照）
- [[Physical Intelligence - pi0.5 a VLA with Open-World Generalization]] — KI 解法（对照）

## tags

#vla #twinbrainvla #deepcybo #catastrophic-forgetting #asymmetric-mot #dual-vlm #paradigm-a #vlm-as-encoder #embodied-ai #china
