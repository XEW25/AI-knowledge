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

### Core Method: Recap

1. **Offline RL pre-training**：在多任务多机器人数据集上训练通用 VLA π*₀.6
2. **Value function training**：分布值函数评估任务完成进度
3. **Advantage conditioning**：策略以二值化 advantage 为条件，从经验数据中提取改进策略
4. **Iterative deployment**：finetune → 自主收集 → RL 训练 → 循环

关键创新：advantage-conditioned policy extraction，避免了 policy gradient 目标在大 VLA 上的复杂性。

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
