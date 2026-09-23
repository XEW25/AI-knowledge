# Hirose et al. - AsyncVLA: An Asynchronous VLA for Fast and Robust Navigation on the Edge

## Metadata
- **Type**: source note
- **Format**: arXiv preprint (cs.RO), **v1 2026-02-13**；CC BY-NC-ND 4.0；项目页 https://asyncvla.github.io/
- **Authors**: Noriaki Hirose（UC Berkeley + Toyota Motor North America）, Catherine Glossop（UC Berkeley）, Dhruv Shah（Princeton）, [[Sergey Levine]]（UC Berkeley）
- **Organization**: **UC Berkeley BAIR** + Toyota Motor North America + Princeton
- **arXiv**: [2602.13476](https://arxiv.org/abs/2602.13476)
- **Code / weights**（2026-09-23 核实）: **已开源** [NHirose/AsyncVLA](https://github.com/NHirose/AsyncVLA)（60 stars，2026-02 建、04-21 最后推送；需同时 clone 前作 MBRA 仓库才能定义完整模型）；权重 HF [NHirose/AsyncVLA_release](https://huggingface.co/NHirose/AsyncVLA_release)（387 下载）。**许可混合**：LICENSE 文件是 MIT，但叠了 OpenVLA-OFT / ViNT / OmniVLA 三份上游版权声明，GitHub 标 NOASSERTION；论文本身 CC BY-NC-ND ⇒ 商用需查
- **Raw tier**: URL-only（arXiv HTML 全文自读）
- **Verification status**: 架构 / 训练 / 表 I / 附录表 II 分拆 / 延迟分布 / 基线定义 **HTML 自读核实**；代码仓 README 与 LICENSE 已读，**训练与推理代码未逐行审计**；OmniVLA / ViNT / NoMaD 这条 Berkeley 导航线本库无源笔记，只能引论文自述
- **Related**: [[Embodied Cerebellum Models]], [[Embodied Brain Models]], [[Cloud-edge co-evolving embodied agent - a continuous-evolution framework]], [[Figure AI - Helix a VLA for Generalist Humanoid Control]], [[Galaxea - G0 Dual-System VLA Model]], [[VLA - Vision-Language-Action Models]], [[Real-robot evaluation]], [[Sergey Levine]]
- **Tags**: #vla #navigation #dual-system #cloud-edge #asynchronous #edge-adapter #latency #jetson #berkeley #first-navigation-source

## Summary

**本库第一篇导航源笔记，也是第一篇真正在真实网络上做"云大脑 + 端小脑"拆分并量化延迟的工作。** 把 8.26B 的导航 VLA **OmniVLA** 留在工作站（RTX 4090，5 Hz），在机器人上加一个 **76M 的 Edge Adapter**（Jetson Orin 30 W，8 Hz），两者**异步**跑：基座出**动作 token 嵌入**经 WiFi 下发，Adapter 用**当前帧**把过时的高层引导改写成即时动作。实测 WiFi 往返延迟 **0.28–6.0 s**，行人干扰场景成功率 **0.85**，对照全放工作站的同一模型 0.30、原版 OmniVLA 0.45。

> **本库定位一句话**：[[Embodied Cerebellum Models]] "小脑四种来源"第一条——"一体化 VLA 在云-端压力下裂解、action expert 下端"——此前是预判，这是**第一个有论文、有代码、有真实网络延迟分布的实例**。接口是动作 token 嵌入（8 × 1024），与 [[Figure AI - Helix a VLA for Generalist Humanoid Control|Helix]] 的单 latent 向量同族，但 Helix 两系统都在机身上，**这篇真的跨了网络**。

## 系统

| 部件 | 规模 | 在哪 | 频率 | 做什么 |
|---|---|---|---|---|
| **基座 VLA：OmniVLA** | 8.26B（SigLIP + DINOv2 + LLaMA2-7B） | 工作站 RTX 4090 | 5 Hz | 读延迟帧 + 目标（2D 位姿 / 语言 / 目标图），出 8 个动作 token 的末层特征 |
| **Token projector** | 两个 MLP ResNet 块 | 工作站 | — | 每个 token 从 4 × 4096 压到 **1024**，一次下发 8 × 1024 |
| **Edge Adapter** | **76M**（小 ViT + EfficientNet-B0 视觉编码 + 四层 MLP 动作头） | 机器人 Jetson Orin | 8 Hz | 出 8 步 2D 位姿动作块（3 Hz 控制率，2.4 s 时域） |
| PD 控制器 | — | 机器人 | 10 Hz | 位姿 → 线 / 角速度 |

**Edge Adapter 的三类输入 token**：①投影后的**延迟**嵌入；②**当前帧**特征；③**当前帧与延迟帧拼成的六通道差分**特征，让模型知道两帧之间机器人位姿与环境变了什么。**只用当前帧对应的输出 token 进动作头**，防止被过时嵌入带偏。图像分辨率不到基座的 1/4。

**异步对齐机制**：机器人缓存历史帧与时间戳；收到嵌入后按嵌入携带的时间戳配对出对应的过时观测，喂差分分支。ROS 实现，压缩图像上行、"VectorStamped" 下行。这是云边协同页"网络通信口"（异步 / store-and-forward）的一个**最小可运行实现**。

## 训练

- **反应性轨迹加权**：同一段轨迹分别在 t−Δ 与 t 两个时刻取动作块，终点位姿差超过阈值（0.5 m）的样本说明机器人中途改了行为（避让、让行），**加权**。数据集里这类行为稀少，作者称不加权学不到。每批一半样本用此策略；SACSoN 数据另按行人标注优先采样。
- **两阶段**：①冻结基座，训 projector + Adapter；②**LoRA 端到端**微调整体（≈5% 参数）。两阶段同一目标：模仿损失（两套坐标系下的位姿监督）+ 平滑项。
- 数据：GNM（六个公开数据集）+ LeLaN（in-the-wild 语言导航）+ SACSoN/HuRoN（行人动态场景）。5 × H200，等效 batch 180。

## Results（真机 Vizbot，最高 0.3 m/s）

**位姿导航**：10 个杂乱室内外环境 × 2 次，每环境至少一次有行人做三种固定干扰；成功 = 120 s 内到目标 1 m 内且**零碰撞**。

| 方法 | 在哪跑 | SR | 用时 s | 静态碰撞 | 行人碰撞 | 语言跟随（OOD 指令） |
|---|---|---|---|---|---|---|
| OmniVLA-edge 108M | 全在端 6 Hz | 0.25 | 80.1 | 0.60 | 1.00 | 0.50 |
| OmniVLA 8.26B | 全在工作站 5 Hz | 0.45 | 70.7 | 0.30 | 1.05 | **0.83** |
| Ours 不做端到端 | 分离 | 0.25 | 82.8 | 0.60 | 1.05 | 0.75 |
| Ours 全放工作站 | 全在工作站 | 0.30 | 89.8 | 0.70 | 0.50 | 0.67 |
| **AsyncVLA** | 分离 | **0.85** | **59.2** | **0.10** | **0.10** | 0.75 |

**两个最有说服力的对照**：
- "Ours 全放工作站" 0.30 vs 0.85 ⇒ **同一模型、只是不把 Adapter 放到端上就掉 55 点**，收益来自**部署位置**而非架构本身。
- "Ours 不做端到端" 0.25 ⇒ 冻结基座只训 Adapter **完全不行**，端到端微调是必要条件 ⇒ **只适用于开源权重的 VLA**（作者自列为主要限制）。

**附录表 II 分拆**：OmniVLA 在**无行人**场景 SR **0.90**、**有行人** **0.00**——延迟问题全部集中在动态交互。AsyncVLA 无行人 0.90。

**人为延迟扫描**（基座降频，Adapter 照常）：基座 0.5 Hz 时 OmniVLA SR 0.10、0.2 Hz 时 0.00；AsyncVLA 在 0.2 Hz 仍 **0.50**。作者称对 5 s 级延迟稳健。

**语言导航**（12 个环境，一半用 CAST 协议的 OOD 指令"沿 Y 走向 X"）：AsyncVLA 0.75，略低于原版 OmniVLA 0.83，远高于小模型 OmniVLA-edge 0.50 ⇒ 基座的语言能力基本保住，端到端微调有轻微损耗。

## 在本库框架中的位置

### 对 [[Embodied Cerebellum Models]]

- **四种来源第一条从预判变实例**：VLA 裂解、action expert 下端。这里下端的不是原 action expert，而是**新训的 76M 适配头**，接口是基座末层动作 token 嵌入。
- **"延迟方差比均值致命"有了直接证据**：WiFi 抖动 0.28–6.0 s 跨 20 倍，系统仍稳；原版 OmniVLA 5 Hz 在静态场景 0.90 但一有行人就 0.00，说明**平均延迟够用、尾延迟致命**。
- **多速率阶梯的一个实例**：云 5 Hz → 端 8 Hz → PD 10 Hz。端小脑不只是"小一号的大脑"，它做的是**用当前观测改写过时引导**，与基座分工不同。

### 对 [[Embodied Brain Models]] 解耦光谱

落在**路线 2（显式多系统 + 压缩接口）**，接口形态介于 Helix 的单 latent 向量与 GO-1 的离散 token 之间：**8 个 1024 维连续向量**，且**首次给出了这个接口跨网络的带宽与延迟容忍度**。与 [[Galaxea - G0 Dual-System VLA Model|G0]] 的语言子任务接口对照：语言接口带宽更低但表达粗，嵌入接口保留了基座对动作的具体倾向。

### 对 [[Cloud-edge co-evolving embodied agent - a continuous-evolution framework]]

云边协同页把"网络通信口（异步 / store-and-forward / QoS）"列为边端③的对外端口但无实证。AsyncVLA 的**时间戳缓冲配对**是该端口的最小实现，且量化了它要吞的抖动分布。⚠️ 它只做**推理时**的云边分工，不涉及该页的核心（端侧演进 / 经验回传），是"部署分工"而非"演进分工"。

### 导航：本库新领域

此前库内无导航源笔记。OmniVLA / ViNT / NoMaD / GNM / LeLaN / SACSoN 这条 Berkeley 导航线全部只能引论文自述，**待补**。导航与操控在本库框架下的关键差异：动作空间是 2D 位姿（低维），控制率 3 Hz，视野受限 + 行人 ⇒ **部分可观测 + 动态障碍**是延迟致命的根源，这与操控场景"物体基本不动"不同。

## Why it matters（对本库）

1. **部署主线最大的实证空洞被填上一块**：库里"云脑 + 端小脑"此前是预判（π 裂解）、厂商自报（Helix 全在机身）、框架设计（云边协同页）；这是第一个**开源、可复现、有真实网络延迟分布**的例子。
2. **"位置 vs 架构"被隔离**：同模型全放工作站 0.30 vs 分离 0.85，这是"端侧必须有反应层"最干净的证据之一。
3. **"必须端到端微调"这个限制本身是重要发现**：意味着闭源 VLA 加不了这种适配头，云端大脑若是 API 模型，端小脑只能走 [[Zhang et al. - Harness VLA Steering Frozen VLAs into Reliable Manipulation Primitives via Memory-Guided Agents|Harness VLA]] / [[Galanti et al. - Pigey Addressing the Orchestration Gap in Generalist Robots via Physical Agency|Pigey]] 那种"子目标级"接口，而非嵌入级。
4. **反应性轨迹加权**是"稀有但关键的行为在数据里怎么放大"的一个自动化配方，接数据引擎的采样问题。
5. 开了导航这个领域。

## What feels strong
- 对照设计干净：全放工作站 / 不做端到端 / 小模型全在端，三个基线各隔离一个变量。
- 真实 WiFi 延迟而非人造延迟，且报了分布。
- 附录按有无行人分拆，把"延迟在哪致命"定位到动态交互。
- 开源代码 + 权重 + 训练脚本。

## What feels limited
- **样本量小**：位姿导航 20 次、语言 12 环境，无置信区间；"40% 优势"是 0.85 vs 0.45。
- **单平台、低速**：Vizbot 0.3 m/s，比行人慢很多，避让难度有限。
- **必须端到端微调基座** ⇒ 只能用开源权重；5 × H200 训练。
- 语言跟随 0.75 < OmniVLA 0.83，基座能力有轻微损耗。
- **只有导航、2D 位姿动作空间**，嵌入接口能否迁到操控的高维动作块未验证。
- 未报 Adapter 在 Orin 上的功耗 / 端到端墙钟延迟分解（只给 8 Hz）。
- 许可混合（MIT 叠三份上游 + 论文 NC-ND）。

## Open questions（接本库）
- 嵌入接口迁到操控（π0.5 / GR00T 的 action expert 下端）时，8 × 1024 够不够？操控的动作块维度更高、接触阶段对延迟更敏感。
- 闭源云端 VLA 情形下，能否用**动作块本身**（而非嵌入）当接口、Adapter 只学"修正"？作者引的 [34] 是修正头路线，本篇"不做端到端"的失败暗示修正头也需要联合训练。
- 反应性加权阈值 0.5 m 是导航尺度，操控里对应的"行为突变"信号是什么（DVAC 的去噪方差？）。
- 端小脑要不要也吃基座的**语言**条件？本篇 Adapter 不读语言，语言只经嵌入间接进入——与 GE-Act 2.0 "IDM 不收语言"同一设计选择。

## Related
- [[Embodied Cerebellum Models]] — 四种来源第一条的首个实例；延迟方差证据
- [[Embodied Brain Models]] — 解耦光谱路线 2；嵌入级接口
- [[Cloud-edge co-evolving embodied agent - a continuous-evolution framework]] — 网络通信口的最小实现
- [[Figure AI - Helix a VLA for Generalist Humanoid Control]] — 同族双系统，但全在机身
- [[Galaxea - G0 Dual-System VLA Model]] — 语言子任务接口对照
- [[Zhang et al. - Harness VLA Steering Frozen VLAs into Reliable Manipulation Primitives via Memory-Guided Agents]] · [[Galanti et al. - Pigey Addressing the Orchestration Gap in Generalist Robots via Physical Agency]] — 闭源大脑时的替代接口（子目标级）
- [[Sergey Levine]] — 作者
- [[Real-robot evaluation]] — 20 次、无 CI、真实网络

## tags
#vla #navigation #dual-system #cloud-edge #asynchronous #edge-adapter #latency #jitter #action-token-embedding #jetson-orin #omnivla #berkeley #toyota #first-navigation-source
