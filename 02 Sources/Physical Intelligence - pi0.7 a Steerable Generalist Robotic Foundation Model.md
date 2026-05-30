# Physical Intelligence - π₀.7: a Steerable Generalist Robotic Foundation Model with Emergent Capabilities

- **Type**: arXiv paper (cs.RO, cs.LG)
- **Authors**: Physical Intelligence (Bo Ai, Kevin Black, Chelsea Finn, Karol Hausman, Sergey Levine, Karl Pertsch, et al.)
- **arXiv**: [2604.15483](https://arxiv.org/abs/2604.15483)
- **Blog**: https://pi.website/pi07
- **Year**: 2026
- **Open-source**: ❌ 未开源（已核实：openpi 仅开源 π₀ / π₀-FAST / π₀.5，π₀.7 不在其中）
- **Accessed**: 2026-04-29
- **Raw note**: [[2026-04-29 - Physical Intelligence - pi0.7 a Steerable Generalist Robotic Foundation Model.md]]

## Model Paper Checklist

| # | 维度 | 信息 |
|---|------|------|
| 1 | 模型架构 | Gemma 3 4B backbone + 860M action expert (flow matching) + MEM 视频历史编码器 + BAGEL 14B world model；block-causal attention；机器人状态用线性投影 |
| 2 | 模型规模 | VLA ~**5B**（Gemma 3 4B + 860M + 400M SigLIP）；world model **14B**（BAGEL） |
| 3 | 训练数据 | 演示 + 大量次优数据（失败 episode、RL 中间数据）+ 人类视频 + web 数据 + 开源数据集；**具体比例/小时数未披露** |
| 4 | 训练方法 | KI recipe（FAST token + flow matching）；diversified prompt conditioning（每个组件随机 dropout）；RTC 延迟模拟；**具体训练步数未披露** |
| 5 | 推理性能 | 控制 50Hz（UR5e 20Hz）；action chunk 50 步，5 步去噪，执行 15-25 步；最大推理延迟 240ms；CFG β ∈ {1.3, 1.7, 2.2}；**推理硬件未披露** |
| 6 | 开源状态 | ❌ 未提及，大概率未开源 |
| 7 | Benchmark | 匹配/超越 π*₀.6 RL specialist；14 指令跟随场景（4 未见厨房 + 2 卧室）；zero-shot UR5e 折衬衫；**具体成功率以图表呈现** |
| 8 | 与已有工作关系 | π₀.6 + MEM + 多模态条件化；能蒸馏 π*₀.6 specialist 能力到通用模型；PI 产品线目前最强 |
| 9 | 记忆机制 | ✅ **显式 + 隐式**：MEM 视频历史编码器（显式）+ RL 数据蒸馏（隐式）；PI 第一个双记忆 VLA |

## 架构耦合核实（2026-05-30）

- **基座 VLA = 范式 A（延续 π₀.6，已核实）**：Gemma3 4B backbone + 860M flow matching action expert；论文 "builds on the existing VLA architecture from π₀.6"
- **block-causal 明确**：原文 "We employ a block-causal masking scheme, such that the observation tokens and the subgoal image tokens use bidirectional attention within themselves, and goal-image tokens can additionally attend the observations"
- **BAGEL 世界模型 = 独立外挂模型**：off-the-shelf 图像生成模型，输入子任务指令生成 subgoal images，作为 input token 喂入主模型——带**范式 B 式"独立模型→token 接口"**特征
- **MEM = 视频历史编码器**：历史帧过 vision encoder 压缩到与单帧相同的 token 数，喂入 backbone
- **单一模型同时体现两种耦合哲学**：内部范式 A（joint-attention MoE），外挂 BAGEL 带范式 B 特征
- canonical 耦合机制见 [[Physical Intelligence - pi0 a Vision-Language-Action Flow Model for General Robot Control]]；范式 A/B 对比见 [[Embodied Brain Models]]

## Summary

π₀.7 通过**多样化上下文条件化**（diversified prompt）实现强开箱即用性能。核心创新：训练时不仅用"做什么"的指令，还用"怎么做"的多模态信息——subgoal images（BAGEL world model 生成）、episode metadata（speed/quality/mistake）、control mode。使模型能从混合质量数据中学习，实现组合泛化、跨 embodiment 迁移、无需 task-specific fine-tuning 的灵巧操作。

## Core Innovation: Diversified Prompt Conditioning

```
训练时 prompt 包含（每个组件随机 dropout）：
1. 子任务指令 ℓ̂_t — "open the fridge door"
2. Subgoal images — BAGEL 生成的未来状态图像
3. Episode metadata — speed（500步间隔）、quality（1-5）、mistake（bool）
4. Control mode — joint / end-effector
```

推理时：设 speed=高、quality=5、mistake=false → CFG 引导模型偏向高质量行为。

### 与 Recap 的关系

Metadata conditioning 本质上是 Recap advantage conditioning 的泛化版本：
- Recap：二值 advantage（好/坏）→ 引导策略
- π₀.7：多维 metadata（速度/质量/错误）→ 更精细的行为控制

## Subgoal Images: VLA + World Model 的中间态

```
BAGEL world model（异步线程，~4秒刷新）：
  当前观测 + 子任务指令 + metadata → 生成 subgoal images
                    ↓
Subgoal images 作为额外 token 送入 π₀.7 prompt
                    ↓
Action expert：当前状态 + 目标图像 → action chunk（goal-conditioned policy）
```

**关键洞察（Ethan + Ada 讨论）**：

Subgoal image conditioning 是 VLA 和 WAM 融合的可能桥梁：
- 不需要预测完整视频序列（WAM 的做法），只需预测几个关键 subgoal
- Action expert 填补中间动作
- 比 WAM 高效，但保留了"先想清楚目标再行动"的优势

目前是两个独立模型（BAGEL + π₀.7），未来可能融合成端到端架构。

Subgoal 本身也包含 task decomposition 的思想——world model 隐式地把长程任务分解成视觉里程碑。

## Verbal Coaching: 教模型拆任务

```
1. 人类用语言一步步指导："拿起红薯" → "放进空气炸锅" → "按启动"
2. 记录：语言指令 + 观测 + 动作
3. Fine-tune 高层策略：学会自己生成子任务序列
4. 之后全自主执行
```

本质：学的不是底层动作（已经会了），而是**子任务序列的规划策略**。人类提供的是 task decomposition 的示范。

## MEM Memory System

- 视频历史编码器：压缩历史帧为固定 token 数
- 能执行需要记忆的任务（如追踪已处理物体）
- 性能匹配或超过 MEM specialist policies
- **PI 第一个同时具备显式（MEM）+ 隐式（RL 数据蒸馏）记忆的 VLA**

## Results Highlights

- 匹配/超越 π*₀.6 RL specialist 在浓缩咖啡/折衣物/组装箱子
- 某些任务 throughput 甚至超过 RL specialist
- 比 π₀.5/π₀.6 在指令跟随上大幅领先
- Zero-shot 跨 embodiment：UR5e 折衬衫（从未训练过）
- Subgoal images + metadata 显著提升性能
- 能执行需要记忆的任务

## Why It Matters

### 通向通用机器人的关键一步

π₀.7 首次证明单一 VLA 模型可以：
- 无需 task-specific fine-tuning 就执行复杂灵巧操作
- 从混合质量数据中学习（不仅仅是好的演示）
- 跨 embodiment 零样本迁移
- 组合已有技能做新任务

### 知识库主题关联

- [[Task decomposition]] — subgoal images 隐式分解任务；verbal coaching 教模型拆任务
- [[Memory in Embodied AI]] — PI 第一个双记忆（显式 MEM + 隐式 RL 蒸馏）VLA
- [[World-Action Models]] — subgoal conditioning 可能是 VLA+WAM 融合的桥梁
- [[Agent memory]] — MEM 是具身场景下显式记忆的具体实现

## Related Concepts

- [[Physical Intelligence - pi0.5 a VLA with Open-World Generalization]] — 两层推理 + co-training
- [[Physical Intelligence - pi0.6 a VLA That Learns From Experience]] — Recap RL self-improvement
- [[Physical Intelligence - RL Tokens Precise Manipulation with Efficient Online RL]] — 轻量级 RL 路线
- [[Huang et al. - ChemBot Long-Term Memory for VLA-based Agents]] — 完全分离架构对比
- [[Task decomposition]] — verbal coaching = 教模型拆任务
- [[Memory in Embodied AI]] — 显式+隐式双记忆
- [[World-Action Models]] — subgoal image = VLA+WAM 融合桥梁

## Related Entities

- [[Physical Intelligence (π)]] — 作者团队
- [[Chelsea Finn]] — Co-founder/Research Lead (Stanford)
- [[Sergey Levine]] — Co-founder/Chief Scientist (UC Berkeley)
