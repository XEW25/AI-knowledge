# Visual token budget - pruning vs compression

## Purpose

视觉 token 预算是 VLM / VLA 共同的成本轴：**视觉输入占掉多少 LLM 上下文，以及为此付出多少 prefill 时间和 KV-cache 显存**。这一页收口该轴上的两大解法族——**剪枝（pruning）**与**压缩（compression）**——并解释为什么**视频理解侧收敛到剪枝、具身侧收敛到压缩**，两边几乎不交叉。

与 [[VLA quantization]] 是姊妹页：那页压**权重位宽**，这页压**输入序列长度**。两者正交，可叠加。

## 问题的量级

论文原文（[EVS](https://arxiv.org/abs/2510.14624) §1，已核实）给的基准数：**一段 2 分钟 24 FPS 视频产生 200 万以上 vision token**，而主流 LLM 有效上下文只有 4K–128K。视频理解侧的 token 预算是**溢出**级别的问题。

具身侧不是。一个带 3 帧历史 × 2 视角 @ 224×224 的 VLA，量级在 1–2k token。**同一根轴，两边差三个数量级** —— 这是下面所有分歧的根源。

## 两族解法

| | **剪枝 Pruning** | **压缩 Compression** |
|---|---|---|
| 做法 | 保留原始 token 的子集，**逐字不动**，其余整个丢弃 | 把**全部**输入重编码进一个更小的 token 集 |
| 有损方式 | 删除 | 摘要 |
| 训练 | 可免训练（但见下文折扣） | 必须训练 |
| token 数 | $O(T)\times(1-q)$，随历史线性增长 | 常可做到 $O(1)$，与历史长度无关 |
| 依赖的先验 | 相邻帧高度冗余 | 无（encoder 学什么算什么） |
| 代表 | **EVS**、ToMe、SparseVLM、RLT、KVTP | **π0.7 MEM**、LLaVA-Mini、NVILA、[[AgiBot - GO-1 ViLLA Generalist Embodied Foundation Model\|GO-1]] latent action token |

## EVS：剪枝派的代表（原文逐条核实）

**Efficient Video Sampling**，Bagrov / Khvedchenia / Tymchenko 等，**NVIDIA**（通讯 `evs-paper@nvidia.com`），[arXiv:2510.14624](https://arxiv.org/abs/2510.14624)。

### 算法

对每个 patch $p$ 在 $0 < t \le T$ 计算帧间差分，两种模式：

- **RGB space**：$D_{p,t} = \lVert p_t - p_{t-1}\rVert_1$，在**视觉编码器之前**算，故"无需过 encoder 即可决定剪谁"，延迟最低
- **Embedding space**：编码器输出上的**余弦不相似度**；论文称其"expected to yield improved robustness to minor brightness variations, sensor noise, and **slight camera motion**"

阈值 $d$ 取整个序列 $\{D_t\}_{t=1}^{T}$ 的**第 $q$ 百分位**（$q$ = 用户指定剪枝率），保留 $D \ge d$ 的 patch。**第一帧无条件全留**（$M_0 = \mathbf{1}$）作时间锚点。

> **关键设计**：阈值是**序列级分位数**而非固定 τ。后果有二 ——（1）token 预算变成可直接指定的旋钮，与内容无关，batch / KV-cache 可预分配；（2）**帧级剪枝率反而是自适应的** —— 论文明写 *"EVS does not prune each frame uniformly: more dynamic frames are pruned less aggressively, while static frames are pruned more heavily"*。即"恒定预算 + 帧间自适应分配"。

### Position ID：本方法真正的技术内容

剪枝后位置编码有两种处理，论文做了消融（Table 2，$q=0.75$）：

- **Sequential** — 剪枝后重新连续编号
- **Position-preserving** — `E' = gather(E, M)`，`P' = gather(position_ids, M)`，存活 token 带原始时空坐标，中间的"洞"由 RoPE 隐式感知

**结论是分情况的，不是一边倒**（原文 §3.3 + Table 2 逐格核对）：

> *"For plug-and-play, it is better to use the position IDs as-is, while for uptraining, it is advantageous to preserve them."*

按 Table 2 九组数逐格计票：**Plug-in 下 Sequential 胜 6/9**；**Uptrain 下 Position-preserving 胜 7/9**（Sequential 仅胜 2 组且差距 ≤0.10）。

> ⚠️ 常见误读（多个二手摘要如此转述）："position-preserving 对 transformer LLM 一律更优"。**原文不支持**。机理上也说得通：模型预训练时从未见过带洞的位置 ID，硬保留反而是分布外输入；只有 uptrain 教会它之后，保留才开始变成收益。

### Uptraining：「无需重训」要打折扣

论文摘要写 *"requires no architectural changes or retraining"* —— **架构层面成立**（零新增参数，仅两次 gather），**精度层面不成立**。论文自己做了 uptraining：每个 mini-batch 从 **beta 分布**采样 $q$，使模型"对一段连续压缩比区间不敏感"，且**开关 EVS 都能用同一份权重**。

Table 5（$q=0.75$，相对 baseline 的百分比，post-encoder + position-preserving，已核实）：

| Benchmark | Plug-in | Uptrain |
|---|---|---|
| VideoMME | **−6.85%** | −2.83% |
| MVBench | −3.94% | −2.06% |
| TempCompass | −1.66% | **+0.81%** |
| nv-Metropolis | −1.28% | **+0.18%** |

零样本掉 6.85 个点不是 "minimal accuracy loss"。**推论（未在论文中明说）**：Cosmos Reason / Nemotron 这条线上的 EVS 大概率是 uptrain 过的，而非纯外挂。

### 加速：4× 是 LLM-only，整机没那么好看

Table 6（H100 + TensorRT-LLM，32 帧 512×512，bs=1，已核实并自行换算）：

| | Qwen 2.5 7B | Qwen 2.5 14B |
|---|---|---|
| TTFT$_{llm}$ 无剪枝 | 0.1892s | 0.3786s |
| TTFT$_{llm}$ @ $q=0.75$ | 0.0482s（**3.9×**）| 0.0936s（**4.1×**）|
| TTFT$_{vlm}$ @ $q=0.75$ | 0.1767s（**1.78×**）| 0.2418s（**2.09×**）|
| TTFT$_{vlm}$ @ $q=0.80$ | 1.91× | 2.45× |

摘要里的 "up to 4×" 指 **LLM 部分**。整机只有 ~1.8–2.5×，且**模型越小收益越差** —— 因为 vision encoder 占比越大，而 EVS 不省它。原文 Future Work 明确承认：

> *"In our current implementation, we pass the entire frame through the vision encoder and only perform masked selection before sending input to the language model."*

**KV-cache 随 $q$ 线性下降**。仅作用于 **prefill**，decode 不涉及。

> ⚠️ **论文自相矛盾（存疑）**：§4.3 正文称 $q=0.9$ 有 "13× TTFT reduction of LLM"，但其 Table 6 在 $q=0.9$ 只有 **8.3×（7B）/ 8.6×（14B）**；13× 要到 $q=0.95$ 才出现。$q=0.5$→2× 的说法则与表一致。引用时以 Table 6 为准。

### 对照基线

论文对比了 random pruning / frame subsampling / **ToMe（token merging）**，EVS 整体占优。与 ToMe 的根本分歧：ToMe 在**空间**上合并相似 token（忽略时间先验），EVS 在**时间**上删除静态 patch。

## 压缩派：具身侧的实际选择

同一个"视觉 token 太多"的问题，具身侧几乎没人用剪枝：

| 方案 | 出处 | 机制 |
|---|---|---|
| **MEM 视频历史编码器** | [[Physical Intelligence - pi0.7 a Steerable Generalist Robotic Foundation Model\|π0.7]] | *"历史帧过 vision encoder 压缩到与单帧相同的 token 数"* —— 固定预算，$O(1)$ |
| 类 MEM 历史注入 | [[Galaxea - G0.5 Autoregressive VLM-as-Actor VLA\|G0.5]] | 多秒历史帧经 encoder 注入 |
| **不留历史** | [[Physical Intelligence - pi0.5 a VLA with Open-World Generalization\|π0.5]] | context 每次从当前观测重建，无历史累积 |
| **Action chunking** | [[GigaWorld Team - GigaWorld-Policy An Efficient Action-Centered World-Action Model\|GigaWorld-Policy]] | chunk 48 步 —— 不减单次成本，减**次数** |
| **推理丢视频分支** | [[World-Action Models]] 第三代 | causal mask 硬隔离，10× |
| **跳出像素空间** | [[Chen et al. - LaWAM Latent World Action Models for Efficient Dynamics-Aware Robot Policies\|LaWAM]] | DINOv3 latent 子目标，230M，~24× |

## 为什么两边不交叉

> 以下为**本库分析，非论文结论** —— EVS 论文无任何机器人实验。

1. **单帧 VLA 上 EVS 直接不触发。** $D_{p,t}$ 定义在 $0<t\le T$；$T=1$ 时无合法 $t$，而 $M_0=\mathbf{1}$ 全保留。对 [[Physical Intelligence - pi0.5 a VLA with Open-World Generalization\|π0.5]] / [[Bi et al. - Motus A Unified Latent Action World Model\|Motus]] VLA 模式这类单时间步输入，EVS 是 **no-op，不是精度下降**。（多视角也救不了：EVS 比的是同一空间位置的时序变化，跨视角无像素对应。）
2. **EVS 在解一个 VLA 没有的问题。** 它为"把 200 万 token 压回 16k"而生；VLA 的 1–2k token 无可压。VLA 的瓶颈是**控制频率要求 prefill 快**，不是上下文溢出 —— 所以答案是 action chunking（减次数）和 MEM（固定预算），不是剪枝。
3. **不规则 Δt 破坏位置编码前提。** position-preserving 的 gather 假设原始 `position_ids` 构成规则时空网格；VLA 历史帧间隔取决于 action chunk 实际执行耗时，是不规则的，mRoPE 时间轴在剪枝前就已失真。MEM 把历史压成固定 token 完全绕开此问题。
4. **失效诱因是「相机相对场景在动」，而非「时间不连续」。** EVS 比同一 patch 坐标的前后内容：物体运动只改变局部，**相机运动改变全部**。故固定机位桌面操作即使 Δt 大仍成立；移动底盘 / 第一人称人形即使 Δt 小也崩塌。
   > **反证，需诚实记录**：论文的 nv-Metropolis 数据集明写 *"All videos are captured with a **single moving camera** per scene"*，而 EVS 在其上 $q=0.75$ plug-in 只掉 **1.28%**（四个 benchmark 里最小）。这**削弱**了"相机运动必然使 EVS 失效"的强断言。可能的解释：分位数机制下摇镜时保留的是高纹理/边缘区域，对 QA 仍足够。**该张力未解决。**

## EVS 与 Cosmos 3 的实际关系（已核实）

**Cosmos 3 技术报告全文 0 次提及 `EVS` / `Efficient Video Sampling`**（下载 28MB PDF 用 `pdftotext` 全文检索，2026-07-25 核实；唯一 "pruning" 命中是数据筛选，无关）。HuggingFace 官方模型博客亦未提。

EVS 出现在**部署层**：NVIDIA 开发者博客与 NIM 服务文档称其"reduces the number of video tokens fed into the VLM during inference, speeding up the Cosmos Reason NIM"，作用于 **Reasoner（AR/VLM 塔）的推理阶段**，与 generator（DM 塔）的视频**生成**无关。

> **结论**：EVS 是 Cosmos 3 的**可开关 serving 旋钮，不是模型固有属性** —— 权重本身并不"含有" EVS。凡引用"Cosmos 3 用了 EVS"须限定到 NIM 部署层。

Cosmos 3 Reasoner 的 patch 为 `32×32×2 = 2048` 像素、按 2 帧一组 temporal group 分配像素预算、实测最佳 ≤16k 多模态 token（NIM 文档，vendor-reported）。**推断（非文档明写）**：其 EVS 差分实际发生在相邻 2 帧组之间，与 NIM 文档 "chunk level" 措辞一致。

## 这条轴会移动

论文 Future Work **点名了机器人**，但作为**未做的方向**：

> *"In real-time applications such as robotics and physical AI, future work could explore EVS in streaming settings—sampling full keyframes at fixed intervals or based on content dynamics, then pruning intermediate frames using EVS. Combining this with KV-Cache mechanisms to store and reuse tokenized keyframes…"*

即"关键帧 + KV-cache 跨调用复用 + 中间帧剪枝" —— 恰好是绕开上面第 1、3 条障碍的流式改造。两个会把具身侧推向剪枝的趋势：

- **双系统架构的慢环路**。慢环路 VLM 确实吃视频（进度判断、成功检测、re-plan），且不要求 30Hz。这正是 Cosmos Reason 的本职，也是 EVS 在具身链条里最自然的落点（见 [[Embodied Cerebellum Models]] 的快慢分层）
- **离线数据标注 / 自动评估**。输入是完整 episode，密集视频，EVS 的理想输入。考虑 Cosmos 的数据引擎定位，这可能是它在具身领域体量最大的实际用途
- **长程记忆型 VLA**（[[Memory in Embodied AI]]、[[Huang et al. - ChemBot Long-Term Memory for VLA-based Agents\|ChemBot]]）：视觉记忆变长后，token 预算才第一次成为具身侧的真瓶颈

## Open questions

- **剪枝与压缩可以复合吗？** MEM 式固定预算压缩 + 帧内 EVS 剪枝，正交但无人试过
- **不规则 Δt 下的位置编码该怎么办？** Position-preserving 假设规则网格；具身流式场景需要的可能是"按真实时间戳而非帧序号"的位置编码，论文未涉及
- **相机运动到底伤不伤 EVS？** nv-Metropolis（移动相机）的 −1.28% 与机理推演冲突，需要一个 ego-motion 受控实验才能判
- **Query-aware 剪枝**（论文 Future Work）落到具身即"按任务指令决定看哪里" —— 这与 [[Task decomposition]] 的注意力分配问题是同一个
- 本库缺 **Cosmos 3 源笔记**（[[04 Maps/Embodied AI - VLAs, world models, and cerebellum|地图页]]早已把 Cosmos 列入 backlog），该模型同时是 [[ACE Robotics - Kairos 3.0 a Real-Time Generative Video World Model\|Kairos 3.0]] 的对标靶、[[NVIDIA - GR00T N1 An Open Foundation Model for Generalist Humanoid Robots\|GR00T]] N1.7 的 backbone 来源、DreamGen 的数据引擎

## Related

- [[VLA quantization]] — 姊妹效率轴（压权重位宽 vs 压序列长度），正交可叠加
- [[World-Action Models]] — 三/四/五代的推理效率演进即具身侧的压缩答案
- [[VLA - Vision-Language-Action Models]] — 输入结构（单帧 vs 历史）决定本页哪一族适用
- [[Embodied Brain Models]] — 快慢环路分层，决定 EVS 的落点
- [[Memory in Embodied AI]] — 视觉记忆变长是这条轴向具身侧移动的驱动力
- [[NVIDIA]] — EVS 论文与 Cosmos / Nemotron 落地方
- [[Physical Intelligence - pi0.7 a Steerable Generalist Robotic Foundation Model]] — MEM，压缩派的具身代表

## tags

#concept #efficiency #vlm #video #token-pruning #vla #inference
