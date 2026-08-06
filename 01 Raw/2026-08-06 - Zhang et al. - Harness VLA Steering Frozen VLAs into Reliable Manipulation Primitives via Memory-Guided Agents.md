# 2026-08-06 · Raw · Harness VLA: Steering Frozen VLAs into Reliable Manipulation Primitives via Memory-Guided Agents

- **Tier**: **URL-only (Tier 1)** — 未下载 PDF;**全文经 arXiv HTML 自读核实**(LaTeXML v1)
- **arXiv**: https://arxiv.org/abs/2607.08448 (v1, cs.RO, **2026-07-09**)
- **HTML(实际阅读版本)**: https://arxiv.org/html/2607.08448v1
- **项目页**: https://harnessvla.github.io/
- **License**: CC BY 4.0
- **Source note**: [[Zhang et al. - Harness VLA Steering Frozen VLAs into Reliable Manipulation Primitives via Memory-Guided Agents]]

## 已核实事实(自读 HTML 全文,2026-08-06)

- **作者**: Yixian Zhang¹\*, Huanming Zhang¹\*, Feng Gao², Xiao Li³, Zhihao Liu⁴, Chunyang Zhu⁵, Jiaxing Qiu⁵, Yuchen Yan⁵, Jiyuan Liu⁶, Wenhao Tang¹, Zhengru Fang⁷, Yi Nie^{1,2}, Changxu Wei¹, Yu Wang¹, Wenbo Ding¹, **Chao Yu**^{1,†}(通讯) — \*equal
- **机构**: ¹**清华大学** · ²Striding AI · ³Purdue · ⁴中科院自动化所 · ⁵**无问芯穹 Infinigence AI** · ⁶中关村学院 · ⁷港科大
- **被包的冻结 VLA**(三个 benchmark 各一): **π0.5-SFT**(`pi05_libero130_fullshot`,经 RLinf checkpoint)→ LIBERO / LIBERO-Pro;**RLDX-1** → RoboCasa365;**LingBot-VLA**(RoboTwin 后训练版)→ RoboTwin C2R
- **primitive 词表**: 6 个解析式 + 1 个 VLA 原语(`vla_act`);RoboCasa365 另加 2 个移动底盘原语(`navigate_to` 组合式 / `move_base` 原子式)。**词表在评测前固定,planner 不能发明新原语**
- **调用形式**: 单个 JSON 对象;planner **从不直接发力矩/关节目标/action chunk**
- **planner = 现成编码 agent,零微调**: **Codex**(OpenAI)与 **Claude Code**(CC)两个实例,共享同一 harness/记忆接口/原语库/冻结 VLA 接口/评测协议,**仅 planner backbone 不同**。⚠️ **两个 headline 数字来自不同实例**:LIBERO-Pro 82.4%(**CC**)vs Codex 72.1%;RoboCasa365 55.4%(**Codex**)vs CC 48.6%;RoboTwin C2R 58.0/58.4 接近;标准 LIBERO CC **96.0%**(384/400)vs 冻结 RLinf 95.3%
- **File-Mediated REPL Protocol**(附录 A): 长期运行的 environment worker 持有实时仿真状态;planner 仅通过文件交互 —— 写 `command.json` → 等 `done_NN.flag`/`log_NN.json` → 读 `state_NN.json`/`log_NN.json`/images/depth maps/**world maps** → 决定下一条。**planner 不接触特权仿真状态、物体位姿、控制器内部**。原文:"**every primitive call is treated as an experiment whose result must be observed before the next command is issued**"
- **感知(多模态,重度依赖)**: 原文 "**RGB image supports qualitative scene reasoning**(杂乱/语义身份),while the **co-aligned depth map and proprioception supply metric spatial data** for precise localization"。**禁止拿物体坐标** ⇒ prompt 给定位规程:①RGB 识别实体 →②在可见表面**挑像素** →③索引**预计算 world map** →④**多采稳定像素取中位数** →⑤避开边缘/轮廓/桌缝/孔洞/反光/背景 →⑥机器人/相机/物体/底盘/固定物/**抓取状态**变化即**重新定位**
- **TSM 消融(严格零样本,撤掉 TSM 检索)**: LIBERO-Pro Goal 得 **31.0%(Pos-S)/79.0%(Task-T)**,**仍胜 Cap-X 的 25.6%/16.8%** ⇒ 记忆是加成非必需,基座 planner 决定地板
- **零训练确认**: 解析式原语 "require no training data";VLA 全程冻结("no additional training or adaptation");**planner 无微调**。局限自述:"limited by an **open feedback loop**...**lacks joint fine-tuning via environmental rewards and human preferences**—necessitating future sample-efficient RL (e.g., **GRPO**)"
- **τ(early-return / stop predicate)**: **由 planner 在调用时配置**;可取 **lift-and-grasp condition / contact-state condition / benchmark predicate / chunk budget**。VLA 持续吐 action chunk **直到 τ 满足或 chunk 预算耗尽**
- **两层判定**: ① 执行中——环境用 planner 预设的 τ 判定何时终止;② 返回后——引擎回传 `o_{t+1}` + robot state + **lightweight execution records / diagnostic record**(含 accepted command、primitive status、step counts),**planner** 据此把结果分类为 **progress / recoverable failure / unrecoverable failure**
- **两个记忆**: **Task Specific Memory**(程序性 JSONL trace + 语义 JSON 摘要;trace 是"任务级解法骨架,不是开环轨迹";**空间参数是 reference-scene binding,部署时必须重新接地**)、**Global Memory**(任务无关的 success rules + failure models)
- **迭代式记忆构建**: 记忆在交互中构建而非事后写入;**refine 而非累积**(更短/更可靠的 trace 替换旧的,失败观测保留为约束)
- **部分可观测是刻意设计**: 明确**不给物体坐标**——"prevent any reliance on oracle-level environment access during decision making";agent 只拿到物体名称 + proprioception,必须从 RGB-D 自己定位
- **结果**: LIBERO-Pro **+38.6pp**、RoboCasa365 **+25.4pp**(均 vs 最强相关基线)、RoboTwin C2R **58.4%**;标准 LIBERO 性能保持。**不微调 VLA**
- **原语使用统计**: RoboCasa365 中 `navigate_to`+`move_base` 占调用 **19.4%**,`vla_act` 占 **35.3%**
- **完成归因**: LIBERO-Pro 系任务**多由解析式原语触发最终完成谓词**(VLA 建立接触后,由 analytic transport/release/repositioning 收尾)

## 三个 Key Finding(原文小标题)
1. *Planner-level semantic re-grounding restores task-conditioned behavior*
2. *Planner-staged VLA invocation improves frozen-policy reliability*
3. *Analytic primitives isolate non-contact execution from contact-rich control*

## ⚠️ 仿真依赖(自读核实,写入源笔记的限定条款)
- **全部实验在仿真**(MuJoCo via Robosuite);全文 "real robot / real-world" 仅 3 处命中,**全是在引用他人工作**(RT-1 标题、LingBot-VLA 预训练数据描述)——**无自有真机实验**
- **成功判据 = benchmark 提供的 binary completion predicate**;且 Global Memory 的失败模型明写 *"Check the benchmark success signal and the latest execution record"* ⇒ **仿真器 oracle 进入了决策回路**,不只用于打分
- **τ 的可选形式里包含 "a benchmark predicate"** ⇒ **连 primitive 的终止条件都能挂在仿真 oracle 上**
- 论文把结果分为 progress / recoverable / **unrecoverable failure**,但对 unrecoverable **只做标注 + 存为负证据,不解决**
