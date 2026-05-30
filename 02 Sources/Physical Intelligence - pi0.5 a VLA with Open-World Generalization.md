# Physical Intelligence - π₀.5: a VLA with Open-World Generalization

- **Type**: arXiv paper (cs.RO, cs.LG)
- **Authors**: Physical Intelligence (Kevin Black, Danny Driess, Chelsea Finn, Karol Hausman, Brian Ichter, Sergey Levine, Karl Pertsch, Allen Z. Ren, et al.)
- **arXiv**: [2504.16054](https://arxiv.org/abs/2504.16054)
- **Blog**: https://pi.website/blog/pi05
- **Year**: 2025
- **Open-source**: ✅ [openpi](https://github.com/Physical-Intelligence/openpi)
- **Accessed**: 2026-04-28
- **Raw note**: [[2026-04-28 - Physical Intelligence - pi0.5 a VLA with Open-World Generalization]]

## Model Paper Checklist

| # | 维度 | 信息 |
|---|------|------|
| 1 | 模型架构 | Transformer backbone + action expert (MoE 风格独立完整 attention + FFN)，**block-causal joint attention**（范式 A，延续 π₀，论文声明 "Following π₀"，已核实） |
| 2 | 模型规模 | **总参数量未披露**，action expert 860M，backbone 初始化自 VLM（未指明具体模型） |
| 3 | 训练数据 | MM(~400h, ~100 家庭) + ME(非移动机器人) + CE(跨embodiment) + HL(语义标注) + WD(web)，97.6% 非目标场景 |
| 4 | 训练方法 | Pre-training 280k steps (全离散 FAST token) + Post-training 80k steps (flow matching + next-token, α=10.0) |
| 5 | 推理性能 | 50Hz 控制，10 步 flow matching 去噪，action chunk 50 步，**推理延迟未披露，硬件需求未披露** |
| 6 | 开源状态 | ✅ 开源（openpi），权重+代码+finetune |
| 7 | Benchmark | 4 评测任务(dishes/laundry/drawer/make bed)，104 场景≈直接训练，比 π₀ 显著更强，**具体成功率以图表呈现** |
| 8 | 与已有工作关系 | π₀ 升级版（加 co-training + 两层推理），vs ChemBot（单模型半共享 vs 完全分离） |
| 9 | 记忆机制 | **无显式记忆**，无 experience accumulation |

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

### 架构精度：与 π₀ 同一模型类（代码级核实）

**更正历史**：早期本笔记误写"共享 attention 层 / 双向注意力"，经核实修正。

**openpi 代码级核实**（π₀.5 开源）：π₀.5 与 π₀ **共用同一个模型类** `src/openpi/models/pi0.py`——**没有单独的 pi05.py**，只在 `Pi0Config` 用 `pi05: bool` 开关区分。这是架构一致性的最强证据。

`pi0_config.py` 注释明确 π₀.5 相对 π₀ **只有两处差异**（均不改变 VLM↔action 耦合范式）：
1. **state 输入位置**：π₀.5 把机器人 state 作为**离散语言 token 放进 prefix**（用 VLM 权重，进入双向注意力区），而非 π₀ 的"连续 state token 放 suffix（用 action expert 权重）"
2. **timestep 注入**：π₀.5 用 **adaRMSNorm** 把 flow matching timestep 注入 action expert

核心耦合完全一致（代码确认）：
- 同一 `make_attn_mask` 实现 block-causal（docstring："causal attention between blocks. Tokens of a block can attend all previous blocks and all tokens on the same block"）
- 同一句 `self.PaliGemma.llm([prefix_tokens, suffix_tokens], mask=attn_mask, adarms_cond=[None, adarms_cond])` 两专家联合前向（joint attention）
- 推理先 prefix 前向填 VLM KV cache（`llm([prefix_tokens, None], ...)`），再 suffix attend prefix → 确认 block-causal 单向流

**结论：π₀.5 = π₀ 的范式 A（joint-attention MoE + block-causal），代码级确认一致**；差异仅在 state 表示与 timestep 注入，不涉及耦合。完整机制见 canonical [[Physical Intelligence - pi0 a Vision-Language-Action Flow Model for General Robot Control]]；范式 A/B 跨工作对比见 [[Embodied Brain Models]]。

### 开源边界（已核实）

openpi 仓库**只开源 π₀ / π₀-FAST / π₀.5**（权重 + 代码）。π*₀.6 / π₀.7 / RL Tokens **均未开源**——开源止于 π₀.5，恰为 PI 商业化起点。

### π₀.5 自身的架构贡献：两步分解

π₀.5 的特有点是**单模型内的两层推理**（不是架构耦合的改动，而是推理流程）：

```
πθ(a_{t:t+H}, ℓ̂ | o_t, ℓ) = πθ(a_{t:t+H} | o_t, ℓ̂) · πθ(ℓ̂ | o_t, ℓ)
```

1. 高层：自回归生成子任务文本 ℓ̂（"pick up the plate"），停留在 embedding 空间不 round-trip
2. 低层：action expert 条件化于 ℓ̂，flow matching 生成 action chunk

规模：Gemma/PaliGemma 系 backbone + action expert 860M。

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
- 104 个训练场景的模型与在测试环境上直接训练的 control 性能相当（关键结果）
- 高层推理组件至关重要，去掉后长 horizon 任务崩溃
- Scene 数量越多泛化越好，但有边际递减
- 评测任务：dishes in sink, items in drawer, laundry basket, make bed
- **具体成功率**：论文以图表呈现（Figure 8, 12），未给出精确数字

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
