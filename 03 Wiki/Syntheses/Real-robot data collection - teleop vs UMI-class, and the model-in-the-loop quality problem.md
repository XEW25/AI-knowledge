# Embodied data — 三层数据金字塔：特征、例子、趋势、评估体系与计算系统挑战

> 以**三层数据金字塔**（顶层真机遥操 / 中层仿真合成 / 底层互联网+人类行为数据）为主轴的具身数据全景：各层特征对比 → 代表例子 → 采集趋势 → 质量评估体系 → 对计算系统的挑战。回答并沉淀 Ethan 的系列调研问题（2026-07-07）。

- **Type**: Synthesis（调研报告 / 面向计算系统研究）
- **Date**: 2026-07-07（同日多轮追问后按三层框架重组；初版"遥操 vs UMI 范式优先"结构见 git 历史）
- **方法与置信度**: deep-research 工作流 ~22 个独立来源 × 双路提取一致性校验（215 条声明）+ 后续 WebSearch/WebFetch 补源 + vault 内部笔记。arXiv 一手标 primary，公司/媒体标 secondary/vendor。工作流对抗验证阶段曾被跳过（两来源抓取挂死）；作为补偿，2026-07-07 对全部遗留未核实项做了**定点核实并归位正文**（RoboMIND / OXE / ALOHA / GELLO / Helix 500h / SynGrasp-1B / robomimic / DreamGen 管线 / OSMO），纯厂商口径（SynaData 200×、WIYH 8→60、TARS Datacore、星海图估值）无法独立核实，以行内 vendor/存疑标注为最终状态。
- **上游**: [[Cloud-edge co-evolving embodied agent - a continuous-evolution framework]]（本文是其"云③ 技能工厂 / 云① 持续学习"的数据上游展开）、[[Embodied model function evolution - generalization as the master line]]、[[World model trends - architecture, scale, function, hardware]]（中层"双引擎"的世界模型侧）

---

## 0. TL;DR

1. **三层分工定型为 curriculum 而非竞赛**：底层出行为先验（规模主力）、中层出预训练规模+评测+RL 场、顶层出场景对齐与"最后 1%"精调（数智前线 2026-05 行业口径，与 π0.5 co-training、[[Bi et al. - Motus A Unified Latent Action World Model|Motus]] 六层金字塔一致）。第四类数据——**部署经验**——是唯一随机器人保有量自动增长的数据类，长期可能长成新的一层。
2. **每层的"采集"都在变成"采集 + 模型加工"复合管线**：顶层质量评估模型化、中层生成模型化、底层清洗标注模型化——**数据成本的构成从人力/设备转向算力**。
3. **质量评估**：数据价值的定义已收敛为"下游策略闭环表现"（所有公司发布数据集都以此背书），但运营上是**两级体系**（样本级便宜门禁 + 聚合级训练裁决）；全行业 QA 体系 = 给"全训练+真机评测"这个**昂贵 oracle 建的多级代理/缓存层级**。
4. **对计算系统的四大挑战**：视频 I/O 主宰训练加载（格式层是验证吞吐的地板）；数据验证 = 反复调用昂贵 oracle（influence 算力墙 + 物理评估瓶颈）；**评估算力第一次与训练算力并列成为预算项**（L0–L3 评估栈，每上一层物理瓶颈换成 GPU 负载）；**为数据验证优化的训练调度系统是公开空白**（研究机会）。

---

## 1. 三层数据金字塔：定义与特征对比

行业通行三层框架（数智前线 2026-05，media；学术精细版为 Motus 六层金字塔——自底向上量↓质↑）。

| 维度 | **顶层 · 真机遥操** | **中层 · 仿真合成** | **底层 · 互联网 + 人类行为** |
|---|---|---|---|
| 采集方式 | 人遥操真实机器人（数采工厂/分布式） | 物理引擎生成（Isaac 等）+ 世界模型生成（新增第二引擎） | 互联网视频爬取；穿戴/手持设备主动采集（Ego 眼镜、手套、UMI 类） |
| 精度/质量 | **最高**：动作在真机动力学内产生、本体一致 | 低成本易量产，但有 **sim-to-real gap** | 泛化性强但精度低，**需大量清洗与动作对齐** |
| 成本 | 最高：市场售价 ~**500–1000 元/小时**（2026-05 姚卯青口径）；设备 20 万+ RMB/套（media，存疑） | 边际成本 ≈ **算力**（十亿帧/周量级） | 毛成本最低；**但可用率个位数**（见 §2 底层） |
| 吞吐/规模上限 | 最低（AgiBot World 1M 轨迹 = 顶级水位；全球高质量数据仅 ~50 万小时，media） | 极高（重生成一遍=跑一遍管线） | 极高（互联网级 + 日常活动皆可采） |
| 动作空间 | 机器人本体（真） | 机器人本体（仿真定义） | **人手或无显式动作**（UMI 桥数据例外，见下） |
| 质量的核心问题 | 演示质量（操作员水平、对策略的价值） | **保真度**（物理/视觉与真实的一致性） | **可转化性**（能否提取出可用训练信号） |
| 典型用途 | SFT/单本体精训 + 场景对齐（"1% 最终调优"） | 预训练规模 + **评测** + RL 场 | 行为先验/表征预训练 |

### 1.1 层间的桥与边界：UMI 类数据的位置（判据 = 动作空间属于谁的本体）

UMI 与 human-centric **不是一种数据**。UMI 的本质是**人通过"机器人末端形态的物理代理"演示**——手持夹爪即机器人夹爪替身，动作（SLAM 恢复的 6DoF 末端位姿+夹爪宽度）天然落在机器人动作空间，数据近乎直接可训。Human-centric（WIYH 穿戴、[[DeepCybo - PhysBrain Human Egocentric Data as a Bridge from VLMs to Physical Intelligence|PhysBrain]] 纯视频）是**人用自己的手**——动作属于人手本体（或无显式动作），需 retargeting / 人手 inpainting / latent action 提取（[[AgiBot - GO-1 ViLLA Generalist Embodied Foundation Model|GO-1]] ViLLA、LAPA）才能变成训练数据。

| | 遥操（顶层） | UMI 类（桥） | 穿戴 human-centric（底层） | 纯人类视频（底层） |
|---|---|---|---|---|
| 动作空间 | 机器人（真机产生） | **机器人末端**（代理装置） | **人手** | 无显式动作 |
| 变成可训数据 | 直接 | 近乎直接（过滤） | retargeting + 视觉域迁移 | latent action 提取 |
| 吞吐/规模上限 | 低 | 中（3–5× 遥操） | 高 | 极高 |
| 典型用途 | SFT/精训 | SFT/预训练 | 预训练+对齐 | 表征/世界知识 |

- **边界案例 DexUMI**：戴在人手上但用外骨骼把人手运动**机械约束**进机器灵巧手可行运动学 + SAM2/ProPainter 人手 inpainting——硬件+模型把"穿戴"拉回 UMI 类。判据不是手持/穿戴，而是**动作空间对齐**。
- 36kr 三层按**成本**把 UMI 归底层；按**可训性**它是底层向顶层架的桥——两个分类轴不矛盾，这正是 UMI 类的战略价值：便宜像底层、可用近顶层。
- 佐证：星海图数据金字塔把"UMI 数据"与"人类第一视角视频"列为两个独立类别（media，2026-04）。
- **系统含义**：谱系越靠底层，**采集成本越转移为数据管线的模型加工负载**（retargeting/latent action/inpainting/标注推理）——UMI 类"采集时用硬件关 gap"，human-centric"采集后用算力关 gap"（它石必须配 TARS Datacore 数据引擎即此故）。

### 1.2 遥操 vs UMI 类细对比（原调研主问，量化锚点）

| 维度 | 人类遥操机器人 | UMI 类手持/穿戴离机 |
|---|---|---|
| 设备成本 | 学术双臂遥操站 **ALOHA ~$20k**、GELLO 主端 **<$300/臂**（论文一手）；工业数采全套 >20 万 RMB（media）；数据市场**售价** 500–1000 元/h（2026-05 口径）。三个数字是三种东西：学术站造价 / 工业站造价 / 数据售价——早期"万元/小时"说法与售价的量级差 = 全成本推算 vs 商品化售价的口径+时点差（结论性判断） | UMI 手持夹爪 BOM **$73** + GoPro 套件 $298（论文一手） |
| 吞吐 | 基线 1× | UMI ~**3×**（裸手的 48%）；DexUMI **3.2×**；FastUMI 叠衣 ~10s vs 遥操 ~50s；姚卯青口径"无本体≈真机 2–3 倍" |
| 位姿/观测 | 编码器直出，准 | SLAM 误差：UMI ORB-SLAM3 ATE **6.1mm/3.5°**；FastUMI 改用 T265；腕部鱼眼为主、缺第三视角 |
| 本体 gap | 无（卖点）；跨本体才有 | 运动学可行性 gap（工作空间过滤）+ 视觉 gap（inpainting）——**采集管线本身已依赖模型** |

### 1.3 第四类数据：部署经验（三层之外）

机器人自主 rollout + 人工接管纠错（[[Physical Intelligence - pi0.6 a VLA That Learns From Experience|π*₀.6 Recap]]、RL Tokens 的语料）。它是真机产生的但**不是遥操演示**；是唯一随保有量**自动增长**的数据类（其余三层都要花钱专门生产）。**判断（分析性）**：长期可能从"第四类"长成金字塔新的一层；遥操的终局角色是向它让位（见 §3 顶层趋势）。

### 1.4 训练阶段 × 数据层矩阵（谁进哪段、用什么目标）

| 阶段 | 训练目标 | 吃什么数据 | 例子 |
|---|---|---|---|
| ① VLM 底座预训练 | 图文自监督 | 底层互联网图文 | PaliGemma/Qwen-VL（通常继承） |
| ② **具身预训练** | 模仿/流匹配/latent action（**非 RL**） | **三层混吃**：跨本体真机（OXE、AgiBot World）+ 人类行为（WIYH、ego latent action）+ 仿真合成（SynGrasp-1B） | GO-1、GraspVLA、PhysBrain |
| ③ **后训练/SFT** | 模仿精调 | 顶层少量高质量单本体真机 | GraspVLA 百条真机、GOD 精训、FastUMI-100K 训基线 |
| ④a **仿真 RL** | RL | 仿真**环境交互**（非静态数据集） | 主战场=运动小脑：[[Qi et al. - Humanoid-GPT (AstraBrain-WBC) Scaling Data and Structure for Zero-Shot Motion Tracking|Humanoid-GPT]] 从数百仿真 RL 专家蒸馏；操作 VLA 仿真 RL 起步 |
| ④b **真机 RL/经验学习** | offline RL/advantage conditioning | **第四类：部署经验** | Recap、[[Physical Intelligence - RL Tokens Precise Manipulation with Efficient Online RL|RL Tokens]] |

两个常见混淆：仿真数据进 VLA 的主通道是 ② 模仿预训练而非"仿真 RL"；遥操数据集不喂真机 RL（那是部署经验的地盘）。

---

## 2. 每层的代表例子

### 顶层 · 真机遥操

| 例子 | 规模与要点 | 置信度 |
|---|---|---|
| **AgiBot World**（[[AgiBot 智元]]） | **100 万+轨迹** / 217 任务 / 5 场景，数采工厂遥操；QA=标准化流水线+**人工在环核验**；GO-1 在其上预训练比 OXE **+30%**，性能随数据量可预测 scaling | primary |
| **DROID** | 76k 轨迹 / 350h / 564 场景；50 采集员 × 12 个月、跨三大洲分布式；标准化 Franka 平台 | primary |
| **Galaxea GOD**（[[Galaxea 星海图]]） | 500h / 10TB+ / 10 万+操作；**R1 Lite 单一本体**遥操（卖点=动作空间一致+标注对齐）；下载 60 万+ | media |
| **Unitree UnifoLM-WBT**（2026-03） | G1 人形**全身遥操**，多末端（Inspire/Brainco 灵巧手、Dex1 夹爪），HF 开源、滚动更新 | media |
| **RoboMIND**（北京人形/国地中心，RSS 2025） | **107k 轨迹** / 479 任务 / 96 物类；**四本体统一平台**遥操（Franka / 天工人形 / AgileX 双臂 / UR5e）+ Isaac Sim 数字孪生；**含 5k 条带失败原因标注的失败演示**——顶层数据集把"坏数据"当一等公民（供失败反思/纠错训练）的首例 | primary |
| **Open X-Embodiment** | 跨本体基线池：**1M+ 轨迹 / 22 本体 / 60 数据集 / 21 机构 / 527 技能**，RLDS 格式；Re-Mix/DataMIL 的选数对象、AgiBot World 的对照基线 | primary |
| **Figure Helix** | 官方口径仅 **~500 小时**遥操数据（自称 <5% 于既有 VLA 数据集）——顶层"少而精"路线的公司实例 | vendor（官方博客） |
| 业态数字 | 全国 **64 座数采中心**；深圳企业天津 1.2 万㎡/150 采集单元；市场售价 500–1000 元/h | media |

π 系列数据口径（vault 笔记补位）：[[Physical Intelligence - pi0.5 a VLA with Open-World Generalization|π₀.5]] 移动操作仅 ~400h（97.6% 训练数据来自其他来源=靠迁移）；[[Physical Intelligence - pi0.6 a VLA That Learns From Experience|π*₀.6]] 预训练"数万小时"（未细披露）——π 的数据引擎细节仍未完全公开。

> **⚠️ 核实结论（回应调研前提）**：截至 2026-04 报道，**星海图无具名 UMI 类硬件产品**——"UMI 数据"仅是其 2026"真实数据金字塔"的一个数据类别；旗舰 GOD 刻意单本体遥操，且实测**本体差距大时跨本体预训练收益减弱甚至为负**。中国离机采集产品线的代表是 [[TARS 它石智航]]。（若见到星海图新数采硬件发布应补源更新。）

### 桥 · UMI 类（成本归底层、动作空间近顶层）

| 例子 | 规模与要点 | 置信度 |
|---|---|---|
| **UMI**（RSS 2024） | 手持夹爪 BOM $73+GoPro $298；ORB-SLAM3 ATE 6.1mm/3.5°；3× 遥操吞吐；1400 demo/30 场景 → 新环境 71.7% | primary |
| **FastUMI-100K**（2025-10） | **10 万+轨迹** / 54 任务 / ~600h；T265 替代 GoPro SLAM；**启发式门禁**（速度异常检测漂移+工作空间包围盒）；DP/ACT/π0 基线 53–93% | primary |
| **DexUMI**（CoRL 2025） | 灵巧手外骨骼+人手 inpainting（SAM2/ProPainter）；3.2× 遥操吞吐；两种灵巧手平均 86% 成功 | primary |

### 中层 · 仿真合成

| 例子 | 规模与要点 | 置信度 |
|---|---|---|
| **GraspVLA / SynGrasp-1B**（[[Galbot 银河通用]]/PKU-EPIC，CoRL 2025） | **SynGrasp-1B：十亿帧**合成抓取数据（光真实渲染+域随机化，10,000 物体/240 类——arXiv 已核实）；纯合成预训练 + **~百条真机后训练**落地（"一周重生成/一人一天部署"为 vendor 口径） | primary+vendor |
| **DreamGen / GR00T-Dreams**（[[NVIDIA]]，2505.12705） | **4 阶段管线**（LoRA 微调视频世界模型 → 生成 → IDM/latent action 恢复动作 → 训策略）产出 **neural trajectories**；GR1 学会 22 个新行为；配 **DreamGen Bench**——把视频生成质量与下游策略性能挂钩的质检基准 | primary |
| **Cosmos-Transfer** | 仿真渲染→照片级真实的风格迁移，当 sim-to-real 桥 | vendor |
| vault 内对照 | [[GigaWorld Team - GigaWorld-Policy An Efficient Action-Centered World-Action Model|GigaWorld-Policy]]（训繁推简）、[[World model trends - architecture, scale, function, hardware]] | — |

### 底层 · 互联网 + 人类行为

| 例子 | 规模与要点 | 置信度 |
|---|---|---|
| **WIYH**（[[TARS 它石智航]]，2025-12 开源） | 10 万+人类操作视频，**VLTA 含触觉**；TARS-Vision 眼镜+TARS-Glove 手套穿戴采集；TARS Datacore 云端大模型全流程自动标注；宣称杂乱场景 8%→60% | vendor |
| **工厂视频**（李永露，2026-05） | 11 万小时，**乐观估计可用 ~3%** | 一手引述 |
| **Ego-centric 语料**（同源） | 12 万小时筛后可用于 VLA 预训练 **≤5000h（≈4%）** | 一手引述 |
| 采集硬件业态 | 京东 JoyEgoCam、觅蜂 MEgo 系列/MEgo Engine——底层数据的"设备产业"成形 | media |
| 视频学习路线 | 枢途科技 SynaData 宣称成本较遥操降 ~200×；特斯拉 fleet+trigger-classifier 数据引擎（未深读） | media/存疑 |
| vault 内对照 | [[DeepCybo - PhysBrain Human Egocentric Data as a Bridge from VLMs to Physical Intelligence|PhysBrain]]（E2E-3M，零真机轨迹预训练） | — |

---

## 3. 每层的发展趋势

### 3.1 顶层：**从"卖里程"到"卖闭环"**——工厂化 → 商品化 → 经验化

- **工厂化成型**：数采工厂业态（AgiBot、64 座中心）——遥操采集已是生产线。
- **售价商品化**：500–1000 元/小时（售价口径）；"卖数据先于卖机器人赚钱"（5.5 亿元订单，media）→ 毛数据大宗商品化，**附加值移向质量**（星海图"一条高质量抵 10–100 条"）。
- **角色收缩且上移**：只做"场景对齐 + 1% 最终调优"（数智前线判断）；增量来源从专职遥操转向**部署经验 + 人工接管纠错**（Recap、Scanford 飞轮）——**遥操的终局是纠错信号生产（DAgger 式），不是里程生产**。呼应 [[Cloud-edge co-evolving embodied agent - a continuous-evolution framework]] 云③"teleop 接管为主要示范源"。
- 形态上全身化（Unitree WBT）、多模态化（视触觉）。

### 3.2 中层：**从"物理引擎"到"双引擎"，从产数据到兼评估器**

- **生成式第二引擎**：物理引擎（Isaac，周产十亿帧）之外，视频生成世界模型开始直接产数据（DreamGen neural trajectories）——sim-to-real gap 部分转化为"世界模型物理保真度"问题。
- **资产 → 可重生成管线**：真机数据绑定本体版本（硬件改版→贬值，星海图跨本体负迁移实测是注脚）；合成路线的资产是**管线**（场景库+任务生成器+物理配置），本体只是可替换输入（URDF）——硬件改版=换模型重跑（银河通用宣称一周重造十亿帧，vendor）。类比：**管线=源码+构建系统，数据集=构建产物，本体改版=换目标平台重编译**；真机数据=无源码的平台专用二进制。系统含义：硬件 rev 触发**突发式重生成 GPU 负载**；数据版本谱系 = f(管线×资产库×本体版本)，需"数据 CI/CD"。折扣：运动规划/域随机化校准需部分重做。
- **sim-to-real gap 的六条趋势线**（姿态各异）：①**消解视觉 gap**——3DGS/NeRF 扫描替代建模（GS-Playground [2604.25459]、GS 软体评估 [2511.04665]；光轮智能资产服务=产业化证据）；②**校准动力学 gap**——可微/学习化系统辨识（D-REX [2603.01151]、NeRD 神经动力学；物理引擎变可训练组件）；③**生成式绕过**（DreamGen/Cosmos-Transfer）；④**real 锚点混训承认 gap**——sim 出规模 real 出对齐（GraspVLA 百条后训、π0.5 co-training）；⑤**动态数字孪生融合**——Real-is-Sim（Embodied Gaussians **60Hz** 同步孪生，策略在真实/虚拟无缝切换 [2504.03597]）；⑥**转岗评估器**（SIMPLER→WorldEval，见 §5）。**共同结构：把 gap 从人工工程问题换成算力问题**（扫描重建/可微反传/生成推理/在线同步全是 GPU 负载）。NeRD/D-REX 为搜索摘要级。
- 生态位：中层被 [[NVIDIA]] 栈（Isaac+Cosmos+GR00T-Dreams+Omniverse）**垂直整合度最高**。

### 3.3 底层：**从"捡来的数据"到"穿戴式主动生产"，清洗从规则到模型**

- **可用率个位数是该层核心事实**（工厂视频 ~3%、Ego 12 万→≤5000h）——"低成本"是毛成本幻觉，**单位可用数据成本 = 毛采集成本 ÷ 可用率 + 清洗筛选算力**，成本大头在数据引擎而非采集端。
- **主动生产化**：从被动爬取到专用穿戴硬件量产（JoyEgoCam、MEgo、TARS 套件、UMI/FastUMI 手持）——底层有了自己的设备产业。
- **标签化上移**：采集时补位姿/触觉标签（WIYH VLTA）**正是为抬高可用率**。
- **加工模型化**：清洗与动作对齐靠规则做不动——latent action 提取（GO-1/LAPA）、retargeting、inpainting、云端大模型标注（TARS Datacore；"MEgo Engine"命名即证）。**采集省下的钱变成 GPU 账单**。
- 角色定型为行为先验（PhysBrain 零真机轨迹预训练为极端实例）。

### 3.4 跨层 meta 趋势

① **职能分化定型**（底层先验 / 中层规模+评测 / 顶层对齐+最后 1%）——金字塔是 curriculum 不是竞赛；② **层边界在移动**（UMI 桥；世界模型让中层向底层要素材、向顶层抢评估职能；部署经验从第四类往金字塔里长）；③ **每层的"采集"都在变成"采集+模型加工"复合管线**——数据成本构成从人力/设备转向算力；**竞争从采集规模换轴到数据引擎效率**（筛选管线的召回/算力比），该结论对底层最尖锐，而底层恰是规模主力。

---

## 4. 每层的质量评估体系

### 4.1 总原则：数据价值的定义已收敛，但手段分三代

**定义收敛**：数据价值 = 对下游策略闭环表现的贡献（CUPID/QoQ/DataMIL 同一表述；所有公司数据集发布均以下游表现背书——AgiBot +30%、WIYH 8→60、GraspVLA 百条落地、FastUMI 基线成功率）。深层原因：**具身没有 LLM 那样便宜的内在质量代理**（文本可读+perplexity 可用；轨迹好坏只有闭环表现能定义）。

| 代际 | 思路 | 代表（关键数字） | 状态 |
|---|---|---|---|
| **G1 规则/启发式+人工** | 结构信号过滤+人工核验 | AgiBot World（人在环核验）；FastUMI（速度异常+包围盒）；**RINSE**（2026-04）：training-free 平滑度打分，soft-weight 复现 Re-Mix 配比 Spearman ≥0.89，半量数据 +20% | **工业主流** |
| **G2 模型判别** | 训练模型/梯度信息给数据打分 | **DemInf**（RSS 2025，kNN-MI on VAE，+5–10%，真机 ALOHA/Franka）；**CUPID**（influence→期望回报，<33% 数据达 SOTA）；**QoQ**（2026-03，influence→验证损失，sim+23.2%/真机+30%，**算力墙→层子集+OPORP 近似**，仅百条级验证）；**DataMIL**（datamodels，60+任务，rollout 太贵→surrogate）；**Re-Mix**（DRO 配比，vs uniform +38%） | **学术前沿** |
| **G3 质量条件化** | 判别器内化成训练组件 | [[Physical Intelligence - pi0.6 a VLA That Learns From Experience|π*₀.6 Recap]]（**训练出的 value function** 打 advantage→conditioning）；[[Physical Intelligence - pi0.7 a Steerable Generalist Robotic Foundation Model|π₀.7]]（speed/quality/mistake metadata+CFG，从混合质量数据学习） | **头部公司实践** |

### 4.2 运营图景：两级体系

**没有公司按条跑训练裁决**（QoQ 算力墙/DataMIL surrogate 即证）：

| 级 | 粒度 | 手段 | 算力形态 |
|---|---|---|---|
| 入库门禁 | 每条 | 规则启发式 / 人工核验 / VLM 标注 | CPU 规则、现成模型批推理 |
| 保留/配比裁决 | 数据源/配比/批次 | 训练→评测（Re-Mix 权重、co-training 消融、scaling 曲线） | 训练作业级 |

per-sample 模型判别唯一工业化处 = 部署经验数据（Recap value function），结构是"**训练一次判别器，之后 per-sample 只花推理**"。

### 4.3 三层的裁决回路各不相同

- **底层**：粒度最粗、频率最低（数据源级"这批 ego 视频有没有用"），门禁承担主量（个位数可用率的筛选在此级）；
- **中层**：**唯一能自闭环的层**——train-eval 全在仿真内最快最便宜；"数据质量"≈"管线保真度"，校准一次批量继承（SIMPLER r=0.924 = 这层的质检证书）；
- **顶层**：裁决最贵（真机评测瓶颈）→ 最依赖前置人工核验+事后聚合消融，也最积极找代理评估。

### 4.4 各层判别好坏的具体例子（判别信号分层异构）

- **顶层判"演示对策略好不好"**：AgiBot 人工核验（成功/规范）；RINSE 平滑度（操作员抖动/犹豫）；DemInf 互信息（乱动=坏）；CUPID influence（**揪出"演示成功但教坏策略"的虚假相关**）；Recap value function（部署轨迹逐段 advantage）。经典先例（已核实）：robomimic 2021（arXiv 2108.03298）——6 名不同熟练度操作员的多人数据集证明演示质量显著影响策略学习，且 offline RL 对混合质量**人类**数据尤其吃力。
- **中层判"够不够真"**：仿真内成功标签 = **数据出生自带裁判**（GraspVLA 十亿帧可行性前提）；SIMPLER 相关性系数 = 管线质检证书（漂移→重校准）；WorldEval **动作跟随性** = 生成式合成第一道质检；DreamGen Bench（把生成视频质量与下游策略性能挂钩的质检基准——生成质量判别被基准化）。
- **底层判"能不能转化成训练信号"**：工厂视频 3% 可用（视角/遮挡/可对齐性）、Ego 筛除 ~96%；FastUMI SLAM 门禁（速度异常=漂移、包围盒=可达性——桥数据专属信号）；TARS Datacore 标注置信度（vendor）。
- **含义**：三层"坏"的定义不同（**教坏策略 / 不够真 / 转化不出**）→ **不存在统一质量分**，统一数据引擎必须容纳分层异构的质量度量；判别成本不对称（中层近免费自判、底层海量批推理筛除、顶层最贵）→ 三层 QA 基础设施形态迥异。

### 4.5 机制辨析：哪些是真·"训练后看表现"（"模型在环"≠"训练后看精度"）

- **A 真·训练后看表现（聚合粒度，人人都做）**：所有数据集价值声明；Re-Mix DRO 训练中按域损失调权（Group-DRO 细节未逐行核实）。注意 RINSE 是"机制免训练、验证靠训练"。
- **B 真·训练后看表现（样本粒度，仅 influence/datamodels 家族）**：共同点 = 逃避"每条重训"（Shapley 不可行）；内部逐级降价：DataMIL（多次子集训练+surrogate）→ CUPID（一次训练+真 rollouts+梯度归因**闭环回报**）→ QoQ（一次训练+**验证损失**归因）——保真度换算力。
- **C 训练了模型但不看下游精度（训练裁判 = 买断制）**：DemInf（VAE 上的互信息统计量）；Recap value function（裁判预测给分；训练成本一次性，判别百万条=百万次前向）——**工业化选 C 不选 B 的经济学**（B 按次计费、C 买断，规模越大 C 越占优）。
- **D 完全无训练**：人工核验、RINSE 机制、SLAM/包围盒门禁、仿真自带成功标签、内容标准筛查。
- 与 §5.1 代理层级的对应：**只有 A/B 调用昂贵 oracle，C/D 全是缓存层**。

### 4.6 回答"是否必须训练模型来判别数据质量？"（分层）

1. 数据价值的**定义**已收敛于"下游闭环表现"——定义本身把模型放进了度量回路（学术共识级）。
2. 但**手段**不必然重型：RINSE 结构信号可逼近学出来的配比；Scanford 用外部 ground-truth（图书馆书目）自动标注绕过模型打分。
3. 工业实践滞后学术一代：AgiBot 仍人工核验；TARS Datacore 是"模型做标注"非"模型做质量打分"；π 系列直接跳到 G3 内化。
4. **趋势判断（分析性）**：数据量超过人工核验极限（百万轨迹级）后模型在环成为默认，但形态是"**VLM 标注 + 轻量结构打分 + 价值条件化**"混合，而非每条跑 influence。

---

## 5. 对计算系统的挑战

### 5.1 核心框架：昂贵 oracle 的多级代理/缓存层级

全行业 QA 体系 = 给"全训练+真机评测"这个昂贵 oracle 建的**代理层级**：启发式 ≺ VLM 打分 ≺ influence 近似 ≺ 小模型代理训练 ≺ 全训练+仿真评测 ≺ 全训练+真机评测。级间靠相关性系数校准（**≈ 缓存一致性度量**），相关性漂移（新本体/新任务分布）→ 重校准，本身又是算力开销。**数据引擎的调度目标 = 最小化对顶层 oracle 的调用次数**。

**评估栈（L0–L3）**——每上一层，物理瓶颈换成一层 GPU 负载：

| 层 | 代表 | 吞吐/保真（已核实数字） | 新计算负载 |
|---|---|---|---|
| L0 人工真机 | — | ~16h 人工 ≈ AutoEval 19h 自主的试验量 | 人力（不可扩展） |
| L1 自动化真机 | **AutoEval**（2025-03） | 24h ≈**850 episodes**（~42 steps/min）；人工时间 **-99%**；Pearson **0.942** | 成功判别 VLM（微调 PaliGemma）+ BC 重置策略 + **作业队列调度** |
| L2 real-to-sim | **SIMPLER**（2024-05） | **3.5k sim steps/s** @4090（~7× 真机）；r=**0.924** | GPU 仿真 + 资产制作 |
| L3 世界模型评估器 | **WorldEval**（2025-05） | 论文称优于 SIMPLER；需 Policy2Vec latent-action 条件化 | **视频生成推理** |

分布式补充：**RoboArena**（7 机构 DROID 网络、600+ 双盲对战、Elo 式聚合，比集中式更准）→ 评估基础设施走向"众包集群"。**洞察**：到 L3，"评估一个 checkpoint"="跑一批视频生成"——**评估算力第一次成为与训练算力并列的预算项**；与 [[Cloud-edge co-evolving embodied agent - a continuous-evolution framework]] 云④"下发前车队级验证门"互锁：验证门吞吐决定技能下发节奏。

### 5.2 闭环数据引擎的三类负载

数据价值 = f(下游闭环表现) ⟹ 度量一次 ≈ 至少一次（部分）训练 + 一批评估 ⟹ **"训练在环"的数据引擎**：
- **(a) 重复训练/影响估计的算力墙**：QoQ 的近似清单（层子集/排除视觉编码器/OPORP）即证据；DataMIL 被迫 surrogate loss。**规模缺口**：G2 方法全部只在 10² 条级验证，车队级（10⁶）未证——influence 类工程化到百万轨迹是开放系统问题。
- **(b) 评估吞吐的物理瓶颈**：→ §5.1 评估栈；真机评估的物理时间不可压缩，只能代理化。
- **(c) 数据引擎/飞轮的调度**：AgiBot（工厂→人工核验→GO-1 预训练）；Scanford 学术飞轮（2 周/2103 书架，VLM 32→71.8%，外部 ground-truth 零人工标注）；银河通用重生成管线（数据价值问题→仿真算力问题）。**洞察**：闭环数据引擎 = 持续训练+持续评估+筛选配比的三位一体调度，类似 RLHF infra 但多两个具身约束——评估要过物理世界（或代理），数据价值绑定本体版本。

### 5.3 数据管线基础设施

- **存储/格式**（都在 2025 快速演进）：LeRobot v2 每 episode 一文件撞文件系统极限 → **v3**（Parquet+多 episode 合并 MP4+流式，目标百万 episode/数十亿帧）；**Robo-DM**（EBML，vs RLDS 压缩 70×有损/3.5×无损，顺序解码比 LeRobot 快 **50×**；**75× 有损压缩下游不掉点**——存储-质量权衡空间巨大）。
- **视频解码主宰 I/O**：多路相机并发流；解码吞吐是训练加载一级瓶颈（Robo-DM：负载均衡解码+内存映射缓存）。
- **数据管理架构空白**：EAI-DM survey（2508.13901）——图/多模型/数据湖/向量/时序五类存储各有失格点，无现成架构满足"异步多模态流+实时+跨模态融合"；**该领域连标准 benchmark 都没有**。
- **VLM 自动标注负载**：WIYH 标注体系（标定/深度/动作/指令/CoT/mask/触觉，Datacore 云端大模型，vendor）；AutoEval 的成功判别 VLM——数采工厂的标注推理是持续性 GPU 负载。
- **具身 vs LLM 管线四点差异**：① 时序多模态 I/O（vs 文本 token）；② 质量度量过物理世界或代理（vs 一次前向打分）；③ 本体异构（动作归一化/离散化是 robotics 特有工程——Re-Mix 一手；跨本体负迁移——星海图实测）；④ 数据新鲜度与**本体演进耦合**（硬件改版→数据贬值）。

### 5.4 供给侧：为"数据验证吞吐"提速的训练管线优化

管线速度 = 验证吞吐。公开证据五层，成熟度**哑铃形**（两头有具身特有创新、中间调度层最原始）：
1. **I/O/格式层（证据最硬）**：Robo-DM 50× 解码、LeRobot v3 流式——格式层提速 1 倍 = 验证体系提速 1 倍（消融成本=单次训练×次数）。
2. **缩小 oracle**：冻结骨干+小头（[[NVIDIA - GR00T N1 An Open Foundation Model for Generalist Humanoid Robots|GR00T]] / [[Chen et al. - LaWAM Latent World Action Models for Efficient Dynamics-Aware Robot Policies|LaWAM]] / RL Tokens，vault 代码核实）→ 验证新数据只训小头；小模型代理+scaling 外推（Re-Mix 小参考模型；GO-1"可预测 scaling"暗示 scaling-law 数据决策——分析性推断）。
3. **把验证折进训练（最深）**：Recap/π0.7 全量数据带质量标签一次训完，判别器 = 训练副产品——**独立验证循环被结构性消掉**；GO-1 latent action 让无标签数据可用 = 减少验证问题发生率。
4. **仿真/评估侧吞吐**：GPU 万级并行仿真（Isaac Lab/MJX/Genesis）；Tesla 影子模式 = 车队"只评不动"零边际验证成本（业界广泛记载，本轮未回读一手）——具身车队可预期模板。
5. **编排/调度层（唯一实例 + 空档）**：**NVIDIA OSMO**（已核实，开源）——云原生编排平台，YAML 定义多阶段 Physical-AI 工作流（合成数据生成/训练/RL/仿真），带**数据谱系追踪与版本化**、CI/CD 集成（每夜回归/模型验证），内部支撑 GR00T/Isaac Lab 日均数千 GPU 时——**"数据 CI/CD"的现实雏形**；但它是通用工作流编排，"为数据验证优化的调度"——消融树并发调度、warm-start 增量训练、训练态缓存、增量式数据估值——**仍是公开空白**。
- **研究机会（分析性，对 Ethan 定位）**：把"数据验证吞吐"当一等系统指标——增量数据估值（缓存梯度/训练态做 delta 估值而非重训）、消融树共享前缀调度、验证作业与生产训练错峰。LLM infra 有雏形；具身因视频 I/O+物理评测，问题结构是新的。

### 5.5 收口：三层 × 算力形态一览

| | 采集算力 | 加工/清洗算力 | 质量判别算力 | 验证/评估算力 |
|---|---|---|---|---|
| **顶层** | 低（人力主导） | 低 | 人工核验→VLM 化；Recap 裁判推理 | **最贵**：真机队列（AutoEval 42 steps/min）→代理化 |
| **中层** | **生成即算力**（物理仿真/世界模型推理；rev 触发突发重生成） | 低（自带标签） | 近免费（引擎自判）+ 管线校准 | 仿真自闭环最快（3.5k steps/s） |
| **底层** | 低（穿戴设备/爬取） | **最重**：批推理筛除 96%+、latent action/retargeting/标注 | VLM 批推理 | 聚合级训练消融（低频） |

一句话：**顶层贵在评估，中层贵在生成，底层贵在清洗——三层的算力瓶颈各在管线的不同段**，这是"统一数据引擎"必须容纳的第二个异构性（第一个是质量度量异构，§4.4）。

---

## Sources（按主题分组；arXiv ID 与论文名配对由提取管线 URL 集合+日期匹配确定；2026-07-07 定点核实项已标注）

- **UMI 类**：UMI [arXiv:2402.10329](https://arxiv.org/abs/2402.10329) · FastUMI-100K [arXiv:2510.08022](https://arxiv.org/abs/2510.08022) · DexUMI [arXiv:2505.21864](https://arxiv.org/abs/2505.21864)
- **遥操数据集与硬件**：DROID [arXiv:2403.12945](https://arxiv.org/abs/2403.12945) · AgiBot World [arXiv:2503.06669](https://arxiv.org/abs/2503.06669) · RoboMIND [arXiv:2412.13877](https://arxiv.org/abs/2412.13877)（RSS 2025）· Open X-Embodiment [arXiv:2310.08864](https://arxiv.org/abs/2310.08864) · ALOHA 2 [arXiv:2405.02292](https://arxiv.org/abs/2405.02292) · GELLO [arXiv:2309.13037](https://arxiv.org/html/2309.13037v2) · Figure Helix（[官方博客](https://www.figure.ai/news/helix)）· Unitree UnifoLM-WBT（[B站发布](https://www.bilibili.com/video/BV14cXPBXEfC/)，HF: unitreerobotics）
- **质量评估**：DemInf [arXiv:2502.08623](https://arxiv.org/abs/2502.08623) · CUPID [arXiv:2506.19121](https://arxiv.org/abs/2506.19121) · QoQ [arXiv:2603.09056](https://arxiv.org/abs/2603.09056) · DataMIL [arXiv:2505.09603](https://arxiv.org/abs/2505.09603) · Re-Mix [arXiv:2408.14037](https://arxiv.org/abs/2408.14037) · RINSE [arXiv:2604.23000](https://arxiv.org/abs/2604.23000) · robomimic 演示质量研究 [arXiv:2108.03298](https://arxiv.org/abs/2108.03298)
- **评估基础设施**：AutoEval [arXiv:2503.24278](https://arxiv.org/abs/2503.24278) · SIMPLER [arXiv:2405.05941](https://arxiv.org/abs/2405.05941) · RoboArena [arXiv:2506.18123](https://arxiv.org/abs/2506.18123) · WorldEval [arXiv:2505.19017](https://arxiv.org/abs/2505.19017)
- **中层合成与 sim-to-real 趋势（2026-07 补源）**：GraspVLA/SynGrasp-1B [arXiv:2505.03233](https://arxiv.org/abs/2505.03233)（CoRL 2025）· DreamGen [arXiv:2505.12705](https://arxiv.org/html/2505.12705v1) · Real-is-Sim [arXiv:2504.03597](https://arxiv.org/abs/2504.03597) · D-REX [arXiv:2603.01151](https://arxiv.org/pdf/2603.01151) · GS-Playground [arXiv:2604.25459](https://arxiv.org/pdf/2604.25459) · GS 软体评估 [arXiv:2511.04665](https://arxiv.org/pdf/2511.04665) · [NVIDIA R²D² 世界基础模型工作流](https://www.edge-ai-vision.com/2025/08/r%C2%B2d%C2%B2-boost-robot-training-with-world-foundation-models-and-workflows-from-nvidia-research/)
- **数据基础设施**：Robo-DM [arXiv:2505.15558](https://arxiv.org/abs/2505.15558) · LeRobotDataset v3 [HF blog](https://huggingface.co/blog/lerobot-datasets-v3) · EAI 数据管理综述 [arXiv:2508.13901](https://arxiv.org/abs/2508.13901) · Robot-Powered Data Flywheel (Scanford) [arXiv:2511.19647](https://arxiv.org/abs/2511.19647) · NVIDIA OSMO（[开源 repo](https://github.com/NVIDIA/OSMO) · [官方文档](https://developer.nvidia.com/osmo)）
- **中国公司动向（secondary）**：星海图 GOD（[极客公园 2025-08](https://www.geekpark.net/news/358631)）· 星海图数据金字塔/B+轮（[品玩 2026-04](https://www.pingwest.com/a/306757)）· 它石智航 WIYH（[36Kr 2025-12](https://eu.36kr.com/zh/p/3749019152548360)）· 遥操/UMI/视频学习成本对比（[机器人大讲堂 2025-10](https://www.leaderobot.com/news/6463)）· 银河通用 GraspVLA（[国投基金 2025-01](http://www.ciifund.cn/zwt/hydt/202501/9b28f75924a44492819a7cde3fa13b53.shtml)）· AgiBot World 开源快讯（[TechNode 2024-12](https://cn.technode.com/post/2025-01-01/agibot-world/)）· 三层数据金字塔与数据服务市场（[数智前线 via 36Kr 2026-05](https://eu.36kr.com/zh/p/3804813317431044)：真机售价 500–1000 元/小时（姚卯青）、底层工厂视频可用率 ~3% / Ego 12 万→≤5000h（李永露）、64 座数采中心）

## Related

- [[Cloud-edge co-evolving embodied agent - a continuous-evolution framework]] — 云③ 技能工厂（teleop 示范源）/云④ 验证门的上游；评估栈吞吐 ↔ 下发节奏互锁
- [[Future embodied Agent framework - integrated view]] — 数据/评估是其"how（持续演进）"切面的物质基础
- [[World model trends - architecture, scale, function, hardware]] — 中层"双引擎"的世界模型侧
- [[AgiBot 智元]] · [[Galaxea 星海图]] · [[Galbot 银河通用]] · [[TARS 它石智航]] · [[Physical Intelligence (π)]] · [[NVIDIA]]
- [[AgiBot - GO-1 ViLLA Generalist Embodied Foundation Model|GO-1]] · [[Galaxea - G0 Dual-System VLA Model|G0]] — 两个顶层数据集的下游模型
- [[Bi et al. - Motus A Unified Latent Action World Model|Motus]] — 六层数据金字塔（三层框架的学术精细版）
- 未来页：[[Robot data engine]]（数据引擎证据继续累积后可独立成 concept 页）

## tags

#synthesis #embodied-ai #data-pyramid #data-collection #teleoperation #umi #synthetic-data #sim-to-real #data-quality #data-engine #evaluation-infrastructure #computing-systems
