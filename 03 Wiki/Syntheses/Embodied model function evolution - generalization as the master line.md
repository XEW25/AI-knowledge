# Embodied model function evolution — generalization as the master line

> 🧭 **整合入口**:本页是"未来具身 Agent 框架"的 **why(驱动力)** 切面 —— 全局总览见 [[Future embodied Agent framework - integrated view]]。

> 具身模型**功能演进**的重述:端到端 → 大小脑协同 → 端云自闭环 → **具身 Agentic**。**不按"能力越来越强"讲,而按"泛化/可用性墙"驱动来讲**——每阶段是对同一堵墙的回应,主线是**泛化的载体从「模型」走向「组合」**。
> 缘起:功能趋势汇报后专家反馈"需融入泛化性不足 + 逐场景真机 RL/遥操不可持续"的问题。本页即为回应。

- **Type**: Synthesis(汇报底稿 / 论证)
- **Date**: 2026-06-30
- **可靠性**:阶段/例子多为库内已核实(BFM-2 等厂商自报已标 ~);**分段、成本曲线、泛化载体主线 = 分析判断**。

![[fig-embodied-function-generalization.svg]]

## 核心重构:从「能力阶梯」到「问题驱动」

原叙事(端到端→大小脑→端云)是一条**能力线**,回答"越来越能干什么",但没说**为什么这样演进**。重构的关键一招:**把"泛化/可用性"设成驱动,把每个功能阶段设成"对同一堵墙的回应"**。这样功能发展与泛化问题不再是并列两块,而是**因果一条线**。

**主线变量 = 泛化的载体**:它在四阶段里依次变化——
`模型 OOD 鲁棒 → 分层复用 → 持续/共享再学习 → 组合复用(+重规划)`。
前三阶段都在"**让每个新场景的再学习更省**",第四阶段"**不再逐场景学,而是复用 + 重规划**"。

## 四阶段(功能 / 泛化载体 / 撞的墙 / 例子)

| 阶段 | 功能 | 泛化靠什么 | 撞的墙 · 残留成本 | 代表 |
|---|---|---|---|---|
| **① 端到端** | 单模型 感知→动作 | 一个模型做大 + 堆数据 | OOD 就崩;**每个新场景要 fine-tune + 真机 RL + 遥操**才"可用" → 成本**线性** | RT-2、OpenVLA、π₀ 系、[[Galaxea - G0.5 Autoregressive VLM-as-Actor VLA\|G0.5]]、[[NVIDIA - GR00T N1 An Open Foundation Model for Generalist Humanoid Robots\|GR00T N1]] |
| **② 大小脑协同** | 通用脑规划 + 小脑执行 | **分层复用**(脑靠 web 知识零样本泛化) | 只解决**语义**泛化;墙**下移到执行层**——小脑技能仍逐场景采数据训 | [[Figure AI - Helix a VLA for Generalist Humanoid Control\|Helix]](S2+S1)、[[Galaxea - G0 Dual-System VLA Model\|G0]]、[[AgiBot - GO-1 ViLLA Generalist Embodied Foundation Model\|GO-1]]+BFM-2~ |
| **③ 端云自闭环** | 持续演进 + 车队共智 | **逐场景适配 → 持续 + 共享**(联邦/经验上行) | 成本被摊薄、连续化,但本质仍"**每场景再学一遍**",无结构性复用 | [[Cloud-edge co-evolving embodied agent - a continuous-evolution framework\|端云 co-evolution 框架]] |
| **④ 具身 Agentic** | 大脑编排可复用技能库 | **组合复用 + 重规划**:新场景 = 已验证技能的新组合 + 少量补训 | 成本**线性 → 亚线性**;第一次从**结构上**攻泛化 | Being-0、MetaWorld-X、[[Huang et al. - ChemBot Long-Term Memory for VLA-based Agents\|ChemBot]] + 本框架 **L3** |

## 长程精度:为什么端到端"能力再强也崩"(技术支点)

长程任务精度低有**两个联动主因**:
1. **误差累积 / 协变量偏移**:BC 每步小误差把机器人带到分布外 → 指数累积,成功率 ≈ **p^N**(每步成功率的 N 次方;如 0.95²⁰≈36%)。WAM 的"想象未来"本身也逐帧漂移。
2. **缺任务级反馈闭环**:端到端**有控制环(L1,每周期重观测重预测),但缺 L3 任务环**(失败检测 + 恢复 + 重规划)。一旦长程偏了,**无机制拉回**,一路错到底。见 [[Embodied Cerebellum Models#小脑的反馈闭环:分四层(别混为一谈)]]。

**两者合起来才致命**:误差把你推出分布(病)× 无任务环纠正(无免疫)→ 长程指数塌。

**这正是各阶段的对症点**:
- **逐场景 RL + 遥操** = 把每步 p 往上顶(线性硬扛指数衰减,换场景重来 → 不可持续)。
- **大小脑** = 加一个能重规划的脑(部分补 L3)。
- **Agentic 两把刀** = ① 把一条长 **p^N** 链拆成**短、高-p、已验证的技能**;② 技能间插入**检测/重规划/恢复(L3)**。**= 把"指数衰减的长链"换成"带纠错点的短链序列",从结构上掰断长程崩。**

## 例子池 & 典型配对(汇报可直接引)

**端到端**(monolith,同址同训一次前向):RT-2 / OpenVLA / RT-1 / Octo / π₀·π₀.5·π₀.6·π₀.7 / GR00T N1 / G0.5。
> ⚠️ π₀、GR00T 内部虽有"VLM + action expert",但**同址同训**,属端到端;别当大小脑。

**大小脑 典型配对**:

| 系统 | 大脑 | 小脑 | 接口 · 部署 |
|---|---|---|---|
| Figure Helix | S2(7B VLM @9Hz)| S1(80M @200Hz)| 单 latent 向量 · 全端 |
| Galaxea G0 | G0-VLM(Qwen2.5-VL)| G0-VLA(PaliGemma)| 语言子任务 · 异步 |
| AgiBot | GO-1/GO-2(ViLLA)| BFM-2/GCFM~ | latent/指令 · 云脑+端 |
| ChemBot(LimX)| LLM planner | Skill-VLA 库 | 语言/MCP · 上云下端 |
| NeuroVLA | cortex(Qwen-VL)| cerebellum+spinal(SNN)| latent · 全端 |

> **纯度谱**(选例时用):一个模型内两部分(GR00T N1、π₀.5 两层推理)→ 分离网络同机(Helix S2/S1)→ **真正云-端分离**(ChemBot、SayCan)。讲"协同"用后两类最典型。

## 一句话论述(可直接进汇报)

> 具身模型的功能演进,本质是**一场与"泛化-可用性"墙的持续战斗**:端到端把能力做出来,却要靠**逐场景真机 RL + 遥操**才可用(成本线性、不可持续);大小脑让语义先泛化;端云自闭环把逐场景适配变便宜、变持续;但只要**泛化的载体还是"一个要被逐场景适配的模型"**,就逃不出线性成本。**具身 Agentic 系统换掉了泛化的载体——从"适配模型"到"组合技能"**:用专家技能库承载可复用的"可用性",用 Agent 框架做跨场景重规划,才把适配成本掰成亚线性,真正做到**可用且可规模化**。

## 与库内资产的关系

- **Agentic 终点 = 两轴图的 L3**(小脑多专家库 + 大脑编排)+ **[[Cloud-edge co-evolving embodied agent - a continuous-evolution framework|端云 co-evolution 框架]]**;本页是把 **功能趋势 / 两轴 L3 / co-evolution** 用"泛化"串成一条因果链。
- **"可用性 gap"** = [[Home robot architecture - a hierarchical embodied agent|capability-vs-dependability]];逐场景 RL+遥操 = 逐场景补 dependability(线性),Agentic 让 dependable 的技能可复用。
- **L3 任务环** = [[Embodied Cerebellum Models]] 的反馈闭环四层;**Agentic 补的正是 L3**。
- 上游:[[Embodied Brain Models]](三流派 / 两轴 / 部署驱动)。

## Related
- [[Embodied Brain Models]] · [[Embodied Cerebellum Models]] · [[Cloud-edge co-evolving embodied agent - a continuous-evolution framework]] · [[Home robot architecture - a hierarchical embodied agent]]
- [[World model trends - architecture, scale, function, hardware]] — 姊妹综述(世界模型侧)

## tags
#synthesis #embodied-ai #generalization #agentic #vla #brain-cerebellum #cloud-edge #long-horizon #trends
