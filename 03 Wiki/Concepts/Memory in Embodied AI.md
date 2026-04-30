# Memory in Embodied AI

具身智能中的记忆是指机器人**保留和利用过去信息**的能力——无论这些信息通过什么形式保存。

## 为什么重要

长程任务（如清理整个厨房）需要机器人记住：
- **已经做了什么**（任务进度）
- **怎么做更好**（操作经验）
- **环境长什么样**（场景记忆）
- **之前失败了什么**（错误规避）

没有记忆的系统每次都从零开始，无法积累、无法改进。

## 两条路径

### 隐式记忆（Procedural Memory）

把经验融入模型权重——"学会了但说不清怎么学的"。

- **实现方式**：通过 RL / fine-tuning 更新参数
- **代表工作**：π*₀.6 (Recap)、RL Tokens
- **优点**：推理零开销、技能自然内化
- **缺点**：不可解释、不能选择性回忆、每次更新需要重新训练

### 显式记忆（Episodic Memory）

把经验以可检索的形式存储——"记得具体发生了什么"。

- **实现方式**：数据库 / RAG / 向量检索
- **代表工作**：ChemBot（Episodic Long-Term Memory）、MemPO
- **优点**：灵活检索、可解释、可选择性回忆
- **缺点**：推理有检索开销、需要额外存储、需要检索策略

### 两者结合

理想情况下两层都应有记忆：
- 隐式：操作技能（"怎么做"）→ 底层执行模型
- 显式：策略经验（"做什么"）→ 高层规划模型

π₀.7 的 MEM 系统可能是第一个同时具备两者的 VLA。

## 各工作的记忆状态

| 工作 | 隐式 | 显式 | 备注 |
|------|------|------|------|
| π₀.5 | ❌ | ❌ | 无记忆机制 |
| π*₀.6 (Recap) | ✅ RL 权重更新 | ❌ | 部署经验融入参数 |
| RL Tokens | ✅ 小网络 RL | ❌ | 精密操作"肌肉记忆" |
| ChemBot | ❌ | ✅ 双层 RAG | 只有上层规划有记忆 |
| π₀.7 | ✅ | ✅ MEM | PI 第一个双记忆 VLA，subgoal image conditioning |
| GigaWorld-Policy | ❌ | ❌ | 无记忆机制 |
| Voyager | ❌ | ✅ 技能库 | 上层技能积累 |

## 开放问题

- 底层执行模型是否需要自己的显式记忆？还是隐式记忆就够了？
- 隐式记忆的更新频率和粒度如何控制？（每次部署都 fine-tune？定期 batch update？）
- 显式记忆应该存什么？完整轨迹？压缩摘要？关键帧？
- 两种记忆如何协调？显式检索的结果能指导隐式更新吗？

## Related

- [[Agent memory]] — 更广义的 agent 记忆讨论
- [[Task decomposition]] — 记忆分配跟架构拆解紧密相关
- [[Physical Intelligence - pi0.6 a VLA That Learns From Experience]] — 隐式记忆代表
- [[Huang et al. - ChemBot Long-Term Memory for VLA-based Agents]] — 显式记忆代表
- [[Memory Policy]] — memory as policy
