# World model trends — output space as the master variable

> 跨公司世界模型趋势综述(2026-06,与 Ethan 多轮推演)。**不局限于 JEPA**,涵盖 Dreamer / Cosmos / Genie / Sora / Marble / JEPA 系等。
> **核心论点:WM 没有 LLM 那种固定 I/O;"输出表征"是总变量——它一手决定架构、规模、功能、训练硬件、推理硬件。**

- **Type**: Synthesis(讨论综述 / 趋势底稿)
- **Date**: 2026-06-30
- **可靠性**:模型事实多为本会话**检索核实**(arXiv id 见文末);**时间线分段、硬件需求、未来预判 = 分析判断**。

![[fig-wm-trends-output-space.svg]]

## 核心论点:输出表征 = 总变量

LLM 的 I/O 被固定成 `text → text`;**WM 的 I/O 本身是设计自由度**,各家下注不同(产 2D / 视频 / 3D / 隐状态 / 动作)。一旦定了"产什么",**架构家族、参数量级、适用功能、训练硬件画像、推理硬件画像几乎全被锁定**。下面五块都收敛到这一条。

## 1. 架构:骨架收敛,目标分野
- **过去(≤2024)**:RNN/RSSM 隐式生成(Dreamer V1–3、PlaNet)+ 价值等价(MuZero)+ Transformer-AR 萌芽(IRIS);JEPA 刚诞生(I-JEPA,仅表征)。
- **现在(2025–26)**:**骨架统一到 Transformer**——DiT 跑扩散视频、decoder-Transformer 跑 AR-token、ViT 跑 JEPA 隐预测;RSSM 退到在线效率小生态(**DreamerV4 自己都换 block-causal Transformer + flow matching**)。**分野全在目标**(像素/token/latent)+ 动作条件 + 实时。
- **未来(2026+)**:Transformer 仍是底座,效率压力 → 混合**线性注意力 / SSM**(长时一致 + 边缘);目标可能部分融合("predict-in-latent, decode-on-demand")。
- **串行 vs 并行 = 范式 B vs A**:范式 B(cross-attn,VLM→DiT 串行,如 GR00T)/ 范式 A(joint-attention **MoT 并行-耦合**,如 [[Bi et al. - Motus A Unified Latent Action World Model|Motus]]、π 系)。MoT 的好处:专家专精 + 逐层双向融合 + **一个网络多模式**(Motus 5 模式)+ 复用预训练专家 + 可插拔扩展位。
- **JEPA vs Transformer**:JEPA 不是骨架,是"配方"(双 encoder+predictor + 隐预测目标 + 防塌缩),其 encoder/predictor 本身就是 ViT;同一 ViT 可训成 GPT / MAE / JEPA。详见 [[JEPA]]。

## 2. 规模:两条曲线(不是一条)
- **过去**:小(M–低百 M);控制 WM 天生紧凑(DreamerV3 8–200M),唯一"大"的是 SSL 编码器(I-JEPA ViT-H ~632M)。
- **现在**:剧烈分叉,同期 **~1000× 跨度**——**生成式 B 级**(Genie ~11B、Cosmos 2–14B、DreamerV4 ~2B、Kairos 4B、Motus ~7B)vs **隐/控制 M 级**(LeWM 15M、V-JEPA 2-AC 300M、DINO-WM ~300M 多为冻结、PLDM 几十 M)。
- **未来**:差距拉大——生成式基座爬向 LLM 量级(10B–100B+,吃视频);控制/边缘守小或更小(蒸馏、训繁推简);很可能"**训大蒸小**"管线连两端。
- 主线:**产像素→大,产隐→小**;控制是 **data-bound 不是 param-bound**(对照 VLA 562B→<10B、Humanoid-GPT 80M)。

## 3. 功能:按输出表征分类(WM 的真正自由度)
| 输出 | 用途 | 代表 |
|---|---|---|
| 2D 子目标帧 | 规划路标 | π0.7、SuSIE、CoT-VLA |
| 视频 | 仿真/造数据/可玩/想象 | Cosmos、Genie 1-3、Sora、DreamerV4、[[ACE Robotics - Kairos 3.0 a Real-Time Generative Video World Model\|Kairos]]、Oasis/MineWorld、WHAM/Muse |
| 3D / 几何 | 空间创作 / 驾驶预测 | Marble(Gaussian/mesh)、OccWorld(occupancy)|
| 隐状态(非生成)| 规划 / 控制 | [[JEPA]] 系(V-JEPA 2-AC、DINO-WM、[[Maes et al. - LeWorldModel (LeWM) Stable End-to-End JEPA from Pixels\|LeWM]])、Dreamer latent |
| 动作/价值/奖励 | 直接决策 | MuZero、GigaWorld-Policy、Motus、WHAM(连人类动作)|
| 结构化/物理 | 可解释 / 物理推理 | object-centric、PIN-WM、LeWM 物理探针 |

- **正交轴**:输入/条件(被动 / 动作条件 / 文-图 prompt / 交互控制 / 目标条件 / 多模态 / latent-action);用途(规划 / 仿真造数据 / 可玩 / 预判 / 验证 / 创作)。
- **两个相反方向**:生成派沿 **2D→视频→3D/持久**爬(Marble、OccWorld;治平面视频的 3D 不一致);控制派沿 **像素→隐**收(LeWM)。同一"world model"标签,**两头对奔**(李飞飞 3D ↔ LeCun 隐)。

## 4. 训练硬件:从 compute-bound 转向 data-movement-bound + 异构
1. **数据平面压倒算力**:视频/3D 的 PB 级存储 + 海量解码(NVDEC)+ dataloader 带宽(Cosmos ~20M 小时)→ 喂不饱 GPU。
2. **超长时空序列**:帧 × 空间 token 爆炸 → HBM + 长上下文注意力 → 逼线性注意力/SSM。
3. **扩散**:高激活内存 + 多步 + 大 batch。
4. **3D/几何**:稀疏 + 可微渲染,非 GEMM,硬件不匹配。
5. **多组件 + MoT 异构**:难干净分片(joint-attention 耦合、冻结/可训混合)。
6. **训练-想象-学习闭环**:训练中要大量低延迟 rollout(Dreamer / 训繁推简);可能物理仿真在环。

## 5. 推理硬件:latency/throughput-bound + 迭代生成 +(控制)搜索在环
1. **迭代生成**:每帧 N 步去噪 / 上千 token,实时靠步数蒸馏(DMD)。
2. **规划在环 = 搜索**:控制 WM 每拍 rollout 多候选 × horizon,卡硬实时 deadline(P99/抖动)。
3. **长上下文随会话增长**:KV/延迟漂移(Genie 3 ~1 分钟上限)→ 线性注意力/SSM。
4. **实时流式 + 低抖动**:可玩 + 控制 → EAL / CUDA-graph / 无 GC。
5. **3D 推理**:实时渲染 + 稀疏。
6. **多组件流水线**:延迟叠加,**解码是贵尾**(隐 WM 跳过 → 便宜可上端)。
- 两套 regime:云端生成式(吞吐)vs 边缘控制(延迟);**交互式生成最贵**(又大又实时)。
- **训练 vs 推理瓶颈换边**:训练 data-movement-bound;推理 latency/search/迭代-bound。

## 代表模型速查
| 模型 | 输出 | 规模 | 骨架 / 目标 |
|---|---|---|---|
| Cosmos | 视频 | 2–14B | DiT 扩散 / AR-token |
| Genie 1-3 | 视频(交互)| ~11B | AR Transformer |
| DreamerV4 | 视频 | ~2B | block-causal Transformer + flow matching |
| Marble | 3D(Gaussian/mesh)| 未公开 | 生成式 3D |
| Kairos | 视频(边缘)| 4B(+7B 条件器)| DiT + 线性注意力 + DMD |
| Motus | 视频+动作(多模式)| ~7B | MoT(范式 A)|
| V-JEPA 2-AC | 隐(动作条件)| 300M | ViT JEPA |
| DINO-WM | 隐 | ~300M(冻结 DINOv2)| 冻结 encoder + ViT 动力学 |
| LeWM | 隐 | 15M | ViT JEPA(2 损失)|
| LaWAM | 隐子目标(WAM)| 230M(LaWM)| 冻结 DINOv3 + LAM-decoder 当 WM,单次非迭代;比像素 WAM 快 ~24× |
| MuZero | 价值/奖励 | 小 | 隐动力学 + MCTS |
| OccWorld | 3D occupancy | — | occupancy tokenizer + ST-Transformer |

## 主线判断 / Open

`★ Insight`
- **output space 是 WM 的总变量**:给我 I/O 契约,我能预判它的架构家族 / 参数量级 / 适用功能 / 训练 HW / 推理 HW。**WM 不像 LLM——LLM 的 I/O 被钉死,WM 的 I/O 本身就是各家下注的自由度。**
- **两个相反方向并跑**:做大、产像素/3D(创作·仿真)↔ 压小、产隐(控制)。同一标签,李飞飞(空间 3D)与 LeCun(隐预测)押相反端。
- **具身落地硬话**:WM 入**边缘控制环 = 实时搜索**,比反应式策略难一档 → 端上用极小隐 WM(且不解码)、或大生成式 WM 留云端只做慢验证/重规划;[[Cloud-edge co-evolving embodied agent - a continuous-evolution framework|端云框架]] 的 EAL 资源预算必须把 rollout 单列。

**待扩子题**:训练数据来源与配比、长时一致性/记忆、3D 持久性、WM 评测标准、predict-and-verify 入环。

## 可靠性 / Sources
本会话检索核实:[Cosmos](https://research.nvidia.com/labs/cosmos-lab/cosmos-predict2.5/)、[Genie 1 (2402.15391)](https://arxiv.org/abs/2402.15391) / [Genie 3](https://deepmind.google/blog/genie-3-a-new-frontier-for-world-models/)、DreamerV4(Hafner 2025)、[V-JEPA 2 (2506.09985)](https://arxiv.org/abs/2506.09985) / V-JEPA 2-AC 300M、[DINO-WM (2411.04983)](https://arxiv.org/abs/2411.04983)、[PLDM (2502.14819)](https://arxiv.org/abs/2502.14819)、[LeWM (2603.19312)](https://arxiv.org/abs/2603.19312)、[Marble](https://techcrunch.com/2025/11/12/fei-fei-lis-world-labs-speeds-up-the-world-model-race-with-marble-its-first-commercial-product/)、[MineWorld (2504.08388)](https://arxiv.org/abs/2504.08388)、[OccWorld (2311.16038)](https://arxiv.org/abs/2311.16038)。时间线/硬件/未来 = 分析判断。

## Related
- [[JEPA]] · [[World-Action Models]] · [[Embodied Brain Models]] · [[Embodied Cerebellum Models]]
- [[Maes et al. - LeWorldModel (LeWM) Stable End-to-End JEPA from Pixels]] · [[Bi et al. - Motus A Unified Latent Action World Model]] · [[ACE Robotics - Kairos 3.0 a Real-Time Generative Video World Model]]
- [[Cloud-edge co-evolving embodied agent - a continuous-evolution framework]] — 训练/推理硬件 + EAL 接口
- [[Yann LeCun]] — 隐预测端的押注

## tags
#synthesis #world-model #trends #architecture #scale #hardware #jepa #generative #embodied-ai
