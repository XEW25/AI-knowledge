# Index

## Inbox
- *(empty — capture / intake area; see [[90 System/AGENTS]] for intake rules)*

## Raw
- [[2026-04-11 - Andrej Karpathy - LLM Wiki]] — raw capture of the original `llm-wiki.md` idea document
- [[2026-07-30 - Heravi et al. - LEACL LLM-Enhanced Automatic Curriculum Learning for RL in Long-Horizon Manipulation]] — URL-only raw capture (PDF 6.14 MB > 2 MB); 已核实事实 + 结果表 + 一处原文数字不一致
- [[2026-08-06 - Zhang et al. - Harness VLA Steering Frozen VLAs into Reliable Manipulation Primitives via Memory-Guided Agents]] — URL-only raw capture(HTML 全文自读);已核实事实 + τ 四形式 + 两层判定 + 仿真依赖清单
- [[2026-08-06 - Agia et al. - Sentinel Unpacking Failure Modes of Generative Policies Runtime Monitoring of Consistency and Progress]] — URL-only raw capture(HTML 全文自读);STAC 机制 + VLM prompt 模板 + 全部核实数字 + 关键消融
- [[2026-08-06 - Xu et al. - FAIL-Detect Uncertainty-Aware Runtime Failure Detection for Imitation Learning Policies]] — URL-only raw capture(HTML 全文自读);四类打分器 + logpZO 构造 + CP band 细节 + 与 Sentinel 的 STAC 成本张力
- [[2026-08-06 - Zeng et al. - HELM Harness-Enhanced Long-horizon Memory for Vision-Language-Action Manipulation]] — URL-only raw capture(HTML 正文自读);三缺口 + EMM/SV/HC 全部超参 + 执行环算法 + 回滚机制

## Sources
- [[Andrej Karpathy - LLM Wiki]] — source note on the LLM Wiki pattern proposed by Andrej Karpathy
- [[Alex Zhang - The Mismanaged Geniuses Hypothesis]] — source note on learned decomposition, orchestration, and the claim that frontier LMs are underutilized by brittle scaffolds
- [[Li et al. - MemPO Self-Memory Policy Optimization for Long-Horizon Agents]] — source note on training memory as an explicit agent action and policy for long-horizon tasks
- [[Prithvi Rajasekaran - Harness design for long-running application development]] — source note on multi-agent harness design, evaluator separation, and long-running application builds
- [[Anthropic - Scaling Managed Agents Decoupling the brain from the hands]] — source note on managed-agent architecture, decoupled sessions/harnesses/sandboxes, and stable platform abstractions
- [[Luo et al. - Ascend HiFloat8 Format for Deep Learning]] — source note on a proposed FP8-like tapered-precision format for low-bit training and inference
- [[Xiao et al. - SmoothQuant Accurate and Efficient Post-Training Quantization for Large Language Models]] — source note on activation smoothing, difficulty migration, and hardware-friendly W8A8 PTQ for LLMs
- [[Kerbl et al. - 3D Gaussian Splatting for Real-Time Radiance Field Rendering]] — source note on the foundational 3DGS paper (SIGGRAPH 2023)
- [[Huang et al. - ReKep Spatiotemporal Reasoning Keypoint Constraints for Robotic Manipulation]] — source note on keypoint-constraint-based manipulation via task decomposition (Li Fei-Fei group, Stanford)
- [[Huang et al. - ChemBot Long-Term Memory for VLA-based Agents]] — source note on Agent-as-Planner + VLA-as-Skill with dual-layer memory for chemical lab automation
- [[GigaWorld Team - GigaWorld-Policy An Efficient Action-Centered World-Action Model]] — source note on action-centered WAM with causal mask architecture, "训繁推简" paradigm
- [[Physical Intelligence - RL Tokens Precise Manipulation with Efficient Online RL]] — source note on RL tokens: lightweight RL expert on top of frozen VLA for precise manipulation
- [[Physical Intelligence - pi0 a Vision-Language-Action Flow Model for General Robot Control]] — **canonical π series note**; code-verified Paradigm A (joint-attention MoE, block-causal); PaliGemma 3B + 300M flow-matching action expert; open-source (openpi)
- [[Physical Intelligence - pi0.5 a VLA with Open-World Generalization]] — co-training recipe for open-world generalization; two-step subtask→action inference; inherits π₀ Paradigm A
- [[Physical Intelligence - pi0.6 a VLA That Learns From Experience]] — source note on Recap: advantage-conditioned offline RL for end-to-end VLA self-improvement from deployment experience
- [[Physical Intelligence - pi0.7 a Steerable Generalist Robotic Foundation Model]] — diversified prompt conditioning; BAGEL world model (subgoal images) + MEM dual memory; inherits π₀ Paradigm A
- [[NVIDIA - GR00T N1 An Open Foundation Model for Generalist Humanoid Robots]] — open-source humanoid VLA series; **Paradigm B (cross-attention encoder-decoder, code-verified)**; frozen VLM + diffusion DiT; N1.7 switches backbone to Cosmos-Reason2
- [[DeepCybo - PhysBrain Human Egocentric Data as a Bridge from VLMs to Physical Intelligence]] — VLM-as-brain; zero-real-robot-trajectory pretraining on human egocentric video (E2E-3M); Qwen3-VL + FM DiT (Paradigm B); not open-source
- [[Figure AI - Helix a VLA for Generalist Humanoid Control]] — dual-system S2(7B VLM)+S1(80M); system interface = single continuous latent vector; both onboard; closed
- [[AgiBot - GO-1 ViLLA Generalist Embodied Foundation Model]] — ViLLA 3-stage; discrete latent-action-token interface (VQ-VAE from video); latent planner is Paradigm A; AgiBot World 1M+ trajectories; open
- [[Galaxea - G0 Dual-System VLA Model]] — dual-system; language-subtask interface (ChemBot-like); G0-VLA internally Paradigm A (PaliGemma + flow matching); open
- [[Galaxea - G0.5 Autoregressive VLM-as-Actor VLA]] — **architectural reversal of G0**: unified autoregressive VLM-as-actor (single decoder/weights/objective) vs the VLM-as-encoder mainstream; cross-embodiment VQ ActionCodec + in-stream CoT + visual memory; introduces the more fundamental actor-vs-encoder axis above Paradigm A/B; Qwen3.5-2B backbone; backbone released
- [[DeepCybo - TwinBrainVLA Asymmetric Mixture-of-Transformers for Anti-Forgetting VLA]] — DeepCybo (PhysBrain team); anti-catastrophic-forgetting via asymmetric dual-VLM (frozen generalist "Left Brain" + trainable specialist "Right Brain" + AsyMoT) → flow-matching expert; VLM-as-encoder / Paradigm-A variant; quantifies forgetting (POPE 88.87%→0.04%); no code released
- [[Zheng et al. - DyQ-VLA Temporal-Dynamic-Aware Quantization for Embodied Vision-Language-Action Models]] — source note on runtime-adaptive (kinematic-gated) mixed-precision PTQ for VLAs; **first embodied/VLA quantization entry** and first bridge between the quantization and embodied clusters; static W4 weights + dynamic activations (W4AX), base model OpenVLA; 99.5% perf at 30.9% memory, 1.49× sim / up to 1.43× real
- [[Wang et al. - Omega-QVLA Robust Quantization for Vision-Language-Action Models via Composite Rotation and Per-step Scaling]] — source note on **uniform W4A4** PTQ of VLA models *including the diffusion DiT action head*, via composite SVD·Hadamard rotation + per-step scaling; second VLA-quant source and the counterpart to DyQ-VLA (uniform-precision vs dynamic-mixed-precision); quantizes π0.5 (98.0%) & GR00T N1.5 (87.8%) ≈ FP16 at ~71% memory saved; open source (Apache-2.0)
- [[Zhang et al. - QuantVLA Scale-Calibrated Post-Training Quantization for Vision-Language-Action Models]] — source note on **selective W4A8** PTQ for VLAs (Zhang et al., CVPR 2026); third VLA-quant source and Ω-QVLA's main baseline; DuQuant-based, integerizes LLM + DiT MLP but **keeps DiT attention FP16** + ATM/OHB interface calibrations; designed for real integer GEMMs; π0.5 97.6% / GR00T 88.0% (> FP16) at 55–70% mem. NB: ≠ QVLA (Xu, ICLR)
- [[Lin et al. - DuQuant Distributing Outliers via Dual Transformation Makes Stronger Quantized LLMs]] — source note on the rotation-based W4A4 **LLM** quant method (Lin et al., NeurIPS 2024 Oral) **underpinning both QuantVLA and Ω-QVLA**; dual transformation = greedy data-aware block rotation + zigzag permutation + smoothing; named "massive outliers" @ FFN down_proj; reports real 2.08× speedup. Route-2 anchor / VLA-quant ancestor
- [[Xu et al. - QVLA Not All Channels Are Equal in Vision-Language-Action Models Quantization]] — source note on **action-centric** per-channel mixed-precision PTQ for VLAs (Xu et al., **ICLR 2026**); fourth VLA-quant source and **DyQ-VLA's baseline**; static bit allocation {0,2,4,8,16} (0-bit = pruning) by action-space sensitivity, uniform activations, keeps projector+action-head FP16; OpenVLA(-OFT) 98.9% @ 29.2% VRAM, 1.49×. NB: ≠ QuantVLA (Zhang, CVPR)
- [[Bi et al. - Motus A Unified Latent Action World Model]] — unified latent-action **world-action model** (Tsinghua TSAIL × Horizon Robotics); tri-expert **MoT** (Qwen3-VL-2B understanding + Wan 2.2 5B video-gen + flow-matching action), **范式 A** joint attention; **UniDiffuser-style timestep scheduling → 5 switchable inference modes** (VLA / World Model / IDM / VGM / Joint); optical-flow "delta" latent actions + six-layer data pyramid; makes "world model at inference" a **runtime knob** (4th-gen WAM, vs GigaWorld's fixed drop); RoboTwin 2.0 88.66%, LIBERO-Long 97.6; project page only, no code
- [[ACE Robotics - Kairos 3.0 a Real-Time Generative Video World Model]] — **NO-PAPER** ingest (code-verified): ACE Robotics (王晓刚/SenseTime-lineage) edge-first **generative video world model**, Cosmos rival. `KairosDiT` 4B video DiT (dim2560×32L, flow-matching) + **hybrid linear attention** (GatedDeltaNet 1-in-4, 25%) + Wan2.1 VAE + Qwen2.5-VL-7B + DMD-distilled edge variant; T2V/I2V/TI2V. **KEY: open release is video-gen ONLY — no action head despite PR's "action prediction" claim** (verify-don't-assume). Real open-source (Apache-2.0, weights on HF). Challenges the "pixel-level WM unsuitable for edge" assumption
- [[Guo et al. - NeuroVLA Brain-inspired Neuromorphic Cortex-Cerebellum-Spinal VLA]] — **brain-inspired three-layer VLA** (HKUST-GZ Hui Xiong × AI2 Robotics): cortex (Qwen-VL+Q-Former) plans, cerebellum (GRU+FiLM) stabilizes @200Hz, **spinal = SNN on neuromorphic FPGA** (0.4W, 2.19ms, <20ms reflex). First neuromorphic VLA on real robots (self-claimed); jerk −75.6%, collision recovery 54.8% vs 0% (all **custom metrics on self-designed real-robot tasks — NOT a standard success-rate leaderboard**; OpenVLA/-OFT/UniVLA/WorldVLA comparison is a qualitative bar chart with no published numbers, LIBERO only in an internal ablation). Real open-source. Adds **neuromorphic/SNN as an edge-efficiency route** parallel to [[VLA quantization]]; independently corroborates the cortex/cerebellum/spinal stack but on a bio-structural+compute axis, NOT the deployment axis (its 3 layers are all on-board)
- [[Qi et al. - Humanoid-GPT (AstraBrain-WBC) Scaling Data and Structure for Zero-Shot Motion Tracking]] — **whole-body-control cerebellum FM** (Galbot 银河通用; product name **AstraBrain-WBC 0.5**, paper **Humanoid-GPT** arXiv:2606.03985 / **CVPR 2026**): GPT-style causal Transformer distilled from hundreds of RL experts → per-joint PD targets; demonstrates a **scaling law for motion control** (tracking SR 76.89%→92.58% as data 2M→2B frames, params 0.25M→80.4M); 0.39ms / <1.5ms RTX 4090; Unitree G1. **Apache-2.0 but inference+ckpt only — training code/data still TODO**. PDF+code-verified; "AstraBrain=Humanoid-GPT" is a strong inference (same Galbot authors/org, specs match), paper itself never says "AstraBrain". **Not a VLA** (pure motion tracker). NOT to be confused with [[Galaxea 星海图]]
- [[AgiBot - BFM-2 Motion-Between Whole-Body Motion Foundation Model]] — AgiBot 智元's **运动小脑** (generative whole-body-control FM; two-stage "Motion-Between" + DOF Feather Motion Generator; models the full-body dynamics state-space distribution → generates a trajectory from *any* state to *any* target → disturbance rejection / balance recovery / get-up). **⚠️ vendor PR-only: no paper, no code, no params disclosed** — the least-verifiable of the L2 cerebellum FMs (contrast Humanoid-GPT). Closed-loop only at the control/recovery level (L1), not cognitive
- [[Maes et al. - LeWorldModel (LeWM) Stable End-to-End JEPA from Pixels]] — **LeCun 等的极简端到端 JEPA 世界模型**(arXiv:2603.19312):仅两损失(下一步 latent 预测 + **SIGReg** 高斯正则,可证防塌缩),无 EMA/stop-grad/预训练 encoder/重建/奖励;超参 6→1 vs PLDM。**~15M 单卡**,latent 规划比 DINO-WM **快 ~48×**(token 少 ~200×),Push-T/OGBench-Cube 固定 FLOPs 胜出;latent 编码物理量 + 违反预期(surprise)检测。开源。归 Predictive Spatial / 潜在世界模型;**边缘 WM 轻量候选**(对照 Kairos 像素 WM)。PDF 全文自读核实
- [[Chen et al. - LaWAM Latent World Action Models for Efficient Dynamics-Aware Robot Policies]] — **隐空间 World-Action Model**(arXiv:2606.15768;清华/北大等 + 无问芯穹):在冻结 **DINOv3** latent 空间训 latent-action model,**把其 decoder 复用成世界模型(LaWM,230M)**,单次前向出"隐视觉子目标"喂 Alternate-DiT 动作专家。**比像素 WAM 世界建模参数 -95%、延迟 -24×(187ms)**,LIBERO 98.6%/RoboTwin 91.22%(**标准榜**)。WAM 第五代(跳出像素空间);JEPA/DINO 隐预测 + latent-action 谱系交汇。代码未见明确开源。PDF 自读核实
- [[Xu et al. - FAIL-Detect Uncertainty-Aware Runtime Failure Detection for Imitation Learning Policies]] — **"检测失败，但不需要失败数据"**（**Toyota Research Institute**，arXiv:2503.08558）。把问题重构为**序贯 OOD 检测**，两阶段：① 打分 `D_M(A_t,O_t)`，输入 = **最近 2 步观测 + 策略生成的未来动作**（刻意不喂增长历史，防过拟合）；② **conformal prediction 构造单侧时变 band**（从成功 rollout 算每时刻 μ_t 与带宽，**α 即误报率**；对比 STAC 的单一常数阈值）。**四类打分器**（学出密度 / 二阶分布 / 单类 / post-hoc）同框对比；最佳者 **logpZO**——用连续归一化流把观测**推进噪声空间**，分数 = **‖Z‖²**，**绕开直接算密度所需的高维散度积分**，仅 ~0.03–0.04 s/步。结论 **learned > post-hoc 且更快**（logpZO top-1 10/16）。真机 = **双臂 Franka 叠毛巾 / 擦洒漏**（OOD 由换色、加干扰物、人为拉扯制造）；**ID-only 校准即可覆盖 OOD**（冷启动无需预采 OOD）。⚠️ **与 Sentinel 的张力**：硬件上**没能实时跑 STAC**（每步 256 条采样，"slow to run on hardware in real-time"）⇒ "STAC 可端侧"需加限定
- [[Agia et al. - Sentinel Runtime Monitoring of Consistency and Progress for Generative Policies]] — **具身失败检测最完整的实证工作**（Agia/Pavone/Bohg 等，arXiv:2410.04640）。**失败分类学先于方法**：把失败分两类各配专用检测器——**erratic**（时间敏感但**视觉细微**）用 **STAC**：生成式策略 `k<h` 使 t 与 t+k 的 chunk **时间重叠**，比较两分布的**统计距离**，原理是"**分布内策略会同意自己刚才的预测，OOD 时自我矛盾**"（MMD+RBF，**策略无关、成本可忽略**，检出 **99%**）；**task-progression**（**视觉明显**但时间自洽）用**零样本 VLM**（GPT-4o/Claude 3.5/Gemini 1.5，输入=抽帧视频+任务+时限+已用时，三段式自问自答 prompt，**每 episode 仅查 2 次**、非阻塞）。并行 **>97%** 检出、**+18%** vs 单用任一；**真机 Push Chair 95%**。**⚠️ 两处证伪**：① 朴素"看采样方差"是**被 STAC 击败的 baseline**；② "必须采失败样本"——STAC 校准**只需成功 rollout**（同 FAIL-Detect *without failure data*）。**核心结论**：分层依据是**成本 × 紧迫性 × 信号模态**三维，第三维（两类失败在**不同表征空间**才可见）才是"必须有两个检测器"的根本原因
- [[Zeng et al. - HELM Harness-Enhanced Long-horizon Memory for VLA Manipulation]] — **"harness 直接建在 VLA 上"这一类的代表**（清华 + 阿里，arXiv:2604.18791）。与 Harness VLA 的关键差别：**VLA 仍是主执行者**，harness 只补它缺的三样。**立论靠对照实验**：LIBERO-SPATIAL(2.3 subgoal) 91.2% vs LIBERO-LONG(5.8 subgoal) 58.4%，而**把上下文 4× 加长只涨 +5.4pp** ⇒ 缺的不是窗口长度，是执行环的三个缺口：**memory**（丢弃已完成子目标证据——"t=47 时想不起 t=12 已把杯子放进柜子，于是重做一遍、污染状态"）/ **verification**（执行前无可行性检查）/ **recovery**（在被污染状态上继续、级联失败）。三个组件：**EMM**（CLIP-ViT-B/32 索引关键帧，写于子目标完成/失败/每 20 步，top-3 检索后**序列化成文本追加进 VLA 语言输入**）、**SV**（核心贡献：`P(fail|o,a,g,M)` 的**记忆条件化执行前失败预测**，3 层 MLP、**12ms/步**、单卡 A100 2h 训完；**去掉记忆 AUROC 0.847→0.791**）、**HC**（subgoal 栈 + 完成检测器；回滚 = **取历史关键帧当视觉目标、prompt "return to the state shown" 让 VLA 自己把世界开回去**，非 reset；最多 3 次；配 **HELM-Fwd** 前向变体应对不可逆场景）。**58.4%→81.5%（+23.1pp）**，F_R 降 82%。发布 **LIBERO-Recovery** 扰动注入恢复评测协议。**⚠️ 纯仿真无真机**；**SV 需失败标签**（对比 FAIL-Detect 只用成功数据）。金句：**"某动作是否有效往往取决于已经完成了什么——把已放好的东西再放一次，无论当前视觉上多可行都是失败"** ⇒ 把前置条件从**几何可行性**提升到**任务状态语义**
- [[Zhang et al. - Harness VLA Steering Frozen VLAs into Reliable Manipulation Primitives via Memory-Guided Agents]] — **具身 harness 的首个学术量化证据**（清华 + 无问芯穹等，arXiv:2607.08448，2026-07-09）。把**冻结的 π0.5** 降级成单个 primitive `vla_act`，与**固定小解析原语库**（move_to/rotate/set_gripper/release + 移动底盘）一起由 agentic planner 用 **JSON 调用**编排；**责任重分配**：语义接地/重绑定/运输/导航/重摆位/长程组合 → planner，**只有接触丰富的局部** → 冻结 VLA。三个机制值得记：① **接口载荷 = (prompt, 终止判据 τ)**——τ 可取 lift-and-grasp / contact-state / benchmark predicate / chunk budget，**一个参数把通用专家特化成多个局部专家，零权重改动**；② **两层判定**（执行中由环境按 τ 判何时停手；返回后由 planner 据观测+诊断记录分类 progress/可恢复/不可恢复）；③ **re-staging = 重选交棒点**（改 approach pose/viewpoint/staging，即在 `o₀` 上搜索把机器人送进 VLA 能力域），**不是回退世界**。**不微调** LIBERO-Pro **+38.6pp** / RoboCasa365 **+25.4pp** / RoboTwin C2R 58.4%。⚠️ **全仿真无真机；成功判据 = 仿真器 completion predicate 且已进入决策回路；τ 甚至可直接取 benchmark predicate；不可恢复失败只标注不处理** —— 源笔记设"**真机部署时无法实现的技术点**"专章（6 条 + 替换方案）。是 [[Harness design]]（此前仅靠两篇厂商博客）的首个实证支撑，也是 [[Alex Zhang - The Mismanaged Geniuses Hypothesis|MGH]] 在具身侧的强验证
- [[Heravi et al. - LEACL LLM-Enhanced Automatic Curriculum Learning for RL in Long-Horizon Manipulation]] — **LLM 增强的自动课程学习**(arXiv:2607.23515;UT Austin LARG / **Peter Stone** 等,2026-07-26)。核心创新 = **换掉 LLM 的输出目标**:不写 dense reward(LEAGUE++/Text2Reward/CurricuLLM 路线),而是生成 **ACL 缺的任务规格——参数化任务空间 + 难度排序**(PDDL 子任务 → Python 生成函数),再由现成 ACL(ADR/TeachMyAgent)**只用稀疏完成奖励** + PPO 训练。5 个 LIBERO+ 长程任务:**胜专家手工 dense reward 4/5**(后者在 T5 崩到 0.0、方差 ±50.6),人类课程仍胜 3/5 但 **T3 被反超**。**⚠️ 低维状态 PPO、非像素非 VLA、非标准 LIBERO 套件 → 分数不可与 LaWAM/G0.5/Motus 横比**;**⚠️ 原文正文 32.8% 与表内 11.8% 不一致(存疑)**。**关键反证:任务拆解+稀疏奖励≈0%——拆解解决长度/信用分配,不解决探索**。填补本库"课程学习/技能训练方法学"空缺;接 [[Cloud-edge co-evolving embodied agent - a continuous-evolution framework|云③技能工厂]]。HTML 全文自读核实

## Wiki

### Concepts
- [[LLM Wiki]] — persistent-wiki pattern for LLM-maintained knowledge bases
- [[Task decomposition]] — breaking large problems into solvable subtasks for LM systems
- [[Agent orchestration]] — how LM calls, tools, and subagents are coordinated
- [[Recursive Language Models]] — recursive structures for richer LM composition
- [[AI coding agents]] — LM systems that plan / spawn subagents / coordinate multi-step software work; the vault's mature evidence for the Mismanaged Geniuses Hypothesis
- [[Memory Policy]] — framing memory management as part of agent behavior and control
- [[Harness design]] — system scaffolding for long-running and structured agent work, extending upward toward meta-harness/platform abstractions
- [[3D Gaussian Splatting]] — explicit scene representation via 3D Gaussian blobs, real-time splatting rendering, and applications in embodied AI
- [[3D Spatial Representation]] — 理想 3D 空间表征的必要性、特征、语言类比，及 open research question
- [[Object-Centric Representation]] — 以物体为基本单元的场景表示方法，支持组合泛化
- [[Task Decomposition as OOD Mitigation]] — 把 OOD 任务拆成分布内子任务的跨簇论点（ReKep / RL Tokens / ChemBot / MGH）；[[Task decomposition]] 的 OOD 视角
- [[Robot data engine]] — **数据引擎概念页**：数据集 vs 引擎的判据、四部件（产出/加工/判别/评估）、核心结构"**昂贵金标准的多级代理层级 → 调度目标=最小化顶层金标准调用**"、生产型 vs 自演进型两形态、质量度量与算力瓶颈两个异构性、研究机会（为数据验证优化的调度=公开空白）
- [[Embodied failure detection]] — **具身失败检测的设计空间**（harness 侧收口；此前散在 dependability 脚手架 / 数据引擎 / harness 三处）。核心命题：**LLM agent 的 exception 是免费的，具身环境不报错 ⇒ harness 必须自己造 exception**。两个组织维度：**四类失败**（执行 / 语义 / 进展停滞 / 不可逆——现有工作多只覆盖第一类）× **三个时机**（事前防不可逆·事中端侧实时·事后云端裁决）；**七种机制按成本排序**（前后置条件契约 / 停滞超时 / 策略自身分歧 / 预期-实测 assertion / 学出的判别器 / 不确定求助 / 世界模型验证+安全脊髓），落地优先级 **1+2+3**（零标注零训练可端侧，吃掉执行失败+进展停滞两大类）。两个设计原则：**检测器也会过期**（load-bearing，目前无人做=研究机会）、**漏报/误报代价不对称且仿真里不存在**。推论：**判别器 = 数据引擎的质量信号 ⇒ 失败检测与数据飞轮是同一件事的两面**
- [[Real-robot evaluation]] — **真机评测作为测量学**（2026-08-06；[[Robot data engine]] 的姊妹页，边界=金标准视角 vs 测量仪器视角）：核心矛盾"**仿真可比不可信 / 真机可信不可比**"；三条判据（**任务 vs 条件**、**复位成本是与能力覆盖正交的第二维**、**难度校准到 40–70%**）；能力轴（8 条运动轴按"质变点"划分 + 指令/结构/泛化轴用 condition 实现）；统计现实（Clopper-Pearson，±10pp→±2pp 需 15× rollouts；二元化每次 rollout 只带回 1 bit）；**指标四层分层**（验收/检测/诊断/硬约束——只有验收需要绝对阈值）+ 平滑度的方向性漏洞（"什么都不做最平滑"）+ time-to-success CDF 严格包含成功率；外部框架对照（RoboDojo/ATOM-Bench/RoboLab/PhAIL/RoboArena）。**⚠️ 外部 benchmark 数字均来自 WebFetch 摘要器，未对照原文核实**
- [[Keypoint-based Manipulation]] — 以语义 3D 关键点表示场景 + 约束定义操控任务（ReKep 范式）
- [[Constrained Optimization for Robot Control]] — 把任务写成目标+约束再求解动作（vs 学习策略）；ReKep 的"执行半"
- [[VLA - Vision-Language-Action Models]] — **base concept / hub** for the VLA family: definition, boundaries (vs WAM / motion controller), architecture axes (actor-vs-encoder, Paradigm A/B), and the vault's VLA instances
- [[World-Action Models]] — WAM 范式：视频生成 backbone + 动作预测，架构演进与路线对比
- [[JEPA]] — Joint-Embedding Predictive Architecture(LeCun):**隐空间、非生成**的世界模型框架;谱系 I-JEPA→V-JEPA→**V-JEPA 2 / V-JEPA 2-AC**(Meta)/ DINO-WM / PLDM / [[Maes et al. - LeWorldModel (LeWM) Stable End-to-End JEPA from Pixels|LeWM]] + 防塌缩谱系(EMA/VICReg/SIGReg);JEPA vs 生成式对照。世界模型趋势讨论底座
- [[Embodied Brain Models]] — 大脑模型的部署驱动定义（云=大脑、端=小脑）、三个主流流派（LLM/VLM-as-brain, Predictive Spatial Models, VLA 特殊定位）、接口/方法学正交维度、前瞻预判（骨架页）
- [[Embodied Cerebellum Models]] — **大脑页的对位页**：小脑（端侧）模型——多速率控制栈（50Hz VLA→1kHz 控制→40kHz 伺服）、小脑四种来源、边缘部署技术（量化/蒸馏/线性注意力/AOT/chunking）、可靠性"脊髓"层（骨架页）
- [[Memory in Embodied AI]] — 隐式（程序性，端侧）vs 显式（episodic，云端）记忆的两层分工；各 VLA 工作的记忆状态表
- [[VLA quantization]] — VLA-specific low-bit quantization sub-cluster: why it differs from LLM quant (closed-loop error compounding, action-head sensitivity), the DyQ-VLA (dynamic mixed precision) vs Ω-QVLA (uniform W4A4 rotation) contrast, route mapping, and the cited landscape
- [[Visual token budget - pruning vs compression]] — 视觉 token 预算轴的两族解法：**剪枝**（EVS，原文逐表核实——position-ID 结论分情况、"4×"是 LLM-only、ViT 不省、论文 13× 自相矛盾）vs **压缩**（π0.7 MEM 固定预算 O(1)）；核心论点"视频理解侧收敛到剪枝、具身侧收敛到压缩，因量级差三个数量级"；含"Cosmos 3 技术报告 0 提 EVS，只是 NIM 部署层旋钮"的核实结论。[[VLA quantization]] 的姊妹效率页（压序列长度 vs 压权重位宽）

### Entities
- [[Alex Zhang]] — author associated with the Mismanaged Geniuses Hypothesis
- [[Andrej Karpathy]] — researcher associated with the LLM Wiki framing
- [[Anthropic]] — organization associated with Claude, harness design, and agent engineering work
- [[Prithvi Rajasekaran]] — author associated with long-running application harness design
- [[Claude Code]] — coding-agent style orchestrator-subagent system
- [[OpenClaw]] — agent orchestration environment and referenced scaffold
- [[Hermes Agent]] — agent scaffold referenced in discussion of longer-horizon decomposition
- [[Physical Intelligence (π)]] — VLA 头部实验室（π 系列；范式 A 源头）
- [[NVIDIA]] — 具身全栈玩家（GR00T VLA + Cosmos 世界模型 + Isaac 仿真 + Jetson 硬件）
- [[Figure AI]] — 美国人形 VLA（Helix 双系统，全端侧；闭源全栈）
- [[AgiBot 智元]] — 中国人形 + GO-1 ViLLA（latent action）+ AgiBot World 数据集（开源）
- [[Galaxea 星海图]] — 中国具身（G0 双系统 VLA，语言子任务接口；开源）
- [[Galbot 银河通用]] — 中国人形（王鹤 / 北大 EPIC；Humanoid-GPT / AstraBrain-WBC 全身运控小脑基座，真开源）**⚠️ ≠ [[Galaxea 星海图]]**
- [[Yann LeCun]] — 人物;JEPA / 世界模型路线倡导者(图灵奖)。本库收其 [[Maes et al. - LeWorldModel (LeWM) Stable End-to-End JEPA from Pixels|LeWM]](潜在世界模型)
- [[Sergey Levine]] — 人物;UC Berkeley + [[Physical Intelligence (π)]] Chief Scientist；π 系列（Paradigm A）背后的思想引擎
- [[Chelsea Finn]] — 人物;Stanford + [[Physical Intelligence (π)]] Research Lead；π 系列联合创始人，元学习（MAML）
- [[Li Fei-Fei]] — 人物;Stanford / World Labs；ReKep 出自其团队，空间智能旗手
- [[Song Han]] — 人物;MIT；SmoothQuant 资深作者，本库量化簇 reshaping 路线的谱系上游
- [[DeepCybo]] — 中关村孵化，PhysBrain（VLM-as-brain，人类视频路线）
- [[LimX Dynamics]] — 深圳足式+具身（ChemBot 完全分离双层架构）
- [[ACE Robotics]] — 上海具身世界模型（王晓刚/商汤系；Kairos 3.0 边缘生成式视频世界模型，对标 Cosmos；真开源）
- [[AI2 Robotics]] — 深圳脑启发/神经形态具身（郭彦东；NeuroVLA = cortex/cerebellum/spinal SNN VLA，HKUST-GZ 熊辉合作；真开源）
- [[GigaAI]] — 世界模型公司；GigaWorld-Policy（端到端 WAM，"训繁推简"）
- [[Stanford Vision and Learning Lab]] — 斯坦福视觉/机器人学习实验室（含 Li Fei-Fei）；ReKep 来源组之一
- [[Huawei]] — 昇腾（Ascend）AI 加速器；Ascend HiFloat8（FP8 数值格式设计路线）
- [[TARS 它石智航]] — 中国具身；Human-centric 穿戴式离机数采（TARS-Vision/Glove + Datacore 数据引擎；WIYH VLTA 触觉数据集）**⚠️ 全 vendor/media 口径，无论文**

### Topics
- [[Agent memory]] — topic page for memory as policy, decomposition, and self-managed memory in agent systems
- [[Harnesses and managed agent systems]] — topic page for harness design, managed-agent architecture, and long-running orchestration systems
- [[Model quantization]] — topic page for quantization, low-bit training, FP8-like formats, and numeric representation design
- [[Open questions in agent memory and decomposition]] — unresolved questions and research directions around decomposition, memory control, and meta-skills
- [[Spatial Intelligence for Embodied AI]] — 3D 空间表征、object-centric 表示、spatial modality 的研究方向汇总

### Syntheses
- [[Self-managing memory as an in-distribution control problem]] — synthesis on reframing memory management as decomposed control over write, retrieve, consolidate, and discard operations, with emphasis on decomposition policy
- [[Meta-skills for memory orchestration]] — synthesis on reusable higher-order skills for controlling memory operations and composing trainable memory subskills
- [[Home robot architecture - a hierarchical embodied agent]] — synthesis on the home general-purpose robot as a hierarchical embodied agent (cloud reasoner+world-model+memory over edge expert+safety+procedural skills); capability-vs-dependability gap, multi-level world-model necessity, key cloud/edge/privacy/disconnection tensions; where the vault's embodied and agent-memory lines converge
- [[Cloud-edge co-evolving embodied agent - a continuous-evolution framework]] — **端云协同持续演进框架**(与 Ethan brainstorm 共建):两核心(端侧推理-vs-学习算力争用 / 跨场景无协同)、边端三类(学得好/稳/协同)+ 云端四类 + 对称桥、**四关键技术(2+2)**、核心证据(Thor/Orin 算力带宽、训练 8× 显存、三计算机=Thor 仅推理)、open problems。是 [[Home robot architecture - a hierarchical embodied agent]] 的"持续演进/学习平面"展开
- [[Cloud-edge co-evolving embodied agent - figures and evidence]] — 上者的配图与证据附录:已核实硬数表(带来源)+ 7 张可重建 SVG(实时算力争用 / 孤岛-协同 / 成本标度 / CLS / Simplex 安全 / 模块化联邦 / 能力画像-契约共版本化)
- [[World model trends - architecture, scale, function, hardware]] — **跨公司世界模型趋势综述**(架构 / 规模 / 功能 / 训练硬件 / 推理硬件 五块):核心论点"**输出表征 = 总变量**",一手决定其余;含 Dreamer/Cosmos/Genie/Sora/Marble/JEPA 系速查表 + 一张"输出表征→五项"对照图。世界模型趋势讨论的总收口
- [[Embodied model function evolution - generalization as the master line]] — **具身模型功能演进重述**:端到端→大小脑协同→端云自闭环→**Agentic**,**以"泛化/可用性墙"为驱动**(泛化载体 模型→组合);含长程崩支点(p^N × 缺 L3)、例子池 + 脑/小脑配对表、可直接进汇报的论述。回应专家"需融入泛化不足"的反馈

- [[Future embodied Agent framework - integrated view]] — **整合入口**:把功能演进(why)/ 家庭架构(what)/ 端云 co-evolution(how)/ 地基(capability⟂dependability)缝成一页;含分层架构图 + "云↔端两条通道"整合点
- [[Real-robot eval bench - task suite design and setup checklist]] — **⚠️ 团队专属、有时效的可执行清单**（2026-08-06，[[Real-robot evaluation]] 的落地面）：桌面机械臂（单臂+双臂）、π0 微调平台上的评测任务集设计——现状诊断（8 轴覆盖 2.5 条，**双臂同步闭链是最大空白**）、Tier 0 回归底座 5 任务 / Tier 1 补空白 4 任务、抽屉任务专章（**自复位 ⇒ 唯一能拿到 n=300+ 的高精度回归探针**；把手类型=第一难度旋钮；v0→v3 升级路径吃到轴 8；三个坑：柜体固定/力矩保护单列/硬件漂移）、按 roadmap 挂载（推理优化/架构设计/仿真优化跑什么不跑什么）、立即可做五件事。**换本体或改 roadmap 后需重审**
- [[Real-robot data collection - teleop vs UMI-class, and the model-in-the-loop quality problem]] — **具身数据三层金字塔全景**(2026-07,deep-research+追问,按三层框架重组;文件名保留初版主题):三层特征对比→例子→趋势→评估体系→计算系统挑战五段式;UMI=桥、部署经验=第四类、阶段×数据矩阵、质量评估三代谱系+两级体系+A/B/C/D 辨析、昂贵金标准代理层级(L0–L3 评估栈)、供给侧五层优化(调度层空档=研究机会)、三层×算力形态收口;核实"星海图无 UMI 硬件产品";22 来源双路提取;遗留未核实项已于 2026-07-07 定点核实归位(RoboMIND/OXE/ALOHA/GELLO/Helix/SynGrasp-1B/robomimic/DreamGen/OSMO),vendor 口径以行内标注为最终状态

## Maps
- [[Home]] — top-level navigation page for the vault
- [[Agent systems, decomposition, and memory]] — navigation page for the cluster around agent architecture, decomposition, and memory control
- [[Embodied AI - VLAs, world models, and cerebellum]] — navigation hub for the embodied cluster (VLA models, world models, brain/cerebellum framework, VLA quantization); the vault's largest cluster's MOC

## System
- [[90 System/AGENTS]]
- [[90 System/log]]
- [[Vault linting]] — link-integrity linter (`scripts/vault_lint.py`) + usage
