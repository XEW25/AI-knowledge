# ACE Robotics

- **Type**: Company / Embodied-AI / World-Model Startup
- **Headquarters**: 上海（China）
- **Founder**: **王晓刚（Wang Xiaogang）—— 商汤科技（SenseTime）联合创始人**（前商汤首席科学家）
- **Focus**: 具身智能的**生成式世界模型**——主打"原生具身、物理一致、边缘实时"
- **Flagship**: **Kairos 3.0-4B**（实时生成式视频世界模型，2026-03 开源）
- **开源身份**: "Kairos Team" / GitHub org `kairos-agi` / HF `kairos-agi`
- **血缘信号**: 仓库与权重命名含 `sensenova`（`kairos-sensenova`）→ 暴露 **SenseTime / 日日新 SenseNova** 技术血缘

## 在具身领域的站位

- **流派**：**Predictive Spatial Models / 像素级世界模型**——做的是 Cosmos 一类的**生成式视频世界模型**，而非 VLA。区别于库里其它中国具身玩家（多做 VLA / 双系统）。
- **差异化卖点**：**边缘实时**。4B + 混合线性注意力（GatedDeltaNet 1-in-4，25% 线性）+ DMD 蒸馏，冲 Jetson Thor 上的实时生成——这是对"像素级世界模型只能当云脑"默认假设的正面挑战。
- **直接对标 NVIDIA Cosmos**：自称"72× 快于 Cosmos 2.5"，benchmark 打 WorldModelBench / VideoPHY / NVIDIA GEAR DreamGen Bench。即一个商汤血缘、边缘优先的中国玩家挑战 Cosmos 在视频世界模型 / 神经模拟器赛道。
- **技术栈**：Wan2.1 视频 VAE + Qwen2.5-VL-7B 文本编码 + flow-matching DiT——与 [[Bi et al. - Motus A Unified Latent Action World Model|Motus]] 同栈，但取舍相反（Motus 集成 action expert，Kairos 开源版只做视频生成）。

> **核实踩坑**（verify-don't-assume）：
> - ⚠️ **无论文 / 无技术报告**（README "Paper" 徽章为空占位；arXiv/通稿/HF 卡均无）——架构事实只能从开源代码核实
> - ❗ **PR vs 代码落差**：通稿称"理解-生成-**预测**统一""动作预测/闭环控制"，但**开源代码是纯视频生成器，无任何动作头**（无 action token / 无本体感受输入 / 无 policy head）。开源出来的只是 WAM 的"世界模型"半
> - ✅ 但**真开源**（代码 + 权重，Apache-2.0）——区别于库里多数"仅项目页"的中国具身工作，是正面例外
> - ℹ️ org 命名链：ACE Robotics（公司）= `kairos-agi`（开源 org）= "Kairos Team"；`sensenova` 命名源于王晓刚的商汤血缘

## 与知识库主题的关联

- [[ACE Robotics - Kairos 3.0 a Real-Time Generative Video World Model]] — Kairos 3.0 代码级架构核实 + 论文核查 + PR/代码落差
- [[Embodied Brain Models]] — Predictive Spatial / 像素级世界模型分支；边缘部署挑战
- [[World-Action Models]] — Kairos = WAM 的"世界模型"半（缺动作半）
- [[NVIDIA]] — Cosmos 提供方，Kairos 的对标对象

## Related

- [[Bi et al. - Motus A Unified Latent Action World Model]] — 同技术栈（Wan+Qwen+FM），相反取舍
- [[DeepCybo]] / [[Galaxea 星海图]] / [[AgiBot 智元]] / [[LimX Dynamics]] — 中国具身同行（多做 VLA，Kairos 走世界模型路线）

## tags

#entity #ace-robotics #sensetime #kairos #world-model #video-generation #predictive-spatial #edge-deployment #embodied-ai #china #open-source
