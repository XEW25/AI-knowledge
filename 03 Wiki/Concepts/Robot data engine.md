# Robot data engine（机器人数据引擎）

## Purpose
概念页:**数据引擎** = 把"造数据"从一次性采集升级成**常驻闭环系统**——持续产出 / 打分 / 重训 / 再产出。它是具身领域"数据"这条线的**概念骨架**;完整调研与证据(三层金字塔、各层例子/趋势、质量评估三代、计算系统挑战)见 [[Real-robot data collection - teleop vs UMI-class, and the model-in-the-loop quality problem|三层数据金字塔综述]]。

**判据(数据集 vs 引擎)**:交付物是**一批轨迹**还是**一条能反复吐出轨迹并自己判断好坏的管线**。前者绑定本体版本、会贬值;后者的资产是**管线本身**(场景库 + 任务生成器 + 筛选器 + 评估器),本体只是可替换输入。

## 为什么具身必须要"引擎",而不只是过滤器
**根因:具身没有 LLM 那样便宜的内在质量代理。** 文本可读、perplexity 可用;而一条轨迹的好坏**只能由下游闭环表现定义**(CUPID / QoQ / DataMIL 同一表述,各公司数据集发布均以此背书)。

这条定义把**模型和训练放进了度量回路**:度量一次数据价值 ≈ 至少一次(部分)训练 + 一批评估。于是"筛数据"这件事本身变成一个**需要算力和调度的系统**——这就是"引擎"一词的实质,而非修辞。

**由此产生的成本转移(全库反复出现的主线)**:
> 每层的"采集"都在变成"**采集 + 模型加工**"复合管线 → **数据成本的构成从人力/设备转向算力**;竞争从**采集规模**换轴到**数据引擎效率**(筛选管线的召回/算力比)。

具体表现:底层"采集省下的钱变成 GPU 账单"(可用率个位数 → 单位可用数据成本 = 毛成本 ÷ 可用率 + 清洗算力);中层"生成即算力";顶层"评估即算力"。

## 引擎的四个部件
1. **产出**(collection / generation):遥操、仿真重生成、世界模型生成、穿戴采集、部署 rollout。
2. **加工**(processing):retargeting、latent action 提取、人手 inpainting、VLM 自动标注——**越靠数据金字塔底层,这部分负载越重**。
3. **判别**(valuation):从规则启发式 → 模型判别(influence/datamodels)→ 质量条件化(判别器内化成训练组件)。三代并存,工业实践滞后学术一代。
4. **评估/裁决**(evaluation):L0 人工真机 → L1 自动化真机 → L2 real-to-sim → L3 世界模型评估器。**每上一层,物理瓶颈换成一层 GPU 负载。**

## 核心结构:昂贵 oracle 的多级代理层级
全行业质量体系的统一解释——它们都是给"**全训练 + 真机评测**"这个昂贵 oracle 建的**代理/缓存层级**:

`启发式 ≺ VLM 打分 ≺ influence 近似 ≺ 小模型代理训练 ≺ 全训练+仿真评测 ≺ 全训练+真机评测`

- 级间靠**相关性系数**校准(≈ 缓存一致性度量);分布漂移(新本体/新任务)→ 重校准,本身又是算力开销。
- **⇒ 数据引擎的调度目标 = 最小化对顶层 oracle 的调用次数。** 这是本概念最有操作性的一句。
- 经济学推论:工业界偏好"**训练一次判别器,之后 per-sample 只花推理**"(买断制)而非"每条数据跑 influence"(按次计费)——规模越大,买断越占优。

## 两种引擎形态(一条有用的分类轴)
| | **生产型**(produce-then-verify) | **自演进型**(deploy-then-harvest) |
|---|---|---|
| 数据来源 | 专门花钱生产:遥操工厂 / 仿真重生成 / 穿戴采集 | **部署 rollout + 人工接管纠错** |
| 增长方式 | 随投入(人力/算力)增长 | **唯一随机器人保有量自动增长** |
| 引擎的主要工作 | 筛选 + 配比 + 保真度校准 | **提取质量信号**(value function / 奖励分类器 / 成功检测) |
| 真正稀缺的资源 | 采集产能、清洗算力 | **人类注意力**(演示 + 干预)与可靠质量信号 |
| 代表 | AgiBot World 数采工厂、SynGrasp-1B 十亿帧、WIYH | π*₀.6 Recap、HIL-SERL、RoboCat、Scanford 飞轮 |

**自演进型的配方 = 双组分杠杆**:少量高价值**人类信号**(支点)撬动大量免费**自主经验**(杠杆臂),质量信号机制做转换器。它把"数据获取"问题转化为"**质量信号提取**"问题。注意:自主经验免费,但**打分算力不免费**(常驻在线负载)。

## 统一引擎必须容纳的两个异构性
1. **质量度量异构**:三层"坏"的定义各不相同——顶层=**教坏策略**、中层=**不够真**、底层=**转化不出**。⇒ **不存在统一质量分**。
2. **算力瓶颈异构**:**顶层贵在评估、中层贵在生成、底层贵在清洗**——瓶颈落在管线的不同段。⇒ 三层 QA 基础设施形态迥异。

## 与技能供给成本结构的关系
数据引擎是 [[Cloud-edge co-evolving embodied agent - a continuous-evolution framework|端云 co-evolution 框架]] **云③技能工厂**的物质基础:技能库要长大,新专家的数据从哪来。两条供给路线的成本性质根本不同——**teleop(人力线性,受示范者水平限制)vs sim RL(转成可并行算力,可超越示范者)**;详见该页"技能供给的成本结构"一节。**亚线性成立的程度,取决于引擎能把多大比例的技能需求转成"可仿真 + 可判定"的形式。**

与云④的互锁:**验证门吞吐决定技能下发节奏**——评估栈(L0–L3)的吞吐直接是演进闭环的节拍上限。

## Open problems / 研究机会
- **为数据验证优化的训练调度系统 = 公开空白**(唯一近似实例是 NVIDIA **OSMO** 的"数据 CI/CD"雏形,但它是通用工作流编排)。可做:增量数据估值(用缓存梯度/训练态做 delta 估值而非重训)、消融树共享前缀调度、验证作业与生产训练错峰。
- **规模缺口**:模型判别(influence/datamodels)类方法**全部只在 10² 条级验证**,车队级(10⁶)未证。
- **评估算力第一次成为与训练算力并列的预算项**(到 L3,"评估一个 checkpoint" = "跑一批视频生成")——预算与调度尚无成熟范式。
- **数据管理架构空白**:五类存储各有失格点,连标准 benchmark 都没有(EAI-DM survey)。
- 数据新鲜度与**本体演进耦合**:硬件改版 → 真机数据贬值;仿真管线可重跑但触发**突发式重生成 GPU 负载**。

## Related
- [[Real-robot evaluation]] — **姊妹页,边界须分清**:本页把评测当**被调用的 oracle**(怎么少调用它:代理层级、吞吐);那页把评测当**被设计的测量仪器**(调用一次能买到多少信息:任务覆盖、样本量、指标信息密度)。同一优化问题的两项——最小化调用次数 × 最大化单次信息产出
- [[Real-robot data collection - teleop vs UMI-class, and the model-in-the-loop quality problem|三层数据金字塔综述(Embodied data)]] — **本页的证据基座**(三层特征/例子/趋势、质量评估三代、L0–L3 评估栈、计算系统四大挑战、完整 Sources)。⚠️ 注意其**文件名仍是旧标题**(改版未改名),链接须用文件名
- [[Cloud-edge co-evolving embodied agent - a continuous-evolution framework]] — 云③技能工厂(供给侧成本结构)/ 云④验证门
- [[Future embodied Agent framework - integrated view]] — 数据引擎是其 "how(持续演进)" 切面的物质基础
- [[Heravi et al. - LEACL LLM-Enhanced Automatic Curriculum Learning for RL in Long-Horizon Manipulation|LEACL]] — 让 sim RL 少一块人工(奖励/课程设计),即降低"生产型引擎"里技能获取的人力占比
- [[Physical Intelligence - pi0.6 a VLA That Learns From Experience|π*₀.6 Recap]] — 自演进型引擎的头部实践(value function 做质量条件化)
- [[Qi et al. - Humanoid-GPT (AstraBrain-WBC) Scaling Data and Structure for Zero-Shot Motion Tracking|Humanoid-GPT]] — "sim RL 训专家 → 蒸馏部署"的零人类演示先例
- [[World model trends - architecture, scale, function, hardware]] — 中层"第二引擎"(世界模型产数据/当评估器)
- [[AgiBot 智元]] · [[NVIDIA]] · [[Galbot 银河通用]] · [[TARS 它石智航]] · [[Physical Intelligence (π)]] — 各家引擎实例的主体

## tags
#concept #embodied-ai #data-engine #data-quality #evaluation-infrastructure #self-improvement #computing-systems #data-flywheel
