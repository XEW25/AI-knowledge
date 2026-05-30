# Physical Intelligence - RL Tokens: Precise Manipulation with Efficient Online RL

- **Type**: Research paper / technical report
- **Authors**: Physical Intelligence (π)
- **Published**: March 19, 2026
- **URL**: https://www.pi.website/research/rlt
- **Accessed**: 2026-04-23
- **Raw note**: [[2026-04-23 - Physical Intelligence - RL Tokens Precise Manipulation with Efficient Online RL]]

## Summary

RL Tokens (RLT) 解决 VLA 的"最后一公里"问题：π0 能做通用操控，但精密操作（螺丝对准、插入网线）不行。方法是在 VLA 输出一个紧凑的 RL token，让轻量级 actor-critic 在 token 空间做实时 RL，15 分钟数据即可显著提升。

## 架构耦合核实（2026-05-30）

- **冻结 π₀ VLA**：内部 VLM↔action 耦合仍是**范式 A**（不变，因为 backbone 冻结不参与训练/推理梯度）
- RL Tokens **不改变耦合范式**，而是在冻结 VLA 之上加一个**能力层级拆解 adapter**：encoder-decoder bottleneck → RL token → 小 actor-critic
- 这是"能力层级拆解"（capability-level decomposition）而非"VLM↔action 耦合"的创新；与 ReKep 的任务步骤拆解对比见 [[Task decomposition]]
- canonical 耦合机制见 [[Physical Intelligence - pi0 a Vision-Language-Action Flow Model for General Robot Control]]

## Key Method

1. VLA frozen，加 encoder-decoder transformer 压缩内部表征 → RL token
2. 小网络 actor-critic 基于 RL token 做 off-policy RL，每秒数百次更新
3. RL token = VLA 对当前观测的"精华摘要"，足够小网络做精密决策

```
观测 → VLA (frozen) → internal embeddings
                         ↓
              encoder-decoder (bottleneck)
                         ↓
                      RL token (compact)
                         ↓
              small actor-critic (RL training)
                         ↓
                      精调后的动作
```

## Key Results

- 精密阶段速度提升 **3×**
- Ethernet 插入：**15 分钟数据 + 2 小时训练**
- RLT 策略一半试验比**人类遥操作**还快（median 66 vs teleop 146 timesteps）
- RL 训练：每秒数百次参数更新，实时在机器人上训练
- VLA backbone 完全不动
- **推理速度**：原文未披露具体数字。推理时只运行小网络 actor-critic + RL token encoder，VLA backbone 冻结不参与推理，延迟理论上远低于完整 VLA
- **小网络尺寸**：原文未披露参数量，仅描述为"small networks"

## Why It Matters

### 能力层级的任务拆解

RLT 的架构本质是一个**两层 hierarchy**：

```
VLA (frozen) → 通用策略：理解任务、规划、粗粒度操控
     ↓ (RL token = 接口)
小网络 RL → 底层专家：精密对准、插入等原子级精密技能
```

RL token 扮演的是**抽象的原子动作接口**——针对特定精密操作的专家子网络输入。VLA 负责"到哪去"，RL 专家负责"怎么精"。

### Ethan 的洞察

> RLT 的小网络可以视作一个针对某个源自动作的原子网络。上层 VLA 调用的也是这种底层专家式的原子动作网络。虽然 RL token 不像传统原子动作（如 move_to）那样简单，但它确实是一个针对特定精密操作的专家子网络接口。

这跟 ReKep 的拆解维度不同：
- **ReKep**：**任务步骤**的拆解（LLM 生成约束 → 优化器求解每一步）
- **RLT**：**能力层级**的拆解（通用能力 VLA vs 精密能力 RL 专家）

但内核一样：**把 OOD 的精密操作变成小网络的 in-distribution 问题**——这再次印证了任务拆解消解 OOD 的通用性。

### 与 Recap 的互补
- **Recap**：大规模 RL，长 horizon，大量数据 → 大范围提升
- **RLT**：小规模在线 RL，精调特定精密阶段，分钟级数据 → 精雕细琢
- 未来 VLA 需要"多时间尺度、多抽象层级"的 RL 适配

## Limitations

- 目前只验证了 4 个精密任务，通用性有待观察
- RL token 的信息瓶颈是否有损关键信息？论文没有深入分析
- 每个精密任务需要单独训练一个 RL 专家，不是真正的 zero-shot
- 依赖 VLA backbone 的表征质量

## Related Concepts

- [[Task decomposition]] — 能力层级拆解 vs 任务步骤拆解
- [[World-Action Models]] — 端到端 WAM 路线
- [[VLA - Vision-Language-Action Models]] — RLT 所基于的 VLA 框架

## Related Entities

- [[Physical Intelligence (π)]] — π0, π0.5, Recap 的开发团队
