# ACE Robotics - Kairos 3.0: a Real-Time Generative Video World Model

- **Type**: 开源模型发布（**无论文 / 无技术报告**——见下"论文核查"）
- **Org**: **ACE Robotics（上海）**，创始人 **王晓刚（Wang Xiaogang，商汤 SenseTime 联合创始人）**；开源以 "Kairos Team" / `kairos-agi` 名义
- **GitHub**: https://github.com/kairos-agi/kairos-sensenova （"Official code for world model Kairos 3.0"，Apache-2.0，476★，建于 2025-12-02，活跃至 2026-04）
- **Weights**: HuggingFace `kairos-agi/*`（collection `kairos30`）+ ModelScope `kairos-team/kairos30`
- **Release**: 2026-03-13（Media OutReach 通稿；ACE Robotics 正式开源）
- **Open-source**: ✅ **真开源**——代码 + 权重均公开（Apache-2.0）。**注意**：这与库里多数中国具身工作"仅项目页"的模式相反（cf. PhysBrain/G0/TwinBrainVLA），是个正面例外
- **Accessed**: 2026-06-13
- **Raw**: URL-only（Tier 1，无本地捕获）

> **定位**：Kairos 3.0 是一个 **像素级生成式视频世界模型（Cosmos 一类）**，4B、混合线性注意力、主打**边缘实时**。归属 [[Embodied Brain Models]] 的 **Predictive Spatial Models 流派 / 像素级世界模型分支**（与 Cosmos、Genie、BAGEL 同列）。**血缘**：王晓刚=商汤联创，故仓库/权重命名 `sensenova`（SenseTime/日日新血缘）。
>
> ⚠️ **最重要的一条（代码核实）**：**开源出来的 Kairos 是纯视频生成模型，没有任何动作头**。新闻稿宣称的"理解-生成-**预测**统一""动作预测/闭环控制"在开源代码中**不存在**——详见"PR vs 代码"。

## 论文核查（用户要求"找论文"）

**结论：截至 2026-06-13 无论文 / 无 arXiv / 无技术报告。** 核查路径：
- README 有 "📑 Paper" 徽章，但**链接为空占位符**（raw README 核实）
- arXiv 两轮搜索（通用 + 限定 `arxiv.org` 域）：无任何题为 Kairos 的论文
- 2026-03 发布通稿明确"无学术论文/arXiv/技术报告，仅 GitHub + HF"
- 2026-06 再搜（April–June）：只有 3 月通稿的多语种转载，无后续报告
- HF / ModelScope 模型卡：无引用、无 BibTeX

→ **一手来源 = 开源代码 + HF 权重 + 发布通稿**。架构事实**直接从代码核实**（见下），不依赖 PR 措辞。

## 代码级架构核实（kairos_4b_config.py / kairos_dit.py）

| 维度 | 代码核实结果 |
|------|------|
| 模型类型 | **视频扩散 Transformer `KairosDiT`**（Conv3d patch embedding，flow-matching scheduler）|
| DiT 规模 | dim **2560**，**32 层**，20 heads，ffn 10240，in/out dim 16（latent 通道），patch_size [1,2,2] |
| **混合线性注意力** | `use_linear_attns = [(i+1) % 4 == 0 for i in range(num_layers)]` → **每 4 层 1 层线性**（**GatedDeltaNet**，FLA 库，chunk + sliding cache），其余 3 层 **full softmax**（flash/SageAttention）。即 **1:3、25% 线性**——这就是 PR 说的"custom hybrid linear attention operator"，O(n²)→O(n) 只对那 25% 的线性层成立 |
| VAE | **Wan2.1_VAE**（来自 Wan2.1-T2V-14B，阿里 Wan 视频 VAE）|
| 文本编码 | **Qwen2.5-VL-7B-Instruct-AWQ**（text_dim 3584）+ 可选 CLIP 图像 embedding + 可选首帧条件 |
| 生成模式 | **T2V / I2V / TI2V**（example_*.json 核实）|
| 边缘/加速 | **DMD（Distribution Matching Distillation）** 蒸馏变体（kairos_4b_config_DMD.py / kairos_embodied_pipeline_dmd.py）|
| **动作 / 状态 / 策略** | ❌ **代码中完全没有**：无 action token、无本体感受输入、无 policy head。`Head` 仅输出视频 latent。**纯帧生成** |

> "4B" 仅指生成核心 DiT；Qwen2.5-VL-7B 与 Wan VAE 是外挂的**冻结**条件/编解码，**不计入这 4B**。详见下两节。

### 组件关系：4B 只是去噪器，Qwen-VL / Wan VAE 是借来冻结的

标准潜空间视频扩散搭法（与 Stable Diffusion / Flux 同构）。四件里**只有 KairosDiT 是 Kairos 自己训练的**：

```
prompt(+图) → [Qwen2.5-VL-7B 冻结] 编成条件向量
            → [KairosDiT = 4B] 在潜空间按 flow-matching 去噪（受文本条件 + 可选首帧指引）
            → 视频潜变量(16ch) → [Wan2.1 VAE 解码器 冻结] → 输出像素
```

| 部件 | 角色 | 训练 | 计入 4B？ |
|------|------|------|----------|
| Qwen2.5-VL-7B | 文本/多模态**编码器**（"理解"前端）| 冻结借用 | ❌（自身 7B）|
| Wan2.1 VAE | 像素↔16 通道潜空间**编解码器**（DiT 不碰像素）| 冻结借用 | ❌ |
| **KairosDiT** | **去噪器** = 唯一训练的生成核心 | **Kairos 训练** | ✅ **就是这 4B** |
| flow-matching | DiT 的生成数学（目标 + 采样）| — | 内生于 4B |

**含义**：4B"偏小"是因为重活外包了——感知给 Qwen-VL-7B（比本体还大）、像素压缩给 Wan VAE，Kairos 只训那个去噪器。这条"**借 Wan 视频栈 + Qwen 编码器 + flow-matching**"血脉与 [[Bi et al. - Motus A Unified Latent Action World Model|Motus]]（Wan 2.2 + Qwen3-VL）同源，正成为中国具身/视频实验室的事实标配 substrate。

### DMD 蒸馏：步数蒸馏（≠ 尺寸蒸馏），边缘实时的真正开关

**DMD = Distribution Matching Distillation**（Yin et al., MIT/Adobe, CVPR 2024；后续 DMD2）。把"几十步去噪"压成 **1–4 步、参数大小不变**：

- 不模仿老师的逐步轨迹（回归式，累积误差），而让学生**一步输出在分布上与老师高质量输出无法区分**——最小化 KL(学生分布 ‖ 数据分布)
- 该 KL 梯度 = **两 score 之差**：真实 score（冻结老师扩散模型）− 伪 score（在线追踪学生输出的辅助扩散模型），交替更新（GAN 式）；DMD2 再加 GAN loss、去回归项
- 对 Kairos：多步 KairosDiT（老师）→ DMD 蒸馏出少步学生（`kairos-...-distilled` 变体），**同 4B、步数砍到个位数**

⚠️ 与 [[Embodied Brain Models]] methodology 轴的"Distillation 大模型→小模型"是**两种正交蒸馏**：那是**尺寸蒸馏**，DMD 是**步数蒸馏**（同参数、少步数）。Kairos 边缘加速三件套各砍一个乘法因子——**线性注意力压单步算力、DMD 压步数、4B 压参数**，缺一不可。
ℹ️ DMD 的使用由文件名（`kairos_4b_config_DMD.py` / `..._pipeline_dmd.py`）确认；DMD1/DMD2 与具体采样步数未逐行核实。

## PR vs 代码：动作预测能力的落差（verify-don't-assume）

| 来源 | 说法 |
|------|------|
| 发布通稿 | "业界首个原生具身世界模型，单架构统一**多模态理解-生成-预测**""动作预测""real-world closed-loop control""跨本体部署（Agilex PIPER / Unitree G1 / Galaxy G1，免逐本体训练）" |
| **开源代码** | **纯视频生成器，无动作头**。"robot" 变体只是在机器人交互视频上微调的视频 DiT，**生成的是机器人交互视频，不是动作** |

**最可能的真相**（无论文确认，标注为推断）：开源的 Kairos = 机器人域的**视频世界模型 / 神经模拟器**；任何"动作"要么是 PR 把"未来视频预测"包装成"预测"，要么经外挂逆动力学/独立控制器实现而**未开源**。引用时：**Kairos 开源部分只是 WAM 的"世界模型"那一半，缺"动作"那一半**。

## 性能与 benchmark（均为公司自报，未独立复现）

- PAI-Bench-robot **80.03**（自称居首）；WorldModelBench **8.94**；VideoPHY **45.55**；NVIDIA GEAR DreamGen Bench 自称领先（无数字）
- "**72× 快于 NVIDIA Cosmos 2.5**"（A800）；480P 单 A800 **11.7s**、23.5GB；Jetson Thor T5000 上"**1.5× 实时**"、可生成"7 分钟连贯交互视频"
- ⚠️ 全部来自通稿/README，无第三方复现、无论文支撑 → 标注为 vendor-reported

## 定位：在库里的落子

**① Predictive Spatial / 像素级世界模型分支，且挑战了一条库内旧判断。**
[[Embodied Brain Models]] 该分支原表注"像素级世界模型 = 云脑 imagination，**不适合下端**"。Kairos 是对这条判断的**正面冲击**：4B + 25% 线性注意力 + DMD 蒸馏，明确冲边缘实时（Jetson Thor）。判断需软化为"曾被认为只能云上，Kairos 是把像素级世界模型推向端侧的显式尝试，结论待复现"。

**② vs [[NVIDIA - GR00T N1 An Open Foundation Model for Generalist Humanoid Robots|NVIDIA]] Cosmos——直接对标。**
Kairos 把自己定位成"更小（4B）、更快（72×）、能上边缘"的 Cosmos 替代，benchmark 直接打 Cosmos 2.5 + DreamGen Bench（NVIDIA GEAR）。即一个商汤血缘、边缘优先的中国玩家挑战 Cosmos 在"视频世界模型 / 神经模拟器 / 合成数据引擎"上的位置。

**③ vs [[Bi et al. - Motus A Unified Latent Action World Model|Motus]]——共享技术栈，相反取舍。**
两者都用 **Wan 视频 VAE + Qwen-VL 条件 + flow matching**（这套视频生成栈正在成为标配）。但 Motus 是统一 MoT，**模型内含真正的 action expert**（联合注意力，动作集成）→ 真 WAM；Kairos 开源版**砍掉动作只留视频生成**，换来**混合线性注意力 + DMD 的边缘实时**。Motus 重而全、Kairos 轻而快——一个集成动作、一个为部署牺牲动作。

**④ WAM 谱系：它是"世界模型"那一半。**
按 [[World-Action Models]] 的定义（视频 backbone + 动作预测统一），Kairos 开源版**不算 WAM**（无动作头）。它是 Cosmos 式的视频世界模型 substrate；WAM 是在这种 backbone 上嫁接动作头——Kairos 公开的恰恰缺那一半。

## Why It Matters

- **边缘视频世界模型的信号**：若"4B + 线性注意力 + DMD → 边缘实时像素级世界模型"成立，会动摇"世界模型只能当云脑"的默认假设——直接关系到云-端（大脑/小脑）分工。
- **真开源的正面例外**：代码 + 权重齐全（Apache-2.0），区别于库里多数"仅 PR / 仅项目页"的中国具身工作，可复现性高。
- **新玩家 + 血缘信号**：ACE Robotics（王晓刚 / 商汤系）入场具身世界模型，命名 `sensenova` 暴露 SenseTime 技术血缘。
- **方法论样本**：PR 与代码的落差，是"具身宣发 vs 可复现事实"差距的又一典型——录入时严格区分两者。

## Related Concepts

- [[Embodied Brain Models]] — Predictive Spatial / 像素级世界模型分支；边缘部署对旧判断的挑战
- [[World-Action Models]] — Kairos = WAM 的"世界模型"半，缺动作半
- [[Bi et al. - Motus A Unified Latent Action World Model]] — 共享 Wan+Qwen+FM 栈，相反取舍（集成动作 vs 边缘实时）
- [[NVIDIA - GR00T N1 An Open Foundation Model for Generalist Humanoid Robots]] — Cosmos 对标（NVIDIA 的世界模型）
- [[GigaWorld Team - GigaWorld-Policy An Efficient Action-Centered World-Action Model]] — 推理效率/"训繁推简"对照

## Related Entities

- [[ACE Robotics]] — 出品方（王晓刚 / 商汤系）
- [[NVIDIA]] — Cosmos 的提供方，Kairos 的对标对象

## tags

#world-model #video-generation #kairos #ace-robotics #sensetime #predictive-spatial #hybrid-linear-attention #diffusion-transformer #edge-deployment #embodied-ai #china #open-source #no-paper #verify-dont-assume
