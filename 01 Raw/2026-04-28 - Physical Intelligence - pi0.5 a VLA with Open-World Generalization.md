# π₀.5: a Vision-Language-Action Model with Open-World Generalization

- Canonical URL: https://arxiv.org/abs/2504.16054
- PDF URL: https://arxiv.org/pdf/2504.16054
- Source type: arXiv (URL-only, Tier 1)
- Accessed at: 2026-04-28T23:06:00+08:00
- arXiv ID: 2504.16054
- Authors: Physical Intelligence (Kevin Black, Danny Driess, Chelsea Finn, Karol Hausman, Brian Ichter, Sergey Levine, Karl Pertsch, Allen Z. Ren, et al.)
- Year: 2025
- Blog: https://pi.website/blog/pi05
- ✅ Open-source: [openpi](https://github.com/Physical-Intelligence/openpi)

## Raw capture

### Abstract

π₀.5 基于 π₀，通过 co-training on heterogeneous tasks 实现 broad generalization。用多机器人数据、高层语义预测、web 数据等，在全新家庭环境中完成长 horizon 操作（清理厨房/卧室）。第一个在全新家庭中完成 end-to-end 长 horizon 精细操作的 VLA 系统。

### Core Architecture

**两层推理**（同一个模型）：
1. **高层推理**：观察 + 高层任务指令 → 预测语义子任务（如"pick up the plate"）
2. **底层推理**：观察 + 子任务 → action expert 预测 action chunk

公式分解：
```
π(a, ℓ̂|o, ℓ) = π(a|o, ℓ̂) · π(ℓ̂|o, ℓ)
```
动作分布只依赖子任务 ℓ̂，不直接依赖高层指令 ℓ。类似 chain-of-thought。

**模型结构（详细）**：
- Transformer backbone + action expert（类似 MoE，action token 用单独的 FFN 权重）
- Attention 层是共享的——action expert 通过同一个 attention 能 attend to 序列中所有 token（图像、文本、子任务文本）
- 只有 FFN 权重不同（action expert 专用 vs backbone 通用）
- 输入：图像 patch + 文本 token + 机器人状态 + flow matching 中间值
- 输出：文本 token logits（子任务/VQA）+ action expert 连续输出
- 注意力：图像 patch、文本 prompt、action token 用双向注意力（非纯 causal）

**两层推理的信息流**：
1. Backbone 自回归生成子任务文本 token（token by token，"pick" → "pick up" → "pick up the plate"）
2. 子任务 token **不会** round-trip 成文本再 tokenize——停留在 embedding 空间
3. Action expert 通过共享 attention 直接读子任务 token embedding，一次 flow matching 去噪生成 action chunk
4. 子任务切换是低频的，动作生成是 50Hz 高频

**数学分解**：π(a, ℓ̂|o, ℓ) = π(a|o, ℓ̂) · π(ℓ̂|o, ℓ)
- 动作只看子任务 ℓ̂，不看原始高层指令 ℓ
- 类似 chain-of-thought

**共享表示的粒度**：
- 共享：backbone 的视觉-语言理解（attention 层）
- 不共享：action expert 的 FFN 权重（860M 参数，专门做 flow matching）
  - ⚠️ 更正（2026-05-30）：860M 系早期误记——π₀.5 的 action expert 实为 gemma_300m（300M，与 π₀ 同，openpi 核实）；860M 是 π₀.6 的数字。此外"共享 attention 层"的表述也不准确（实为 MoE 双专家各自独立 attention + block-causal joint attention）——详见 02 Sources 笔记
- 这是半共享——比完全独立（ChemBot）更紧密，比完全端到端更模块化

### 两阶段训练

**Pre-training（280k steps）**：
- 全部用离散 token（FAST tokenizer 编码动作）
- 数据源：
  - MM：~400 小时移动操作器数据，~100 个家庭环境
  - ME：非移动机器人数据，更多样化环境（更容易搬运）
  - CE：实验室跨 embodiment 数据，含 OXE 开源数据集
  - HL：人工标注语义子任务 + bounding box
  - WD：web 数据（image captioning, VQA, object localization）
- 97.6% 的训练数据不是来自移动操作器做家务

**Post-training（80k steps）**：
- 加 action expert（随机初始化），flow matching + next-token prediction 联合训练
- α = 10.0（flow matching 权重）
- 数据：MM + ME 成功 episode + WD（保语义能力）+ HL + VI（verbal instruction）
- VI：专家用语言"遥操作"机器人，提供好的高层子任务示范

### Key Design: Discrete + Continuous Action

- Pre-training 用 FAST tokenizer 离散化动作 → 训练快、稳定
- Post-training 加 flow matching action expert → 推理快（非自回归）
- 两种表示不互相 attend
- 推理时：自回归解码文本子任务 → 10 步去噪生成动作

### Robot System

- 双臂移动操作器，4 个摄像头（前/后/双腕）
- 18-19 DoF（双臂 6DoF × 2 + gripper × 2 + base 3DoF + torso lift 1-2DoF）
- 50Hz 控制，直接命令目标位姿，PD controller 追踪
- 无额外轨迹规划或碰撞检测，完全端到端

### Results

- 在**全新家庭**中完成清理厨房/卧室任务（10-15 分钟长 horizon）
- Co-training 每个成分都有贡献，去掉任何一个都会掉性能
- 比 π₀ 显著更强（尤其是泛化能力）
- 高层推理组件至关重要，去掉后长 horizon 任务崩溃
- Scene 数量越多泛化越好，但有边际递减

### Relation to π₀

- π₀.5 是 π₀ 的升级版
- 新增：co-training 框架、两层推理、多机器人数据、web 数据
- 保留了 π₀ 的 flow matching action expert 设计
