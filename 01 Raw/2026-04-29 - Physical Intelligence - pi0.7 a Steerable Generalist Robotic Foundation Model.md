# π₀.7: a Steerable Generalist Robotic Foundation Model with Emergent Capabilities

- Canonical URL: https://arxiv.org/abs/2604.15483
- PDF URL: https://arxiv.org/pdf/2604.15483
- Source type: arXiv (URL-only, Tier 1)
- Accessed at: 2026-04-29T16:02:00+08:00
- arXiv ID: 2604.15483
- Authors: Physical Intelligence (Bo Ai, Kevin Black, Chelsea Finn, Karol Hausman, Sergey Levine, Karl Pertsch, et al.)
- Year: 2026
- Blog: https://pi.website/pi07

## Raw capture

### Abstract

π₀.7 通过**多样化上下文条件化**实现强开箱即用性能。核心思想：训练时不仅用"做什么"的指令，还用"怎么做"的多模态信息（metadata、subgoal images）。使得能利用多样化数据（包括失败数据、自主数据、人类视频、web 数据），实现组合泛化。

### Emergent Capabilities
1. **Out-of-the-box dexterity**：操作咖啡机、折衣物、剥蔬菜等，无需 task-specific fine-tuning
2. **Instruction generalization**：在未见环境中跟随多样语言指令
3. **Cross-embodiment transfer**：零样本迁移到从未训练过的机器人（UR5e 折衬衫）
4. **Compositional generalization**：组合已有技能做新任务（用空气炸锅烤红薯）

### Model Architecture
- 总参数 ~**5B**
  - VLM backbone: **Gemma 3 4B**（含 400M SigLIP vision encoder）
  - Action expert: **860M**（flow matching）
  - MEM 视频历史编码器（时间+空间压缩，输出固定数量 token）
- 输入：最多 4 个摄像头（前/后/双腕），每个最多 6 帧历史 + 最多 3 个 subgoal images
- 448×448 分辨率
- Attention：block-causal masking（观测和 subgoal 双向，文本 causal）
- 机器人状态用线性投影（不再用离散文本 token，改为 MEM 方式）
- Action expert: 50 个 token（50 步 action chunk），双向注意力 + attend to VLM backbone

### Diversified Prompt（核心创新）

训练时 context C_t 包含：
1. **子任务指令 ℓ̂_t**（如"open the fridge door"）— 继承自 π₀.5
2. **Subgoal images**（多视角未来状态图片）— 新增
3. **Episode metadata** — 新增：
   - Overall speed（离散化为 500 步间隔）
   - Overall quality（1-5 分）
   - Mistake label（是否有错误）
4. **Control mode**（joint / end-effector）— 新增

训练时每个组件**随机 dropout**，推理时可灵活组合。

### World Model（Subgoal Image 生成器）
- 基于 **BAGEL**（14B mixture-of-transformers 图像生成模型）
- 接受：当前观测 + 子任务指令 + metadata → 生成 subgoal images
- 用 flow matching 训练
- 融合 web 数据 + 人类视频 + 机器人数据
- 推理时异步运行，4 秒刷新或子任务切换时刷新

### Training Data
- 演示数据（多平台、多环境）
- **大量次优数据**：失败 episode、RL 训练中间数据（π*₀.6 的自主数据）
- 人类干预数据
- 开源机器人数据集
- 人类第一人称视频
- Web 多模态数据（VQA、object localization、video captioning）
- **关键**：用 episode metadata 标注数据质量，使模型能从混合质量数据中学习

### Inference
- 50Hz（UR5e 20Hz）
- Action chunk 50 步，5 步去噪
- 执行 Ĥ ∈ {15, 25} 步
- RTC：训练时模拟 0-12 步延迟（最大 240ms）
- CFG on episode metadata：β ∈ {1.3, 1.7, 2.2}
- 异步推理：subgoal image 和子任务指令在独立线程生成
- Runtime metadata：speed=15th percentile，quality=5，mistake=false

### MEM Memory System
- π₀.7 基于 π₀.6-MEM 架构
- MEM：视频历史编码器，压缩历史帧为固定 token 数
- 能执行需要记忆的任务（如追踪已处理过的物体）
- 性能匹配或超过 MEM 论文中的 specialist policies

### Results
- 匹配 π*₀.6 RL specialist 在浓缩咖啡/折衣物/组装箱子上的性能
- 甚至在某些任务上 throughput 超过 RL specialist
- 比 π₀.5 和 π₀.6 在指令跟随和泛化上大幅领先
- 零样本跨 embodiment 迁移：UR5e 折衬衫（从未训练过）
- Subgoal images + metadata 显著提升性能
- CFG on metadata 进一步提升灵巧任务表现
- 能执行需要记忆的任务（Figure 8）

### Verbal Coaching
- 人类可以一步步用语言指导 π₀.7 完成全新任务
- 之后用 coaching 数据 fine-tune 高层策略 → 全自主执行
- 例：把红薯放进空气炸锅
