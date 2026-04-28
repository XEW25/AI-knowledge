# π*₀.6: a VLA That Learns From Experience

- Canonical URL: https://arxiv.org/abs/2511.14759
- PDF URL: https://arxiv.org/pdf/2511.14759
- Source type: arXiv (URL-only, Tier 1)
- Accessed at: 2026-04-28T22:15:00+08:00
- arXiv ID: 2511.14759
- Authors: Physical Intelligence (Ali Amin, Kevin Black, Chelsea Finn, Sergey Levine, Karol Hausman, Brian Ichter, et al.)
- Year: 2025
- Blog: https://pi.website/blog/pistar06

## Raw capture

### Abstract

Recap (RL with Experience and Corrections via Advantage-conditioned Policies)：让 VLA 通过真实世界部署的 RL 自我改进。融合异构数据：demonstrations + on-policy data + 专家干预。预训练通用 VLA (π*₀.6) → 下游任务特化 → 自主数据收集 → 多轮迭代。

### Core Method: Recap（详细）

**三步循环**：① 数据收集 → ② 训练值函数 → ③ Advantage-conditioned 策略训练 → 重复

**① 数据收集**
- VLA 自主执行任务，每条 episode 打标签（成功/失败 → reward）
- 可选人类干预纠错（human-gated DAgger），提供正确动作示范

**② 训练分布值函数 V^π_ref**
- 用所有数据（演示 + 自主尝试 + 人类干预）训练多任务值函数
- 判断"当前离任务完成多远" + "是否已失败"
- 分布值函数（非单点估计），捕捉回报不确定性

**③ Advantage-conditioned 策略训练（核心）**

数学直觉：把 policy improvement 转化为 classifier-free guidance (CFG) 式条件生成。

1. 计算每个 (o,a) 的 advantage A(o,a) = n-step return - V(o)
2. 标记二值 indicator I = 1(A(o,a) > ε_ℓ)，ε_ℓ 是任务相关阈值
3. 训练目标：min -log π(a|o,ℓ) - α·log π(a|I,o,ℓ)
   - 第一项：正常模仿学习（学行为策略）
   - 第二项：额外学"给定好/坏标签时的策略"
4. 人类干预数据强制标 I=1（假设专家总是对的）
5. 推理时：直接设 I=1，策略偏向高质量动作

**训练目标公式**：
```
min_θ E[-log π_θ(a_t|o_t,ℓ) - α·log π_θ(a_t|I_t,o_t,ℓ)]
where I_t = 1(A^{π_ref}(o_t,a_t,ℓ) > ε_ℓ)
```

连续动作用 flow matching，离散用 log-likelihood，组合训练。

**阈值 ε vs CFG 权重 β**
- 之前 CFGRL 用 ε=0 + 调 β（类似 diffusion CFG weight），但高 CFG weight → 动作分布极端/激进
- π*₀.6 改用任务相关阈值 ε 控制什么算"好动作"，更稳定

**为什么比 PPO 好？**
- PPO：在线采样 → 计算梯度 → 更新，大 VLA 不稳定
- Recap：完全离线，标记数据后像条件生成模型一样训练
- 训练与推理解耦：推理时不需要值函数，只需设 I=1

**Pre-training phase**：在数万小时多任务多机器人演示数据上做步骤②③
**Finetuning phase**：下游任务 demonstrations → finetune → 自主收集 → 多轮迭代

**关键创新**：把 RL 问题转成 conditional generation 问题。不要直接用 RL 优化策略，而是用值函数给数据打标签（好/坏），训练策略在推理时"选择好的"。

### Model Details

- π₀.6 是 π₀.5 的升级：更大 backbone + 更多样化 conditioning
- π*₀.6 在 π₀.6 基础上加 advantage conditioning 能力
- 使用 flow matching VLA（不是离散动作或简单高斯）
- 端到端训练整个 VLA，不是只训 residual/addon

### Results

- 折叠衣物：真实家庭中连续运行 2+ 小时不中断
- 组装箱子：工厂实际包装用
- 制作浓缩咖啡：连续运行 13 小时
- 最难任务上 throughput 翻倍，failure rate 减半
- 对比 PPO 等 policy gradient 方法显著更优

### Key Quotes

> "practice makes perfect... these models will need to practice a skill to achieve mastery"

> "for the first time, a general-purpose RL recipe with human reward feedback and interventions can significantly improve both robustness and throughput of VLA models"

### Relation to RL Tokens

π*₀.6 和 RL Tokens 都来自 Physical Intelligence，但路线不同：
- **π*₀.6 (Recap)**：在 VLA 本身上做 RL，端到端改进整个模型
- **RL Tokens**：冻结 VLA backbone，只训小网络 actor-critic 在 RL token 上

π*₀.6 是"全模型 RL"，RL Tokens 是"轻量级 RL 插件"。
