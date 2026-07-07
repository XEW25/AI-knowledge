# Real-robot data collection — teleop vs UMI-class, and the model-in-the-loop quality problem

> 真机数据采集两大范式（人类遥操 vs UMI 类离机采集）的趋势对比 + 数据质量评估的三代技术谱系 + "以下游训练闭环度量数据价值"对**计算系统**的挑战。回答 Ethan 的调研问题（2026-07-07）。

- **Type**: Synthesis（调研报告 / 面向计算系统研究）
- **Date**: 2026-07-07
- **方法与置信度**: deep-research 工作流产出 ~22 个独立来源、215 条声明，每个来源经**两路独立提取一致性校验**；以 arXiv 一手论文为主（标 primary），公司/媒体报道标 secondary。⚠️ 工作流的对抗验证阶段因两个来源抓取挂死被跳过；关键数字来自一手摘要且双路提取一致，但**未逐行回读全文**——引用进汇报前按 [[90 System/AGENTS|阅读纪律]] 复核原文。
- **上游**: [[Cloud-edge co-evolving embodied agent - a continuous-evolution framework]]（本文是其"云③ 技能工厂 / 云① 持续学习"的**数据上游**展开）、[[Embodied model function evolution - generalization as the master line]]

---

## TL;DR（四条）

1. **两范式在分层收敛，而非二选一**：遥操给"本体一致的高质量数据"（AgiBot World 100 万+轨迹、Galaxea GOD 500h 单本体），UMI 类给"约 3–5× 吞吐 + 开放场景覆盖"（UMI / FastUMI-100K / DexUMI / 它石智航穿戴路线）。头部公司实际都在建**数据金字塔**分层混采（呼应 [[Bi et al. - Motus A Unified Latent Action World Model|Motus]] 的六层金字塔）。
2. **"是否必须训练模型判别数据质量"——定义已模型化，手段未必**：学术界对**数据价值的定义**已收敛为"下游策略闭环表现"（CUPID/QoQ/DataMIL 同一表述），这个定义本身把模型放进了度量回路；但度量**手段**分三代并存：启发式过滤 → 模型判别 → 质量条件化（π 系列把质量判别器内化成训练组件）。工业主流仍是"标准化流水线 + 人工核验"（AgiBot World 一手表述）。
3. **闭环质量评估 = 把"训练+评估"变成数据管线的内循环**，带来三类计算系统新负载：(a) 重复训练 / influence 估计的算力墙（QoQ 被迫做层子集+梯度压缩近似，且只在百条级验证）；(b) 评估吞吐的物理瓶颈 → **四层评估栈**（人工 → AutoEval 自动真机 → SIMPLER real-to-sim → WorldEval 世界模型评估器），每上一层，物理瓶颈换成 GPU 负载——**评估算力开始与训练算力竞争**；(c) 数据引擎的调度形态（AutoEval 已是"评估即集群作业调度"；RoboArena 是跨 7 机构分布式评估网络）。
4. **具身数据管线 vs LLM 管线的本质差异**：视频解码主宰 I/O（Robo-DM 顺序解码比 LeRobot 快最高 50×，说明格式层远未成熟）；质量度量要过物理世界或其代理（LLM 数据过滤一次前向即可）；本体异构让数据价值不可跨平台复用（星海图实测：本体差距大时跨本体预训练收益减弱甚至为负）。

---

## 1. 两大范式对比（+ 外圈路线）

| 维度 | (a) 人类遥操机器人 | (b) UMI 类手持/穿戴离机采集 |
|---|---|---|
| 设备成本 | 全套 >20 万 RMB、单小时可破万元（媒体口径，secondary/存疑） | UMI 手持夹爪 BOM **$73** + GoPro 套件 $298（论文一手） |
| 吞吐 | 基线 1× | UMI ~**3×** 遥操（裸手速度的 48%）；DexUMI **3.2×**；FastUMI 叠衣 ~10s vs 遥操 ~50s（~5×） |
| 动作真实性 | 真机动力学内产生，最真 | 人手运动，需映射到机器人可行域 |
| 本体一致性 | 一致（卖点）；跨本体才有 gap | 天然有 embodiment gap：运动学（DexUMI 用外骨骼硬件关）+ 视觉（DexUMI 用 SAM2+ProPainter 把人手 inpaint 成机器手——**采集管线本身已依赖模型**） |
| 位姿/观测质量 | 编码器直出，准 | SLAM 位姿误差：UMI ORB-SLAM3 ATE **6.1mm / 3.5°**；FastUMI-100K 改用 RealSense T265 降依赖；腕部鱼眼为主、缺第三视角 |
| 规模代表 | **AgiBot World**（智元）：100 万+轨迹 / 217 任务 / 5 场景，遥操数采工厂；**DROID**：76k 轨迹 / 350h / 564 场景 / 50 采集员×12 个月（分布式三大洲）；**Galaxea GOD**：500h / 10TB+ / 10 万+操作，R1 Lite 单本体；**Unitree UnifoLM-WBT**（2026-03）：G1 全身遥操、多末端（Inspire/Brainco 灵巧手、Dex1 夹爪） | **FastUMI-100K**：10 万+轨迹 / 54 任务 / ~600h；**DexUMI**：每任务数百条（灵巧手）；**它石智航 WIYH**（2025-12）：10 万+人类操作视频，VLTA（视觉-语言-**触觉**-动作），TARS-Vision+TARS-Glove 穿戴采集（公司口径） |
| 质量保障现状 | AgiBot：标准化流水线 + **human-in-the-loop 人工核验**（论文一手） | FastUMI-100K：**纯启发式**——线/角速度异常检测 SLAM 漂移 + 工作空间包围盒过滤 |

### 概念澄清：UMI 数据 ≠ human-centric 数据（判据 = 动作空间属于谁的本体）

两者都"离机、由人产生"，但**不是一种数据**。UMI 的本质是**人通过"机器人末端形态的物理代理"演示**——手持夹爪即机器人夹爪替身，动作（SLAM 恢复的 6DoF 末端位姿 + 夹爪宽度）天然落在机器人动作空间，数据近乎直接可训。Human-centric（它石 WIYH 穿戴、[[DeepCybo - PhysBrain Human Egocentric Data as a Bridge from VLMs to Physical Intelligence|PhysBrain]] 纯视频）是**人用自己的手**——动作属于人手本体（或无显式动作），需 retargeting / 人手 inpainting / latent action 提取（[[AgiBot - GO-1 ViLLA Generalist Embodied Foundation Model|GO-1]] ViLLA、LAPA）才能变成训练数据。

| | 遥操 | UMI 类 | 穿戴 human-centric | 纯人类视频 |
|---|---|---|---|---|
| 动作空间 | 机器人（真机产生） | **机器人末端**（代理装置） | **人手** | 无显式动作 |
| 变成可训数据 | 直接 | 近乎直接（过滤） | retargeting + 视觉域迁移 | latent action 提取 |
| 吞吐/规模上限 | 低 | 中（3–5×遥操） | 高 | 极高（互联网级） |
| 典型用途 | SFT/精训 | SFT/预训练 | 预训练+对齐 | 表征/世界知识 |

- **边界案例 DexUMI**：戴在人手上但用外骨骼把人手运动**机械约束**进机器灵巧手可行运动学 + SAM2/ProPainter 人手 inpainting——硬件+模型把"穿戴"拉回 UMI 类。判据不是手持/穿戴，而是**动作空间对齐**。
- **系统含义**：谱系越靠右，**采集成本转移为数据管线的模型加工负载**（retargeting/latent action/inpainting/标注推理）——UMI 类"采集时用硬件关 gap"，human-centric"采集后用算力关 gap"（它石必须配 TARS Datacore 数据引擎即此故）。
- 佐证：星海图数据金字塔把"UMI 数据"与"人类第一视角视频"列为两个独立类别（media，2026-04）。

### ⚠️ 核实结论：星海图并无 UMI 类硬件产品（回应调研前提）

截至 2026-04 公开报道（品玩），**星海图未推出/命名任何 UMI 类手持或穿戴数采产品**；"UMI 数据"只是其 2026"真实数据金字塔"里的一个**数据类别/策略**。其旗舰 GOD 数据集刻意用 R1 Lite **单一本体遥操**采集，并把"动作空间一致性、语言标注对齐"作为质量卖点；团队实验发现**本体差距大时跨本体预训练收益显著减弱甚至为负**（media-reported）。中国公司里真正把"离机/穿戴采集"做成产品线的是 [[TARS 它石智航]]（TARS-Vision + TARS-Glove + TARS Datacore 数据引擎）。（若见到星海图新发布数采硬件，应补源更新本节。）

### 外圈路线（对照组）

- **合成优先**：[[Galbot 银河通用]] GraspVLA 十亿帧全合成预训练（Isaac 管线，宣称一周生成十亿级三模态数据）；其核心论点是**真机数据的沉没成本**——"人形硬件远未收敛，硬件更新使已采数据效力大打折扣"；落地仍需 ~百条真机轨迹后训练（vendor-reported）。
- **人类视频**：枢途科技 SynaData 宣称成本较遥操降 ~200×（media，存疑）；特斯拉式 fleet + trigger-classifier 数据引擎（搜索命中未深读）；vault 内对应 [[DeepCybo - PhysBrain Human Egocentric Data as a Bridge from VLMs to Physical Intelligence|PhysBrain]] 人类第一视角路线。
- **数采工厂业态**：深圳某企业在天津建 1.2 万㎡ / 150 标准化采集单元的采集工厂（media）。

**判断（分析性）**：范式选择是"**本体一致性 × 吞吐成本 × 场景开放度**"的三角权衡。随 VLA 跨本体能力增强，天平向 UMI 类/穿戴倾斜；但"最后一公里"的本体特定精训数据仍来自遥操/真机——与 Motus 数据金字塔、π0.5 co-training 的分层用数逻辑一致。

### 三层数据金字塔的分层采集趋势（2026-05 数智前线框架 + 本调研证据收口）

行业通行的三层框架（顶层真机遥操 / 中层仿真合成 / 底层互联网+人类行为数据；数智前线 2026-05，media）。文章关键数字（已回读原文核对归属）：真机数据**市场售价** ~**500–1000 元/小时**（觅蜂 CEO 姚卯青，并称无本体采集效率约为真机 2–3 倍——与 UMI 论文 3× 口径吻合）、全球现有高质量数据仅 ~50 万小时、全国 64 座数采中心、"卖数据先于卖机器人赚钱"（5.5 亿元订单）；**底层可用率个位数**：11 万小时**工厂视频**乐观估计可用 ~3%、12 万小时 Ego-centric 筛后可用于 VLA 预训练 ≤5000 小时（≈4%）（均为上交大李永露口径）。⚠️ 真机"500–1000 元/小时"为**售价**口径；与 leaderobot 2025-10"单小时或破万元"的量级差更可能是售价 vs 全成本推算之差，存疑待核。

| 层 | 采集趋势主线 | 支撑证据 |
|---|---|---|
| **顶层 真机遥操** | **从"卖里程"到"卖闭环"**：工厂化 → 商品化 → 经验化 | 数采工厂业态（AgiBot/64 座中心）；**售价商品化**（500–1000 元/小时）→ 附加值移向质量（星海图"一条高质量抵 10–100 条"）；角色收缩为"场景对齐 + 1% 最终调优"（文章判断）；增量转向部署经验+人工接管纠错（[[Physical Intelligence - pi0.6 a VLA That Learns From Experience|Recap]]、Scanford 飞轮）——遥操终局是**纠错信号生产**；全身化（Unitree WBT）多模态化（视触觉） |
| **中层 仿真合成** | **从"物理引擎"到"双引擎"，从产数据到兼评估器** | 物理引擎（Isaac/GraspVLA 十亿帧周产）+ 生成式世界模型（Cosmos/GigaWorld/Kairos）两条腿；"资产"→可重生成管线（硬件改版→重造，本体贬值问题→仿真算力问题）；职能扩张到评测与 RL（SIMPLER→WorldEval；文章原话"仿真承担规模化预训练、评测和强化学习"） |
| | | ↳ **注（"资产→可重生成管线"展开）**：真机数据绑定本体版本（动作空间/观测分布随硬件改版贬值——星海图跨本体负迁移实测是其注脚）；合成路线的资产不是数据集而是**生产管线**（场景库+任务生成器+物理仿真配置），本体只是可替换输入（URDF）——硬件改版=换模型重跑管线（银河通用宣称一周重造十亿帧，vendor）。类比：管线=源码+构建系统，数据集=构建产物，本体改版=换目标平台重编译；真机数据=无源码的平台专用二进制。系统含义：硬件 rev 触发**突发式重生成 GPU 负载**；数据版本谱系 = f(管线×资产库×本体版本)，需"数据 CI/CD"形态基础设施。折扣：运动规划/域随机化校准需部分重做，"无高附加成本"是厂商说法 |
| **底层 人类行为/互联网** | **从"捡来的数据"到"穿戴式主动生产"，清洗从规则到模型** | **可用率个位数是该层核心事实**（工厂视频 ~3%、Ego-centric 12 万→≤5000h）——"低成本"是毛成本，清洗/筛选才是成本大头；专用采集硬件量产（京东 JoyEgoCam、觅蜂 MEgo、TARS-Vision/Glove、UMI/FastUMI），标签化上移（采集时补位姿/触觉，WIYH VLTA）**正是为抬高可用率**；加工模型化（latent action/retargeting/inpainting/大模型标注——"MEgo Engine"类命名即证）；角色定型为行为先验（PhysBrain 零真机轨迹预训练） |

**跨层 meta 趋势**：① 职能分化定型（底层先验/中层规模+评测/顶层对齐+最后 1%）——金字塔是 curriculum 不是竞赛；② 层边界在移动（UMI=底层向顶层架的桥：成本像底层、动作空间像顶层；世界模型让中层向底层要素材、向顶层抢评估职能）；③ **每层的"采集"都在变成"采集+模型加工"复合管线**——数据成本构成从人力/设备转向算力，数据引擎成为持续在线 GPU 负载（与 §3 闭环挑战同源）。**系统视角的关键换轴**：底层数据"最便宜"是**毛成本幻觉**——可用率个位数（工厂视频 ~3%、Ego-centric ≈4%，两个独立例子）意味着单位**可用**数据成本 = 毛采集成本 ÷ 可用率 + 清洗/筛选算力，成本大头在数据引擎而非采集端；顶层则已按小时计价商品化（售价 500–1000 元/小时）。两端合起来：竞争从采集规模换轴到**数据引擎效率**（筛选管线的召回/算力比）——该结论对底层最尖锐，而底层恰是规模主力。

---

## 2. 数据质量评估：三代谱系

| 代际 | 思路 | 代表（关键数字） | 状态 |
|---|---|---|---|
| **G1 规则/启发式 + 人工** | 结构信号过滤 + 人工核验 | AgiBot World（标准化流水线+人在环核验）；FastUMI-100K（速度异常+包围盒）；**RINSE**（2026-04）：轨迹平滑度 training-free 打分——soft-weight 复现 Re-Mix 配比 **Spearman ≥0.89**，半量数据 **+20%** 成功率 | **工业主流** |
| **G2 模型判别**（价值=对下游策略的贡献） | 训练模型/用梯度信息给数据打分 | **DemInf**（RSS 2025）：kNN 互信息(VAE 嵌入)估演示质量，RoboMimic +5–10%，真机 ALOHA/Franka 有效，与人类专家评分一致；**CUPID**（2025-06）：influence functions→对策略期望回报的影响，**<33% 数据达 SOTA**；**QoQ**（2026-03）：influence(held-out 验证损失)，sim +23.2%/真机 +30.0%，**算力重→被迫近似**（层子集、排除视觉编码器、OPORP 梯度压缩），仅 100–200 条/任务规模验证；**DataMIL**（2025-05）：datamodels，60+ 任务、OXE 选数，**真机 rollout 太贵→surrogate loss**；**Re-Mix**（2024-08）：DRO 学 domain 配比，vs uniform **+38%**/vs 人工 +32% | **学术前沿** |
| **G3 质量条件化**（不筛数据，带质量标签学） | 质量判别器内化成训练组件 | [[Physical Intelligence - pi0.6 a VLA That Learns From Experience|π*₀.6 Recap]]：**训练出的 value function** 给轨迹打 advantage → conditioning；[[Physical Intelligence - pi0.7 a Steerable Generalist Robotic Foundation Model|π₀.7]]：speed/quality/mistake **metadata conditioning** + CFG，从混合质量数据学习 | **头部公司实践** |

### 回答"是否必须训练模型来判别数据质量？"（分层）

1. 数据价值的**定义**已收敛于"下游闭环表现"——这一步已经把模型放进了度量回路（学术共识级）。
2. 但**手段**不必然是重型模型：RINSE 证明结构信号可逼近学出来的配比；Scanford 用外部 ground-truth（图书馆书目）自动标注，绕过模型打分。
3. 工业实践滞后学术一代：AgiBot 仍人工核验；它石 TARS Datacore 是"模型做**标注**"而非"模型做质量打分"（vendor）；π 系列直接跳到 G3 内化路线。
4. **趋势判断（分析性）**：数据量一旦超过人工核验极限（百万轨迹级），模型在环的质量评估成为默认；但落地形态更可能是"**VLM 标注 + 轻量结构打分 + 价值条件化**"的混合，而不是给每条数据跑 influence。星海图"一条高质量数据抵 10–100 条低质量"（media）反映业界已把质量当 2026 年分水岭。

---

## 3. 闭环数据质量评估的计算系统挑战（核心节）

**范式**：数据价值 = f(下游策略闭环表现) ⟹ 度量一次数据价值 ≈ 至少一次（部分）训练 + 一批评估 rollout ⟹ **"训练在环"的数据引擎**。这正是 Ethan 问题的答案：**是，闭环会对计算系统提出结构性新挑战**，具体三类：

### (a) 重复训练 / 影响估计的算力墙
- influence/Shapley 类方法天然要求多次训练或二阶梯度信息；**QoQ 的近似清单**（只算部分层梯度、排除参数密集的视觉编码器、OPORP 压缩梯度向量）就是算力墙的直接证据（primary）。
- DataMIL 因"数据筛选期间的真机 rollout 贵到不可行"被迫引入 surrogate loss（primary）。
- **规模缺口**：G2 方法全部只在 10² 条级验证，车队级（10⁶ 轨迹）未证——把 influence 类方法工程化到百万轨迹是**开放的系统问题**（数据价值估计的增量化、缓存、与训练管线的融合）。

### (b) 评估吞吐的物理瓶颈 → 四层评估栈

| 层 | 代表 | 吞吐 / 保真（已核实数字） | 引入的新计算负载 |
|---|---|---|---|
| L0 人工真机 | — | ~16h 人工 ≈ AutoEval 19h 自主的试验量 | 人力（不可扩展） |
| L1 自动化真机 | **AutoEval**（2025-03） | 24h ≈**850 episodes**（~42 eval steps/min），人工时间 **-99%**（19h 仅需 3 分钟人工），与人工评估 Pearson **0.942** | 成功判别 VLM（~1000 张图微调 PaliGemma）+ 场景重置策略（~100 条演示 BC）+ **作业队列调度** |
| L2 real-to-sim | **SIMPLER**（2024-05） | 单环境 **3.5k sim steps/s** @RTX4090（论文称 ~7× 真机加速）；Google Robot 任务 Pearson **0.924** | GPU 仿真 + 资产/场景制作 |
| L3 世界模型评估器 | **WorldEval**（2025-05） | 论文称与真机表现强相关、**优于 SIMPLER 类方法**；直接喂动作失败，需 Policy2Vec latent-action 条件化 | **视频生成推理**——评估变成大规模生成式 GPU 负载 |

- 分布式补充：**RoboArena**（2025-06）——7 所机构的 DROID 网络、600+ 双盲 A/B 对战、Elo 式聚合，比集中式评估排名更准（primary）。评估基础设施在走向"**众包集群**"。
- **洞察**：评估栈每往上一层，物理瓶颈就换成一层 GPU 负载；到 L3，"评估一个 checkpoint"="跑一批视频生成"。**评估算力第一次成为与训练算力并列的预算项**——这与 [[Cloud-edge co-evolving embodied agent - a continuous-evolution framework]] 云④"下发前车队级验证门"直接互锁：验证门的吞吐上限决定技能下发节奏。

### (c) 数据引擎（data flywheel）的调度形态
- **AgiBot World**：工厂采集 → 人工核验 → GO-1 预训练（比 OXE 训练平均 **+30%**，性能随数据量可预测 scaling）（primary）。
- **Scanford / Robot-Powered Data Flywheel**（2025-11，学术级实例）：部署中的机器人自采数据微调自身模型——2 周 / 2103 书架，VLM 书目识别 **32.0%→71.8%**，零人工标注（外部 ground truth 自动标注）；单机器人小规模，非车队级（primary）。
- **银河通用**：把数据价值问题转化为**仿真算力问题**——硬件更新→合成数据整体重生成（vendor）。
- **洞察**：闭环数据引擎 = 持续训练 + 持续评估 + 数据筛选/配比的**三位一体调度问题**；形态类似 RLHF infra，但多了两个具身特有约束——评估要过物理世界（或其代理），数据价值绑定本体版本（硬件改版→数据贬值）。

---

## 4. 数据管线的基础设施挑战

- **存储/格式在快速演进（都是 2025 年的事）**：LeRobot v2"每 episode 一文件"撞文件系统极限 → **v3**（2025-09）Parquet + 多 episode 合并 MP4 + 流式加载（StreamingLeRobotDataset），目标百万 episode / 数十亿帧；**Robo-DM**（2025-05）EBML 自描述格式，vs RLDS 压缩 **70×**（有损）/3.5×（无损），顺序解码比 LeRobot 快最高 **50×**；**75× 有损压缩下游任务精度不降**——存储-质量权衡空间巨大（primary）。
- **视频编解码主宰 I/O**：多路相机并发流；解码吞吐是训练加载的一级瓶颈（Robo-DM 的对策：负载均衡解码 + 内存映射解码缓存）。
- **数据管理架构空白**：EAI 数据管理综述（arXiv 2508.13901）——图/多模型/数据湖/向量/时序五类存储架构各有失格点，无现成架构同时满足"异步多模态流 + 实时访问 + 跨模态融合"；该领域**连标准 benchmark 都还没有**（primary）。
- **VLM 自动标注负载**：WIYH 标注体系含标定/深度/动作/指令/CoT/mask/触觉，TARS Datacore 宣称云端大模型全流程自动标注（vendor）；AutoEval 的成功判别本身就是一个微调 VLM。大规模数采工厂的标注推理是持续性 GPU 负载。
- **具身特有 vs LLM 管线对照**：① 时序多模态 I/O（vs 文本 token 流）；② 质量度量过物理世界或其代理（vs 一次前向打分）；③ 本体异构性——动作空间归一化/离散化是 robotics 特有工程（Re-Mix 一手表述），跨本体还可能负迁移（星海图实测，media）；④ 数据新鲜度与**本体演进耦合**（硬件改版→数据贬值，银河通用论点）。

---

## 5. 未覆盖与存疑清单

- **未覆盖**：RoboMIND、Open X-Embodiment 细节、π/Figure 数据引擎一手资料（π 系列由 vault 内 [[Physical Intelligence - pi0.6 a VLA That Learns From Experience|π*₀.6]] / [[Physical Intelligence - pi0.7 a Steerable Generalist Robotic Foundation Model|π₀.7]] 笔记补位）；GELLO/ALOHA 遥操硬件细节。
- **存疑（媒体/公司口径）**：遥操"20 万+/套、万元/小时"；SynaData"200×"；WIYH"杂乱场景 8%→60%"；星海图估值/客户名单；TARS Datacore 能力描述。
- **方法论缺口**：本轮对抗验证阶段被跳过（两个来源 WebFetch 挂死）；以双路独立提取一致性 + primary 来源替代。**引用进正式汇报前，关键数字需回读原文**。

## Sources（按主题分组；arXiv ID 与论文名的配对由提取管线 URL 集合 + 日期匹配确定）

- **UMI 类**：UMI [arXiv:2402.10329](https://arxiv.org/abs/2402.10329) · FastUMI-100K [arXiv:2510.08022](https://arxiv.org/abs/2510.08022) · DexUMI [arXiv:2505.21864](https://arxiv.org/abs/2505.21864)
- **遥操数据集**：DROID [arXiv:2403.12945](https://arxiv.org/abs/2403.12945) · AgiBot World [arXiv:2503.06669](https://arxiv.org/abs/2503.06669) · Unitree UnifoLM-WBT（[B站发布](https://www.bilibili.com/video/BV14cXPBXEfC/)，HF: unitreerobotics）
- **质量评估**：DemInf [arXiv:2502.08623](https://arxiv.org/abs/2502.08623) · CUPID [arXiv:2506.19121](https://arxiv.org/abs/2506.19121) · QoQ [arXiv:2603.09056](https://arxiv.org/abs/2603.09056) · DataMIL [arXiv:2505.09603](https://arxiv.org/abs/2505.09603) · Re-Mix [arXiv:2408.14037](https://arxiv.org/abs/2408.14037) · RINSE [arXiv:2604.23000](https://arxiv.org/abs/2604.23000)
- **评估基础设施**：AutoEval [arXiv:2503.24278](https://arxiv.org/abs/2503.24278) · SIMPLER [arXiv:2405.05941](https://arxiv.org/abs/2405.05941) · RoboArena [arXiv:2506.18123](https://arxiv.org/abs/2506.18123) · WorldEval [arXiv:2505.19017](https://arxiv.org/abs/2505.19017)
- **数据基础设施**：Robo-DM [arXiv:2505.15558](https://arxiv.org/abs/2505.15558) · LeRobotDataset v3 [HF blog](https://huggingface.co/blog/lerobot-datasets-v3) · EAI 数据管理综述 [arXiv:2508.13901](https://arxiv.org/abs/2508.13901) · Robot-Powered Data Flywheel (Scanford) [arXiv:2511.19647](https://arxiv.org/abs/2511.19647)
- **中国公司动向（secondary）**：星海图 GOD（[极客公园 2025-08](https://www.geekpark.net/news/358631)）· 星海图数据金字塔/B+轮（[品玩 2026-04](https://www.pingwest.com/a/306757)）· 它石智航 WIYH（[36Kr 2025-12](https://eu.36kr.com/zh/p/3749019152548360)）· 遥操/UMI/视频学习成本对比（[机器人大讲堂 2025-10](https://www.leaderobot.com/news/6463)）· 银河通用 GraspVLA（[国投基金 2025-01](http://www.ciifund.cn/zwt/hydt/202501/9b28f75924a44492819a7cde3fa13b53.shtml)）· AgiBot World 开源快讯（[TechNode 2024-12](https://cn.technode.com/post/2025-01-01/agibot-world/)）· 三层数据金字塔与数据服务市场（[数智前线 via 36Kr 2026-05](https://eu.36kr.com/zh/p/3804813317431044)：真机售价 500–1000 元/小时（姚卯青）、底层工厂视频可用率 ~3% / Ego-centric 12 万→≤5000h（李永露）、64 座数采中心）

## Related

- [[Cloud-edge co-evolving embodied agent - a continuous-evolution framework]] — 云③ 技能工厂（teleop 示范源）/云④ 验证门的上游；评估栈吞吐 ↔ 下发节奏互锁
- [[Future embodied Agent framework - integrated view]] — 数据/评估是其"how（持续演进）"切面的物质基础
- [[AgiBot 智元]] · [[Galaxea 星海图]] · [[Galbot 银河通用]] · [[TARS 它石智航]] · [[Physical Intelligence (π)]]
- [[AgiBot - GO-1 ViLLA Generalist Embodied Foundation Model|GO-1]] · [[Galaxea - G0 Dual-System VLA Model|G0]] — 两个数据集的下游模型
- [[Bi et al. - Motus A Unified Latent Action World Model|Motus]] — 六层数据金字塔（分层用数的架构表达）
- 未来页：[[Robot data engine]]（若数据引擎证据继续累积，可独立成 concept 页）

## tags

#synthesis #embodied-ai #data-collection #teleoperation #umi #data-quality #data-engine #evaluation-infrastructure #computing-systems
