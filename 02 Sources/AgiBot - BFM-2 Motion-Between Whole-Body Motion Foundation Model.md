# AgiBot - BFM-2 Motion-Between Whole-Body Motion Foundation Model

- **Type**: Source note — ⚠️ **vendor PR-only(无论文、无代码,关键主张不可核实)**
- **Vendor**: 智元 AgiBot,发布 **2026-05-25**("全球首个端到端 Motion-Between BFM-2 运动基座模型")
- **Date ingested**: 2026-06-25
- **Entity**: [[AgiBot 智元]]
- **Sources(URL-only)**: [智元官方](https://www.agibot.com.cn/article/315/detail/161) · [传感器专家网](https://m.sensorexpert.com.cn/article/487750.html) · [IT之家](https://www.ithome.com/0/954/319.htm) · [腾讯新闻](https://news.qq.com/rain/a/20260525A09OPX00)
- **缩写**: "BFM" 官方未展开(对外即"**运动基座模型**" / whole-body motion foundation model);"运动小脑"是其市场定位

---

## ⚠️ 可靠性(置顶)

**PR-only,可核实度本库最低之一。** 官方文章 + 多家技术媒体 + 专门的"论文/arXiv/GitHub/技术报告"检索**均未发现任何论文、技术报告或开源代码**。智元确有开源(Link-U-OS、AimRT、[AgiBot-World 数据集](https://github.com/OpenDriveLab/Agibot-World)),但**不含 BFM-2**。因此本笔记**所有架构与能力描述都是厂商自报(🔎)**,未经任何一手核实——比 [[Qi et al. - Humanoid-GPT (AstraBrain-WBC) Scaling Data and Structure for Zero-Shot Motion Tracking|Humanoid-GPT]](arXiv + CVPR 2026 + Apache-2.0 可跑权重)、[[ACE Robotics - Kairos 3.0 a Real-Time Generative Video World Model|Kairos]](有开源代码)都低。**引用其任何数字/机制前需自行求证。**

## TL;DR

智元的"**运动小脑**"基座:一个**生成式全身运控基座模型**——对机器人**全身动力学状态空间建连续概率分布**,能**从任意当前状态生成一条到任意目标构型的全程运动轨迹**(这就是 "Motion-Between"),据此做抗扰、动态重规划、跌倒后自主起身。它是执行端的**运控小脑**(L2 通用运控基座形态),不含视觉语言、不做任务规划。

## 它是什么(厂商自报 🔎)

- **运控小脑 / WBC motion-FM**:输入"全身动力学状态 + 接触约束 + 高层目标指令",输出全身运动。定位与 [[Qi et al. - Humanoid-GPT (AstraBrain-WBC) Scaling Data and Structure for Zero-Shot Motion Tracking|Humanoid-GPT/AstraBrain-WBC]] 同层(L2),但取向不同(见下)。
- **不是**大脑(无规划/语言/视觉输入)、不是 VLA、不是世界模型。

## 架构(厂商自报 🔎,机制细节未公开)

- **二阶段 Motion-Between 架构** + **端到端 "DOF Feather Motion Generator" 生成式训练机制**。
- 核心思想:**建模全身动力学状态空间的连续概率分布**,从而**"任意当前状态 → 任意随机指令构型"** 动态生成全过程轨迹,而**非调用固定/预设恢复动作**。
- 两阶段(官方未细化):① 自主识别实时动力学状态 + 解析高层任务意图 → ② 生成当前态到目标态的过渡轨迹。
- **未公开**:参数量 / 模型大小、训练数据与方法(RL?仿真?模仿?)、具体生成机制(diffusion / flow-matching / transformer 均未说)。

## 反馈闭环与恢复(对应"小脑自闭环"问题)

- **反馈信号** = 全身动力学状态 + 接触约束 + 高层指令;**生成式重规划**(非播放固定恢复片段)。
- **能力**(自报):从仰躺、趴地、大幅倾斜、悬空偏移等**极端姿态**,以及外力踹击、遥操干扰、指令持续跳变中**恢复平衡 / 连续插值起身**。
- **分层定位**(见 [[Embodied Cerebellum Models]] 的闭环分层判断):属 **L1 控制闭环 + 自主运动恢复**;**未见** efference copy / 前向模型(L2)、任务级失败判断(L3)、自我改进(L4)。即"**控制/运动层的自闭环**",非认知层。

## 在本库的定位

- **两轴演进图 L2(小脑=通用运控基座)的厂商案例**:见 [[Embodied Brain Models#功能演进趋势:统一模型轴 vs 大小脑分层轴(跨公司)]];与 Humanoid-GPT、[[Guo et al. - NeuroVLA Brain-inspired Neuromorphic Cortex-Cerebellum-Spinal VLA|NeuroVLA]] 并列,**但可核实度最低(标 ~)**。
- [[Embodied Cerebellum Models]] "通用运控基座(GPT-style WBC FM)"新形态的**第二个实例**(首例 Humanoid-GPT 有论文,本例仅 PR)。

## 谱系(智元启元大模型线)

- **大脑/ViLLA 侧**:[[AgiBot - GO-1 ViLLA Generalist Embodied Foundation Model|GO-1]] → GO-2(Action-CoT + OpenClaw 记忆,2026)。
- **运动小脑侧**:BFM → **BFM-2**(本笔记)→ 官方预告 **BFM-3**(将融合视觉/触觉/语音/空间语义/环境拓扑等多模态)。
- 注:图中并列的 **GCFM** 未单独核实,本笔记不展开。

`★ Insight ─────────────────────────────────────`
- **BFM-2 与 Humanoid-GPT 是 L2 同位的两种取向**:Humanoid-GPT = **追踪器**(给一段参考动作→忠实复现,零样本泛化到未见动作);BFM-2 = **生成器**(给"目标构型"→自己生成从当前态到目标的全程轨迹,强调任意态恢复/重规划)。一个"跟得准",一个"自己想出怎么动到那儿"——后者的闭环更靠近"自主恢复",但也更难验证。
- **它也是"可核实度"光谱的反例锚点**:同为"通用小脑基座"的对外宣传,Humanoid-GPT 能一路扒到 arXiv+CVPR+ONNX 权重,BFM-2 连技术报告都没有。**记住这对照——下次见"全球首个 XX 基座"先问"论文/代码在哪",差距立现。**
`─────────────────────────────────────────────────`

## Related

- [[AgiBot 智元]] — 厂商实体(GO 大脑线 + BFM 运动小脑线)
- [[Qi et al. - Humanoid-GPT (AstraBrain-WBC) Scaling Data and Structure for Zero-Shot Motion Tracking]] — L2 同位、可核实的对照(追踪器 vs 生成器)
- [[Embodied Cerebellum Models]] — 通用运控基座形态;小脑闭环分层
- [[Embodied Brain Models]] — 两轴演进图 L2
- [[Guo et al. - NeuroVLA Brain-inspired Neuromorphic Cortex-Cerebellum-Spinal VLA]] — L2 邻位,且有 L2 级前向模型闭环(对照 BFM-2 的 L1 闭环)

## tags

#source #embodied-ai #cerebellum-model #whole-body-control #humanoid #generative-motion #agibot #vendor-reported #no-paper
