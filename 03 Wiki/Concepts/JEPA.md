# JEPA (Joint-Embedding Predictive Architecture)

> 概念页(survey)。**世界模型趋势讨论的底座之一**。本页区分:已核实(本会话检索)/ 已在库 / 分析判断。

## 定义

JEPA = **在表征 / 隐空间做预测**的自监督架构(Yann LeCun 提出)。给上下文 x、目标 y:各自编码,再用 **predictor 从 x 的 embedding(+ 可选隐变量 z)预测 y 的 embedding**。**能量模型视角**:预测 embedding 与真 target embedding 越近 → 能量越低。

- **关键身份:非生成**——不重建像素,只预测"**对预测有用的抽象特征**"。LeCun 论点:别把容量浪费在不可预测的像素细节上(对照生成式世界模型)。

## 出处

- LeCun《**A Path Towards Autonomous Machine Intelligence**》(OpenReview,2022-06):提出六模块自主智能架构(perception / **world model** / cost / memory / actor / configurator),**JEPA 是其"世界模型"组件**;**H-JEPA**(分层)用于不确定性下的分层规划。能量模型展开见 [arXiv:2306.02572](https://arxiv.org/abs/2306.02572)(2023)。见 [[Yann LeCun]]。

## 为什么难:表征塌缩 + 防塌缩谱系

JEPA / 联合嵌入 SSL **易表征塌缩**(encoder 输出趋常数、predictor 走平凡解)。**怎么防塌缩 = 区分各 JEPA 流派的主轴**:

| 防塌缩路线 | 机制 | 代表 |
|---|---|---|
| 对比(负样本)| 拉开不同样本 | SimCLR 等(非严格 JEPA)|
| **EMA 目标 + stop-grad** | 目标 encoder 滑动平均 + 停梯度(BYOL 系)| I-JEPA、V-JEPA、V-JEPA 2 |
| **方差-协方差(VICReg)** | 显式方差/去相关项 | PLDM(7 项目标)|
| 白化 / 去相关 | Barlow Twins 等 | — |
| **冻结预训练 encoder** | 直接绕开(代价:非端到端)| DINO-WM |
| **高斯正则(SIGReg)** | 随机投影 + 正态检验,**可证防塌缩、单超参** | [[Maes et al. - LeWorldModel (LeWM) Stable End-to-End JEPA from Pixels|LeWM]] |

## 家族谱系

**① 表征自监督支(学通用视觉表征)**
- **I-JEPA**(图像;Assran 等,2023,[arXiv:2301.08243](https://arxiv.org/abs/2301.08243)):预测被遮挡 patch 的表征。
- **V-JEPA**(视频;Bardes 等,Meta,2024;《Revisiting Feature Prediction for Learning Visual Representations from Video》)。
- **V-JEPA 2**(Meta,2025-06,[arXiv:2506.09985](https://arxiv.org/abs/2506.09985)):**>100 万小时**视频预训练;理解 / 预测 / 规划;动作理解(Something-Something v2)与动作预判(Epic-Kitchens-100)SOTA。
- 领域变体:Echo-JEPA / Brain-JEPA(医疗)、Causal-JEPA、A-JEPA(音频)等(数量众多)。

**② 动作条件 / 世界模型支(拿来规划 / 控制)** ← 与本库最相关
- **DINO-WM**(2024,[arXiv:2411.04983](https://arxiv.org/abs/2411.04983)):**冻结 DINOv2** + ViT 转移模型自回归预测下一 latent;视觉目标 + **MPC 零样本规划**。
- **PLDM**(= *Planning with Latent Dynamics Models*,2025,[arXiv:2502.14819](https://arxiv.org/abs/2502.14819)):端到端从像素学,**VICReg 衍生 7 项目标**(预测 + 空间/时间 var-cov + 逆动力学);reward-free 离线数据规划。
- **V-JEPA 2-AC**(Meta,2025):在 V-JEPA 2 上**后训练的动作条件世界模型**(300M、block-causal、自回归预测"下一帧表征 | 动作");仅 **<62h Droid 机器人视频**;**Franka 双实验室零样本 pick-place**(图像目标 + MPC,无任务训练 / 无奖励)。**← 世界模型用于机器人规划的旗舰案例。**
- **[[Maes et al. - LeWorldModel (LeWM) Stable End-to-End JEPA from Pixels|LeWM]]**(LeCun 等,2026):极简 **2 损失**端到端 JEPA WM,15M,latent MPC,规划快约 48×。

## 作为世界模型:怎么"行动"(关键澄清)

动作条件 JEPA WM **不是策略、无动作输出头**:动作是 **predictor 的条件输入**;控制靠**测试时隐空间 MPC**——编码当前 + 目标 → 搜候选动作序列 → 在隐空间 rollout → 按"到目标 latent 距离"打分 → 执行 + 重规划(reward-free)。详见 [[Maes et al. - LeWorldModel (LeWM) Stable End-to-End JEPA from Pixels#怎么"产生动作"(无策略头 → 靠规划)]]。

## JEPA vs 生成式世界模型(为趋势讨论铺垫)

| | JEPA(隐预测、非生成)| 生成式(像素 / 视频)|
|---|---|---|
| 产出 | latent 预测 | 像素 / 视频帧 |
| 代表 | I/V-JEPA、V-JEPA 2-AC、DINO-WM、PLDM、LeWM | Sora、Cosmos、DreamerV4、Genie、[[ACE Robotics - Kairos 3.0 a Real-Time Generative Video World Model|Kairos]] |
| 长处 | 高效、聚焦可预测特征、利于规划、轻(可下端)| 可解释 rollout、生成训练数据、视觉保真 |
| 短处 | 不可视(latent)、可能丢信息 | 重、浪费容量在像素细节 |

**核心张力**:LeCun 押"只预测可预测的抽象特征就够"(JEPA);生成式给可解释 rollout + 数据但贵。这是世界模型路线之争的主轴——下次趋势讨论的起点。

## 在本库的定位

- [[Embodied Brain Models]] **Predictive Spatial Models 流派 → 潜在世界模型**的统一框架。
- **边缘角度**:latent JEPA WM 比像素 WM 轻(LeWM 15M)→ 更可能端侧实时,见 [[Embodied Cerebellum Models]] 的"边缘世界模型可行性"开放问题。
- **待补 source notes**(本页只引用、未单独成笔记):**V-JEPA 2 / V-JEPA 2-AC**(优先,趋势讨论要用)、DINO-WM、PLDM、I-JEPA。

## Related

- [[Yann LeCun]] — JEPA / 世界模型路线倡导者
- [[Maes et al. - LeWorldModel (LeWM) Stable End-to-End JEPA from Pixels]] — 库内已收的 JEPA 世界模型(极简端到端)
- [[Embodied Brain Models]] — Predictive Spatial 流派
- [[World-Action Models]] — 视频生成 backbone + 动作(生成式一支,与 JEPA 对照)
- [[World model trends - architecture, scale, function, hardware]] — 把 JEPA 放进世界模型大趋势看(架构/规模/功能/硬件五块;输出表征=总变量)
- [[Chen et al. - LaWAM Latent World Action Models for Efficient Dynamics-Aware Robot Policies]] — 在冻结 DINOv3 latent 空间做 WAM(LAM-decoder 当世界模型);JEPA/DINO 隐预测的控制落地
- [[Embodied Cerebellum Models]] — 边缘世界模型
- [[ACE Robotics - Kairos 3.0 a Real-Time Generative Video World Model]] — 生成式像素 WM(对照)

## tags

#concept #jepa #world-model #self-supervised #predictive-spatial #representation-collapse #lecun #planning #survey
