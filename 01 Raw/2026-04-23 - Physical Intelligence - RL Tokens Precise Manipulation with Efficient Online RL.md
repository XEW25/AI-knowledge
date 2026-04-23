# Physical Intelligence - RL Tokens: Precise Manipulation with Efficient Online RL

- URL: https://www.pi.website/research/rlt
- PDF URL: https://www.pi.website/download/rlt.pdf
- Source type: Research paper / blog post
- Accessed at: 2026-04-23T09:07:00+08:00
- Authors: Physical Intelligence (π)
- Published: March 19, 2026
- Tier: 1

## Raw capture

### Summary

RL Tokens (RLT) 是 Physical Intelligence 提出的一种让 VLA 模型通过在线 RL 快速精调特定技能的方法。核心思想：在 VLA 输出一个特殊的 "RL token"，作为 VLA 丰富内部表征的紧凑摘要，然后一个轻量级 actor-critic 网络基于这个 token 做实时 RL 训练。

### Problem

VLA 模型（如 π0）能做很多任务，但**精密操作**（螺丝刀对准螺丝、插入网线）很难仅靠模仿学习掌握。直接用 RL fine-tune 整个 VLA 太慢、计算量太大，几小时内做不到。

### Key Method

#### 1. RL Token 生成
- 在 VLA 上加一个 **encoder-decoder transformer**
- Encoder 将 VLA 的内部 embedding 压缩成一个紧凑的 **RL token**（bottleneck）
- Decoder 训练目标：从 RL token 重建 VLA 的内部表征
- RL token = VLA 对当前观测的"精华摘要"

#### 2. 轻量 RL 策略
- Actor 和 Critic 是小网络，输入只有 RL token
- 用 sample-efficient off-policy RL 方法训练
- 每秒可做数百次参数更新 → 实时在机器人上训练
- VLA backbone **冻结不动**，只训练 RL token 的 encoder-decoder + actor-critic

#### 3. 架构流程
```
观测 → VLA (frozen) → internal embeddings
                         ↓
              encoder-decoder transformer
                         ↓
                      RL token (compact)
                         ↓
              small actor-critic (RL training)
                         ↓
                      精调后的动作
```

### Key Results

四个精密操作任务：
1. **Tie Zip Tie**（扎线带）
2. **Insert Ethernet**（插网线）
3. **Plug in Charger**（插充电器）
4. 第四个任务未详细列出

**核心数据：**
- 精密阶段速度提升 **3×**
- Ethernet 插入：15 分钟真实数据 + 2 小时总训练时间（含 reset 等开销）
- RLT 策略的 **一半试验比人工遥操作还快**（median 66 vs teleop 146 vs base 228 timesteps）
- 每秒数百次参数更新，实时在机载训练

### 与 Recap 的关系
- **Recap**：大规模 RL，长 horizon 任务，需要大量数据
- **RLT**：小规模在线 RL，精调特定精密阶段，分钟/小时级数据
- 两者互补：Recap 管"大范围提升"，RLT 管"精雕细琢"

### Key Insight

> 不需要 fine-tune 整个 VLA。只需要让 VLA 输出一个紧凑的 RL token，让小网络在 token 空间里做 RL 就够了。
