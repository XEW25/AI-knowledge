# DeepCybo（深度机智）

- **Type**: Company / Embodied-AI Startup
- **Founded**: 2025（约）
- **Headquarters**: 北京（China）
- **孵化**: **中关村学院 + 中关村人工智能研究院**孵化的第一家具身智能公司
- **Founder**: 陈恺（Kai Chen）（亦为 PhysBrain 论文末位作者）
- **Focus**: 让 VLA 真正用上 VLM 的通用能力——同时押**数据侧**（人类视频预训练）和**架构侧**（抗遗忘结构）两条路
- **Flagship**: **PhysBrain 1.0**（VLM 大脑，数据侧）/ PhysVLA；**TwinBrainVLA**（非对称双 VLM，架构侧抗遗忘）
- **Funding**: 数亿人民币（短期内多轮）

## 在具身领域的站位

- **流派**：**LLM/VLM-as-brain**——PhysBrain 本身是一个 egocentric-aware 的 VLM 大脑（微调 Qwen3-VL），下游接 flow matching DiT action expert 得到 PhysVLA（**范式 B：cross-attention**）。
- **最激进的差异化**：**零真机轨迹预训练**——全靠约 1000 小时人类第一视角视频（Ego4D + EgoDex + BuildAI），经 Egocentric2Embodiment pipeline 转成 E2E-3M（300 万 VQA）。配套 ICDC wearable 数据采集（用 MANUS 手套采灵巧操作数据）。
- **数据路线定位**：VLA"数据稀缺四路线"里**④ 人类视频路线**押得最重的一个。
- **两条互补线**（同一目标"保住 VLM 通用能力"）：
  - PhysBrain = **数据侧**（egocentric 视频预训练增强 VLM 具身理解）
  - TwinBrainVLA = **架构侧**（冻结通才"左脑" + 可训专才"右脑" + AsyMoT，结构性抗灾难性遗忘；VLM-as-encoder / 范式 A）

> **核实踩坑**：⚠️ backbone 是 Qwen3-VL（v2），非二手常说的 Qwen2.5-VL；⚠️ 个别媒体把它误称 "DeepWisdom AI"（DeepWisdom 是另一家做 MetaGPT 的公司）；⚠️ PhysBrain **无开源代码/权重**（GitHub repo 仅项目主页）。

## 与知识库主题的关联

- [[DeepCybo - PhysBrain Human Egocentric Data as a Bridge from VLMs to Physical Intelligence]] — PhysBrain / PhysVLA / E2E-3M 详解（数据侧）
- [[DeepCybo - TwinBrainVLA Asymmetric Mixture-of-Transformers for Anti-Forgetting VLA]] — 非对称双 VLM 抗遗忘（架构侧）
- [[Embodied Brain Models]] — VLM-as-brain 流派；范式 A/B；数据稀缺四路线；灾难性遗忘解法谱系
- [[Home robot architecture - a hierarchical embodied agent]] — 人类视频路线是家庭数据飞轮的命门

## Related

- [[AgiBot 智元]] — GO-1 latent action 是另一种"从视频学"路线
- [[Galaxea 星海图]] / [[LimX Dynamics]] — 中国具身同行
- [[NVIDIA]] — PhysVLA 自称 "GR00T 风格"

## tags

#entity #deepcybo #physbrain #vlm-as-brain #egocentric-video #embodied-ai #china #not-open-source
