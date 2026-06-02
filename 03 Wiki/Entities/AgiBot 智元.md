# AgiBot 智元（智元机器人 / Zhiyuan Robotics）

- **Type**: Company / Robotics Startup
- **Founded**: 2023（2 月）
- **Headquarters**: 上海（China）
- **Founders**: 邓泰华（Deng Taihua，前华为）+ 彭志辉（Peng Zhihui，"稚晖君"，前华为"天才少年"）
- **Focus**: 人形机器人（工业 + 服务）+ 具身基础模型 + 大规模数据集
- **Flagship**: GO-1（Genie Operator-1, ViLLA）；AgiBot World 数据集；AgiBot A2 人形
- **里程碑**: 2024-12 量产；估值 2025 年中超 $1B；2 年内 8+ 轮融资；A2 创吉尼斯纪录（行走 106 km）

## 在具身领域的站位

- **战略**：全栈（本体 + 模型 + 数据）+ **开源**（AgiBot World 100 万+ 轨迹、217 任务；GO-1 2025-09 开源），是中国"数据规模派"的代表。
- **架构创新**：GO-1 提出 **ViLLA（Vision-Language-Latent-Action）**——三段式 hierarchy，用 **VQ-VAE latent action token** 作系统接口，使模型能**从无标注 web 视频学动作表征**（绕开真机动作标签稀缺）。VLM↔Latent Planner 内部是**范式 A**（逐层 joint）。

## 与知识库主题的关联

- [[AgiBot - GO-1 ViLLA Generalist Embodied Foundation Model]] — GO-1 / ViLLA / latent action 详解
- [[Embodied Brain Models]] — latent action token 系统接口；范式 A 内部耦合；"从视频学动作"synthesis 候选
- [[Home robot architecture - a hierarchical embodied agent]] — latent action 是家庭"廉价监督学技能"的关键路径

## Related

- [[Galaxea 星海图]] / [[LimX Dynamics]] / [[DeepCybo]] — 中国具身同行
- [[NVIDIA]] — GR00T 等开源 VLA 对标
- [[Physical Intelligence (π)]] — 范式 A 对照

## tags

#entity #agibot #zhiyuan #villa #latent-action #humanoid #vla #embodied-ai #china #open-source
