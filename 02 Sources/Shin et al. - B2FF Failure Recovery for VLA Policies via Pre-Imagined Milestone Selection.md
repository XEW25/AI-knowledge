# B2FF: Back to the Familiar Future — Failure Recovery for VLA Policies via Pre-Imagined Milestone Selection

- **Raw note**: [[2026-08-06 - Shin et al. - B2FF Back to the Familiar Future Failure Recovery for VLA via Pre-Imagined Milestone Selection]]

## Metadata
- **Type**: source note
- **Format**: arXiv (cs.RO)，**v1 2026-06-08**
- **Authors**: Suyeon Shin, Juwon Kim, Hyeonbin Park, Hyunseo Kim, Hyundo Lee, Hyung-Sin Kim, **Byoung-Tak Zhang**
- **Organization**: **Seoul National University** + Yonsei + Soongsil
- **arXiv**: [2606.09258](https://arxiv.org/abs/2606.09258)
- **Raw tier**: URL-only（HTML 正文自读）
- **Verification status**: 两模式公式 / bank 构造 / selector 与其三阶段训练 / 结果 / **局限与触发时机前提** 均**自读核实**（2026-08-06）；**基座 VLA 身份未在正文提取到**（通篇泛称 foresight-driven VLA）
- **Related**: [[Embodied failure detection]], [[Zhang et al. - Harness VLA Steering Frozen VLAs into Reliable Manipulation Primitives via Memory-Guided Agents]], [[Zeng et al. - HELM Harness-Enhanced Long-horizon Memory for VLA Manipulation]], [[World-Action Models]], [[Physical Intelligence - pi0.7 a Steerable Generalist Robotic Foundation Model]]
- **Tags**: #failure-recovery #frozen-policy #vla #subgoal-image #foresight #inference-time #harness

## Summary

**"恢复"设计空间里的第三格：在条件空间恢复。** VLA **完全冻结**（"permitting no weight updates or fine-tuning"），把恢复重构为——

> **选择一个引导动作的视觉条件，而不是修改动作输出。**

前提：基座必须是 **foresight-driven VLA**（动作生成经由一个中间未来表征）。这类模型正常工作时**联合生成「子目标图像 + 动作」**，B2FF 利用的正是这个接口：

```
π_θ(v_t , a_t | I, o_t)         ← 正常：联合生成子目标图像 v_t 与动作 a_t
π_θ(a_t | I, o_t ; v_t ← v*)    ← 恢复：v_t 钉死为 v*，只对动作去噪（action-only denoising）
```

> ⚠️ **`o_t`（当前偏离轨迹的观测）始终在条件中**。被替换掉的是**策略自己预测的未来**，不是当前状态——策略同时看见"我在哪"和"该去哪"，生成动作把两者接起来。

### 为什么用"预先想象"的未来，而不是当场重新预测
论文的诊断：偏离后 `o_t` 落在**不熟悉的状态空间**，此时让策略从 OOD 观测重新预测未来，预测本身就不可靠 → *"direct re-planning frequently **destabilizes action sequences**"*。

⇒ 取舍是：**宁可要一个不那么精确、但落在训练分布内的目标**——因为动作头只被训练过朝熟悉的未来行动。原文把这点说得很准：

> *"The familiar future bank **need not pixel-match** the failed observation, but it must contain a milestone that provides a **useful action-guiding condition** for the current failed state."*

**milestone 不是预测，是靶子。**

### 三步
1. **执行前建 familiar future bank**：从**干净的初始观测**出发，**递归查询冻结 VLA 的 future-image 边缘分布**，存成 `B={ṽ₁…ṽ_M}` ⇒ 天然在分布内
2. 进入恢复上下文（索引 `f`）
3. **recoverability-aware selector** 选一个，**钉死为固定视觉目标**

### Selector：为什么"对不上"不成问题
`v* = argmax_{ṽ∈C_f} F_φ(ṽ | o_f, H_f, C_f)` —— 打分**条件里含当前失败观测 `o_f`**、历史 `H_f`、**局部候选集 `C_f`**（非整个 bank）。⇒ 不是随便挑个熟悉未来，而是挑**"从我现在这个烂状态出发最够得着的"**那个，这正是 "recoverability" 的含义。

实现：冻结视觉 tokenizer → 轻量投影器 → **Perceiver 式注意力**汇总候选-上下文 → **MLP 打分头**。
训练三阶段：① **时间对比学习（TCN）**做进度感知初始化；② **对每个候选真跑一遍 action-only denoising** 收集**反事实**标签；③ 监督 warm-start + **one-step actor-critic 式微调**。

## Results
- **failure-injected LIBERO：56.3% → 74.0%（+17.7pp）**，**不微调低层动作生成器**
- 覆盖 nominal execution / policy-induced failures / injected disruptions；标准 LIBERO 亦评
- **真机三任务**：物体堆叠、pick-and-place、关抽屉并放置物体；经"lightweight selector tuning"后迁移成立

## ⚠️ 必须记住的前提：恢复触发被刻意外置
主结果是在 **controlled recovery timing** 下取得——恢复入口 `f` **与注入的扰动对齐**（即**告诉它何时该恢复**）。论文另给 **online-triggered 变体**（`f` 由**本体感知历史**估计 + 阈值），并明说：

> *"We treat trigger estimation as an **interchangeable entry point**."*

⇒ **它解决的是"怎么恢复"，不是"何时该恢复"**。受控评测每 episode 只注入一次扰动。

## Why it matters（对本库）

**1. 补齐"恢复"设计空间的第三格。** 三篇合看，同一个问题（把策略拉回能力域）有三种改法：

| 工作 | 改什么 | 真机代价 |
|---|---|---|
| [[Zhang et al. - Harness VLA Steering Frozen VLAs into Reliable Manipulation Primitives via Memory-Guided Agents\|Harness VLA]] | **机器人的物理位形**（approach pose / viewpoint） | 要真移动：时间、磨损 |
| [[Zeng et al. - HELM Harness-Enhanced Long-horizon Memory for VLA Manipulation\|HELM]] | **世界状态**（取历史关键帧当视觉目标让 VLA 开回去） | 要真开回去，且"回得去吗"存疑 |
| **B2FF** | **喂给策略的目标**（钉死一个熟悉的未来图像） | **零物理代价** |

**2. 一条值得记住的判断**：**动作头的"能力域"不只由当前状态定义，还由你给它的目标定义**——`p(success | o₀, goal)` 是两个变量的函数。⇒ **恢复分布内性有两条路：移动机器人，或者换个目标。** 后者在真机上更便宜，这补上了本库"真机重试有物理成本"讨论里缺的一半。

**3. 它的适用边界正好复述了本库的两条判据**（作者自陈，见 §5）：
- 只处理**可恢复的偏离**（任务仍物理可行、物体仍可观测可达、技能 VLA 已具备）
- **不处理语义失败**（任务理解错、**物体 grounding 错**）与**不可逆失败**（离开工作空间、**不可逆的环境改变**）
- ⇒ 与 [[Embodied failure detection]] 的**四类失败**、以及 [[Cloud-edge co-evolving embodied agent - a continuous-evolution framework|能力画像]]里的**失败可逆性**维度**逐条对齐**。这是外部工作对本库分类学的一次独立印证。

**4. 检测与恢复是可分离的**：B2FF 明确把触发估计当作"可替换的入口"。⇒ 与 [[Agia et al. - Sentinel Runtime Monitoring of Consistency and Progress for Generative Policies|Sentinel]] / [[Xu et al. - FAIL-Detect Uncertainty-Aware Runtime Failure Detection for Imitation Learning Policies|FAIL-Detect]] 是**天然的互补组合，而没人做过**。

## What feels strong
- **接口选得准**：foresight-driven VLA 的中间未来表征本来就是一个"可设定的槽"，B2FF 只是把它用作恢复接口，**零训练、零权重改动**。
- **"不必像素对齐、只需可引导动作"** 这句把整个方法的合法性讲清楚了，也回答了最自然的质疑。
- selector 用**反事实 rollout**取标签（对每个候选真跑一遍），比启发式打分实在。
- **局限写得异常诚实**，且颗粒度细到能直接当适用性清单用。

## What feels limited
- **依赖触发时机**，主结果在受控时机下取得；在线变体只用本体感知历史估计，效果未在主表体现。
- **单个执行前 bank、一个 milestone、固定恢复窗口**；自适应建 bank / 闭环重选 / 重复触发均为 future work。
- **只适用于有可设定 future-image 子目标接口的 VLA** —— 像 π₀ 这类直接 obs→action 的用不了。
- 基座 VLA 身份未在正文明示；真机仅三个任务。

## Open questions（接本库）
- 与 [[Xu et al. - FAIL-Detect Uncertainty-Aware Runtime Failure Detection for Imitation Learning Policies|FAIL-Detect]] 组合：logpZO 的 OOD 分数能否**同时**充当"何时触发"与"选哪个 milestone"的依据？
- "换目标"与"移机器人"两种恢复**何时该用哪个**？是否可由失败类型自动路由（语义失败→都不行；位形不利→re-staging；分布漂移→换目标）？
- bank 只在执行前建一次 ⇒ 长程任务中后期的 milestone 是否已过时？闭环重建的代价如何？
- 这个"钉死条件槽"的思路能否迁移到 **[[World-Action Models|WAM]] 的 latent 子目标**（如 LaWAM 的隐视觉子目标、Being-H0.7 的 latent query）？——那将是**在 latent 空间恢复**，比像素空间更便宜。
