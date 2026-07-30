# 2026-07-30 · Raw · LEACL: LLM-Enhanced Automatic Curriculum Learning for RL in Long-Horizon Manipulation Tasks

- **Tier**: **URL-only (Tier 1)** — PDF 为 **6.14 MB > 2 MB**,按 `01 Raw/` 规则不入库(仅记 URL)。
- **arXiv**: https://arxiv.org/abs/2607.23515 (v1, cs.RO, 2026-07-26)
- **HTML(实际阅读版本)**: https://arxiv.org/html/2607.23515v1 — LaTeXML 生成,**全文自读核实**(2026-07-30)
- **PDF**: https://arxiv.org/pdf/2607.23515
- **License**: CC BY 4.0
- **Source note**: [[Heravi et al. - LEACL LLM-Enhanced Automatic Curriculum Learning for RL in Long-Horizon Manipulation]]

## 已核实事实(自读 HTML 全文)

- **作者**: Faraz Heravi¹*, James Ouyang¹*, Zifan Xu¹, Arjun Kumar¹, Yoonchang Sung², Peter Stone¹³ (*equal)
  - ¹**UT Austin**(LARG,Learning Agents Research Group) · ²**NTU Singapore** · ³**Sony AI**(Stone 任 Sony AI America 执行总监)
- **前身**: 参考文献 [4] 是一篇 **Master's Thesis**(2025)"Curriculum learning in reinforcement learning for multi-step manipulation tasks";arXiv 版**仍留着盲审匿名**("F. Bar, University X, redacted for blind review")。经独立检索确认实为 **Faraz Heravi, UT Austin ETD, 2025-05**(同名题目)。
- **LLM**: ChatGPT **4o-mini**(任务拆解 + PDDL 生成 + meta-task 生成)
- **ACL 算法**: **Active Domain Randomization (ADR)**;框架基于 **TeachMyAgent**
- **Base RL**: **PPO**(Stable-Baselines3 超参;lr 2e-4,512 steps/update,**MLP 2×128** actor+critic)
- **观测**: 低维状态(任务相关物体位姿、末端 3D 位置+朝向、关节位置/速度、目标状态)——**非像素、非 VLA**
- **Benchmark**: **LIBERO+**(自扩展:把 `open(object)` 这类谓词换成带连续参数的 `open(object, ?o)`,并新增谓词)
- **开源**: **LIBERO+ 仓库公开** https://github.com/fheravi/LIBERO-plus(2★,231 commits,"Open-ended curriculum learning for visual manipulation tasks";**license 未标注**)。LEACL 自身 pipeline(LLM prompts / PDDL 生成)**未见明确发布**。
- **评测协议**: 5 个任务 × 5 seeds,每 seed 用**最终模型跑 1000 episodes**,报 mean ± 95% CI;训练预算 ≥ **500k** env steps(取各 baseline 到平台期)
- **子任务数**(人类专家拆解,用于对照): T1–T5 = **2 / 5 / 6 / 4 / 5**

## 结果表(Table II,原文数值)

| 方法 | T1 开抽屉 | T2 碗→盘 | T3 番茄酱→篮 | T4 开灶+摩卡壶 | T5 杯→微波炉+关门 |
|---|---|---|---|---|---|
| Sparse reward | 0.0 ± 0.0 | 0.0 ± 0.0 | 0.0 ± 0.0 | 0.0 ± 0.0 | 0.0 ± 0.0 |
| LEACL w/o ACL | 0.0 ± 0.0 | 11.8 ± 15.4 | 0.0 ± 0.0 | 8.2 ± 15.5 | 0.0 ± 0.0 |
| LEAGUE(专家 dense reward) | 99.4 ± 1.0 | 71.0 ± 37.4 | 29.8 ± 50.6 | 21.1 ± 17.4 | 0.0 ± 0.0 |
| Human curriculum(上界) | 99.8 ± 0.2 | **96.0 ± 2.5** | 86.3 ± 7.2 | **79.7 ± 11.1** | **89.0 ± 7.5** |
| **LEACL (ours)** | 99.8 ± 0.1 | 90.7 ± 4.1 | **89.4 ± 1.8** | 60.6 ± 6.5 | 75.9 ± 3.4 |

核对(自算):LEACL 胜 LEAGUE 于 T2/T3/T4/T5(**4/5**,T1 基本打平)——与原文"underperforms LEACL on 4 out of 5"一致。Human 胜 LEACL 于 T2/T4/T5(**3/5**),**T3 LEACL 反超**(89.4 > 86.3)——与原文"outperforms LEACL in 3 out of 5"一致。

## ⚠️ 发现的原文内部不一致(存疑,自核对)

正文 §VI 写 "LEACL w/o ACL ... achieving a modest success rate of only **32.8%** on the relatively simpler task *Put the white bowl on the plate*",但 **Table II 该格为 11.8 ± 15.4**。两处数字对不上(疑为旧版残留或指别的度量,如 seed 最大值 / 子任务级成功率)。**引用时以表格为准并标注存疑。**

## 三个结论小标题(原文原话)

1. *Task decomposition alone is insufficient for RL to solve even short-horizon tasks*
2. *Designing shaping rewards for long-horizon manipulation tasks is challenging*
3. *LLMs rival or even surpass human experts in curriculum generation*

## 作者自述的主要局限

> "A major limitation of LEACL is its reliance on a **predefined grammar**—a set of predicates used to decompose a given task—provided a priori, such as the complete predicate set available in LIBERO+."

另:论文明说 **未与 LLM 自动生成奖励的方法直接对比**——"there is no direct one-to-one comparison between ACL and LLM-based reward generation",用**人工手调 dense reward 的 LEAGUE 当替身/上界**。
