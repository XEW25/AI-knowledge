# LimX Dynamics（逐际动力）

- **Type**: Company / Robotics Startup
- **Founded**: 2022
- **Headquarters**: 深圳（China）
- **Founders**: **张巍（Wei Zhang）**（Purdue 博士、南方科技大学终身教授、前 UC Berkeley 博后、前 Ohio State 终身教授）+ 张力（Zhang Li，COO，前 WeRide）
- **Focus**: 具身智能机器人 + 足式运动 + agentic 操作系统
- **Flagship**: W1 轮式四足；TRON 模块化双足系列；Oli（前 CL 系列）全尺寸人形；**ChemBot**（化学实验室 VLA agent）
- **Funding**: 累计 ~$296M（7 轮，35 投资方）

## 在具身领域的站位

- **特点**：以**足式运动控制 + 本体**起家（创始人张巍是控制/足式机器人背景），延伸到具身操作 agent。
- **架构贡献（ChemBot）**：**Agent-as-Planner + VLA-as-Skill** 的完全分离双层架构——上层 Qwen3-VL-Flash agent 做层次化规划 + 双层记忆 + chain-backtracking 纠错；底层 GR00T-based Skill-VLA 做执行。系统接口是**自然语言子任务（MCP）**。是"完全分离"耦合的纯粹实现。
- **Ethan 的洞察**：ChemBot 暴露了"记忆不对称"问题——上层有记忆、底层无记忆。

## 与知识库主题的关联

- [[Huang et al. - ChemBot Long-Term Memory for VLA-based Agents]] — ChemBot 双层架构 + 双层记忆
- [[Embodied Brain Models]] — "语言子任务"系统接口族；完全分离耦合
- [[Memory in Embodied AI]] — ChemBot 的显式记忆 + 记忆不对称问题
- [[Home robot architecture - a hierarchical embodied agent]] — chain-backtracking = 规划级失败恢复的雏形

## Related

- [[AgiBot 智元]] / [[Galaxea 星海图]] / [[DeepCybo]] — 中国具身同行
- [[NVIDIA]] — ChemBot 的 Skill-VLA 基于 GR00T

## tags

#entity #limx #逐际动力 #chembot #legged #humanoid #vla #embodied-ai #china
