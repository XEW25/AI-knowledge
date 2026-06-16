# AI2 Robotics

- **Type**: Company / Embodied-AI Startup
- **Headquarters**: 深圳（China）
- **Associated**: 郭彦东（Yandong Guo，知名 CV/AI 研究者；NeuroVLA 作者之一，同时挂 HKUST-GZ）
- **学术合作**: 香港科技大学（广州）AI Thrust（熊辉 Hui Xiong 组）
- **Focus**: **脑启发 / 神经形态**具身智能——把生物神经系统的分层与脉冲计算搬进机器人控制
- **Flagship**: **NeuroVLA**（神经形态 cortex/cerebellum/spinal VLA，2026-01）
- ⚠️ 公司融资/规模/更多产品线 待补充（本页据 NeuroVLA 论文建立）

## 在具身领域的站位

- **差异化**：在主流"堆数据/堆参数"的 VLA 之外，押**生物启发 + 神经形态/SNN** 这条小众但能效极高的路线。
- **代表工作 NeuroVLA**：三层脑启发架构——皮层（Qwen-VL 规划）+ 小脑（GRU+FiLM 高频稳定）+ 脊髓（神经形态 FPGA 上的 SNN 执行），<20ms 安全反射、脊髓 0.4W。自称"首个在真实机器人上部署的神经形态 VLA"。
- **与本库框架的关系**：NeuroVLA 的三层功能分解独立印证了 [[Embodied Cerebellum Models]] 的"皮层/小脑/脊髓"框架，并引入了 [[VLA quantization]] 之外的**神经形态边缘能效路线**。⚠️ 其 cortex/cerebellum/spinal 是生物结构+算力轴、三层全在端侧，**≠ 本库部署轴的大脑（云）/小脑（端）**。

## 与知识库主题的关联

- [[Guo et al. - NeuroVLA Brain-inspired Neuromorphic Cortex-Cerebellum-Spinal VLA]] — NeuroVLA 架构核实 + 框架落子
- [[Embodied Cerebellum Models]] — 三层框架印证；学习 SNN 反射层；神经形态路线
- [[VLA quantization]] — 平行的边缘能效路线（低比特 vs 神经形态/SNN）
- [[Memory in Embodied AI]] — SNN 膜电位做隐式时序记忆

## Related

- [[Figure AI]] — 同为多系统、含高频执行头
- [[DeepCybo]] / [[Galaxea 星海图]] / [[AgiBot 智元]] / [[ACE Robotics]] / [[LimX Dynamics]] — 中国具身同行
- [[Physical Intelligence (π)]] — 主流 VLA 对照

## tags

#entity #ai2-robotics #neuromorphic #snn #brain-inspired #embodied-ai #china #hkust-gz #open-source
