# HELM: Harness-Enhanced Long-horizon Memory for Vision-Language-Action Manipulation

- **Raw note**: [[2026-08-06 - Zeng et al. - HELM Harness-Enhanced Long-horizon Memory for Vision-Language-Action Manipulation]]

## Metadata
- **Type**: source note
- **Format**: arXiv (cs.LG), **v1 2026-04-20**；CC BY 4.0；含 NeurIPS Paper Checklist（投稿中）
- **Authors**: Zijian Zeng, Fei Ding, Huiming Yang, Xianwei Li
- **Organization**: **清华大学** + **阿里巴巴** + 蚌埠学院
- **arXiv**: [2604.18791](https://arxiv.org/abs/2604.18791)
- **Open source**: 代码"录用后发布"；**LIBERO-Recovery 协议在附录 A.4 完整描述，可从现有 LIBERO 仿真器复现**
- **Raw tier**: URL-only
- **Verification status**: 三缺口 / EMM / SV / HC / 执行环 / 主要结果 **自读 HTML 正文核实**（2026-08-06）；附录（阈值敏感性、per-task、定性例）未逐项核对
- **Related**: [[Embodied failure detection]], [[Zhang et al. - Harness VLA Steering Frozen VLAs into Reliable Manipulation Primitives via Memory-Guided Agents]], [[Memory in Embodied AI]], [[Harness design]], [[Agia et al. - Sentinel Runtime Monitoring of Consistency and Progress for Generative Policies]], [[Task Decomposition as OOD Mitigation]]
- **Tags**: #harness #vla #frozen-policy #episodic-memory #failure-prediction #recovery #rollback #long-horizon #embodied

## Summary

**"harness 直接套在 VLA 上"这一类的代表作**——与 [[Zhang et al. - Harness VLA Steering Frozen VLAs into Reliable Manipulation Primitives via Memory-Guided Agents|Harness VLA]] 把 VLA 降级成原语库里的一个 primitive 不同，**HELM 里 VLA 仍是主执行者**，harness 只在它外面补三样它没有的东西。

**立论（很硬的一个对照实验）**：VLA 短程强、长程崩，而**这不是上下文窗口的问题**——

| | 平均 subgoal 数 | OpenVLA TSR |
|---|---|---|
| LIBERO-SPATIAL | 2.3 | 91.2% |
| **LIBERO-LONG** | **5.8** | **58.4%** |

把上下文 **H=8 → H=32（4×），只涨到 63.8%（+5.4 pp）**，尚余 17.7 pp 无法解释。⇒ 缺的不是"记得更多"，是**执行环本身缺三个环节**。

## 三个缺口（这套失败分类学本身就有价值）

| 缺口 | 症状 | 对应组件 |
|---|---|---|
| **Memory gap** | 固定窗口丢弃**已完成子目标的证据** | **EMM** |
| **Verification gap** | 动作反应式提出，**执行前无可行性检查**——不可行抓取 / 抓错物体 / 越工作空间**静默执行并传播误差** | **SV** |
| **Recovery gap** | 失败后**在被污染的状态上继续**，跨子目标级联 | **HC** |

> **Memory gap 的原文实例，把"跨阶段"讲得极具体**：*"At step t=47, the model cannot recall that the mug was placed in the cabinet at t=12; **it re-attempts the placement, corrupting task state.**"*
> ⇒ 失败模式不是"忘了要干什么"，而是**"忘了已经干过了，于是重做一遍，把状态搞坏"**。这里的**"阶段" = subgoal**。

## 三个组件

**EMM（情景记忆）**：key-value 存储，key = **CLIP ViT-B/32** embedding，value = (关键帧, 活动子目标, **完成状态**, 时间步, 紧凑状态 delta)。**写入**于：子目标完成 / 检测到失败 / **每 20 步 checkpoint**。**检索** cosine top-**3**，结果**序列化成结构化文本追加进 VLA 的语言输入**。**压缩**：超 50 条则每子目标只留最近 checkpoint。

**SV（状态验证器，核心贡献）**：目标是 **`P(fail_t | o_t, a_t, g_t, M_t)`**——**记忆条件化的执行前失败预测**。
- 3 层 **MLP [1024→512→256→1]**；输入 = 当前观测 CLIP embedding **拼上检索到的 top-1 记忆 key**，再拼投影动作与子目标文本 embedding
- **训练**：从 rollout 收 **50K** 三元组，**`y=1` 若 5 步内失败**；BCE + pos weight 4.0；**单卡 A100 约 2 小时**
- **阈值** θ_v = 0.65；**延迟 12 ms/步**

> **为什么必须条件化于记忆（全篇最深的一句）**：*"whether an action is valid often depends on **what has already been completed** — e.g., **placing an object that was already placed is a failure regardless of current visual feasibility**."*
> ⇒ 这把"前置条件"从**几何可行性**提升到了**任务状态语义**。去掉记忆，**AUROC 0.847 → 0.791**。论文明说 MLP 是为低延迟刻意选的，消融证明**关键是记忆增强的输入，不是模型容量**。

**HC（Harness 控制器）**：维护 **subgoal 栈**（初始由**提示 VLA 自己分解任务**得到）+ **completion detector**（与 SV 同架构，训练在完成标签上）。触发条件 `p_fail > θ_v` **或** completion detector 判负，然后：
1. 从 EMM **检索最近的 checkpoint / success 条目**
2. 发**目标条件化恢复序列**，prompt = **"return to the state shown"**
3. **失败的 subgoal 重新压回栈**
4. 失败条目追加进上下文

最多 **3 次**恢复尝试。

> ⚠️ **关键澄清：这个"回滚"不是仿真器 reset**，而是**拿一张历史关键帧当视觉目标，让 VLA 自己把世界开回去**——是**由策略执行的物理回归**。因此原则上真机可行，但受限于"回得去吗"。论文自己把 **"rollback feasibility in real-world settings"** 列为局限，并给出 **HELM-Fwd 前向恢复变体**：回滚不可行时，改为**从当前受损状态生成前向恢复计划**（两变体都评测了）。

## Results
- **LIBERO-LONG：58.4% → 81.5%，+23.1 pp**（长上下文 H=32 对照仅 +5.4 pp）
- **SV vs 替代**：rule-based verifier +6.8 pp < **SV +8.4 pp** < ensemble uncertainty +9.5 pp，**但 ensemble 需 5× 推理成本**
- **SV 去掉记忆上下文退化 6.1 pp**（EMM–SV 耦合的直接证据）
- **失败模式计数：三类都降，F_R（恢复缺口）降幅最大 82%，由 rollback 驱动**
- 评测：LIBERO-LONG（500 episodes）· **CALVIN ABC→D** · **LIBERO-Recovery**（本文发布的**扰动注入**恢复评测协议）
- **9 个 baseline**，含 oracle memory / long-context / rule verifier / ensemble / **same-budget LoRA** / forward-recovery 变体

## Why it matters（对本库）

1. **"harness 直接建在 VLA 上"这一类的代表**，与 Harness VLA 形成清晰对照：**同样是冻结 VLA + 记忆 + 验证 + 恢复，但 VLA 的角色完全不同**（主执行者 vs 一个 primitive）。两篇合看，说明"具身 harness"是一个**正在成形的方法族**，不是孤例。
2. **SV 就是我们此前推演的"前置守卫"的一个已实现版本**（[[Embodied failure detection]] 机制①的"事前"格）。而且它比我们设想的更进一步：**前置条件必须条件化于任务历史**，因为"这个动作可行吗"取决于"已经做过什么"——**纯几何前置条件根本表达不了"这个东西已经放过了"**。这是对本库前置条件讨论的实质补充。
3. **它给"记忆 vs 上下文"提供了硬对照**：**4× 上下文只买到 +5.4 pp，结构化记忆买到 +23.1 pp**。对 [[Memory in Embodied AI]] 是一条可引用的定量证据——**记忆不是"更长的上下文"的同义词**。
4. **回滚的真机语义被讲清楚了**：不是 reset，是**用历史关键帧当视觉目标做物理回归**；并配了 **HELM-Fwd** 应对不可逆场景。这直接对应本库"**失败可逆性**"那条判据（见 [[Cloud-edge co-evolving embodied agent - a continuous-evolution framework]] 的能力画像段）。
5. **失败分类学 memory / verification / recovery**，与本库 [[Embodied failure detection]] 的"四类失败 × 三个时机"可对齐：verification=事前、recovery=事后处置，而 memory 是**两者共同依赖的上下文底座**——这一点本库此前没有。

## What feels strong
- **立论靠对照实验而非叙述**：H=32 那组数据把"加长上下文"这条最省事的解释直接排除。
- **SV 的问题形式化干净**（记忆条件化的执行前失败预测），且用消融把"是记忆起作用、不是容量"钉死。
- **12 ms/步 + 单卡 2 小时训练** —— 工程上极其现实的成本。
- **诚实处理 ensemble 更强这件事**（+9.5 vs +8.4），用 5× 成本把它挡回去，而不是掩盖。
- 发布 **LIBERO-Recovery** 扰动注入协议，为"恢复"这件事补了一个可复现的评测面。

## What feels limited
- **纯仿真**（LIBERO / CALVIN），无真机；而 **rollback 的可行性恰恰是真机问题**（作者自列）。
- **SV 依赖 rollout 采集的失败标签**（50K 三元组，`y=1` 若 5 步内失败）—— 与 [[Xu et al. - FAIL-Detect Uncertainty-Aware Runtime Failure Detection for Imitation Learning Policies|FAIL-Detect]] 的"**只用成功数据**"形成对比：**HELM 的 SV 需要失败数据**，冷启动成本更高。
- **子目标分解由提示 VLA 自己完成**，质量未被单独评估（作者列为局限）。
- 基座主要是 **OpenVLA**（自回归动作 token）；对 flow-matching / diffusion 类策略是否同样有效未验证。
- `R_max=3`、`θ_v=0.65`、`Δc=20`、`k=3`、`N_max=50` 等一串超参，跨环境的稳健性只有部分附录支撑。

## Open questions（接本库）
- **SV 与 FAIL-Detect 的组合**：前者需失败数据但**条件化于任务历史**，后者**只需成功数据**但只看最近 2 步。二者恰好互补——**记忆条件化 + 无失败数据**是否可兼得？
- 回滚的真机可行性：什么样的技能"回得去"？这正是本库 **失败可逆性** 判据要回答的问题，HELM 提供了 HELM-Fwd 作为不可逆时的退路，但没有给判据。
- "长上下文救不了"这个结论对 **π 系（flow matching + 显式 MEM 记忆）** 是否仍成立？π₀.7 已内建双记忆，与外挂 EMM 的分工是什么？
- LIBERO-Recovery 能否成为本库 [[Real-robot evaluation]] 里"恢复能力"这一轴的评测参照？

## Related
- [[Zhang et al. - Harness VLA Steering Frozen VLAs into Reliable Manipulation Primitives via Memory-Guided Agents]] — **同族对照**：VLA 当 primitive vs VLA 当主执行者
- [[Embodied failure detection]] — SV = 事前守卫；三缺口与本库分类学的对齐
- [[Xu et al. - FAIL-Detect Uncertainty-Aware Runtime Failure Detection for Imitation Learning Policies]] · [[Agia et al. - Sentinel Runtime Monitoring of Consistency and Progress for Generative Policies]] — 失败检测的另两条路线（无失败数据 / 双检测器）
- [[Memory in Embodied AI]] — "记忆 ≠ 更长上下文"的定量证据
- [[Harness design]] — 具身 harness 方法族的又一实例
- [[Task Decomposition as OOD Mitigation]] — subgoal 栈 + 完成检测 = 拆解在执行期的落地形态
