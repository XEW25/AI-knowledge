# Physical Intelligence - π₀.5: a VLA with Open-World Generalization

- **Type**: arXiv paper (cs.RO, cs.LG)
- **Authors**: Physical Intelligence (Kevin Black, Danny Driess, Chelsea Finn, Karol Hausman, Brian Ichter, Sergey Levine, Karl Pertsch, Allen Z. Ren, et al.)
- **arXiv**: [2504.16054](https://arxiv.org/abs/2504.16054)
- **Blog**: https://pi.website/blog/pi05
- **Year**: 2025
- **Open-source**: ✅ [openpi](https://github.com/Physical-Intelligence/openpi)
- **Accessed**: 2026-04-28
- **Raw note**: [[2026-04-28 - Physical Intelligence - pi0.5 a VLA with Open-World Generalization]]

## Summary

π₀.5 基于 π₀，核心贡献不是架构创新而是**训练配方**——证明异构数据 co-training 能让 VLA 在全新环境中执行长 horizon 任务（10-15 分钟清理厨房/卧室）。第一个在全新家庭中完成 end-to-end 长 horizon 精细操作的 VLA 系统。

## Architecture: 两层推理，一个模型

```
图像 → ViT encoder ─┐
                     ├→ Transformer backbone
文本指令 ────────────┘     │
                     ① 自回归生成子任务文本 token
                       "pick up the plate"
                     （不 round-trip 成文本，停留在 embedding 空间）
                         │
                     ② action expert 通过共享 attention 读子任务 embedding
                       → flow matching 去噪 → action chunk [a_t, ..., a_t+H]
```

**数学**：π(a, ℓ̂|o, ℓ) = π(a|o, ℓ̂) · π(ℓ̂|o, ℓ)

### 信息流详解

1. Backbone 自回归生成子任务文本 token（token by token）
2. 子任务 token **不会**变成文本再 tokenize——一直在 embedding 空间
3. Action expert 通过**共享 attention 层**直接读子任务 embedding（不需要额外文本 encoder）
4. 一次 flow matching 去噪生成整个 action chunk
5. 子任务切换低频，动作生成 50Hz 高频

### 共享表示的粒度（半共享）

- **共享**：attention 层（action expert 能 attend to 所有 token：图像、文本、子任务）
- **不共享**：action expert 的 FFN 权重（860M 参数，专门做 flow matching）
- 比完全独立（ChemBot）更紧密，比完全端到端更模块化

### 与 ChemBot 的架构对比

| | π₀.5 | ChemBot |
|---|---|---|
| 高层规划 | 同一个 Transformer backbone | 独立的 Qwen3-VL-Flash |
| 底层执行 | 同一模型的 action expert | 独立的 GR00T Skill-VLA |
| 通信方式 | embedding 空间（共享 attention） | MCP API 文本指令 |
| 子任务切换 | 模型内部隐式决定 | Progress Head 检测 p_t > 阈值 |
| 通信开销 | 0 | MCP API 调用 |

## Training: 两阶段 + Co-training

### Pre-training（280k steps，全部离散 token）
数据源：
- **MM**：~400 小时移动操作器数据，~100 个家庭环境
- **ME**：非移动机器人数据，更多样化环境
- **CE**：实验室跨 embodiment 数据，含 OXE 开源数据集
- **HL**：人工标注语义子任务 + bounding box
- **WD**：web 数据（image captioning, VQA, object localization）
- **97.6% 的训练数据不是来自移动操作器做家务**

### Post-training（80k steps）
- 加 action expert（随机初始化），flow matching + next-token prediction 联合训练
- α = 10.0（flow matching 权重）
- 数据：MM + ME 成功 episode + WD + HL + VI（verbal instruction）
- VI：专家用语言"遥操作"机器人，提供好的高层子任务示范

### 训繁推简（与 GigaWorld-Policy 一致）
- Pre-training 用 FAST tokenizer 离散化动作 → 训练快、稳定
- Post-training 加 flow matching action expert → 推理快（非自回归）

## Results

- 在**全新家庭**中完成清理厨房/卧室（10-15 分钟长 horizon）
- Co-training 每个成分都有贡献，去掉任何一个都掉性能
- 比 π₀ 显著更强（尤其是泛化能力）
- 高层推理组件至关重要，去掉后长 horizon 任务崩溃
- Scene 数量越多泛化越好，但有边际递减

## Why It Matters

### 知识迁移 > 直接经验

97.6% 的训练数据不是目标场景的。只有 ~400 小时是移动操作器在家庭中，剩下全靠迁移。这说明**知识迁移的效率**比直接经验更重要——类比人类"读了一本书"比"做了一天"可能更有用。

### 单模型内的任务拆解

π₀.5 的两层推理 = 一个模型内同时做"任务拆解"和"动作执行"——这是 Ethan "能力层级拆解"论点的特殊实现：没有拆成两个独立模型，而是用共享 backbone + 独立 action expert 实现半共享。子任务在 embedding 空间内传递，零通信开销。

### 开放问题：半共享 vs 完全分离 vs 完全端到端

三种架构各有优劣：
- **完全分离**（ChemBot）：模块化、可独立升级，但通信开销大、无法端到端训练
- **半共享**（π₀.5）：共享语义理解、独立动作生成，平衡效率与模块化
- **完全端到端**：理论上最优，但训练不稳定、难 debug

目前没有定论哪种最好。

## Related Concepts

- [[Physical Intelligence - pi0.6 a VLA That Learns From Experience]] — π₀.5 的后续，加 RL self-improvement
- [[Physical Intelligence - RL Tokens Precise Manipulation with Efficient Online RL]] — 同团队，轻量级 RL 路线
- [[Huang et al. - ChemBot Long-Term Memory for VLA-based Agents]] — 完全分离架构对比
- [[Task decomposition]] — 两层推理 = 模型内任务拆解
- [[Agent memory]] — 隐式记忆（权重更新）
- [[World-Action Models]] — WAM vs VLA 路线对比

## Related Entities

- [[Physical Intelligence (π)]] — 作者团队
- [[Chelsea Finn]] — Co-founder/Research Lead (Stanford)
- [[Sergey Levine]] — Co-founder/Chief Scientist (UC Berkeley)
