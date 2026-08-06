# Real-robot evaluation

> 真机评测作为**测量学**：任务集怎么张成、配置怎么控制、分数怎么打、结论有没有统计功效。回答并沉淀 Ethan 的真机评测系列问题（2026-08-06）。

**⚠️ 核实状态**：本页外部 benchmark 的任务清单、协议细节与数字（RoboDojo / ATOM-Bench / PhAIL / NVIDIA RoboLab）**均来自 WebFetch 摘要器，未对照原文逐条核实**。框架、判据与推理是本库自有综合，可直接用；**具体数字引用前请回读原文**。

## 与 [[Robot data engine]] 的边界

两页讲的是同一个东西的两面，不要混：

| | [[Robot data engine]] | 本页 |
|---|---|---|
| 评测的角色 | **被调用的金标准** | **被设计的测量仪器** |
| 关心 | 怎么少调用它（代理层级 L0–L3、缓存一致性、吞吐） | 调用一次能买到多少信息（任务覆盖、样本量、指标信息密度） |
| 目标函数 | 最小化顶层金标准调用次数 | 最大化单次调用的信息产出 |

这是同一个优化问题的两项。[[Real-robot data collection - teleop vs UMI-class, and the model-in-the-loop quality problem|数据金字塔那页]] §5.1 的 L0–L3 评估栈属于前者；**本页不重复它**。

## 核心矛盾：可比 vs 可信

- **仿真可比不可信**：LIBERO / SimplerEnv / RoboCasa / RoboTwin 有公共榜，跨论文数字可比，但 sim gap 未知。
- **真机可信不可比**：本体、夹爪、相机位、桌面材质、光照全不同，跨实验室数字物理上不可比。真机结果在论文里的真实功能只有一个——**同一台机器人、同一周、同一套初始布局下的自家 A/B**。

中间的 real-to-sim（SIMPLER 报 r=0.924）与分布式众包（RoboArena 双盲 Elo）都是在桥这个缺口。**真机公共榜大概率永远不会出现**；能出现的只有「协议标准化 + 相关性校准 + 相对排名」。

## 三个子问题

Ethan 的分法，本页沿用：

1. **跑哪些任务** — 任务集怎么张成能力空间（本页主体）
2. **任务配置是什么样的** — 初始状态控制、可复现性、硬件状态漂移（⚠️ 尚未展开）
3. **评测怎么打分** — 指标层级、验收判据、统计检验（本页只给了指标分层骨架，详细待补）

---

## 判据一：任务 vs 条件

> **一个任务值不值得占评测位，看它能不能暴露别的任务暴露不了的失败模式。只换物体、只换位置、只换措辞的，是 condition；换失败模式的，才是 task。**

为什么这条判据是硬的：真机评测的总预算是**不可压缩的物理时间**，被切成 `任务数 × 条件数 × trial 数`，三者竞争同一份预算。把一个 condition 误当 task，等于白白把统计功效除以一个数。

推论（成本结构不对称）：

- **运动轴**每加一条要买物料、搭场景、采数据、调难度 → **线性人力成本** → 极度吝啬
- **指令轴 / 泛化轴 / 扰动轴**只改 prompt 和摆放 → **近零边际成本** → 极度慷慨

这与 [[Embodied model function evolution - generalization as the master line]] 的「线性人力成本 → 亚线性」主线是同一个结构：**评测集也有它的数据引擎问题**。

## 判据二：复位成本是与能力覆盖正交的第二维

真机评测最大的隐性成本不是 rollout，是**复位**（摆物体、恢复初始布局）。AutoEval 专门训一个 BC 复位策略就是在解这个。

于是任务集设计是**二维选择**：

|  | 低复位成本 | 高复位成本 |
|---|---|---|
| **角色** | 高精度回归探针（n 可达数百） | 低精度能力覆盖（n 只能几十） |
| **例** | 抽屉开合（自复位）、扶正瓶子 | 折毛巾、装袋、倒液体 |
| **配套指标** | 连续量 + 配对检验 | 二元/分段，只看大效应 |

**两类任务承担不同角色，不该用同一个 n 和同一套指标去要求。** 理想配置是「少数自复位任务当探针 + 若干高成本任务当覆盖」。

自复位任务的判据：**任务的终态可以由任务本身的逆操作回到初态**（开→关、放入→取出、堆叠→拆解）。这类任务能无人值守连续跑，是唯一能便宜拿到大 n 的真机任务，直接缓解下面的统计功效问题。

## 判据三：难度必须校准到 40–70%

RoboDojo 真机榜上 π0.5 总成功率 **12.8%，人类 100%**（⚠️ 未核实）。如果自建任务上模型做到 85%，说明任务简单一个量级，**测不出任何后续改动**。

- 太高 → 天花板效应，改进测不出来
- 太低 → 地板效应，退化也测不出来（[[Heravi et al. - LEACL LLM-Enhanced Automatic Curriculum Learning for RL in Long-Horizon Manipulation|LEACL]] 里「5 个任务 3 个全 0」是教科书案例：任何方法对比在全 0 上都是零信息）

**每个任务必须留难度旋钮，先把基线模型校到 40–70% 再开始正式评测。** 校准需要一条 human baseline（人类遥操跑 20 次），它同时是判断「任务设计有没有硬件层面问题」的唯一客观尺子。

---

## 能力轴

### 运动轴（用**任务**实现）

按「质变点 = 什么一变原 policy 就失效」划分，不按物体划：

| # | 轴 | 质变点 | RoboDojo 对应（⚠️ 未核实） |
|---|---|---|---|
| 1 | 抓取-放置 | 基线 | put_objects_into_basket |
| 2 | 精密对位 / 插入 | 容差 < 抓取重复精度 | insert_charger, insert_tubes, cap_pen, fill_pen_holder, hang_mugs |
| 3 | 非抓握操作 | 夹爪闭合解决不了 | stand_up_bottles, sweep_blocks |
| 4 | 接触丰富 / 力调制 | 要维持接触力而非到达位姿 | （RoboDojo 亦偏弱） |
| 5 | 铰接物体 | 运动被约束流形限制 | store_in_safe |
| 6 | 可变形物体 | 状态无法用 6D pose 表示 | make_bread |
| 7 | 双臂-顺序（交接） | 中间位姿须落在对侧工作空间 | — |
| 8 | 双臂-同步（闭链） | 两臂必须同时协调，**不可顺序化** | pack_and_pour_fruit |

**轴 5 与轴 8 同属闭链问题**（前者臂-环境闭链，后者臂-臂闭链），能力上连续——铰接任务是双臂同步的单臂预演。

**约束流形是轴 5/8 的共同核心**：末端被锁在低维流形上后，垂直于流形的误差不再被容差吸收，而是**转换成内力**——憋停、滑脱、或触发力矩保护。自由空间里 1cm 误差还能抓到，约束流形上 1cm 误差直接失败。这是一整类自由空间任务覆盖不到的失败模式。

### 指令轴（用**条件**实现，挂在已有任务上）

来自 NVIDIA RoboLab 三分法 + ATOM-Bench 的 instruction atoms（⚠️ 未核实）：

- **视觉 grounding**：颜色 / 大小 / 类别选择
- **空间关系**：「放到碗的左边」
- **计数 / 逻辑**：「把**所有**倒下的瓶子扶正」「拿红瓶**或**蓝瓶」
- **开放词表**：未见过的物体名
- **措辞鲁棒性三档**：模糊 / 默认 / 详细。RoboLab 的发现是**模糊必挂，过详细也退化**

### 结构轴（串联已有任务即可，不需新资产）

- **长程**：≥4 个语义不同的子任务串联。RoboLab 报告**没有任何 policy 能连做超过 4 个复杂子步骤**
- **组合泛化**：原子单独训过、组合没训过 → 直接测 ATOM-Bench 式的 Compositional Failure Share
- **记忆**：最便宜的实现是**遮挡/覆盖**（RoboDojo 的 `cover_blocks` / `stack_and_cover_blocks`——盖住后要记得下面是什么），不需要多房间导航
- **扰动恢复**：执行中途人手移开目标物 10cm。**不占任务位、不需新资产、每次只多两秒**，但直击所有开环 chunk 预测模型的共同软肋

### 泛化轴（条件，不是任务）

未见实例 / 未见位置 / 干扰物 / 光照 / 背景。挂在回归底座任务上。

---

## 统计现实

⚠️ 以下数字来自 NVIDIA RoboLab 博客与 PhAIL 摘要，未核实。

**行业现状**：2023–2025 VLA 论文每 condition 的众数是 **10–20 次 rollout，不报置信区间、不做配对检验**。本库内部证据一致：[[Wang et al. - Omega-QVLA Robust Quantization for Vision-Language-Action Models via Composite Rotation and Per-step Scaling|Ω-QVLA]] 真机 10 rollouts、[[Galaxea - G0.5 Autoregressive VLM-as-Actor VLA|G0.5]] 长程 n=5。

**Clopper-Pearson 精确二项区间**（观测成功率 90%）：

| rollouts | 95% CI |
|---|---|
| 10 | 约 ±30pp（p≈0.5 时；无分辨率） |
| 70 | 80.5% – 95.9% |
| 1030 | 88.0% – 91.8% |

**CI 从 ±10pp 收窄到 ±2pp 需要约 15× 的 rollouts。**

**结论**：绝大多数「我方比 baseline 高 5 个点」的真机结论在统计上与抛硬币无法区分。Tedrake 关于「很多机器人论文在测统计噪声」的批评是准确的，不是夸张。

**二元化的信息代价**：一次 rollout 花掉 1–3 分钟不可压缩的物理时间，二元成功率只带回 **1 bit**。在 n 被物理时间钉死的前提下，把观测从 1 bit 换成一个实数，等价于免费拿到数倍有效样本量。**这才是用连续指标的理由——不是因为某个连续量本身重要。**

---

## 指标分层

用户的正确质疑：平滑度（SPARC）不是任务指标，「差多少不可接受」的阈值定不出来。答案不是弃用连续指标，而是**只有验收指标需要绝对阈值**：

| 层 | 回答 | 需要绝对阈值 | 阈值来源 | 样本量 |
|---|---|---|---|---|
| **验收** | 够不够好，能不能发 | **是** | 业务后果 | 大，只在最终候选上跑 |
| **检测 / 筛选** | 哪个配置退化最小、有没有变 | 否（只需序关系 + 配对显著性） | — | 小 |
| **诊断** | 坏在哪 | 否 | — | 小 |
| **硬约束** | 有没有越界 | 是 | **本体规格书 / 安全标准** | 每次 |

**关键**：回归测试（量化、蒸馏、加速）里你**有 FP16 基线**，所以检测层不需要阈值——同初始布局配对跑，比较配对差值分布即可。「退化多少算多」被换成「分布有没有显著偏移、谁偏移最小」，后者有标准答案。

验收层仍由**成功率的非劣性检验**承担（δ 有业务含义：「每 20 次多失败 1 次能不能接受」）。平滑度只在对应物理约束时才是验收指标（jerk 上限 → 减速器寿命 / 人机协作冲击），而**那个阈值来自规格书，不来自评测设计**。

### 平滑度的方向性漏洞

> **什么都不做是最平滑的。**

一个退化成畏缩、迟疑、末端小幅漂移然后超时的 policy，SPARC 可能**比基线更好**；平滑地走向错误物体同样满分。所以 SPARC **必须只在成功的 rollout 上计算**，否则畏缩型退化会污染它。

这正是本库给 [[Guo et al. - NeuroVLA Brain-inspired Neuromorphic Cortex-Cerebellum-Spinal VLA|NeuroVLA]] 打 ⚠️ 的原因：它把 jerk −75.6% 当**主证据**，等于把诊断量提拔成了能力声明。

### 更好的一等连续指标：time-to-success

PhAIL（⚠️ 未核实）把 **time-to-success CDF** 当评测原语。关键性质：

> **成功率 = time-to-success CDF 在 timeout 处的取值。** 失败即右删失样本，CDF 停在 1.0 以下的高度就是成功率本身。

所以 CDF **完整包含成功率，外加速度分布**——是严格的信息增益，不是代理替换，**没有「代理指标对不对应任务」的问题**。PhAIL 声称在 **N ≤ 30 rollouts / (模型, 物体) 格**上就能分辨传统指标分不开的系统（bootstrap CI + KS 检验），并用 Human-Relative Throughput 做跨任务聚合。

[[Physical Intelligence - pi0.6 a VLA That Learns From Experience|π*₀.6]] 报的 throughput >2× / failure rate −50% 是同一族指标的工业版本。

### 量化评测的特例

[[Xu et al. - QVLA Not All Channels Are Equal in Vision-Language-Action Models Quantization|QVLA]] 已指出：VLA 量化的特征失败模式是**长程误差累积，而聚合成功率恰恰掩盖它**。1-stage 任务在结构上就没给退化提供显现空间。

[[Wang et al. - Omega-QVLA Robust Quantization for Vision-Language-Action Models via Composite Rotation and Per-step Scaling|Ω-QVLA]] 是现成教训：真机 progress score 49.6 → 51.0 在噪声内，但「轨迹更平滑」的定性判断反而更可信。**量化评测该测轨迹质量与完成时间，不该只测成功率**——详见 [[VLA quantization]]。

---

## 外部框架对照（⚠️ 均未核实）

| 框架 | 切法 | 可借鉴的 |
|---|---|---|
| **RoboDojo** (arXiv 2607.04434) | 五维：Generalization / Memory / Precision / Long-Horizon / Open-vocab；42 sim + 18 real，三个双臂平台 | **协议**：每任务 10 trials、**回放预采集布局 + 半透明叠加对齐**、**三人双盲独立打分**、计入子步骤部分完成 |
| **ATOM-Bench** (arXiv 2606.16826, BAAI×北大) | **motor atoms × instruction atoms 两个正交因子**；30 原子 + 24 留出组合；**单臂/双臂配对赛道**；2700 真机 rollout | **最干净的切法**；AS / CFS 两指标把「原子不行」和「组合不行」分开归因 |
| **NVIDIA RoboLab** | 三 competency：Visual / Procedural / Relational | 措辞三档鲁棒性测试；建议目标 ~1000 rollouts |
| **PhAIL** (arXiv 2605.29710) | 分布式方法学，Franka FR3 | time-to-success CDF + HRT + KS 检验 |
| **RoboArena** (arXiv 2506.18123) | 7 机构众包、600+ 双盲对战、Elo 聚合 | 承认跨本体不可比，改用**相对排名** |

## 与本库既有论点的关系

- **ATOM-Bench 的核心发现**：**强原子技能不可靠地迁移到留出的组合任务**。这是从真机侧给 [[Task Decomposition as OOD Mitigation]] 的**第二个反证**——LEACL 给的是「拆解不解决探索」，这条给的是「原子会了不等于组合会」。该页现有的修正（拆解解决长度/信用分配，不自动解决探索）应再加一句：**也不自动解决组合**。⚠️ 待回读原文后回填。
- **capability vs dependability**：[[Home robot architecture - a hierarchical embodied agent]] 指出的 gap，在评测侧对应一个几乎空白的象限——见下。
- **验证门吞吐**：[[Cloud-edge co-evolving embodied agent - a continuous-evolution framework|云④下发前车队级验证门]] 的节奏由评测吞吐决定。

## 开放问题

1. **部署门禁评测几乎空白。** 学术评测问「多强」（均值成功率），部署门禁问「能不能放出去」（**尾部风险**：最坏情况、失败模式分布、有没有新增危险行为）。当前所有评测基建（含 L0–L3 栈）都在优化**吞吐**，没有一个在优化**尾部覆盖**。均值成功率再准也不告诉你「这个新技能会不会偶尔把刀甩出去」。
2. **硬件状态漂移**是真机独有的基线污染源（滑轨磨损、夹爪胶垫老化、相机位微移）。仿真里不存在，目前没有标准做法——只能定期用脚本轨迹或人类遥操重测基线。
3. **子问题 2（任务配置 / 初始状态可复现性）尚未展开**，而上面所有配对统计都建立在它之上。

## Related

- [[Robot data engine]] — 评测作为金标准的一面（代理层级、调度目标）
- [[Real-robot data collection - teleop vs UMI-class, and the model-in-the-loop quality problem]] — L0–L3 评估栈的出处
- [[Real-robot eval bench - task suite design and setup checklist]] — 本页框架在具体机械臂平台上的落地清单（团队专属，有时效）
- [[VLA quantization]] — 量化评测该测什么
- [[Task Decomposition as OOD Mitigation]] — 组合泛化的真机侧反证
- [[Home robot architecture - a hierarchical embodied agent]] — capability vs dependability
- [[Embodied Brain Models]] · [[Embodied Cerebellum Models]] — 被评测的对象
