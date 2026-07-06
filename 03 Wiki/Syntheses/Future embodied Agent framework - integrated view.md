# Future embodied Agent framework — integrated view

> 本库对"未来具身 Agent 框架"的**单一入口**。此前这套判断分散在四篇综述里(功能演进 / 家庭机器人架构 / 端云 co-evolution / 地基),各讲一个切面;本页把它们缝成一张图 + 一条论证:**why → what → how → 地基**。

- **Type**: Synthesis(总览 / 整合入口)
- **Date**: 2026-07-06
- **可靠性**:模型锚点(π / GR00T / GO-1 / Helix / ChemBot)已核实;**分层形态、两通道拆分、亚线性成本主线 = Ethan + Ada 的前瞻分析判断**,非已证。各切面的完整论证与证据见下文所链的四篇。

![[fig-future-embodied-agent-framework.svg]]

## 一句话
未来的具身系统不是"一个更大的 VLA",而是一个**分层具身 Agent**:云端审议脑 ⟂ 端侧反应小脑,由**两条通道**相连(运行时:计划/观测;演进:经验/技能),立在一条地基上(capability ⟂ dependability),被"泛化/可用性墙"逼着从"适配一个模型"走向"组合可复用技能"。

## 1 · 为什么是 Agentic(驱动力:泛化墙)
功能演进不是"能力越来越强",而是被**同一堵泛化/可用性墙**逼出来的四阶段:**端到端 → 大小脑协同 → 端云自闭环 → 具身 Agentic**。主线变量是**泛化的载体**:`模型 → 分层复用 → 持续/共享再学习 → 组合复用`。前三阶段都在"让每个新场景的再学习更省",只有 Agentic **换掉了载体**——从"逐场景适配一个模型"到"组合已验证的技能",把适配成本从**线性掰成亚线性**。

它靠"两把刀"从结构上掰断长程崩塌(`成功率 ≈ p^N`):①把长链拆成**短、高-p、已验证的技能**;②在技能间插入 **L3 任务环**(失败检测 + 重规划 + 恢复)。
→ 完整论证:[[Embodied model function evolution - generalization as the master line]]

## 2 · 长什么样(结构:分层具身 agent)
- **云端(慢脑 · 低频 · 可断网)**:推理脑(提案者)+ 世界模型(验证者)+ 记忆(显式)。关键:**推理脑 ≠ 世界模型**——"该干什么" vs "这么干会怎样",是 **propose-then-verify**,可独立升级(π₀.7 的独立世界模型模块即此)。
- **端侧(快小脑 · 高频 · 必须离线可用)**:专家技能库(带 L3 编排)+ 安全脊髓(CBF/shield,实时·断网可用)+ 程序性技能(固化,≈生物小脑)+ 蒸馏轻脑(断网兜底)。
- **双记忆**:云端 episodic/semantic = 显式记忆("做什么");端侧固化技能 = 隐式/程序性记忆("怎么做")。
- **接口是计划级、不是动作级**;**端侧专家有局部自主**(云 RTT 只能低频)。
→ 完整架构:[[Home robot architecture - a hierarchical embodied agent]]

## 3 · 怎么持续进化(学习平面:端云 co-evolution)
- **两个不对称引擎 + 一座对称桥**:云=算力充裕/车队视角/专家**生产者**;端=受限/实时/专家**消费者**。判据:"**全车队视角**→只能在云;**实时+本地**→只能在端"。
- **架构选择 B(模块化独立专家)**:云脑下发**结构化高层指令**(子任务序列 + 行为约束 + 阶段验证标准);端侧是一批各自训练的独立技能模块。
- **演进接口不传权重**,只同步三样:**能力画像 / 接口契约共版本化 / 能力缺口信号**。
- **四关键技术(2+2)**:T1 端侧参数高效+错峰自演进 · T2 运行时安全(Simplex/影子/回滚)· T3 模块化联邦协同 · T4 端云协同接口。抽掉任一即塌。
→ 完整框架:[[Cloud-edge co-evolving embodied agent - a continuous-evolution framework]](配图与证据:[[Cloud-edge co-evolving embodied agent - figures and evidence]])

## 4 · 地基(capability vs dependability)
堆规模买的是 **capability**(平均能做多少);部署的闸门是 **dependability**(自知会错 / 能恢复 / 不闯祸 / 换场景成本),两者近乎正交、scaling 对后者递减。dependability 的各条研究线(KnowNo / Sentinel / CBF-SHIELD / World Action Verifier)**目前彼此孤立**,把它们整合成围绕生产级 VLA 的**统一脚手架**本身就是机会——[[Harness design]] 思想在具身领域的对应。
→ 详见 [[Home robot architecture - a hierarchical embodied agent]] 的"Capability vs Dependability"。

## 整合点:云↔端的两条通道
四篇里都隐含、但没被单独点破的一个结构:**云与端之间其实是两条独立通道**,分开看才顺——
- **运行时通道(计划级接口)**:云 ↓ 结构化计划/子目标,端 ↑ 观测。低频、可断网 ⇒ 逼出"端侧专家必须有局部自主 + 安全必须在端"。
- **演进通道(端云 co-evolution)**:端 ↑ 经验/接管/缺口,云 ↓ 新专家/能力画像/契约。传的是**能力画像而非权重** ⇒ 与"模块化独立专家(B)"天然咬合。

**两条通道对应两套判断**:运行时通道解释"长什么样(结构)",演进通道解释"怎么持续进化"。所以第 2、3 节不是两个框架,是**同一框架的静态切面与动态切面**。

## 现有最近的雏形
- **[[Huang et al. - ChemBot Long-Term Memory for VLA-based Agents|ChemBot]]** — 最接近:agent-as-planner + Skill-VLA 技能库 + 双层记忆(上云下端)。
- **π₀.7** — 把 BAGEL 世界模型做成**独立异步模块**,是 propose-then-verify 拆分的一步。
- Being-0 / MetaWorld-X(功能演进页所引的 Agentic 例子)。

## 三切面同构(为什么此前没有单页)
同一个"**分层 + L3 任务环**"结构在三处反复出现:功能演进叫它"Agentic 两把刀";架构页叫它"大脑编排 + 端侧专家 + 安全脊髓";co-evolution 叫它"云生产者/端消费者 + 对称桥"。它是从三场不同讨论里长出来、事后才收敛的——本页即那次收敛。

## Related
- [[Embodied model function evolution - generalization as the master line]] — why(泛化墙 → Agentic)
- [[Home robot architecture - a hierarchical embodied agent]] — what(分层架构 + 地基)
- [[Cloud-edge co-evolving embodied agent - a continuous-evolution framework]] — how(持续演进平面) · [[Cloud-edge co-evolving embodied agent - figures and evidence]]
- [[Embodied Brain Models]] · [[Embodied Cerebellum Models]] — 上游(流派 / 多速率栈 / L1–L3 反馈环)
- [[Memory in Embodied AI]] — 双记忆 · [[VLA - Vision-Language-Action Models]] — 被替换的单体载体
- [[Task Decomposition as OOD Mitigation]] · [[Task decomposition]] — Agentic 的拆解内核 · [[Harness design]] — dependability 脚手架
- [[World model trends - architecture, scale, function, hardware]] — 姊妹综述(世界模型侧)

## tags
#synthesis #embodied-ai #agentic #hierarchical-agent #cloud-edge #brain-cerebellum #dependability #long-horizon #framework #overview
