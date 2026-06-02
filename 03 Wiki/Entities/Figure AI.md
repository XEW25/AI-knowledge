# Figure AI

- **Type**: Company / Robotics Startup
- **Founded**: 2022
- **Headquarters**: Sunnyvale, CA（US）
- **Founder/CEO**: Brett Adcock（此前创办 Archer Aviation、Vettery）
- **Focus**: 通用人形机器人（全栈自研：硬件 + VLA + 部署）
- **Flagship**: Figure 01 / 02 / 03 人形机器人；**Helix** VLA

## 在具身领域的站位

- **战略**：**完全闭源、全栈整合**——自研机器人本体 + VLA 模型 + 部署。曾与 OpenAI 合作，后转为内部自研模型（Helix）。
- **部署**：Figure 02 在 **BMW Spartanburg 产线运行 11 个月**，参与 30,000+ 辆车（角色窄但真实运营）；Helix 02 转向物流、8 小时连续自主作业。
- **架构特点**：Helix 是**显式双系统（S2+S1）**，系统级接口是**单个连续 latent 向量**（已知最极致压缩的高层→低层接口），且 **S1+S2 都跑在端侧 onboard**——证明"系统级解耦"不等于"云-端拆分"。

## 与知识库主题的关联

- [[Figure AI - Helix a VLA for Generalist Humanoid Control]] — Helix 双系统、单 latent 向量接口、全端侧
- [[Embodied Brain Models]] — 部署导向"路线 2"（显式多系统 + 压缩接口）的代表；系统级接口光谱
- [[Home robot architecture - a hierarchical embodied agent]] — 端侧双系统 + 局部自主的实例参照

## Related

- [[Physical Intelligence (π)]] — 同为美国 VLA 头部，但 PI 偏研究/选择性开源，Figure 偏闭源全栈
- [[NVIDIA]] — 范式 B / 硬件
- [[AgiBot 智元]] / [[Galaxea 星海图]] — 中国人形对标

## tags

#entity #figure #helix #humanoid #vla #dual-system #embodied-ai #closed-source #us
