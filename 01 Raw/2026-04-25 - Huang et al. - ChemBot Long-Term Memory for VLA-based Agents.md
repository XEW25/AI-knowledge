# Long-Term Memory for VLA-based Agents in Open-World Task Execution (ChemBot)

- Canonical URL: https://arxiv.org/abs/2604.15671
- PDF URL: https://arxiv.org/pdf/2604.15671
- Source type: arXiv (URL-only)
- Accessed at: 2026-04-25T15:51:00+08:00
- arXiv ID: 2604.15671
- Authors: Xu Huang, Weixin Mao (LimX Dynamics), Yinhao Li (LimX Dynamics), Hua Chen (LimX Dynamics), Jiabao Zhao (Nanjing University), et al.
- Affiliations: LimX Dynamics, Nanjing University
- Tier: 1

## Raw capture

### Abstract

ChemBot: 双层闭环框架，自主 AI agent + progress-aware VLA (Skill-VLA)，层次化任务分解+执行。双层记忆 + MCP server + future-state 异步推理。

### Model Details

**上层 AI Agent**：
- Backbone: 评测了 Qwen3-VL-Flash、Qwen3-VL-Plus、Doubao-1.6
- 实验用 Qwen3-VL-Flash（本地部署，延迟最低 2.3s）
- 通过 MCP server 编排多个子 agent：Scene Describer、SubtaskAgent、ReflectorAgent

**底层 Skill-VLA**：
- 基于 **GR00T**（NVIDIA 人形机器人 VLA）作为 base policy
- VLM backbone: Eagle VLM
- Action: Diffusion Transformer (DiT) + Flow Matching，预测 action chunk (H=50)
- 加了 **Progress Head**：cross-attention 模块
  - Query = 机器人状态线性投影
  - Key/Value = Eagle VLM 最终隐藏层
  - 输出 = 进度标量 p_t ∈ [0, 1]
  - MSE loss 联合训练，ground truth = 子任务内归一化时间步位置
  - Progress head loss weight = 0.1

**训练**：
- 每个任务 40,000 步，8× A100
- 自建 Chemical Manipulation Dataset
- 推理硬件: RTX 5090

### Dual-Layer Memory

**短期记忆（Dashboard）**：
- 结构化表示，三个模块：
  1. Scene 模块：Scene Describer 解析实验台图片为结构化场景（物体、状态、affordance、空间关系），用 Set-of-Mark Prompting
  2. Tool Index 模块：工具使用产生的大量信息→存储路径，轻量表示，按需加载
  3. Task State 模块：持续记录实验规划进度，给增量规划提供全局视角
- 即时覆写策略：环境变化或任务完成时直接更新字段值

**长期记忆（Episodic Long-Term Memory）**：
- 持久保存历史对话（实验者与 agent 跨 session 对话）
- 语义检索：新任务检索过去经验轨迹加速规划
- 定期提取操作偏好和实验档案，实现长期个性化适配

### Chain-Backtracking 回溯

发生在 Subtask Generator 的增量规划循环：
```
Subtask Reasoner → 生成一个原子子任务
       ↓
Reflector → 评估：可行性？合理性？不冗余？
       ↓
  通过 → 加入执行队列
  不通过 → 标记删除，反馈回 Reasoner → 回溯重新规划
       ↓
重复直到 Reflector 判定任务序列完整
```

回溯是**规划阶段的自我纠错**，不是执行失败后的回退。粒度是单个原子子任务级别。

### Key Observation

**记忆不对称**：上层 agent 有双层记忆（短期+长期），底层 Skill-VLA 没有记忆机制（每次无状态执行）。经验积累只发生在规划层。

### Related Work References
- 引用了 OpenClaw 作为 AI agent 成功案例（工具使用、持续操作），但指出缺乏物理灵巧性
- 参考：RoboMatrix, RoboChemist, Being-0, Voyager, CLAP
