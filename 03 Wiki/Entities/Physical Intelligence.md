# Physical Intelligence (π)

- **Type**: Company / Research Lab
- **Website**: https://pi.website
- **Founded**: 2024
- **Headquarters**: San Francisco, CA
- **Founders**: Karol Hausman (CEO, ex-Google DeepMind), Sergey Levine (Chief Scientist, UC Berkeley), Chelsea Finn (Research Lead, Stanford), Brian Ichter (ex-Google Research), Adnan Esmail
- **Focus**: General-purpose robot foundation models (VLA)
- **Flagship product**: π series VLA models
- **Funding**: 累计超 $1B（三轮），2026年3月传拟再融 $1B，估值 $11B
- **Key investors**: Thrive Capital, Lux Capital, Jeff Bezos, NVIDIA (NVentures), Index Ventures, Founders Fund, Lightspeed

## 产品线

### π₀ (2024)
- Physical Intelligence 的第一个 VLA 模型
- Flow matching for action generation
- 基于 VLM backbone
- ✅ **开源**：[openpi](https://github.com/Physical-Intelligence/openpi)（权重 + finetune 代码，JAX + PyTorch）
- Paper: "π₀: A Vision-Language-Action Flow Model for General Robot Control"

### π₀.5 (2025)
- Open-world generalization，多机器人平台
- ✅ **开源**：同 openpi 仓库
- Paper: "π₀.5: A Vision-Language-Action Model with Open-World Generalization"

### π₀.6 (2025)
- 更大 backbone + 更多样化 conditioning
- ❌ 未开源
- Blog: https://pi.website/blog/pistar06

### π₀.7 (2026)
- 可执行未经训练的任务（zero-shot generalization）
- 由 Sergey Levine 主导
- 目前尚不能单条高层指令完成复杂多步任务

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

- **Karol Hausman** — Co-founder/CEO (ex-Google DeepMind)
- **Sergey Levine** — Co-founder/Chief Scientist (UC Berkeley)
- **Chelsea Finn** — Co-founder/Research Lead (Stanford)
- **Brian Ichter** — Co-founder (ex-Google Research)
- **Adnan Esmail** — Co-founder
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
