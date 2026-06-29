# Maes et al. - LeWorldModel (LeWM) Stable End-to-End JEPA from Pixels

- **Type**: Source note(paper + 开源代码;**PDF 全文自读核实**,pdftotext,非摘要器)
- **Paper**: *LeWorldModel: Stable End-to-End Joint-Embedding Predictive Architecture from Pixels* — [arXiv:2603.19312](https://arxiv.org/abs/2603.19312)(v1 2026-03-13,v3 2026-06-03)。**Website + Code 已开放**(链接见 arXiv 页)。
- **Authors**: Lucas Maes\*(Mila / U Montréal)、Quentin Le Lidec\*(NYU)、Damien Scieur(Mila / Samsung SAIL)、**[[Yann LeCun]](NYU)**、Randall Balestriero(Brown)。\*equal contribution
- **Date ingested**: 2026-06-29
- **Raw**: **URL-only**(arXiv 稳定;5.66 MB PDF 仅临时下载自读、读毕清理、**未入库**——符合 `01 Raw` >2MB 规则)

---

## TL;DR

LeCun 团队的一个**极简、可端到端、从原始像素训练的 JEPA 世界模型**:只用**两个损失**——① 下一步 latent 预测(MSE)+ ② 让 latent 服从各向同性高斯的正则 **SIGReg**——就能**稳定不塌缩**,无需 EMA / stop-grad / 预训练 encoder / 重建 / 奖励。**~15M 参数、单卡几小时**,在 latent 空间规划比基础模型世界模型(DINO-WM)**快约 48×**,2D/3D 控制有竞争力;latent 还**编码物理量**、能做"**违反预期(surprise)**"检测。是 LeCun"**latent 预测式世界模型**"路线的一个干净可用实证。

## 问题:JEPA 世界模型易"表征塌缩"

JEPA(Joint-Embedding Predictive Architecture)= 在 **latent 空间预测未来**(只抓预测所需特征,不重建像素)。但现有 JEPA 高度易**塌缩**(predictor 学到平凡解),得靠启发式防塌:多项损失、**EMA + stop-gradient**、**冻结预训练 encoder**、辅助监督——要么引入不稳定、要么堆超参、要么受限于预训练知识。

## 四种范式 + LeWM 的定位(Fig 2)

| 范式 | 代表 | 短板 |
|---|---|---|
| 端到端(像素联合训练)| **PLDM**(VICReg)| **6 个超参**、anti-collapse 欠定、训练不稳 |
| 基础模型 | **DINO-WM** | **冻结预训练 encoder** → 非端到端、受限于预训练知识 |
| 任务特定 | Dreamer / TD-MPC | 要**奖励/特权状态**、基于重建/像素 |
| **LeWM(本文)** | — | **端到端 + 任务无关 + 像素 + 无重建 + 无奖励 + 单超参 + 可证 anti-collapse**——集三者之长 |

## 方法

- **架构**:**Encoder**(像素 o_t → latent z_t)+ **Predictor**(自回归:从 z_t 与动作 a_t 预测 z_{t+1}),两者**联合优化**。
- **两个损失**:
  1. **下一步 latent 预测 MSE**;
  2. **SIGReg**:把 latent **投影到多条随机方向**,对每个 1D 投影做**正态性检验**,聚合 → 逼整体分布趋于**各向同性高斯**,从而**可证防塌缩**(替代 EMA/stop-grad/VICReg 这些启发式)。
- **无任何训练启发式**:no stop-grad / no EMA / no 预训练 encoder / no 重建 / no 奖励。**可调损失超参从(PLDM 的)6 降到 1**。
- **~15M 参数,单卡几小时**。

## 结果

- **规划快约 48×**(vs DINO-WM):因其编码 observation 的 **token 数比 DINO-WM 少约 200×** → 规划速度≈PLDM、比 DINO-WM 快约 50×。**固定 FLOPs** 下在 **Push-T(2D)、OGBench-Cube(3D)** 显著优于 DINO-WM。
- **直觉物理**:latent 空间**编码物理量**(线性 probing 可读出);**违反预期 / surprise 检验**可靠检出"非物理"轨迹。
- 规划 = **latent 空间内 MPC 式、reward-free 向目标规划**(在"想象空间"里评估候选动作序列)。

## 意义 / 在本库的定位

- **LeCun"JEPA + 世界模型"主张的干净实证**:他长期反对纯生成式/自回归作为通往"会规划的智能"的路径,主张**在 latent 空间预测**(JEPA)+ 世界模型 + 规划。LeWM 用 15M 小模型把"**latent 预测式 WM 规划比大基础模型 WM 快约 48× 且仍有竞争力**"做了出来——是这条路线对照生成式/像素 WM 的有力数据点。
- 归入 [[Embodied Brain Models]] **Predictive Spatial Models 流派 → 潜在世界模型**(与 V-JEPA、Dreamer 并列);[[World-Action Models]] 的"潜空间预测"一支。
- **边缘世界模型的轻量候选**:15M、单卡、规划快约 48× → 与 [[Embodied Cerebellum Models]] 形态③(边缘世界模型)里 [[ACE Robotics - Kairos 3.0 a Real-Time Generative Video World Model|Kairos]] 那种"**大像素 WM 冲端侧**"形成正面对照——LeWM 走"**小 latent WM**"路,对"边缘世界模型可行性"这个开放问题是更可信的一票。

`★ Insight ─────────────────────────────────────`
- **这是一张"反基础模型直觉"的牌**:在固定算力下,一个**更小、更简、端到端**的 latent WM 在控制上**击败了冻结大 DINO encoder 的 WM(DINO-WM)**。它把"更大的预训练 encoder = 更好的世界模型"这一假设,在**控制/规划**这个切面上证伪——和我们之前"scaling 对低层控制收益递减"(Humanoid-GPT、562B→<10B 尺寸史)是同一主题的世界模型版:**对'拿来规划/控制'的世界模型,赢家在'规划速度 × 性能'前沿上是小而专,不是大而全。**
- **它直接改写本库一个开放问题的赔率**:[[Embodied Cerebellum Models]] 一直存疑"像素级世界模型能否端侧实时闭环"(Kairos 式)。LeWM 提示**真正能下端的边缘 WM 多半是 latent JEPA 这一路(15M、token 少 200×、规划快 48×),而非像素生成 WM**。"边缘想象"的可行解,可能不在把大像素 WM 压小,而在换成 latent 预测式架构。
`─────────────────────────────────────────────────`

## Related

- [[Yann LeCun]] — 资深作者;JEPA / 世界模型路线倡导者
- [[Embodied Brain Models]] — Predictive Spatial 流派 · 潜在世界模型
- [[World-Action Models]] — 世界模型路线(潜空间预测一支)
- [[Embodied Cerebellum Models]] — 边缘世界模型形态③;LeWM 是"小 latent WM 下端"的对照
- [[ACE Robotics - Kairos 3.0 a Real-Time Generative Video World Model]] — 对照:大像素 WM vs 小 latent WM
- [[Spatial Intelligence for Embodied AI]] — 预测式空间智能

## tags

#source #world-model #jepa #lecun #predictive-spatial #self-supervised #representation-collapse #planning #code-verified #paper-verified
