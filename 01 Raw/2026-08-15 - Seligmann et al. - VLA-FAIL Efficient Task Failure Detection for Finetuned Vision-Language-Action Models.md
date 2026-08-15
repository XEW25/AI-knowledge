# 2026-08-15 · Raw · VLA-FAIL: Efficient Task Failure Detection for Finetuned Vision-Language-Action Models

- **Tier**: **URL-only (Tier 1)** — 未下载 PDF;**全文经 arXiv HTML 自读核实**(v1)
- **arXiv**: https://arxiv.org/abs/2606.21386 · **HTML**: https://arxiv.org/html/2606.21386v1
- **Project page**: https://anonymous-vla-fail.github.io/vla-fail-2026/
- **Source note**: [[Seligmann et al. - VLA-FAIL Efficient Task Failure Detection for Finetuned Vision-Language-Action Models]]

## 已核实事实(自读全文,2026-08-15)

- **作者**: Florian Seligmann, Emiliyan Gospodinov, Enes Ulas Dincer, Gerhard Neumann
- **机构**: **FZI Forschungszentrum Informatik, Karlsruhe** + **Autonomous Learning Robots Lab, Karlsruhe Institute of Technology (KIT)**
- **arXiv 类别**: **cs.LG**,2026-06-19
- **资助**: ERC Horizon Europe 项目 SMARTI³(101171393)、**Robotics Institute Germany (RIG)**、BMFTR

### 设计目标(原文对既有方法的三条批评)
> "existing task failure detectors require **computationally expensive action sampling**, are based on **architectural assumptions** that limit their applicability to VLAs, or need access to **failure rollouts**."

补充动机(重要):
> "This last requirement is critical because real-time VLA inference is already expensive, and **additional latency can itself perturb closed-loop execution and induce out-of-distribution states**."

### 检测器一:LLMD(last-layer token-wise Mahalanobis distance)
- 假设 VLA 分解为特征提取器 `f: O → F`(`F = R^{H×F}`)+ 最后一层线性层 `g: F → A^H`,**逐 token 投影成动作**
- **固定先验噪声(核心技巧)**:flow matching 的 last-layer 特征同时依赖 `o`、时间 `t`、噪声动作 `a_t` ⇒ 引入与观测无关的噪声。**在 `t=0` 处 `p_0(a|o) = N(0,I)` 与 `o` 无关**,故可采单个固定噪声 `a_0* ~ N(0,I)`,定义 `f*(o) := f(o, t=0, a_0*)`。**`t>0` 固定会引入人为的协变量偏移,故只能取 t=0**
- 成本:`f*(o)` **只需一次前向,且可与动作采样并行**;若不需要多模态行为,直接从 `a_0*` 起采样动作则**开销为零**
- **逐 token 统计量**:微调后对数据集做**一次无梯度预处理**,得每个 token 位置 `s` 的均值 `μ_s` 与协方差 `Σ_s`
- 消融:**token-wise 是必要的**——用全局单一均值/协方差,X-VLA@Drawer 的 AUCPDT 从 **0.19 劣化到 0.24**。作者猜测:预测越远的未来越难,所需特征不同

### 检测器二:ACC(action chunk consistency)
- 利用 receding-horizon 的重叠:上一 chunk 未执行的后缀 `a^{t-1}_{R+1:H}` 与本次 chunk 前缀 `a^t_{1:H-R}` 重叠
- 分数 = **速度归一化的平均绝对误差**(公式 5),速度 `v^t_d` 取该维度在重叠段内的**极差**,并 clamp 到 `v_min`(防近静止时分数虚高)
- **只用 D=3 的末端绝对位置**计算(任何控制方式都能拿到)
- **指数滑动平均 α=0.9**(强平滑)——因为成功执行中也会自然发生重规划,**只有持续不一致才指示失败**;原文称强平滑"is required for good detection rates"
- 消融:**速度归一化是关键**——X-VLA@Libero-Plus Spatial 的 AUCPDT 从 **0.38 → 0.28**;真机上差距较小但方向一致
- **只需每步一个动作样本** ⇒ 实时可行

### 组合:逻辑 OR
`F_FAIL(t) := (s_ACC ≥ τ_ACC) ∨ (s_LLMD ≥ τ_LLMD)`(公式 7)
- 阈值由**校准数据上的 conformal prediction band** 定,引用 **[27] = FIPER**
- ⚠️ **明确采用时间恒定阈值,而非时变阈值**:原文理由 —— "*as it is not applicable to episodes that vary significantly in length, such as in our real-world Drawer task*"(与 FAIL-Detect / FIPER 的时变 band 相反)
- 评测时的融合:对 LLMD 与 ACC 分数**各做秩变换**归一到同尺度,**取最小值**(对应逻辑 OR);作者自陈"not strictly optimal"但任务无关、无需先验知识

### 新指标 AUCPDT
- 动机:**AUCPR 不区分早检测与晚检测**;而"永远在 t=0 报警"虽零延迟但精度不可用
- `PDT_e(τ)` = 首次超阈的归一化时刻;**未检出的失败记为 1**(假设回合结束时总能自动判定)⇒ PDT 度量的是**相对"等到回合结束"这个自动基线的延迟缩减**
- 对每个唯一阈值算 precision 与 PDT,**只保留 Pareto 最优阈值**,取曲线下面积。**越低越好**

## 实验设置
- **两个 VLA**:**π₀.₅**(3.6B,PaliGemma,**逐层 cross-attention 融合** action expert 与 VLM)、**X-VLA**(0.9B,Florence-2-Large 编码-解码 VLM,**仅以最终 encoder 特征**条件化)
- **六个真机任务**:Blocks、Stack T(高精度)、Cups(多模态演示)、Kitchen、Drawer(长程多阶段)、Mixer(语言条件)。**约 80 rollouts/任务,每 rollout 用 3 个种子**评检测器
- **仿真**:**LIBERO-Plus**(在 LIBERO 上加各种扰动测泛化),官方 checkpoint,单种子
- **基线**:**ACE**(=FIPER 的动作块熵)、**STAC**(Sentinel)、**Diff**(扩散损失伪标签)。**全部用 32 个样本**
- ⚠️ **基线不具备实时能力,因此是在 rollout 回放上评测的**(原文 Figure 1(b));延迟测试环境为 **RTX 5090**,并**扣除了 VLM 的恒定 17 ms**。⚠️ 各方法的具体 ms 值只在柱状图里,**本次未逐值读取**

## 结果(核实)
- **FAIL 是唯一在几乎所有真机与仿真任务上都进入前三的方法**,且**仅有边际计算开销**
- **LLMD 与 ACC 覆盖不同失败模式,只有组合才跨任务稳健**:
  - **ACC 检得更准**,擅长 OOD 下**快速抖动**的行为(真机 Blocks、Kitchen 及全部 Libero-Plus)
  - **LLMD 检得更早**(不依赖行为紊乱、不需时间平滑),擅长**策略反复重试成死循环**或**退化为与环境状态无关的"默认动作"**
- **ACC vs STAC**:ACC 可视为 **STAC 的速度归一化单样本估计**,却在**几乎所有真机任务上胜过 STAC**;Libero-Plus 上 STAC 的 AUCPR 更好但 **ACC 检测显著更早**
  - 作者假设:**ACC 只与已执行的动作块比较,不与反事实轨迹比较**,因此在策略**在多个动作模式间做选择**时更少误报

## 局限(作者自述)
- **LLMD 需要访问微调数据**做预处理 —— 数据量大时昂贵,数据不可得时不可行
- **ACC 需要 receding-horizon 且有足够重叠**,**不适用于完全开环的整块执行**
- **会漏掉"特征与动作都自洽"的失败**,例如**自信地停下**或**忽略语言指令** ⇒ 作者建议与 **VLM 语义层方法组合**
