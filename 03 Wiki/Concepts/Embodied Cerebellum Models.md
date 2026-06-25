# Embodied Cerebellum Models

> **状态**：骨架页（survey-skeleton）。结构与核心判断已固化，深度展开与代表工作分析待后续填充。本页是 [[Embodied Brain Models]] 的对位页——大脑框架的"另一半"。

## 定义

"小脑模型"指负责**低层反应控制、实时执行、安全兜底**的模型。沿用本库的 **部署驱动** 定义（与 [[Embodied Brain Models]] 同一框架）：

- **大脑 (Brain)** ≡ 部署于云侧 / 计算中心的模型（语义、规划、记忆、学习）
- **小脑 (Cerebellum)** ≡ 部署于机器人本体 / 端侧 / 边缘设备的模型（反应、执行、安全、感知）

部署位置推导出的功能差异表见 [[Embodied Brain Models#部署位置推导出的功能差异]]。本页聚焦小脑这一侧。

## 为什么"小脑"是一个独立问题，而不只是"小一号的大脑"

小脑的约束**质不同于**大脑——不是"参数更少的规划器"，而是受三条硬约束支配：

1. **硬实时**：控制有 deadline，延迟**方差（抖动）**比均值更致命。P99 延迟决定系统能否闭环，而非平均延迟。
2. **可靠性 > 能力**（capability vs dependability gap，见 [[Home robot architecture - a hierarchical embodied agent]]）：小脑宁可能力封顶，也必须可预测、可验证、断网可活。
3. **多速率分层**：小脑不是一个模型，而是一条**频率阶梯**——越往下频率越高、智能越低、确定性越强、可学习性越弱。

## 小脑的内部分层：频率/智能/确定性梯度

这是小脑区别于大脑最本质的结构——一条对称的速率变换链（详见 [[Embodied Brain Models]] 之外的部署讨论）：

| 层 | 跑在哪 | 频率 | 职责 | 可学习？ |
|----|--------|------|------|---------|
| **端脑核心 / VLA action expert** | 端侧 GPU/NPU | 1–50Hz | 出 action chunk | ✅ 学习 |
| **chunk 消费 + 安全层** | 端 CPU（普通进程）| 20–50Hz | pop 动作、反归一化、限幅限速 | 部分 |
| **全身/关节空间控制** | 端 CPU **实时进程**（PREEMPT_RT）| 100Hz–1kHz | 阻抗律、重力补偿、IK、插值 | **边界** |
| **关节伺服环（"脊髓"）** | 驱动板 **MCU/DSP/FPGA** | 1–40kHz | PD / FOC 电流环 | ❌ 经典 |

**关键判断**：学习组件的领土在持续下移（规划→轨迹→WBC 都被 RL/VLA 蚕食），但**边界至今停在 PD 环之上**——再往下没有泛化收益、只剩认证成本（PD/阻抗有 Lyapunov/无源性稳定性证书，神经网络给不出）。**kHz 伺服层是小脑的不失守底线**。

> ⚠️ **反射层正被学习蚕食（待复现验证）**：[[Guo et al. - NeuroVLA Brain-inspired Neuromorphic Cortex-Cerebellum-Spinal VLA|NeuroVLA]] 把一个**学习的 SNN** 放进 <20ms 安全反射层（神经形态 FPGA 上），说明"反射"这一子层可由学习神经形态电路承担。修正后的判断：边界已从"PD 之上"下探到**反射层**；但 kHz 电机 FOC 环大概率仍是经典底线。

## 小脑模型的四种来源/形态

| 形态 | 怎么来的 | 代表 |
|------|---------|------|
| **① VLA action expert 下端** | 一体化 VLA 在云-端压力下裂解，action expert 蒸馏/拆分到端侧 | π 系列裂解（[[Embodied Brain Models]] 的核心预判）|
| **② 原生快系统 fast head** | 双系统架构里天生的高频执行头 | [[Figure AI - Helix a VLA for Generalist Humanoid Control\|Helix S1]]（80M@200Hz）|
| **③ 边缘世界模型** | 把"想象/预测"压到端侧实时 | [[ACE Robotics - Kairos 3.0 a Real-Time Generative Video World Model\|Kairos 3.0]]（4B 视频世界模型冲 Jetson Thor）|
| **④ 经典控制层** | 不是学出来的——PD/阻抗/伺服 | 任何机器人的底层栈（永远端侧、永远经典、可靠性兜底）|

## 使能边缘部署的关键技术

把大模型塞进端侧需要多个乘法因子各砍一刀（[[ACE Robotics - Kairos 3.0 a Real-Time Generative Video World Model\|Kairos]] 是三件套同用的范例）：

- **蒸馏（两种正交）**：**尺寸蒸馏**（大 VLA→小 expert，参数变少）+ **步数蒸馏**（DMD 等把 flow-matching/扩散从几十步压到 1–4 步，参数不变）。二者可叠加。
- **量化**：见 [[VLA quantization]]——VLA 低比特不是 LLM 量化的直接套用（闭环误差累积、action-head 敏感）。是小脑落地的核心技术簇。
- **混合线性注意力**：O(n²)→O(n)（[[ACE Robotics - Kairos 3.0 a Real-Time Generative Video World Model\|Kairos]] 用 GatedDeltaNet 1-in-4 混合）压单步算力。
- **图编译 / AOT**：端侧偏 AOT（TensorRT engine / 昇腾 .om）——把编译成本挪到构建期，端上只剩"加载+触发"；配 CUDA Graph / 整图下沉把每次推理的几百次 kernel 发射压成一次。静态形状的 FM 路线天然图编译友好；AR 路线（解码长度变化）是反例。
- **action chunking + 实时拼接**：一次推理出一段动作块、缓冲队列逐步出队，掩盖推理延迟；块边界的不连续由 PI 的 **Real-Time Chunking（RTC）** 等处理。
- **神经形态 / SNN 计算**（与以上正交的新路线）：事件驱动脉冲神经网络跑在神经形态芯片上，脉冲稀疏 → 量级更低的功耗/延迟。[[Guo et al. - NeuroVLA Brain-inspired Neuromorphic Cortex-Cerebellum-Spinal VLA|NeuroVLA]] 的脊髓 SNN 在 FPGA 上 **0.4W / 2.19ms / <20ms 反射**。区别于量化（[[VLA quantization]]，常规加速器低比特）——这是把 VLA 塞进端侧的**另一条轴**。

## 与大脑的接口（从小脑侧看）

小脑从大脑收什么、带宽多大，决定了哪部分模型必须为端侧编译部署。接口谱系（压缩度从高到低）见 [[Embodied Brain Models#两层耦合框架（系统级接口 vs VLA 内部耦合）]]：单 latent 向量（Helix）/ latent action token（GO-1）/ 语言子任务（G0、ChemBot）/ subgoal image（π₀.7）/ action chunk。**低带宽接口（语言/latent）才能容忍云-端那一跳；高带宽（action）只能端侧或同址。**

## 可靠性脚手架（dependability scaffolding）

小脑的真正难点不在能力上限，而在 dependability（见 [[Home robot architecture - a hierarchical embodied agent]]）：

- **监控 / 恢复 / 验证 / 安全反射**：端侧必须能检测失败、回到安全姿态、不依赖云。
- **"脊髓"层**：驱动板 MCU 反射层不跑任何学习组件、不依赖任何图编译产物——模型挂了、断网了，它照样以 kHz 跑，是系统可靠性的最后兜底。家庭机器人 synthesis 说的"端侧安全反射"，物理落点就在这一层。

## 端侧记忆

小脑侧的记忆主要是**隐式 / 程序性记忆**（procedural）——可重复技能内化进权重（见 [[Memory in Embodied AI]]：隐式记忆→底层执行模型）。与云端的显式 episodic 记忆分工：端侧存"怎么做"（肌肉记忆），云端存"做什么"（策略经验）。具体的双记忆架构落地见 [[Home robot architecture - a hierarchical embodied agent]]。

## Open Questions

- **裂解断点在哪**：一体化 VLA 拆成"云大脑 + 端小脑"时，切口落在哪个接口？（范式 B 的干净 embedding 断点 vs 范式 A 的逐层 KV——见 [[Embodied Brain Models]]）
- **学习边界会不会跌破 PD 环**：变阻抗/学习型力控会不会把神经网络推进 kHz 层？还是认证成本永远挡住？
- **边缘世界模型可行性**：[[ACE Robotics - Kairos 3.0 a Real-Time Generative Video World Model\|Kairos]] 式像素级世界模型能否真在端侧实时闭环？（其开源版无动作头，只是部分验证）
- **端侧自适应**：小脑能否在不回云的情况下做有限的在线适应，而不破坏可靠性？
- **可验证性责任在哪一层**：安全与认证落在小脑、脊髓、还是大脑？

## 前瞻预判

**注意**：分析性预测，非事实陈述。

**2–3 年内（高确定性）**：
- action expert 单独存活并标准化下端（[[Embodied Brain Models]] 已记此预判；G0.5 可选 FM head、Helix S1 已是雏形）
- 量化/蒸馏成为小脑标配工具链（[[VLA quantization]] 簇已在快速成形）
- 端侧 NPU（Jetson Thor 之后再上档）扩大可下端的模型规模

**5 年外（押注性）**：
- 小脑核心从"蒸馏的 action expert"演化为独立设计的端侧架构
- 边缘世界模型（若 Kairos 路线兑现）把"想象"从云脑下放到端
- "脊髓"经典层依旧不失守——可靠性底线不交给学习组件

**反向假设**：端侧硬件爆发到能直接跑整个 VLA → 云-端裂解框架被颠覆，小脑不需要单独存在。

## Related

- [[Embodied Brain Models]] — 对位页（大脑侧）；部署驱动框架、三流派、接口谱系
- [[Home robot architecture - a hierarchical embodied agent]] — 把大脑/小脑/脊髓分层落到家庭机器人的具体架构；capability-vs-dependability
- [[Cloud-edge co-evolving embodied agent - a continuous-evolution framework]] — 端云持续演进框架;关键技术 T1(高效自演进)/T2(安全)正落在小脑层
- [[VLA quantization]] — 小脑落地的核心技术簇（低比特边缘部署）
- [[Memory in Embodied AI]] — 端侧隐式/程序性记忆
- [[Figure AI - Helix a VLA for Generalist Humanoid Control]] — 原生快系统 S1（小脑形态②）
- [[ACE Robotics - Kairos 3.0 a Real-Time Generative Video World Model]] — 边缘世界模型（小脑形态③）+ 三件套边缘技术
- [[Guo et al. - NeuroVLA Brain-inspired Neuromorphic Cortex-Cerebellum-Spinal VLA]] — 三层框架（皮层/小脑/脊髓）的一手印证；学习 SNN 反射层；神经形态边缘路线。⚠️ 其 cortex/cerebellum/spinal = 生物结构+算力轴、全在端侧，≠ 本页部署轴
- [[World-Action Models]] — 世界模型路线（部分可下端）

## tags

#cerebellum-model #embodied-ai #cloud-edge #edge-deployment #real-time-control #survey-skeleton #taxonomy
