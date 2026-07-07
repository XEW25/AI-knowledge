# Galaxea 星海图（Galaxea AI / Xinghaitu）

- **Type**: Company / Embodied-AI Startup
- **Founded**: 2023（9 月）
- **Headquarters**: 北京（China）
- **Founders**: 清华 + 斯坦福背景科学家团队；联合创始人/Co-CSO **许华哲（Xu Huazhe）**（斯坦福训练、清华机器人教授）
- **Focus**: 具身智能基础模型 + 机器人本体（移动操作）
- **Flagship**: **G0 / G0Plus** 双系统 VLA → **G0.5** 统一自回归 VLA（架构转向）；R1 系列机器人（R1 / R1 Pro / R1 Lite，双 6-DoF 臂 + 4-DoF 躯干 + 向量转向移动底盘）
- **Funding**: 累计融资 ~$210M；估值约 $700M+（部分报道称近百亿人民币"独角兽"）→ **2026-04 更新**：B+ 轮 20 亿 RMB，投后估值突破 200 亿 RMB（media-reported，品玩）

> **命名注意**：中文名 **星海图**（Crunchbase/CB Insights 收录为 Xinghaitu）。⚠️ 不要与"跨维智能（Dexmal）"混淆——那是另一家公司。⚠️ 也**不要与 [[Galbot 银河通用]]（Galaxy General Robotics，王鹤）混淆**——两家不同公司，英文名都带 "galaxy" 味、都有 0.5 版本号，极易张冠李戴。

## 在具身领域的站位

- **战略**：开源（OpenGalaxea/G0）+ 自有 Galaxea Open-World Dataset（500+ 小时移动操作）+ 本体（R1 系列）。

## 数据战略（2026-07 调研补充）

- **GOD（Galaxea Open-world Dataset）**：500+ 小时 / 10TB+ / 10 万+ 操作数据，住宅/餐厅/零售/办公 50 场景、150 类任务、1600+ 物体、58 种技能；全部用 **R1 Lite 单一本体遥操**采集，以"动作空间一致性 + 语言标注对齐"为质量卖点；下载量 60 万+（media，2025-08 极客公园 / 2026-04 品玩）。
- **⚠️ 无 UMI 类硬件产品**（截至 2026-04 报道）："UMI 数据"仅是其 2026"真实数据金字塔"中的一个数据类别，未推出具名手持/穿戴数采设备——不要把星海图归入 UMI 硬件厂商（对照 [[TARS 它石智航]] 的穿戴产品线）。
- **本体一致性主张**：团队实验发现预训练平台与目标机器人本体差距大时，跨本体预训练收益显著减弱甚至为负（media-reported）——GOD 单本体策略的依据。
- **质量观**：公开主张"质量优先于数量"（一条高质量数据抵 10–100 条低质量），称数据质量是 2026 年模型公司分水岭；2026 目标是建全球最大真实场景具身数据集（media）。
- 详见 [[Real-robot data collection - teleop vs UMI-class, and the model-in-the-loop quality problem]]。
- **架构特点**：G0 是**双系统**——G0-VLM（Qwen2.5-VL 规划器）+ G0-VLA（PaliGemma 执行器）。系统级接口是**自然语言子任务**（类 ChemBot）；G0-VLA 内部是**范式 A**（PaliGemma + flow matching，joint attention）。
- 创始团队公开判断：人形机器人将在十年内进入家庭。

## 与知识库主题的关联

- [[Galaxea - G0 Dual-System VLA Model]] — G0 双系统、语言子任务接口、内部范式 A
- [[Embodied Brain Models]] — "语言子任务"系统接口族；范式 A 内部耦合；解耦程度光谱最松一端
- [[Huang et al. - ChemBot Long-Term Memory for VLA-based Agents]] — 同属语言子任务接口族

## Related

- [[AgiBot 智元]] / [[LimX Dynamics]] / [[DeepCybo]] — 中国具身同行
- [[Physical Intelligence (π)]] — G0-VLA 与 π 系列同为 PaliGemma 范式 A

## tags

#entity #galaxea #xinghaitu #g0 #dual-system #vla #embodied-ai #china #open-source
