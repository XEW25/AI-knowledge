# Guo et al. - NeuroVLA: A Brain-inspired Embodied Intelligence for Fluid and Fast Reflexive Robotics Control

- **Type**: arXiv paper (cs.RO, cs.AI)
- **Authors**: Weiyu Guo, He Zhang, Pengteng Li, Tiefu Cai, Ziyang Chen, Yandong Guo, Xiao He, Yongkui Yang, Ying Sun, Hui Xiong（10 人）
- **Organizations**: **香港科技大学（广州）AI Thrust（熊辉 Hui Xiong 组）** + **AI2 Robotics（深圳；郭彦东 Yandong Guo）**
- **arXiv**: [2601.14628](https://arxiv.org/abs/2601.14628)（v1 2026-01-21）
- **Code**: ✅ **真开源** https://github.com/guoweiyu/NeuroVLA （Python，258★，~53MB，含 `NeuroVLA/` 包 + `deployment/`/`scripts/`/`examples/`——已核实非项目页）
- **Accessed**: 2026-06-16
- **Raw**: URL-only（Tier 1）

> **定位**：NeuroVLA 是一个 **脑启发三层 VLA**——皮层（cortex）规划、小脑（cerebellum）稳定、脊髓（spinal）执行，且**脊髓层是跑在神经形态 FPGA 上的脉冲神经网络（SNN）**。它给本库带来两样新东西：① 一条与 [[VLA quantization]] 平行的**全新边缘能效路线——神经形态/SNN 计算**（0.4W、<20ms 反射）；② 一个对刚建的 [[Embodied Cerebellum Models]] 三层框架的**一手外部印证 + 一处直接挑战**（见下）。
>
> ⚠️ **命名警告**：NeuroVLA 的 **cortex/cerebellum/spinal 是生物结构 + 算力基底（CUDA vs 神经形态芯片）的划分，且三层全在端侧（on-board）**；与本库部署驱动的 **大脑（云）/小脑（端）/脊髓（经典 MCU）** 轴**不是一回事**（类比 TwinBrainVLA"左右脑"≠ 云端脑）。对应关系见末节。

## Model Paper Checklist

| # | 维度 | 信息 |
|---|------|------|
| 1 | 模型架构 | **三层脑启发**：**Cortex** = Qwen-VL（VLM）+ **Layer-wise Q-Former** → 语义潜向量 z_sem (K×D_action)；**Cerebellum** = **GRU**（本体感受状态估计）+ **Gated FiLM**（增益调制），K=2 次内部递归预测感觉后果 → z_mod；**Spinal** = **SNN**（LIF，Deep Spiking Residual `x^(l+1)=x^l+LIF(Linear(x^l))`），"Continuous Integration Protocol"：输出运动神经元只累积不发放 → 平滑连续动作 a_t |
| 2 | 模型规模 | 未单列；核心轻量（脊髓 SNN 部署仅 0.4W）|
| 3 | 训练数据 | sim：LIBERO + LIBERO-Plus；真机：双臂人形平台采集（试管搬运/倒液/整理/弃废/摇瓶/碰撞恢复）|
| 4 | 训练方法 | SNN 用 **surrogate gradient**（Heaviside 用 fast sigmoid σ(x)=x/(1+|x|) 近似）|
| 5 | 推理性能 | 脊髓 SNN：神经形态 FPGA 上 **2.19ms/推理、0.87mJ/推理、0.4W、20MHz**；安全反射 **<20ms**（皮层环 >200ms）|
| 6 | 开源状态 | ✅ 真开源（代码 + 部署脚本；真机数据需联系作者）|
| 7 | Benchmark | ⚠️ **非标准成功率榜**（详见"评测设计"节）：主证据为自设计"生物运动特性"——jerk −75.6%（MACJ，峰值 yaw 80.2%/Z 80.0%）、accel −32.8~58%（MACA）、碰撞恢复 54.8%（vs 0%，"Recover to Safe Area"压力测试），**均为自定义指标 + 真机自设计任务**。LIBERO 仅用于**内部消融**（Fig 5d，自家 SNN 变体间）；vs OpenVLA/-OFT/UniVLA/WorldVLA 为**定性柱状图（Fig 8，无公布数字）** |
| 8 | 与已有工作关系 | 三层框架印证 [[Embodied Cerebellum Models]]；神经形态/SNN = [[VLA quantization]] 之外的新边缘能效路线；VLM 皮层用 Qwen-VL |
| 9 | 记忆机制 | **SNN 膜电位**做隐式时序工作记忆（stateful LIF u[τ]，无 LSTM）+ 小脑 GRU 时序上下文 → [[Memory in Embodied AI]] |

## Summary

NeuroVLA 把生物神经系统的"皮层-小脑-脊髓"分工搬进 VLA：高层 VLM（皮层）按 ~10Hz 出语义目标，GRU+FiLM 小脑模块用 200Hz 本体感受/六维力反馈做增益调制压住"意图抖动"，脊髓 SNN 在神经形态 FPGA 上以毫秒级把调制后的潜向量解码成平滑连续动作。卖点是**无需额外数据/特殊引导就涌现出生物运动特性**：消除机械臂抖动、极低功耗（0.4W）、SNN 膜电位带来的时序记忆、<20ms 安全反射。自称"**首个在真实机器人上部署的神经形态 VLA**"（first 声明，标注为自报）。

## 评测设计（用户核查后修正）

⚠️ **NeuroVLA 不以标准成功率榜（LIBERO / RoboTwin leaderboard）为主证据**——核心是**自设计的"生物运动特性"评测**：

- **自定义指标**：MACJ（jerk）、MACA（accel）、"Recover to Safe Area" 碰撞恢复率、神经形态能耗（0.4W / 0.87mJ / 2.19ms）、力扰动反射延迟（<20ms）、"shake the cup" 节律时序记忆。
- **任务全是自设计真机实验室任务**（试管搬运 / 倒液 / 摇瓶 / 整理 / 弃废 / 碰撞恢复），跑在双臂人形上；**RoboTwin 完全没用**。
- **LIBERO 仅出现在内部消融**（Fig 5d：自家 Multi-step SNN vs Single-step vs No-Cerebellum），**不与外部基线对比**。
- **vs OpenVLA / OpenVLA-OFT / UniVLA / WorldVLA**：Fig 8a–e 是**定性柱状图**，"consistently outperforms" 但**图/正文均无数字**。

**两面看**：一面是**刻意取向**——他们要证明的是"涌现的生物运动特性"（平滑、反射、能效、节律记忆），而非 leaderboard 成功率；另一面是**严谨性缺口**——缺一张正经成功率对比表，对 SOTA 的"超越"无数字支撑，**引用时不可当量化胜出**。

## 架构精度（已核实 v1 + 代码存在）

- **三层 + 双算力基底**："high-latency 视觉-语言处理放 **CUDA Computing Tier**（皮层），high-frequency 本体感受调制与反射 offload 到 **Neuromorphic Chip Tier**（小脑/脊髓）"——**全部 on-board，不涉及云**。
- **神经形态的核心是脊髓 SNN**：小脑模块是 GRU+FiLM（**常规网络**，非 SNN，只是 stateful）；真正跑在自研 LIF 脉动阵列 FPGA 上的是脊髓 SNN。所以"neuromorphic VLA"的实质 = **脊髓层用 SNN**，不要误读成三层全 SNN。
- **<20ms 安全反射 = "前庭小脑环"**：六维力 wrench 检测到接触 → 小脑-脊髓电路本地触发回撤（FiLM 把前向速度 γ≈−1 抑制 + 注入回撤偏置 β），**绕过慢皮层环**。
- **时序记忆 = 膜电位**：LIF 的 u_i[τ]=β·u_i[τ−1]+Σw·s−s·ϑ 跨步保留 → 隐式工作记忆。

## 在库里的落子：印证 + 挑战 + 新轴

**① 三层功能分解：对 [[Embodied Cerebellum Models]] 的一手印证。**
NeuroVLA 的 cortex/cerebellum/spinal 与本库刚建的"大脑/小脑/脊髓"三层功能分解（语义规划 / 高频稳定 / 快速反射执行）高度同构——这是对该框架的独立外部印证。

**② 但两条轴不同（关键区分，勿混）：**

| | 本库框架 | NeuroVLA |
|---|---|---|
| 划分轴 | **部署**：云=大脑 / 端=小脑 | **生物结构 + 算力基底**：CUDA tier vs 神经形态芯片 tier |
| 部署位置 | 大脑在云、小脑在端 | **三层全在端侧（on-board）** |
| "脊髓"是什么 | **经典** MCU / PD / FOC（不学习）| **学习的 SNN**（神经形态反射）|

所以 NeuroVLA 的"皮层"是本库"大脑"的功能但部署在端；它的"脊髓"不是本库那条经典 kHz 伺服层，而是一个学习出来的快速反射 SNN。

**③ 直接挑战本库一条论断（verify-don't-assume）。**
[[Embodied Cerebellum Models]] 原写"学习边界止于 PD 之上、脊髓/反射层保持经典"。NeuroVLA **把一个学习的 SNN 放进了 <20ms 反射层**——说明反射层**可以是学习的神经形态电路**，不必经典。需据此软化该论断（kHz 电机 FOC 环大概率仍经典，但"安全反射/快速动作生成"这一子层已被证明可由学习 SNN 承担）。

**④ 新边缘能效路线：神经形态/SNN，与量化平行。**
[[VLA quantization]] 走"常规加速器上低比特"；NeuroVLA 走"神经形态芯片上事件驱动 SNN"（脉冲稀疏、0.4W）。二者是**正交的两条把 VLA 塞进端侧的路线**——库里第一次出现神经形态这条。

## Why It Matters

- **三层框架的独立印证**：一个完全独立的团队用生物结构语言复现了本库的三层功能分解——增强框架可信度。
- **神经形态是被忽略的边缘维度**：在"量化/蒸馏/线性注意力"之外，SNN+神经形态芯片提供了量级不同的能效（0.4W、<20ms），尤其契合小脑的硬实时+低功耗约束。
- **学习下探到反射层**：把"学习边界停在 PD 之上"这条判断往下推了一格——反射可学习（但仍受快速、专用、可验证约束）。
- **真开源 + 真机**：代码与部署脚本齐全，双臂人形真机结果，可复现性高。

## Related Concepts

- [[Embodied Cerebellum Models]] — 三层框架的对位印证；反射层可学习的挑战；神经形态边缘路线
- [[Embodied Brain Models]] — 部署驱动框架；NeuroVLA 的生物结构轴是另一种组织方式
- [[VLA quantization]] — 平行的边缘能效路线（低比特 vs 神经形态/SNN）
- [[Memory in Embodied AI]] — SNN 膜电位做隐式时序记忆（新机制）
- [[Figure AI - Helix a VLA for Generalist Humanoid Control]] — 同为双/多系统、含高频执行头的对照

## Related Entities

- [[AI2 Robotics]] — 出品方之一（郭彦东 / 深圳）
- 香港科技大学（广州）熊辉组 — 学术主导（待建实体页）
- [[Physical Intelligence (π)]] — VLA 对照

## tags

#vla #neurovla #neuromorphic #snn #spiking-neural-network #cerebellum-model #brain-inspired #edge-deployment #safety-reflex #hkust-gz #ai2-robotics #china #open-source #embodied-ai
