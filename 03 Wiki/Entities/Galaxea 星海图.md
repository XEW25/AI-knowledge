# Galaxea 星海图（Galaxea AI / Xinghaitu）

- **Type**: Company / Embodied-AI Startup
- **Founded**: 2023（9 月）
- **Headquarters**: 北京（China）
- **Founders**: 清华 + 斯坦福背景科学家团队；联合创始人/Co-CSO **许华哲（Xu Huazhe）**（斯坦福训练、清华机器人教授）
- **Focus**: 具身智能基础模型 + 机器人本体（移动操作）
- **Flagship**: **G0 / G0Plus** 双系统 VLA；R1 系列机器人（R1 / R1 Pro / R1 Lite，双 6-DoF 臂 + 4-DoF 躯干 + 向量转向移动底盘）
- **Funding**: 累计融资 ~$210M；估值约 $700M+（部分报道称近百亿人民币"独角兽"）

> **命名注意**：中文名 **星海图**（Crunchbase/CB Insights 收录为 Xinghaitu）。⚠️ 不要与"跨维智能（Dexmal）"混淆——那是另一家公司。

## 在具身领域的站位

- **战略**：开源（OpenGalaxea/G0）+ 自有 Galaxea Open-World Dataset（500+ 小时移动操作）+ 本体（R1 系列）。
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
