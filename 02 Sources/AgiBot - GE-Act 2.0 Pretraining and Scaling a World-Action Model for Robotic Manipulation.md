# AgiBot - GE-Act 2.0: Pretraining and Scaling a World-Action Model for Robotic Manipulation

## Metadata
- **Type**: source note
- **Format**: arXiv preprint (cs.RO), **v1 2026-09-04**；CC BY 4.0；项目页 https://ge-act-v2.github.io/；HF Daily Paper 59 upvotes（2026-09-21 查）
- **Authors**: **AgiBot Research Team**（团队署名）；核心贡献者 Renhang Liu, Wenzhi Zhao, Zhuo Yang, Liliang Chen, Pengfei Zhou, Shengcong Chen, Guanghui Ren
- **Organization**: [[AgiBot 智元]]
- **arXiv**: [2609.05588](https://arxiv.org/abs/2609.05588)
- **Code / weights**（2026-09-21 核实）: ⚠️ **均未发布**。项目页写 "Code · Coming soon"；HF paper 页无 GitHub 链接；GitHub 只有前作 `AgibotTech/Genie-Envisioner-V1`（583 stars）与 `AgibotTech/GE-Sim-V2`（150 stars，Apache-2.0）。**本笔记全部数字来自论文自报，无法复现。**
- **Raw tier**: URL-only（PDF 6.9 MB 临时自读后清理；arXiv HTML 正文亦读）
- **Verification status**: 三部件机制 / validity gap 与 KASO 算法 / 表 1（表征探针）/ 表 2（KASO 真机消融）/ scaling 四档数字 / 指令接地 295 次 / 附录 A 三个仿真表 / 附录 B 架构与部署参数 **PDF + HTML 自读核实**；**图 7 数据配比的具体百分比在图内、文本层抽不出，未核实**；**三种本体（G1-OP / G2-OP / G2-90D）的硬件规格论文未写**；前作 GE-Act 1.0 本库无源笔记，二者关系只引论文自述
- **Related**: [[World-Action Models]], [[AgiBot - GO-1 ViLLA Generalist Embodied Foundation Model]], [[Chen et al. - LaWAM Latent World Action Models for Efficient Dynamics-Aware Robot Policies]], [[BeingBeyond - Being-H0.7 a Latent World-Action Model from Egocentric Videos]], [[GigaWorld Team - GigaWorld-Policy An Efficient Action-Centered World-Action Model]], [[Bi et al. - Motus A Unified Latent Action World Model]], [[Robot data engine]], [[Real-robot data collection - teleop vs UMI-class, and the model-in-the-loop quality problem]], [[Embodied Brain Models]], [[Real-robot evaluation]]
- **Tags**: #wam #world-action-model #pretraining #scaling #inverse-dynamics #single-step-generation #meanflow #validity-gap #kaso #control-oriented-autoencoder #zero-shot-ood #agibot #china

## Summary

**核心问题**：现有 WAM 都继承一个预训练视频生成器，再花力气把它和动作模型接起来；**WAM 作为一个整体如何预训练、随操控数据如何 scale**，此前没人系统做过。GE-Act 2.0 把 WAM 拆成三个**可分别预训练**的部件——控制导向自编码器 **CoAE**、单步视觉规划器 **SVP**、逆动力学模型 **IDM**——再用一个新的对齐目标 **KASO** 接起来，所有生成与动作部件**从零在操控数据上训**（唯一外来的是冻结的 Qwen3.5-2B 做指令理解）。

**核心结果**：真机 **100 个原子任务 × 20 技能组 × 2 本体**，测试场景 / 背景 / 光照 / 物体实例全部 OOD，**不做任何任务 SFT**，协同训练数据从 300 到 30,000 小时，G1-OP 成功率 **17.1 → 44.1%**，G2-90D **13.4 → 31.1%**，5,000 → 30,000 小时段无饱和迹象；技能组训练时长与成功率 **Pearson 0.80 / Spearman 0.85**。

> **本库定位一句话**：[[World-Action Models]] 五代谱系里**第二代 Two-Stage 的回归与修复**——用**单步生成**修掉"推理时先生成视频太慢"，用 **KASO** 修掉"生成的未来与记录的动作错配"；同时是这条线上**第一篇从零预训练 + 数据 scaling** 的工作。⚠️ 代码权重未发布。

## 三个部件

### CoAE：控制导向自编码器

- 逐帧 2D 自编码器，**64× 空间下采样、512 通道**：256×384 一帧 → 4×6 = **24 个 token**（标准视频 VAE 8× 或 16× 下采样的 1/16）。从 128 通道的 DC-AE 迁移兼容权重初始化。
- 训练目标 = 像素 / LPIPS / 对抗重建 + **对齐三个冻结教师**的末层特征：Qwen3.5 用的 SigLIP 2（语言对齐语义）、V-JEPA 2.1（时空结构）、DINOv3（稠密特征）。
- **探针**（表 1，五个冻结表征、同一两层探针）：动作恢复 MAE **0.01673**，只比 DINOv3 0.01273 / V-JEPA 2.1 0.01487 差 13–31%，但 token 数是它们的 1/16；同为 64× 下采样的 DC-AE 差 54%，SigLIP 差 88%。指令匹配错误率 **2.05%**，五者最低（DC-AE 2.71、DINOv3 2.75、SigLIP 3.28、V-JEPA 4.15）。CoAE 与 DC-AE 是唯二保留像素解码器的。
- 作者归因：**操控域训练 + 多教师对齐**，而非压缩率本身（DC-AE 同压缩率两项都更差）。

### SVP：单步视觉规划器

- **2.51B** 多视角 DiT（36 块 × 宽 2048：20 共享块 + 8 块均速头 + 8 块瞬时速度头），沿用 GE-Act 1.0 的"逐视角时空处理 + 周期性跨视角注意力"模式；每视角输入 1 条件帧 + 6 预测帧。
- **条件**：冻结 **Qwen3.5-2B** 联合读当前头视角图 + 指令，取**所有 25 层的文本段隐态**经输入相关门控融合，每个 DiT 块交叉注意。只传文本段（序列保持文本长度），但已被图像上下文化 ⇒ "放到红碗后面"这类指代在 VLM 里解析，DiT 只管"接地后的场景怎么演化"。**IDM 收不到语言**，语言只经生成的未来影响动作。
- **多尺度时间**（沿用 Act2Goal）：动作执行时域内均匀取**稠密帧**，其余到片段末尾取**稀疏帧**（默认 30 Hz，样本带 52 个稠密动作 + 2 个稀疏动作）。稠密管精细动力学，稀疏管任务意图。
- **Conditional MeanFlow 单步生成**：学平均速度场，一次前向从噪声到完整未来 latent；观测帧作条件坐标保持干净、速度为零，通过掩码保证导数一致；一个 JVP 算复合预测。作者称**首个从随机初始化在操控视频上预训练的原生单步机器人世界模型**。
- **单步为什么关键**：多步生成器要让动作梯度回传到生成器，必须保留并微分整条去噪链，代价太大 ⇒ VPP / DreamZero / GE-Act 1.0 都改从生成器**中间态**预测动作，动作部件被绑死在生成器上，**IDM 无法单独预训练**。单步生成给出一个**可微的完整未来**，IDM 可以先在录制轨迹上单独训，再接上 SVP 端到端协同。

### IDM：逆动力学模型

- **0.56B**，28 块 × 宽 1152，对动作 token 自注意、对当前 + 预测 latent 交叉注意；流匹配出**稠密动作块 + 稀疏远期动作**（后者仅训练辅助）；动作 32 维关节空间跨本体零填充，本体嵌入经 AdaLN 进入。
- **数据面**：可吃**无指令、无成功标注**的轨迹——自由探索、**失败尝试、部署 rollout**。VLA 与多数 WAM 的模仿目标用不上这类数据。这是本篇对 [[Robot data engine]] 问题的架构答案。

## Validity gap 与 KASO

### 问题

IDM 单独预训练时吃**录制的**未来帧，与记录的动作天然配套。协同训练时改吃 **SVP 生成的**未来，目标仍是记录的动作。操控多模态（左抓 / 右抓、现在抓 / 稍后抓、多个物体都满足指令），演示只记录了一种做法，SVP 随机采样可能生成另一种**同样正确**的做法 ⇒ IDM 看到"从右抓"的画面、被要求预测"从左抓"的动作。**监督错配，尽管画面与动作各自都对。** 作者命名 **validity gap**，并指出它与生成质量无关：生成器再准，采出的模态也不会自动和记录动作对齐（数据给的是联合样本，生成配对是两个条件边缘的乘积）。反复错配会把动作多模态**平均掉**。

**玩具实验**（四个视频模态 → 两个动作模态）：Decoupled 保四视频模态但动作弥散；E2E 两者全塌；E2E + 预训练损失保视频模态但动作塌到两模态均值零点；**只有 KASO 同时保住四视频模态与两动作模态**。

### 方法（每个训练步）

1. **采样**：SVP 对同一上下文采 **K = 8** 个候选未来，无梯度，**保留每个候选的生成噪声**。
2. **打分**：用**当前 IDM** 在**高噪声点**分别读记录未来与每个候选未来，算出的速度差异（只在稠密 token 上平均）= 候选能量。
3. **选择**：取能量最低的 **1** 个。
4. **回放**：单步生成是噪声 → 画面的确定性映射，用保留的噪声开梯度重生成，画面与打分时**完全一致**；动作损失穿过生成画面**同时更新 IDM 与 SVP**。
5. **保留预训练损失**：SVP 的视频损失 + IDM 在真实帧上的动作损失继续算（防端到端目标冲掉预训练能力，类比 VLA 训练保留 VLM 目标）。

选择**每步在线重算**，跟着两个模型变；依赖 SVP 的随机性（候选无多样性就没得选）。与"先生成一批合成数据再离线过滤"的数据策展路线区别在此。

### 两个设计细节

- **为什么在动作空间比**：两段未来可能画面差很多但动作相同（只有背景在动），反过来画面很像的未来可能属于另一模态。要的是**行为兼容**，不是视觉相似。
- **为什么在高噪声点打分**：噪声低时速度几乎能从带噪动作本身推出、几乎不看画面，所有候选得分接近；噪声高时带噪动作不含信息，速度只能从画面推，此时差异才等于"IDM 从两段画面读出的动作差"。

### 真机受控消融（表 2）

同样的全量预训练部件（SVP 39,000 h、IDM 32,000 h），**只在 300 小时上做对齐**（含 30 h G2-90D），评测 G2-90D，无评测专属 SFT：

| | 单物体抓取（25 次） | 四物体跟随分数 | 四物体抓取成功（宏平均） |
|---|---|---|---|
| E2E | 12 | 87.5 | 27.5 |
| E2E + 预训练损失 | 12 | 95 | 22.5 |
| **KASO** | **40** | **95** | **37.5** |

⇒ 涨幅来自**选择**本身（E2E+PT 与 KASO 跟随分数相同，抓取成功差 15 点）；保留预训练损失单独几乎不涨抓取成功。作者明说这是 300 h 对齐阶段的对照，**不是**最终模型性能。

## 训练数据

三阶段三套配比：**SVP 预训练 39,000 h**（指令-视频，可含**无动作标签**的操控录像与第一视角人类视频）、**IDM 预训练 32,000 h**（动作标注轨迹，含演示、**失败轨迹、部署数据**）、**KASO 协同 30,000 h**（指令-视频-动作）。来源：G1-OP、G2-OP、G2-90D 三本体、仿真、开源数据集、第一视角 / 人类操控视频、rollout 与失败数据。G1-OP 占协同数据 **>50%**，G2-90D **<2%**。

> ⚠️ 图 7 饼图里各来源的小时数与百分比在图内，文本层抽不出；**第一视角视频与失败数据各占多少未核实**。三种本体的硬件规格论文未写，只知 G2-90D 夹爪更宽（Shake/Stir 任务上反超 G1-OP 归因于此）。

## Results

### 真机零样本 OOD scaling（100 任务 × 20 技能组 × 10 次/任务）

协议：checkpoint **不做评测任务微调、不给演示、不按任务选 checkpoint**；测试场景 / 背景 / 光照 / 物体实例**排除在预训练与协同训练之外**；每档一个 checkpoint 固定部署设置跑完全套。四档嵌套数据池 300 / 1,200 / 5,000 / 30,000 h，配比尽量一致，**训到一个 epoch 或算力上限为止 ⇒ 作者自陈是端到端 scaling 对比，不是等算力隔离**。

| 协同数据 | 300 h | 1,200 h | 5,000 h | 30,000 h | 总涨 |
|---|---|---|---|---|---|
| **G1-OP**（>50% 数据） | 17.1 | 22.6 | 27.3 | **44.1** | +27.0 |
| **G2-90D**（<2% 数据） | 13.4 | 21.0 | 23.5 | **31.1** | +17.7 |

- 19/20（G1-OP）与 18/20（G2-90D）技能组在 30,000 h 优于 300 h；非零成功率任务数 G1-OP 39 → 76、G2-90D 24 → 72；87/100 与 78/100 条任务轨迹非递减。**⚠️ 30,000 h 后 G1-OP 仍有 24 个任务成功率为零**，绝对值 44% 不高。
- **数据稀缺本体**：G2-90D 20 个技能组里 10 组本体专属数据 <5 h、6 组 <2 h、4 组 <1 h；<2 h 的 6 组里 5 组从 0 涨到非零；Flip / Separate 分别用 1.2 h / 1.25 h 本体数据达 20.0% / 16.7%，Pass 用 3.9 h 达 34.0% ⇒ 跨本体迁移有用。
- **技能覆盖 ↔ 成功率**（19 组，排除机械上平凡的 Close）：**Pearson r = 0.80，Spearman ρ = 0.85**，拟合 **每十倍数据 +1.94 logit**。Wipe vs Sweep 动作相近成功率差很多，Stack / Pass / Straighten 难但随数据涌现——作者用覆盖差解释，而非动作难度。

### 指令接地（295 次真机，G1-OP 30,000 h 模型）

限定 pick / place 两个最熟的原语，六个维度各设受控场景（多个动作视觉上可行、只有指令指定的正确）。**跟随分数**（只碰指定物 / 只碰指定容器）与**成功率**分开报，差值 = 接地对了但执行失败。

| 维度 | 物体 | 颜色 | 位置 | 形状 | 尺寸 | **顺序** |
|---|---|---|---|---|---|---|
| Pick / Place 跟随分数 % | ≥90 | ≥90 | ≥90 | ≥90 | 82.5 / 65.7 | **13.3 / 26.7** |

总跟随分数 83.1%，总成功率 72.9%。作者把这个长尾对应到训练语料与 RefCOCOg 里指代表达的频率：物体、颜色是头部，位置中间，尺寸、形状、顺序稀少，GE 语料的尾部更长。**顺序（"左数第二个"）是主要短板。**

**冲突压力测试**（定性）：目标从 A 切到 B 再到 C、每次都在末端已接近前一目标时切换 ⇒ 短暂残余运动后重定向并最终抓 C；右臂已到绿杯时改令左臂抓橙杯 ⇒ 右臂脱离、左臂完成。作者提到早期弱模型有"末端一旦接近某物就继续抓它"的**状态-动作惯性**，本版能被指令覆盖。

### 仿真（先在各 benchmark 域内数据上 SFT，再测 OOD；作者自陈只作横向参考）

| Benchmark | GE-Act 2.0 | 最强基线 | 备注 |
|---|---|---|---|
| **RoboTwin Clean-to-Random**（Easy 训，测 5 种 shift） | Hard **60.52**；6 条件领先 5 | π0.5 Hard 47.90 | Easy→Hard 只掉 16.2 点（π0.5 掉 25.2）；**光照**输 π0.5（65.9 vs 69.2） |
| **GenieSim-Instruction**（10 任务归一化分） | 平均 **0.770** | ACoT-VLA 0.757、π0.5 0.746 | 领先 common-sense / logic-or / specific-object；number / size / straighten 不领先 |
| **LIBERO-Plus**（标准 LIBERO 训，测 7 扰动轴） | 总体 **80.4**；相机 94.1、噪声 95.5 | **π0.5 84.4** | **背景 60.5、机器人初态 50.7 是明显短板** |

### 部署

三路相机 + 本体 + 指令 → SVP 一次前向出未来 latent → IDM **5 步 Euler** 出动作流 → 执行稠密块**前 30 个动作**再重预测。训练 bf16 + DeepSpeed ZeRO-2。**⚠️ 论文未报推理延迟 / 控制频率。**

## 在本库框架中的位置

### 对 [[World-Action Models]] 五代谱系：第二代的回归与修复

本页第二代 Two-Stage 写的是"先生成视频再用 IDM 提动作，仍依赖视频生成，代表 UniPi 族 / HiP"。GE-Act 2.0 **就是 Two-Stage**，但把第二代的两个老毛病各修了一个：

| 第二代的毛病 | GE-Act 2.0 的修法 |
|---|---|
| 推理时先生成视频 ⇒ 慢 | **单步 MeanFlow** 一次前向出完整未来；再加 64× 压缩到 24 token/帧 |
| 生成的未来与记录动作**错配**（此前无人命名） | **validity gap** 概念 + **KASO** 在动作空间选兼容候选 |

⇒ 谱系里应加一个**"第二代改良"分支**，与第三代"训繁推简"（GigaWorld 推理时丢视频）、第五代"跳出像素"（LaWAM / Being-H0.7）形成三种对"要不要生成视频"的不同回答：**GE-Act 2.0 坚持生成、但生成得极快极小**。

### 与第五代的三角对照：latent 空间怎么选

| | LaWAM | Being-H0.7 | **GE-Act 2.0** |
|---|---|---|---|
| 未来的表示 | 冻结 DINOv3 latent 上的隐子目标 | latent query（prior/posterior 蒸馏） | **可像素解码的 64× 压缩 latent**（24 token/帧） |
| 可解释 / 可视化 | 弱 | 无 | **强**（保留解码器） |
| 世界模型是否从零训 | 否（冻结 DINOv3 + LAM decoder） | 否（冻结 ViT） | **是**（2.51B SVP 从零） |
| 动作部件能否单独预训练 | — | 否（posterior 依赖未来观测） | **是**（IDM 单独吃失败 / rollout 数据） |
| 规模化实验 | 无 | 无 | **300 → 30,000 h 四档** |

### 对 validity gap 概念的可迁移性

库里已有的"生成器 + 动作头"架构都会碰到这个问题，只是各自绕开了：LingBot-VA 类 **teacher forcing** 喂真实帧（部署时才第一次见生成帧）；GigaWorld 类把生成路径 **detach**；Being-H0.7 靠 prior/posterior 对齐（posterior 看的是真实未来，不存在采样错配）。**KASO 是唯一正面解决"生成的未来属于哪个模态"的方法**，这是它值得单独记的原因。

### 对 [[Robot data engine]] / [[Real-robot data collection - teleop vs UMI-class, and the model-in-the-loop quality problem|数据采集综合页]]

综合页 §1.3 把"部署经验"列为三层之外的第四类数据、"唯一随保有量自动增长"，但此前只有 π*₀.6 Recap（value function 打分）一种消费方式。GE-Act 2.0 给了**第二种架构级答案**：**让 IDM 单独吃失败轨迹与部署 rollout**——IDM 只需观测-动作对齐，不需要指令与成功标注，于是这类数据不必先过质量判别就能进训练。⚠️ 但论文没有消融"去掉失败 / rollout 数据 IDM 掉多少"，这个收益是论证的，不是测出来的。

### 对 [[AgiBot 智元]]

同一家公司**两条并行的世界模型线**：GO-1 / ViLLA 走 **latent action token**（VQ-VAE 离散动作、从 web 视频学），GE-Act 走**显式生成未来 + IDM**（Genie Envisioner 1.0 → 2.0）。实体页此前只有 GO-1 一线。前作 GE-Act 1.0 本库无源笔记，论文自述差别：1.0 用**并行动作分支**从生成器中间态出动作，2.0 改为**显式完整未来作接口 + 可单独预训练的 IDM**。

### 对 [[Embodied Brain Models]]

作者 limitations 明说它是 **System-1 低层策略**（观测 + 指令 → 低层操控，无显式思考），需外接 System-2 做规划、分解、记忆、自纠——正好接本库 harness 簇。评测也刻意只测"可执行的视觉运动能力与细粒度接地"，不测规划。

## Why it matters（对本库）

1. **WAM 谱系补上"从零预训练 + 数据 scaling"维度**。此前五代全部继承预训练视频生成器、全部无 scaling 曲线；这是第一条 300 → 30,000 h 的真机零样本 OOD 曲线，且无饱和迹象。
2. **validity gap 是可迁移的概念**，任何"生成器 + 动作头"都会碰到；KASO 给了一个在动作空间、高噪声点、在线选择的具体做法，真机消融 +28 点。
3. **单步生成 ⇒ IDM 可单独预训练 ⇒ 失败 / rollout 数据有了进训练的架构通道**——接数据引擎"第四类数据怎么消费"。
4. **技能覆盖 r = 0.80 的相关**，是"哪些技能能涌现"最直接的预测量，对数据采集排优先级有直接用处。
5. **CoAE 的多教师对齐**（SigLIP 2 + V-JEPA 2.1 + DINOv3）给"控制用 latent 该长什么样"一个可复用配方：24 token/帧、动作恢复接近 DINOv3、指令匹配最好、还能解码回像素。
6. **零样本 OOD 评测协议**本身值得记：不做任务 SFT、场景 / 物体实例排除、一个 checkpoint 跑全套——比多数 WAM / VLA 的"SFT 后域内测"诚实，接 [[Real-robot evaluation]] 的"可信"轴。

## What feels strong
- 问题分解干净：表示 / 生成 / 对齐三个设计问题各配一个部件或方法。
- validity gap 的形式化（联合样本 vs 两个条件边缘的乘积）与玩具实验把问题隔离得很清楚。
- 零样本 OOD、100 任务、两本体、四档数据的评测规模在 WAM 里罕见。
- 探针实验（表 1）把 latent 选择从"经验"变成可比数字。
- 指令接地按六维拆分、跟随分数与成功率分开、并对照语料频率，诊断价值高。

## What feels limited
- **代码权重未发布**，全部数字不可复现；AgiBot 前作 GE-Sim-V2 有开源，2.0 何时放未知。
- **三种本体规格未写**，"跨本体迁移"的物理含义（关节数、夹爪、是否双臂）不明。
- **scaling 不是等算力隔离**，大数据档也训得更久。
- 30,000 h 后仍 24 个任务零成功；LIBERO-Plus **输 π0.5**，背景扰动 60.5% 明显弱。
- 仿真结果都经域内 SFT，与真机零样本协议不同，作者自己也只当横向参考。
- KASO 消融只有一个本体、两个抓取协议、300 h 对齐；对齐阶段涨幅能否保持到 30,000 h 未验证；K=8 每步多 8 次生成 + 8 次打分的**训练成本未量化**；"保住动作多样性利于后续 RL"未做 RL 验证。
- 失败 / rollout 数据进 IDM 的收益是论证的，无消融。
- **未报推理延迟 / 控制频率**（单步生成的速度优势没有数字）。
- 图 7 数据配比只在图内，第一视角视频份额未知，与 limitations 里"尚未按可用规模探索第一视角视频"一致。
- 每任务 10 次、无置信区间。

## Open questions（接本库）
- 去掉失败 / rollout 数据，IDM 与最终成功率掉多少？这是"第四类数据有用"的直接检验。
- KASO 的 K 与 top-k 怎么选？K=8/k=1 是否在 30,000 h 上仍最优？训练算力开销多少？
- 单步生成 + 24 token/帧的**端到端推理延迟**是多少？能否进边缘（对照 [[ACE Robotics - Kairos 3.0 a Real-Time Generative Video World Model|Kairos]] 的边缘世界模型路线）？
- validity gap 在**第五代隐空间 WAM**里是否同样存在？LaWAM 单次前向出隐子目标也是"独立采样的未来"，理论上应有同样错配。
- 技能覆盖 r = 0.80 能否反过来指导采集：给定目标技能集，需要多少小时才到目标成功率？1.94 logit/decade 给了一个粗估公式。
- 接 System-2（本库 harness 簇）后，指令接地的"顺序"短板能否由规划器分解掉（"左数第二个" → 先数再指）？

## Related
- [[World-Action Models]] — 谱系母页；本篇是第二代的回归与修复
- [[AgiBot - GO-1 ViLLA Generalist Embodied Foundation Model]] — 同公司另一条世界模型线（latent action token）
- [[AgiBot 智元]] — 出品方
- [[Chen et al. - LaWAM Latent World Action Models for Efficient Dynamics-Aware Robot Policies]] · [[BeingBeyond - Being-H0.7 a Latent World-Action Model from Egocentric Videos]] — 第五代对照（latent 空间三角）
- [[GigaWorld Team - GigaWorld-Policy An Efficient Action-Centered World-Action Model]] — 第三代对照（推理时丢视频 vs 本篇极快生成）
- [[Bi et al. - Motus A Unified Latent Action World Model]] — 第四代对照
- [[Robot data engine]] · [[Real-robot data collection - teleop vs UMI-class, and the model-in-the-loop quality problem]] — 失败 / rollout 数据的架构级消费通道
- [[Embodied Brain Models]] — System-1 策略，待接 System-2
- [[Real-robot evaluation]] — 零样本 OOD 协议
- [[World model trends - architecture, scale, function, hardware]] — 参考表新增一行

## tags
#wam #world-action-model #pretraining #scaling #inverse-dynamics #idm #single-step-generation #meanflow #validity-gap #kaso #control-oriented-autoencoder #multi-teacher-alignment #zero-shot-ood #cross-embodiment #agibot #genie-envisioner #china
