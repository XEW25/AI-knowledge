# Physical Intelligence (π)

- **Type**: Company / Research Lab
- **Website**: https://pi.website
- **Founded**: 2024
- **Headquarters**: San Francisco, CA
- **Founders**: Karol Hausman, Brian Ichter, Sergey Levine (advisor)
- **Focus**: General-purpose robot foundation models (VLA)
- **Flagship product**: π series VLA models

## 产品线

### π₀ (2024)
- Physical Intelligence 的第一个 VLA 模型
- Flow matching for action generation
- 基于 VLM backbone
- Paper: "π₀: A Vision-Language-Action Flow Model for General Robot Control"

### π₀.5 (2025)
- π₀ 的升级版，open-world generalization
- 多机器人平台
- Paper: "π₀.5: A Vision-Language-Action Model with Open-World Generalization"

### π₀.6 (2025)
- 更大 backbone + 更多样化 conditioning
- 基础 VLA 模型（非 RL 版本）
- Blog: https://pi.website/blog/pistar06

### π*₀.6 (2025)
- π₀.6 + advantage conditioning（RL 版本）
- 核心方法：Recap（RL with Experience and Corrections via Advantage-conditioned Policies）
- 端到端 offline RL，融合 demonstrations + 自主经验 + 人类干预
- 论文: arXiv:2511.14759
- Source note: [[Physical Intelligence - pi0.6 a VLA That Learns From Experience]]

### RL Tokens (2026)
- 冻结 VLA backbone + 小网络 actor-critic
- 在 RL token 上做高效在线 RL
- 精密操作特化
- Source note: [[Physical Intelligence - RL Tokens Precise Manipulation with Efficient Online RL]]

## 两条 RL 路线

PI 同时探索了互补的两条 RL 路线：
- **π*₀.6 (Recap)**：全模型 RL，端到端改进整个 VLA → 通用能力提升
- **RL Tokens**：轻量级 RL 插件，冻结 backbone → 精密操作特化

这呼应了能力层级拆解的思路：不同粒度的改进可能需要不同策略。

## 核心团队（论文作者）

- **Karol Hausman** — Co-founder/CEO
- **Sergey Levine** — Co-founder/Advisor (UC Berkeley)
- **Brian Ichter** — Co-founder
- **Chelsea Finn** — Stanford, 频繁合作者
- **Kevin Black**, **Danny Driess**, **Karl Pertsch**, **Allen Z. Ren**, **Lucy Xiaoyang Shi** 等

## 与知识库主题的关联

- [[VLA - Vision-Language-Action Models]] — PI 是 VLA 路线的主要推动者
- [[Agent memory]] — π*₀.6 的从经验学习 = 隐式记忆，RL Tokens = 隐式肌肉记忆
- [[Task decomposition]] — PI 的两条 RL 路线体现了不同粒度的能力拆解
- [[World-Action Models]] — WAM vs VLA 路线对比
- [[Huang et al. - ChemBot Long-Term Memory for VLA-based Agents]] — ChemBot 的 Skill-VLA 基于 GR00T（NVIDIA），与 PI 竞争

## Related

- [[Physical Intelligence - pi0.6 a VLA That Learns From Experience]]
- [[Physical Intelligence - RL Tokens Precise Manipulation with Efficient Online RL]]
