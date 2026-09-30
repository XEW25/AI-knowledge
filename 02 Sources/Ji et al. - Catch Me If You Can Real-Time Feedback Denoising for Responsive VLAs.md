# Ji et al. - Catch Me If You Can: Real-Time Feedback Denoising for Responsive VLAs

## Metadata

- **Type / method**: source note；VLA-Feedback
- **Authors**: Yiheng Ji, Xingru Zhou, Luis Sentis, Mingyo Seo
- **Version**: arXiv:2609.21022v1，2026-09-17
- **Source**: [arXiv](https://arxiv.org/abs/2609.21022) · [v1 HTML](https://arxiv.org/html/2609.21022v1) · [v1 PDF](https://arxiv.org/pdf/2609.21022v1) · [项目页](https://vla-feedback.github.io/)
- **Raw tier**: URL-only；不下载或 Git 跟踪 PDF
- **Verification status**: HTML 方法、训练附录及表 1/2/3/5 已核对；结果为作者自报，未复现。未独立读取结果图中的数字，不据此补充精确结果
- **Code status（2026-09-30）**: 项目页访问失败，公开实现状态未核实；不能据此认定未开源
- **Ingested**: 2026-09-30，经 Ethan 讨论确认

## Summary

**解决动作块执行期间看见环境变化却来不及改动作的问题。** VLA-Feedback 把慢速规划与快速视觉反馈分开：规划器产生接近完成的动作块，执行每个动作前再用最新图像完成最后一次去噪更新。收录为 [[Embodied Cerebellum Models]] 的块内闭环案例；不是已验证的通用云边部署方案。

## 流程与“差最后一步去噪”

依据：[原文方法与训练附录](https://arxiv.org/html/2609.21022v1)。论文使用 **GR00T**；会话里的“GR200T”应更正为 GR00T。

1. **慢支路规划**：GR00T 的视觉语言骨干与 flow-matching 动作头生成 16 步动作块，但停在最后一次去噪更新之前；缓存接近最终的动作及对应动作特征。
2. **快支路反馈**：每个物理执行步读取最新腕部图像，与缓存的对应动作特征融合，预测最后一次去噪所需的速度。
3. **更新并执行**：只完成当前动作的最后更新，然后发送给机器人；块内后续动作在各自执行前重复此过程，下一块再调用慢规划器。

可用简化式理解：`最终动作 = 近最终动作 + 去噪步长 × 反馈预测的速度`。这里的速度和步长属于生成过程，不是机器人运动速度和控制周期。

**两个时间轴必须分开**：16 步是物理动作序列长度；去噪步数是生成这个动作数组的迭代次数。“差最后一步”不是前 15 个动作已经生成、第 16 个还没有，而是整块停在生成过程的倒数阶段，逐动作用新观测补完。它也不是先生成完全结束的动作，再任意叠加一个独立残差策略。

## 训练与泛化边界

先用演示训练/适配规划器，再冻结规划器，监督训练反馈组件，以动作误差为目标；不是 RL，也不是免训练插件。

**是否每个任务单独训练，原文交代不足。** 论文按任务给出示范预算，但不能从“每任务若干条演示”推出“每任务一个独立反馈模型”，也不能反向宣称所有实验共用一个通用反馈器。需要实现或作者说明来核实 checkpoint 的共享范围。

泛化实验主要改变同类任务中的物体外观、形状或运动速度；不构成陌生技能、跨机器人或任意基座零样本迁移证据。该方法还依赖规划器的中间动作和特征，不能直接视为只拿最终动作即可使用的黑盒 API 修正器。

## 证据与延迟口径

表 1 三项动态仿真任务中，GR00T 成功率为 47.5 / 20 / 15%，VLA-Feedback 为 80 / 75 / 100%；三项等权平均由 **27.5% 到 85%**。这是有限任务上的作者结果；比较其他模型时还需考虑视角、训练配置与执行时域的差异。

表 2 的快速网络推理约 **2 ms**，不等于机器人以 500 Hz 完成视觉闭环。附录表 5 的真机全路径约 **71 ms**，其中相机约 62 ms；实验实际快支路/控制为 **10 Hz**，慢规划器每 16 步运行一次。不能混淆网络计算、传感通信、控制调度与感知变化后的反应延迟。

表 3 的速度外推也显示边界：Drop Ball 在训练速度基础上提高 30% 时反馈方法仍有 57.5%，提高 40% 后仅 5%。**快反馈改善局部跟随，不保证旧计划在大扰动后仍有效。**

## 与库内方法的关系（分析）

| 方法 | 主要回答的问题 | 对照意义 |
|---|---|---|
| RTC | 动作块之间怎样衔接 | 边界连续性 |
| [[Feng et al. - DVAC Denoising-Variance Adaptive Chunking for Flow-Based Robot Policies|DVAC]] | 执行多长前缀后重规划 | 自适应执行时域，免训练 |
| VLA-Feedback | 当前块执行中如何利用新视觉 | 需要训练的块内反馈 |
| [[Hirose et al. - AsyncVLA An Asynchronous VLA for Fast and Robust Navigation on the Edge|Hirose 等的 AsyncVLA]] | 云端慢推理下端侧如何持续导航 | 真实跨网络部署证据；与本文比较是本库分析，不是同名论文引用认定 |

**可迁移判断**：应把“什么时候重新规划”与“重规划之间怎么修正”当成两个设计变量。DVAC 与反馈头可能互补，但组合效果未被本文验证。系统优化还须测量相机与通信，不能只追逐动作头的毫秒数。

## Related

- [[Embodied Cerebellum Models]] — 多速率执行与块内闭环
- [[NVIDIA - GR00T N1 An Open Foundation Model for Generalist Humanoid Robots]] — 基座谱系；本文实现未做代码核实
- [[Real-robot evaluation]] — 网络延迟与全路径延迟的评测口径
- [[Embodied AI - VLAs, world models, and cerebellum]] — 导航入口

## tags

#vla #flow-matching #visual-feedback #action-chunking #dual-system #latency
