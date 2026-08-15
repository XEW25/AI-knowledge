# 2026-08-15 · Raw · FIPER: Failure Prediction at Runtime for Generative Robot Policies

- **Tier**: **URL-only (Tier 1)** — 未下载 PDF;**全文经 arXiv HTML 自读核实**(v2)
- **arXiv**: https://arxiv.org/abs/2510.09459 · **HTML**: https://arxiv.org/html/2510.09459v2
- **Project page**: https://tum-lsy.github.io/fiper_website
- **Source note**: [[Romer et al. - FIPER Failure Prediction at Runtime for Generative Robot Policies]]

## 已核实事实(自读全文,2026-08-15)

- **作者**: Ralf Römer, Adrian Kobras, Luca Worbis, Angela P. Schoellig(前三人 equal contribution)
- **机构**: **Technical University of Munich (TUM)** — Learning Systems and Robotics Lab / **MIRMI**;**Robotics Institute Germany**;Munich Center for Machine Learning
- **发表**: **NeurIPS 2025**(v2,2025-10-13);arXiv 类别 **cs.RO**
- **资助**: DFG 研究组 ConVeY(GRK 2428)、**Robotics Institute Germany**(BMFTR 16ME0997K)

### 问题定位(原文对两派既有方法的批评)
> "**Pure OOD detectors trigger on any novel situation, even if the policy can generalize to it.** At the same time, **VLM-based methods only raise alarms after errors manifest, providing no foresight** about impending failure."

对 FAIL-Detect(xu2025can)的针对性批评:
> "as future behavior is determined by the actions of the policy, **observation-only methods can miss early warning signs present in the action distribution**."

### 检测器一:RND-OE(random network distillation on observation embeddings)
- RND = 一个**冻结的随机初始化 target 网络 `g`** + 一个**训练去拟合它的 predictor `f_θ`**;分数 `s_RND(O_t) = ‖f_θ(O_t) − g(O_t)‖₂`。见过的数据两者输出接近,没见过的发散
- **关键设计:两个网络都复用并冻结策略自己的观测编码器 `h(·)`**。两个好处:(1) 异常检测直接发生在**策略的嵌入空间**里,比原始观测的 OOD 更能指示失败;(2) 借用预训练特征提取器 ⇒ **小数据集也能训 RND**
- `f_θ` 刻意设计得**比 `g` 略大**,以保证在 ID 数据上能充分逼近
- **滑动窗口求和聚合**(公式 2,窗口 `w_O`):理由是策略通常**能扛住短暂、轻微的 OOD**,但**连续多帧 OOD** 会引发无法恢复的复合误差

### 检测器二:ACE(action-chunk entropy)
- **核心论证:模仿学习里该用熵而非方差**。演示数据存在动作多模态,且**模态数量依观测而定且未知** ⇒ 同一观测下成功 rollout 也可能生成 L2 意义上差异很大的动作,**方差因而几乎不含信息**
- 但**IL 的多模态通常是离散性质的**(先拿 A 还是 B 还是 C;从侧面还是上方抓;从左还是从右绕障)⇒ 每个生成动作都应清晰地落在某一个模态里 ⇒ **该用分布的锐度(熵)**
- 扩散/流策略的似然 `p_π(A_t|O_t)` 未知 ⇒ 采 `B` 个动作块近似。但 `A_t ∈ A^H` 的维度随 `H` 指数增长,直接估计需要过大的 `B` ⇒ **把 `t` 到 `t+H−1` 各预测步分开处理再求和**(公式 4)
- `Ê(·)` 用**逐维度分箱(binning)**估计 —— 作者称比其他方法**更高效、更稳健、更好调**
- 实现上在**末端位置的笛卡尔空间**算,以获得任务相关且可解释的不确定性
- 同样做**滑动窗口求和**(公式 5,窗口 `w_A`)
- ⚠️ 对 STAC 的针对性批评(Figure 3(d)):**STAC 会把"策略正在决定采用哪个行为模态"的时刻误判为高不确定性**

### 组合:逻辑 AND(本文的核心设计选择)
`F(τ:t) = F_O ∧ F_A`(公式 7)
> "Not all OOD observations lead to failure, and there may be temporary high (aleatoric) uncertainty in the generated actions even in successful rollouts... To obtain robust predictions specifically about **task failure**, we flag a rollout as Fail **if and only if both** failure predictors raise a warning."

- **Proposition 1**:两个阈值各自按 `δ` 校准后,由于 `η_O` 与 `η_A` **不独立**,合取预测器**满足同一个上界** `P(∃t: F=1) ≤ δ`

### CP 阈值构造
- 用**函数型数据的 conformal prediction**(Diquigiovanni et al.)
- **时变阈值**,理由:两个分数在 rollout 内变化很大,**通常在 t=0 最小**
- 把校准集**分成两个不相交部分**,分别算时变均值 `μ_{O,t}` 与带宽 `b_{O,t}(δ)`
- 因 `η ≥ 0`,**只需单侧上阈** `γ_{O,t} = μ_{O,t} + b_{O,t}`

## 实验设置
- **五个环境**:
  - 仿真 — **Sorting**(Franka 推两块到配色盒)、**Stacking**(Franka 叠三块,**六种合法排布 ⇒ 强多模态**)、**PushT**
  - 真机 — **Pretzel**(Franka 把绳折成椒盐卷形状)、**PushChair**(移动操作臂推椅子)
  - **PushT / PushChair 的 OOD 数据直接取自 Sentinel**
- **OOD 制造方式**:改方块尺寸与目标盒位置 / 改块大小与目标位置 / 改 T 形物形状尺寸 / 改绳初始构型并绕轴旋转(改变弯折行为)/ 改椅子初始位姿
- **策略**:PushT、Pretzel、PushChair 用 **denoising diffusion + temporal U-Net**;Sorting、Stacking 用 **flow matching + ACT transformer backbone**。图像编码器统一 **ResNet-18**
- **RND-OE 网络**:predictor 6 层 MLP / target 4 层 MLP
- **基线**:**PCA-kmeans**、**logpZO**(FAIL-Detect)、**STAC**(Sentinel)、**RND-A**(改自 ReDiffuser)
- **校准规模**:仿真 **M=50** 条成功 rollout,真机 **M=10** 条
- 结果对 `1−δ ∈ {0.90, 0.91, …, 0.99}` **全部取平均**(作者称不存在"最佳分位数");窗口大小 `w ∈ {1,…,50}` 与阈值类型按 TWA 最优选取

### 新指标 TWA(timestep-wise accuracy)
- 动机:Acc 与 DT 单看都可被套利 —— **一直等到最后一步再"预测"**能拿高 Acc;**第一步就全判 Fail** 能拿完美 DT
- TWA:真阳性记 **`1 − DT`** 而非 1 ⇒ **越早正确预测奖励越高**
- 主指标为**平衡准确率** `Acc = ½(TPR + TNR)`;DT 只在被正确判为 Fail 的失败 rollout 上算,且 **TPR 或 TNR < 0.4 时给 DT 打标记**(表示区分能力太差,该数字无意义)

## 结果(核实,五环境平均)

| 方法 | TWA ↑ | Acc ↑ | DT ↓ |
|---|---|---|---|
| PCA-kmeans | 0.57 | 0.61 | (0.09) |
| logpZO | 0.60 | 0.69 | 0.35 |
| RND-A | 0.56 | 0.62 | 0.34 |
| STAC | 0.57 | 0.68 | 0.42 |
| **RND-OE**(本文,单用) | 0.59 | 0.67 | **0.18** |
| **ACE**(本文,单用) | 0.63 | 0.74 | 0.25 |
| **FIPER**(AND 组合) | **0.65** | **0.78** | 0.30 |

- **FIPER 总体 TPR = 0.92**
- ⚠️ **AND 的代价被自家表格量化了**:"Our two individual failure-predictors, RND-OE and ACE, **can achieve even faster failure prediction when used alone, albeit with a lower TWA and accuracy**." —— DT:RND-OE **0.18** < ACE **0.25** < FIPER **0.30**
- **ACE 显著优于 STAC**,尤其在 Sorting / Stacking / Pretzel 这些**动作多模态强**的环境
- **PCA-kmeans 基本无法区分 OOD 与失败**,TNR 仅 **0.24** ⇒ 作者据此指出**"成功/失败平均分数差大" ≠ "失败预测性能好"**
- Figure 4 的四象限分析(Success ID / Success OOD / Fail ID / Fail OOD):**Success OOD 与 Fail ID 之间的间隔**才是关键;RND-OE 与 ACE 在这条间隔上明显优于各自阵营的基线
- 观察:**动作侧分数的 Fail-Success 间隔普遍小于观测侧** ⇒ "failures are harder to detect from the policy outputs than from the inputs"

## 局限(作者自述,附录 D)
- **总体准确率仅 78%**,对"误报代价高且必须早期可靠识别"的场景(如装配线)**可能仍不够**
- 历史信息**只通过滑窗聚合分数**利用,**未进入分数计算本身**
- **RND-OE 需要单独训练**一个与策略分离的模型
- 只在**基于图像的观测嵌入**上验证过;语言、触觉、音频未测
- ⚠️ **时变阈值有两个缺陷**(与 VLA-FAIL 的选择直接呼应):
  1. 隐含假设成功 rollout 的**事件时序总是相似**;若策略**第二次尝试才抓住**,轨迹就时间平移了 ⇒ "**if the training data contains multiple temporally distinct ways of completing the task, a constant threshold may be more suitable**"
  2. 时变阈值只能在**校准集里出现足够多次的时刻**上计算 ⇒ **rollout 长度不一时会出问题,可能需要 padding**
- **aleatoric 不确定性会干扰 ACE**:演示数据本身变异大 ⇒ 成功校准 rollout 的动作块内变异也大 ⇒ 阈值被抬高 ⇒ TPR 下降
- 只考虑**单任务、视觉 IL 策略**;适配到大规模 VLA(OpenVLA / π₀ / GR00T)是 future work
