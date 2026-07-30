# LEACL: LLM-Enhanced Automatic Curriculum Learning for RL in Long-Horizon Manipulation Tasks

- **Raw note**: [[2026-07-30 - Heravi et al. - LEACL LLM-Enhanced Automatic Curriculum Learning for RL in Long-Horizon Manipulation]]

## Metadata
- **Type**: source note
- **Format**: arXiv preprint (cs.RO), **v1 2026-07-26**;无会议标注(投稿中);CC BY 4.0
- **Authors**: Faraz Heravi\*, James Ouyang\*, Zifan Xu, Arjun Kumar, Yoonchang Sung, **Peter Stone** (\*equal)
- **Organization**: **UT Austin (LARG)** + NTU Singapore + **Sony AI**
- **arXiv**: [2607.23515](https://arxiv.org/abs/2607.23515)
- **前身**: 同一一作的 **UT Austin 硕士论文**(2025-05,同题);arXiv 版参考文献 [4] 仍留盲审匿名("F. Bar, University X")
- **Open source**: **部分** — LIBERO+ 仓库公开([fheravi/LIBERO-plus](https://github.com/fheravi/LIBERO-plus),2★,license 未标注);**LEACL 自身 pipeline(LLM prompts / PDDL 生成)未见明确发布**
- **Raw tier**: URL-only(PDF 6.14 MB > 2 MB)
- **Verification status**: 机制 / 结果表 / baseline / 局限 **全文自读核实**(arXiv HTML v1,LaTeXML)于 2026-07-30;**发现一处原文内部数字不一致**(见下)
- **Related**: [[Task decomposition]], [[Task Decomposition as OOD Mitigation]], [[Cloud-edge co-evolving embodied agent - a continuous-evolution framework]], [[Embodied model function evolution - generalization as the master line]], [[Physical Intelligence - pi0.6 a VLA That Learns From Experience]]
- **Tags**: #curriculum-learning #automatic-curriculum-learning #reinforcement-learning #sparse-reward #long-horizon #llm-for-robotics #task-decomposition #pddl #tamp #libero #skill-acquisition

## Summary

LEACL 用 LLM 解决**长程操控任务的稀疏奖励 RL** 问题。它的核心一招不是"又一个 LLM 生成奖励"的变体,而是**换掉 LLM 的输出目标**:

> 已有 LLM+RL 路线让 LLM 写 **dense reward 函数**(LEAGUE++、Text2Reward、ARCHIE、CurricuLLM);LEACL 让 LLM 输出 **ACL 算法所缺的"任务规格"**——**参数化任务空间 + 难度排序**——然后用现成 ACL 算法**只靠稀疏完成奖励**学。

三阶段:
1. **LLM 任务拆解**:双层 prompt——高层 LLM 出自然语言子任务序列;第二个 LLM 把每个子任务转成 **PDDL 规格**(从给定谓词词表里选),带 reflection(语法校验 + 迭代修正)。子任务数 `K` 由 LLM 动态决定;每个 `τᵢ=⟨M,F,R,Pᵢ,Iᵢ,Gᵢ⟩` 是退化的单动作任务(省略 operator 项)。
2. **LLM meta-task 生成**(真正的新东西):
   - **任务参数空间** — LLM 识别 `Nᵢ` 维控制向量 `cᵢ`,并**生成一个 Python 函数模板**把控制空间 `Cᵢ` 映射到合法 PDDL 规格子集(例:"打开顶层抽屉"→ 柜子初始位置 + 目标开启距离)。
   - **难度度量** — LLM 直接输出一串**按难度排序**的参数向量 `(cᵢ¹…cᵢᴰ)`。
3. **即插即用 ACL**:把训练历史(episodic reward → ALP-GMM / TD error → PLR)映射为 `Tᵢ` 上的任务分布。实作用 **Active Domain Randomization (ADR)**,跑在 **TeachMyAgent** 上;base RL = **PPO**(MLP 2×128)。

## 它填的是两边各一个洞

| 已有路线 | 卡在哪 | LEACL |
|---|---|---|
| **ACL**(APT-Gen / ALP-GMM / ADR…) | 有效,但**任务参数空间 + 难度度量需人工设计**,高维时极难、换任务不通用 | 由 LLM 生成这两样规格 |
| **LLM+RL**(LEAGUE++ / Text2Reward / CurricuLLM / ARCHIE) | 每个子任务仍需 **dense reward**:依赖奖励模板/原语、需人调、且**与真实稀疏目标错位(bias)** | 完全不生成奖励,只用稀疏奖励 |

作者的定位:**首个"无任何逐任务手工设计"就能用纯稀疏奖励解长程操控的框架**(self-claimed)。

## Key claims

1. **把 LLM 用在"任务规格"而非"奖励"上更好**:避开奖励工程与奖励-目标错位,同时让成熟 ACL 算法可直接复用(还减少训练期 LLM 查询次数、简化 prompt 设计)。
2. **光靠任务拆解不够** — 拆解 + 稀疏奖励在几乎所有任务上≈0;**每个子任务内部还需要一条易→难的课程**才可学。
3. **dense reward 有害的具体机理** — 不只是难调:dense reward 诱导 "**sloppy**" 行为(持续取得中间进展,但精度不足以满足 goal predicate 的**合取**);而**稀疏奖励 + 成功即终止**学出更精确可靠的策略。
4. **LLM 在课程生成上可比甚至超过人类专家** — 零样本、无监督;人类专家需多轮迭代才设计得出。

## Results(5 seeds × 1000 episodes,mean ± 95% CI,PPO,≥500k steps)

| 方法 | T1 开抽屉 | T2 碗→盘 | T3 番茄酱→篮 | T4 开灶+摩卡壶 | T5 杯→微波炉+关门 |
|---|---|---|---|---|---|
| Sparse reward | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 |
| LEACL w/o ACL(只拆解) | 0.0 | 11.8 ± 15.4 | 0.0 | 8.2 ± 15.5 | 0.0 |
| LEAGUE(**专家手工 dense reward**) | 99.4 | 71.0 ± 37.4 | 29.8 ± 50.6 | 21.1 ± 17.4 | **0.0** |
| Human curriculum(**上界**) | 99.8 | **96.0** | 86.3 | **79.7** | **89.0** |
| **LEACL** | 99.8 | 90.7 | **89.4** | 60.6 | 75.9 |

- **胜专家 dense reward 于 4/5**(T1 打平);LEAGUE 在 T5 直接崩到 **0.0**,且方差极大(±50.6 / ±37.4)。
- 人类课程仍在 **3/5** 上更强(T2/T4/T5),但 **T3 上 LEACL 反超**(89.4 > 86.3),且 **LEACL 置信区间显著更窄**(更稳)。

## ⚠️ 两个必须记住的限定

**1. 这些 LIBERO 数字与本库其它 LIBERO 分数不可比。** LEACL 是**低维状态 PPO**(物体位姿 + 末端位姿 + 关节位置/速度 + 目标状态,MLP 2×128)——**非像素、非 VLA**;任务是 **LIBERO+**(自扩展谓词)里自造的 5 个任务,**不是标准 LIBERO 套件**。切勿与 [[Chen et al. - LaWAM Latent World Action Models for Efficient Dynamics-Aware Robot Policies|LaWAM]] 98.6 / [[Galaxea - G0.5 Autoregressive VLM-as-Actor VLA|G0.5]] 98.9 / [[Bi et al. - Motus A Unified Latent Action World Model|Motus]] LIBERO-Long 97.6 这类**模仿学习 VLA** 的成绩横向比较。

**2. 原文内部数字不一致(自核对发现)。** 正文称 LEACL w/o ACL 在"碗→盘"上取得 **32.8%**,但 Table II 该格为 **11.8 ± 15.4**。以表格为准,**标注存疑**。

## Why it matters(对本库)

1. **填一个真空缺**:此前全库 **"curriculum" / "sparse reward" 零命中**——技能获取的**训练方法学**这一层是空的。
2. **补上技能工厂缺的那一环**。[[Cloud-edge co-evolving embodied agent - a continuous-evolution framework|端云 co-evolution 框架]] 的**云③技能工厂**规定"新专家训练 = 模仿优先(teleop/DAgger)+ RL 做 refinement",但没说**长程新专家怎么让 RL 学得动**。LEACL 是一个具体机制:LLM 写任务空间 + 难度排序,ACL 从稀疏奖励接管。
3. **直接服务"线性→亚线性"主线**。逐任务手工设计 dense reward 正是典型的**逐场景人力线性成本**;LEACL 证明它可被零样本 LLM 替代(且更稳)。这是对 [[Embodied model function evolution - generalization as the master line]] 那堵墙的一次正面攻击,发生在**技能生产侧**而非推理侧。
4. **给拆解光谱加一条新轴:训练时拆解**。[[Task decomposition]] 现有光谱(约束函数 / RL token / 语言子任务 / 代码递归)全是**推理时**拆解;LEACL 的拆解服务于**训练**(课程结构),是同一内核的另一用法。
5. **PDDL 作为拆解接口** — 与本库"计划级(而非动作级)接口"的讨论呼应:这里的接口是**符号化 PDDL 规格**,可校验、可参数化。

## ⚠️ 它挑战了本库的一个论点(最有价值的一点)

[[Task Decomposition as OOD Mitigation]] 主张"把 OOD 任务拆成分布内子任务"即可解。LEACL 的实测给出**反证的边界条件**:

> **拆解 + 稀疏奖励 ≈ 0% 成功率**(5 个任务里 3 个全 0)。拆解把长程变短程,但**没让子任务变可学**——"够近了"不等于"抓得到";接触丰富的子任务即便horizon 很短,稀疏奖励下仍学不动。

**应记入的修正**:拆解解决的是**长度/信用分配**,不自动解决**探索**。每个子任务内部仍需要自己的易→难脚手架(课程/参数化难度梯度)。用在你的 Agentic 框架上:光有"短、高-p 的技能库"这个目标不够,**技能本身怎么被训出来**需要 curriculum 这一层——L3 负责段间纠错,curriculum 负责段内可学性。

## What feels strong
- **问题定位精准**:把"LLM 该输出什么"当成设计变量,是比"再调一个 reward 生成器"更根本的一步。
- **dense reward 的失败机理讲清楚了**(sloppy 行为 vs predicate 合取),不是泛泛说"难调";并有 LEAGUE 在 T5 崩到 0.0、方差 ±50.6 的硬证据支撑。
- **评测协议扎实**:5 seeds × 1000 episodes + 95% CI(在机器人论文里已属良好——对照 Tedrake 关于"很多机器人论文在测统计噪声"的批评)。
- **即插即用**设计 + Table I 系统梳理了各 ACL 算法对"任务参数空间/难度度量"的依赖(REQ./OPT.),这张表本身有参考价值。
- **LIBERO+ 有真实开源**(连续参数化谓词),对后续 CL 研究是可复用基建。

## What feels limited
- **依赖预定义谓词词表(grammar)** — 作者自述的主要局限;开放世界里谓词从哪来是个真问题(他们把"让 LLM 自动提出 grammar"列为 future work)。
- **没有真机**:纯 MuJoCo/LIBERO+ 仿真,5 个任务,低维状态。
- **没有真正跑 LLM-奖励生成基线**:明说"no direct one-to-one comparison",用**人工手调 dense reward 的 LEAGUE 当替身/上界**。所以"胜过 LLM 生成奖励"**并未被直接证明**——只证明了胜过(其替身)专家手工奖励。
- **人类课程上界由作者自己设计**(已自述),存在同源偏置。
- **LLM 与 ACL 均只试一种**:仅 ChatGPT-4o-mini、仅 ADR;宣称即插即用但无跨 ACL/跨 LLM 消融。
- **规模很小**:PPO + MLP 2×128 的低维策略,与 VLA/基础模型尺度的技能获取相距很远——能否迁移到"用 VLA 当专家"的技能工厂里,未验证。
- 原文一处**数字不一致**(见上),说明 v1 校对不够细。

## Open questions(接本库)
- **能否用在 VLA 尺度的专家生产上?** 技能工厂里的"新专家"多是 2B 级 VLA,不是 MLP;LLM 生成的任务空间 + ACL 能否驱动 VLA 微调/RL,是把这条线接进你框架的关键未知。
- **谓词 grammar 从哪来** — 若要用于家庭开放场景,grammar 本身必须可增长(与"能力缺口信号"可能是同一问题的两面)。
- **课程 vs 演示的分工**:技能工厂现在是"模仿优先 + RL refinement";LEACL 说纯稀疏 RL + 课程就能超过手工奖励。那么**演示到底在什么时候是必需的**?
- 与 [[Physical Intelligence - pi0.6 a VLA That Learns From Experience|π*₀.6 (Recap)]] 的对照:Recap 用 advantage-conditioned offline RL 从**部署经验**学;LEACL 用**课程**在训练期解探索。两者是同一"让 RL 在具身场景可用"问题的不同侧面。

## Cited-but-not-ingested(同类/前驱)
- **CurricuLLM**(Ryu et al., **ICRA 2025**, [2409.18382](https://arxiv.org/abs/2409.18382)) — LLM 出子任务序列 → 翻译成 **reward code + goal distribution code** → 策略评估回环;操控/导航/运动 + **真机人形运动**。是"LLM 生成课程"这条线更成熟的锚点,但仍**生成奖励**,正是 LEACL 要绕开的那类。
- **LEAGUE**(Cheng & Xu, RA-L 2023)/ **LEAGUE++** — TAMP 式拆解 + 符号算子 + dense reward 生成;本文的主要对照与 baseline。
- **Text2Reward** / **ARCHIE** / **Eurekaverse** / **Voyager**(LLM 提目标) / **IKER**(VLM 从视觉关键点导出奖励,侧重技能串联)。
- ACL 侧:**APT-Gen**、**ALP-GMM**、**PLR**、**ADR**、**SPDL**、**GoalGAN**、**RIAC**、**TeachMyAgent**(框架)。
